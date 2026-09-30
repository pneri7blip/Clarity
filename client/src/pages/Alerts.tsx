import { useState } from "react";
import { Link } from "wouter";
import { BellRing, ChevronLeft, LockKeyhole, Plus, ShieldAlert, ToggleLeft, ToggleRight, Zap } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const labels: Record<string, string> = { price_above: "Prezzo sopra", price_below: "Prezzo sotto", goal_risk: "Rischio obiettivo" };

export default function Alerts() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/alerts" });
  const [profileKey, setProfileKey] = useState("");
  const [symbol, setSymbol] = useState("MSFT");
  const [kind, setKind] = useState<"price_above" | "price_below" | "goal_risk">("price_above");
  const [threshold, setThreshold] = useState("550");
  const profiles = trpc.profile.list.useQuery(undefined, { enabled: Boolean(user), staleTime: 30_000 });
  const activeKey = profileKey || profiles.data?.[0]?.profileKey || "";
  const alerts = trpc.alerts.list.useQuery({ profileKey: activeKey }, { enabled: Boolean(activeKey), staleTime: 10_000 });
  const create = trpc.alerts.create.useMutation({ onSuccess: () => { alerts.refetch(); setThreshold(""); } });
  const toggle = trpc.alerts.toggle.useMutation({ onSuccess: () => alerts.refetch() });

  if (loading) return <div className="portfolio-loading">Caricamento area privata…</div>;
  if (!user) return null;
  const addAlert = () => { if (!activeKey || !symbol || !threshold) return; create.mutate({ profileKey: activeKey, symbol: symbol.toUpperCase(), kind, threshold }); };

  return <div className="alerts-shell"><header className="portfolio-topbar"><Link href="/" className="portfolio-back"><ChevronLeft size={16} /> Torna a Clarity</Link><div className="planner-brand"><span className="brand-mark"><span /></span> Clarity<span>.</span></div><span className="portfolio-private"><LockKeyhole size={13} /> Area privata</span></header><main className="alerts-page"><div className="alerts-heading"><div><span className="analysis-eyebrow"><BellRing size={14} /> Alert e notifiche</span><h1>Resta aggiornato senza controllare tutto.</h1><p>Configura regole semplici: Clarity le userà come base per notifiche su prezzi, rischio e obiettivi.</p></div><span className="planner-ai"><Zap size={15} /> Regole deterministiche</span></div><section className="alerts-profile"><span className="analysis-eyebrow">Profilo attivo</span><select value={activeKey} onChange={(event) => setProfileKey(event.target.value)}><option value="">Seleziona profilo</option>{(profiles.data ?? []).map((profile) => <option key={profile.profileKey} value={profile.profileKey}>{profile.name}</option>)}</select></section><div className="alerts-layout"><section className="alerts-card"><div className="alerts-card-head"><div><span className="analysis-eyebrow">Nuova regola</span><h2>Quando vuoi essere avvisato?</h2></div><BellRing size={19} /></div><label>Strumento<input value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="MSFT, VWCE, ENI" /></label><label>Tipo di alert<select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}><option value="price_above">Prezzo sopra la soglia</option><option value="price_below">Prezzo sotto la soglia</option><option value="goal_risk">Rischio per obiettivo</option></select></label><label>Soglia<input value={threshold} onChange={(event) => setThreshold(event.target.value)} placeholder="550" inputMode="decimal" /></label><button className="primary-button" onClick={addAlert} disabled={!activeKey || !threshold}><Plus size={16} /> Salva alert</button><p className="alerts-note"><ShieldAlert size={14} /> Gli alert sono promemoria informativi. Non eseguono ordini e non sostituiscono una valutazione personale.</p></section><section className="alerts-card"><div className="alerts-card-head"><div><span className="analysis-eyebrow">Le tue regole</span><h2>Alert attivi</h2></div><span className="alert-count">{alerts.data?.length ?? 0}</span></div>{alerts.data?.length ? <div className="alert-list">{alerts.data.map((alert) => <div className="alert-row" key={alert.id}><span className="alert-symbol">{alert.symbol.slice(0, 2)}</span><div><strong>{labels[alert.kind]} {alert.threshold}</strong><small>Profilo selezionato · {alert.enabled ? "attivo" : "in pausa"}</small></div><button onClick={() => toggle.mutate({ profileKey: activeKey, id: alert.id, enabled: !Boolean(alert.enabled) })}>{alert.enabled ? <ToggleRight size={25} /> : <ToggleLeft size={25} />}</button></div>)}</div> : <div className="alerts-empty"><BellRing size={23} /><strong>Nessun alert configurato</strong><p>Inizia con un livello prezzo per uno degli strumenti che stai seguendo.</p></div>}</section></div><div className="analysis-disclaimer"><LockKeyhole size={13} /> Sistema informativo: Clarity non invia ordini, non gestisce denaro e non fornisce consulenza personalizzata.</div></main></div>;
}
