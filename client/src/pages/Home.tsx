import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  CreditCard,
  ExternalLink,
  FileText,
  Filter,
  Globe2,
  Landmark,
  LayoutDashboard,
  LineChart,
  ListFilter,
  LockKeyhole,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PiggyBank,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { formatPercent } from "@shared/format";
import { OnboardingDialog, type OnboardingProfile } from "@/components/OnboardingDialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const navItems = [
  { label: "Panoramica", icon: LayoutDashboard },
  { label: "Analisi", icon: LineChart },
  { label: "Portafoglio", icon: BriefcaseBusiness },
  { label: "Piani", icon: Compass },
  { label: "Mercati", icon: Globe2 },
];

const agentItems = [
  { label: "Scout mercati", detail: "Macro + news globali", icon: Globe2, color: "mint", status: "Attivo" },
  { label: "Analista titoli", detail: "Fondamentali e valutazioni", icon: LineChart, color: "violet", status: "Pronto" },
  { label: "Coach finanziario", detail: "Piani e obiettivi personali", icon: PiggyBank, color: "amber", status: "Pronto" },
];

function StatCard({ label, value, trend, trendLabel, icon: Icon, tone = "default" }: { label: string; value: string; trend: string; trendLabel: string; icon: typeof WalletCards; tone?: "default" | "green" | "blue" }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-card-top">
        <span className="eyebrow">{label}</span>
        <span className="stat-icon"><Icon size={17} strokeWidth={1.8} /></span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot"><span className="trend-positive"><ArrowUpRight size={14} />{trend}</span><span>{trendLabel}</span></div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-heading">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
      {action && <button className="text-button" onClick={onAction}>{action}<ChevronRight size={15} /></button>}
    </div>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Panoramica");
  const [range, setRange] = useState("9M");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAgentDrawer, setShowAgentDrawer] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState("VWCE");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [language, setLanguage] = useState<"it" | "en">("it");
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { data: savedProfile } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated, staleTime: 60_000 });
  const watchlistQuery = trpc.market.watchlist.useQuery(undefined, { staleTime: 60_000, refetchOnWindowFocus: false });
  const dashboardInsightsQuery = trpc.portfolio.insights.useQuery({ profileKey: savedProfile?.profileKey ?? "" }, { enabled: isAuthenticated && Boolean(savedProfile?.profileKey), staleTime: 60_000 });
  const dashboardHistoryQuery = trpc.portfolio.history.useQuery({ profileKey: savedProfile?.profileKey ?? "" }, { enabled: isAuthenticated && Boolean(savedProfile?.profileKey), staleTime: 60_000 });
  const saveProfile = trpc.profile.save.useMutation();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const chatMutation = trpc.ai.chat.useMutation({ onSuccess: (response) => setChatMessages((current) => [...current, response]) });
  const displayName = user?.name?.split(" ")[0] ?? "investitore";
  const displayFullName = user?.name ?? "Profilo personale";
  const initials = (user?.name ?? "CL").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const watchlist = watchlistQuery.data?.map((item) => ({ ticker: item.symbol, name: item.name, price: item.available ? `${item.currency === "USD" ? "$" : "€"} ${item.price.toFixed(2)}` : "—", change: item.available ? `${item.changePct >= 0 ? "+" : ""}${item.changePct.toFixed(2)}%` : "N/D", positive: item.changePct >= 0, type: item.type })) ?? [];
  const dashboardInsights = dashboardInsightsQuery.data;
  const dashboardValue = dashboardInsights?.currentValue ?? 0;
  const dashboardPnl = dashboardInsights?.pnl ?? 0;
  const dashboardHistory = dashboardHistoryQuery.data ?? [];
  const bondValue = dashboardInsights?.holdings.filter((item) => item.symbol.toUpperCase().startsWith("BTP")).reduce((sum, item) => sum + item.currentValue, 0) ?? 0;
  const equityPct = dashboardValue ? Math.round(((dashboardValue - bondValue) / dashboardValue) * 100) : 0;
  const bondPct = dashboardValue ? Math.round((bondValue / dashboardValue) * 100) : 0;

  const sendChatMessage = (content: string) => {
    const nextMessages = [...chatMessages, { role: "user" as const, content }];
    setChatMessages(nextMessages);
    chatMutation.mutate({ messages: nextMessages.filter((message) => message.role !== "system").map((message) => ({ role: message.role as "user" | "assistant", content: message.content })) });
  };

  useEffect(() => {
    setShowOnboarding(localStorage.getItem("clarity-onboarding-complete") !== "true");
    setLanguage((localStorage.getItem("clarity-language") as "it" | "en" | null) ?? "it");
  }, []);

  useEffect(() => {
    if (savedProfile) {
      localStorage.setItem("clarity-onboarding-complete", "true");
      localStorage.setItem("clarity-profile", JSON.stringify(savedProfile));
      setShowOnboarding(false);
    }
  }, [savedProfile]);

  const completeOnboarding = (profile: OnboardingProfile) => {
    localStorage.setItem("clarity-onboarding-complete", "true");
    localStorage.setItem("clarity-profile", JSON.stringify(profile));
    if (isAuthenticated) saveProfile.mutate(profile);
    setShowOnboarding(false);
  };

  const toggleLanguage = () => {
    const next = language === "it" ? "en" : "it";
    setLanguage(next);
    localStorage.setItem("clarity-language", next);
  };

  const chartData = useMemo(() => {
    const points = dashboardHistory.map((item) => ({ month: new Date(item.capturedAt).toLocaleDateString("it-IT", { month: "short", day: "2-digit" }), value: Number(item.totalValue) }));
    if (range === "1M") return points.slice(-3);
    if (range === "1A") return points.slice(-12);
    return points;
  }, [dashboardHistory, range]);
  const money = (value: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);

  return (
    <div className="atlas-shell">
      <aside className={`sidebar ${showMobileNav ? "mobile-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><span /></div>
          <div className="brand-name">Clarity<span>.</span></div>
          <button className="mobile-close" onClick={() => setShowMobileNav(false)} aria-label="Chiudi menu"><X size={20} /></button>
        </div>
          <div className="workspace-switcher"><div className="workspace-avatar">{initials.slice(0, 1)}</div><div><span>Spazio personale</span><strong>{displayFullName}</strong></div><ChevronDown size={15} /></div>
        <div className="nav-group-label">Il tuo spazio</div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`} onClick={() => { setActiveNav(label); setShowMobileNav(false); if (label === "Analisi" || label === "Mercati") setLocation("/analysis"); if (label === "Piani") setLocation("/planner"); if (label === "Portafoglio") setLocation("/portfolio"); }}><Icon size={18} strokeWidth={activeNav === label ? 2.3 : 1.8} /><span>{label}</span>{label === "Analisi" && <span className="nav-badge">3</span>}</button>)}
        </nav>
        <div className="nav-group-label spaced">Strumenti</div>
        <nav className="main-nav">
          <button className="nav-item" onClick={() => setShowAgentDrawer(true)}><Bot size={18} /><span>Agenti AI</span><span className="live-dot" /></button>
          <button className="nav-item" onClick={() => setLocation("/alerts")}><Bell size={18} /><span>Notifiche</span><span className="live-dot" /></button>
          <button className="nav-item" onClick={() => setLocation("/analysis")}><FileText size={18} /><span>Report</span></button>
          <button className="nav-item" onClick={() => setShowOnboarding(true)}><Settings2 size={18} /><span>Impostazioni</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="trust-note"><ShieldCheck size={16} /><span>Dati protetti e privati</span></div>
          <div className="sidebar-help"><CircleHelp size={17} /><span>Centro assistenza</span><ExternalLink size={13} /></div>
          <div className="sidebar-legal">Versione beta · Solo a scopo informativo</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setShowMobileNav(true)} aria-label="Apri menu"><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Spazio personale</span><ChevronRight size={14} /><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            {showSearch ? <div className="search-wrap"><Search size={16} /><input autoFocus placeholder="Cerca un titolo, ETF o BTP" onBlur={() => setShowSearch(false)} /></div> : <button className="icon-button" onClick={() => setShowSearch(true)} aria-label="Cerca"><Search size={19} /></button>}
            <button className="icon-button notification" onClick={() => setLocation("/alerts")} aria-label="Notifiche"><Bell size={19} /><span /></button>
            <div className="topbar-divider" />
            <button className="language-toggle" onClick={toggleLanguage} aria-label="Cambia lingua">{language.toUpperCase()}</button><div className="avatar">{initials}</div>
          </div>
        </header>

        <div className="page-container">
          <section className="welcome-row">
            <div><div className="welcome-kicker"><span className="status-pulse" /> {language === "it" ? "Mercati aperti · Giovedì 24 settembre 2026" : "Markets open · Thursday, September 24, 2026"}</div><h1>{language === "it" ? `Buongiorno, ${displayName}` : `Good morning, ${displayName}`} <span>✦</span></h1><p>{language === "it" ? "Il tuo patrimonio sta seguendo il piano. Ecco cosa merita attenzione oggi." : "Your portfolio is on track. Here is what deserves attention today."}</p></div>
            <button className="primary-button" onClick={() => setShowAgentDrawer(true)}><Sparkles size={17} /> {language === "it" ? "Chiedi ad Clarity" : "Ask Clarity"}</button>
          </section>

          <section className="stats-grid">
            <StatCard label="Patrimonio investito" value={dashboardValue ? money(dashboardValue) : "—"} trend={dashboardValue ? `${dashboardPnl >= 0 ? "+" : ""}${money(dashboardPnl)}` : "—"} trendLabel={dashboardValue ? "vs prezzo medio" : "Importa un portafoglio"} icon={WalletCards} tone="green" />
            <StatCard label="Risultato di oggi" value={dashboardValue ? `${dashboardPnl >= 0 ? "+" : ""}${money(dashboardPnl)}` : "—"} trend={dashboardValue ? `${dashboardInsights?.liveCount ?? 0}/${dashboardInsights?.totalCount ?? 0}` : "—"} trendLabel={dashboardValue ? "quote live" : "Nessun dato"} icon={TrendingUp} tone="blue" />
            <StatCard label="Liquidità disponibile" value="—" trend="—" trendLabel="Aggiungi un saldo cash" icon={CreditCard} />
            <div className="risk-card"><div className="risk-card-top"><span className="eyebrow">Profilo Clarity</span><span className="risk-score">{savedProfile ? "✓" : "—"}</span></div><strong>{savedProfile?.risk ?? "Profilo non configurato"}</strong><div className="risk-scale"><span className={savedProfile ? "filled" : ""} /><span className={savedProfile ? "filled" : ""} /><span /><span /><span /></div><div className="risk-foot"><span>{savedProfile ? "Profilo salvato" : "Completa onboarding"}</span><button onClick={() => setLocation("/planner")}>Modifica <ChevronRight size={13} /></button></div></div>
          </section>

          <div className="main-grid">
              <section className="panel performance-panel">
              <SectionTitle eyebrow="Andamento portafoglio" title="La tua crescita" action="Vedi dettagli" onAction={() => setLocation("/portfolio")} />
              <div className="performance-metric"><strong>{dashboardValue ? money(dashboardValue) : "—"}</strong><span className={dashboardPnl >= 0 ? "trend-positive" : "trend-negative"}>{dashboardValue ? <><ArrowUpRight size={16} /> {dashboardPnl >= 0 ? "+" : ""}{money(dashboardPnl)} <small>vs prezzo medio</small></> : "Nessuno snapshot salvato"}</span></div>
              <div className="chart-controls"><span>Valore normalizzato · ultimi 9 mesi</span><div className="range-tabs">{["1M", "9M", "1A", "Max"].map((item) => <button key={item} className={range === item ? "active" : ""} onClick={() => setRange(item)}>{item}</button>)}</div></div>
              <div className="chart-wrap">{chartData.length > 1 ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 4, left: -26, bottom: 0 }}><defs><linearGradient id="atlasGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8ed7bd" stopOpacity={0.4} /><stop offset="100%" stopColor="#8ed7bd" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e7ecea" strokeDasharray="3 3" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#8b9895", fontSize: 11 }} dy={8} /><YAxis domain={["dataMin", "dataMax"]} axisLine={false} tickLine={false} tick={{ fill: "#a0aaa8", fontSize: 11 }} tickFormatter={(value) => money(Number(value))} /><Tooltip contentStyle={{ border: "1px solid #dce7e2", borderRadius: 10, boxShadow: "0 8px 24px rgba(26,59,49,.10)", fontSize: 12 }} formatter={(value: number) => [money(value), "Valore"]} /><Area type="monotone" dataKey="value" stroke="#1a7860" strokeWidth={2.5} fill="url(#atlasGradient)" activeDot={{ r: 5, strokeWidth: 3, stroke: "#fff", fill: "#1a7860" }} /></AreaChart></ResponsiveContainer> : <div className="chart-empty">Salva almeno due snapshot dal Portafoglio per vedere qui la performance storica.</div>}</div>
              <div className="chart-foot"><span><span className="legend-line" /> Portafoglio</span><span><span className="legend-dash" /> Benchmark globale <em>+7,2%</em></span></div>
            </section>

            <section className="panel allocation-panel">
              <SectionTitle eyebrow="Asset allocation" title="Dove sono i tuoi soldi" action="Ribilancia" onAction={() => setLocation("/planner")} />
              <div className="allocation-content"><div className="donut" aria-label="Distribuzione portafoglio"><div><strong>{dashboardValue ? money(dashboardValue) : "—"}</strong><span>totale</span></div></div><div className="allocation-legend"><div><span className="legend-dot equity" /><span>Azionario</span><strong>{dashboardValue ? `${equityPct}%` : "—"}</strong></div><div><span className="legend-dot bonds" /><span>Obbligazionario</span><strong>{dashboardValue ? `${bondPct}%` : "—"}</strong></div><div><span className="legend-dot cash" /><span>Liquidità</span><strong>—</strong></div><div><span className="legend-dot other" /><span>Altro</span><strong>—</strong></div></div></div>
              <div className="allocation-callout"><Zap size={15} /><span>{dashboardValue ? "Allocazione calcolata dalle posizioni importate. Aggiungi categorie e liquidità per una vista più completa." : "Importa un portafoglio per calcolare asset allocation e concentrazione."}</span></div>
            </section>
          </div>

          <div className="lower-grid">
            <section className="panel watchlist-panel">
              <div className="section-heading"><div><span className="eyebrow">La tua lista</span><h2>Da tenere d'occhio</h2></div><div className="panel-actions"><button className="small-icon-button" onClick={() => setLocation("/analysis")} aria-label="Apri analisi"><ListFilter size={16} /></button><button className="text-button" onClick={() => setLocation("/analysis")}>Gestisci <ChevronRight size={15} /></button></div></div>
              <div className="watchlist-table"><div className="table-head"><span>Strumento</span><span>Ultimo</span><span>Oggi</span><span /></div>{watchlist.map((item) => <button className={`watch-row ${selectedTicker === item.ticker ? "selected" : ""}`} key={item.ticker} onClick={() => { setSelectedTicker(item.ticker); setLocation(`/analysis?symbol=${encodeURIComponent(item.ticker)}`); }}><div className="instrument"><span className={`ticker ${item.type === "ETF" ? "green" : item.type === "BOND" ? "yellow" : "dark"}`}>{item.ticker === "BTP 2037" ? "BTP" : item.ticker.slice(0, 2)}</span><span><strong>{item.ticker}</strong><small>{item.name}</small></span></div><strong>{item.price}</strong><span className={item.positive ? "trend-positive" : "trend-negative"}>{item.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{item.change}</span><ChevronRight size={15} className="row-arrow" /></button>)}</div>
            </section>

            <section className="panel agents-panel">
              <div className="agent-header"><div className="agent-orb"><Bot size={19} /></div><div><span className="eyebrow">Clarity intelligence</span><h2>I tuoi agenti AI</h2></div><span className="online-label"><span className="live-dot" /> online</span></div>
              <p className="agent-intro">Tre prospettive diverse, una decisione più consapevole.</p>
              <div className="agent-list">{agentItems.map(({ label, detail, icon: Icon, color, status }) => <button className="agent-row" key={label} onClick={() => setShowAgentDrawer(true)}><span className={`agent-icon ${color}`}><Icon size={17} /></span><span className="agent-copy"><strong>{label}</strong><small>{detail}</small></span><span className={`agent-status ${status === "Attivo" ? "active" : ""}`}>{status}</span><ChevronRight size={15} /></button>)}</div>
              <button className="agent-cta" onClick={() => setShowAgentDrawer(true)}><MessageCircle size={16} /> Apri il briefing del giorno <ChevronRight size={15} /></button>
            </section>
          </div>

          <section className="insight-banner"><div className="insight-symbol"><Sparkles size={19} /></div><div><span className="eyebrow">Insight del giorno · Analista titoli</span><strong>{dashboardInsights ? dashboardInsights.riskLabel : "Importa un portafoglio per attivare gli insight"}</strong><p>{dashboardInsights ? `Diversificazione calcolata: ${dashboardInsights.diversificationScore}/100. Verifica i dettagli prima di prendere decisioni.` : "Clarity userà le tue posizioni per calcolare concentrazione, copertura dati e segnali di rischio."}</p></div><button className="secondary-button" onClick={() => setLocation("/portfolio")}>Esplora insight <ChevronRight size={15} /></button></section>
          <div className="disclaimer"><LockKeyhole size={13} /> Clarity offre informazioni educative, non consulenza finanziaria personalizzata. Le quotazioni watchlist sono live quando disponibili; i dati di portafoglio dipendono dal tuo profilo e dagli snapshot salvati.</div>
        </div>
      </main>

          {showAgentDrawer && <div className="drawer-backdrop" onClick={() => setShowAgentDrawer(false)}><aside className="agent-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-top"><div><span className="eyebrow">Clarity intelligence</span><h2>{showChat ? "Conversazione con Clarity" : language === "it" ? "Briefing del giorno" : "Daily briefing"}</h2></div><button className="small-icon-button" onClick={() => setShowAgentDrawer(false)}><X size={18} /></button></div>{showChat ? <AIChatBox messages={chatMessages} onSendMessage={sendChatMessage} isLoading={chatMutation.isPending} height={430} placeholder="Chiedi a Clarity…" emptyStateMessage="Inizia una conversazione con Clarity" suggestedPrompts={["Spiegami il rischio di Microsoft", "Come posso diversificare meglio?", "Cosa significa un ETF globale?"]} /> : <><div className="briefing-date"><Clock3 size={14} /> {language === "it" ? "Aggiornato oggi · dati informativi" : "Updated today · informational data"}</div><div className="briefing-highlight"><span className="agent-icon mint"><Globe2 size={18} /></span><div><strong>Scout mercati</strong><p>{language === "it" ? "I mercati europei aprono cauti. Il quadro resta costruttivo per l'azionario globale, con volatilità da monitorare." : "European markets opened cautiously. The global equity outlook remains constructive, with volatility to monitor."}</p></div></div><div className="drawer-section"><span className="eyebrow">{language === "it" ? "Cosa merita attenzione" : "What deserves attention"}</span><div className="drawer-item"><span className="drawer-number">01</span><div><strong>{language === "it" ? "Obbligazioni governative" : "Government bonds"}</strong><p>{language === "it" ? "Usa Analisi per confrontare rendimento, rischio e orizzonte prima di prendere decisioni." : "Use Analysis to compare return, risk and horizon before making decisions."}</p></div></div><div className="drawer-item"><span className="drawer-number">02</span><div><strong>{language === "it" ? "Concentrazione tech" : "Tech concentration"}</strong><p>{language === "it" ? "Il portafoglio demo mostra una concentrazione tech: verifica i tuoi dati reali nella sezione Portafoglio." : "The demo portfolio shows tech concentration: check your real data in Portfolio."}</p></div></div></div><div className="drawer-question"><span className="agent-icon violet"><MessageCircle size={16} /></span><div><strong>{language === "it" ? "Hai una domanda?" : "Have a question?"}</strong><p>{language === "it" ? "Chiedi ad Clarity di spiegarti un titolo, un BTP o il tuo piano." : "Ask Clarity to explain a stock, a bond or your plan."}</p></div><ChevronRight size={16} /></div><button className="primary-button full" onClick={() => setShowChat(true)}>{language === "it" ? "Inizia una conversazione" : "Start a conversation"} <MessageCircle size={16} /></button></>}</aside></div>}
      {showOnboarding && <OnboardingDialog onComplete={completeOnboarding} onClose={() => { localStorage.setItem("clarity-onboarding-complete", "true"); setShowOnboarding(false); }} />}
    </div>
  );
}
