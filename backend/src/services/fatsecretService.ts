// ─── FatSecret OAuth2 + Food Search ───────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env['FATSECRET_CLIENT_ID'];
  const clientSecret = process.env['FATSECRET_CLIENT_SECRET'];

  if (!clientId || !clientSecret) {
    throw new Error('Credenciais FatSecret não configuradas (FATSECRET_CLIENT_ID / FATSECRET_CLIENT_SECRET)');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=basic',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FatSecret token error ${res.status}: ${text}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FatSecretFood {
  food_id: string;
  food_name: string;
  brand_name?: string;
  food_type: string;
  food_url: string;
  food_description: string;
}

interface FatSecretResponse {
  foods?: {
    max_results: string;
    total_results: string;
    page_number: string;
    food?: FatSecretFood | FatSecretFood[];
  };
  error?: { code: number; message: string };
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseFoodDescription(desc: string): {
  calorias: number;
  gorduras: number;
  carboidratos: number;
  proteinas: number;
  porcao: string;
} {
  // "Per 100g - Calories: 22kcal | Fat: 0.34g | Carbs: 3.28g | Protein: 3.09g"
  const porcaoMatch = desc.match(/^Per\s+(.+?)\s+-/);
  const porcao = porcaoMatch ? porcaoMatch[1] : '100g';

  const calMatch   = desc.match(/Calories:\s*([\d.]+)kcal/i);
  const fatMatch   = desc.match(/Fat:\s*([\d.]+)g/i);
  const carbMatch  = desc.match(/Carbs:\s*([\d.]+)g/i);
  const protMatch  = desc.match(/Protein:\s*([\d.]+)g/i);

  return {
    calorias:     calMatch  ? parseFloat(calMatch[1])  : 0,
    gorduras:     fatMatch  ? parseFloat(fatMatch[1])  : 0,
    carboidratos: carbMatch ? parseFloat(carbMatch[1]) : 0,
    proteinas:    protMatch ? parseFloat(protMatch[1]) : 0,
    porcao,
  };
}

function determinaCategoria(calorias: number, carboidratos: number): 'bom' | 'moderado' | 'ruim' {
  if (calorias <= 100 && carboidratos <= 15) return 'bom';
  if (calorias <= 300 && carboidratos <= 45) return 'moderado';
  return 'ruim';
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface AlimentoBuscado {
  id: string;
  nome: string;
  marca?: string;
  calorias: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
  categoria: 'bom' | 'moderado' | 'ruim';
  porcao: string;
  fatsecretId: string;
}

export async function buscarAlimentos(
  query: string,
  pagina = 0,
  maxResults = 20,
): Promise<{ alimentos: AlimentoBuscado[]; total: number }> {
  const token = await getAccessToken();

  const params = new URLSearchParams({
    search_expression: query,
    page_number: String(pagina),
    max_results: String(Math.min(50, maxResults)),
    format: 'json',
  });

  const res = await fetch(
    `https://platform.fatsecret.com/rest/foods/search/v1?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FatSecret search error ${res.status}: ${text}`);
  }

  const data = await res.json() as FatSecretResponse;

  if (data.error) {
    throw new Error(`FatSecret error ${data.error.code}: ${data.error.message}`);
  }

  if (!data.foods?.food) {
    return { alimentos: [], total: 0 };
  }

  const foodArray = Array.isArray(data.foods.food)
    ? data.foods.food
    : [data.foods.food];

  const total = parseInt(data.foods.total_results ?? '0', 10);

  const alimentos: AlimentoBuscado[] = foodArray.map((food) => {
    const macros = parseFoodDescription(food.food_description);
    return {
      id: food.food_id,
      nome: food.food_name,
      marca: food.brand_name,
      ...macros,
      categoria: determinaCategoria(macros.calorias, macros.carboidratos),
      fatsecretId: food.food_id,
    };
  });

  return { alimentos, total };
}
