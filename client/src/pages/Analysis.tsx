import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  Globe2,
  Info,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

const instruments = {
  VWCE: {
    symbol: "VWCE",
    name: "Vanguard FTSE All-World UCITS ETF",
    category: "ETF azionario globale",
    price: "€ 124,86",
    change: "+0,84%",
    positive: true,
    score: 78,
    scoreLabel: "Solido",
    metrics: [
      ["TER", "0,22%"],
      ["Volatilità 1A", "11,8%"],
      ["Performance 1A", "+14,2%"],
      ["Distribuzione", "Accumulazione"],
    ],
    thesis: "Un singolo ETF per ottenere esposizione a migliaia di aziende in mercati sviluppati ed emergenti. È semplice da mantenere e coerente con un orizzonte di lungo periodo.",
    risks: ["Il peso degli Stati Uniti supera il 60%.", "Il cambio EUR/USD può amplificare la volatilità.", "Non protegge da perdite temporanee dell'azionario."],
    color: "green",
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    category: "Azione · Tecnologia",
    price: "$ 509,90",
    change: "+1,72%",
    positive: true,
    score: 84,
    scoreLabel: "Qualità alta",
    metrics: [
      ["P/E prospettico", "34,8x"],
      ["Margine operativo", "45,6%"],
      ["Crescita ricavi", "+16,1%"],
      ["Dividend yield", "0,65%"],
    ],
    thesis: "Business diversificato, forte generazione di cassa e posizione competitiva nel cloud. La valutazione richiede però una crescita sostenuta per giustificare il prezzo attuale.",
    risks: ["Valutazione elevata rispetto alla media storica.", "Pressione competitiva nell'intelligenza artificiale.", "Dipendenza dalla crescita del cloud."],
    color: "blue",
  },
  ENI: {
    symbol: "ENI",
    name: "Eni S.p.A.",
    category: "Azione · Energia",
    price: "€ 14,38",
    change: "−0,41%",
    positive: false,
    score: 64,
    scoreLabel: "Da monitorare",
    metrics: [
      ["P/E prospettico", "8,7x"],
      ["Margine operativo", "18,2%"],
      ["Crescita ricavi", "−3,4%"],
      ["Dividend yield", "6,1%"],
    ],
    thesis: "Titolo ciclico con rendimento da dividendo interessante e presenza internazionale. Il profilo dipende molto dal prezzo dell'energia e dalla disciplina sul capitale.",
    risks: ["Sensibilità ai prezzi di petrolio e gas.", "Rischio regolamentare e di transizione energetica.", "Utili meno prevedibili rispetto a settori difensivi."],
    color: "amber",
  },
  "BTP 2037": {
    symbol: "BTP",
    name: "BTP 4,00% — scadenza 2037",
    category: "Obbligazione governativa italiana",
    price: "98,42",
    change: "+0,18%",
    positive: true,
    score: 71,
    scoreLabel: "Coerente",
    metrics: [
      ["Cedola", "4,00%"],
      ["Scadenza", "01/10/2037"],
      ["Rendimento lordo", "4,16%"],
      ["Duration", "8,9"],
    ],
    thesis: "Può contribuire a stabilizzare un portafoglio orientato al medio-lungo periodo, offrendo cedole prevedibili. Il prezzo resta sensibile ai movimenti dei tassi.",
    risks: ["Il prezzo può scendere se i tassi salgono.", "Rischio emittente e concentrazione sull'Italia.", "La liquidità può ridursi in fasi di stress."],
    color: "yellow",
  },
} as const;

type InstrumentKey = keyof typeof instruments;

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <aside className={`analysis-sidebar ${open ? "open" : ""}`}><div className="analysis-brand"><div className="brand-mark"><span /></div><div className="brand-name">atlas<span>.</span></div><button className="analysis-mobile-close" onClick={onClose}><X size={19} /></button></div><div className="analysis-workspace"><span className="workspace-avatar">G</span><span><small>Spazio personale</small><strong>Giulia Rossi</strong></span><ChevronDown size={14} /></div><div className="analysis-nav-label">Il tuo spazio</div><Link href="/"><LayoutDashboard size={17} /><span>Panoramica</span></Link><Link href="/analysis" className="active"><LineChart size={17} /><span>Analisi</span><span className="analysis-nav-badge">3</span></Link><Link href="/"><BarChart3 size={17} /><span>Portafoglio</span></Link><Link href="/"><TrendingUp size={17} /><span>Piani</span></Link><Link href="/"><Globe2 size={17} /><span>Mercati</span></Link><div className="analysis-nav-label gap">Strumenti</div><Link href="/"><Bot size={17} /><span>Agenti AI</span><i className="live-dot" /></Link><Link href="/"><FileText size={17} /><span>Report</span></Link><div className="analysis-sidebar-bottom"><div><ShieldCheck size={15} /> Dati protetti e privati</div><div><CircleHelp size={15} /> Centro assistenza</div><small>Versione beta · Solo a scopo informativo</small></div></aside>;
}

