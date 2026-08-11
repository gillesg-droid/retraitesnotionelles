"use client";

import { useMemo, useState } from "react";

type BadgeTone = "rule" | "indicative" | "option" | "warning" | "hypothesis";

type ProgramParams = {
  guaranteeBase: number;
  isolationSupplement: number;
  minimumAge: number;
  guaranteeAge: number;
  notionalRate: number;
  fundedRate: number;
  rampYears: number;
  estateThreshold: number;
  freeSavingsCap: number;
};

const doctrineDefaults: ProgramParams = {
  guaranteeBase: 850,
  isolationSupplement: 200,
  minimumAge: 64,
  guaranteeAge: 65,
  notionalRate: 18,
  fundedRate: 5,
  rampYears: 10,
  estateThreshold: 100000,
  freeSavingsCap: 12500,
};

const retirementSavings = [
  { year: 2, low: 12, high: 18 },
  { year: 5, low: 40, high: 50 },
  { year: 10, low: 70, high: 85 },
  { year: 20, low: 100, high: 125 },
];

const publicBalance = [
  { year: 2, low: 15, high: 20 },
  { year: 5, low: 45, high: 60 },
  { year: 10, low: 80, high: 100 },
  { year: 20, low: 115, high: 145 },
];

const budgetAssumptions = [
  "Non-indexation automatique au-dessus de la garantie minimale",
  "Liquidation possible dès 64 ans et conversion des droits acquis",
  "Compte notionnel public et capitalisation obligatoire jusqu’à 5 %",
  "Intégration de l’Agirc-Arrco avec réserves dédiées aux affiliés",
  "Garantie de 850 € + 200 € d’isolement et récupération successorale",
  "Épargne libre fiscalement encouragée",
];

const openQuestions = [
  {
    title: "Garantie et accès",
    items: [
      "Ressources exactement prises en compte dans le calcul différentiel",
      "Conditions de résidence, de régularité et d’attachement territorial, renvoyées à un autre chapitre non fourni",
      "Contrôle du logement partagé et traitement de l’année entre 64 et 65 ans",
      "Montant et méthode de récupération au-delà de 100 000 € de succession",
    ],
  },
  {
    title: "Compte notionnel",
    items: [
      "Assiette et partage employeur–salarié du taux de 18 %",
      "Indice de revalorisation : masse salariale, salaire moyen ou autre formule",
      "Coefficient démographique, âge de référence et valeur du capital d’ouverture",
      "Ordre de déclenchement des leviers automatiques et financement du fonds de stabilisation",
    ],
  },
  {
    title: "Capitalisation",
    items: [
      "Le taux de 5 % est-il additionnel ou redéployé depuis les cotisations existantes ?",
      "Rendement, frais, allocation, fiscalité et mode de sortie des comptes",
      "Règles de transmission avant et après liquidation",
      "Plafond libre définitif, abondement employeur et rattrapage de carrière",
    ],
  },
  {
    title: "Droits et transition",
    items: [
      "Montant des crédits familiaux, de pénibilité et financement associé",
      "Formule de réversion, notamment après plusieurs unions",
      "Gouvernance et clé d’affectation des réserves Agirc-Arrco",
      "Priorité entre les catégories de transition qui peuvent se chevaucher",
    ],
  },
];

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits }).format(value);
}

function formatMoney(value: number, maximumFractionDigits = 0) {
  return `${formatNumber(value, maximumFractionDigits)} €`;
}

function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function SectionHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {intro ? <p className="section-intro">{intro}</p> : null}
    </div>
  );
}

function SliderControl({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  prefix = "",
  tone,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  tone: BadgeTone;
  hint?: string;
  onChange: (value: number) => void;
}) {
  const update = (raw: string) => {
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) onChange(Math.min(max, Math.max(min, parsed)));
  };

  return (
    <div className="slider-control">
      <div className="control-label-row">
        <label id={`${id}-label`} htmlFor={`${id}-number`}>
          {label}
        </label>
        <Badge tone={tone}>
          {tone === "rule"
            ? "Règle proposée"
            : tone === "indicative"
              ? "Trajectoire indicative"
              : tone === "option"
                ? "Option à arbitrer"
                : tone === "warning"
                  ? "Point de vigilance"
                  : "Hypothèse"}
        </Badge>
      </div>
      {hint ? <p className="control-hint">{hint}</p> : null}
      <div className="control-inputs">
        <input
          id={`${id}-range`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-labelledby={`${id}-label`}
          onChange={(event) => update(event.target.value)}
        />
        <span className="number-wrap">
          {prefix ? <span aria-hidden="true">{prefix}</span> : null}
          <input
            id={`${id}-number`}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => update(event.target.value)}
          />
          {suffix ? <span aria-hidden="true">{suffix}</span> : null}
        </span>
      </div>
    </div>
  );
}

