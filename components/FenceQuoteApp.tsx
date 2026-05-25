 "use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  ArrowRight, Calculator, CheckCircle2, ClipboardCheck, Database, DollarSign,
  Download, Fence, Flame, Gauge, Hammer, Mail, MapPin, Ruler, Send,
  ShieldCheck, Sparkles, Star, Trophy, AlertTriangle, Layers
} from "lucide-react";
import { MATERIALS, LABOR_MULTIPLIER, TERRAIN_MULTIPLIER, POST_OPTIONS, PRO_DEFAULTS, currency, todayStamp } from "@/lib/fenceData";

type MaterialKey = keyof typeof MATERIALS;
type LaborKey = keyof typeof LABOR_MULTIPLIER;
type TerrainKey = keyof typeof TERRAIN_MULTIPLIER;
type PostKey = keyof typeof POST_OPTIONS;

function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 font-bold transition disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[2rem] border border-slate-700 bg-slate-900 shadow-xl shadow-black/20 ${className}`}>{children}</div>;
}

export default function FenceQuoteApp() {
  const [mode, setMode] = useState<"homeowner" | "pro">("homeowner");
  const [zip, setZip] = useState("76002");
  const [length, setLength] = useState(150);
  const [height, setHeight] = useState(6);
  const [material, setMaterial] = useState<MaterialKey>("cedar");
  const [gates, setGates] = useState(1);
  const [removal, setRemoval] = useState(true);
  const [terrain, setTerrain] = useState<TerrainKey>("normal");
  const [labor, setLabor] = useState<LaborKey>("standard");
  const [postType, setPostType] = useState<PostKey>("steel");
  const [corners, setCorners] = useState(4);
  const [stain, setStain] = useState(false);

  const [lotWidth, setLotWidth] = useState(60);
  const [lotDepth, setLotDepth] = useState(120);
  const [layout, setLayout] = useState<"backyard" | "full" | "pool">("backyard");
  const [contractorBid, setContractorBid] = useState(7500);

  const [lead, setLead] = useState({ name: "", email: "", phone: "", timeline: "Within 30 days", quotes: true });
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [leadError, setLeadError] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [pro, setPro] = useState(PRO_DEFAULTS);
  const [customer, setCustomer] = useState({ name: "", address: "", city: "", phone: "", email: "" });
  const [company, setCompany] = useState({ name: "FenceQuoteHQ", phone: "", email: "", website: "FenceQuoteHQ.com" });
  const [scopeNotes, setScopeNotes] = useState("Install fence per selected specifications. Includes standard post setting, gate installation, cleanup, and haul-off where selected.");

  const lotEstimate = useMemo(() => {
    let estimated = layout === "full" ? lotWidth * 2 + lotDepth * 2 : layout === "pool" ? Math.round((lotWidth + lotDepth) * 0.9) : lotWidth + lotDepth * 2;
    return Math.max(50, estimated);
  }, [lotWidth, lotDepth, layout]);

  const calc = useMemo(() => {
    const heightMultiplier = height === 4 ? 0.86 : height === 6 ? 1 : 1.24;
    const zipMultiplier =
      zip.startsWith("75") ? 1.06 :
      zip.startsWith("76") ? 1.02 :
      zip.startsWith("77") ? 1.04 :
      zip.startsWith("78") ? 1.03 :
      zip.startsWith("79") ? 0.97 :
      1;
    const lowBase = length * MATERIALS[material].low * heightMultiplier * zipMultiplier * TERRAIN_MULTIPLIER[terrain].value * LABOR_MULTIPLIER[labor].value * POST_OPTIONS[postType].value * (1 + Math.max(0, corners - 4) * 0.015);
    const highBase = length * MATERIALS[material].high * heightMultiplier * zipMultiplier * TERRAIN_MULTIPLIER[terrain].value * LABOR_MULTIPLIER[labor].value * POST_OPTIONS[postType].value * (1 + Math.max(0, corners - 4) * 0.015);
    const gateCostLow = gates * 325;
    const gateCostHigh = gates * 650;
    const removalLow = removal ? length * 4 : 0;
    const removalHigh = removal ? length * 8 : 0;
    const stainLow = stain && ["cedar", "pine"].includes(material) ? length * 7 : 0;
    const stainHigh = stain && ["cedar", "pine"].includes(material) ? length * 13 : 0;
    const permit = length > 200 || height === 8 ? 125 : 0;
    const low = lowBase + gateCostLow + removalLow + stainLow + permit;
    const high = highBase + gateCostHigh + removalHigh + stainHigh + permit;
    const mid = (low + high) / 2;
    const confidence = Math.max(72, Math.min(96, 92 - (terrain === "sloped" ? 7 : 0) - (corners > 6 ? 5 : 0) - (zip.length < 5 ? 8 : 0)));
    return { low, high, mid, costPerFoot: mid / length, confidence, lowBase, highBase, gateCostLow, gateCostHigh, removalLow, removalHigh, stainLow, stainHigh, permit };
  }, [height, zip, length, material, terrain, labor, postType, corners, gates, removal, stain]);

  const takeoff = useMemo(() => {
    const postSpacing = material === "chain" ? 10 : 8;
    const posts = Math.ceil(length / postSpacing) + corners + gates * 2;
    const panels = material === "chain" ? 0 : Math.ceil(length / 8);
    const rails = material === "chain" ? Math.ceil(length / 10) : panels * 2;
    const pickets = ["cedar", "pine"].includes(material) ? Math.ceil(length * 2.2) : 0;
    const concreteBags = Math.ceil(posts * (postType === "reinforced" ? 3 : postType === "steel" ? 2 : 1.5));
    const screws = Math.ceil(pickets * 4 + panels * 20 + gates * 50);
    const stainGallons = stain && ["cedar", "pine"].includes(material) ? Math.ceil(length / 35) : 0;
    return { postSpacing, posts, panels, rails, pickets, concreteBags, screws, stainGallons, gateKits: gates };
  }, [length, material, corners, gates, postType, stain]);

  const proEstimate = useMemo(() => {
    const demoHours = removal ? length / 45 : 0;
    const layoutHours = 1.5 + corners * 0.15;
    const postHours = takeoff.posts * (postType === "reinforced" ? 0.42 : postType === "steel" ? 0.34 : 0.28);
    const installHours = material === "chain" ? length / 38 : length / 28;
    const gateHours = gates * 1.5;
    const stainHours = stain ? length / 45 : 0;
    const totalLaborHours = demoHours + layoutHours + postHours + installHours + gateHours + stainHours;
    const laborCost = totalLaborHours * pro.hourlyRate;
    const materialCost = calc.lowBase * 0.58 + calc.gateCostLow * 0.5 + calc.stainLow * 0.45 + calc.removalLow * 0.2;
    const directCost = materialCost + laborCost + calc.permit;
    const overhead = directCost * (pro.overheadPercent / 100);
    const contingency = directCost * (pro.contingencyPercent / 100);
    const subtotal = directCost + overhead + contingency;
    const profit = subtotal * (pro.profitPercent / 100);
    const bidPrice = subtotal + profit;
    const deposit = bidPrice * (pro.depositPercent / 100);
    const estimatedDays = Math.max(1, Math.ceil(totalLaborHours / Math.max(5.5, pro.crewSize * 6.5)));
    return { totalLaborHours, laborCost, materialCost, directCost, overhead, contingency, profit, bidPrice, deposit, estimatedDays, marginPercent: bidPrice ? (profit / bidPrice) * 100 : 0 };
  }, [removal, length, corners, takeoff.posts, postType, material, gates, stain, pro, calc]);

  const quoteScore = useMemo(() => {
    const diff = ((contractorBid - calc.mid) / calc.mid) * 100;
    if (diff < -18) return { label: "Suspiciously Low", color: "text-red-300", text: "This bid may be missing scope, materials, tear-out, permit, or durability details." };
    if (diff < 12) return { label: "Fair Quote", color: "text-emerald-300", text: "This bid is inside a reasonable planning range." };
    if (diff < 28) return { label: "Slightly High", color: "text-yellow-300", text: "Ask what premium materials, warranty, post system, or prep work justify the price." };
    return { label: "Overpriced", color: "text-red-300", text: "This quote is well above the planning range. Get at least two more bids." };
  }, [contractorBid, calc.mid]);

  const estimateData = {
    date: todayStamp(), zip, length, height, material: MATERIALS[material].label, gates,
    removal: removal ? "Yes" : "No", terrain: TERRAIN_MULTIPLIER[terrain].label,
    labor: LABOR_MULTIPLIER[labor].label, postType: POST_OPTIONS[postType].label,
    corners, stain: stain ? "Yes" : "No", low: currency(calc.low), high: currency(calc.high), confidence: `${calc.confidence}%`,
    proBid: currency(proEstimate.bidPrice), estimatedDays: proEstimate.estimatedDays,
  };

  function updatePro(field: string, value: any) { setPro((prev) => ({ ...prev, [field]: value })); }
  function updateLead(field: string, value: any) { setLead((prev) => ({ ...prev, [field]: value })); }
  function updateCustomer(field: string, value: any) { setCustomer((prev) => ({ ...prev, [field]: value })); }
  function updateCompany(field: string, value: any) { setCompany((prev) => ({ ...prev, [field]: value })); }

  function validateLead() {
    if (!lead.name.trim()) return "Please enter your name.";
    if (!/^\\S+@\\S+\\.\\S+$/.test(lead.email)) return "Please enter a valid email address.";
    return "";
  }

  function buildLeadRecord() {
    return { id: `lead-${Date.now()}`, createdAt: new Date().toISOString(), lead, estimate: estimateData, rawEstimate: calc, source: "FenceQuoteHQ" };
  }

  async function sendLead() {
    const error = validateLead();
    if (error) { setLeadError(error); return; }
    const record = buildLeadRecord();
    localStorage.setItem("fenceQuoteHQLead", JSON.stringify(record));
    setIsSending(true);
    try {
      await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
      if (webhookUrl) await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
      setLeadStatus("Lead captured successfully.");
      setLeadError("");
    } catch {
      setLeadError("Lead saved locally, but remote capture failed. Check API/webhook settings.");
    } finally {
      setIsSending(false);
    }
  }

  function downloadEstimatePDF() {
    const doc = new jsPDF();
    let y = 18; const left = 16;
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.text("FenceQuoteHQ", left, y); y += 9;
    doc.setFontSize(15); doc.text("Fence Planning Estimate", left, y); y += 10;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`Estimate: ${estimateData.low} - ${estimateData.high}`, left, y); y += 7;
    doc.text(`Fence: ${length} linear ft, ${height} ft, ${MATERIALS[material].label}`, left, y); y += 6;
    doc.text(`Post System: ${POST_OPTIONS[postType].label}`, left, y); y += 6;
    doc.text(`Confidence: ${estimateData.confidence}`, left, y); y += 10;
    doc.setFont("helvetica", "bold"); doc.text("Material Takeoff", left, y); y += 7; doc.setFont("helvetica", "normal");
    Object.entries(takeoff).forEach(([k, v]) => { doc.text(`${k}: ${v}`, left, y); y += 6; });
    doc.save(`FenceQuoteHQ-estimate-${zip}.pdf`);
  }

  function downloadProposalPDF() {
    const doc = new jsPDF();
    let y = 16; const left = 16;
    const line = (label: string, value: any) => { doc.setFont("helvetica", "bold"); doc.text(`${label}:`, left, y); doc.setFont("helvetica", "normal"); doc.text(String(value || "—"), left + 42, y); y += 6; };
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.text(company.name || "FenceQuoteHQ", left, y); y += 8;
    doc.setFontSize(14); doc.text("Contractor Bid Proposal", left, y); y += 8;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    line("Customer", customer.name || lead.name); line("Address", customer.address); line("City/ZIP", `${customer.city} ${zip}`); line("Fence", `${length} ft ${MATERIALS[material].label}`);
    y += 4; doc.setFont("helvetica", "bold"); doc.text("Proposal Summary", left, y); y += 7;
    line("Material", currency(proEstimate.materialCost)); line("Labor", currency(proEstimate.laborCost)); line("Overhead", currency(proEstimate.overhead)); line("Profit", currency(proEstimate.profit));
    y += 2; doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text(`Total Bid: ${currency(proEstimate.bidPrice)}`, left, y); y += 8;
    doc.setFontSize(10); line("Deposit", currency(proEstimate.deposit)); line("Duration", `${proEstimate.estimatedDays} working day(s)`); line("Warranty", pro.warranty);
    y += 8; doc.text("Customer Signature: __________________________ Date: __________", left, y); y += 10;
    doc.text("Contractor Signature: ________________________ Date: __________", left, y);
    doc.save(`FenceQuoteHQ-proposal-${zip}.pdf`);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative px-5 py-8 md:px-10 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.35),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.2),transparent_30%),linear-gradient(135deg,rgba(15,23,42,1),rgba(2,6,23,1))]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 md:grid-cols-2 md:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-200"><Sparkles size={16} /> Fence planning software for Texas homeowners</div>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">Know Your Fence Cost Before Contractors Call Back</h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">FenceQuoteHQ combines cost estimating, lot planning, quote scoring, material takeoff, lead capture, and contractor-grade proposal PDFs.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={() => document.getElementById("calculator")?.scrollIntoView()} className="bg-orange-500 hover:bg-orange-600 shadow-glow">Start Estimate <ArrowRight className="ml-2" size={18} /></Button>
              <Button
                onClick={() => {
                  setMode("pro");
                  setTimeout(() => {
                    document.getElementById("pro-mode")?.scrollIntoView({ behavior: "smooth" });
                  }, 200);
                }}
                className="border border-slate-600 bg-slate-900 hover:bg-slate-800"
               >
                Open Pro Mode
               </Button>
            </div>
          </motion.div>
          <Card className="relative bg-slate-900/85 p-6">
            <div className="mb-5 flex items-start justify-between">
              <div><p className="text-sm text-slate-400">Live installed estimate</p><h2 className="text-3xl font-black md:text-4xl">{currency(calc.low)} – {currency(calc.high)}</h2></div>
              <div className="rounded-2xl bg-orange-500 p-3"><DollarSign /></div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Metric icon={<Gauge />} label="Confidence" value={`${calc.confidence}%`} />
              <Metric icon={<Ruler />} label="Per foot" value={currency(calc.costPerFoot)} />
              <Metric icon={<Trophy />} label="Curb score" value={`${MATERIALS[material].curb}/10`} />
            </div>
            <div className="mt-4 rounded-2xl bg-slate-800 p-4">
              <div className="mb-3 flex items-center gap-2 text-slate-300"><Fence size={18} /> Live fence preview</div>
              <div className="flex flex-wrap gap-1 rounded-xl bg-slate-950 p-3">
                {Array.from({ length: Math.min(30, Math.ceil(length / 10)) }).map((_, i) => <div key={i} className="w-3 rounded-sm bg-gradient-to-b from-amber-500 to-amber-800 shadow" style={{ height: height === 4 ? 34 : height === 6 ? 44 : 56 }} />)}
                {Array.from({ length: gates }).map((_, i) => <div key={i} className="h-12 w-7 rounded-md border-2 border-orange-400 bg-slate-700" />)}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="calculator" className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-[1.05fr_.95fr] md:px-10">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3"><Calculator className="text-orange-400" /><h2 className="text-2xl font-black">Build Your Fence Estimate</h2></div>
          <div className="grid gap-5">
            <label className="grid gap-2 text-slate-300">ZIP Code<input value={zip} onChange={(e) => setZip(e.target.value)} className="input" /></label>
            <label className="grid gap-2 text-slate-300">Fence Length: <span className="font-bold text-orange-300">{length} ft</span><input type="range" min="50" max="500" step="10" value={length} onChange={(e) => setLength(Number(e.target.value))} /></label>
            <div className="grid grid-cols-3 gap-3">{[4, 6, 8].map((h) => <Button key={h} onClick={() => setHeight(h)} className={height === h ? "bg-orange-500" : "bg-slate-800 hover:bg-slate-700"}>{h} ft</Button>)}</div>
            <div className="grid gap-3 md:grid-cols-2">{Object.entries(MATERIALS).map(([key, item]) => <button key={key} onClick={() => setMaterial(key as MaterialKey)} className={`rounded-2xl border p-4 text-left transition hover:scale-[1.01] ${material === key ? "border-orange-400 bg-orange-500/10" : "border-slate-700 bg-slate-950 hover:bg-slate-800"}`}><b>{item.label}</b><p className="text-sm text-slate-400">{currency(item.low)}–{currency(item.high)} / ft</p></button>)}</div>
            <div className="grid gap-4 md:grid-cols-2"><Input label="Gates" value={gates} setValue={setGates} /><Input label="Corners / Turns" value={corners} setValue={setCorners} /></div>
            <div className="grid gap-4 md:grid-cols-3"><Select label="Terrain" value={terrain} setValue={setTerrain} options={TERRAIN_MULTIPLIER} /><Select label="Install Level" value={labor} setValue={setLabor} options={LABOR_MULTIPLIER} /><Select label="Post System" value={postType} setValue={setPostType} options={POST_OPTIONS} /></div>
            <div className="grid gap-3 sm:grid-cols-2"><Check checked={removal} setChecked={setRemoval} label="Remove old fence" /><Check checked={stain} setChecked={setStain} label="Add stain/seal estimate" /></div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="border-orange-400/30 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/40 p-6"><p className="text-sm text-orange-300">Estimated installed cost</p><h2 className="mt-2 text-4xl font-black">{currency(calc.low)} – {currency(calc.high)}</h2><Breakdown calc={calc} /><Button onClick={downloadEstimatePDF} className="mt-5 w-full bg-orange-500 hover:bg-orange-600"><Download className="mr-2" size={18} /> Download Estimate PDF</Button></Card>
          <Card className="p-6"><div className="mb-4 flex items-center gap-2"><ShieldCheck className="text-emerald-300" /><h3 className="text-xl font-black">Contractor Quote Score</h3></div><input type="number" value={contractorBid} onChange={(e) => setContractorBid(Number(e.target.value))} className="input mb-3" /><h4 className={`text-2xl font-black ${quoteScore.color}`}>{quoteScore.label}</h4><p className="text-slate-300">{quoteScore.text}</p></Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-8 md:grid-cols-2 md:px-10">
        <Card className="p-6"><div className="mb-4 flex items-center gap-2"><MapPin className="text-sky-300" /><h3 className="text-xl font-black">Property Line / Lot Size Estimator</h3></div><div className="grid gap-4 md:grid-cols-2"><Input label="Lot width" value={lotWidth} setValue={setLotWidth} /><Input label="Lot depth" value={lotDepth} setValue={setLotDepth} /></div><select value={layout} onChange={(e) => setLayout(e.target.value as any)} className="input mt-4"><option value="backyard">Backyard only</option><option value="full">Full perimeter</option><option value="pool">Pool enclosure</option></select><div className="mt-4 rounded-2xl bg-slate-950 p-4"><p className="text-slate-400">Estimated fence footage</p><p className="text-3xl font-black">{lotEstimate} ft</p><Button onClick={() => setLength(lotEstimate)} className="mt-3 bg-orange-500">Use This Length</Button></div></Card>
        <Card className="p-6"><div className="mb-4 flex items-center gap-2"><Mail className="text-orange-300" /><h3 className="text-xl font-black">Get Estimate + Contractor Options</h3></div><input value={lead.name} onChange={(e) => updateLead("name", e.target.value)} placeholder="Full name" className="input mb-3" /><input value={lead.email} onChange={(e) => updateLead("email", e.target.value)} placeholder="Email" className="input mb-3" /><input value={lead.phone} onChange={(e) => updateLead("phone", e.target.value)} placeholder="Phone optional" className="input mb-3" /><input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="Optional Zapier webhook URL" className="input mb-3" />{leadError && <p className="mb-2 text-red-300">{leadError}</p>}{leadStatus && <p className="mb-2 text-emerald-300">{leadStatus}</p>}<Button onClick={sendLead} disabled={isSending} className="w-full bg-orange-500 hover:bg-orange-600"><Send className="mr-2" size={18} /> {isSending ? "Sending..." : "Send Lead"}</Button></Card>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 md:px-10">
        <Card className="p-4 md:flex md:items-center md:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">Estimator Mode</p><h2 className="text-2xl font-black">Homeowner calculator + contractor proposal software</h2></div>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-950 p-2 md:mt-0"><Button onClick={() => setMode("homeowner")} className={mode === "homeowner" ? "bg-orange-500" : "bg-slate-800"}>Homeowner</Button><Button onClick={() => setMode("pro")} className={mode === "pro" ? "bg-orange-500" : "bg-slate-800"}>Pro Contractor</Button></div>
        </Card>
      </section>

      {mode === "pro" && (
  <div id="pro-mode">
    <ProMode
      pro={pro}
      updatePro={updatePro}
      customer={customer}
      updateCustomer={updateCustomer}
      company={company}
      updateCompany={updateCompany}
      scopeNotes={scopeNotes}
      setScopeNotes={setScopeNotes}
      takeoff={takeoff}
      proEstimate={proEstimate}
      downloadProposalPDF={downloadProposalPDF}
    />
  </div>
)}

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-12 md:grid-cols-3 md:px-10">
        {[{ icon: Layers, title: "Accuracy Logic", text: "Uses length, height, material, gates, post system, removal, terrain, corners, stain, and local market multipliers." }, { icon: ClipboardCheck, title: "Contractor-Ready", text: "Captures project details in a format a fence contractor can quickly review and bid." }, { icon: Star, title: "Sticky Experience", text: "Visual preview, quote score, lot estimator, takeoff, and proposal PDFs keep users engaged." }].map((item) => <Card key={item.title} className="p-6"><item.icon className="mb-4 text-orange-300" /><h3 className="text-xl font-black">{item.title}</h3><p className="mt-2 text-slate-300">{item.text}</p></Card>)}
      </section>
      <style jsx global>{`.input{width:100%;border-radius:1rem;border:1px solid rgb(51 65 85);background:#020617;padding:0.85rem;color:white;outline:none}.input:focus{border-color:#fb923c}`}</style>
    </main>
  );
}

