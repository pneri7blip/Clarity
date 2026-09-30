import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { BriefcaseBusiness, FileUp, LockKeyhole, Plus, RefreshCw, ShieldCheck, Upload, UserRound } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { formatEuro } from "@shared/finance";

export default function Portfolio() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/portfolio" });
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [newProfileName, setNewProfileName] = useState("");
  const [message, setMessage] = useState("");
  const profilesQuery = trpc.profile.list.useQuery(undefined, { enabled: Boolean(user), staleTime: 30_000 });
  const profiles = profilesQuery.data ?? [];
  const activeKey = selectedKey || profiles[0]?.profileKey || "";
  const positionsQuery = trpc.portfolio.list.useQuery({ profileKey: activeKey }, { enabled: Boolean(activeKey), staleTime: 30_000 });
  const saveProfile = trpc.profile.save.useMutation({ onSuccess: () => { profilesQuery.refetch(); setNewProfileName(""); setMessage("Profilo creato."); } });
  const importPositions = trpc.portfolio.import.useMutation({ onSuccess: (result) => { positionsQuery.refetch(); setMessage(`${result.count} righe importate.`); } });
  const positions = positionsQuery.data ?? [];
  const invested = useMemo(() => positions.reduce((sum, item) => sum + Number(item.quantity) * Number(item.averagePrice), 0), [positions]);

  const createProfile = () => {
    const name = newProfileName.trim();
    if (!name || !user) return;
    const key = `${user.openId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    saveProfile.mutate({ profileKey: key, name, goal: "Gestire meglio i risparmi", horizon: "Oltre 7 anni", risk: "Accetto oscillazioni moderate" });
    setSelectedKey(key);
  };

  const importCsv = (file?: File) => {
    if (!file || !activeKey) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const rows = lines.slice(lines[0]?.toLowerCase().startsWith("symbol") ? 1 : 0).map((line) => line.split(",").map((cell) => cell.trim())).filter((cells) => cells.length >= 3 && cells[0]);
      importPositions.mutate({ profileKey: activeKey, positions: rows.map(([symbol, quantity, averagePrice, currency]) => ({ symbol: symbol.toUpperCase(), quantity, averagePrice, currency: currency || "EUR" })) });
    };
    reader.readAsText(file);
  };

  if (loading) return <div className="portfolio-loading">Caricamento area privata…</div>;
  if (!user) return null;

  return <div className="portfolio-shell"><header className="portfolio-topbar"><Link href="/" className="portfolio-back">← Torna a Clarity</Link><div className="planner-brand"><span className="brand-mark"><span /></span> Clarity<span>.</span></div><span className="portfolio-private"><LockKeyhole size={13} /> Area privata</span></header><main className="portfolio-page"><div className="portfolio-heading"><div><span className="analysis-eyebrow"><BriefcaseBusiness size={14} /> Portafoglio</span><h1>Il tuo patrimonio, senza fogli sparsi.</h1><p>Gestisci più profili, importa le posizioni e prepara una base ordinata per analisi e alert.</p></div><div className="portfolio-user"><UserRound size={16} /> {user.name ?? user.email ?? "Utente"}</div></div><section className="profile-switcher"><div><span className="analysis-eyebrow">Profili investitore</span><strong>Scegli il contesto da analizzare</strong></div><div className="profile-actions"><select value={activeKey} onChange={(event) => setSelectedKey(event.target.value)}><option value="">Nessun profilo</option>{profiles.map((profile) => <option key={profile.profileKey} value={profile.profileKey}>{profile.name}</option>)}</select><input value={newProfileName} onChange={(event) => setNewProfileName(event.target.value)} placeholder="Nome nuovo profilo" /><button onClick={createProfile} disabled={!newProfileName.trim()}><Plus size={15} /> Crea</button></div></section><div className="portfolio-grid"><section className="portfolio-card"><div className="portfolio-card-head"><div><span className="analysis-eyebrow">Posizioni</span><h2>Portafoglio importato</h2></div><button className="outline-action" onClick={() => fileRef.current?.click()} disabled={!activeKey}><Upload size={14} /> Importa CSV</button><input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(event) => importCsv(event.target.files?.[0])} /></div><p className="portfolio-csv-help"><FileUp size={14} /> Formato: <code>symbol,quantity,averagePrice,currency</code></p>{positions.length ? <div className="positions-table"><div className="positions-head"><span>Strumento</span><span>Quantità</span><span>Prezzo medio</span><span>Valore di carico</span></div>{positions.map((position) => <div className="position-row" key={position.id}><strong>{position.symbol}</strong><span>{Number(position.quantity).toLocaleString("it-IT")}</span><span>{Number(position.averagePrice).toFixed(2)} {position.currency}</span><strong>{formatEuro(Number(position.quantity) * Number(position.averagePrice))}</strong></div>)}</div> : <div className="portfolio-empty"><ShieldCheck size={24} /><strong>Ancora nessuna posizione</strong><p>Importa un CSV dal tuo broker per iniziare. I dati restano legati al tuo profilo autenticato.</p><button className="primary-button" onClick={() => fileRef.current?.click()} disabled={!activeKey}><Upload size={15} /> Importa il primo CSV</button></div>}</section><aside className="portfolio-summary"><span className="analysis-eyebrow">Valore di carico</span><strong>{formatEuro(invested)}</strong><span>{positions.length} posizioni · aggiornamento manuale</span><div className="summary-note"><RefreshCw size={15} /><p>Il prossimo passo è collegare un broker o un feed di transazioni. Per ora Clarity non esegue ordini.</p></div></aside></div>{message && <div className="portfolio-toast">{message}</div>}<div className="analysis-disclaimer"><LockKeyhole size={13} /> I dati sono privati e il portafoglio è uno strumento organizzativo. Nessuna operazione viene eseguita da Clarity.</div></main></div>;
}
