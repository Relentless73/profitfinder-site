/** Workshop Ledger design: a field-ready, traceable decision worksheet with restrained industrial energy. */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BadgeCheck,
  Calculator,
  Check,
  ChevronRight,
  ClipboardList,
  FileDown,
  FileText,
  Gauge,
  Info,
  LineChart,
  MapPin,
  RotateCcw,
  Save,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import {
  blankDeal,
  buildLedgerCsv,
  calculateDeal,
  costFields,
  formatMoney,
  formatPercent,
  isBlank,
  marketplacePresets,
  reviewDeal,
  sellingFields,
  type DealValues,
  type MarketplaceId,
  type SavedDeal,
} from "@/lib/calculator";

const STORAGE_KEY = "flipprofit.savedDeals.v1";
const heroImage = "/manus-storage/flipprofit-hero-auction-lot_0b45e1cd.jpg";
const workbenchImage = "/manus-storage/flipprofit-workbench-details_ed5d240a.jpg";
const repairImage = "/manus-storage/flipprofit-detail-repair_fae971f4.jpg";
const brandMark = "/manus-storage/flipprofit-symbol_9b8d88d6.png";

type InputFieldProps = {
  label: string;
  field: keyof DealValues;
  value: string;
  onChange: (field: keyof DealValues, value: string) => void;
  help?: string;
  prefix?: string;
  suffix?: string;
};

function MoneyInput({ label, field, value, onChange, help, prefix = "$", suffix }: InputFieldProps) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {help && <span className="field-help">{help}</span>}
      </span>
      <span className="input-shell">
        {prefix && <span className="input-affix">{prefix}</span>}
        <input
          inputMode="decimal"
          min="0"
          step="0.01"
          type="number"
          value={value}
          onChange={(event) => onChange(field, event.target.value)}
          placeholder="Not entered"
          aria-label={label}
        />
        {suffix && <span className="input-affix input-suffix">{suffix}</span>}
      </span>
    </label>
  );
}