function Metric({ icon, label, value }: any) { return <div className="rounded-2xl bg-slate-800 p-4">{React.cloneElement(icon, { className: "mb-2 text-orange-300" })}<p className="text-xs text-slate-400">{label}</p><p className="text-xl font-black">{value}</p></div>; }
function Input({ label, value, setValue }: any) { return <label className="grid gap-2 text-slate-300">{label}<input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="input" /></label>; }
function Select({ label, value, setValue, options }: any) { return <label className="grid gap-2 text-slate-300">{label}<select value={value} onChange={(e) => setValue(e.target.value)} className="input">{Object.entries(options).map(([k, v]: any) => <option key={k} value={k}>{v.label}</option>)}</select></label>; }
function Check({ checked, setChecked, label }: any) { return <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-300"><input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} /> {label}</label>; }
function Breakdown({ calc }: any) { return <div className="mt-5 grid gap-3 text-sm text-slate-300"><div className="flex justify-between"><span>Base fence install</span><b>{currency(calc.lowBase)}–{currency(calc.highBase)}</b></div><div className="flex justify-between"><span>Gate allowance</span><b>{currency(calc.gateCostLow)}–{currency(calc.gateCostHigh)}</b></div><div className="flex justify-between"><span>Removal</span><b>{currency(calc.removalLow)}–{currency(calc.removalHigh)}</b></div><div className="flex justify-between"><span>Stain/seal</span><b>{currency(calc.stainLow)}–{currency(calc.stainHigh)}</b></div></div>; }

function ProMode({ pro, updatePro, customer, updateCustomer, company, updateCompany, scopeNotes, setScopeNotes, takeoff, proEstimate, downloadProposalPDF }: any) {
  return <section className="mx-auto max-w-7xl px-5 pb-12 md:px-10"><Card className="border-orange-400/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6"><div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-200"><Hammer size={16} /> Pro Contractor Estimate Mode</div><h2 className="text-3xl font-black">Bid Builder + Proposal PDF</h2><p className="mt-2 max-w-3xl text-slate-300">Contractor-style takeoff, labor, overhead, profit, deposit, project duration, scope notes, and signed proposal PDF.</p></div><Button onClick={downloadProposalPDF} className="bg-orange-500 hover:bg-orange-600"><Download className="mr-2" size={18} /> Download Bid Proposal</Button></div><div className="grid gap-6 lg:grid-cols-3"><Card className="bg-slate-950 p-5"><h3 className="mb-4 text-xl font-black">Customer + Company</h3>{["name","address","city","phone","email"].map(k=><input key={k} value={customer[k]} onChange={(e)=>updateCustomer(k,e.target.value)} placeholder={`Customer ${k}`} className="input mb-3" />)}<input value={company.name} onChange={(e)=>updateCompany("name",e.target.value)} placeholder="Company name" className="input" /></Card><Card className="bg-slate-950 p-5"><h3 className="mb-4 text-xl font-black">Pricing Controls</h3>{[["hourlyRate","Hourly Rate"],["crewSize","Crew Size"],["overheadPercent","Overhead %"],["profitPercent","Profit %"],["depositPercent","Deposit %"]].map(([k,l])=><label key={k} className="mb-3 grid gap-1 text-sm text-slate-300">{l}<input type="number" value={pro[k]} onChange={(e)=>updatePro(k,Number(e.target.value))} className="input" /></label>)}</Card><Card className="border-orange-400/30 bg-orange-500/10 p-5"><h3 className="mb-4 text-xl font-black">Bid Summary</h3>{[["Material",proEstimate.materialCost],["Labor",proEstimate.laborCost],["Overhead",proEstimate.overhead],["Contingency",proEstimate.contingency],["Profit",proEstimate.profit]].map(([k,v]:any)=><div key={k} className="flex justify-between text-sm text-slate-300"><span>{k}</span><b>{currency(v)}</b></div>)}<div className="mt-3 rounded-2xl bg-slate-950 p-4"><p className="text-slate-400">Proposed Bid</p><p className="text-3xl font-black">{currency(proEstimate.bidPrice)}</p></div><p className="mt-3 text-slate-300">Deposit: <b>{currency(proEstimate.deposit)}</b></p><p className="text-slate-300">Duration: <b>{proEstimate.estimatedDays} day(s)</b></p></Card></div><div className="mt-6 grid gap-6 lg:grid-cols-2"><Card className="bg-slate-950 p-5"><h3 className="mb-4 text-xl font-black">Material Takeoff Pro</h3><div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">{Object.entries(takeoff).map(([k,v])=><div key={k} className="rounded-2xl border border-slate-700 bg-slate-900 p-4"><p className="text-slate-400">{k}</p><p className="text-2xl font-black">{String(v)}</p></div>)}</div></Card><Card className="bg-slate-950 p-5"><h3 className="mb-4 text-xl font-black">Scope + Terms</h3><textarea value={scopeNotes} onChange={(e)=>setScopeNotes(e.target.value)} className="input min-h-28" /><input value={pro.warranty} onChange={(e)=>updatePro("warranty",e.target.value)} placeholder="Warranty" className="input mt-3" /><input value={pro.paymentTerms} onChange={(e)=>updatePro("paymentTerms",e.target.value)} placeholder="Payment terms" className="input mt-3" /></Card></div></Card></section>;
}