function RangeChart({
  title,
  data,
}: {
  title: string;
  data: { year: number; low: number; high: number }[];
}) {
  const max = 150;
  return (
    <article className="range-chart">
      <div className="chart-heading">
        <h3>{title}</h3>
        <Badge tone="indicative">Md€ constants / an</Badge>
      </div>
      <div className="range-scale" aria-hidden="true">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
      </div>
      <div className="range-rows">
        {data.map((item) => (
          <div className="range-row" key={item.year}>
            <span className="range-year">+{item.year} ans</span>
            <div className="range-track" aria-hidden="true">
              <span
                className="range-band"
                style={{
                  left: `${(item.low / max) * 100}%`,
                  width: `${((item.high - item.low) / max) * 100}%`,
                }}
              />
            </div>
            <strong>{item.low}–{item.high}</strong>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>{title}, fourchettes annuelles en milliards d’euros constants</caption>
        <thead>
          <tr><th>Horizon</th><th>Borne basse</th><th>Borne haute</th></tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.year}><td>{item.year} ans</td><td>{item.low}</td><td>{item.high}</td></tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

function ProgramLab() {
  const [params, setParams] = useState<ProgramParams>({ ...doctrineDefaults });
  const [livingAlone, setLivingAlone] = useState(true);
  const [otherResources, setOtherResources] = useState(600);
  const [monthlyIncome, setMonthlyIncome] = useState(3000);
  const [fundingYears, setFundingYears] = useState(40);
  const [annualReturn, setAnnualReturn] = useState(3);
  const [notionalCapital, setNotionalCapital] = useState(300000);
  const [demographicCoefficient, setDemographicCoefficient] = useState(21);
  const [inflation, setInflation] = useState(2);
  const [contributiveIndexation, setContributiveIndexation] = useState(0);

  const isCustom = Object.entries(doctrineDefaults).some(
    ([key, value]) => params[key as keyof ProgramParams] !== value,
  );

  const results = useMemo(() => {
    const guarantee = params.guaranteeBase + (livingAlone ? params.isolationSupplement : 0);
    const supplement = Math.max(0, guarantee - otherResources);
    const monthlyNotional = monthlyIncome * (params.notionalRate / 100);
    const monthlyFunded = monthlyIncome * (params.fundedRate / 100);
    const monthlyReturn = annualReturn / 100 / 12;
    const months = fundingYears * 12;
    const fundedCapital = monthlyReturn === 0
      ? monthlyFunded * months
      : monthlyFunded * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
    const monthlyPension = notionalCapital / demographicCoefficient / 12;
    const realValue = Math.pow(
      (1 + contributiveIndexation / 100) / (1 + inflation / 100),
      20,
    ) * 100;
    return {
      guarantee,
      supplement,
      monthlyNotional,
      monthlyFunded,
      fundedCapital,
      monthlyPension,
      realValue,
    };
  }, [
    params,
    livingAlone,
    otherResources,
    monthlyIncome,
    annualReturn,
    fundingYears,
    notionalCapital,
    demographicCoefficient,
    inflation,
    contributiveIndexation,
  ]);

  const rampPoints = [
    { year: 1, rate: params.fundedRate * 0.2 },
    { year: Math.max(2, Math.round(params.rampYears * 0.3)), rate: params.fundedRate * 0.4 },
    { year: Math.max(3, Math.round(params.rampYears * 0.5)), rate: params.fundedRate * 0.6 },
    { year: Math.max(4, Math.round(params.rampYears * 0.8)), rate: params.fundedRate * 0.8 },
    { year: params.rampYears, rate: params.fundedRate },
  ];

  const updateParam = (key: keyof ProgramParams, value: number) => {
    setParams((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setParams({ ...doctrineDefaults });
    setLivingAlone(true);
    setOtherResources(600);
    setMonthlyIncome(3000);
    setFundingYears(40);
    setAnnualReturn(3);
    setNotionalCapital(300000);
    setDemographicCoefficient(21);
    setInflation(2);
    setContributiveIndexation(0);
  };

  return (
    <div className="lab-shell">
      <div className="lab-toolbar">
        <div>
          <p className="lab-kicker">Scénario actif</p>
          <p className="lab-status" aria-live="polite">
            {isCustom ? "Exploration personnalisée — différente de la doctrine" : "Paramètres centraux de la doctrine"}
          </p>
        </div>
        <button className="button button-ghost" type="button" onClick={reset}>
          Rétablir la doctrine
        </button>
      </div>

      <div className="lab-grid">
        <fieldset className="lab-controls">
          <legend>1. Réglages du programme</legend>
          <SliderControl id="base" label="Garantie personnelle" value={params.guaranteeBase} min={650} max={1100} step={10} suffix="€" tone="rule" onChange={(value) => updateParam("guaranteeBase", value)} />
          <SliderControl id="isolement" label="Allocation isolement" value={params.isolationSupplement} min={0} max={400} step={10} suffix="€" tone="rule" onChange={(value) => updateParam("isolationSupplement", value)} />
          <SliderControl id="age-min" label="Âge minimal de liquidation" value={params.minimumAge} min={60} max={68} suffix="ans" tone="rule" onChange={(value) => updateParam("minimumAge", value)} />
          <SliderControl id="age-garantie" label="Âge d’accès à la garantie" value={params.guaranteeAge} min={60} max={70} suffix="ans" tone="rule" onChange={(value) => updateParam("guaranteeAge", value)} />
          <SliderControl id="notionnel" label="Cotisation au compte notionnel" value={params.notionalRate} min={12} max={24} step={0.5} suffix="%" tone="rule" hint="L’assiette et le partage employeur–salarié restent à préciser." onChange={(value) => updateParam("notionalRate", value)} />
          <SliderControl id="capitalisation" label="Capitalisation obligatoire cible" value={params.fundedRate} min={1} max={8} step={0.5} suffix="%" tone="rule" hint="La doctrine ne tranche pas si ce taux s’ajoute aux cotisations ou en remplace une part." onChange={(value) => updateParam("fundedRate", value)} />
          <SliderControl id="rampe" label="Durée de montée en charge" value={params.rampYears} min={5} max={15} suffix="ans" tone="indicative" onChange={(value) => updateParam("rampYears", value)} />
          <SliderControl id="succession" label="Seuil de récupération successorale" value={params.estateThreshold} min={50000} max={200000} step={5000} suffix="€" tone="rule" onChange={(value) => updateParam("estateThreshold", value)} />
          <SliderControl id="plafond-libre" label="Plafond annuel d’épargne libre" value={params.freeSavingsCap} min={10000} max={15000} step={500} suffix="€" tone="option" hint="La note propose une fourchette, sans fixer le montant final." onChange={(value) => updateParam("freeSavingsCap", value)} />
        </fieldset>

        <div className="lab-results">
          <article className="result-card result-guarantee">
            <div className="result-card-head">
              <div><p className="card-index">A</p><h3>Garantie différentielle</h3></div>
              <Badge tone="rule">Calcul dérivé</Badge>
            </div>
            <div className="segmented" role="group" aria-label="Situation résidentielle">
              <button type="button" aria-pressed={livingAlone} onClick={() => setLivingAlone(true)}>Vit seul</button>
              <button type="button" aria-pressed={!livingAlone} onClick={() => setLivingAlone(false)}>Logement partagé</button>
            </div>
            <SliderControl id="ressources" label="Autres ressources mensuelles" value={otherResources} min={0} max={1600} step={50} suffix="€" tone="hypothesis" onChange={setOtherResources} />
            <div className="guarantee-equation">
              <span><small>Ressources</small>{formatMoney(otherResources)}</span>
              <b aria-hidden="true">+</b>
              <span><small>Complément</small>{formatMoney(results.supplement)}</span>
              <b aria-hidden="true">=</b>
              <span className="equation-total"><small>Revenu garanti</small>{formatMoney(Math.max(otherResources, results.guarantee))}</span>
            </div>
            <p className="fine-print">À partir de {params.guaranteeAge} ans. Ce calcul suppose une dégressivité euro pour euro, lecture la plus directe du mot « différentielle » ; l’assiette des ressources n’est pas définie dans la note.</p>
          </article>

          <article className="result-card">
            <div className="result-card-head">
              <div><p className="card-index">B</p><h3>Flux mensuels d’un actif</h3></div>
              <Badge tone="hypothesis">Cas-type</Badge>
            </div>
            <SliderControl id="revenu" label="Revenu d’activité mensuel" value={monthlyIncome} min={1000} max={8000} step={100} suffix="€" tone="hypothesis" onChange={setMonthlyIncome} />
            <div className="flow-bars" aria-label={`Sur ${formatMoney(monthlyIncome)} mensuels : ${formatMoney(results.monthlyNotional)} inscrits au compte notionnel et ${formatMoney(results.monthlyFunded)} investis si la capitalisation est additionnelle.`}>
              <div className="flow-row">
                <span>Compte virtuel en répartition</span>
                <div className="flow-track"><i className="flow-notional" style={{ width: `${Math.min(100, params.notionalRate * 4)}%` }} /></div>
                <strong>{formatMoney(results.monthlyNotional)}</strong>
              </div>
              <div className="flow-row">
                <span>Actifs financiers réels</span>
                <div className="flow-track"><i className="flow-funded" style={{ width: `${Math.min(100, params.fundedRate * 4)}%` }} /></div>
                <strong>{formatMoney(results.monthlyFunded)}</strong>
              </div>
            </div>
            <div className="warning-strip"><span>!</span><p>Les deux montants ne doivent être additionnés que si les {params.fundedRate} % sont bien additionnels. La doctrine laisse ce financement ouvert.</p></div>
          </article>

          <article className="result-card">
            <div className="result-card-head">
              <div><p className="card-index">C</p><h3>Montée de la capitalisation</h3></div>
              <Badge tone="indicative">Trajectoire</Badge>
            </div>
            <div className="ramp-chart" aria-label={`Trajectoire indicative jusqu’à ${params.fundedRate} % en ${params.rampYears} ans`}>
              {rampPoints.map((point, index) => (
                <div className="ramp-column" key={`${point.year}-${index}`}>
                  <strong>{formatNumber(point.rate, 1)} %</strong>
                  <div className="ramp-bar-wrap" aria-hidden="true"><i style={{ height: `${(point.rate / 8) * 100}%` }} /></div>
                  <span>An {point.year}</span>
                </div>
              ))}
            </div>
            <p className="fine-print">La doctrine fixe les jalons 1 %, 2 %, 3 %, 4 %, 5 % aux années 1, 3, 5, 8 et 10. En scénario personnalisé, le graphique redimensionne ces cinq paliers à titre illustratif.</p>
          </article>

          <article className="result-card">
            <div className="result-card-head">
              <div><p className="card-index">D</p><h3>Capital réellement investi</h3></div>
              <Badge tone="hypothesis">Illustration</Badge>
            </div>
            <div className="two-controls">
              <SliderControl id="duree-epargne" label="Durée" value={fundingYears} min={5} max={45} suffix="ans" tone="hypothesis" onChange={setFundingYears} />
              <SliderControl id="rendement" label="Rendement net annuel" value={annualReturn} min={0} max={7} step={0.5} suffix="%" tone="hypothesis" onChange={setAnnualReturn} />
            </div>
            <p className="big-result">{formatMoney(results.fundedCapital)}</p>
            <p className="result-label">capital indicatif après {fundingYears} ans, avec versements mensuels de {formatMoney(results.monthlyFunded)}</p>
            <p className="fine-print">Ce capital est une illustration mathématique hors inflation. Le rendement, les frais, le risque et le mode de sortie ne sont pas fixés par la doctrine.</p>
          </article>

          <article className="result-card">
            <div className="result-card-head">
              <div><p className="card-index">E</p><h3>Formule notionnelle</h3></div>
              <Badge tone="hypothesis">Coefficient saisi</Badge>
            </div>
            <div className="two-controls">
              <SliderControl id="capital-notionnel" label="Capital notionnel à la retraite" value={notionalCapital} min={50000} max={800000} step={10000} suffix="€" tone="hypothesis" onChange={setNotionalCapital} />
              <SliderControl id="coefficient" label="Coefficient démographique" value={demographicCoefficient} min={15} max={30} step={0.5} tone="hypothesis" onChange={setDemographicCoefficient} />
            </div>
            <div className="formula-box">
              <span>{formatMoney(notionalCapital)}</span><b>÷</b><span>{formatNumber(demographicCoefficient, 1)}</span><b>÷ 12</b><strong>{formatMoney(results.monthlyPension)}</strong>
            </div>
            <p className="fine-print">La division est conforme à la formule de la note. La valeur du coefficient, elle, n’est pas fournie : ce résultat n’est pas une estimation individuelle.</p>
          </article>

          <article className="result-card">
            <div className="result-card-head">
              <div><p className="card-index">F</p><h3>Effet de la non-indexation</h3></div>
              <Badge tone="warning">Pouvoir d’achat</Badge>
            </div>
            <div className="two-controls">
              <SliderControl id="inflation" label="Inflation annuelle" value={inflation} min={0} max={6} step={0.5} suffix="%" tone="hypothesis" onChange={setInflation} />
              <SliderControl id="revalorisation" label="Revalorisation contributive" value={contributiveIndexation} min={0} max={6} step={0.5} suffix="%" tone="hypothesis" onChange={setContributiveIndexation} />
            </div>
            <div className="purchasing-bars">
              <div><span>Garantie indexée</span><i style={{ width: "100%" }} /><strong>100 %</strong></div>
              <div><span>Part contributive après 20 ans</span><i style={{ width: `${Math.min(100, results.realValue)}%` }} /><strong>{formatNumber(results.realValue, 1)} %</strong></div>
            </div>
            <p className="fine-print">Valeur réelle d’un montant nominal, sous hypothèses constantes. Une pension non indexée ne baisse pas en euros courants, mais perd du pouvoir d’achat lorsque les prix augmentent.</p>
          </article>
        </div>
      </div>
      <div className="lab-disclaimer">
        <strong>Ce laboratoire n’est pas une simulation actuarielle.</strong>
        <p>Il n’établit aucun droit et ne recalcule pas les économies publiques. Les fourchettes budgétaires restent celles de la note, car aucun modèle causal n’y relie les curseurs.</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <header className="site-header">
        <a className="brand" href="#accueil" aria-label="Retraites autrement, retour en haut">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span><strong>Retraites</strong><small>autrement</small></span>
        </a>
        <nav aria-label="Navigation principale">
          <a href="#diagnostic">Pourquoi</a>
          <a href="#architecture">Le système</a>
          <a href="#laboratoire">Laboratoire</a>
          <a href="#transition">Transition</a>
          <a href="#chiffrage">Chiffrage</a>
          <a href="#questions">Questions ouvertes</a>
        </nav>
        <button className="print-button" type="button" onClick={() => window.print()}>
          Imprimer <span aria-hidden="true">↗</span>
        </button>
      </header>

      <main id="contenu">
        <section className="hero" id="accueil">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Doctrine retraites · version expliquée</p>
              <h1>Garantir.<br />Contribuer.<br /><em>Posséder.</em></h1>
              <p className="hero-lead">Une proposition de réforme systémique, inspirée du modèle suédois, pour séparer clairement la solidarité, les droits contributifs et le patrimoine retraite.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#architecture">Comprendre en 3 minutes</a>
                <a className="button button-secondary" href="#laboratoire">Piloter les paramètres</a>
              </div>
              <p className="source-note"><span aria-hidden="true">●</span> Présentation fidèle d’une note doctrinale. Les affirmations et chiffrages sont ceux du document source ; ils ne sont pas ici vérifiés par une expertise externe.</p>
            </div>
            <aside className="hero-dashboard" aria-label="Trois paramètres centraux">
              <p className="dashboard-label">Le projet en trois nombres</p>
              <div className="hero-metric hero-metric-large">
                <strong>1 050 €</strong>
                <span>minimum garanti pour une personne seule</span>
              </div>
              <div className="hero-metric-row">
                <div className="hero-metric"><strong>18 %</strong><span>compte notionnel public</span></div>
                <div className="hero-metric metric-accent"><strong>5 %</strong><span>capitalisation obligatoire cible</span></div>
              </div>
              <div className="mini-system" aria-hidden="true">
                <span>solidarité</span><i /><span>contribution</span><i /><span>propriété</span>
              </div>
              <p className="dashboard-quote">« Une retraite garantie pour les plus modestes, proportionnelle pour les cotisants, capitalisée pour les générations futures. »</p>
            </aside>
          </div>
          <div className="hero-foot">
            <span>Temps de lecture rapide : 3 min</span>
            <a href="#diagnostic">Commencer <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section className="section diagnostic" id="diagnostic">
          <SectionHeading eyebrow="01 · Le constat de la note" title="Pourquoi reconstruire le système ?" intro="Le diagnostic doctrinal tient en quatre défauts structurels. Les chiffres ci-dessous sont présentés comme les affirmations de la note, faute de sources externes jointes." />
          <div className="diagnostic-layout">
            <div className="diagnostic-stat">
              <p>Dépenses de retraite en 2025</p>
              <strong>≈ 422</strong>
              <span>milliards d’euros</span>
              <div className="pi-bar"><i style={{ width: "72%" }} /></div>
              <p className="stat-caption">soit <b>plus de 14 % du PIB</b>, selon le document</p>
            </div>
            <div className="fault-grid">
              <article><span>01</span><h3>Coûteux</h3><p>Une part très élevée de la richesse nationale est consacrée aux pensions publiques.</p></article>
              <article><span>02</span><h3>Fragile</h3><p>La quasi-dépendance à la répartition expose le système à la fécondité, à la longévité et au ratio actifs–retraités.</p></article>
              <article><span>03</span><h3>Illisible</h3><p>Régimes, trimestres, points, décotes, réversions et conventions diverses empêchent les assurés de voir leurs droits.</p></article>
              <article><span>04</span><h3>Confus</h3><p>Solidarité, assurance, famille, emploi senior et épargne longue sont mêlés au lieu d’être financés séparément.</p></article>
            </div>
          </div>
          <div className="separation-diagram">
            <div className="diagram-before">
              <p className="diagram-label">Aujourd’hui, selon la note</p>
              <div className="tangled"><span>solidarité</span><span>cotisations</span><span>famille</span><span>épargne</span><span>emploi senior</span></div>
            </div>
            <div className="diagram-arrow" aria-hidden="true">→</div>
            <div className="diagram-after">
              <p className="diagram-label">Système cible</p>
              <div className="separated"><span><b>1</b> Solidarité nationale</span><span><b>2</b> Contribution individuelle</span><span><b>3</b> Propriété patrimoniale</span></div>
            </div>
          </div>
        </section>

        <section className="section architecture" id="architecture">
          <SectionHeading eyebrow="02 · L’architecture" title="Trois fonctions. Quatre étages." intro="La doctrine parle de trois piliers : le troisième, patrimonial, comporte une part obligatoire et un étage libre. Le schéma distingue donc quatre mécanismes opérationnels sans masquer cette convention." />
          <div className="system-map">
            <article className="pillar pillar-solidarity">
              <div className="pillar-top"><span>01</span><Badge tone="rule">Impôt</Badge></div>
              <p className="pillar-function">Solidarité</p>
              <h3>Garantie vieillesse nationale</h3>
              <p>Un complément différentiel jusqu’à 850 €, majoré de 200 € pour une personne vivant seule.</p>
              <ul><li>Non imposable</li><li>À partir de 65 ans</li><li>Succession : seuil de 100 000 €</li></ul>
              <a href="#garantie">Voir le filet de sécurité <span aria-hidden="true">→</span></a>
            </article>
            <article className="pillar pillar-contribution">
              <div className="pillar-top"><span>02</span><Badge tone="rule">Cotisations</Badge></div>
              <p className="pillar-function">Contribution</p>
              <h3>Compte notionnel public</h3>
              <p>Un compte virtuel rend chaque droit visible, tout en restant financé en répartition.</p>
              <ul><li>Taux proposé : 18 %</li><li>Liquidation dès 64 ans</li><li>Équilibre automatique</li></ul>
              <a href="#notionnel">Comprendre le compte <span aria-hidden="true">→</span></a>
            </article>
            <article className="pillar pillar-property">
              <div className="pillar-top"><span>03</span><Badge tone="rule">Actifs réels</Badge></div>
              <p className="pillar-function">Propriété</p>
              <h3>Capitalisation obligatoire</h3>
              <p>Un compte personnel investi à long terme, avec un fonds public par défaut.</p>
              <ul><li>Cible : 5 %</li><li>Portable et personnel</li><li>Sécurisé avec l’âge</li></ul>
              <a href="#capitalisation">Explorer la capitalisation <span aria-hidden="true">→</span></a>
              <div className="optional-floor"><span>Étage facultatif</span><strong>Épargne libre type 401(k)</strong><small>Versements volontaires, employeur possible, fiscalité encadrée</small></div>
            </article>
          </div>
          <div className="principles-row" aria-label="Qualités recherchées">
            <span>Règles universelles</span><span>Droits individuels</span><span>Cœur contributif</span><span>Équilibre automatique</span><span>Liberté d’épargne</span><span>Capital productif</span>
          </div>
        </section>

        <section className="section lab-section" id="laboratoire">
          <SectionHeading eyebrow="03 · Laboratoire des paramètres" title="Voir les choix. Tester leurs effets." intro="Les curseurs font comprendre la mécanique. Ils séparent les règles écrites dans la doctrine, les options encore ouvertes et les hypothèses nécessaires à une illustration." />
          <ProgramLab />
        </section>

        <section className="section guarantee-section" id="garantie">
          <SectionHeading eyebrow="04 · Premier pilier" title="Un plancher de dignité, pas un revenu universel senior" intro="La garantie remplace l’ASPA et les minima vieillesse. Elle complète les ressources, elle ne verse pas automatiquement la totalité du barème à chacun." />
          <div className="guarantee-cases">
            <article className="case-card case-featured"><p>Personne vivant seule</p><strong>850 € <span>+</span> 200 €</strong><b>= 1 050 € / mois</b><small>L’allocation isolement compense l’absence de mutualisation des charges fixes.</small></article>
            <article className="case-card"><p>Logement partagé</p><strong>850 €</strong><b>par personne / mois</b><small>Le critère est le partage réel du logement, non le mariage ou le statut administratif.</small></article>
            <article className="case-card"><p>Deux bénéficiaires</p><strong>1 700 €</strong><b>pour le couple / mois</b><small>La note écarte 2 100 €, au nom des économies de logement, énergie et équipement.</small></article>
          </div>
          <div className="guarantee-details">
            <div className="rule-stack">
              <article><span>Accès</span><p>À <strong>65 ans</strong>, avec une voie anticipée possible pour invalidité lourde ou incapacité durable médicalement objectivée.</p></article>
              <article><span>Financement</span><p>Par <strong>l’impôt</strong>. Le droit est individuel, le versement individuel et la prestation non imposable.</p></article>
              <article><span>Succession</span><p>Récupération envisagée au-delà de <strong>100 000 € d’actif net</strong>, afin de préserver un premier patrimoine sans financer une transmission importante.</p></article>
            </div>
            <aside className="clarity-box">
              <Badge tone="warning">À préciser</Badge>
              <h3>Le principe est fixé, son mode d’emploi ne l’est pas encore</h3>
              <p>La note renvoie les critères de résidence et d’attachement territorial à des chapitres antérieurs sur un revenu universel qui ne figurent pas dans le document fourni. Elle ne définit pas non plus les ressources comptabilisées ni la méthode exacte de récupération successorale.</p>
              <p className="age-gap"><b>64</b><span>liquidation contributive possible</span><i /><b>65</b><span>garantie ordinaire accessible</span></p>
              <small>Cette année d’écart appelle une règle complémentaire pour les personnes sans ressources suffisantes.</small>
            </aside>
          </div>
        </section>

        <section className="section notional-section" id="notionnel">
          <SectionHeading eyebrow="05 · Deuxième pilier" title="Un compte visible qui reste en répartition" intro="Le capital notionnel est une écriture comptable : il mesure des droits, mais il n’est ni placé sur les marchés ni transmissible comme un portefeuille." />
          <div className="notional-journey">
            <article><span>1</span><h3>Évaluer</h3><p>Les droits acquis dans les anciens régimes sont estimés.</p></article>
            <i aria-hidden="true">→</i>
            <article><span>2</span><h3>Convertir</h3><p>Leur valeur actuarielle devient un capital notionnel d’ouverture.</p></article>
            <i aria-hidden="true">→</i>
            <article><span>3</span><h3>Créditer</h3><p>Chaque nouvelle cotisation à 18 % alimente le compte virtuel.</p></article>
            <i aria-hidden="true">→</i>
            <article><span>4</span><h3>Liquider</h3><p>Le capital est divisé par un coefficient lié à la génération.</p></article>
          </div>
          <div className="notional-grid">
            <div className="formula-panel">
              <p className="panel-label">La formule de la doctrine</p>
              <div className="large-formula"><span>Pension annuelle</span><b>=</b><span>capital notionnel accumulé</span><i /><span>coefficient de conversion démographique</span></div>
              <p>Le compte serait revalorisé selon une règle macroéconomique objective — masse salariale, salaire moyen ou formule inscrite dans une loi organique. Partir plus tard agit normalement deux fois : davantage de cotisations au numérateur et un coefficient plus favorable. Les formules restent à écrire.</p>
            </div>
            <div className="virtual-real">
              <article><Badge tone="rule">Compte notionnel</Badge><strong>Virtuel</strong><p>Les cotisations des actifs financent toujours les pensions courantes. Le compte rend seulement les droits individuels lisibles.</p></article>
              <article><Badge tone="rule">Compte capitalisé</Badge><strong>Réel</strong><p>Les sommes sont investies dans des actifs financiers détenus au bénéfice du titulaire.</p></article>
            </div>
          </div>
          <div className="balance-loop">
            <div className="loop-trigger"><span>Démographie et trajectoire financière</span><b>Signal de déséquilibre</b></div>
            <div className="loop-arrow" aria-hidden="true">↓</div>
            <div className="loop-levers"><span>Revalorisation des comptes</span><span>Coefficient de conversion</span><span>Âge de référence</span><span>Indexation des pensions</span><span>Fonds de stabilisation</span></div>
            <p>Le principe : ajuster automatiquement ces leviers plutôt que laisser le taux de cotisation dériver indéfiniment. La hiérarchie et les seuils de déclenchement ne sont pas définis.</p>
          </div>
          <div className="indexation-callout">
            <div><p className="panel-label">Règle d’indexation</p><h3>Le minimum est protégé. L’excédent ne l’est pas automatiquement.</h3></div>
            <p>Les pensions déjà liquidées ne baissent pas nominalement, mais leur part contributive peut perdre du pouvoir d’achat. Une revalorisation éventuelle dépend de la situation du système ; l’équilibrage peut la limiter ou la suspendre. La note en fait le principal levier d’économies à court et moyen terme.</p>
          </div>
        </section>

        <section className="section capital-section" id="capitalisation">
          <SectionHeading eyebrow="06 · Pilier patrimonial" title="Devenir propriétaire d’une part de sa retraite" intro="Le projet associe un compte obligatoire montant progressivement à 5 % et une épargne facultative. Le financement de la bascule est identifié comme un risque central." />
          <div className="capital-quote">« Les Français ne doivent plus être seulement des cotisants. Ils doivent devenir propriétaires de leur retraite. »</div>
          <div className="capital-objectives" aria-label="Quatre objectifs de la capitalisation obligatoire">
            <span><b>01</b>Augmenter le patrimoine financier des ménages</span>
            <span><b>02</b>Financer davantage l’économie productive</span>
            <span><b>03</b>Réduire la dépendance exclusive à la démographie</span>
            <span><b>04</b>Responsabiliser les actifs sur leur horizon retraite</span>
          </div>
          <div className="capital-grid">
            <article className="capital-card mandatory-card">
              <div className="card-title-row"><span>Obligatoire</span><strong>5 % cible</strong></div>
              <h3>Un compte personnel investi à long terme</h3>
              <ul className="check-list"><li>Personnel, portable et incessible hors cas légaux</li><li>Sécurisation progressive à l’approche de la retraite</li><li>Transmission possible avant liquidation, selon des règles à définir</li><li>Fonds public par défaut pour celles et ceux qui ne choisissent pas</li></ul>
              <div className="ramp-static" aria-label="Montée indicative de 1 à 5 pour cent en dix ans">
                {[{ y: 1, r: 1 }, { y: 3, r: 2 }, { y: 5, r: 3 }, { y: 8, r: 4 }, { y: 10, r: 5 }].map((point) => <span key={point.y} style={{ height: `${point.r * 18}%` }}><b>{point.r} %</b><small>An {point.y}</small></span>)}
              </div>
              <p className="fine-print">Cette montée peut être accélérée si les économies d’indexation et de transition le permettent.</p>
            </article>
            <article className="capital-card free-card">
              <div className="card-title-row"><span>Facultatif</span><strong>10–15 k€ / an</strong></div>
              <h3>Une épargne libre, populaire et portable</h3>
              <ul className="check-list"><li>Ouverte aux salariés, indépendants et fonctionnaires</li><li>Versements volontaires et abondement employeur possible</li><li>Déduction à l’entrée, plus-values non taxées chaque année</li><li>Imposition à la sortie, avec rente ou capital partiel</li></ul>
              <p className="option-note"><Badge tone="option">Option recommandée</Badge> Le plafond, sa majoration et le rattrapage pour carrières interrompues restent à arbitrer afin d’éviter une niche pour hauts revenus.</p>
            </article>
          </div>
          <div className="fund-rules">
            <div><p className="panel-label">Fonds privés agréés</p><h3>Six garde-fous</h3></div>
            <ol><li>Frais plafonnés</li><li>Diversification obligatoire</li><li>Produits complexes interdits</li><li>Reporting standardisé</li><li>Sécurisation par âge</li><li>Contrôle prudentiel renforcé</li></ol>
          </div>
          <div className="unlock-flow">
            <p className="panel-label">Déblocage anticipé envisagé pour le compte libre</p>
            <div><span>Invalidité</span><span>Décès du conjoint</span><span>Fin de droits prolongée</span><span>Résidence principale encadrée</span><span>Surendettement</span><span>Accident grave de la vie</span></div>
          </div>
          <div className="transition-warning">
            <Badge tone="warning">Risque de transition</Badge>
            <h3>Investir 5 % aujourd’hui, c’est autant qui peut manquer à la répartition</h3>
            <p>La doctrine refuse un prélèvement intégral immédiat. Elle répond par une montée progressive, les économies d’indexation, l’usage cantonné des réserves Agirc-Arrco pour leurs affiliés et le maintien des 18 % notionnels. Elle ne tranche toutefois pas si les 5 % sont additionnels ou redéployés.</p>
          </div>
        </section>

        <section className="section agirc-section" id="agirc-arrco">
          <SectionHeading eyebrow="07 · Cas institutionnel sensible" title="Agirc-Arrco : deux compartiments, une même frontière" intro="La note assume en interne une reprise en main publique. Elle exige que les droits et réserves restent exclusivement au bénéfice des affiliés historiques." />
          <div className="agirc-flow">
            <div className="agirc-source"><span>Avant</span><strong>Droits + réserves Agirc-Arrco</strong><p>Régime complémentaire obligatoire des salariés du privé</p></div>
            <div className="split-lines" aria-hidden="true"><i /><i /></div>
            <div className="agirc-targets">
              <article><span>Compartiment 1</span><h3>Conversion notionnelle</h3><p>Les droits assimilables à une pension publique complémentaire sont individualisés.</p></article>
              <article><span>Compartiment 2</span><h3>Capitalisation collective</h3><p>Les réserves amorcent un fonds de pension dédié aux affiliés historiques.</p></article>
            </div>
          </div>
          <div className="boundary-grid">
            <article className="boundary-yes"><span aria-hidden="true">✓</span><div><h3>Ce que le fonds doit faire</h3><ul><li>Sécuriser la transition des droits</li><li>Créer un socle de capitalisation collective</li><li>Rendre visible un patrimoine retraite investi</li><li>Être public, transparent et strictement cantonné</li></ul></div></article>
            <article className="boundary-no"><span aria-hidden="true">×</span><div><h3>Ce qu’il ne peut pas faire</h3><ul><li>Financer le budget général de l’État</li><li>Combler les déficits courants</li><li>Mutualiser les réserves avec les non-affiliés</li><li>Rompre l’affectation aux cotisants historiques</li></ul></div></article>
          </div>
          <div className="language-note"><div><Badge tone="warning">Objection anticipée</Badge><h3>« Spoliation » ou captation des réserves</h3></div><p><strong>Réponse de la doctrine :</strong> les réserves sont sanctuarisées, les bénéficiaires restent les mêmes et les droits deviennent identifiables. En communication externe, la note recommande « intégration au système universel » et « sanctuarisation » ; en interne, elle reconnaît une nationalisation.</p></div>
        </section>

        <section className="section solidarity-section" id="solidarites">
          <SectionHeading eyebrow="08 · Situations de vie" title="Rendre les solidarités explicites" intro="Famille, pénibilité et réversion ne disparaissent pas : elles sortent des règles opaques pour être identifiées, financées et justifiées séparément." />
          <div className="solidarity-grid">
            <article>
              <p className="card-index">A</p><h3>Famille et interruptions</h3>
              <p>L’État finance et crédite le compte notionnel pour :</p>
              <ul><li>Maternité</li><li>Congé parental</li><li>Réduction d’activité pour éducation</li><li>Aidance reconnue</li><li>Famille monoparentale</li></ul>
              <small>Crédits plafonnés et calibrés contre les effets d’aubaine ; montants non fixés.</small>
            </article>
            <article>
              <p className="card-index">B</p><h3>Pénibilité et incapacité</h3>
              <blockquote>« Protéger les corps abîmés, pas les statuts. »</blockquote>
              <ul><li>Départ anticipé sur incapacité objectivée</li><li>Crédits pour exposition lourde</li><li>Contraintes opérationnelles réelles</li><li>Extinction des régimes spéciaux sans justification</li></ul>
              <small>Militaires, policiers, pompiers et surveillants pénitentiaires peuvent garder des règles explicites et financées.</small>
            </article>
            <article>
              <p className="card-index">C</p><h3>Réversion réformée</h3>
              <ul><li>Harmonisation public–privé</li><li>Proratisation selon la vie commune</li><li>Priorité à un statut juridique stable</li><li>Prise en compte des enfants élevés</li><li>Articulation avec la garantie</li><li>Fin des règles généreuses non financées</li></ul>
              <small>La réversion est maintenue ; sa formule précise reste ouverte.</small>
            </article>
          </div>
        </section>

        <section className="section transition-section" id="transition">
          <SectionHeading eyebrow="09 · Transition générationnelle" title="Ni big bang, ni statu quo" intro="La doctrine veut éviter à la fois un basculement anxiogène et une transition sans rendement budgétaire. Les droits passés sont convertis plutôt que recalculés intégralement." />
          <div className="transition-table-wrap">
            <table className="transition-table">
              <thead><tr><th>Situation au moment de la réforme</th><th>Traitement proposé</th><th>Intensité du nouveau système</th></tr></thead>
              <tbody>
                <tr><td><span className="cohort-dot c1" />Déjà retraité</td><td>Pension nominale maintenue ; nouvelle règle d’indexation</td><td><span className="intensity"><i style={{ width: "10%" }} /></span><b>Indexation seule</b></td></tr>
                <tr><td><span className="cohort-dot c2" />À moins de 5 ans</td><td>Droits acquis très largement préservés</td><td><span className="intensity"><i style={{ width: "25%" }} /></span><b>Faible</b></td></tr>
                <tr><td><span className="cohort-dot c3" />À 5–15 ans</td><td>Acquis convertis ; nouveaux droits notionnels</td><td><span className="intensity"><i style={{ width: "50%" }} /></span><b>Partielle</b></td></tr>
                <tr><td><span className="cohort-dot c4" />À 15–25 ans</td><td>Bascule majoritaire vers le nouveau système</td><td><span className="intensity"><i style={{ width: "75%" }} /></span><b>Majoritaire</b></td></tr>
                <tr><td><span className="cohort-dot c5" />Moins de 40 ans</td><td>Nouveau système complet</td><td><span className="intensity"><i style={{ width: "100%" }} /></span><b>Complète</b></td></tr>
              </tbody>
            </table>
          </div>
          <div className="transition-notes">
            <p><strong>Promesse politique :</strong> stabilité pour les générations proches, « libération » pour les plus jeunes.</p>
            <p><Badge tone="warning">Chevauchement</Badge> « Moins de 40 ans » peut recouper les catégories exprimées en années avant la retraite. La règle de priorité n’est pas écrite.</p>
          </div>
          <div className="rights-conversion"><span>Anciens régimes</span><i aria-hidden="true">→</i><span>Évaluation actuarielle</span><i aria-hidden="true">→</i><strong>Capital notionnel d’ouverture visible</strong><i aria-hidden="true">+</i><span>Nouvelles règles communes</span></div>
        </section>

        <section className="section budget-section" id="chiffrage">
          <SectionHeading eyebrow="10 · Chiffrage indicatif" title="Des fourchettes programmatiques, pas une prévision actuarielle" intro="Les bandes affichent exactement les ordres de grandeur du document. Elles ne bougent pas avec le laboratoire : la note ne fournit pas les élasticités nécessaires pour les recalculer." />
          <div className="budget-charts">
            <RangeChart title="Gain annuel sur les dépenses de retraite" data={retirementSavings} />
            <RangeChart title="Gain annuel sur le solde public total" data={publicBalance} />
          </div>
          <div className="budget-method">
            <div><p className="panel-label">Scénario relativement agressif</p><h3>Ce que les fourchettes supposent</h3><ul>{budgetAssumptions.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <aside><strong>Pourquoi le solde public dépasse les économies de retraite ?</strong><p>La note invoque l’emploi senior, des cotisations supplémentaires, les effets fiscaux et de moindres charges d’intérêts à long terme, sans en donner le détail quantitatif.</p><p>Comparer mécaniquement les gains à 20 ans aux 422 Md€ de 2025 serait trompeur : il manque la dépense future contrefactuelle.</p></aside>
          </div>
        </section>

        <section className="section risk-section" id="risques">
          <SectionHeading eyebrow="11 · Risques assumés" title="Ce qui sera contesté — et la réponse prévue" intro="La note ne présente pas seulement des avantages. Elle identifie quatre risques politiques et économiques majeurs." />
          <div className="risk-matrix">
            <article><div><span>01</span><h3>Risque social</h3><p>La non-indexation sera contestée par les retraités moyens et aisés.</p></div><div><b>Réponse doctrinale</b><p>Minimum protégé, pas de baisse nominale ; les actifs ne peuvent absorber seuls l’ajustement.</p></div></article>
            <article><div><span>02</span><h3>Risque Agirc-Arrco</h3><p>La reprise publique peut être dénoncée comme une spoliation.</p></div><div><b>Réponse doctrinale</b><p>Réserves cantonnées, droits individualisés, bénéficiaires historiques inchangés.</p></div></article>
            <article><div><span>03</span><h3>Coût de transition</h3><p>Une bascule rapide vers 5 % creuserait le financement de la répartition.</p></div><div><b>Réponse doctrinale</b><p>Montée progressive, économies d’indexation, réserves dédiées et maintien des 18 %.</p></div></article>
            <article><div><span>04</span><h3>Inégalités patrimoniales</h3><p>La capitalisation favorise les carrières longues et continues.</p></div><div><b>Réponse doctrinale</b><p>Fonds public peu coûteux, garantie, crédits familiaux, plafond fiscal et abondements bas revenus si nécessaire.</p></div></article>
          </div>
        </section>

        <section className="section questions-section" id="questions">
          <SectionHeading eyebrow="12 · Transparence" title="Les arbitrages qu’il reste à écrire" intro="Le texte fixe une direction et plusieurs paramètres, mais pas une loi prête à appliquer. Ces questions sont conservées visibles pour ne pas transformer une doctrine en fausse simulation précise." />
          <div className="question-grid">
            {openQuestions.map((group, index) => (
              <details key={group.title} open={index === 0}>
                <summary><span>0{index + 1}</span>{group.title}<i aria-hidden="true">+</i></summary>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </details>
            ))}
          </div>
          <div className="status-table-wrap">
            <table className="status-table">
              <caption>Statut des principaux paramètres</caption>
              <thead><tr><th>Statut</th><th>Éléments concernés</th></tr></thead>
              <tbody>
                <tr><td><Badge tone="rule">Règle proposée</Badge></td><td>850 € + 200 €, 65 ans, 100 000 €, 18 %, 64 ans, cible 5 %</td></tr>
                <tr><td><Badge tone="indicative">Trajectoire indicative</Badge></td><td>Montée 1–5 % sur dix ans, économies à 2/5/10/20 ans</td></tr>
                <tr><td><Badge tone="option">Option à arbitrer</Badge></td><td>Plafond libre 10–15 k€, fiscalité, déblocages, abondements et rattrapage</td></tr>
                <tr><td><Badge tone="hypothesis">Hypothèse pédagogique</Badge></td><td>Inflation, rendement, durée, coefficient démographique saisis dans le laboratoire</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section doctrine-index" id="doctrine-integrale">
          <SectionHeading eyebrow="13 · Carte exhaustive" title="Les 17 chapitres de la doctrine, sans angle mort" intro="Cette carte permet de vérifier que chaque idée du document source trouve sa place dans la page." />
          <ol className="chapter-grid">
            <li><b>01</b><span><strong>Diagnostic</strong> Coût, démographie, illisibilité, confusion des fonctions.</span></li>
            <li><b>02</b><span><strong>Principe doctrinal</strong> Universalité, individualisation, contribution, équilibre et propriété.</span></li>
            <li><b>03</b><span><strong>Garantie vieillesse</strong> Barème, accès, fiscalité, résidence et succession.</span></li>
            <li><b>04</b><span><strong>Comptes notionnels</strong> Taux, conversion des acquis et ajustement automatique.</span></li>
            <li><b>05</b><span><strong>Âge de départ</strong> 64 ans minimum et neutralité actuarielle.</span></li>
            <li><b>06</b><span><strong>Indexation</strong> Minimum protégé, excédent conditionnel.</span></li>
            <li><b>07</b><span><strong>Agirc-Arrco</strong> Reprise publique, deux compartiments et réserves cantonnées.</span></li>
            <li><b>08</b><span><strong>Capitalisation obligatoire</strong> 5 %, montée graduelle et fonds agréés.</span></li>
            <li><b>09</b><span><strong>Épargne libre</strong> Portabilité, fiscalité, déblocages et plafond indicatif.</span></li>
            <li><b>10</b><span><strong>Droits familiaux</strong> Crédits explicites financés par l’impôt.</span></li>
            <li><b>11</b><span><strong>Pénibilité</strong> Exposition réelle, incapacité et missions régaliennes.</span></li>
            <li><b>12</b><span><strong>Réversion</strong> Maintien, harmonisation et proratisation.</span></li>
            <li><b>13</b><span><strong>Transition</strong> Cinq cohortes et capital notionnel d’ouverture.</span></li>
            <li><b>14</b><span><strong>Chiffrage</strong> Hypothèses, économies de retraite et solde public.</span></li>
            <li><b>15</b><span><strong>Risques</strong> Social, institutionnel, transition et inégalités.</span></li>
            <li><b>16</b><span><strong>Synthèse</strong> Solidarité, contributivité, propriété.</span></li>
            <li><b>17</b><span><strong>Ligne politique</strong> Réforme agressive en interne, non punitive en externe.</span></li>
          </ol>
          <div className="final-line">
            <p>La formule publique recommandée par la note</p>
            <blockquote>« Une retraite minimale garantie, une retraite publique transparente, une retraite patrimoniale pour tous. »</blockquote>
            <small>En interne, le texte assume une réforme systémique agressive. En externe, il recommande d’insister sur la protection du minimum, la lisibilité des droits, la fin des promesses non financées et la constitution d’un patrimoine retraite — sans présenter la réforme comme punitive.</small>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div><a className="brand footer-brand" href="#accueil"><span className="brand-mark" aria-hidden="true">R</span><span><strong>Retraites</strong><small>autrement</small></span></a><p>Une mise en compréhension fidèle du document « Note interne — Doctrine retraites ».</p></div>
        <div><p className="footer-title">Méthode</p><p>Aucune donnée externe n’a été ajoutée. Les calculs interactifs sont explicitement distingués des valeurs de la doctrine et des ordres de grandeur non actuariels.</p></div>
        <div><p className="footer-title">Navigation</p><a href="#architecture">Architecture</a><a href="#laboratoire">Laboratoire</a><a href="#questions">Questions ouvertes</a><a href="#accueil">Retour en haut ↑</a></div>
      </footer>
    </>
  );
}