function Metric({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`metric ${emphasis ? "metric-emphasis" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function statusIcon(tone: string) {
  if (tone === "buy") return <BadgeCheck aria-hidden="true" />;
  if (tone === "review" || tone === "borderline") return <TriangleAlert aria-hidden="true" />;
  if (tone === "pass" || tone === "blocked") return <ShieldCheck aria-hidden="true" />;
  return <Info aria-hidden="true" />;
}

export default function Home() {
  const [values, setValues] = useState<DealValues>(blankDeal);
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const { buyNow, loading: checkoutLoading } = useCart();
  const { data: bundle } = trpc.commerce.products.byHandle.useQuery({
    handle: "flipprofit-deal-screening-bundle",
  });
  const liveVariant = bundle?.variants.find(variant => variant.availableForSale);
  const activeBundle = bundle && liveVariant
    ? {
        title: bundle.title,
        imageUrl: bundle.images[0]?.url ?? "",
        price: liveVariant.price.amount,
        currencyCode: liveVariant.price.currencyCode,
        variantId: liveVariant.id,
      }
    : null;

  const calculation = useMemo(() => calculateDeal(values), [values]);
  const agent = useMemo(() => reviewDeal(values, calculation), [values, calculation]);
  const preset = marketplacePresets[values.marketplace];

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedDeal[];
        if (Array.isArray(parsed)) setSavedDeals(parsed);
      }
    } catch {
      toast.error("Saved work orders could not be read from this browser.");
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDeals));
    } catch {
      toast.error("This browser could not save the work order locally.");
    }
  }, [savedDeals]);

  const updateValue = (field: keyof DealValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const chooseMarketplace = (marketplace: MarketplaceId) => {
    const nextPreset = marketplacePresets[marketplace];
    setValues((current) => ({
      ...current,
      marketplace,
      feeRate: nextPreset.rate,
      feeFlat: nextPreset.flat,
    }));
    toast.message(`${nextPreset.label} assumption loaded. You can edit every fee.`);
  };

  const saveDeal = () => {
    const now = new Date();
    const name = values.dealName.trim() || `Work order ${now.toLocaleDateString("en-US")}`;
    const deal: SavedDeal = {
      id: selectedDealId ?? (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`),
      savedAt: now.toISOString(),
      values: { ...values, dealName: name },
    };

    setValues(deal.values);
    setSavedDeals((current) => {
      const exists = current.some((item) => item.id === deal.id);
      return exists ? current.map((item) => (item.id === deal.id ? deal : item)) : [deal, ...current];
    });
    setSelectedDealId(deal.id);
    toast.success(`Saved ${name} on this device.`);
  };

  const loadDeal = (deal: SavedDeal) => {
    setValues(deal.values);
    setSelectedDealId(deal.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.message(`Opened ${deal.values.dealName}.`);
  };

  const deleteDeal = (deal: SavedDeal) => {
    if (!window.confirm(`Delete ${deal.values.dealName}? This removes it from this browser only.`)) return;
    setSavedDeals((current) => current.filter((item) => item.id !== deal.id));
    if (selectedDealId === deal.id) setSelectedDealId(null);
    toast.success("Work order removed from this device.");
  };

  const resetWorksheet = () => {
    if (!window.confirm("Clear this worksheet? Unsaved work will be lost.")) return;
    setValues(blankDeal);
    setSelectedDealId(null);
    toast.message("Worksheet cleared. No data was added.");
  };

  const exportLedger = () => {
    if (savedDeals.length === 0) {
      toast.error("There are no saved work orders to export.");
      return;
    }
    const blob = new Blob([buildLedgerCsv(savedDeals)], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `flipprofit-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success("Ledger CSV downloaded.");
  };

  const scrollToGuide = () => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });

  const startBundleCheckout = async () => {
    if (!activeBundle) {
      toast.error("The bundle is not available for checkout right now.");
      return;
    }
    try {
      await buyNow(activeBundle.variantId);
    } catch {
      toast.error("Checkout could not be started. Please try again.");
    }
  };

  const fieldTrace = [
    { label: "Expected sale price", value: values.expectedSalePrice },
    { label: "Buy price", value: values.buyPrice },
    ...costFields.map(({ key, label }) => ({ label, value: values[key] })),
    ...sellingFields.map(({ key, label }) => ({ label, value: values[key] })),
    { label: "Target profit", value: values.targetProfit },
  ];

  return (
    <div className="app-shell">
      <aside className="tool-rail" aria-label="FlipProfit navigation">
          <a className="brand-lockup" href="#top" aria-label="FlipProfit home">
          <img src={brandMark} alt="" />
          <span><b>FLIP</b>PROFIT</span>
        </a>
        <nav>
          <a className="rail-link active" href="#worksheet"><Calculator /> <span>Worksheet</span></a>
          <a className="rail-link" href="#bundle"><ShoppingBag /> <span>Get bundle</span></a>
          <a className="rail-link" href="#agent-review"><Gauge /> <span>Deal agent</span></a>
          <a className="rail-link" href="#ledger"><ClipboardList /> <span>Local ledger</span></a>
          <a className="rail-link" href="#how-it-works"><Info /> <span>How it works</span></a>
        </nav>
        <div className="rail-note">
          <ShieldCheck />
          <p><b>Local-first.</b> Your entries stay in this browser until you export them.</p>
        </div>
      </aside>

      <main id="top" className="work-area">
        <header className="topbar">
          <div className="eyebrow"><span /> DEAL SCREENING WORKBENCH</div>
          <div className="topbar-actions">
            <button className="text-button" onClick={scrollToGuide}><Info /> How it works</button>
            <button className="text-button" onClick={resetWorksheet}><RotateCcw /> Clear worksheet</button>
          </div>
        </header>

        <section className="hero" aria-labelledby="page-title">
          <img className="hero-image" src={heroImage} alt="Vehicle lot at dusk with an inspection tag" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="hero-kicker">THE NUMBER BEFORE THE NOD</p>
            <h1 id="page-title">Know your walk-away price<br />before the gate opens.</h1>
            <p>Enter only real information you have. FlipProfit shows every cost, every assumption, and exactly why the worksheet is—or is not—ready for a decision.</p>
            <button className="hero-action" onClick={() => document.getElementById("worksheet")?.scrollIntoView({ behavior: "smooth" })}>
              Start a work order <ArrowDownToLine />
            </button>
          </div>
          <div className="hero-proof">
            <ShieldCheck />
            <span><b>No dummy deals.</b><br />No fake pricing.</span>
          </div>
        </section>

        <section className="progress-strip" aria-label="Deal screening steps">
          <div><span>01</span><b>Enter the facts</b><small>Only what you know</small></div>
          <ChevronRight />
          <div><span>02</span><b>Confirm the costs</b><small>Blank is not zero</small></div>
          <ChevronRight />
          <div><span>03</span><b>Review the decision</b><small>See the evidence</small></div>
        </section>

        <section id="bundle" className="bundle-strip" aria-labelledby="bundle-title">
          {activeBundle ? (
            <>
              <div className="bundle-visual">
                {activeBundle.imageUrl && <img src={activeBundle.imageUrl} alt={activeBundle.title} />}
              </div>
              <div className="bundle-copy">
                <p className="eyebrow"><span /> LIVE DIGITAL BUNDLE</p>
                <h2 id="bundle-title">{activeBundle.title}</h2>
                <p>Get the blank, traceable Excel work order plus the printable field checklist. No account, subscription, fake pricing, or pre-filled deal data.</p>
                <div className="bundle-trust"><ShieldCheck /> <span>Live catalog data is required before checkout can open.</span></div>
              </div>
              <div className="bundle-purchase">
                <strong>${Number(activeBundle.price).toFixed(2)}</strong>
                <span>{activeBundle.currencyCode} · one-time</span>
                <button className="primary-button" disabled={checkoutLoading} onClick={startBundleCheckout}>
                  <ShoppingBag /> {checkoutLoading ? "Opening checkout…" : "Buy the bundle"}
                </button>
                <small>Digital ZIP: Excel workbook + PDF checklist.</small>
              </div>
            </>
          ) : (
            <div className="bundle-copy">
              <p className="eyebrow"><span /> PRODUCT STATUS</p>
              <h2 id="bundle-title">Checkout is not shown yet.</h2>
              <p>The free calculator remains available. A purchase button appears only after Shopify returns the live $19 bundle and its available sale variant.</p>
            </div>
          )}
        </section>

        <section id="worksheet" className="worksheet-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> WORK ORDER / {selectedDealId ? "SAVED DRAFT" : "NEW"}</p>
              <h2>Put the real costs on the table.</h2>
            </div>
            <div className="worksheet-actions">
              <button className="secondary-button" onClick={saveDeal}><Save /> Save work order</button>
              <button className="primary-button" onClick={() => document.getElementById("agent-review")?.scrollIntoView({ behavior: "smooth" })}><Gauge /> Review deal</button>
            </div>
          </div>

          <div className="workbench-grid">
            <div className="worksheet-card">
              <div className="card-intro">
                <span className="work-order-number">01</span>
                <div><h3>Deal facts</h3><p>All fields are blank on purpose. Add only documented or confirmed numbers.</p></div>
              </div>

              <div className="form-section two-columns first-fields">
                <label className="field full-width">
                  <span className="field-label">Work order name <span className="field-help">Optional</span></span>
                  <span className="input-shell text-input"><input value={values.dealName} onChange={(event) => updateValue("dealName", event.target.value)} placeholder="Example: 2016 work truck" aria-label="Work order name" /></span>
                </label>
                <MoneyInput label="Expected sale price" field="expectedSalePrice" value={values.expectedSalePrice} onChange={updateValue} help="Required" />
                <MoneyInput label="Buy price" field="buyPrice" value={values.buyPrice} onChange={updateValue} help="Required" />
              </div>

              <div className="form-section">
                <div className="form-section-title"><span className="work-order-number">02</span><div><h3>Cost to acquire & prepare</h3><p>Enter <b>$0</b> only when you have confirmed there is no cost.</p></div></div>
                <div className="two-columns">
                  <MoneyInput label="Auction / purchase fee" field="auctionFee" value={values.auctionFee} onChange={updateValue} />
                  <MoneyInput label="Transport / tow" field="transportCost" value={values.transportCost} onChange={updateValue} />
                  <MoneyInput label="Repair labor" field="repairLabor" value={values.repairLabor} onChange={updateValue} />
                  <MoneyInput label="Parts" field="partsCost" value={values.partsCost} onChange={updateValue} />
                  <MoneyInput label="Title / document costs" field="titleDocCost" value={values.titleDocCost} onChange={updateValue} />
                  <MoneyInput label="Detail / cleanup" field="detailCost" value={values.detailCost} onChange={updateValue} />
                  <MoneyInput label="Other costs" field="otherCost" value={values.otherCost} onChange={updateValue} help="Storage, insurance, etc." />
                </div>
              </div>

              <div className="form-section selling-section">
                <div className="form-section-title"><span className="work-order-number">03</span><div><h3>Cost to sell & target</h3><p>Fee assumptions stay visible and editable.</p></div></div>
                <div className="two-columns">
                  <label className="field full-width">
                    <span className="field-label">Marketplace fee assumption</span>
                    <span className="select-shell">
                      <select value={values.marketplace} onChange={(event) => chooseMarketplace(event.target.value as MarketplaceId)} aria-label="Marketplace fee assumption">
                        {Object.entries(marketplacePresets).map(([key, option]) => <option key={key} value={key}>{option.label}</option>)}
                      </select>
                    </span>
                  </label>
                  <MoneyInput label="Selling fee rate" field="feeRate" value={values.feeRate} onChange={updateValue} prefix="" suffix="%" />
                  <MoneyInput label="Fixed selling fee" field="feeFlat" value={values.feeFlat} onChange={updateValue} />
                  <MoneyInput label="Advertising / listing" field="adCost" value={values.adCost} onChange={updateValue} />
                  <MoneyInput label="Your target profit" field="targetProfit" value={values.targetProfit} onChange={updateValue} />
                </div>
                <div className="assumption-note"><Info /><div><b>Fee note:</b> {preset.source}{preset.sourceUrl && <> <a href={preset.sourceUrl} target="_blank" rel="noreferrer">Read source <ArrowUpRight /></a></>}</div></div>
              </div>

              <div className="form-section notes-section">
                <label className="field">
                  <span className="field-label">Notes <span className="field-help">Saved only in this browser</span></span>
                  <textarea value={values.notes} onChange={(event) => updateValue("notes", event.target.value)} placeholder="Inspection facts, questions to ask, title notes, repair quote source…" rows={4} />
                </label>
              </div>
            </div>

            <aside id="agent-review" className="result-bay" aria-live="polite">
              <div className="result-topline"><span>LIVE DEAL AGENT</span><span className="live-dot">RULE-BASED</span></div>
              <div className={`decision-stamp ${agent.tone}`}>
                <div className="stamp-icon">{statusIcon(agent.tone)}</div>
                <div><span>WORK ORDER STATUS</span><strong>{agent.label}</strong></div>
              </div>
              <h3>{agent.headline}</h3>
              <p className="result-summary">{agent.summary}</p>

              <div className="metrics-grid">
                <Metric label="Net profit" value={calculation.priceReady ? formatMoney(calculation.netProfit) : "—"} emphasis />
                <Metric label="Cash invested" value={calculation.priceReady ? formatMoney(calculation.cashInvested) : "—"} />
                <Metric label="ROI on cash" value={calculation.priceReady ? formatPercent(calculation.roiPercent) : "—"} />
                <Metric label="Break-even price" value={calculation.priceReady ? formatMoney(calculation.breakEvenPrice) : "—"} />
                <Metric label="Price for target" value={calculation.priceReady ? formatMoney(calculation.targetPrice) : "—"} />
                <Metric label="Profit margin" value={calculation.priceReady ? formatPercent(calculation.marginPercent) : "—"} />
              </div>

              <div className="agent-evidence">
                <div className="agent-evidence-heading"><ShieldCheck /><span>WHY THIS RESULT</span></div>
                {agent.evidence.map((line) => <p key={line}><Check />{line}</p>)}
                {agent.missing.length > 0 && <div className="missing-list"><b>Still unconfirmed</b>{agent.missing.map((item) => <span key={item}>{item}</span>)}</div>}
              </div>

              <details className="trace-details" open>
                <summary><FileText /> Calculation trace <span>Every line visible</span></summary>
                <div className="trace-lines">
                  {fieldTrace.map((item) => <div key={item.label}><span>{item.label}</span><b className={isBlank(item.value) ? "trace-blank" : ""}>{isBlank(item.value) ? "Not entered" : `$${item.value}`}</b></div>)}
                </div>
                <div className="formula-card">
                  <span>NET PROFIT FORMULA</span>
                  <p>Expected sale price − acquisition cost − selling costs = net profit</p>
                </div>
              </details>
            </aside>
          </div>
        </section>

        <section id="ledger" className="ledger-section">
          <div className="ledger-copy">
            <p className="eyebrow"><span /> LOCAL LEDGER</p>
            <h2>Saved work orders,<br /><i>not a cloud account.</i></h2>
            <p>Save the entries you have actually checked. They remain in this browser, can be opened later, and export as a simple CSV you control.</p>
            <div className="ledger-actions">
              <button className="primary-button" onClick={saveDeal}><Save /> Save current work order</button>
              <button className="secondary-button" onClick={exportLedger}><FileDown /> Export ledger CSV</button>
            </div>
            <div className="privacy-line"><MapPin /> Nothing is sent to a remote database from this version.</div>
          </div>
          <div className="ledger-list" aria-label="Saved work orders">
            {savedDeals.length === 0 ? (
              <div className="empty-ledger"><WalletCards /><h3>No saved work orders.</h3><p>Your first saved entry will appear here. There are no sample deals in this tool.</p></div>
            ) : savedDeals.map((deal) => {
              const savedCalculation = calculateDeal(deal.values);
              const savedReview = reviewDeal(deal.values, savedCalculation);
              return <article className="saved-deal" key={deal.id}>
                <div className={`saved-status ${savedReview.tone}`}>{savedReview.label}</div>
                <div className="saved-deal-body"><span>{new Date(deal.savedAt).toLocaleString()}</span><h3>{deal.values.dealName}</h3><p>Net result: <b>{savedCalculation.priceReady ? formatMoney(savedCalculation.netProfit) : "Waiting on prices"}</b></p></div>
                <div className="saved-deal-actions"><button onClick={() => loadDeal(deal)} aria-label={`Open ${deal.values.dealName}`}>Open</button><button onClick={() => deleteDeal(deal)} aria-label={`Delete ${deal.values.dealName}`}><Trash2 /></button></div>
              </article>;
            })}
          </div>
        </section>

        <section id="how-it-works" className="guide-section">
          <div className="guide-image-wrap"><img src={workbenchImage} alt="Vehicle inspection tools and paperwork on a garage workbench" /><div className="guide-badge"><LineChart /><span>ACCOUNTABLE<br />BY DESIGN</span></div></div>
          <div className="guide-copy">
            <p className="eyebrow"><span /> HOW IT WORKS</p>
            <h2>The agent’s job is to show its work.</h2>
            <p>It does not browse for prices, guess repairs, or tell you that a deal is good because it sounds good. It only reviews the facts and assumptions in this worksheet.</p>
            <div className="guide-rules">
              <div><span>01</span><p><b>Blank is not zero.</b> A blank cost triggers a review warning. Enter $0 only when you have confirmed there is no cost.</p></div>
              <div><span>02</span><p><b>Recommendations are traceable.</b> The result panel identifies the inputs and math behind every status.</p></div>
              <div><span>03</span><p><b>Fee defaults are not hidden.</b> Marketplace presets show their source, exception note, and verification date.</p></div>
            </div>
            <div className="guide-source"><img src={repairImage} alt="Detailed repaired vehicle fender in a workshop" /><span><b>Built for the work around the deal:</b> tow, title, parts, cleanup, time, and the price you need to walk away with.</span></div>
          </div>
        </section>

        <footer><span>FLIPPROFIT / DEAL SCREENING WORKBENCH</span><span>YOUR INPUTS • YOUR FORMULA • YOUR DECISION</span></footer>
      </main>
    </div>
  );
}
