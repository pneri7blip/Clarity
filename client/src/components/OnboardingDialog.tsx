import { useState } from "react";
import { ArrowRight, Check, ShieldCheck, X } from "lucide-react";

type OnboardingProfile = {
  goal: string;
  horizon: string;
  risk: string;
};

const steps = [
  { key: "goal", title: "Cosa vuoi ottenere?", options: ["Crescita del capitale", "Pensione", "Casa o mutuo", "Gestire meglio i risparmi"] },
  { key: "horizon", title: "Qual è il tuo orizzonte?", options: ["Meno di 3 anni", "3–7 anni", "Oltre 7 anni", "Non lo so ancora"] },
  { key: "risk", title: "Come vivi le oscillazioni?", options: ["Preferisco stabilità", "Accetto oscillazioni moderate", "Accetto forti oscillazioni", "Voglio prima capire meglio"] },
] as const;

export function OnboardingDialog({ onComplete, onClose }: { onComplete: (profile: OnboardingProfile) => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingProfile>>({});
  const current = steps[step];
  const selected = answers[current.key as keyof OnboardingProfile];

  const choose = (value: string) => {
    const next = { ...answers, [current.key]: value } as OnboardingProfile;
    setAnswers(next);
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete(next);
  };

  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <section className="onboarding-card">
        <button className="onboarding-close" onClick={onClose} aria-label="Chiudi"><X size={18} /></button>
        <div className="onboarding-kicker"><ShieldCheck size={15} /> Profilo educativo, non consulenza finanziaria</div>
        <div className="onboarding-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <span className="eyebrow">Passo {step + 1} di {steps.length}</span>
        <h2 id="onboarding-title">Costruiamo il tuo punto di partenza.</h2>
        <p className="onboarding-lead">Tre domande semplici per rendere Clarity più utile alle tue decisioni.</p>
        <h3>{current.title}</h3>
        <div className="onboarding-options">
          {current.options.map((option) => <button key={option} className={selected === option ? "selected" : ""} onClick={() => choose(option)}>{selected === option ? <Check size={16} /> : <span className="option-dot" />}{option}<ArrowRight size={15} /></button>)}
        </div>
        <div className="onboarding-footer"><span>Puoi modificare il profilo in qualsiasi momento.</span><button onClick={onClose}>Salta per ora</button></div>
      </section>
    </div>
  );
}

export type { OnboardingProfile };
