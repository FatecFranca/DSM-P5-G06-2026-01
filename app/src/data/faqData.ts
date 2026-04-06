import { FAQCategory } from '../types';

export const FAQ_DATA: FAQCategory[] = [
  {
    id: '1',
    title: 'O que é Diabetes?',
    color: '#4CAF82',
    icon: 'info',
    items: [
      {
        id: '1-1',
        question: 'O que é diabetes mellitus?',
        category: 'O que é Diabetes?',
        answer: 'Diabetes mellitus é uma doença crônica caracterizada pelo aumento dos níveis de glicose (açúcar) no sangue. Isso ocorre quando o pâncreas não produz insulina suficiente ou quando o organismo não utiliza eficientemente a insulina que produz. A insulina é um hormônio fundamental para que a glicose entre nas células e seja usada como energia.',
      },
      {
        id: '1-2',
        question: 'Quais são os tipos de diabetes?',
        category: 'O que é Diabetes?',
        answer: 'Existem principalmente 3 tipos:\n\n• Tipo 1: Doença autoimune onde o pâncreas produz pouca ou nenhuma insulina. Mais comum em crianças e jovens.\n\n• Tipo 2: O organismo não usa a insulina eficientemente. É o tipo mais comum, afetando 90% dos casos.\n\n• Diabetes Gestacional: Ocorre durante a gravidez e geralmente desaparece após o parto.\n\nTambém existe o pré-diabetes, quando os níveis estão elevados mas ainda não configuram diabetes.',
      },
      {
        id: '1-3',
        question: 'Diabetes tem cura?',
        category: 'O que é Diabetes?',
        answer: 'Atualmente, o diabetes tipo 1 não tem cura, mas pode ser controlado com insulina e mudanças no estilo de vida. O tipo 2 pode em alguns casos entrar em remissão com perda de peso significativa, alimentação saudável e exercícios. O gestacional geralmente some após o parto, mas aumenta o risco de desenvolver tipo 2 no futuro.',
      },
    ],
  },
  {
    id: '2',
    title: 'Sintomas',
    color: '#3B8ED0',
    icon: 'activity',
    items: [
      {
        id: '2-1',
        question: 'Quais são os sintomas do diabetes?',
        category: 'Sintomas',
        answer: 'Os sintomas mais comuns incluem:\n\n• Sede excessiva (polidipsia)\n• Urinar frequentemente (poliúria)\n• Fome excessiva\n• Cansaço e fadiga\n• Visão embaçada\n• Feridas que demoram a cicatrizar\n• Formigamento nas extremidades\n• Perda de peso inexplicável (mais no tipo 1)\n\nAtenção: O tipo 2 pode ser assintomático por anos!',
      },
      {
        id: '2-2',
        question: 'O que é hipoglicemia?',
        category: 'Sintomas',
        answer: 'Hipoglicemia é quando a glicose fica abaixo de 70 mg/dL. Sintomas: tremores, suor frio, tontura, confusão mental, batimento cardíaco acelerado. Tratamento imediato: 15g de carboidrato rápido (suco, mel, balas). Se não melhorar em 15 minutos, repita. Em casos graves, ligue para emergência.',
      },
      {
        id: '2-3',
        question: 'O que é hiperglicemia?',
        category: 'Sintomas',
        answer: 'Hiperglicemia é quando a glicose está muito alta (geralmente acima de 180 mg/dL). Sintomas: sede intensa, urina frequente, visão turva, cansaço, dor de cabeça. Se a glicose estiver acima de 300 mg/dL ou houver cetonas na urina, procure atendimento médico urgente.',
      },
    ],
  },
  {
    id: '3',
    title: 'Alimentação',
    color: '#F97316',
    icon: 'utensils',
    items: [
      {
        id: '3-1',
        question: 'Diabético pode comer doce?',
        category: 'Alimentação',
        answer: 'Sim, com moderação e planejamento. O segredo é controlar a quantidade e combiná-los com fibras e proteínas para diminuir o impacto glicêmico. Prefira adoçantes naturais como estévia. Doces podem ser consumidos eventualmente, mas não devem ser parte da dieta diária.',
      },
      {
        id: '3-2',
        question: 'Quais alimentos devo evitar?',
        category: 'Alimentação',
        answer: 'Evite ou reduza:\n\n• Açúcar e doces em geral\n• Bebidas açucaradas (refrigerantes, sucos industrializados)\n• Pão branco, arroz branco em excesso\n• Batata frita e frituras\n• Alimentos ultra-processados\n• Álcool em excesso\n\nPrefira alimentos integrais, vegetais, proteínas magras e gorduras saudáveis.',
      },
      {
        id: '3-3',
        question: 'O que é índice glicêmico?',
        category: 'Alimentação',
        answer: 'O índice glicêmico (IG) mede a velocidade com que um alimento eleva a glicose. IG baixo (<55): aveia, lentilha, maçã. IG médio (55-70): arroz integral, batata-doce. IG alto (>70): pão branco, arroz branco, melancia. Prefira alimentos de baixo IG e combine com proteínas e fibras.',
      },
    ],
  },
  {
    id: '4',
    title: 'Exercícios',
    color: '#8B5CF6',
    icon: 'zap',
    items: [
      {
        id: '4-1',
        question: 'Exercício é bom para o diabetes?',
        category: 'Exercícios',
        answer: 'Sim! O exercício físico é um dos melhores remédios para o diabetes. Benefícios: melhora a sensibilidade à insulina, reduz a glicose, ajuda no peso, melhora o coração. Recomendação: pelo menos 150 minutos de atividade moderada por semana, combinando aeróbico e musculação.',
      },
      {
        id: '4-2',
        question: 'Cuidados com exercício e diabetes',
        category: 'Exercícios',
        answer: 'Precauções importantes:\n\n• Meça a glicose antes, durante (exercícios longos) e após\n• Evite exercitar com glicose >250 mg/dL\n• Tenha carboidrato de rápida absorção disponível\n• Hidrate-se bem\n• Comece devagar\n• Informe seu médico antes de iniciar programa\n• Ajuste insulina e alimentação conforme orientação médica',
      },
    ],
  },
  {
    id: '5',
    title: 'Medicação e Tratamento',
    color: '#EC4899',
    icon: 'pill',
    items: [
      {
        id: '5-1',
        question: 'Quais são os medicamentos para diabetes tipo 2?',
        category: 'Medicação e Tratamento',
        answer: 'As principais classes incluem:\n\n• Metformina: primeira escolha, reduz produção de glicose no fígado\n• Sulfonilureias (ex: glibenclamida): estimulam a produção de insulina\n• Inibidores SGLT2 (ex: empagliflozina): eliminam glicose pela urina\n• Agonistas GLP-1 (ex: semaglutida): reduzem apetite e glicose\n• Insulina: quando outros não são suficientes\n\nSempre siga a orientação do seu médico.',
      },
      {
        id: '5-2',
        question: 'Como aplicar insulina corretamente?',
        category: 'Medicação e Tratamento',
        answer: 'Passos para aplicação segura:\n\n1. Lave as mãos\n2. Prepare a insulina (misture se necessário, sem agitar)\n3. Escolha o local (abdômen, coxa, glúteo, braço)\n4. Faça rodízio dos locais\n5. Limpe com álcool e deixe secar\n6. Faça prega subcutânea\n7. Injete lentamente\n8. Aguarde 10 segundos antes de retirar',
      },
    ],
  },
  {
    id: '6',
    title: 'Monitoramento',
    color: '#14B8A6',
    icon: 'bar-chart',
    items: [
      {
        id: '6-1',
        question: 'Com que frequência devo medir a glicose?',
        category: 'Monitoramento',
        answer: 'Depende do tipo e do tratamento. Geralmente:\n\n• Tipo 1: 4-8x ao dia\n• Tipo 2 com insulina: 2-4x ao dia\n• Tipo 2 sem insulina: conforme orientação médica\n\nMomentos-chave: em jejum, antes e 2h após refeições, ao dormir. Em situações especiais: exercício, mal-estar, ajuste de medicação.',
      },
      {
        id: '6-2',
        question: 'O que é HbA1c?',
        category: 'Monitoramento',
        answer: 'A hemoglobina glicada (HbA1c) reflete a média da glicose nos últimos 2-3 meses. É o principal exame de controle do diabetes.\n\nMetas gerais:\n• Normal: <5.7%\n• Pré-diabetes: 5.7-6.4%\n• Diabetes bem controlado: <7%\n• Diabetes controlado: 7-8%\n\nFaça este exame a cada 3 meses.',
      },
    ],
  },
];
