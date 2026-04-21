// ─── HTML API Reference Page ──────────────────────────────────────────────────

export function generateApiDocs(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DiabetesCare — API Reference</title>
<style>
:root{--bg:#F8FAFC;--surf:#FFFFFF;--surf2:#F1F5F9;--surf3:#E2E8F0;--bord:#E2E8F0;--bord2:#EDF2F7;--txt:#1A202C;--txt2:#4A5568;--txt3:#718096;--brand:#4CAF82;--brand-d:rgba(76,175,130,.1);--brand-b:rgba(76,175,130,.25);--blue:#3182CE;--blue-d:rgba(49,130,206,.1);--green:#38A169;--green-d:rgba(56,161,105,.1);--amber:#C05621;--amber-d:rgba(192,86,33,.08);--red:#E53E3E;--red-d:rgba(229,62,62,.1);--purple:#805AD5;--purple-d:rgba(128,90,213,.1);--r:8px;--sw:260px}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:var(--bg);color:var(--txt);line-height:1.6;font-size:14px}
a{color:var(--blue);text-decoration:none}
a:hover{text-decoration:underline}

/* Layout */
.wrap{display:flex;min-height:100vh}
.sidebar{width:var(--sw);background:var(--surf);border-right:1px solid var(--bord);position:sticky;top:0;height:100vh;overflow-y:auto;flex-shrink:0;display:flex;flex-direction:column}
.sidebar::-webkit-scrollbar{width:4px}
.sidebar::-webkit-scrollbar-track{background:transparent}
.sidebar::-webkit-scrollbar-thumb{background:var(--bord);border-radius:4px}
.main{flex:1;min-width:0;overflow-x:hidden}

/* Sidebar header */
.sb-head{padding:16px 14px 12px;border-bottom:1px solid var(--bord);flex-shrink:0}
.sb-logo{display:flex;align-items:center;gap:9px;margin-bottom:10px}
.sb-logo-icon{width:30px;height:30px;background:linear-gradient(135deg,#4CAF82,#2E9E6B);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.sb-logo-name{font-size:14px;font-weight:700;color:var(--txt)}
.sb-logo-ver{font-size:10px;color:var(--txt3);margin-top:1px}
.sb-search{position:relative}
.sb-search input{width:100%;background:var(--surf2);border:1px solid var(--bord);color:var(--txt);padding:6px 10px 6px 28px;border-radius:var(--r);font-size:12px;outline:none;transition:border-color .15s}
.sb-search input:focus{border-color:var(--brand)}
.sb-search input::placeholder{color:var(--txt3)}
.sb-search-ico{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--txt3);font-size:12px;pointer-events:none}

/* Sidebar nav */
.sb-nav{flex:1;overflow-y:auto;padding:8px 0}
.sb-group{margin-bottom:4px}
.sb-group-label{padding:8px 14px 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt3)}
.sb-item{display:flex;align-items:center;gap:8px;padding:5px 10px 5px 14px;color:var(--txt2);font-size:12.5px;cursor:pointer;border-radius:0;transition:all .12s;text-decoration:none;border-left:2px solid transparent;margin:0 4px 1px}
.sb-item:hover{background:var(--surf2);color:var(--txt);text-decoration:none}
.sb-item.active{background:var(--brand-d);color:var(--brand);border-left-color:var(--brand);font-weight:600}
.sb-item-ico{font-size:14px;width:16px;text-align:center;flex-shrink:0}
.sb-item-cnt{margin-left:auto;background:var(--surf3);color:var(--txt3);padding:1px 6px;border-radius:10px;font-size:10px;font-weight:600}
.sb-footer{padding:10px 14px;border-top:1px solid var(--bord);font-size:11px;color:var(--txt3)}
.sb-footer a{color:var(--txt3)}
.sb-footer a:hover{color:var(--brand)}

/* Top bar */
.topbar{background:var(--surf);border-bottom:1px solid var(--bord);padding:10px 32px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;gap:12px}
.tb-title{font-size:13px;color:var(--txt2);display:flex;align-items:center;gap:8px}
.tb-title code{font-family:monospace;background:var(--surf2);border:1px solid var(--bord);padding:2px 8px;border-radius:5px;font-size:12px;color:var(--brand)}
.tb-pills{display:flex;gap:6px;align-items:center}
.pill{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
.pill-green{background:var(--green-d);color:var(--green);border:1px solid rgba(63,185,80,.25)}
.pill-blue{background:var(--blue-d);color:var(--blue);border:1px solid rgba(88,166,255,.25)}
.pill-amber{background:var(--amber-d);color:var(--amber);border:1px solid rgba(227,179,65,.25)}
.pulse{display:inline-block;width:7px;height:7px;background:var(--green);border-radius:50%;animation:pulse 2s infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}

/* Sections */
.section{padding:36px 32px;border-bottom:1px solid var(--bord2)}
.section:last-child{border-bottom:none}
.sec-head{margin-bottom:24px}
.sec-icon{font-size:22px;flex-shrink:0}
.sec-title{font-size:18px;font-weight:700;color:var(--txt);display:flex;align-items:center;gap:10px;margin-bottom:5px}
.sec-desc{color:var(--txt2);font-size:13px;line-height:1.7}
.sec-hr{border:none;border-top:1px solid var(--bord);margin:20px 0}

/* Overview cards */
.ov-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:28px}
.ov-card{background:var(--surf);border:1px solid var(--bord);border-radius:var(--r);padding:14px 16px}
.ov-card-n{font-size:26px;font-weight:700;color:var(--brand);line-height:1}
.ov-card-l{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--txt3);margin-top:4px}
.ov-card-s{font-size:12px;color:var(--txt2);margin-top:2px}

/* Base URL box */
.base-url{background:var(--surf2);border:1px solid var(--bord);border-radius:var(--r);padding:11px 14px;font-family:monospace;font-size:13px;color:var(--brand);margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.base-url span{flex:1;word-break:break-all}

/* Endpoint */
.ep{background:var(--surf);border:1px solid var(--bord);border-radius:var(--r);margin-bottom:10px;overflow:hidden;transition:border-color .15s}
.ep:hover{border-color:var(--txt3)}
.ep.open{border-color:var(--bord)}
.ep-head{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;user-select:none;gap:10px}
.ep-head:hover{background:var(--surf2)}
.ep.open .ep-head{background:var(--surf2)}
.meth{padding:3px 9px;border-radius:5px;font-size:10px;font-weight:800;letter-spacing:.06em;font-family:monospace;min-width:58px;text-align:center}
.GET{background:var(--blue-d);color:var(--blue)}
.POST{background:var(--green-d);color:var(--green)}
.PUT{background:var(--amber-d);color:var(--amber)}
.DELETE{background:var(--red-d);color:var(--red)}
.ep-path{font-family:monospace;font-size:13px;color:var(--txt);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ep-path .seg{color:var(--amber)}
.ep-label{font-size:12px;color:var(--txt2);white-space:nowrap}
.badge{padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;white-space:nowrap}
.badge-auth{background:var(--red-d);color:var(--red);border:1px solid rgba(248,81,73,.2)}
.badge-admin{background:var(--purple-d);color:var(--purple);border:1px solid rgba(188,140,255,.2)}
.badge-pub{background:var(--green-d);color:var(--green);border:1px solid rgba(63,185,80,.2)}
.chev{color:var(--txt3);font-size:10px;transition:transform .2s;flex-shrink:0}
.ep.open .chev{transform:rotate(90deg)}

/* Endpoint body */
.ep-body{padding:16px;border-top:1px solid var(--bord);display:none}
.ep.open .ep-body{display:block}
.ep-desc{color:var(--txt2);font-size:13px;margin-bottom:14px;line-height:1.7}

/* Tabs */
.tabs{display:flex;gap:2px;margin-bottom:14px;border-bottom:1px solid var(--bord)}
.tab{padding:5px 12px;font-size:12px;color:var(--txt3);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .15s;border-radius:4px 4px 0 0;user-select:none}
.tab:hover{color:var(--txt2);background:var(--surf2)}
.tab.on{color:var(--brand);border-bottom-color:var(--brand);font-weight:600}
.tc{display:none}
.tc.on{display:block}

/* Tables */
.tbl{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:14px}
.tbl th{text-align:left;padding:6px 10px;background:var(--surf2);color:var(--txt3);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--bord)}
.tbl td{padding:7px 10px;border-bottom:1px solid var(--bord2);vertical-align:top}
.tbl tr:last-child td{border-bottom:none}
.tbl .pname{font-family:monospace;color:var(--blue);font-size:12px}
.tbl .ptype{font-family:monospace;color:var(--amber);font-size:11px}
.tbl .pdesc{color:var(--txt2)}
.req{color:var(--red);font-size:10px;margin-left:2px}
.opt{color:var(--txt3);font-size:10px}

/* Code block */
.cb{position:relative;background:#F7FAFC;border:1px solid var(--bord);border-radius:var(--r);margin-bottom:12px;overflow:hidden}
.cb-head{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--surf2);border-bottom:1px solid var(--bord)}
.cb-lang{font-size:10px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.06em}
.cb-copy{background:none;border:1px solid var(--bord);color:var(--txt3);padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer;transition:all .15s;font-family:inherit}
.cb-copy:hover{border-color:var(--brand);color:var(--brand)}
pre{padding:14px;overflow-x:auto;font-size:12px;line-height:1.75}
code{font-family:'SF Mono','Fira Code','Cascadia Code',Consolas,monospace}
.k{color:#C53030}.s{color:#276749}.n{color:#2B6CB0}.b{color:#C05621}.key{color:#2D3748}.cm{color:#718096}.punc{color:#2D3748}.prop{color:#2B6CB0}

/* Info boxes */
.info{border-radius:var(--r);padding:10px 14px;margin-bottom:14px;font-size:12px;display:flex;gap:9px;align-items:flex-start;line-height:1.6}
.info-i{background:var(--blue-d);border:1px solid rgba(88,166,255,.2);color:var(--txt2)}
.info-w{background:var(--amber-d);border:1px solid rgba(227,179,65,.2);color:var(--amber)}
.info-g{background:var(--green-d);border:1px solid rgba(63,185,80,.2);color:var(--brand)}
.info-ico{flex-shrink:0;font-size:13px}

/* Status grid */
.status-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px}
.status-card{background:var(--surf);border:1px solid var(--bord);border-radius:6px;padding:10px 12px;display:flex;gap:10px;align-items:flex-start}
.sc-code{font-family:monospace;font-size:13px;font-weight:700;min-width:32px}
.sc-200,.sc-201{color:var(--green)}
.sc-400{color:var(--amber)}
.sc-401,.sc-403,.sc-500{color:var(--red)}
.sc-404{color:var(--amber)}
.sc-desc{font-size:12px;color:var(--txt2)}

/* Method legend */
.methods{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.mleg{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--txt2)}

/* Responsive */
@media(max-width:768px){:root{--sw:0px}.sidebar{display:none}.topbar{padding:10px 16px}.section{padding:24px 16px}}
</style>
</head>
<body>
<div class="wrap">

<!-- ── Sidebar ──────────────────────────────────────────── -->
<aside class="sidebar">
  <div class="sb-head">
    <div class="sb-logo">
      <div class="sb-logo-icon">🩺</div>
      <div><div class="sb-logo-name">DiabetesCare</div><div class="sb-logo-ver">API Reference v1.0.0</div></div>
    </div>
    <div class="sb-search">
      <span class="sb-search-ico">🔍</span>
      <input id="sb-search" type="text" placeholder="Buscar endpoint..." oninput="filterEndpoints(this.value)">
    </div>
  </div>
  <nav class="sb-nav">
    <div class="sb-group">
      <div class="sb-group-label">Geral</div>
      <a class="sb-item active" href="#overview" data-s="overview" onclick="setActive(this)"><span class="sb-item-ico">🏠</span>Visão Geral</a>
      <a class="sb-item" href="#autenticacao-info" data-s="autenticacao-info" onclick="setActive(this)"><span class="sb-item-ico">🔐</span>Autenticação</a>
      <a class="sb-item" href="#errors" data-s="errors" onclick="setActive(this)"><span class="sb-item-ico">⚡</span>Erros & Status</a>
    </div>
    <div class="sb-group">
      <div class="sb-group-label">Endpoints</div>
      <a class="sb-item" href="#auth" data-s="auth" onclick="setActive(this)"><span class="sb-item-ico">🔑</span>Auth<span class="sb-item-cnt">2</span></a>
      <a class="sb-item" href="#usuarios" data-s="usuarios" onclick="setActive(this)"><span class="sb-item-ico">👤</span>Usuários<span class="sb-item-cnt">2</span></a>
      <a class="sb-item" href="#diario" data-s="diario" onclick="setActive(this)"><span class="sb-item-ico">📓</span>Diário<span class="sb-item-cnt">5</span></a>
      <a class="sb-item" href="#sono" data-s="sono" onclick="setActive(this)"><span class="sb-item-ico">💤</span>Sono<span class="sb-item-cnt">6</span></a>
      <a class="sb-item" href="#glicose" data-s="glicose" onclick="setActive(this)"><span class="sb-item-ico">🩸</span>Glicose<span class="sb-item-cnt">5</span></a>
      <a class="sb-item" href="#hidratacao" data-s="hidratacao" onclick="setActive(this)"><span class="sb-item-ico">💧</span>Hidratação<span class="sb-item-cnt">6</span></a>
      <a class="sb-item" href="#metas" data-s="metas" onclick="setActive(this)"><span class="sb-item-ico">🎯</span>Metas<span class="sb-item-cnt">5</span></a>
      <a class="sb-item" href="#dicas" data-s="dicas" onclick="setActive(this)"><span class="sb-item-ico">💡</span>Dicas<span class="sb-item-cnt">5</span></a>
      <a class="sb-item" href="#faq" data-s="faq" onclick="setActive(this)"><span class="sb-item-ico">❓</span>FAQ<span class="sb-item-cnt">5</span></a>
      <a class="sb-item" href="#admin" data-s="admin" onclick="setActive(this)"><span class="sb-item-ico">🛡️</span>Admin<span class="sb-item-cnt">5</span></a>
      <a class="sb-item" href="#sistema" data-s="sistema" onclick="setActive(this)"><span class="sb-item-ico">🖥️</span>Sistema<span class="sb-item-cnt">1</span></a>
    </div>
  </nav>
  <div class="sb-footer">
    DiabetesCare &copy; ${new Date().getFullYear()} &nbsp;·&nbsp;
    <a href="/docs">Swagger UI</a>
  </div>
</aside>

<!-- ── Main ─────────────────────────────────────────────── -->
<div class="main">

  <!-- Top bar -->
  <div class="topbar">
    <div class="tb-title">
      Base URL <code>${baseUrl}/api</code>
    </div>
    <div class="tb-pills">
      <span class="pulse"></span>
      <span class="pill pill-green">Online</span>
      <span class="pill pill-blue">REST / JSON</span>
      <span class="pill pill-amber">JWT Bearer</span>
    </div>
  </div>

  <!-- ── Overview ────────────────────────────────────────── -->
  <section class="section" id="overview">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">🩺</span>DiabetesCare API</div>
      <p class="sec-desc">API REST para gerenciamento de saúde de pacientes com diabetes. Autenticação via <strong>JWT Bearer Token</strong>. Todas as respostas são em <strong>JSON</strong>. Os dados são retornados dentro da propriedade <code>data</code>.</p>
    </div>
    <div class="ov-grid">
      <div class="ov-card"><div class="ov-card-n">47</div><div class="ov-card-l">Endpoints</div><div class="ov-card-s">9 grupos</div></div>
      <div class="ov-card"><div class="ov-card-n">4</div><div class="ov-card-l">Públicos</div><div class="ov-card-s">Sem autenticação</div></div>
      <div class="ov-card"><div class="ov-card-n">38</div><div class="ov-card-l">Autenticados</div><div class="ov-card-s">JWT requerido</div></div>
      <div class="ov-card"><div class="ov-card-n">5</div><div class="ov-card-l">Admin only</div><div class="ov-card-s">Perfil ADMIN</div></div>
    </div>
    <div class="base-url">
      <span id="base-url-text">${baseUrl}/api</span>
      <button class="cb-copy" onclick="copyText('${baseUrl}/api', this)">Copiar</button>
    </div>
    <div class="methods">
      <span class="mleg"><span class="meth GET">GET</span> Consultar</span>
      <span class="mleg"><span class="meth POST">POST</span> Criar</span>
      <span class="mleg"><span class="meth PUT">PUT</span> Atualizar</span>
      <span class="mleg"><span class="meth DELETE">DELETE</span> Deletar</span>
    </div>
    <div class="info info-i"><span class="info-ico">ℹ️</span><span>Todas as rotas autenticadas requerem o header <code>Authorization: Bearer &lt;token&gt;</code>. O token é obtido via <code>POST /api/auth/login</code>.</span></div>
  </section>

  <!-- ── Auth Info ────────────────────────────────────────── -->
  <section class="section" id="autenticacao-info">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">🔐</span>Autenticação</div>
      <p class="sec-desc">A API usa <strong>JSON Web Tokens (JWT)</strong>. Após o login, inclua o token em todas as requisições protegidas.</p>
    </div>
    <div class="info info-g"><span class="info-ico">✅</span><span>O token expira em <strong>7 dias</strong>. Armazene-o com segurança e renove fazendo um novo login.</span></div>
    ${cb('http', `POST ${baseUrl}/api/auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "senha": "minhasenha123"
}`)}
    <p style="color:var(--txt2);font-size:12px;margin-bottom:10px">Resposta — use o <code>token</code> recebido em todas as próximas requisições:</p>
    ${cb('http', `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)}
  </section>

  <!-- ── Erros ─────────────────────────────────────────────── -->
  <section class="section" id="errors">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">⚡</span>Erros & Códigos de Status</div>
      <p class="sec-desc">A API retorna erros padronizados no formato <code>&#123; "success": false, "message": "..." &#125;</code>.</p>
    </div>
    <div class="status-grid">
      ${sc('200','OK','Requisição bem-sucedida')}
      ${sc('201','Created','Recurso criado com sucesso')}
      ${sc('400','Bad Request','Dados inválidos ou ausentes')}
      ${sc('401','Unauthorized','Token ausente ou inválido')}
      ${sc('403','Forbidden','Sem permissão para este recurso')}
      ${sc('404','Not Found','Recurso não encontrado')}
      ${sc('409','Conflict','Conflito (ex: email já em uso)')}
      ${sc('500','Server Error','Erro interno do servidor')}
    </div>
    <div style="margin-top:16px">
      ${cb('json', `{
  "success": false,
  "message": "Token inválido ou expirado"
}`)}
    </div>
  </section>

  <!-- ── AUTH ──────────────────────────────────────────────── -->
  <section class="section" id="auth">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">🔑</span>Autenticação</div>
      <p class="sec-desc">Registro e login de usuários. Endpoints públicos — não requerem token.</p>
    </div>

    ${ep('POST','/api/auth/registrar','Registrar usuário','pub','Cria uma nova conta de usuário. Retorna um token JWT válido imediatamente.',
      [['nome','string','Nome completo do usuário','req'],['email','string','E-mail único','req'],['senha','string','Senha (mínimo 6 caracteres)','req']],
      `{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}`,
      `{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "usuario": {
      "id": "uuid-aqui",
      "nome": "João Silva",
      "email": "joao@email.com",
      "perfil": "USUARIO",
      "status": "ATIVO"
    }
  }
}`,
      `curl -X POST ${baseUrl}/api/auth/registrar \\
  -H "Content-Type: application/json" \\
  -d '{"nome":"João Silva","email":"joao@email.com","senha":"senha123"}'`
    )}

    ${ep('POST','/api/auth/login','Login','pub','Autentica um usuário existente e retorna o JWT.',
      [['email','string','E-mail cadastrado','req'],['senha','string','Senha do usuário','req']],
      `{
  "email": "joao@email.com",
  "senha": "senha123"
}`,
      `{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "usuario": {
      "id": "uuid-aqui",
      "nome": "João Silva",
      "email": "joao@email.com",
      "perfil": "USUARIO"
    }
  }
}`,
      `curl -X POST ${baseUrl}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"joao@email.com","senha":"senha123"}'`
    )}
  </section>

  <!-- ── USUÁRIOS ───────────────────────────────────────────── -->
  <section class="section" id="usuarios">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">👤</span>Usuários</div>
      <p class="sec-desc">Consulta e atualização do perfil do usuário autenticado.</p>
    </div>

    ${ep('GET','/api/usuarios/:id','Buscar usuário','auth','Retorna os dados de perfil do usuário. Usuários comuns só podem ver o próprio perfil.',
      [['id','string (param)','ID do usuário','req']],
      null,
      `{
  "success": true,
  "data": {
    "id": "uuid-aqui",
    "nome": "João Silva",
    "email": "joao@email.com",
    "perfil": "USUARIO",
    "tipoDiabetes": "TIPO2",
    "idade": 45,
    "peso": 82.5,
    "altura": 175
  }
}`,
      `curl ${baseUrl}/api/usuarios/uuid-aqui \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('PUT','/api/usuarios/:id','Atualizar usuário','auth','Atualiza os dados do perfil. Apenas o próprio usuário pode alterar seus dados.',
      [['id','string (param)','ID do usuário','req'],['nome','string','Nome completo','opt'],['tipoDiabetes','string','NENHUM | TIPO1 | TIPO2 | GESTACIONAL | PRE_DIABETES','opt'],['idade','number','Idade em anos','opt'],['peso','number','Peso em kg','opt'],['altura','number','Altura em cm','opt'],['glicoseAlvoMin','number','Glicose alvo mínima (mg/dL)','opt'],['glicoseAlvoMax','number','Glicose alvo máxima (mg/dL)','opt'],['nomeMedico','string','Nome do médico responsável','opt']],
      `{
  "tipoDiabetes": "TIPO2",
  "peso": 80.0,
  "glicoseAlvoMin": 80,
  "glicoseAlvoMax": 140
}`,
      `{
  "success": true,
  "data": { ...usuárioAtualizado }
}`,
      `curl -X PUT ${baseUrl}/api/usuarios/uuid-aqui \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"peso":80,"glicoseAlvoMin":80,"glicoseAlvoMax":140}'`
    )}
  </section>

  <!-- ── DIÁRIO ─────────────────────────────────────────────── -->
  <section class="section" id="diario">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">📓</span>Diário</div>
      <p class="sec-desc">Entradas de diário pessoal com humor, sintomas e tags. Todos os endpoints exigem autenticação.</p>
    </div>

    ${ep('POST','/api/diarios','Criar entrada','auth','Registra uma nova entrada no diário do usuário.',
      [['titulo','string','Título da entrada','req'],['conteudo','string','Conteúdo da entrada','req'],['humor','string','OTIMO | BOM | OK | MAL | PESSIMO','req'],['sintomas','string[]','Lista de sintomas (ex: ["tontura","fadiga"])','opt'],['tags','string[]','Tags para categorização','opt']],
      `{
  "titulo": "Dia tranquilo",
  "conteudo": "Me senti bem hoje, glicose estável.",
  "humor": "BOM",
  "sintomas": [],
  "tags": ["glicose", "exercício"]
}`,
      `{
  "success": true,
  "data": {
    "id": "uuid-entrada",
    "titulo": "Dia tranquilo",
    "humor": "BOM",
    "criadoEm": "2026-04-20T14:30:00.000Z"
  }
}`,
      `curl -X POST ${baseUrl}/api/diarios \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"titulo":"Dia tranquilo","conteudo":"...","humor":"BOM"}'`
    )}

    ${ep('GET','/api/diarios','Listar entradas','auth','Lista todas as entradas do diário do usuário com paginação.',
      [['pagina','number (query)','Número da página (default: 1)','opt'],['limite','number (query)','Itens por página (default: 20, max: 100)','opt'],['dataInicio','string (query)','Filtrar a partir de (YYYY-MM-DD)','opt'],['dataFim','string (query)','Filtrar até (YYYY-MM-DD)','opt'],['humor','string (query)','Filtrar por humor','opt']],
      null,
      `{
  "success": true,
  "data": {
    "dados": [ ...entradas ],
    "total": 42,
    "pagina": 1,
    "limite": 20,
    "totalPaginas": 3
  }
}`,
      `curl "${baseUrl}/api/diarios?pagina=1&limite=10&humor=BOM" \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('GET','/api/diarios/:id','Buscar entrada','auth','Retorna uma entrada específica do diário.',
      [['id','string (param)','ID da entrada','req']],
      null,
      `{ "success": true, "data": { ...entrada } }`,
      `curl ${baseUrl}/api/diarios/uuid-entrada \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('PUT','/api/diarios/:id','Atualizar entrada','auth','Atualiza os dados de uma entrada do diário.',
      [['titulo','string','Novo título','opt'],['conteudo','string','Novo conteúdo','opt'],['humor','string','Novo humor','opt'],['sintomas','string[]','Novos sintomas','opt'],['tags','string[]','Novas tags','opt']],
      `{ "humor": "OTIMO", "tags": ["bom-dia"] }`,
      `{ "success": true, "data": { ...entradaAtualizada } }`,
      `curl -X PUT ${baseUrl}/api/diarios/uuid-entrada \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"humor":"OTIMO"}'`
    )}

    ${ep('DELETE','/api/diarios/:id','Deletar entrada','auth','Remove uma entrada do diário permanentemente.',
      [['id','string (param)','ID da entrada','req']],
      null,
      `{ "success": true, "message": "Entrada deletada com sucesso" }`,
      `curl -X DELETE ${baseUrl}/api/diarios/uuid-entrada \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}
  </section>

  <!-- ── SONO ───────────────────────────────────────────────── -->
  <section class="section" id="sono">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">💤</span>Sono</div>
      <p class="sec-desc">Registro e análise do histórico de sono do usuário.</p>
    </div>

    ${ep('POST','/api/sono','Registrar sono','auth','Registra um período de sono.',
      [['data','string','Data do registro (YYYY-MM-DD)','req'],['horaDeitar','string','Hora que deitou (HH:MM)','req'],['horaAcordar','string','Hora que acordou (HH:MM)','req'],['duracao','number','Duração em horas (ex: 7.5)','req'],['qualidade','string','PESSIMA | RUIM | BOA | EXCELENTE','req'],['notas','string','Observações opcionais','opt']],
      `{
  "data": "2026-04-20",
  "horaDeitar": "23:00",
  "horaAcordar": "07:00",
  "duracao": 8,
  "qualidade": "BOA",
  "notas": "Acordei bem disposto"
}`,
      `{
  "success": true,
  "data": {
    "id": "uuid-sono",
    "data": "2026-04-20",
    "duracao": 8,
    "qualidade": "BOA"
  }
}`,
      `curl -X POST ${baseUrl}/api/sono \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"data":"2026-04-20","horaDeitar":"23:00","horaAcordar":"07:00","duracao":8,"qualidade":"BOA"}'`
    )}

    ${ep('GET','/api/sono','Listar registros','auth','Lista registros de sono com filtros.',
      [['pagina','number (query)','Página (default: 1)','opt'],['limite','number (query)','Limite (default: 20)','opt'],['dataInicio','string (query)','Data inicial (YYYY-MM-DD)','opt'],['dataFim','string (query)','Data final (YYYY-MM-DD)','opt']],
      null,
      `{ "success": true, "data": { "dados": [...], "total": 15, "pagina": 1, "totalPaginas": 1 } }`,
      `curl "${baseUrl}/api/sono?dataInicio=2026-04-01&dataFim=2026-04-30" \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('GET','/api/sono/estatisticas','Estatísticas de sono','auth','Retorna médias e distribuição da qualidade dos últimos 30 registros.',
      [],
      null,
      `{
  "success": true,
  "data": {
    "mediaDuracao": 7.2,
    "totalRegistros": 28,
    "distribuicaoQualidade": {
      "EXCELENTE": 8,
      "BOA": 12,
      "RUIM": 6,
      "PESSIMA": 2
    }
  }
}`,
      `curl ${baseUrl}/api/sono/estatisticas \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('GET','/api/sono/:id','Buscar registro','auth','Retorna um registro de sono específico.',
      [['id','string (param)','ID do registro','req']],
      null,
      `{ "success": true, "data": { ...registroSono } }`,
      `curl ${baseUrl}/api/sono/uuid-sono \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('PUT','/api/sono/:id','Atualizar registro','auth','Atualiza um registro de sono.',
      [['data','string','Nova data','opt'],['horaDeitar','string','Nova hora de deitar','opt'],['horaAcordar','string','Nova hora de acordar','opt'],['duracao','number','Nova duração','opt'],['qualidade','string','Nova qualidade','opt'],['notas','string','Novas notas','opt']],
      `{ "qualidade": "EXCELENTE", "notas": "Melhor noite da semana" }`,
      `{ "success": true, "data": { ...registroAtualizado } }`,
      `curl -X PUT ${baseUrl}/api/sono/uuid-sono \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"qualidade":"EXCELENTE"}'`
    )}

    ${ep('DELETE','/api/sono/:id','Deletar registro','auth','Remove um registro de sono.',
      [['id','string (param)','ID do registro','req']],
      null,
      `{ "success": true, "message": "Registro de sono deletado com sucesso" }`,
      `curl -X DELETE ${baseUrl}/api/sono/uuid-sono \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}
  </section>

  <!-- ── GLICOSE ────────────────────────────────────────────── -->
  <section class="section" id="glicose">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">🩸</span>Glicose</div>
      <p class="sec-desc">Monitoramento de leituras de glicemia com estatísticas e tendências.</p>
    </div>

    ${ep('POST','/api/glicose','Registrar leitura','auth','Registra uma nova leitura de glicose.',
      [['valor','number','Valor em mg/dL','req'],['contexto','string','JEJUM | PRE_REFEICAO | POS_REFEICAO | ANTES_DORMIR | ALEATORIO','req'],['data','string','Data da leitura (YYYY-MM-DD)','req'],['hora','string','Hora da leitura (HH:MM)','req'],['notas','string','Observações','opt']],
      `{
  "valor": 142,
  "contexto": "POS_REFEICAO",
  "data": "2026-04-20",
  "hora": "13:45"
}`,
      `{
  "success": true,
  "data": {
    "id": "uuid-glicose",
    "valor": 142,
    "contexto": "POS_REFEICAO",
    "status": "ELEVADO"
  }
}`,
      `curl -X POST ${baseUrl}/api/glicose \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"valor":142,"contexto":"POS_REFEICAO","data":"2026-04-20","hora":"13:45"}'`
    )}

    ${ep('GET','/api/glicose','Listar leituras','auth','Lista as leituras de glicose com filtros.',
      [['pagina','number (query)','Página (default: 1)','opt'],['limite','number (query)','Limite (default: 20)','opt'],['dataInicio','string (query)','Data inicial','opt'],['dataFim','string (query)','Data final','opt'],['contexto','string (query)','Filtrar por contexto','opt']],
      null,
      `{ "success": true, "data": { "dados": [...], "total": 120, "pagina": 1, "totalPaginas": 6 } }`,
      `curl "${baseUrl}/api/glicose?limite=7&dataInicio=2026-04-14" \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('GET','/api/glicose/estatisticas','Estatísticas de glicose','auth','Retorna média, mínimo, máximo e distribuição por faixa.',
      [],
      null,
      `{
  "success": true,
  "data": {
    "media": 134.5,
    "minimo": 88,
    "maximo": 198,
    "totalRegistros": 48,
    "distribuicao": {
      "BAIXO": 2,
      "NORMAL": 28,
      "ELEVADO": 14,
      "MUITO_ELEVADO": 4
    }
  }
}`,
      `curl ${baseUrl}/api/glicose/estatisticas \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('GET','/api/glicose/tendencia','Tendência diária','auth','Retorna mínimo, média e máximo agrupados por dia.',
      [],
      null,
      `{
  "success": true,
  "data": [
    { "data": "2026-04-18", "min": 92, "media": 128, "max": 165 },
    { "data": "2026-04-19", "min": 88, "media": 122, "max": 152 },
    { "data": "2026-04-20", "min": 95, "media": 135, "max": 178 }
  ]
}`,
      `curl ${baseUrl}/api/glicose/tendencia \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('DELETE','/api/glicose/:id','Deletar leitura','auth','Remove uma leitura de glicose.',
      [['id','string (param)','ID da leitura','req']],
      null,
      `{ "success": true, "message": "Leitura de glicose deletada" }`,
      `curl -X DELETE ${baseUrl}/api/glicose/uuid-glicose \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}
  </section>

  <!-- ── HIDRATAÇÃO ─────────────────────────────────────────── -->
  <section class="section" id="hidratacao">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">💧</span>Hidratação</div>
      <p class="sec-desc">Controle do consumo de água diário. Meta recomendada: 2500ml/dia.</p>
    </div>

    ${ep('POST','/api/hidratacao','Registrar consumo','auth','Registra um novo consumo de água.',
      [['data','string','Data do registro (YYYY-MM-DD)','req'],['hora','string','Hora do consumo (HH:MM)','req'],['quantidade','number','Quantidade em ml (1–5000)','req']],
      `{
  "data": "2026-04-20",
  "hora": "10:30",
  "quantidade": 300
}`,
      `{
  "success": true,
  "message": "Registro de hidratação criado com sucesso",
  "data": {
    "id": "uuid-hidratacao",
    "data": "2026-04-20",
    "hora": "10:30",
    "quantidade": 300,
    "criadoEm": "2026-04-20T10:30:00.000Z"
  }
}`,
      `curl -X POST ${baseUrl}/api/hidratacao \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"data":"2026-04-20","hora":"10:30","quantidade":300}'`
    )}

    ${ep('GET','/api/hidratacao','Listar registros','auth','Lista registros de hidratação com paginação e filtros de data.',
      [['pagina','number (query)','Página (default: 1)','opt'],['limite','number (query)','Limite (default: 20, max: 100)','opt'],['dataInicio','string (query)','Filtrar a partir de (YYYY-MM-DD)','opt'],['dataFim','string (query)','Filtrar até (YYYY-MM-DD)','opt']],
      null,
      `{
  "success": true,
  "data": {
    "dados": [
      { "id": "uuid", "data": "2026-04-20", "hora": "10:30", "quantidade": 300 }
    ],
    "total": 12,
    "pagina": 1,
    "totalPaginas": 1
  }
}`,
      `curl "${baseUrl}/api/hidratacao?dataInicio=2026-04-20&dataFim=2026-04-20" \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('GET','/api/hidratacao/hoje','Total de hoje','auth','Retorna o total de ml consumidos no dia atual.',
      [],
      null,
      `{
  "success": true,
  "data": {
    "total": 1850,
    "quantidadeRegistros": 6
  }
}`,
      `curl ${baseUrl}/api/hidratacao/hoje \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('GET','/api/hidratacao/:id','Buscar registro','auth','Retorna um registro de hidratação específico.',
      [['id','string (param)','ID do registro','req']],
      null,
      `{ "success": true, "data": { ...registroHidratacao } }`,
      `curl ${baseUrl}/api/hidratacao/uuid-hidratacao \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('PUT','/api/hidratacao/:id','Atualizar registro','auth','Atualiza um registro de hidratação. Pelo menos um campo deve ser enviado.',
      [['data','string','Nova data (YYYY-MM-DD)','opt'],['hora','string','Nova hora (HH:MM)','opt'],['quantidade','number','Nova quantidade em ml','opt']],
      `{ "quantidade": 500 }`,
      `{ "success": true, "message": "Registro atualizado com sucesso", "data": { ...registroAtualizado } }`,
      `curl -X PUT ${baseUrl}/api/hidratacao/uuid-hidratacao \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"quantidade":500}'`
    )}

    ${ep('DELETE','/api/hidratacao/:id','Deletar registro','auth','Remove um registro de hidratação.',
      [['id','string (param)','ID do registro','req']],
      null,
      `{ "success": true, "message": "Registro de hidratação deletado com sucesso" }`,
      `curl -X DELETE ${baseUrl}/api/hidratacao/uuid-hidratacao \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}
  </section>

  <!-- ── METAS ──────────────────────────────────────────────── -->
  <section class="section" id="metas">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">🎯</span>Metas</div>
      <p class="sec-desc">Gerenciamento de metas de saúde personalizadas do usuário.</p>
    </div>

    ${ep('POST','/api/metas','Criar meta','auth','Cria uma nova meta de saúde.',
      [['titulo','string','Título da meta','req'],['descricao','string','Descrição detalhada','opt'],['alvo','number','Valor alvo a atingir','req'],['atual','number','Valor atual (default: 0)','opt'],['unidade','string','Unidade de medida (ex: mg/dL, kg, ml)','req'],['categoria','string','GLICOSE | PESO | EXERCICIO | AGUA | SONO | PASSOS','req'],['prazo','string','Data limite (YYYY-MM-DD)','req'],['cor','string','Cor hex para identificação','opt']],
      `{
  "titulo": "Controlar glicose",
  "descricao": "Manter glicemia abaixo de 140 pós-refeição",
  "alvo": 140,
  "atual": 165,
  "unidade": "mg/dL",
  "categoria": "GLICOSE",
  "prazo": "2026-06-30",
  "cor": "#4CAF82"
}`,
      `{
  "success": true,
  "data": {
    "id": "uuid-meta",
    "titulo": "Controlar glicose",
    "concluida": false,
    "criadoEm": "2026-04-20T10:00:00.000Z"
  }
}`,
      `curl -X POST ${baseUrl}/api/metas \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"titulo":"Controlar glicose","alvo":140,"unidade":"mg/dL","categoria":"GLICOSE","prazo":"2026-06-30"}'`
    )}

    ${ep('GET','/api/metas','Listar metas','auth','Lista as metas do usuário com filtros opcionais.',
      [['pagina','number (query)','Página','opt'],['limite','number (query)','Limite','opt'],['categoria','string (query)','Filtrar por categoria','opt'],['concluida','boolean (query)','Filtrar por conclusão (true/false)','opt']],
      null,
      `{ "success": true, "data": { "dados": [...], "total": 5 } }`,
      `curl "${baseUrl}/api/metas?concluida=false&categoria=GLICOSE" \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('GET','/api/metas/:id','Buscar meta','auth','Retorna uma meta específica.',
      [['id','string (param)','ID da meta','req']],
      null,
      `{ "success": true, "data": { ...meta } }`,
      `curl ${baseUrl}/api/metas/uuid-meta \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('PUT','/api/metas/:id','Atualizar meta','auth','Atualiza uma meta (inclui atualizar progresso e marcar como concluída).',
      [['titulo','string','Novo título','opt'],['atual','number','Progresso atual','opt'],['concluida','boolean','Marcar como concluída','opt'],['prazo','string','Novo prazo','opt']],
      `{ "atual": 138, "concluida": true }`,
      `{ "success": true, "data": { ...metaAtualizada } }`,
      `curl -X PUT ${baseUrl}/api/metas/uuid-meta \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"atual":138,"concluida":true}'`
    )}

    ${ep('DELETE','/api/metas/:id','Deletar meta','auth','Remove uma meta permanentemente.',
      [['id','string (param)','ID da meta','req']],
      null,
      `{ "success": true, "message": "Meta deletada com sucesso" }`,
      `curl -X DELETE ${baseUrl}/api/metas/uuid-meta \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}
  </section>

  <!-- ── DICAS ──────────────────────────────────────────────── -->
  <section class="section" id="dicas">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">💡</span>Dicas & Artigos</div>
      <p class="sec-desc">Conteúdo educativo sobre diabetes e saúde. Criação e edição requerem perfil Admin.</p>
    </div>

    ${ep('GET','/api/dicas','Listar dicas','auth','Lista dicas e artigos com filtros por categoria.',
      [['pagina','number (query)','Página','opt'],['limite','number (query)','Limite','opt'],['categoria','string (query)','EXERCICIO | ALIMENTACAO | EMERGENCIA | BEM_ESTAR','opt'],['destaque','boolean (query)','Apenas destaques','opt']],
      null,
      `{
  "success": true,
  "data": {
    "dados": [
      {
        "id": "uuid-dica",
        "titulo": "Alimentos que controlam o açúcar",
        "sumario": "Saiba quais alimentos ajudam...",
        "categoria": "ALIMENTACAO",
        "tempoLeitura": 5,
        "destaque": true
      }
    ],
    "total": 24
  }
}`,
      `curl "${baseUrl}/api/dicas?categoria=ALIMENTACAO&destaque=true" \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('GET','/api/dicas/:id','Buscar dica','auth','Retorna o conteúdo completo de uma dica.',
      [['id','string (param)','ID da dica','req']],
      null,
      `{ "success": true, "data": { "id": "...", "titulo": "...", "conteudo": "...texto completo...", "categoria": "ALIMENTACAO" } }`,
      `curl ${baseUrl}/api/dicas/uuid-dica \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('POST','/api/dicas','Criar dica','admin','Cria uma nova dica ou artigo. Requer perfil ADMIN.',
      [['titulo','string','Título do artigo','req'],['sumario','string','Resumo curto','req'],['conteudo','string','Conteúdo completo','req'],['categoria','string','EXERCICIO | ALIMENTACAO | EMERGENCIA | BEM_ESTAR','req'],['tempoLeitura','number','Tempo estimado de leitura em minutos','req'],['destaque','boolean','Marcar como destaque','opt']],
      `{
  "titulo": "Como monitorar a glicemia",
  "sumario": "Guia completo para medir...",
  "conteudo": "...texto completo...",
  "categoria": "BEM_ESTAR",
  "tempoLeitura": 7,
  "destaque": false
}`,
      `{ "success": true, "data": { ...dicaCriada } }`,
      `curl -X POST ${baseUrl}/api/dicas \\
  -H "Authorization: Bearer TOKEN_ADMIN" \\
  -H "Content-Type: application/json" \\
  -d '{"titulo":"...","sumario":"...","conteudo":"...","categoria":"BEM_ESTAR","tempoLeitura":7}'`
    )}

    ${ep('PUT','/api/dicas/:id','Atualizar dica','admin','Atualiza uma dica. Requer perfil ADMIN.',
      [['titulo','string','Novo título','opt'],['conteudo','string','Novo conteúdo','opt'],['destaque','boolean','Alterar destaque','opt']],
      `{ "destaque": true }`,
      `{ "success": true, "data": { ...dicaAtualizada } }`,
      `curl -X PUT ${baseUrl}/api/dicas/uuid-dica \\
  -H "Authorization: Bearer TOKEN_ADMIN" \\
  -H "Content-Type: application/json" \\
  -d '{"destaque":true}'`
    )}

    ${ep('DELETE','/api/dicas/:id','Deletar dica','admin','Remove uma dica. Requer perfil ADMIN.',
      [['id','string (param)','ID da dica','req']],
      null,
      `{ "success": true, "message": "Dica deletada com sucesso" }`,
      `curl -X DELETE ${baseUrl}/api/dicas/uuid-dica \\
  -H "Authorization: Bearer TOKEN_ADMIN"`
    )}
  </section>

  <!-- ── FAQ ────────────────────────────────────────────────── -->
  <section class="section" id="faq">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">❓</span>FAQ</div>
      <p class="sec-desc">Perguntas e respostas frequentes sobre diabetes. Categorias: DIABETES, SINTOMAS, ALIMENTACAO, EXERCICIOS, MEDICACAO, MONITORAMENTO.</p>
    </div>

    ${ep('GET','/api/faq','Listar FAQ','auth','Lista perguntas frequentes ativas. Admins podem ver todas (incluindo inativas).',
      [['categoria','string (query)','Filtrar por categoria','opt'],['todos','boolean (query)','Incluir inativos (apenas Admin)','opt']],
      null,
      `{
  "success": true,
  "data": [
    {
      "id": "uuid-faq",
      "pergunta": "O que é diabetes tipo 2?",
      "resposta": "É uma condição crônica...",
      "categoria": "DIABETES",
      "ordem": 1,
      "ativo": true
    }
  ]
}`,
      `curl "${baseUrl}/api/faq?categoria=DIABETES" \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('GET','/api/faq/:id','Buscar FAQ','auth','Retorna uma pergunta específica.',
      [['id','string (param)','ID da pergunta','req']],
      null,
      `{ "success": true, "data": { ...pergunta } }`,
      `curl ${baseUrl}/api/faq/uuid-faq \\
  -H "Authorization: Bearer SEU_TOKEN"`
    )}

    ${ep('POST','/api/faq','Criar FAQ','admin','Cria uma nova pergunta. Requer ADMIN.',
      [['pergunta','string','Texto da pergunta','req'],['resposta','string','Texto da resposta','req'],['categoria','string','Categoria (enum)','req'],['ordem','number','Ordem de exibição','opt'],['ativo','boolean','Visível para usuários (default: true)','opt']],
      `{
  "pergunta": "Posso comer frutas com diabetes?",
  "resposta": "Sim, com moderação...",
  "categoria": "ALIMENTACAO",
  "ordem": 5
}`,
      `{ "success": true, "data": { ...faqCriado } }`,
      `curl -X POST ${baseUrl}/api/faq \\
  -H "Authorization: Bearer TOKEN_ADMIN" \\
  -H "Content-Type: application/json" \\
  -d '{"pergunta":"...","resposta":"...","categoria":"ALIMENTACAO"}'`
    )}

    ${ep('PUT','/api/faq/:id','Atualizar FAQ','admin','Atualiza uma pergunta. Requer ADMIN.',
      [['pergunta','string','Nova pergunta','opt'],['resposta','string','Nova resposta','opt'],['ativo','boolean','Ativar/desativar','opt']],
      `{ "ativo": false }`,
      `{ "success": true, "data": { ...faqAtualizado } }`,
      `curl -X PUT ${baseUrl}/api/faq/uuid-faq \\
  -H "Authorization: Bearer TOKEN_ADMIN" \\
  -H "Content-Type: application/json" \\
  -d '{"ativo":false}'`
    )}

    ${ep('DELETE','/api/faq/:id','Deletar FAQ','admin','Remove uma pergunta. Requer ADMIN.',
      [['id','string (param)','ID da pergunta','req']],
      null,
      `{ "success": true, "message": "FAQ deletada com sucesso" }`,
      `curl -X DELETE ${baseUrl}/api/faq/uuid-faq \\
  -H "Authorization: Bearer TOKEN_ADMIN"`
    )}
  </section>

  <!-- ── ADMIN ──────────────────────────────────────────────── -->
  <section class="section" id="admin">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">🛡️</span>Admin</div>
      <p class="sec-desc">Endpoints exclusivos para administradores. Requerem perfil <code>ADMIN</code> + JWT válido.</p>
    </div>
    <div class="info info-w"><span class="info-ico">⚠️</span><span>Todos os endpoints desta seção retornam dados de <strong>todos os usuários</strong>. Acesso restrito ao perfil ADMIN.</span></div>

    ${ep('GET','/api/admin/usuarios','Listar todos os usuários','admin','Retorna lista paginada de todos os usuários cadastrados.',
      [['pagina','number (query)','Página (default: 1)','opt'],['limite','number (query)','Limite (default: 20)','opt']],
      null,
      `{ "success": true, "data": { "dados": [...usuarios], "total": 156, "pagina": 1, "totalPaginas": 8 } }`,
      `curl "${baseUrl}/api/admin/usuarios?pagina=1&limite=50" \\
  -H "Authorization: Bearer TOKEN_ADMIN"`
    )}

    ${ep('GET','/api/admin/diarios','Listar todos os diários','admin','Retorna todas as entradas de diário de todos os usuários.',
      [['pagina','number (query)','Página','opt'],['limite','number (query)','Limite','opt'],['humor','string (query)','Filtrar por humor','opt']],
      null,
      `{ "success": true, "data": { "dados": [...], "total": 842 } }`,
      `curl "${baseUrl}/api/admin/diarios?humor=MAL" \\
  -H "Authorization: Bearer TOKEN_ADMIN"`
    )}

    ${ep('GET','/api/admin/sono','Listar todos os registros de sono','admin','Retorna todos os registros de sono de todos os usuários.',
      [['pagina','number (query)','Página','opt'],['limite','number (query)','Limite','opt'],['qualidade','string (query)','PESSIMA | RUIM | BOA | EXCELENTE','opt']],
      null,
      `{ "success": true, "data": { "dados": [...], "total": 1204 } }`,
      `curl "${baseUrl}/api/admin/sono?qualidade=PESSIMA" \\
  -H "Authorization: Bearer TOKEN_ADMIN"`
    )}

    ${ep('GET','/api/admin/metas','Listar todas as metas','admin','Retorna todas as metas de todos os usuários.',
      [['pagina','number (query)','Página','opt'],['limite','number (query)','Limite','opt'],['categoria','string (query)','Filtrar por categoria','opt'],['concluida','boolean (query)','Filtrar por conclusão','opt']],
      null,
      `{ "success": true, "data": { "dados": [...], "total": 389 } }`,
      `curl "${baseUrl}/api/admin/metas?categoria=GLICOSE&concluida=false" \\
  -H "Authorization: Bearer TOKEN_ADMIN"`
    )}

    ${ep('GET','/api/admin/hidratacao','Listar todos os registros de hidratação','admin','Retorna todos os registros de hidratação de todos os usuários.',
      [['pagina','number (query)','Página (default: 1)','opt'],['limite','number (query)','Limite (default: 50, max: 200)','opt']],
      null,
      `{
  "success": true,
  "data": {
    "dados": [
      {
        "id": "uuid",
        "data": "2026-04-20",
        "hora": "10:30",
        "quantidade": 300,
        "usuario": { "id": "uuid-user", "nome": "João Silva", "email": "joao@email.com" }
      }
    ],
    "total": 2841
  }
}`,
      `curl "${baseUrl}/api/admin/hidratacao?pagina=1&limite=100" \\
  -H "Authorization: Bearer TOKEN_ADMIN"`
    )}
  </section>

  <!-- ── SISTEMA ────────────────────────────────────────────── -->
  <section class="section" id="sistema">
    <div class="sec-head">
      <div class="sec-title"><span class="sec-icon">🖥️</span>Sistema</div>
      <p class="sec-desc">Endpoints de infraestrutura e verificação de saúde da API.</p>
    </div>

    ${ep('GET','/health','Health check','pub','Verifica se a API está online. Útil para monitoring e load balancers.',
      [],
      null,
      `{
  "success": true,
  "message": "API DiabetesCare funcionando",
  "version": "1.0.0",
  "ambiente": "production",
  "timestamp": "2026-04-20T14:00:00.000Z"
}`,
      `curl ${baseUrl}/health`
    )}
  </section>

</div><!-- /main -->
</div><!-- /wrap -->

<script>
// ── Toggle endpoint open/close
function toggleEp(head) {
  const ep = head.closest('.ep');
  const wasOpen = ep.classList.contains('open');
  ep.classList.toggle('open', !wasOpen);
}

// ── Tab switching
function switchTab(tabEl, id) {
  const group = tabEl.closest('.tg');
  group.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  group.querySelectorAll('.tc').forEach(c => c.classList.remove('on'));
  tabEl.classList.add('on');
  group.querySelector('#' + id).classList.add('on');
}

// ── Copy text
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copiado';
    btn.style.color = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    setTimeout(() => { btn.textContent = orig; btn.style.color = ''; btn.style.borderColor = ''; }, 2000);
  });
}

// ── Copy from code block
function copyBlock(btn) {
  const text = btn.closest('.cb').querySelector('pre').textContent;
  copyText(text, btn);
}

// ── Filter endpoints by search
function filterEndpoints(q) {
  q = q.toLowerCase().trim();
  document.querySelectorAll('.ep').forEach(ep => {
    ep.style.display = (!q || ep.textContent.toLowerCase().includes(q)) ? '' : 'none';
  });
  // Show/hide "no results" per section
  document.querySelectorAll('.section[id]').forEach(sec => {
    if (['overview','autenticacao-info','errors','sistema'].includes(sec.id)) return;
    const visible = [...sec.querySelectorAll('.ep')].some(e => e.style.display !== 'none');
    const noRes = sec.querySelector('.no-results');
    if (noRes) noRes.style.display = visible ? 'none' : 'block';
  });
}

// ── Active sidebar item on scroll
const sectionEls = [...document.querySelectorAll('.section[id]')];
const navItems = [...document.querySelectorAll('.sb-item[data-s]')];

function updateActive() {
  const y = window.scrollY + 120;
  let active = sectionEls[0]?.id ?? '';
  for (const s of sectionEls) {
    if (s.offsetTop <= y) active = s.id; else break;
  }
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.s === active);
  });
}
window.addEventListener('scroll', updateActive, { passive: true });
updateActive();

