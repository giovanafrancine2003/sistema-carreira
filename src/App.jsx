import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@supabase/supabase-js";

// ── CONEXÃO SUPABASE ──────────────────────────────────────────────────────────
// Substitua pelos valores do seu projeto em supabase.com/dashboard → Project Settings → API
const SUPABASE_URL = "https://buyopcifbvqytzmkzjss.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZUq9XRvGUjAbFzNQ99N9fQ_0LZp8l9o";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── PERSISTÊNCIA NO SUPABASE ──────────────────────────────────────────────────
// Mesma assinatura do antigo useLocalStorage: [valor, setValor]
// Mas lê/escreve na tabela "dados_usuario" do Supabase, vinculada ao usuário logado.
function useSupabaseStorage(userId, key, initial) {
  const [value, setValue] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  // Carrega o valor salvo quando o componente monta ou troca de usuário/chave
  useEffect(() => {
    let active = true;
    if (!userId) { setValue(initial); setLoaded(true); return; }
    setLoaded(false);
    supabase
      .from("dados_usuario")
      .select("valor")
      .eq("user_id", userId)
      .eq("chave", key)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) { console.error("Erro ao carregar", key, error); }
        setValue(data?.valor ?? initial);
        setLoaded(true);
      });
    return () => { active = false; };
  }, [userId, key]);

  // Salva no Supabase sempre que o valor muda (depois do carregamento inicial)
  useEffect(() => {
    if (!userId || !loaded) return;
    supabase
      .from("dados_usuario")
      .upsert({ user_id: userId, chave: key, valor: value }, { onConflict: "user_id,chave" })
      .then(({ error }) => { if (error) console.error("Erro ao salvar", key, error); });
  }, [value, userId, key, loaded]);

  return [value, setValue];
}

// ── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#080C12", surface: "#0D1520", surfaceHover: "#121D2C", card: "#101828",
  border: "#1A2740", borderLight: "#1E2E48", blue: "#1A56DB", blueLight: "#2563EB",
  blueDim: "#0A1E3D", accent: "#60A5FA", accentDim: "#0C1E35",
  text: "#F0F4FF", textMuted: "#7A90B0", textDim: "#3D5070",
  green: "#2D7A4A", greenLight: "#3AA060", red: "#C0392B", redDim: "#2A0A0A",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:${T.bg};color:${T.text}}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:${T.surface}}
  ::-webkit-scrollbar-thumb{background:${T.blue};border-radius:2px}
  .app{display:flex;height:100vh;overflow:hidden}
  .sidebar{width:265px;min-width:265px;background:${T.surface};border-right:1px solid ${T.border};display:flex;flex-direction:column;overflow-y:auto}
  .main{flex:1;overflow-y:auto;background:${T.bg}}
  .sidebar-logo{padding:22px 20px 14px;border-bottom:1px solid ${T.border}}
  .logo-text{font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${T.accent}}
  .logo-sub{font-size:11px;color:${T.textDim};margin-top:2px;letter-spacing:.06em}
  .sidebar-section{padding:18px 12px 6px}
  .sidebar-label{font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:${T.textDim};padding:0 8px;margin-bottom:6px}
  .sidebar-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;cursor:pointer;transition:all .15s;font-size:13px;color:${T.textMuted};margin-bottom:2px;border:1px solid transparent}
  .sidebar-item:hover{background:${T.surfaceHover};color:${T.text}}
  .sidebar-item.active{background:${T.blueDim};color:${T.text};border-color:${T.blue}33}
  .sidebar-item .icon{width:16px;text-align:center;font-size:13px;flex-shrink:0}
  .sidebar-item .badge{margin-left:auto;background:${T.blue};color:white;font-size:10px;font-weight:600;padding:1px 6px;border-radius:10px}
  .sidebar-item .badge.soft{background:${T.accentDim};color:${T.accent};border:1px solid ${T.accent}44}
  .ph{padding:30px 36px 22px;border-bottom:1px solid ${T.border}}
  .ph-eye{font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:${T.blue};margin-bottom:6px}
  .ph-title{font-size:24px;font-weight:700;color:${T.text};letter-spacing:-.02em}
  .ph-desc{font-size:13px;color:${T.textMuted};margin-top:5px}
  .pc{padding:26px 36px}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
  .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .card{background:${T.card};border:1px solid ${T.border};border-radius:12px;padding:20px}
  .card-t{font-size:13px;font-weight:600;color:${T.text};margin-bottom:4px}
  .card-d{font-size:12px;color:${T.textMuted};line-height:1.55}
  .sc{background:${T.card};border:1px solid ${T.border};border-radius:12px;padding:20px}
  .sc-l{font-size:11px;font-weight:500;color:${T.textMuted};text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}
  .sc-v{font-size:26px;font-weight:700;color:${T.text};letter-spacing:-.03em}
  .sc-s{font-size:12px;color:${T.textDim};margin-top:4px}
  .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;border:none;font-family:'Inter',sans-serif}
  .btn-p{background:${T.blue};color:white}
  .btn-p:hover{background:${T.blueLight}}
  .btn-g{background:transparent;color:${T.textMuted};border:1px solid ${T.border}}
  .btn-g:hover{background:${T.surfaceHover};color:${T.text}}
  .btn-a{background:${T.accentDim};color:${T.accent};border:1px solid ${T.accent}33}
  .btn-a:hover{background:#0E2040}
  .inp{width:100%;background:${T.surface};border:1px solid ${T.border};border-radius:8px;padding:10px 14px;font-size:13px;color:${T.text};font-family:'Inter',sans-serif;outline:none;transition:border .15s}
  .inp:focus{border-color:${T.blue}}
  .inp::placeholder{color:${T.textDim}}
  .ta{width:100%;background:${T.surface};border:1px solid ${T.border};border-radius:8px;padding:12px 14px;font-size:13px;color:${T.text};font-family:'Inter',sans-serif;outline:none;resize:vertical;min-height:90px;transition:border .15s}
  .ta:focus{border-color:${T.blue}}
  .sel{width:100%;background:${T.surface};border:1px solid ${T.border};border-radius:8px;padding:10px 14px;font-size:13px;color:${T.text};font-family:'Inter',sans-serif;outline:none;appearance:none;cursor:pointer}
  .lbl{font-size:11px;font-weight:600;color:${T.textMuted};text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:block}
  .fg{margin-bottom:14px}
  .tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
  .tag-b{background:${T.blueDim};color:#93C5FD;border:1px solid ${T.blue}33}
  .tag-a{background:${T.accentDim};color:${T.accent};border:1px solid ${T.accent}33}
  .tag-g{background:#0D2A18;color:${T.greenLight};border:1px solid ${T.green}44}
  .tag-r{background:${T.redDim};color:#F87171;border:1px solid ${T.red}44}
  .tag-x{background:#1A1A1A;color:${T.textMuted};border:1px solid ${T.border}}
  .tag-y{background:#1A1500;color:#FCD34D;border:1px solid #92400E44}
  .hr{border:none;border-top:1px solid ${T.border};margin:20px 0}
  .ai-box{background:linear-gradient(135deg,${T.blueDim},#060E1A);border:1px solid ${T.blue}44;border-radius:12px;padding:20px}
  .cr{display:flex;align-items:center;gap:14px;padding:13px 16px;background:${T.card};border:1px solid ${T.border};border-radius:10px;margin-bottom:10px;cursor:pointer;transition:all .15s}
  .cr:hover{border-color:${T.blue}55;background:#0E1A2E}
  .ca{width:36px;height:36px;border-radius:8px;background:${T.blueDim};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:${T.accent};flex-shrink:0}
  .cn{font-size:14px;font-weight:600;color:${T.text}}
  .hb{height:4px;border-radius:2px;background:${T.border};overflow:hidden;margin-top:6px}
  .hf{height:100%;border-radius:2px;transition:width .4s}
  .tabs{display:flex;gap:4px;background:${T.surface};border:1px solid ${T.border};border-radius:10px;padding:4px;margin-bottom:22px;flex-wrap:wrap}
  .tab{flex:1;padding:8px;text-align:center;font-size:12px;font-weight:500;border-radius:7px;cursor:pointer;transition:all .15s;color:${T.textMuted};white-space:nowrap}
  .tab.active{background:${T.blue};color:white}
  .st{font-size:15px;font-weight:700;color:${T.text};margin-bottom:14px}
  .mr{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid ${T.border}}
  .mr:last-child{border-bottom:none}
  .loading-dots::after{content:'';animation:dots 1.2s infinite}
  @keyframes dots{0%,20%{content:'.'}40%{content:'..'}60%,100%{content:'...'}}
  .es{text-align:center;padding:60px 20px;color:${T.textDim}}
  .score-ring{display:flex;align-items:center;justify-content:center;width:90px;height:90px;border-radius:50%;font-size:24px;font-weight:700;flex-shrink:0}
`;

// ── HELPERS ───────────────────────────────────────────────────────────────────
const callClaude = async (prompt, system = "") => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
  if (!apiKey) return "⚠️ Chave de API não encontrada. Crie o arquivo .env com VITE_ANTHROPIC_KEY=sua-chave.";
  const body = { model: "claude-sonnet-4-6", max_tokens: 4000, messages: [{ role: "user", content: prompt }] };
  if (system) body.system = system;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "Erro ao gerar resposta.";
};

const today = new Date();
const fmt = (d) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";
const stColor = (s) => ({ "Aplicada": T.textDim, "Triagem": "#FCD34D", "Entrevista": T.accent, "Proposta": T.greenLight, "Encerrada": T.textDim }[s] || T.textDim);

// ── CONTEXTO GLOBAL DO PERFIL ──────────────────────────────────────────────────
// Monta um prefixo de contexto a partir do onboarding, para injetar em qualquer prompt de IA
function buildContextPrefix(contexto) {
  if (!contexto) return "";
  const parts = [];
  if (contexto.area) parts.push(`Área de atuação: ${contexto.area}`);
  if (contexto.senioridade) parts.push(`Nível de senioridade: ${contexto.senioridade}`);
  if (contexto.objetivo) parts.push(`Objetivo principal: ${contexto.objetivo}`);
  if (contexto.contexto) parts.push(`Contexto adicional: ${contexto.contexto}`);
  if (parts.length === 0) return "";
  return `[Contexto da pessoa, considere isso em toda a análise]\n${parts.join("\n")}\n\n`;
}

// ── EXPORTAR PDF ──────────────────────────────────────────────────────────────
function exportToPDF(title, contentHTML) {
  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; padding: 50px 60px; line-height: 1.6; max-width: 720px; margin: 0 auto; }
          h1 { font-size: 22px; border-bottom: 2px solid #1A56DB; padding-bottom: 10px; margin-bottom: 24px; }
          h2 { font-size: 16px; color: #1A56DB; margin-top: 24px; margin-bottom: 8px; }
          h3 { font-size: 14px; color: #333; margin-top: 16px; margin-bottom: 6px; }
          p, li { font-size: 13px; margin-bottom: 6px; }
          strong { color: #000; }
          hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          td, th { border: 1px solid #ddd; padding: 6px 10px; font-size: 12px; text-align: left; }
          @media print { body { padding: 20px 30px; } }
        </style>
      </head>
      <body>${contentHTML}</body>
    </html>
  `);
  win.document.close();
  setTimeout(() => { win.print(); }, 300);
}

// Converte markdown simples para HTML para exportação em PDF
function mdToHTML(text) {
  const lines = text.split("\n");
  let html = "";
  let inList = false;
  for (const line of lines) {
    const esc = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, "<code>$1</code>");
    if (line.startsWith("### ")) { if (inList) { html += "</ul>"; inList = false; } html += `<h3>${esc.slice(4)}</h3>`; }
    else if (line.startsWith("## ")) { if (inList) { html += "</ul>"; inList = false; } html += `<h2>${esc.slice(3)}</h2>`; }
    else if (line.startsWith("# ")) { if (inList) { html += "</ul>"; inList = false; } html += `<h1>${esc.slice(2)}</h1>`; }
    else if (line.startsWith("---")) { if (inList) { html += "</ul>"; inList = false; } html += "<hr/>"; }
    else if (line.startsWith("- ") || line.startsWith("* ")) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${esc.slice(2)}</li>`; }
    else if (line.trim() === "") { if (inList) { html += "</ul>"; inList = false; } html += "<br/>"; }
    else { if (inList) { html += "</ul>"; inList = false; } html += `<p>${esc}</p>`; }
  }
  if (inList) html += "</ul>";
  return html;
}

// ── MARKDOWN RENDERER ─────────────────────────────────────────────────────────
function renderMD(text) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) return <div key={i} style={{ fontSize:13, fontWeight:700, color:T.accent, marginTop:16, marginBottom:6, borderBottom:`1px solid ${T.border}`, paddingBottom:4 }}>{line.slice(4)}</div>;
    if (line.startsWith("## ")) return <div key={i} style={{ fontSize:14, fontWeight:700, color:T.text, marginTop:20, marginBottom:8, borderLeft:`3px solid ${T.blue}`, paddingLeft:10 }}>{line.slice(3)}</div>;
    if (line.startsWith("# ")) return <div key={i} style={{ fontSize:16, fontWeight:700, color:T.text, marginTop:20, marginBottom:10 }}>{line.slice(2)}</div>;
    if (line.startsWith("---")) return <hr key={i} style={{ border:"none", borderTop:`1px solid ${T.border}`, margin:"14px 0" }} />;
    if (line.startsWith("- ") || line.startsWith("* ")) return (
      <div key={i} style={{ display:"flex", gap:8, marginBottom:4, fontSize:13, color:T.textMuted, lineHeight:1.6 }}>
        <span style={{ color:T.blue, flexShrink:0 }}>·</span>
        <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, `<strong style="color:${T.text}">$1</strong>`) }} />
      </div>
    );
    if (/^\d+\. /.test(line)) { const m = line.match(/^(\d+)\. /); return (
      <div key={i} style={{ display:"flex", gap:10, marginBottom:5, fontSize:13, color:T.textMuted, lineHeight:1.6 }}>
        <span style={{ color:T.blue, fontWeight:700, flexShrink:0, minWidth:18 }}>{m[1]}.</span>
        <span dangerouslySetInnerHTML={{ __html: line.slice(m[0].length).replace(/\*\*(.*?)\*\*/g, `<strong style="color:${T.text}">$1</strong>`) }} />
      </div>
    ); }
    if (line.trim() === "") return <div key={i} style={{ height:6 }} />;
    if (line.startsWith("|")) {
      const cells = line.split("|").filter(c => c.trim() !== "");
      if (cells.every(c => /^[-: ]+$/.test(c))) return <div key={i} />;
      return (
        <div key={i} style={{ display:"flex", gap:0, marginBottom:2 }}>
          {cells.map((cell, j) => (
            <div key={j} style={{ flex:1, fontSize:12, color:T.textMuted, padding:"5px 10px", background: j===0 ? T.blueDim+"66" : "transparent", border:`1px solid ${T.border}` }}
              dangerouslySetInnerHTML={{ __html: cell.trim().replace(/\*\*(.*?)\*\*/g, `<strong style="color:${T.text}">$1</strong>`) }} />
          ))}
        </div>
      );
    }
    return <div key={i} style={{ fontSize:13, color:T.textMuted, lineHeight:1.7, marginBottom:2 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${T.text}">$1</strong>`).replace(/`(.*?)`/g, `<code style="background:${T.surface};padding:1px 6px;border-radius:4px;font-size:12px;color:${T.accent}">$1</code>`) }} />;
  });
}

// ── AI BOX ────────────────────────────────────────────────────────────────────
function AIBox({ title, placeholder, buildPrompt, system, minH, contexto, defaultValue }) {
  const [input, setInput] = useState(defaultValue || "");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  useEffect(() => { if (defaultValue) setInput(defaultValue); }, [defaultValue]);
  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setOutput(""); setEditing(false);
    try {
      const prefix = buildContextPrefix(contexto);
      setOutput(await callClaude(prefix + buildPrompt(input), system));
    }
    catch { setOutput("Erro ao conectar com a IA."); }
    setLoading(false);
  };
  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const exportPdf = () => exportToPDF(title, `<h1>${title}</h1>${mdToHTML(output)}`);
  return (
    <div className="ai-box">
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:15 }}>✦</span>
        <span style={{ fontSize:13, fontWeight:600, color:T.accent }}>{title}</span>
        {contexto && (contexto.area || contexto.objetivo) && (
          <span className="tag tag-a" style={{ marginLeft: "auto", fontSize: 10 }}>usando seu contexto de perfil</span>
        )}
      </div>
      <textarea className="ta" placeholder={placeholder} value={input} onChange={e => setInput(e.target.value)} style={{ background:"#060E1A", border:`1px solid ${T.blue}44`, minHeight:minH||90 }} />
      <button className="btn btn-p" onClick={run} disabled={loading} style={{ marginTop:10 }}>
        {loading ? <span className="loading-dots">Gerando</span> : "→ Gerar com IA"}
      </button>
      {output && (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:20, marginTop:14, maxHeight:600, overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:10 }}>
            <button className="btn btn-g" onClick={() => setEditing(!editing)} style={{ padding:"5px 12px", fontSize:11 }}>{editing ? "✓ Concluir edição" : "✎ Editar texto"}</button>
            <button className="btn btn-g" onClick={exportPdf} style={{ padding:"5px 12px", fontSize:11 }}>⬇ Exportar PDF</button>
            <button className="btn btn-g" onClick={copy} style={{ padding:"5px 12px", fontSize:11 }}>{copied ? "✓ Copiado" : "Copiar"}</button>
          </div>
          {editing ? (
            <textarea
              className="ta"
              value={output}
              onChange={e => setOutput(e.target.value)}
              style={{ background:"#060E1A", border:`1px solid ${T.blue}44`, minHeight:400, width:"100%", fontFamily:"inherit" }}
            />
          ) : (
            renderMD(output)
          )}
        </div>
      )}
    </div>
  );
}

