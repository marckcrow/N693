import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

/* --------- Gate de autenticação --------- */
function AuthGate({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!session)
    return (
      <div style={{ maxWidth: 420, margin: "40px auto" }}>
        <h2 style={{ marginBottom: 12 }}>Entrar</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      </div>
    );

  return children;
}

/* --------- Templates --------- */
function Templates() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setItems(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // pega org do profile
    const { data: prof, error: errProf } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (errProf || !prof) {
      alert(
        "Crie seu registro em 'profiles' no Supabase (user_id, org_id, role)."
      );
      return;
    }

    const { error: errIns } = await supabase.from("templates").insert({
      org_id: prof.org_id,
      name,
      content_md: content,
    });
    if (errIns) {
      alert("Erro ao salvar template: " + errIns.message);
      return;
    }

    setName("");
    setContent("");
    load();
  };

  return (
    <section className="section">
      <div className="h2">Templates</div>
      <div className="row">
        <input
          className="input"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn" onClick={add}>
          Salvar
        </button>
      </div>
      <textarea
        className="textarea mt-2"
        placeholder="Conteúdo MD"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <ul className="list mt-3">
        {items.map((t) => (
          <li key={t.id} className="item">
            <span>{t.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* --------- Contratos --------- */
function Contracts() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [list, setList] = useState([]);

  const load = async () => {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setList(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: prof, error: errProf } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (errProf || !prof) {
      alert(
        "Crie seu registro em 'profiles' no Supabase (user_id, org_id, role)."
      );
      return;
    }

    const { error: errIns } = await supabase.from("contracts").insert({
      org_id: prof.org_id,
      title,
      content_md: content,
      status: "draft",
    });

    if (errIns) {
      alert("Erro ao criar contrato: " + errIns.message);
      return;
    }

    setTitle("");
    setContent("");
    load();
  };

  return (
    <section className="section">
      <div className="h2">Contratos</div>
      <input
        className="input"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="textarea mt-2"
        placeholder="Conteúdo"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button className="btn mt-2" onClick={create}>
        Criar
      </button>
      <ul className="list mt-3">
        {list.map((c) => (
          <li key={c.id} className="item">
            <div>
              <div style={{ fontWeight: 700 }}>{c.title}</div>
              <div style={{ opacity: 0.7, fontSize: 13 }}>
                Status: {c.status}
              </div>
            </div>
            <button
              className="btn outline"
              onClick={() => (window.location.hash = `#/sign/${c.id}`)}
            >
              Assinar
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* --------- Assinatura --------- */
function Sign() {
  // espera formato "#/sign/<uuid>"
  const raw = window.location.hash.replace("#/", "");
  const maybeId = raw.startsWith("sign/") ? raw.split("/")[1] : null;

  const [contract, setContract] = useState(null);
  const [state, setState] = useState({ loading: !!maybeId, error: null });

  useEffect(() => {
    if (!maybeId) return; // sem id, não busca
    (async () => {
      setState({ loading: true, error: null });
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", maybeId)
        .single();
      if (error) setState({ loading: false, error: error.message });
      else { setContract(data); setState({ loading: false, error: null }); }
    })();
  }, [maybeId]);

  const sign = async () => {
    if (!contract) return;
    const { data: { user } } = await supabase.auth.getUser();

    const encoder = new TextEncoder();
    const bytes = encoder.encode(
      `${contract.id}|${user.id}|${new Date().toISOString()}|${contract.content_md}`
    );
    const hashBuf = await crypto.subtle.digest("SHA-256", bytes);
    const hash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,"0")).join("");

    await supabase.from("signatures").insert({
      contract_id: contract.id,
      participant_email: user.email,
      signer_user_id: user.id,
      signer_ip: "client",
      user_agent: navigator.userAgent,
      signature_hash: hash
    });
    await supabase.from("contracts").update({ status:'signed', pdf_hash_sha256: hash }).eq("id", contract.id);
    alert("Assinado!");
  };

  // Sem id no hash -> instrução amigável
  if (!maybeId) {
    return (
      <section className="section">
        <div className="h2">Assinar</div>
        <p>Abra esta tela pelo botão <b>Assinar</b> em <b>Contratos</b>.</p>
      </section>
    );
  }

  if (state.loading) return <section className="section">Carregando…</section>;
  if (state.error) return (
    <section className="section">
      <div className="h2">Erro</div>
      <pre className="textarea" style={{whiteSpace:"pre-wrap"}}>{state.error}</pre>
    </section>
  );

  return (
    <section className="section">
      <div className="h2">Assinar: {contract.title}</div>
      <pre className="textarea" style={{whiteSpace:"pre-wrap"}}>{contract.content_md}</pre>
      <button className="btn mt-3" onClick={sign}>Assinar</button>
    </section>
  );
}


/* --------- App --------- */
export default function App() {
  const [tab, setTab] = useState("templates");

  useEffect(() => {
    const onHash = () => {
      const x = location.hash.replace("#/", "");
      if (x.startsWith("sign/")) setTab("sign");
    };
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <AuthGate>
      <div className="app">
        <div className="h1">Contratos Seguros</div>
        <nav className="nav">
          <button
            className={`tab ${tab === "templates" ? "active" : ""}`}
            onClick={() => setTab("templates")}
          >
            Templates
          </button>
          <button
            className={`tab ${tab === "contracts" ? "active" : ""}`}
            onClick={() => setTab("contracts")}
          >
            Contratos
          </button>
          <button
            className={`tab ${tab === "sign" ? "active" : ""}`}
            onClick={() => setTab("sign")}
          >
            Assinar
          </button>
        </nav>

        {tab === "templates" && <Templates />}
        {tab === "contracts" && <Contracts />}
        {tab === "sign" && <Sign />}
      </div>
    </AuthGate>
  );
}