function setActive(el) {
  navItems.forEach(i => i.classList.remove('active'));
  el.classList.add('active');
}

// ── JSON syntax highlighting
function highlight(pre) {
  let html = pre.textContent
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  html = html
    .replace(/"([^"\\n]+)":/g, '<span class="key">"$1"</span>:')
    .replace(/: "([^"\\n]*)"/g, ': <span class="s">"$1"</span>')
    .replace(/: (true|false)/g, ': <span class="b">$1</span>')
    .replace(/: (null)/g, ': <span class="k">$1</span>')
    .replace(/: (-?\\d+\\.?\\d*)/g, ': <span class="n">$1</span>');
  pre.innerHTML = html;
}

document.querySelectorAll('.cb[data-json] pre').forEach(highlight);
</script>
</body>
</html>`;
}

// ─── Helper: code block ───────────────────────────────────────────────────────
function cb(lang: string, code: string, json = false): string {
  return `<div class="cb"${json ? ' data-json' : ''}>
  <div class="cb-head"><span class="cb-lang">${lang}</span><button class="cb-copy" onclick="copyBlock(this)">Copiar</button></div>
  <pre><code>${code.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>
</div>`;
}

// ─── Helper: status code card ─────────────────────────────────────────────────
function sc(code: string, label: string, desc: string): string {
  return `<div class="status-card">
  <span class="sc-code sc-${code}">${code}</span>
  <div><div style="color:var(--txt);font-size:12px;font-weight:600">${label}</div><div class="sc-desc">${desc}</div></div>
</div>`;
}

// ─── Helper: endpoint card ────────────────────────────────────────────────────
let epId = 0;
function ep(
  method: string,
  path: string,
  title: string,
  auth: 'pub' | 'auth' | 'admin',
  desc: string,
  params: string[][] | null,
  reqBody: string | null,
  resBody: string,
  curlCmd: string,
): string {
  const id = `ep${++epId}`;
  const coloredPath = path.replace(/(:\w+)/g, '<span class="seg">$1</span>');
  const badge =
    auth === 'pub'   ? '<span class="badge badge-pub">Público</span>' :
    auth === 'admin' ? '<span class="badge badge-admin">Admin</span>' :
                       '<span class="badge badge-auth">Auth</span>';

  const hasReq = reqBody !== null;
  const hasPar = params && params.length > 0;

  const reqId  = `${id}r`;
  const resId  = `${id}s`;
  const curlId = `${id}c`;

  const paramsHtml = hasPar ? `
<table class="tbl">
  <thead><tr><th>Parâmetro</th><th>Tipo</th><th>Descrição</th></tr></thead>
  <tbody>${params!.map(([name, type, ddesc, req]) => `
    <tr>
      <td class="pname">${name}${req === 'req' ? '<span class="req">*</span>' : '<span class="opt"> opt</span>'}</td>
      <td class="ptype">${type}</td>
      <td class="pdesc">${ddesc}</td>
    </tr>`).join('')}
  </tbody>
</table>` : '';

  const reqTab = hasReq ? `<div class="tab on" onclick="switchTab(this,'${reqId}')">Request</div>` : '';
  const reqContent = hasReq ? `<div class="tc on" id="${reqId}">${paramsHtml}${cb('json', reqBody!, true)}</div>` : '';

  const firstTabOn = !hasReq ? 'on' : '';
  const firstContentOn = !hasReq ? 'on' : '';

  return `<div class="ep" id="${id}">
  <div class="ep-head" onclick="toggleEp(this)">
    <span class="meth ${method}">${method}</span>
    <span class="ep-path">${coloredPath}</span>
    <span class="ep-label">${title}</span>
    ${badge}
    <span class="chev">▶</span>
  </div>
  <div class="ep-body">
    <p class="ep-desc">${desc}</p>
    <div class="tg">
      <div class="tabs">
        ${reqTab}
        ${!hasReq && hasPar ? `<div class="tab on" onclick="switchTab(this,'${reqId}')">Parâmetros</div>` : ''}
        <div class="tab ${firstTabOn}" onclick="switchTab(this,'${resId}')">Response</div>
        <div class="tab" onclick="switchTab(this,'${curlId}')">cURL</div>
      </div>
      ${reqContent}
      ${!hasReq && hasPar ? `<div class="tc on" id="${reqId}">${paramsHtml}</div>` : ''}
      <div class="tc ${hasReq || hasPar ? '' : 'on'}" id="${resId}">${cb('json', resBody, true)}</div>
      <div class="tc" id="${curlId}">${cb('bash', curlCmd)}</div>
    </div>
  </div>
</div>`;
}