export default function Analysis() {
  const [selected, setSelected] = useState<InstrumentKey>("VWCE");
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("");
  const instrument = instruments[selected];
  const visible = (Object.keys(instruments) as InstrumentKey[]).filter((key) => key.toLowerCase().includes(query.toLowerCase()) || instruments[key].name.toLowerCase().includes(query.toLowerCase()));

  return <div className="analysis-shell"><Sidebar open={mobileNav} onClose={() => setMobileNav(false)} /><main className="analysis-main"><header className="analysis-topbar"><button className="analysis-mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20} /></button><div className="analysis-breadcrumb"><Link href="/">Spazio personale</Link><ChevronRight size={14} /><strong>Analisi strumenti</strong></div><div className="analysis-top-actions"><button><Search size={18} /></button><button><Sparkles size={18} /></button><span className="analysis-avatar">GR</span></div></header><div className="analysis-page"><div className="analysis-heading"><div><span className="analysis-eyebrow"><span className="status-pulse" /> Analisi strumenti</span><h1>Capisci prima di decidere.</h1><p>Un punto di partenza chiaro per leggere azioni, ETF e obbligazioni senza perdersi nei numeri.</p></div><button className="analysis-filter"><CalendarDays size={16} /> Dati aggiornati oggi <ChevronDown size={14} /></button></div><div className="analysis-layout"><aside className="instrument-picker"><div className="picker-heading"><div><span className="analysis-eyebrow">La tua ricerca</span><h2>Strumenti</h2></div><span className="picker-count">{Object.keys(instruments).length}</span></div><div className="picker-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca ticker o nome" /></div><div className="instrument-list">{visible.map((key) => { const item = instruments[key]; return <button key={key} onClick={() => setSelected(key)} className={selected === key ? "selected" : ""}><span className={`instrument-logo ${item.color}`}>{key === "BTP 2037" ? "BTP" : key.slice(0, 2)}</span><span><strong>{key}</strong><small>{item.name}</small></span><ChevronRight size={14} /></button>; })}</div><div className="picker-tip"><Info size={15} /><span>Prova a cercare <strong>VWCE</strong>, <strong>MSFT</strong> o <strong>BTP</strong>.</span></div></aside><section className="analysis-result"><div className="instrument-hero"><div className="instrument-identity"><span className={`instrument-logo large ${instrument.color}`}>{instrument.symbol === "BTP" ? "BTP" : instrument.symbol.slice(0, 2)}</span><div><div className="analysis-eyebrow">{instrument.category}</div><h2>{instrument.name}</h2><span className="instrument-symbol">{instrument.symbol} · Mercato principale</span></div></div><div className="instrument-price"><strong>{instrument.price}</strong><span className={instrument.positive ? "trend-positive" : "trend-negative"}>{instrument.positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}{instrument.change} oggi</span></div></div><div className="analysis-tabs"><button className="active">Sintesi</button><button>Fondamentali</button><button>Valutazione</button><button>Rischi</button><button>Fonti</button></div><div className="analysis-score-grid"><div className="analysis-score-card"><div className="score-ring"><span>{instrument.score}</span><small>/100</small></div><div><span className="analysis-eyebrow">Score Clarity</span><strong>{instrument.scoreLabel}</strong><p>Qualità, valutazione, rischio e coerenza con un portafoglio diversificato.</p></div><Info size={15} /></div><div className="analysis-signal-card"><div><span className="analysis-eyebrow">Segnale sintetico</span><strong>Neutrale positivo</strong><p>Il quadro è interessante, ma la decisione dipende dal tuo orizzonte e dal prezzo di ingresso.</p></div><span className="signal-bars"><i /><i /><i /><i /><i /></span></div></div><div className="analysis-metrics"><div className="section-label"><span className="analysis-eyebrow">Numeri da conoscere</span><button>Vedi tutti <ChevronRight size={14} /></button></div><div className="metrics-grid">{instrument.metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div><div className="analysis-bottom-grid"><div className="analysis-card thesis-card"><div className="card-title"><span className="card-icon mint"><Sparkles size={16} /></span><div><span className="analysis-eyebrow">Analista titoli</span><h3>In parole semplici</h3></div><span className="ai-tag"><Bot size={13} /> AI</span></div><p>{instrument.thesis}</p><button className="outline-action">Chiedi ad Clarity <ChevronRight size={14} /></button></div><div className="analysis-card risk-card-analysis"><div className="card-title"><span className="card-icon amber"><ShieldCheck size={16} /></span><div><span className="analysis-eyebrow">Prima di decidere</span><h3>Rischi principali</h3></div></div><div className="risk-items">{instrument.risks.map((risk) => <div key={risk}><span />{risk}</div>)}</div><button className="outline-action">Approfondisci i rischi <ChevronRight size={14} /></button></div></div><div className="analysis-sources"><span><FileText size={14} /> 12 fonti analizzate · Ultimo aggiornamento 24/09/2026</span><button>Mostra fonti <ChevronRight size={14} /></button></div></section></div><div className="analysis-disclaimer"><LockKeyhole size={13} /> Questa analisi è informativa e utilizza dati demo. Non costituisce consulenza finanziaria o una raccomandazione di acquisto o vendita.</div></div></main></div>;
}
