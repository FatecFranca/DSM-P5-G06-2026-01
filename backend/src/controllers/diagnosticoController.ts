import path from 'path';
import { spawn } from 'child_process';
import { Response, NextFunction } from 'express';
import { diagnosticoModel } from '../models/diagnosticoModel';
import { userModel } from '../models/userModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// ─── Mapeamento: respostas (0-3) → valores clínicos aproximados ───────────────

const MAPA_VALORES: Record<string, number[]> = {
  q1: [0, 1, 2, 5],          // Gestações
  q2: [85, 112, 155, 210],   // Glicose (mg/dL)
  q3: [70, 84, 94, 110],     // Pressão Arterial (mmHg)
  q4: [7, 12, 17, 25],       // Espessura Pele (mm)
  q5: [5, 14, 24, 45],       // Insulina (µU/mL)
  q6: [22, 27, 32, 38],      // IMC
  q7: [0.1, 0.3, 0.5, 0.8], // DiabetesPedigreeFunction
  q8: [24, 37, 52, 65],      // Idade
};

// ─── Nível de risco a partir da pontuação ─────────────────────────────────────

function calcularNivelRisco(pontuacao: number, maxScore: number): string {
  const pct = (pontuacao / maxScore) * 100;
  if (pct < 30) return 'low';
  if (pct < 60) return 'medium';
  return 'high';
}

// ─── Chamada ao script Python ─────────────────────────────────────────────────

function executarPython(respostas: Record<string, number>): Promise<{ predicao: number; probabilidade: number }> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', '..', '..', 'algoritmo-python', 'predicao.py');

    const valoresClinicosOrdenados = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'].map(key => {
      const resposta = respostas[key] ?? 0;
      const mapa = MAPA_VALORES[key];
      return mapa ? mapa[resposta] ?? mapa[0] : 0;
    });

    const input = JSON.stringify({ valores: valoresClinicosOrdenados });

    const proc = spawn('python3', [scriptPath]);
    let stdout = '';
    let stderr = '';

    proc.stdin.write(input);
    proc.stdin.end();

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`Python saiu com código ${code}: ${stderr}`));
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        reject(new Error(`Saída Python inválida: ${stdout}`));
      }
    });

    proc.on('error', err => reject(err));
  });
}

// ─── Controller ───────────────────────────────────────────────────────────────

export const diagnosticoController = {
  /**
   * POST /api/diagnostico
   * Salva as respostas, chama o algoritmo Python e retorna o resultado
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const { respostas } = req.body as { respostas: Record<string, number> };

      const MAX_SCORE = 8 * 3;
      const pontuacao = Object.values(respostas).reduce((s, v) => s + v, 0);
      const percentual = Math.round((pontuacao / MAX_SCORE) * 100);
      const nivelRisco = calcularNivelRisco(pontuacao, MAX_SCORE);

      let predicao = 0;
      let probabilidade = 0;

      try {
        const resultado = await executarPython(respostas);
        predicao = resultado.predicao;
        probabilidade = resultado.probabilidade;
      } catch {
        // fallback: usa percentual como probabilidade aproximada
        predicao = pontuacao >= MAX_SCORE * 0.5 ? 1 : 0;
        probabilidade = percentual / 100;
      }

      const diagnostico = await diagnosticoModel.criar({
        usuarioId,
        respostas,
        pontuacao,
        nivelRisco,
        percentual,
        predicao,
        probabilidade,
      });

      // Marca o diagnóstico como feito para o usuário
      const usuarioAtualizado = await userModel.atualizar(usuarioId, {
        diagnosticoFeito: true as any,
      });

      res.status(201).json({
        success: true,
        message: 'Diagnóstico salvo com sucesso',
        data: { diagnostico, usuario: usuarioAtualizado },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/diagnostico/meu
   * Retorna o diagnóstico mais recente do usuário autenticado
   */
  async meuDiagnostico(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const diagnostico = await diagnosticoModel.buscarDoUsuario(usuarioId);

      res.json({ success: true, data: diagnostico });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/diagnosticos
   * Lista todos os diagnósticos (admin)
   */
  async listarTodos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagina = parseInt(String(req.query.pagina ?? '1'));
      const limite  = parseInt(String(req.query.limite  ?? '50'));
      const dados = await diagnosticoModel.listarTodos(pagina, limite);
      res.json({ success: true, data: dados });
    } catch (error) {
      next(error);
    }
  },
};