// ── LOGIN / CADASTRO ──────────────────────────────────────────────────────────
function LoginScreen({ onLoggedIn }) {
  const [mode, setMode] = useState("login"); // "login", "cadastro" ou "recuperar"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const submit = async () => {
    if (mode === "recuperar") {
      if (!email.trim()) { setError("Preencha seu email."); return; }
      setLoading(true); setError(""); setInfo("");
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setInfo("Enviamos um link para seu email. Abra-o para definir uma senha nova.");
      } catch (e) {
        setError(e.message || "Erro ao processar. Tente novamente.");
      }
      setLoading(false);
      return;
    }
    if (!email.trim() || !password.trim()) { setError("Preencha email e senha."); return; }
    setLoading(true); setError(""); setInfo("");
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLoggedIn(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
          setInfo("Conta criada. Verifique seu email para confirmar antes de entrar.");
        } else if (data.user) {
          onLoggedIn(data.user);
        }
      }
    } catch (e) {
      setError(e.message || "Erro ao processar. Tente novamente.");
    }
    setLoading(false);
  };

  const titleByMode = { login: "Entrar na sua conta", cadastro: "Criar conta", recuperar: "Recuperar senha" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
      <div style={{ width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.accent }}>Sistema Carreira</div>
          <div style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>Desenvolvimento · IA</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18, textAlign: "center" }}>
            {titleByMode[mode]}
          </div>
          <div className="fg">
            <label className="lbl">Email</label>
            <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          {mode !== "recuperar" && (
            <div className="fg">
              <label className="lbl">Senha</label>
              <input className="inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
          )}
          {mode === "recuperar" && (
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>Você vai receber um email com um link para criar uma senha nova.</div>
          )}
          {error && <div style={{ fontSize: 12, color: "#F87171", marginBottom: 12 }}>{error}</div>}
          {info && <div style={{ fontSize: 12, color: T.greenLight, marginBottom: 12 }}>{info}</div>}
          <button className="btn btn-p" onClick={submit} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? <span className="loading-dots">Processando</span> : (mode === "login" ? "Entrar" : mode === "cadastro" ? "Criar conta" : "Enviar link de recuperação")}
          </button>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: T.textMuted, display: "flex", flexDirection: "column", gap: 8 }}>
            {mode === "login" && (
              <>
                <div>Não tem conta? <span style={{ color: T.accent, cursor: "pointer" }} onClick={() => { setMode("cadastro"); setError(""); setInfo(""); }}>Criar agora</span></div>
                <div><span style={{ color: T.accent, cursor: "pointer" }} onClick={() => { setMode("recuperar"); setError(""); setInfo(""); }}>Esqueci minha senha</span></div>
              </>
            )}
            {mode === "cadastro" && (
              <div>Já tem conta? <span style={{ color: T.accent, cursor: "pointer" }} onClick={() => { setMode("login"); setError(""); setInfo(""); }}>Entrar</span></div>
            )}
            {mode === "recuperar" && (
              <div><span style={{ color: T.accent, cursor: "pointer" }} onClick={() => { setMode("login"); setError(""); setInfo(""); }}>Voltar para login</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DEFINIR NOVA SENHA (após clicar no link de recuperação) ───────────────────
function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (password.length < 6) { setError("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true); setError("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => onDone(), 1800);
    } catch (e) {
      setError(e.message || "Erro ao atualizar a senha.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
      <div style={{ width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.accent }}>Sistema Carreira</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 18, textAlign: "center" }}>Defina sua nova senha</div>
          {success ? (
            <div style={{ fontSize: 13, color: T.greenLight, textAlign: "center" }}>✓ Senha atualizada! Entrando...</div>
          ) : (
            <>
              <div className="fg">
                <label className="lbl">Nova senha</label>
                <input className="inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="fg">
                <label className="lbl">Confirme a nova senha</label>
                <input className="inp" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
              </div>
              {error && <div style={{ fontSize: 12, color: "#F87171", marginBottom: 12 }}>{error}</div>}
              <button className="btn btn-p" onClick={submit} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
                {loading ? <span className="loading-dots">Salvando</span> : "Salvar nova senha"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SELETOR DE PERFIL ──────────────────────────────────────────────────────────
function ProfileSelector({ profiles, activeProfile, setActiveProfile, setProfiles, onEditContext, userEmail, onLogout }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const add = () => {
    if (!name.trim()) return;
    const id = Date.now();
    setProfiles(p => [...p, { id, name, onboarded: false }]);
    setActiveProfile(id);
    setName(""); setShowAdd(false);
  };
  return (
    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
      {userEmail && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: T.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{userEmail}</span>
          <span onClick={onLogout} style={{ fontSize: 11, color: T.accent, cursor: "pointer" }}>Sair</span>
        </div>
      )}
      <div className="lbl" style={{ marginBottom: 8 }}>Perfil Ativo</div>
      <select className="sel" value={activeProfile} onChange={e => setActiveProfile(Number(e.target.value))} style={{ marginBottom: 8 }}>
        {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <button className="btn btn-g" onClick={onEditContext} style={{ width: "100%", justifyContent: "center", padding: "6px", fontSize: 11, marginBottom: 6 }}>✎ Editar contexto do perfil</button>
      {!showAdd ? (
        <button className="btn btn-g" onClick={() => setShowAdd(true)} style={{ width: "100%", justifyContent: "center", padding: "6px", fontSize: 11 }}>+ Novo Perfil</button>
      ) : (
        <div style={{ display: "flex", gap: 6 }}>
          <input className="inp" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do perfil" style={{ fontSize: 12 }} />
          <button className="btn btn-p" onClick={add} style={{ padding: "8px 10px", fontSize: 11 }}>OK</button>
        </div>
      )}
    </div>
  );
}

// ── ONBOARDING ─────────────────────────────────────────────────────────────────
function Onboarding({ profileName, onComplete, onSkip, initialValues, isEdit }) {
  const [form, setForm] = useState(initialValues || { area: "", senioridade: "Júnior", objetivo: "", contexto: "" });
  const senioridades = ["Estagiária", "Júnior", "Pleno", "Sênior", "Coordenação", "Gerência", "Diretoria"];
  return (
    <div className="pc" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28, marginTop: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>{isEdit ? "✎" : "👋"}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{isEdit ? `Editar contexto — ${profileName}` : `Bem-vinda, ${profileName}`}</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>{isEdit ? "Atualize suas respostas. Isso é usado automaticamente pela IA em todos os módulos." : "Responda rapidamente — isso ajuda a IA a dar respostas mais precisas em todos os módulos."}</div>
      </div>
      <div className="card">
        <div className="fg">
          <label className="lbl">Área de atuação</label>
          <input className="inp" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="Ex: Marketing Digital, Dados, Recursos Humanos..." />
        </div>
        <div className="fg">
          <label className="lbl">Nível de senioridade atual</label>
          <select className="sel" value={form.senioridade} onChange={e => setForm({ ...form, senioridade: e.target.value })}>
            {senioridades.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="fg">
          <label className="lbl">Objetivo principal agora</label>
          <input className="inp" value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })} placeholder="Ex: Conseguir uma promoção, trocar de área, primeiro emprego..." />
        </div>
        <div className="fg">
          <label className="lbl">Contexto adicional (opcional)</label>
          <textarea className="ta" value={form.contexto} onChange={e => setForm({ ...form, contexto: e.target.value })} placeholder="Qualquer coisa relevante: formação, tempo de experiência, restrições..." style={{ minHeight: 80 }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-p" onClick={() => onComplete(form)}>{isEdit ? "Salvar Alterações" : "Concluir e Começar"}</button>
          <button className="btn btn-g" onClick={onSkip}>{isEdit ? "Cancelar" : "Pular por agora"}</button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ vagas, conquistas, resumeScore, scoreHistory, profileName, alerts, onGoTo }) {
  const ativasCount = vagas.filter(v => v.stage !== "Encerrada").length;
  const propostas = vagas.filter(v => v.stage === "Proposta").length;

  // Vagas aplicadas por mês (últimos 6 meses)
  const monthsBack = 6;
  const monthLabels = [];
  const vagasPorMes = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const label = d.toLocaleDateString("pt-BR", { month: "short" });
    monthLabels.push(label);
    const count = vagas.filter(v => {
      const vd = new Date(v.date);
      return vd.getMonth() === d.getMonth() && vd.getFullYear() === d.getFullYear();
    }).length;
    vagasPorMes.push({ mes: label, vagas: count });
  }

  const scoreData = scoreHistory.map(s => ({ data: fmt(s.date), score: s.score }));

  return (
    <div>
      <div className="ph"><div className="ph-eye">Visão Geral</div><div className="ph-title">Dashboard — {profileName}</div><div className="ph-desc">Seu desenvolvimento de carreira em um só lugar.</div></div>
      <div className="pc">
        {alerts && alerts.length > 0 && (
          <div className="card" style={{ borderColor: T.blue + "55", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 15 }}>⚠</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>Seu perfil tem {alerts.length} pendência{alerts.length > 1 ? "s" : ""}</span>
            </div>
            {alerts.map((a, i) => <div key={i} style={{ fontSize: 12, color: T.textMuted, padding: "6px 0", borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>• {a}</div>)}
          </div>
        )}

        <div className="g4" style={{ marginBottom: 24 }}>
          <div className="sc"><div className="sc-l">Score do Currículo</div><div className="sc-v">{resumeScore || "—"}</div><div className="sc-s">de 100</div></div>
          <div className="sc"><div className="sc-l">Vagas Ativas</div><div className="sc-v">{ativasCount}</div><div className="sc-s">no pipeline</div></div>
          <div className="sc"><div className="sc-l">Propostas</div><div className="sc-v">{propostas}</div><div className="sc-s">recebidas</div></div>
          <div className="sc"><div className="sc-l">Conquistas</div><div className="sc-v">{conquistas.length}</div><div className="sc-s">registradas</div></div>
        </div>

        <div className="g2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-t" style={{ marginBottom: 14 }}>Evolução do Score do Currículo</div>
            {scoreData.length < 2 ? (
              <div style={{ fontSize: 12, color: T.textDim, padding: "30px 0", textAlign: "center" }}>Gere ao menos 2 análises de currículo para ver a evolução</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="data" stroke={T.textDim} fontSize={11} />
                  <YAxis stroke={T.textDim} fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="score" stroke={T.accent} strokeWidth={2} dot={{ fill: T.accent, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="card">
            <div className="card-t" style={{ marginBottom: 14 }}>Vagas Aplicadas por Mês</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={vagasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                <XAxis dataKey="mes" stroke={T.textDim} fontSize={11} />
                <YAxis stroke={T.textDim} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="vagas" stroke={T.blue} strokeWidth={2} dot={{ fill: T.blue, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="st">Pipeline de Vagas</div>
        {vagas.length === 0 && <div className="es"><div style={{ fontSize: 28, marginBottom: 10 }}>💼</div><div>Nenhuma vaga registrada ainda</div></div>}
        <div className="g3">
          {vagas.slice(0, 6).map(v => (
            <div key={v.id} className="card" style={{ cursor: onGoTo ? "pointer" : "default" }} onClick={() => onGoTo && onGoTo("vagas")}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span className="card-t">{v.company}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: stColor(v.stage) }}>{v.stage}</span>
              </div>
              <div className="card-d">{v.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MÓDULO CURRÍCULO ──────────────────────────────────────────────────────────
function ModuloCurriculo({ resumeScore, setResumeScore, scoreHistory, setScoreHistory, curriculoTexto, setCurriculoTexto, contexto, pendingAddition, clearPendingAddition }) {
  const [tab, setTab] = useState(pendingAddition ? "gerador" : "analise");
  const [input, setInput] = useState(curriculoTexto || "");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [genInput, setGenInput] = useState("");
  const [genOutput, setGenOutput] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genCopied, setGenCopied] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [editingGen, setEditingGen] = useState(false);
  const [applyingImprovements, setApplyingImprovements] = useState(false);

  useEffect(() => {
    if (pendingAddition) {
      setTab("gerador");
      setGenInput(prev => {
        const base = curriculoTexto ? `${curriculoTexto}\n\n[Novo case de portfólio para incorporar]\n${pendingAddition}` : `[Case de portfólio]\n${pendingAddition}`;
        return base;
      });
      clearPendingAddition();
    }
  }, [pendingAddition]);

  const system = `Você é especialista sênior em recrutamento e ATS (Applicant Tracking Systems). Analise currículos com rigor profissional e dê feedback estruturado e direto, sem rodeios. 

Sua resposta deve seguir este formato:
## Score Geral: [coloque aqui apenas o número de 0 a 100]
Dê uma nota de 0 a 100 baseada em: clareza, impacto quantificado de resultados, compatibilidade com ATS, estrutura visual, e relevância de palavras-chave.

## Pontos Fortes
Liste o que está bem feito.

## Pontos Críticos
Liste o que precisa mudar com urgência, sendo específico sobre onde e por quê.

## Sugestões de Reescrita
Para 2-3 trechos problemáticos, mostre o "antes" e o "depois" sugerido.

## Compatibilidade ATS
Aponte riscos de o currículo não passar por filtros automáticos.`;

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setOutput("");
    try {
      const prefix = buildContextPrefix(contexto);
      const result = await callClaude(`${prefix}Analise este currículo:\n\n${input}`, system);
      setOutput(result);
      setCurriculoTexto(input);
      const match = result.match(/Score Geral:?\s*\*?\*?\s*(\d{1,3})/i) || result.match(/(\d{1,3})\s*\/\s*100/);
      if (match) {
        const score = Math.min(100, parseInt(match[1]));
        setResumeScore(score);
        setScoreHistory(p => [...p, { id: Date.now(), date: today.toISOString().slice(0, 10), score }]);
      }
    } catch { setOutput("Erro ao conectar com a IA."); }
    setLoading(false);
  };
  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const systemGen = "Você é especialista em redação de currículos ATS-friendly em português do Brasil. Transforme experiências em texto livre em um currículo estruturado profissional, com bullets de impacto (verbo de ação + resultado quantificado quando possível), seções claras (Resumo, Experiência, Formação, Habilidades, Certificações) e linguagem objetiva. REGRAS OBRIGATÓRIAS: 1) Escreva todo o currículo na terceira pessoa implícita, sem pronomes (ex: 'Gerenciou campanhas de tráfego pago' e não 'Eu gerenciei' ou 'Você gerenciou' ou 'Gerencia campanhas'). Nunca alterne entre primeira, segunda ou terceira pessoa dentro do mesmo texto. 2) Revise cuidadosamente a gramática, concordância verbal e nominal, e coerência do português antes de finalizar — não entregue texto com erros de interpretação ou frases que não façam sentido lógico. 3) Mantenha o tempo verbal consistente: passado para experiências anteriores, presente para o cargo atual.";

  const systemApply = systemGen + " Você está reescrevendo um currículo existente para corrigir problemas já identificados numa análise crítica. Aplique TODAS as sugestões de melhoria listadas, corrija os pontos críticos apontados, e preserve os pontos fortes mencionados. O resultado final deve ser um currículo completo e pronto para uso, não um resumo das mudanças.";

  const runGen = async () => {
    if (!genInput.trim()) return;
    setGenLoading(true); setGenOutput("");
    try {
      const prefix = buildContextPrefix(contexto);
      setGenOutput(await callClaude(`${prefix}Transforme isso em um currículo estruturado e profissional:\n\n${genInput}\n\nFormate em seções claras, prontas para usar.`, systemGen));
    } catch { setGenOutput("Erro ao conectar com a IA."); }
    setGenLoading(false);
  };

  const applyImprovements = async () => {
    if (!input.trim() || !output.trim()) return;
    setApplyingImprovements(true);
    setTab("gerador");
    setGenOutput("");
    try {
      const prefix = buildContextPrefix(contexto);
      const prompt = `${prefix}Currículo original:\n\n${input}\n\n---\n\nAnálise crítica recebida sobre esse currículo:\n\n${output}\n\n---\n\nReescreva o currículo completo aplicando todas as melhorias apontadas na análise acima.`;
      const result = await callClaude(prompt, systemApply);
      setGenOutput(result);
      setGenInput(input);
    } catch { setGenOutput("Erro ao conectar com a IA."); }
    setApplyingImprovements(false);
  };
  const copyGen = () => { navigator.clipboard.writeText(genOutput); setGenCopied(true); setTimeout(() => setGenCopied(false), 2000); };
  const useAsCurriculo = () => {
    setCurriculoTexto(genOutput);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  };

  return (
    <div>
      <div className="ph"><div className="ph-eye">Módulo 1</div><div className="ph-title">Currículo</div><div className="ph-desc">Análise crítica e geração estruturada.</div></div>
      <div className="pc">
        {curriculoTexto && (
          <div style={{ marginBottom: 16, fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 8 }}>
            <span className="tag tag-g">✓ Currículo salvo</span>
            <span>Disponível automaticamente no Comparador (Módulo 10) e na Carta de Apresentação.</span>
          </div>
        )}
        <div className="tabs">
          {["analise", "gerador"].map(t => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t === "analise" ? "Análise de Currículo" : "Gerador de Currículo"}</div>)}
        </div>
        {tab === "analise" && (
          <div className="ai-box">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 15 }}>✦</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.accent }}>Análise de Currículo</span>
              {contexto && contexto.area && <span className="tag tag-a" style={{ marginLeft: "auto", fontSize: 10 }}>usando seu contexto de perfil</span>}
            </div>
            <textarea className="ta" placeholder="Cole o texto completo do seu currículo aqui (experiências, formação, certificações, habilidades)..." value={input} onChange={e => setInput(e.target.value)} style={{ background: "#060E1A", border: `1px solid ${T.blue}44`, minHeight: 160 }} />
            <button className="btn btn-p" onClick={run} disabled={loading} style={{ marginTop: 10 }}>
              {loading ? <span className="loading-dots">Analisando</span> : "→ Gerar com IA"}
            </button>
            {output && (
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginTop: 14, maxHeight: 520, overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 10 }}>
                  <button className="btn btn-a" onClick={applyImprovements} disabled={applyingImprovements} style={{ padding: "5px 12px", fontSize: 11 }}>
                    {applyingImprovements ? <span className="loading-dots">Aplicando</span> : "✨ Aplicar melhorias e gerar currículo corrigido"}
                  </button>
                  <button className="btn btn-g" onClick={() => exportToPDF("Análise de Currículo", `<h1>Análise de Currículo</h1>${mdToHTML(output)}`)} style={{ padding: "5px 12px", fontSize: 11 }}>⬇ Exportar PDF</button>
                  <button className="btn btn-g" onClick={copy} style={{ padding: "5px 12px", fontSize: 11 }}>{copied ? "✓ Copiado" : "Copiar"}</button>
                </div>
                {renderMD(output)}
              </div>
            )}
          </div>
        )}
        {tab === "gerador" && (
          <div className="ai-box">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 15 }}>✦</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.accent }}>Gerador de Currículo Estruturado</span>
              {contexto && contexto.area && <span className="tag tag-a" style={{ marginLeft: "auto", fontSize: 10 }}>usando seu contexto de perfil</span>}
            </div>
            <textarea className="ta" placeholder="Descreva sua experiência em texto livre: cargos, empresas, períodos, principais responsabilidades e resultados, formação, certificações, habilidades. Não precisa formatar, só escrever tudo." value={genInput} onChange={e => setGenInput(e.target.value)} style={{ background: "#060E1A", border: `1px solid ${T.blue}44`, minHeight: 160 }} />
            <button className="btn btn-p" onClick={runGen} disabled={genLoading || applyingImprovements} style={{ marginTop: 10 }}>
              {genLoading ? <span className="loading-dots">Gerando</span> : "→ Gerar com IA"}
            </button>
            {applyingImprovements && !genOutput && (
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 14, textAlign: "center" }}>
                <span className="loading-dots">Aplicando melhorias da análise ao currículo</span>
              </div>
            )}
            {genOutput && (
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginTop: 14, maxHeight: 600, overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 10 }}>
                  <button className="btn btn-g" onClick={() => setEditingGen(!editingGen)} style={{ padding: "5px 12px", fontSize: 11 }}>{editingGen ? "✓ Concluir edição" : "✎ Editar texto"}</button>
                  <button className="btn btn-a" onClick={useAsCurriculo} style={{ padding: "5px 12px", fontSize: 11 }}>{savedFlash ? "✓ Salvo como meu currículo" : "★ Usar como meu currículo"}</button>
                  <button className="btn btn-g" onClick={() => exportToPDF("Currículo", `<h1>Currículo</h1>${mdToHTML(genOutput)}`)} style={{ padding: "5px 12px", fontSize: 11 }}>⬇ Exportar PDF</button>
                  <button className="btn btn-g" onClick={copyGen} style={{ padding: "5px 12px", fontSize: 11 }}>{genCopied ? "✓ Copiado" : "Copiar"}</button>
                </div>
                {editingGen ? (
                  <textarea
                    className="ta"
                    value={genOutput}
                    onChange={e => setGenOutput(e.target.value)}
                    style={{ background: "#060E1A", border: `1px solid ${T.blue}44`, minHeight: 400, width: "100%", fontFamily: "inherit" }}
                  />
                ) : (
                  renderMD(genOutput)
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MÓDULO LINKEDIN ───────────────────────────────────────────────────────────
function ModuloLinkedin({ contexto }) {
  const [tab, setTab] = useState("perfil");
  return (
    <div>
      <div className="ph"><div className="ph-eye">Módulo 2</div><div className="ph-title">LinkedIn</div><div className="ph-desc">Perfil, bio, conteúdo e análise — tudo num lugar.</div></div>
      <div className="pc">
        <div className="tabs">
          {["perfil", "bio", "conteudo", "analise"].map(t => (
            <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {{ perfil: "Análise de Perfil", bio: "Gerador de Bio", conteudo: "Gerador de Posts", analise: "Análise de Posts" }[t]}
            </div>
          ))}
        </div>
        {tab === "perfil" && (
          <AIBox title="Análise de Perfil LinkedIn"
            minH={160}
            contexto={contexto}
            placeholder="Cole o conteúdo do seu perfil: headline, sobre, experiências, e cole também alguns posts recentes se tiver..."
            system="Especialista em personal branding no LinkedIn. Analise perfis com foco em: força da headline, clareza da seção 'sobre', consistência de posicionamento, uso de palavras-chave do nicho, e potencial de geração de oportunidades. Seja direto sobre o que está fraco."
            buildPrompt={i => `Analise este perfil de LinkedIn:\n\n${i}\n\nDê: 1) Diagnóstico geral 2) O que está funcionando 3) O que está travando oportunidades 4) Ações prioritárias`} />
        )}
        {tab === "bio" && (
          <AIBox title="Gerador de Bio para LinkedIn"
            minH={140}
            contexto={contexto}
            placeholder="Conte sobre você: área de atuação, principais conquistas, o que você quer atrair (vagas, clientes, networking), tom de voz desejado..."
            system="Especialista em copywriting para LinkedIn. Cria bios (seção 'Sobre') que combinam autoridade, humanidade e clareza de posicionamento. Evita clichês genéricos, usa storytelling quando possível, sempre termina com um chamado claro (o que a pessoa quer atrair)."
            buildPrompt={i => `Crie 2 versões de bio para LinkedIn (uma mais formal, uma mais pessoal) com base em:\n\n${i}`} />
        )}
        {tab === "conteudo" && (
          <AIBox title="Gerador de Conteúdo para LinkedIn"
            minH={140}
            contexto={contexto}
            placeholder="Tema do post, formato desejado (storytelling, lista, opinião, case), nicho/área, tom de voz..."
            system="Especialista em conteúdo para LinkedIn que gera engajamento real. Cria posts com gancho forte na primeira linha, estrutura escaneável, e CTA natural. Evita linguagem corporativa vazia e clichês de 'guru de LinkedIn'. Tom humano e direto."
            buildPrompt={i => `Crie um post para LinkedIn:\n\n${i}\n\nInclua: gancho de abertura, corpo estruturado, e fechamento com CTA.`} />
        )}
        {tab === "analise" && (
          <AIBox title="Análise de Conteúdos / Tendências do Nicho"
            minH={180}
            contexto={contexto}
            placeholder="Cole aqui posts que você viu performando bem no seu nicho essa semana (texto + métricas se tiver: curtidas, comentários). Pode colar vários de uma vez."
            system="Especialista em análise de conteúdo e tendências do LinkedIn. Identifica padrões em posts de alto engajamento: tipo de gancho, estrutura, formato, tom, e tópicos recorrentes. Não inventa dados que não foram fornecidos."
            buildPrompt={i => `Analise os padrões destes posts colados pelo usuário (que ele identificou como de bom desempenho no nicho):\n\n${i}\n\nIdentifique: 1) Padrões de gancho 2) Estruturas recorrentes 3) Temas em alta 4) O que aplicar no próprio conteúdo`} />
        )}
      </div>
    </div>
  );
}

// ── MÓDULO VAGAS (TRACKER) ────────────────────────────────────────────────────
function ModuloVagas({ vagas, setVagas, onUseInCarta, onUseInComparador, onUseInEntrevista }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ company: "", role: "", link: "", notes: "", description: "" });
  const [expandedId, setExpandedId] = useState(null);
  const stages = ["Aplicada", "Triagem", "Entrevista", "Proposta", "Encerrada"];

  const add = () => {
    if (!form.company) return;
    if (editId) {
      setVagas(p => p.map(v => v.id === editId ? { ...v, ...form } : v));
      setEditId(null);
    } else {
      setVagas(p => [...p, { ...form, id: Date.now(), stage: "Aplicada", date: today.toISOString().slice(0, 10) }]);
    }
    setForm({ company: "", role: "", link: "", notes: "", description: "" }); setShowAdd(false);
  };
  const startEdit = (v) => {
    setForm({ company: v.company, role: v.role, link: v.link || "", notes: v.notes || "", description: v.description || "" });
    setEditId(v.id); setShowAdd(true);
  };
  const cancelForm = () => { setShowAdd(false); setEditId(null); setForm({ company: "", role: "", link: "", notes: "", description: "" }); };
  const move = (id, dir) => setVagas(p => p.map(v => {
    if (v.id !== id) return v;
    const i = stages.indexOf(v.stage) + dir;
    return (i < 0 || i >= stages.length) ? v : { ...v, stage: stages[i] };
  }));
  const remove = (id) => setVagas(p => p.filter(v => v.id !== id));

  return (
    <div>
      <div className="ph"><div className="ph-eye">Módulo 3</div><div className="ph-title">Tracker de Vagas</div><div className="ph-desc">Pipeline de candidaturas — gere carta, comparação e perguntas direto de cada vaga.</div></div>
      <div className="pc">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div className="st" style={{ margin: 0 }}>Pipeline</div>
          <button className="btn btn-p" onClick={() => showAdd ? cancelForm() : setShowAdd(true)}>+ Nova Vaga</button>
        </div>
        {showAdd && (
          <div className="card" style={{ marginBottom: 20, borderColor: T.blue + "55" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: T.accent }}>{editId ? "Editar Vaga" : "Nova Vaga"}</div>
            <div className="g2">
              <div className="fg"><label className="lbl">Empresa</label><input className="inp" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
              <div className="fg"><label className="lbl">Cargo</label><input className="inp" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
            </div>
            <div className="fg"><label className="lbl">Link da vaga</label><input className="inp" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} /></div>
            <div className="fg"><label className="lbl">Descrição completa da vaga (cole aqui — usado para gerar carta, comparar currículo e simular entrevista)</label><textarea className="ta" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ minHeight: 100 }} placeholder="Cole a descrição completa da vaga, requisitos, responsabilidades..." /></div>
            <div className="fg"><label className="lbl">Observações pessoais</label><textarea className="ta" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ minHeight: 60 }} /></div>
            <div style={{ display: "flex", gap: 10 }}><button className="btn btn-p" onClick={add}>Salvar</button><button className="btn btn-g" onClick={cancelForm}>Cancelar</button></div>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          {stages.map(stage => (
            <div key={stage}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: stColor(stage), marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid ${stColor(stage)}44` }}>
                {stage} ({vagas.filter(v => v.stage === stage).length})
              </div>
              {vagas.filter(v => v.stage === stage).map(v => (
                <div key={v.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{v.company}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>{v.role}</div>
                  {v.notes && <div style={{ fontSize: 11, color: T.textDim, marginBottom: 8 }}>{v.notes}</div>}
                  <div style={{ display: "flex", gap: 5, marginBottom: v.description ? 8 : 0 }}>
                    <button className="btn btn-g" onClick={() => move(v.id, -1)} style={{ padding: "4px 8px", fontSize: 11 }}>←</button>
                    <button className="btn btn-g" onClick={() => move(v.id, 1)} style={{ padding: "4px 8px", fontSize: 11 }}>→</button>
                    <button className="btn btn-g" onClick={() => startEdit(v)} style={{ padding: "4px 8px", fontSize: 11, marginLeft: "auto" }}>✎</button>
                    <button className="btn btn-g" onClick={() => remove(v.id)} style={{ padding: "4px 8px", fontSize: 11, color: "#F87171" }}>✕</button>
                  </div>
                  {v.description ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <button className="btn btn-a" onClick={() => onUseInCarta(v)} style={{ padding: "5px 8px", fontSize: 10.5, justifyContent: "center" }}>✉ Gerar Carta para esta vaga</button>
                      <button className="btn btn-a" onClick={() => onUseInComparador(v)} style={{ padding: "5px 8px", fontSize: 10.5, justifyContent: "center" }}>⇄ Comparar meu Currículo</button>
                      <button className="btn btn-a" onClick={() => onUseInEntrevista(v)} style={{ padding: "5px 8px", fontSize: 10.5, justifyContent: "center" }}>◎ Gerar Perguntas de Entrevista</button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 10.5, color: T.textDim }}>Edite a vaga e cole a descrição para liberar ações rápidas</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MÓDULO ENTREVISTA ──────────────────────────────────────────────────────────
function ModuloEntrevista({ contexto, vagaContexto }) {
  const [tab, setTab] = useState("perguntas");
  return (
    <div>
      <div className="ph"><div className="ph-eye">Módulo 4</div><div className="ph-title">Simulador de Entrevista</div><div className="ph-desc">Perguntas geradas por IA e feedback nas suas respostas.</div></div>
      <div className="pc">
        {vagaContexto && (
          <div style={{ marginBottom: 16 }}><span className="tag tag-b">Carregado da vaga: {vagaContexto.company} — {vagaContexto.role}</span></div>
        )}
        <div className="tabs">
          {["perguntas", "feedback"].map(t => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t === "perguntas" ? "Gerar Perguntas" : "Feedback de Resposta"}</div>)}
        </div>
        {tab === "perguntas" && (
          <AIBox title="Gerador de Perguntas de Entrevista"
            minH={140}
            contexto={contexto}
            defaultValue={vagaContexto ? `Empresa: ${vagaContexto.company}\nCargo: ${vagaContexto.role}\n\nDescrição da vaga:\n${vagaContexto.description}` : ""}
            placeholder="Cole a descrição da vaga, ou descreva o cargo e a empresa. Diga também se quer perguntas técnicas, comportamentais ou ambas."
            system="Especialista em recrutamento. Gera perguntas de entrevista realistas e relevantes para a vaga descrita, organizadas por categoria (comportamental, técnica, situacional)."
            buildPrompt={i => `Com base nesta vaga/contexto:\n\n${i}\n\nGere 8 a 10 perguntas de entrevista organizadas por categoria, das mais prováveis às mais desafiadoras.`} />
        )}
        {tab === "feedback" && (
          <AIBox title="Feedback de Resposta de Entrevista"
            minH={160}
            contexto={contexto}
            placeholder="Cole a pergunta que recebeu (ou que está praticando) e a resposta que você daria/deu..."
            system="Especialista em coaching de entrevistas. Avalia respostas com base em estrutura (ex: método STAR para comportamentais), clareza, impacto e adequação ao que foi perguntado. Dá feedback direto e sugestões de melhoria."
            buildPrompt={i => `Avalie esta resposta de entrevista:\n\n${i}\n\nDê: 1) O que funcionou 2) O que está fraco 3) Sugestão de resposta melhorada`} />
        )}
      </div>
    </div>
  );
}

// ── MÓDULO CARTA DE APRESENTAÇÃO ───────────────────────────────────────────────
function ModuloCarta({ contexto, vagaContexto, curriculoTexto }) {
  return (
    <div>
      <div className="ph"><div className="ph-eye">Módulo 5</div><div className="ph-title">Carta de Apresentação</div><div className="ph-desc">Personalizada por vaga.</div></div>
      <div className="pc">
        {vagaContexto && (
          <div style={{ marginBottom: 16 }}><span className="tag tag-b">Carregado da vaga: {vagaContexto.company} — {vagaContexto.role}</span></div>
        )}
        <AIBox title="Gerador de Carta de Apresentação"
          minH={180}
          contexto={contexto}
          defaultValue={vagaContexto ? `Empresa: ${vagaContexto.company}\nCargo: ${vagaContexto.role}\n\nDescrição da vaga:\n${vagaContexto.description}${curriculoTexto ? `\n\nMinha experiência relevante (do meu currículo salvo):\n${curriculoTexto}` : ""}` : ""}
          placeholder="Cole a descrição da vaga e conte um pouco sobre sua experiência relevante para ela..."
          system="Especialista em redação de cartas de apresentação. Cria cartas concisas (não mais que 300 palavras), que conectam diretamente a experiência do candidato às necessidades da vaga, com tom profissional mas humano, sem clichês."
          buildPrompt={i => `Crie uma carta de apresentação com base em:\n\n${i}`} />
      </div>
    </div>
  );
}

// ── MÓDULO CONQUISTAS ──────────────────────────────────────────────────────────
function ModuloConquistas({ conquistas, setConquistas }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", category: "Resultado", description: "" });
  const categories = ["Resultado", "Projeto", "Certificação", "Reconhecimento", "Liderança"];
  const add = () => {
    if (!form.title) return;
    if (editId) {
      setConquistas(p => p.map(c => c.id === editId ? { ...c, ...form } : c));
      setEditId(null);
    } else {
      setConquistas(p => [...p, { ...form, id: Date.now(), date: today.toISOString().slice(0, 10) }]);
    }
    setForm({ title: "", category: "Resultado", description: "" }); setShowAdd(false);
  };
  const startEdit = (c) => { setForm({ title: c.title, category: c.category, description: c.description }); setEditId(c.id); setShowAdd(true); };
  const cancelForm = () => { setShowAdd(false); setEditId(null); setForm({ title: "", category: "Resultado", description: "" }); };
  const remove = (id) => setConquistas(p => p.filter(c => c.id !== id));
  const catColor = (c) => ({ Resultado: "tag-g", Projeto: "tag-b", Certificação: "tag-a", Reconhecimento: "tag-y", Liderança: "tag-x" }[c] || "tag-x");

  return (
    <div>
      <div className="ph"><div className="ph-eye">Módulo 6</div><div className="ph-title">Banco de Conquistas</div><div className="ph-desc">Registro contínuo de resultados profissionais.</div></div>
      <div className="pc">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <div className="st" style={{ margin: 0 }}>Conquistas Registradas ({conquistas.length})</div>
          <button className="btn btn-p" onClick={() => showAdd ? cancelForm() : setShowAdd(true)}>+ Registrar</button>
        </div>
        {showAdd && (
          <div className="card" style={{ marginBottom: 20, borderColor: T.blue + "55" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: T.accent }}>{editId ? "Editar Conquista" : "Nova Conquista"}</div>
            <div className="g2">
              <div className="fg"><label className="lbl">Título</label><input className="inp" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Aumentei conversão em 30%" /></div>
              <div className="fg"><label className="lbl">Categoria</label>
                <select className="sel" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select>
              </div>
            </div>
            <div className="fg"><label className="lbl">Descrição (com números se possível)</label><textarea className="ta" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ minHeight: 80 }} /></div>
            <div style={{ display: "flex", gap: 10 }}><button className="btn btn-p" onClick={add}>Salvar</button><button className="btn btn-g" onClick={cancelForm}>Cancelar</button></div>
          </div>
        )}
        {conquistas.length === 0 && <div className="es"><div style={{ fontSize: 28, marginBottom: 10 }}>🏆</div><div>Nenhuma conquista registrada ainda</div></div>}
        <div className="g2">
          {conquistas.map(c => (
            <div key={c.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className={`tag ${catColor(c.category)}`}>{c.category}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => startEdit(c)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer" }}>✎</button>
                  <button onClick={() => remove(c.id)} style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer" }}>✕</button>
                </div>
              </div>
              <div className="card-t">{c.title}</div>
              <div className="card-d" style={{ marginTop: 4 }}>{c.description}</div>
              <div style={{ fontSize: 11, color: T.textDim, marginTop: 8 }}>{fmt(c.date)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CALENDÁRIO DE CONTEÚDO ─────────────────────────────────────────────────────
function CalendarioConteudo({ posts, setPosts }) {
  const [form, setForm] = useState({ title: "", date: "", theme: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = viewMonth.getFullYear(), month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const dayNames = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const add = () => {
    if (!form.title || !form.date) return;
    setPosts(p => [...p, { ...form, id: Date.now(), done: false }]);
    setForm({ title: "", date: "", theme: "" }); setShowAdd(false);
  };
  const toggle = (id) => setPosts(p => p.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const cells = []; for (let i = 0; i < firstDay; i++) cells.push(null); for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div>
      <div className="ph"><div className="ph-eye">Módulo 7</div><div className="ph-title">Calendário de Conteúdo</div><div className="ph-desc">Planejamento de posts no LinkedIn.</div></div>
      <div className="pc">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="btn btn-g" onClick={() => setViewMonth(new Date(year, month - 1, 1))} style={{ padding: "6px 12px" }}>←</button>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{monthNames[month]} {year}</div>
            <button className="btn btn-g" onClick={() => setViewMonth(new Date(year, month + 1, 1))} style={{ padding: "6px 12px" }}>→</button>
          </div>
          <button className="btn btn-p" onClick={() => setShowAdd(!showAdd)}>+ Novo Post</button>
        </div>
        {showAdd && (
          <div className="card" style={{ borderColor: T.blue + "44", marginBottom: 20 }}>
            <div className="g2">
              <div className="fg"><label className="lbl">Título / Tema</label><input className="inp" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="fg"><label className="lbl">Data</label><input className="inp" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div className="fg"><label className="lbl">Observações</label><input className="inp" value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} placeholder="Formato, ângulo, CTA..." /></div>
            <div style={{ display: "flex", gap: 10 }}><button className="btn btn-p" onClick={add}>Salvar</button><button className="btn btn-g" onClick={() => setShowAdd(false)}>Cancelar</button></div>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
          {dayNames.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: T.textDim, padding: "6px 0" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayPosts = posts.filter(p => p.date === dateStr);
            const isToday = dateStr === today.toISOString().slice(0, 10);
            return (
              <div key={i} style={{ background: T.card, border: `1px solid ${isToday ? T.blue : T.border}`, borderRadius: 8, padding: "6px 7px", minHeight: 70 }}>
                <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 500, color: isToday ? T.accent : T.textMuted, marginBottom: 5 }}>{day}</div>
                {dayPosts.map(p => (
                  <div key={p.id} onClick={() => toggle(p.id)} style={{ background: p.done ? "#0D2A18" : T.blueDim, border: `1px solid ${p.done ? T.green + "44" : T.blue + "44"}`, borderRadius: 4, padding: "2px 5px", fontSize: 10, color: p.done ? T.greenLight : T.accent, marginBottom: 2, cursor: "pointer", textDecoration: p.done ? "line-through" : "none" }}>
                    {p.title.slice(0, 16)}{p.title.length > 16 ? "…" : ""}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MÓDULO REFERÊNCIAS ─────────────────────────────────────────────────────────
function ModuloReferencias({ contexto }) {
  return (
    <div>
      <div className="ph"><div className="ph-eye">Módulo 8</div><div className="ph-title">Referências e Benchmarks</div><div className="ph-desc">Análise de perfis e conteúdos que você admira no seu nicho.</div></div>
      <div className="pc">
        <AIBox title="Análise de Referência"
          minH={180}
          contexto={contexto}
          placeholder="Cole o conteúdo do perfil ou posts de alguém que você admira no seu nicho (headline, bio, exemplos de posts)..."
          system="Especialista em personal branding. Analisa perfis de referência identificando: posicionamento, tom de voz, estrutura de conteúdo, e padrões que tornam o perfil de destaque. Foco em extrair lições aplicáveis, não em copiar."
          buildPrompt={i => `Analise este perfil/conteúdo de referência:\n\n${i}\n\nIdentifique: 1) Posicionamento e diferencial 2) Padrões de comunicação 3) O que aprender e adaptar para o próprio perfil (sem copiar)`} />
      </div>
    </div>
  );
}

// ── MÓDULO DESENVOLVIMENTO PROFISSIONAL ────────────────────────────────────────
function ModuloDesenvolvimento({ plans, setPlans, contexto }) {
  const [tab, setTab] = useState("novo");
  const [form, setForm] = useState({ current: "", target: "", context: "" });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const system = `Você é especialista sênior em desenvolvimento de carreira e mapeamento de competências (skill gap analysis). Quando receber a situação atual de alguém e o cargo que ela almeja, faça uma análise completa e estruturada:

## Diagnóstico da Transição
Avalie a distância entre o cargo atual e o almejado: é um passo natural, um salto grande, ou uma mudança de área? Seja honesto sobre o tamanho do desafio.

## Competências que Já Possui
Liste as competências, experiências ou conhecimentos atuais da pessoa que já são relevantes e valorizados para o cargo almejado.

## Gaps Identificados
Liste especificamente o que falta — separando em categorias: Competências Técnicas (hard skills), Competências Comportamentais (soft skills), e Experiência/Vivência prática.

## Plano de Desenvolvimento
Para cada gap identificado, sugira um caminho concreto: tipo de curso, certificação reconhecida no mercado, ou forma de adquirir a experiência prática (projetos, voluntariado, mudança lateral). Priorize por ordem de impacto — o que resolver primeiro.

## Tempo Estimado
Dê uma estimativa realista de quanto tempo essa preparação levaria, considerando dedicação parcial (estudando nas horas livres).

Seja específico e prático. Não generalize com "estudar mais" — diga o quê estudar e onde encontrar.`;

  const run = async () => {
    if (!form.current.trim() || !form.target.trim()) return;
    setLoading(true); setOutput("");
    const prefix = buildContextPrefix(contexto);
    const prompt = `${prefix}Situação atual: ${form.current}\n\nCargo almejado: ${form.target}\n\nContexto adicional: ${form.context || "nenhum"}\n\nFaça a análise completa de gap e plano de desenvolvimento.`;
    try {
      const result = await callClaude(prompt, system);
      setOutput(result);
      setPlans(p => [{ id: Date.now(), date: today.toISOString().slice(0, 10), current: form.current, target: form.target, result }, ...p]);
    } catch { setOutput("Erro ao conectar com a IA."); }
    setLoading(false);
  };
  const copy = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div>
      <div className="ph"><div className="ph-eye">Módulo 9</div><div className="ph-title">Desenvolvimento Profissional</div><div className="ph-desc">Mapeie o caminho entre onde você está e onde quer chegar.</div></div>
      <div className="pc">
        <div className="tabs">
          {["novo", "historico"].map(t => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t === "novo" ? "Nova Análise" : `Histórico (${plans.length})`}</div>)}
        </div>

        {tab === "novo" && (
          <div className="ai-box">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 15 }}>✦</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.accent }}>Análise de Gap de Carreira</span>
            </div>
            <div className="fg">
              <label className="lbl">Onde você está hoje</label>
              <textarea className="ta" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} placeholder="Cargo atual, principais responsabilidades, tempo de experiência, ferramentas que domina, formação..." style={{ background: "#060E1A", border: `1px solid ${T.blue}44`, minHeight: 110 }} />
            </div>
            <div className="fg">
              <label className="lbl">Cargo que você almeja</label>
              <input className="inp" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} placeholder="Ex: Coordenadora de Growth, Analista de BI Sênior..." style={{ background: "#060E1A", border: `1px solid ${T.blue}44` }} />
            </div>
            <div className="fg">
              <label className="lbl">Contexto adicional (opcional)</label>
              <textarea className="ta" value={form.context} onChange={e => setForm({ ...form, context: e.target.value })} placeholder="Prazo que você tem em mente, restrições de tempo/dinheiro para estudar, área de interesse específica..." style={{ background: "#060E1A", border: `1px solid ${T.blue}44`, minHeight: 70 }} />
            </div>
            <button className="btn btn-p" onClick={run} disabled={loading}>
              {loading ? <span className="loading-dots">Analisando</span> : "→ Gerar Plano de Desenvolvimento"}
            </button>
            {output && (
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginTop: 16, maxHeight: 520, overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 10 }}>
                  <button className="btn btn-g" onClick={() => exportToPDF("Plano de Desenvolvimento", `<h1>Plano de Desenvolvimento</h1><p><strong>De:</strong> ${form.current}</p><p><strong>Para:</strong> ${form.target}</p><hr/>${mdToHTML(output)}`)} style={{ padding: "5px 12px", fontSize: 11 }}>⬇ Exportar PDF</button>
                  <button className="btn btn-g" onClick={() => copy(output)} style={{ padding: "5px 12px", fontSize: 11 }}>{copied ? "✓ Copiado" : "Copiar"}</button>
                </div>
                {renderMD(output)}
              </div>
            )}
          </div>
        )}

        {tab === "historico" && (
          <div>
            {plans.length === 0 && <div className="es"><div style={{ fontSize: 28, marginBottom: 10 }}>📈</div><div>Nenhuma análise gerada ainda</div></div>}
            {plans.map(p => (
              <div key={p.id} className="card" style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div className="card-t">{p.current.slice(0, 50)}{p.current.length > 50 ? "…" : ""} → {p.target}</div>
                    <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>{fmt(p.date)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-g" onClick={() => exportToPDF("Plano de Desenvolvimento", `<h1>Plano de Desenvolvimento</h1><p><strong>De:</strong> ${p.current}</p><p><strong>Para:</strong> ${p.target}</p><hr/>${mdToHTML(p.result)}`)} style={{ padding: "5px 12px", fontSize: 11 }}>⬇ PDF</button>
                    <button className="btn btn-g" onClick={() => copy(p.result)} style={{ padding: "5px 12px", fontSize: 11 }}>Copiar</button>
                  </div>
                </div>
                <details>
                  <summary style={{ cursor: "pointer", fontSize: 12, color: T.accent }}>Ver análise completa</summary>
                  <div style={{ marginTop: 12, maxHeight: 400, overflowY: "auto" }}>{renderMD(p.result)}</div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MÓDULO COMPARADOR CURRÍCULO VS VAGA ────────────────────────────────────────
function ModuloComparador({ curriculoTexto, vagaContexto }) {
  const [resume, setResume] = useState(curriculoTexto || "");
  const [jobDesc, setJobDesc] = useState(vagaContexto ? `Empresa: ${vagaContexto.company}\nCargo: ${vagaContexto.role}\n\n${vagaContexto.description}` : "");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (curriculoTexto) setResume(curriculoTexto); }, [curriculoTexto]);
  useEffect(() => { if (vagaContexto) setJobDesc(`Empresa: ${vagaContexto.company}\nCargo: ${vagaContexto.role}\n\n${vagaContexto.description}`); }, [vagaContexto]);

  const system = `Você é especialista sênior em recrutamento e ATS. Compare um currículo específico com uma vaga específica e dê uma análise cirúrgica de compatibilidade.

## Score de Compatibilidade
Dê uma nota de 0 a 100 indicando a aderência do currículo a essa vaga específica.

## Pontos de Match
Liste o que no currículo já atende diretamente aos requisitos da vaga.

## Gaps em Relação à Vaga
Liste requisitos da vaga que o currículo não atende ou não evidencia bem.

## Palavras-Chave Faltantes
Liste termos exatos da descrição da vaga que não aparecem no currículo e que sistemas ATS provavelmente buscam.

## Ajustes Recomendados
Sugira 3-5 ajustes específicos e práticos no currículo para aumentar a aderência a essa vaga (não é para reescrever do zero, é para adaptar).`;

  const run = async () => {
    if (!resume.trim() || !jobDesc.trim()) return;
    setLoading(true); setOutput("");
    try { setOutput(await callClaude(`CURRÍCULO:\n${resume}\n\n---\n\nDESCRIÇÃO DA VAGA:\n${jobDesc}`, system)); }
    catch { setOutput("Erro ao conectar com a IA."); }
    setLoading(false);
  };
  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div>
      <div className="ph"><div className="ph-eye">Módulo 10</div><div className="ph-title">Comparador Currículo vs Vaga</div><div className="ph-desc">Análise cirúrgica de compatibilidade para uma vaga específica.</div></div>
      <div className="pc">
        {(curriculoTexto || vagaContexto) && (
          <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {curriculoTexto && <span className="tag tag-g">✓ Currículo salvo carregado</span>}
            {vagaContexto && <span className="tag tag-b">Vaga: {vagaContexto.company} — {vagaContexto.role}</span>}
          </div>
        )}
        <div className="ai-box">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 15 }}>✦</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.accent }}>Comparação de Compatibilidade</span>
          </div>
          <div className="g2">
            <div className="fg">
              <label className="lbl">Seu Currículo</label>
              <textarea className="ta" value={resume} onChange={e => setResume(e.target.value)} placeholder="Cole o texto do seu currículo..." style={{ background: "#060E1A", border: `1px solid ${T.blue}44`, minHeight: 220 }} />
            </div>
            <div className="fg">
              <label className="lbl">Descrição da Vaga</label>
              <textarea className="ta" value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Cole a descrição completa da vaga..." style={{ background: "#060E1A", border: `1px solid ${T.blue}44`, minHeight: 220 }} />
            </div>
          </div>
          <button className="btn btn-p" onClick={run} disabled={loading} style={{ marginTop: 6 }}>
            {loading ? <span className="loading-dots">Comparando</span> : "→ Comparar com IA"}
          </button>
          {output && (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginTop: 16, maxHeight: 520, overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 10 }}>
                <button className="btn btn-g" onClick={() => exportToPDF("Comparação Currículo x Vaga", `<h1>Comparação Currículo x Vaga</h1>${mdToHTML(output)}`)} style={{ padding: "5px 12px", fontSize: 11 }}>⬇ Exportar PDF</button>
                <button className="btn btn-g" onClick={copy} style={{ padding: "5px 12px", fontSize: 11 }}>{copied ? "✓ Copiado" : "Copiar"}</button>
              </div>
              {renderMD(output)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MÓDULO PORTFÓLIO ───────────────────────────────────────────────────────────
function ModuloPortfolio({ cases, setCases, contexto, onUseInCurriculo }) {
  const [tab, setTab] = useState("roteiro");
  const [roteiroOutput, setRoteiroOutput] = useState("");
  const [roteiroLoading, setRoteiroLoading] = useState(false);
  const [roteiroInput, setRoteiroInput] = useState("");
  const [roteiroCopied, setRoteiroCopied] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const emptyCaseForm = { title: "", cliente: "", problema: "", plataformas: "", estrategia: "", execucao: "", resultado: "", obstaculos: "" };
  const [caseForm, setCaseForm] = useState(emptyCaseForm);
  const [sentFlash, setSentFlash] = useState(null);

  const systemRoteiro = `Você é especialista em personal branding e portfólios para profissionais de marketing digital, com foco em tráfego pago e growth/performance. Quando receber a área de atuação e contexto de experiência da pessoa, gere um roteiro estratégico de portfólio.

## Estrutura Recomendada
Liste as seções que o portfólio deve ter, na ordem ideal (ex: introdução/posicionamento, cases, habilidades técnicas, ferramentas, contato).

## O Que Vender Como Resultado
Para o nicho de tráfego pago/growth especificamente, explique que tipos de prova de resultado têm mais peso (métricas como CPL, ROAS, CTR, taxa de conversão, redução de CAC, crescimento de base) e como apresentar resultado mesmo quando a pessoa não tem números exatos guardados (ex: usar percentual de melhoria, comparação antes/depois, escala do projeto).

## Quantidade e Tipo de Cases
Recomende quantos cases mostrar e que variedade é ideal (ex: um case de cada tipo de campanha, um de virada de resultado, um de projeto do zero).

## Erros Comuns a Evitar
Liste o que normalmente faz um portfólio de tráfego pago/growth parecer fraco ou genérico.

Seja específico para o nicho mencionado pela pessoa, não genérico.`;

  const runRoteiro = async () => {
    if (!roteiroInput.trim()) return;
    setRoteiroLoading(true); setRoteiroOutput("");
    const prefix = buildContextPrefix(contexto);
    try { setRoteiroOutput(await callClaude(`${prefix}Área de atuação e contexto: ${roteiroInput}`, systemRoteiro)); }
    catch { setRoteiroOutput("Erro ao conectar com a IA."); }
    setRoteiroLoading(false);
  };
  const copyRoteiro = () => { navigator.clipboard.writeText(roteiroOutput); setRoteiroCopied(true); setTimeout(() => setRoteiroCopied(false), 2000); };

  const systemCase = `Você é especialista em redação de cases de portfólio para profissionais de tráfego pago e growth/performance marketing. Você vai receber respostas estruturadas (não um texto livre) a um questionário específico do nicho. Transforme essas respostas em um case de portfólio persuasivo, seguindo o formato:

## Contexto
O cenário inicial: que tipo de cliente/projeto, qual era o problema ou objetivo. Use a resposta sobre cliente/contexto e problema.

## Estratégia
O que foi planejado e por quê. Use a resposta sobre estratégia.

## Execução
O que foi feito na prática: plataformas, segmentações, criativos, testes. Use as respostas sobre plataformas e execução.

## Resultado
A prova de impacto, com base na resposta sobre resultado. Se a pessoa não informou números exatos, transforme o que ela disse em linguagem qualitativa honesta de impacto (ex: "redução perceptível no custo de aquisição"), sem jamais inventar números, percentuais ou nomes que não foram fornecidos.

## Como Lidar com Obstáculos (se mencionados)
Se a pessoa mencionou dificuldades ou limitações no projeto, incorpore isso como parte da narrativa de forma que mostre capacidade de resolução de problema, não como desculpa.

## Título Sugerido para o Case
Um título curto e direto para usar no portfólio, baseado no título fornecido ou sugerindo um melhor se o campo estiver vazio.

Regra absoluta: nunca invente dados específicos (números, nomes de empresas, métricas) que não foram fornecidos pela pessoa nas respostas.`;

  const buildCasePrompt = (f) => `Respostas do questionário de case de portfólio:

1. Cliente/projeto e contexto: ${f.cliente || "não informado"}
2. Qual era o problema ou objetivo: ${f.problema || "não informado"}
3. Plataformas e ferramentas usadas: ${f.plataformas || "não informado"}
4. Estratégia adotada e por quê: ${f.estrategia || "não informado"}
5. O que foi executado na prática (segmentações, criativos, testes): ${f.execucao || "não informado"}
6. Resultado obtido (números exatos se tiver, ou percepção de impacto se não tiver): ${f.resultado || "não informado"}
7. Obstáculos enfrentados (opcional): ${f.obstaculos || "nenhum mencionado"}
8. Título sugerido pela pessoa (opcional): ${f.title || "nenhum, sugira um"}`;

  const runCase = async () => {
    if (!caseForm.cliente.trim() && !caseForm.problema.trim() && !caseForm.resultado.trim()) return;
    setCaseLoading(true);
    try {
      const result = await callClaude(buildCasePrompt(caseForm), systemCase);
      if (editId) {
        setCases(p => p.map(c => c.id === editId ? { ...c, title: caseForm.title || "Case sem título", form: caseForm, result } : c));
      } else {
        setCases(p => [...p, { id: Date.now(), title: caseForm.title || "Case sem título", form: caseForm, result, date: today.toISOString().slice(0, 10) }]);
      }
      setCaseForm(emptyCaseForm); setEditId(null); setShowAdd(false);
    } catch {}
    setCaseLoading(false);
  };
  const startEditCase = (c) => { setCaseForm(c.form || emptyCaseForm); setEditId(c.id); setShowAdd(true); };
  const cancelCaseForm = () => { setShowAdd(false); setEditId(null); setCaseForm(emptyCaseForm); };
  const removeCase = (id) => setCases(p => p.filter(c => c.id !== id));
  const copyCase = (text) => navigator.clipboard.writeText(text);

  const exportFullPortfolio = () => {
    const html = cases.map(c => `<h2>${c.title}</h2>${mdToHTML(c.result)}<hr/>`).join("");
    exportToPDF("Meu Portfólio", `<h1>Portfólio</h1>${html}`);
  };

  const questions = [
    { key: "cliente", label: "Cliente ou projeto — quem era e em que contexto", placeholder: "Ex: cliente de e-commerce de moda, projeto que assumi sozinha na agência..." },
    { key: "problema", label: "Qual era o problema ou objetivo no início", placeholder: "Ex: CPL muito alto, baixa geração de leads, lançamento de produto novo..." },
    { key: "plataformas", label: "Quais plataformas e ferramentas você usou", placeholder: "Ex: Meta Ads, Google Ads, LinkedIn Ads, Google Analytics..." },
    { key: "estrategia", label: "Qual foi a estratégia que você definiu e por quê", placeholder: "Ex: decidi testar funil de remarketing porque o tráfego frio não convertia..." },
    { key: "execucao", label: "O que você fez na prática (segmentações, criativos, testes)", placeholder: "Ex: testei 3 públicos diferentes, criei 5 variações de criativo, ajustei lances..." },
    { key: "resultado", label: "Qual foi o resultado (número exato se tiver, ou a percepção de impacto se não tiver)", placeholder: "Ex: CPL caiu de R$40 para R$25, ou: 'o custo por lead caiu bastante e o cliente renovou o contrato'..." },
    { key: "obstaculos", label: "Teve algum obstáculo no caminho? (opcional)", placeholder: "Ex: budget baixo, prazo curto, pouca informação do cliente sobre o público..." },
  ];

  return (
    <div>
      <div className="ph"><div className="ph-eye">Módulo 11</div><div className="ph-title">Gerador de Portfólio</div><div className="ph-desc">Roteiro estratégico e construção de cases para tráfego pago e growth.</div></div>
      <div className="pc">
        <div className="tabs">
          {["roteiro", "cases"].map(t => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t === "roteiro" ? "Roteiro de Portfólio" : `Meus Cases (${cases.length})`}</div>)}
        </div>

        {tab === "roteiro" && (
          <div className="ai-box">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 15 }}>✦</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.accent }}>Roteiro Estratégico de Portfólio</span>
            </div>
            <textarea className="ta" placeholder="Descreva sua área de atuação e contexto: ex. 'Analista de tráfego pago e growth, 2 anos de experiência, já trabalhei com Meta Ads e Google Ads para empresas B2B e e-commerce, quero focar em vagas de growth marketing'..." value={roteiroInput} onChange={e => setRoteiroInput(e.target.value)} style={{ background: "#060E1A", border: `1px solid ${T.blue}44`, minHeight: 130 }} />
            <button className="btn btn-p" onClick={runRoteiro} disabled={roteiroLoading} style={{ marginTop: 10 }}>
              {roteiroLoading ? <span className="loading-dots">Gerando</span> : "→ Gerar Roteiro com IA"}
            </button>
            {roteiroOutput && (
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginTop: 14, maxHeight: 520, overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 10 }}>
                  <button className="btn btn-g" onClick={() => exportToPDF("Roteiro de Portfólio", `<h1>Roteiro de Portfólio</h1>${mdToHTML(roteiroOutput)}`)} style={{ padding: "5px 12px", fontSize: 11 }}>⬇ Exportar PDF</button>
                  <button className="btn btn-g" onClick={copyRoteiro} style={{ padding: "5px 12px", fontSize: 11 }}>{roteiroCopied ? "✓ Copiado" : "Copiar"}</button>
                </div>
                {renderMD(roteiroOutput)}
              </div>
            )}
          </div>
        )}

        {tab === "cases" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <div className="st" style={{ margin: 0 }}>Cases Construídos</div>
              <div style={{ display: "flex", gap: 8 }}>
                {cases.length > 0 && <button className="btn btn-a" onClick={exportFullPortfolio}>⬇ Exportar Portfólio Completo</button>}
                <button className="btn btn-p" onClick={() => showAdd ? cancelCaseForm() : setShowAdd(true)}>+ Novo Case</button>
              </div>
            </div>
            {showAdd && (
              <div className="card" style={{ marginBottom: 20, borderColor: T.blue + "55" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: T.accent }}>{editId ? "Editar Case" : "Construir Novo Case"}</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Responda o que souber. Não precisa ter número exato em tudo — a IA sabe lidar com respostas aproximadas.</div>
                <div className="fg">
                  <label className="lbl">Título do case (opcional, a IA sugere um se deixar vazio)</label>
                  <input className="inp" value={caseForm.title} onChange={e => setCaseForm({ ...caseForm, title: e.target.value })} placeholder="Ex: Campanha de Leads B2B para Software de RH" />
                </div>
                {questions.map(q => (
                  <div key={q.key} className="fg">
                    <label className="lbl">{q.label}</label>
                    <textarea className="ta" value={caseForm[q.key]} onChange={e => setCaseForm({ ...caseForm, [q.key]: e.target.value })} placeholder={q.placeholder} style={{ minHeight: 64 }} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-p" onClick={runCase} disabled={caseLoading}>{caseLoading ? <span className="loading-dots">Construindo</span> : "Gerar Case com IA"}</button>
                  <button className="btn btn-g" onClick={cancelCaseForm}>Cancelar</button>
                </div>
              </div>
            )}
            {cases.length === 0 && !showAdd && <div className="es"><div style={{ fontSize: 28, marginBottom: 10 }}>🗂️</div><div>Nenhum case construído ainda</div></div>}
            {cases.map(c => (
              <div key={c.id} className="card" style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div className="card-t">{c.title}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {onUseInCurriculo && (
                      <button className="btn btn-a" onClick={() => { onUseInCurriculo(c); setSentFlash(c.id); setTimeout(() => setSentFlash(null), 2500); }} style={{ padding: "5px 10px", fontSize: 11 }}>
                        {sentFlash === c.id ? "✓ Enviado" : "★ Usar no Currículo"}
                      </button>
                    )}
                    <button className="btn btn-g" onClick={() => startEditCase(c)} style={{ padding: "5px 10px", fontSize: 11 }}>✎ Editar</button>
                    <button className="btn btn-g" onClick={() => copyCase(c.result)} style={{ padding: "5px 10px", fontSize: 11 }}>Copiar</button>
                    <button onClick={() => removeCase(c.id)} style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer" }}>✕</button>
                  </div>
                </div>
                <details>
                  <summary style={{ cursor: "pointer", fontSize: 12, color: T.accent }}>Ver case completo</summary>
                  <div style={{ marginTop: 12, maxHeight: 400, overflowY: "auto" }}>{renderMD(c.result)}</div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────────
function AppContent({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [profiles, setProfiles] = useSupabaseStorage(user.id, "car_profiles", [{ id: 1, name: "Meu Perfil", onboarded: false }]);
  const [activeProfile, setActiveProfile] = useSupabaseStorage(user.id, "car_active_profile", 1);
  const [vagaAtiva, setVagaAtiva] = useState(null); // vaga selecionada para navegação cross-módulo

  const pKey = (k) => `car_${k}_${activeProfile}`;
  const [vagas, setVagas] = useSupabaseStorage(user.id, pKey("vagas"), []);
  const [conquistas, setConquistas] = useSupabaseStorage(user.id, pKey("conquistas"), []);
  const [posts, setPosts] = useSupabaseStorage(user.id, pKey("posts"), []);
  const [resumeScore, setResumeScore] = useSupabaseStorage(user.id, pKey("score"), null);
  const [scoreHistory, setScoreHistory] = useSupabaseStorage(user.id, pKey("scoreHistory"), []);
  const [plans, setPlans] = useSupabaseStorage(user.id, pKey("plans"), []);
  const [cases, setCases] = useSupabaseStorage(user.id, pKey("cases"), []);
  const [curriculoTexto, setCurriculoTexto] = useSupabaseStorage(user.id, pKey("curriculoTexto"), "");
  const [pendingCurriculoAddition, setPendingCurriculoAddition] = useState(null);
  const [editingContext, setEditingContext] = useState(false);

  const activeProfileObj = profiles.find(p => p.id === activeProfile);
  const profileName = activeProfileObj?.name || "Meu Perfil";
  const needsOnboarding = activeProfileObj && !activeProfileObj.onboarded;
  const contexto = activeProfileObj?.contexto || null;

  const completeOnboarding = (form) => {
    setProfiles(p => p.map(pr => pr.id === activeProfile ? { ...pr, onboarded: true, contexto: form } : pr));
    setPage("dashboard");
  };
  const skipOnboarding = () => {
    setProfiles(p => p.map(pr => pr.id === activeProfile ? { ...pr, onboarded: true } : pr));
  };
  const saveEditedContext = (form) => {
    setProfiles(p => p.map(pr => pr.id === activeProfile ? { ...pr, contexto: form } : pr));
    setEditingContext(false);
  };

  // Navegação vaga → módulo (hub central)
  const goToCarta = (v) => { setVagaAtiva(v); setPage("carta"); };
  const goToComparador = (v) => { setVagaAtiva(v); setPage("comparador"); };
  const goToEntrevista = (v) => { setVagaAtiva(v); setPage("entrevista"); };

  // "Usar este case no currículo": leva o resultado do case para o gerador de currículo
  const goUseInCurriculo = (caseObj) => {
    setPendingCurriculoAddition(caseObj.result);
    setPage("curriculo");
  };

  // Indicadores de perfil incompleto
  const daysSince = (dateStr) => dateStr ? Math.round((today - new Date(dateStr)) / 86400000) : null;
  const lastScoreDate = scoreHistory.length ? scoreHistory[scoreHistory.length - 1].date : null;
  const lastConquistaDate = conquistas.length ? conquistas.map(c => c.date).sort().reverse()[0] : null;
  const alerts = [];
  if (!curriculoTexto) alerts.push("Você ainda não tem um currículo salvo no sistema — gere ou cole um no Módulo 1.");
  else if (lastScoreDate === null || daysSince(lastScoreDate) > 60) alerts.push("Seu currículo não é analisado há mais de 60 dias — pode estar desatualizado.");
  if (conquistas.length === 0) alerts.push("Nenhuma conquista registrada ainda — comece a anotar resultados no Módulo 6.");
  else if (daysSince(lastConquistaDate) > 45) alerts.push("Você não registra uma conquista nova há mais de 45 dias.");
  if (cases.length === 0) alerts.push("Seu portfólio ainda não tem nenhum case construído — comece pelo Módulo 11.");

  const nav = [
    { section: "VISÃO GERAL", items: [{ id: "dashboard", icon: "📊", label: "Dashboard" }] },
    { section: "MÓDULOS", items: [
      { id: "curriculo", icon: "📄", label: "Módulo 1 · Currículo" },
      { id: "linkedin", icon: "💼", label: "Módulo 2 · LinkedIn" },
      { id: "vagas", icon: "🎯", label: "Módulo 3 · Vagas", badge: vagas.length || null },
      { id: "entrevista", icon: "🎤", label: "Módulo 4 · Entrevista" },
      { id: "carta", icon: "✉️", label: "Módulo 5 · Carta" },
      { id: "conquistas", icon: "🏆", label: "Módulo 6 · Conquistas", badge: conquistas.length || null },
      { id: "calendario", icon: "📅", label: "Modulo 7 - Calendario" },
      { id: "referencias", icon: "🔍", label: "Módulo 8 · Referências" },
      { id: "desenvolvimento", icon: "📈", label: "Módulo 9 · Desenvolvimento", badge: plans.length || null },
      { id: "comparador", icon: "⚖️", label: "Módulo 10 · Comparador" },
      { id: "portfolio", icon: "🗂️", label: "Módulo 11 · Portfólio", badge: cases.length || null },
    ]},
  ];

  const navigateTo = (id) => {
    if (id !== "carta" && id !== "comparador" && id !== "entrevista") setVagaAtiva(null);
    setEditingContext(false);
    setPage(id);
  };

  const renderPage = () => {
    if (editingContext) {
      return <Onboarding profileName={profileName} initialValues={contexto || { area: "", senioridade: "Júnior", objetivo: "", contexto: "" }} isEdit onComplete={saveEditedContext} onSkip={() => setEditingContext(false)} />;
    }
    if (needsOnboarding && page === "dashboard") {
      return <Onboarding profileName={profileName} onComplete={completeOnboarding} onSkip={skipOnboarding} />;
    }
    switch (page) {
      case "dashboard": return <Dashboard vagas={vagas} conquistas={conquistas} resumeScore={resumeScore} scoreHistory={scoreHistory} profileName={profileName} alerts={alerts} onGoTo={navigateTo} />;
      case "curriculo": return <ModuloCurriculo resumeScore={resumeScore} setResumeScore={setResumeScore} scoreHistory={scoreHistory} setScoreHistory={setScoreHistory} curriculoTexto={curriculoTexto} setCurriculoTexto={setCurriculoTexto} contexto={contexto} pendingAddition={pendingCurriculoAddition} clearPendingAddition={() => setPendingCurriculoAddition(null)} />;
      case "linkedin": return <ModuloLinkedin contexto={contexto} />;
      case "vagas": return <ModuloVagas vagas={vagas} setVagas={setVagas} onUseInCarta={goToCarta} onUseInComparador={goToComparador} onUseInEntrevista={goToEntrevista} />;
      case "entrevista": return <ModuloEntrevista contexto={contexto} vagaContexto={vagaAtiva} />;
      case "carta": return <ModuloCarta contexto={contexto} vagaContexto={vagaAtiva} curriculoTexto={curriculoTexto} />;
      case "conquistas": return <ModuloConquistas conquistas={conquistas} setConquistas={setConquistas} />;
      case "calendario": return <CalendarioConteudo posts={posts} setPosts={setPosts} />;
      case "referencias": return <ModuloReferencias contexto={contexto} />;
      case "desenvolvimento": return <ModuloDesenvolvimento plans={plans} setPlans={setPlans} contexto={contexto} />;
      case "comparador": return <ModuloComparador curriculoTexto={curriculoTexto} vagaContexto={vagaAtiva} />;
      case "portfolio": return <ModuloPortfolio cases={cases} setCases={setCases} contexto={contexto} onUseInCurriculo={goUseInCurriculo} />;
      default: return <Dashboard vagas={vagas} conquistas={conquistas} resumeScore={resumeScore} scoreHistory={scoreHistory} profileName={profileName} alerts={alerts} onGoTo={navigateTo} />;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-text">Sistema Carreira</div>
            <div className="logo-sub">Desenvolvimento · IA</div>
          </div>
          <ProfileSelector profiles={profiles} activeProfile={activeProfile} setActiveProfile={setActiveProfile} setProfiles={setProfiles} onEditContext={() => setEditingContext(true)} userEmail={user.email} onLogout={onLogout} />
          {nav.map(section => (
            <div key={section.section} className="sidebar-section">
              <div className="sidebar-label">{section.section}</div>
              {section.items.map(item => (
                <div key={item.id} className={`sidebar-item ${page === item.id ? "active" : ""}`} onClick={() => navigateTo(item.id)}>
                  <span className="icon">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge ? <span className="badge">{item.badge}</span> : null}
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: "auto", padding: "14px 20px", borderTop: `1px solid ${T.border}` }}>
            {alerts.length > 0 && (
              <div style={{ background: T.blueDim, border: `1px solid ${T.blue}44`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#93C5FD", marginBottom: 4 }}>⚠ {alerts.length} pendência{alerts.length > 1 ? "s" : ""}</div>
                <div style={{ fontSize: 10.5, color: T.textMuted }}>Veja detalhes no Dashboard</div>
              </div>
            )}
            <div style={{ fontSize: 11, color: T.textDim, textAlign: "center" }}>{vagas.length} vagas · {conquistas.length} conquistas</div>
          </div>
        </div>
        <div className="main">{renderPage()}</div>
      </div>
    </>
  );
}

// ── APP RAIZ (GERENCIA SESSÃO DE LOGIN) ───────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined); // undefined = carregando, null = não logado, objeto = logado
  const [checking, setChecking] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPasswordRecovery(false);
  };

  if (checking) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, color: T.textDim, fontSize: 13 }}>
          Carregando...
        </div>
      </>
    );
  }

  if (passwordRecovery) {
    return (
      <>
        <style>{css}</style>
        <ResetPasswordScreen onDone={() => setPasswordRecovery(false)} />
      </>
    );
  }

  if (!session) {
    return (
      <>
        <style>{css}</style>
        <LoginScreen onLoggedIn={(user) => setSession({ user })} />
      </>
    );
  }

  return <AppContent user={session.user} onLogout={handleLogout} />;
}
