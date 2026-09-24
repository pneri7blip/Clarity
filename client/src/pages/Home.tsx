import { useMemo, useState } from "react";
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
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const performanceData = [
  { month: "Gen", value: 100 },
  { month: "Feb", value: 104.5 },
  { month: "Mar", value: 102.8 },
  { month: "Apr", value: 108.6 },
  { month: "Mag", value: 111.4 },
  { month: "Giu", value: 109.7 },
  { month: "Lug", value: 115.8 },
  { month: "Ago", value: 117.6 },
  { month: "Set", value: 121.9 },
];

const watchlist = [
  { ticker: "VWCE", name: "Vanguard FTSE All-World", price: "€ 124,86", change: "+0,84%", positive: true, type: "ETF" },
  { ticker: "MSFT", name: "Microsoft Corporation", price: "$ 509,90", change: "+1,72%", positive: true, type: "USA" },
  { ticker: "ENI", name: "Eni S.p.A.", price: "€ 14,38", change: "−0,41%", positive: false, type: "ITA" },
  { ticker: "BTP 2037", name: "Buoni del Tesoro Poliennali", price: "98,42", change: "+0,18%", positive: true, type: "BOND" },
];

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

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: string }) {
  return (
    <div className="section-heading">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
      {action && <button className="text-button">{action}<ChevronRight size={15} /></button>}
    </div>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Panoramica");
  const [range, setRange] = useState("9M");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAgentDrawer, setShowAgentDrawer] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState("VWCE");
  const [, setLocation] = useLocation();

  const chartData = useMemo(() => {
    if (range === "1M") return performanceData.slice(-3);
    if (range === "1A") return [...performanceData, { month: "Ott", value: 123.2 }, { month: "Nov", value: 126.4 }, { month: "Dic", value: 129.8 }];
    return performanceData;
  }, [range]);

  return (
    <div className="atlas-shell">
      <aside className={`sidebar ${showMobileNav ? "mobile-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><span /></div>
          <div className="brand-name">atlas<span>.</span></div>
          <button className="mobile-close" onClick={() => setShowMobileNav(false)} aria-label="Chiudi menu"><X size={20} /></button>
        </div>
        <div className="workspace-switcher"><div className="workspace-avatar">G</div><div><span>Spazio personale</span><strong>Giulia Rossi</strong></div><ChevronDown size={15} /></div>
        <div className="nav-group-label">Il tuo spazio</div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`} onClick={() => { setActiveNav(label); setShowMobileNav(false); if (label === "Analisi") setLocation("/analysis"); }}><Icon size={18} strokeWidth={activeNav === label ? 2.3 : 1.8} /><span>{label}</span>{label === "Analisi" && <span className="nav-badge">3</span>}</button>)}
        </nav>
        <div className="nav-group-label spaced">Strumenti</div>
        <nav className="main-nav">
          <button className="nav-item" onClick={() => setShowAgentDrawer(true)}><Bot size={18} /><span>Agenti AI</span><span className="live-dot" /></button>
          <button className="nav-item" onClick={() => setActiveNav("Report")}><FileText size={18} /><span>Report</span></button>
          <button className="nav-item" onClick={() => setActiveNav("Impostazioni")}><Settings2 size={18} /><span>Impostazioni</span></button>
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
            <button className="icon-button notification" aria-label="Notifiche"><Bell size={19} /><span /></button>
            <div className="topbar-divider" />
            <div className="avatar">GR</div>
          </div>
        </header>

        <div className="page-container">
          <section className="welcome-row">
            <div><div className="welcome-kicker"><span className="status-pulse" /> Mercati aperti · Giovedì 24 settembre 2026</div><h1>Buongiorno, Giulia <span>✦</span></h1><p>Il tuo patrimonio sta seguendo il piano. Ecco cosa merita attenzione oggi.</p></div>
            <button className="primary-button" onClick={() => setShowAgentDrawer(true)}><Sparkles size={17} /> Chiedi ad Atlas</button>
          </section>

          <section className="stats-grid">
            <StatCard label="Patrimonio investito" value="€ 48.620,40" trend="+8,6%" trendLabel="quest'anno" icon={WalletCards} tone="green" />
            <StatCard label="Risultato di oggi" value="+€ 286,90" trend="+0,59%" trendLabel="vs. ieri" icon={TrendingUp} tone="blue" />
            <StatCard label="Liquidità disponibile" value="€ 6.240,00" trend="12,8%" trendLabel="del patrimonio" icon={CreditCard} />
            <div className="risk-card"><div className="risk-card-top"><span className="eyebrow">Profilo Atlas</span><span className="risk-score">B</span></div><strong>Bilanciato</strong><div className="risk-scale"><span className="filled" /><span className="filled" /><span className="filled" /><span /><span /></div><div className="risk-foot"><span>Rischio 3/5</span><button onClick={() => setActiveNav("Piani")}>Modifica <ChevronRight size={13} /></button></div></div>
          </section>

          <div className="main-grid">
            <section className="panel performance-panel">
              <SectionTitle eyebrow="Andamento portafoglio" title="La tua crescita" action="Vedi dettagli" />
              <div className="performance-metric"><strong>€ 48.620,40</strong><span className="trend-positive"><ArrowUpRight size={16} /> +€ 3.854,20 <small>(+8,6%)</small></span></div>
              <div className="chart-controls"><span>Valore normalizzato · ultimi 9 mesi</span><div className="range-tabs">{["1M", "9M", "1A", "Max"].map((item) => <button key={item} className={range === item ? "active" : ""} onClick={() => setRange(item)}>{item}</button>)}</div></div>
              <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 4, left: -26, bottom: 0 }}><defs><linearGradient id="atlasGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8ed7bd" stopOpacity={0.4} /><stop offset="100%" stopColor="#8ed7bd" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e7ecea" strokeDasharray="3 3" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#8b9895", fontSize: 11 }} dy={8} /><YAxis domain={[98, 132]} axisLine={false} tickLine={false} tick={{ fill: "#a0aaa8", fontSize: 11 }} tickFormatter={(value) => `${value}`} /><Tooltip contentStyle={{ border: "1px solid #dce7e2", borderRadius: 10, boxShadow: "0 8px 24px rgba(26,59,49,.10)", fontSize: 12 }} formatter={(value: number) => [`${value.toFixed(1)}%`, "Portafoglio"]} /><Area type="monotone" dataKey="value" stroke="#1a7860" strokeWidth={2.5} fill="url(#atlasGradient)" activeDot={{ r: 5, strokeWidth: 3, stroke: "#fff", fill: "#1a7860" }} /></AreaChart></ResponsiveContainer></div>
              <div className="chart-foot"><span><span className="legend-line" /> Portafoglio</span><span><span className="legend-dash" /> Benchmark globale <em>+7,2%</em></span></div>
            </section>

            <section className="panel allocation-panel">
              <SectionTitle eyebrow="Asset allocation" title="Dove sono i tuoi soldi" action="Ribilancia" />
              <div className="allocation-content"><div className="donut" aria-label="Distribuzione portafoglio"><div><strong>48,6k</strong><span>totale</span></div></div><div className="allocation-legend"><div><span className="legend-dot equity" /><span>Azionario</span><strong>58%</strong></div><div><span className="legend-dot bonds" /><span>Obbligazionario</span><strong>27%</strong></div><div><span className="legend-dot cash" /><span>Liquidità</span><strong>13%</strong></div><div><span className="legend-dot other" /><span>Altro</span><strong>2%</strong></div></div></div>
              <div className="allocation-callout"><Zap size={15} /><span>Sei <strong>2,4%</strong> sotto il target azionario. Atlas suggerisce di non intervenire oggi.</span></div>
            </section>
          </div>

          <div className="lower-grid">
            <section className="panel watchlist-panel">
              <div className="section-heading"><div><span className="eyebrow">La tua lista</span><h2>Da tenere d'occhio</h2></div><div className="panel-actions"><button className="small-icon-button"><ListFilter size={16} /></button><button className="text-button">Gestisci <ChevronRight size={15} /></button></div></div>
              <div className="watchlist-table"><div className="table-head"><span>Strumento</span><span>Ultimo</span><span>Oggi</span><span /></div>{watchlist.map((item) => <button className={`watch-row ${selectedTicker === item.ticker ? "selected" : ""}`} key={item.ticker} onClick={() => setSelectedTicker(item.ticker)}><div className="instrument"><span className={`ticker ${item.type === "ETF" ? "green" : item.type === "BOND" ? "yellow" : "dark"}`}>{item.ticker === "BTP 2037" ? "BTP" : item.ticker.slice(0, 2)}</span><span><strong>{item.ticker}</strong><small>{item.name}</small></span></div><strong>{item.price}</strong><span className={item.positive ? "trend-positive" : "trend-negative"}>{item.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{item.change}</span><ChevronRight size={15} className="row-arrow" /></button>)}</div>
            </section>

            <section className="panel agents-panel">
              <div className="agent-header"><div className="agent-orb"><Bot size={19} /></div><div><span className="eyebrow">Atlas intelligence</span><h2>I tuoi agenti AI</h2></div><span className="online-label"><span className="live-dot" /> online</span></div>
              <p className="agent-intro">Tre prospettive diverse, una decisione più consapevole.</p>
              <div className="agent-list">{agentItems.map(({ label, detail, icon: Icon, color, status }) => <button className="agent-row" key={label} onClick={() => setShowAgentDrawer(true)}><span className={`agent-icon ${color}`}><Icon size={17} /></span><span className="agent-copy"><strong>{label}</strong><small>{detail}</small></span><span className={`agent-status ${status === "Attivo" ? "active" : ""}`}>{status}</span><ChevronRight size={15} /></button>)}</div>
              <button className="agent-cta" onClick={() => setShowAgentDrawer(true)}><MessageCircle size={16} /> Apri il briefing del giorno <ChevronRight size={15} /></button>
            </section>
          </div>

          <section className="insight-banner"><div className="insight-symbol"><Sparkles size={19} /></div><div><span className="eyebrow">Insight del giorno · Analista titoli</span><strong>Il tuo portafoglio è ben diversificato, ma il 31% è esposto al settore tech.</strong><p>Scopri come questa concentrazione può influenzare il rischio nei prossimi 12 mesi.</p></div><button className="secondary-button" onClick={() => setShowAgentDrawer(true)}>Esplora insight <ChevronRight size={15} /></button></section>
          <div className="disclaimer"><LockKeyhole size={13} /> Atlas offre informazioni e simulazioni educative, non consulenza finanziaria personalizzata. I dati mostrati sono demo.</div>
        </div>
      </main>

      {showAgentDrawer && <div className="drawer-backdrop" onClick={() => setShowAgentDrawer(false)}><aside className="agent-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-top"><div><span className="eyebrow">Atlas intelligence</span><h2>Briefing del giorno</h2></div><button className="small-icon-button" onClick={() => setShowAgentDrawer(false)}><X size={18} /></button></div><div className="briefing-date"><Clock3 size={14} /> Aggiornato oggi alle 08:42 · 12 fonti analizzate</div><div className="briefing-highlight"><span className="agent-icon mint"><Globe2 size={18} /></span><div><strong>Scout mercati</strong><p>I mercati europei aprono cauti dopo i dati sull'inflazione USA. Il quadro resta costruttivo per l'azionario globale, con volatilità in calo.</p></div></div><div className="drawer-section"><span className="eyebrow">Cosa merita attenzione</span><div className="drawer-item"><span className="drawer-number">01</span><div><strong>Obbligazioni governative</strong><p>I rendimenti BTP a 10 anni sono scesi di 7 punti base. Il tuo 27% obbligazionario resta in linea con il piano.</p></div></div><div className="drawer-item"><span className="drawer-number">02</span><div><strong>Concentrazione tech</strong><p>Microsoft e il tuo ETF globale portano l'esposizione tech al 31%. Nessuna urgenza: rivedila al prossimo versamento.</p></div></div></div><div className="drawer-question"><span className="agent-icon violet"><MessageCircle size={16} /></span><div><strong>Hai una domanda?</strong><p>Chiedi ad Atlas di spiegarti un titolo, un BTP o il tuo piano.</p></div><ChevronRight size={16} /></div><button className="primary-button full" onClick={() => setShowAgentDrawer(false)}>Inizia una conversazione <MessageCircle size={16} /></button></aside></div>}
    </div>
  );
}
