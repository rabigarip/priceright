import { useState, useEffect } from "react";
import Head from "next/head";
import { ArrowLeft, Lock, TrendingUp, Sparkles } from "lucide-react";

/* ─── DATA ────────────────────────────────────────────────────── */
const MEDIUMS = [
  "Oil Painting","Acrylic","Watercolor","Digital Art","Photography",
  "Charcoal / Pencil","Sculpture","Mixed Media","Textile / Fiber",
  "Ceramic","Pastel","Ink","Other"
];
const CAREERS = [
  { id:"student",     label:"Student / Hobby", desc:"Exploring & learning your craft" },
  { id:"emerging",    label:"Emerging",        desc:"First exhibitions, building practice" },
  { id:"mid",         label:"Mid-Career",      desc:"Regular sales & gallery representation" },
  { id:"established", label:"Established",     desc:"Recognized artist, strong market presence" }
];
const MARKETS = [
  "New York","Los Angeles","London","Berlin","Paris",
  "Toronto","Sydney","Miami","Chicago","Smaller Market"
];
const FOLLOW = [
  { id:"u500",  l:"< 500"   },
  { id:"s2k",   l:"500–2K"  },
  { id:"t10k",  l:"2K–10K"  },
  { id:"f50k",  l:"10K–50K" },
  { id:"p50k",  l:"50K+"    }
];
const SALES = [
  { id:"0",   l:"None yet"  },
  { id:"1-5", l:"1–5 / yr"  },
  { id:"5-15",l:"5–15 / yr" },
  { id:"15+", l:"15+ / yr"  }
];
const INIT = { medium:"",w:"",h:"",unit:"in",year:"",career:"",shows:"",solo:"",market:"",followers:"",sales:"",site:false };
const MSGS = ["Analyzing medium & size benchmarks…","Evaluating your career signals…","Mapping market context…","Calibrating price range…","Generating your report…"];

/* ─── THEME ───────────────────────────────────────────────────── */
const C = {
  bg:"#FAF8F5", accent:"#C4734B", accentLt:"#FBF0EB",
  text:"#1C1C1C", muted:"#7A7A7A", border:"#E8E4DF",
  green:"#3A7D5C", greenBg:"#EFF7F3",
  amber:"#9B7B3A", amberBg:"#FBF5EC"
};
const $ = n => "$" + Number(n).toLocaleString();

/* ─── GLOBAL CSS ──────────────────────────────────────────────── */
const CSS = `
  * { box-sizing:border-box; margin:0; padding:0; }
  input, select, button { font-family:'DM Sans',sans-serif; }
  input:focus, select:focus { outline:none !important; border-color:#C4734B !important; box-shadow:0 0 0 3px #FBF0EB !important; }

  .btn { background:#C4734B; color:#fff; border:none; border-radius:8px; padding:15px 24px; font-size:15px; font-weight:500; cursor:pointer; width:100%; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .2s ease; letter-spacing:.3px; }
  .btn:hover:not(:disabled) { background:#B5643E; transform:translateY(-1px); box-shadow:0 4px 14px rgba(196,115,75,.3); }
  .btn:disabled { background:#E8E4DF; color:#7A7A7A; cursor:not-allowed; }
  .btn:active:not(:disabled) { transform:translateY(0); }

  .chip { padding:10px 18px; border:1.5px solid #E8E4DF; border-radius:20px; cursor:pointer; font-size:13px; font-weight:500; background:#fff; color:#1C1C1C; transition:all .2s; user-select:none; display:inline-block; }
  .chip:hover, .chip.on { border-color:#C4734B; background:#FBF0EB; color:#C4734B; }

  .card { padding:15px 14px; border:1.5px solid #E8E4DF; border-radius:10px; cursor:pointer; background:#fff; transition:all .2s; }
  .card:hover, .card.on { border-color:#C4734B; background:#FBF0EB; }

  .back { background:none; border:none; color:#7A7A7A; cursor:pointer; font-size:13px; display:flex; align-items:center; gap:5px; padding:0; font-family:inherit; transition:color .2s; }
  .back:hover { color:#1C1C1C; }

  .btn-ghost { display:block; width:100%; text-align:center; background:none; border:1px solid #E8E4DF; border-radius:8px; padding:13px; color:#7A7A7A; font-size:14px; cursor:pointer; font-family:inherit; transition:all .2s; margin-top:14px; }
  .btn-ghost:hover { border-color:#C4734B; color:#C4734B; }

  @keyframes spin  { to { transform:rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes up    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
`;

/* ─────────────────────────────────────────────────────────────── */
/* APP                                                             */
/* ─────────────────────────────────────────────────────────────── */
export default function PriceRight() {
  const [step, setStep]     = useState(0);   // 0=land 1-3=form 4=load 5=result
  const [form, setForm]     = useState(INIT);
  const [result, setResult] = useState(null);
  const [err, setErr]       = useState(null);
  const [mi, setMi]         = useState(0);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (step !== 4) return;
    const t = setInterval(() => setMi(i => (i + 1) % MSGS.length), 1800);
    return () => clearInterval(t);
  }, [step]);

  const ok = () => {
    if (step === 1) return form.medium && form.w && form.h;
    if (step === 2) return !!form.career;
    if (step === 3) return form.market && form.followers && form.sales;
    return false;
  };

  /* ── API CALL ── */
  const run = async () => {
    setStep(4); setErr(null); setMi(0);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const errData = await res.json();
        setErr(errData.error || "Something went wrong.");
        setStep(3);
        return;
      }
      const json = await res.json();
      setResult(json);
      setStep(5);
    } catch (e) {
      setErr("Pricing analysis failed — please try again.");
      setStep(3);
    }
  };

  /* ── SHARED WRAPPERS ── */
  const Root = ({ children, cx }) => (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans',sans-serif", color:C.text, display:"flex", flexDirection:"column", alignItems:"center", justifyContent: cx ? "center" : "flex-start", position:"relative", overflow:"hidden" }}>
      <Head>
        <title>PriceRight — Price Your Art with Confidence</title>
        <meta name="description" content="AI-powered pricing engine for working artists. Get data-backed pricing that reflects your actual market value — no guesswork, no second-guessing." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {children}
    </div>
  );
  const Lbl = ({ ch }) => (
    <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:1.2, marginBottom:8 }}>{children}</div>
  );

  /* ═══════════════════════════════════════════════════════════════
     LANDING
  ═══════════════════════════════════════════════════════════════ */
  if (step === 0) return (
    <Root cx>
      <div style={{ position:"absolute", top:-140, right:-140, width:360, height:360, borderRadius:"50%", border:`1px solid ${C.border}`, opacity:.3, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:-80, left:-80, width:240, height:240, borderRadius:"50%", border:`1px solid ${C.border}`, opacity:.2, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"55%", left:"15%", width:80, height:80, borderRadius:"50%", border:`1px solid ${C.border}`, opacity:.15, pointerEvents:"none" }}/>

      <div style={{ maxWidth:460, width:"100%", textAlign:"center", padding:"40px 28px", position:"relative", zIndex:1 }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:5, color:C.muted, textTransform:"uppercase", marginBottom:36 }}>PriceRight</div>
        <div style={{ width:36, height:1.5, background:C.accent, margin:"0 auto 38px", borderRadius:1 }}/>

        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:42, fontWeight:600, lineHeight:1.2, color:C.text, marginBottom:18 }}>
          Price your art<br/>
          <span style={{ fontStyle:"italic", color:C.accent }}>with confidence.</span>
        </h1>

        <p style={{ fontSize:15, color:C.muted, lineHeight:1.85, maxWidth:360, margin:"0 auto 42px", fontWeight:300 }}>
          An AI-powered pricing engine for working artists. Get data-backed pricing that reflects your actual market value — no guesswork, no second-guessing.
        </p>

        <button className="btn" onClick={() => setStep(1)} style={{ maxWidth:240, margin:"0 auto" }}>
          Get Started <span style={{ fontSize:18 }}>→</span>
        </button>
        <p style={{ fontSize:11, color:C.muted, marginTop:22, opacity:.5 }}>Free · No account · Takes 2 minutes</p>
      </div>
    </Root>
  );

  /* ═══════════════════════════════════════════════════════════════
     FORM — Steps 1–3
  ═══════════════════════════════════════════════════════════════ */
  if (step >= 1 && step <= 3) {
    const TITLES = ["","About the Work","Your Career","Market & Reach"];
    const DESCS  = ["","Tell us about the piece you want to price.","Share your career stage and exhibition history.","Where do you sell, and how's your reach?"];

    return (
      <Root>
        <div style={{ maxWidth:480, width:"100%", padding:"44px 24px 60px" }}>

          {/* progress dots */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:40 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ display:"flex", alignItems:"center" }}>
                <div style={{
                  width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:600,
                  background: i <= step ? C.accent : "transparent",
                  color: i <= step ? "#fff" : C.muted,
                  border: i > step ? `1.5px solid ${C.border}` : "none",
                  transition:"all .3s"
                }}>
                  {i < step ? "✓" : i}
                </div>
                {i < 3 && <div style={{ width:34, height:1.5, background: i < step ? C.accent : C.border, transition:"background .3s" }}/>}
              </div>
            ))}
          </div>

          <button className="back" onClick={() => setStep(step - 1)}><ArrowLeft size={13}/> Back</button>

          <div style={{ marginBottom:28, marginTop:18 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:27, fontWeight:600, marginBottom:5 }}>{TITLES[step]}</h2>
            <p style={{ fontSize:14, color:C.muted, fontWeight:300 }}>{DESCS[step]}</p>
          </div>

          {err && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"11px 15px", marginBottom:18, fontSize:13, color:"#991B1B" }}>{err}</div>}

          {/* ── STEP 1: About the Work ── */}
          {step === 1 && <>
            <Lbl>Medium</Lbl>
            <select value={form.medium} onChange={e => upd("medium", e.target.value)} style={{ width:"100%", padding:"13px 16px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:15, background:"#fff", color: form.medium ? C.text : C.muted, marginBottom:22, cursor:"pointer" }}>
              <option value="" disabled>Select a medium</option>
              {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <Lbl>Dimensions</Lbl>
            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:22 }}>
              <input type="number" placeholder="W" value={form.w} onChange={e => upd("w", e.target.value)} style={{ flex:1, padding:"13px 10px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:15, textAlign:"center" }}/>
              <span style={{ color:C.muted, fontSize:18 }}>×</span>
              <input type="number" placeholder="H" value={form.h} onChange={e => upd("h", e.target.value)} style={{ flex:1, padding:"13px 10px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:15, textAlign:"center" }}/>
              <select value={form.unit} onChange={e => upd("unit", e.target.value)} style={{ width:62, padding:"13px 6px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, background:"#fff", cursor:"pointer", textAlign:"center" }}>
                <option value="in">in</option>
                <option value="cm">cm</option>
              </select>
            </div>

            <Lbl>Year Created <span style={{ fontWeight:300, textTransform:"none", letterSpacing:0, fontSize:11 }}>(optional)</span></Lbl>
            <input type="number" placeholder="e.g. 2024" value={form.year} onChange={e => upd("year", e.target.value)} style={{ width:"100%", padding:"13px 16px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:15 }}/>
          </>}

          {/* ── STEP 2: Your Career ── */}
          {step === 2 && <>
            <Lbl>Career Stage</Lbl>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:26 }}>
              {CAREERS.map(c => (
                <div key={c.id} className={`card ${form.career === c.id ? "on" : ""}`} onClick={() => upd("career", c.id)}>
                  <div style={{ fontSize:13, fontWeight:600, color: form.career === c.id ? C.accent : C.text, marginBottom:3 }}>{c.label}</div>
                  <div style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>{c.desc}</div>
                </div>
              ))}
            </div>

            <Lbl>Exhibitions <span style={{ fontWeight:300, textTransform:"none", letterSpacing:0, fontSize:11 }}>(optional)</span></Lbl>
            <div style={{ display:"flex", gap:10 }}>
              <div style={{ flex:1 }}>
                <input type="number" placeholder="0" value={form.shows} onChange={e => upd("shows", e.target.value)} style={{ width:"100%", padding:"13px 10px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:15, textAlign:"center" }}/>
                <div style={{ fontSize:11, color:C.muted, textAlign:"center", marginTop:5 }}>Total Shows</div>
              </div>
              <div style={{ flex:1 }}>
                <input type="number" placeholder="0" value={form.solo} onChange={e => upd("solo", e.target.value)} style={{ width:"100%", padding:"13px 10px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:15, textAlign:"center" }}/>
                <div style={{ fontSize:11, color:C.muted, textAlign:"center", marginTop:5 }}>Solo Shows</div>
              </div>
            </div>
          </>}

          {/* ── STEP 3: Market & Reach ── */}
          {step === 3 && <>
            <Lbl>Primary Market</Lbl>
            <select value={form.market} onChange={e => upd("market", e.target.value)} style={{ width:"100%", padding:"13px 16px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:15, background:"#fff", color: form.market ? C.text : C.muted, marginBottom:22, cursor:"pointer" }}>
              <option value="" disabled>Select your market</option>
              {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <Lbl>Social Following</Lbl>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:22 }}>
              {FOLLOW.map(f => <div key={f.id} className={`chip ${form.followers === f.id ? "on" : ""}`} onClick={() => upd("followers", f.id)}>{f.l}</div>)}
            </div>

            <Lbl>Pieces Sold Per Year</Lbl>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:22 }}>
              {SALES.map(s => <div key={s.id} className={`chip ${form.sales === s.id ? "on" : ""}`} onClick={() => upd("sales", s.id)}>{s.l}</div>)}
            </div>

            <div onClick={() => upd("site", !form.site)} style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 16px", border:`1.5px solid ${C.border}`, borderRadius:8, cursor:"pointer", background:"#fff" }}>
              <div style={{ width:42, height:23, borderRadius:12, background: form.site ? C.accent : C.border, position:"relative", transition:"background .2s", flexShrink:0 }}>
                <div style={{ width:19, height:19, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left: form.site ? 21 : 2, transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.15)" }}/>
              </div>
              <span style={{ fontSize:14 }}>I have a portfolio website</span>
            </div>
          </>}

          {/* action */}
          <div style={{ marginTop:34 }}>
            {step < 3
              ? <button className="btn" onClick={() => setStep(step + 1)} disabled={!ok()}>Continue →</button>
              : <button className="btn" onClick={run} disabled={!ok()}><Sparkles size={16}/> Analyze My Pricing</button>
            }
          </div>
        </div>
      </Root>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     LOADING
  ═══════════════════════════════════════════════════════════════ */
  if (step === 4) return (
    <Root cx>
      <div style={{ textAlign:"center", padding:"80px 24px" }}>
        <div style={{ width:50, height:50, borderRadius:"50%", border:`3px solid ${C.border}`, borderTopColor:C.accent, margin:"0 auto 36px", animation:"spin .8s linear infinite" }}/>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:600, marginBottom:14 }}>Analyzing…</h2>
        <p style={{ fontSize:14, color:C.muted, animation:"pulse 1.8s ease infinite", minHeight:22 }}>{MSGS[mi]}</p>
      </div>
    </Root>
  );

  /* ═══════════════════════════════════════════════════════════════
     RESULTS
  ═══════════════════════════════════════════════════════════════ */
  if (step === 5 && result) {
    const range = result.priceHigh - result.priceLow;
    const pct   = range === 0 ? 50 : Math.max(5, Math.min(95, ((result.priceMid - result.priceLow) / range) * 100));
    const cCol  = result.confidence === "high" ? C.green  : result.confidence === "medium" ? C.amber  : C.muted;
    const cBg   = result.confidence === "high" ? C.greenBg : result.confidence === "medium" ? C.amberBg : "#F3F4F6";

    return (
      <Root>
        <div style={{ maxWidth:480, width:"100%", padding:"44px 24px 70px" }}>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
            <button className="back" onClick={() => { setStep(0); setResult(null); setForm(INIT); }}><ArrowLeft size={13}/> Start Over</button>
            <div style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:1.2, padding:"5px 11px", borderRadius:20, background:cBg, color:cCol }}>
              {result.confidence} confidence
            </div>
          </div>

          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:600, marginBottom:4 }}>Your Pricing Report</h2>
          <p style={{ fontSize:13, color:C.muted, marginBottom:22 }}>{form.medium} · {form.w} × {form.h} {form.unit === "in" ? "in" : "cm"}</p>

          {/* ──────── PRICE HERO ──────── */}
          <div style={{ background:"#fff", borderRadius:16, padding:"30px 22px 26px", boxShadow:"0 4px 28px rgba(0,0,0,.07)", border:`1px solid ${C.border}`, marginBottom:16, animation:"up .5s ease both" }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:9, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:2, marginBottom:14 }}>Recommended Price Range</div>
              <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:6 }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:700, color:C.text }}>{$(result.priceLow)}</span>
                <span style={{ color:C.border, fontSize:22, fontWeight:300, margin:"0 2px" }}>–</span>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:700, color:C.text }}>{$(result.priceHigh)}</span>
              </div>
            </div>

            <div style={{ position:"relative", padding:"12px 0 6px" }}>
              <div style={{ height:3, borderRadius:2, background:`linear-gradient(to right, ${C.accentLt}, ${C.accent} 50%, ${C.accentLt})` }}/>
              <div style={{
                position:"absolute", top:7,
                left:`calc(${pct}% - 9px)`,
                width:18, height:18, borderRadius:"50%",
                background:C.accent, border:"3px solid #fff",
                boxShadow:"0 2px 8px rgba(196,115,75,.4)"
              }}/>
            </div>

            <div style={{ textAlign:"center", marginTop:14 }}>
              <span style={{ fontSize:12, color:C.muted }}>Sweet spot: </span>
              <span style={{ fontSize:19, fontWeight:600, color:C.accent, fontFamily:"'Playfair Display',serif" }}>{$(result.priceMid)}</span>
            </div>
          </div>

          {/* ──────── MARKET CONTEXT ──────── */}
          <div style={{ background:"#fff", borderRadius:12, padding:"18px 20px", border:`1px solid ${C.border}`, marginBottom:12, animation:"up .5s .1s ease both" }}>
            <div style={{ fontSize:9, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>Market Context</div>
            <p style={{ fontSize:14, color:C.text, lineHeight:1.8 }}>{result.marketContext}</p>
          </div>

          {/* ──────── WHAT'S WORKING ──────── */}
          <div style={{ background:"#fff", borderRadius:12, padding:"18px 20px", border:`1px solid ${C.border}`, marginBottom:12, animation:"up .5s .18s ease both" }}>
            <div style={{ fontSize:9, fontWeight:600, color:C.green, textTransform:"uppercase", letterSpacing:1.5, marginBottom:13, display:"flex", alignItems:"center", gap:5 }}>
              <TrendingUp size={11}/> What&apos;s Working
            </div>
            {(result.positiveFactors || []).map((f, i) => (
              <div key={i} style={{ display:"flex", gap:11, alignItems:"flex-start", paddingBottom: i < (result.positiveFactors.length - 1) ? 13 : 0, marginBottom: i < (result.positiveFactors.length - 1) ? 13 : 0, borderBottom: i < (result.positiveFactors.length - 1) ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width:21, height:21, borderRadius:"50%", background:C.greenBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ color:C.green, fontSize:11 }}>✓</span>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{f.factor}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:2, lineHeight:1.5 }}>{f.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ──────── AREAS TO DEVELOP ──────── */}
          <div style={{ background:"#fff", borderRadius:12, padding:"18px 20px", border:`1px solid ${C.border}`, marginBottom:12, animation:"up .5s .26s ease both" }}>
            <div style={{ fontSize:9, fontWeight:600, color:C.amber, textTransform:"uppercase", letterSpacing:1.5, marginBottom:13 }}>↗ Areas to Develop</div>
            {(result.developmentAreas || []).map((a, i) => (
              <div key={i} style={{ display:"flex", gap:11, alignItems:"flex-start", paddingBottom: i < (result.developmentAreas.length - 1) ? 13 : 0, marginBottom: i < (result.developmentAreas.length - 1) ? 13 : 0, borderBottom: i < (result.developmentAreas.length - 1) ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width:21, height:21, borderRadius:"50%", background:C.amberBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ color:C.amber, fontSize:12 }}>→</span>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{a.area}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:2, lineHeight:1.5 }}>{a.suggestion}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ──────── PRICING TIPS ──────── */}
          <div style={{ background:"#fff", borderRadius:12, padding:"18px 20px", border:`1px solid ${C.border}`, marginBottom:18, animation:"up .5s .34s ease both" }}>
            <div style={{ fontSize:9, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:1.5, marginBottom:13 }}>💡 Pricing Tips</div>
            {(result.tips || []).map((tip, i) => (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", paddingBottom: i < 2 ? 12 : 0, marginBottom: i < 2 ? 12 : 0, borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.accent, flexShrink:0 }}>{i + 1}.</span>
                <span style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>{tip}</span>
              </div>
            ))}
          </div>

          {/* ──────── PREMIUM CTA ──────── */}
          <div style={{ background:"linear-gradient(135deg, #1C1C1C 0%, #2A2A2A 100%)", borderRadius:14, padding:"24px 22px", textAlign:"center", animation:"up .5s .42s ease both" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:8 }}>
              <Lock size={13} color={C.accent}/>
              <span style={{ fontSize:10, fontWeight:600, color:C.accent, textTransform:"uppercase", letterSpacing:1.5 }}>Premium</span>
            </div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,.55)", lineHeight:1.75, maxWidth:300, margin:"0 auto 16px" }}>
              Unlock detailed trend analysis, a full portfolio price audit, and monthly market shift alerts.
            </p>
            <div style={{ display:"inline-flex", border:"1px solid rgba(255,255,255,.2)", borderRadius:20, padding:"7px 22px", color:"rgba(255,255,255,.4)", fontSize:12, cursor:"not-allowed" }}>
              Coming Soon
            </div>
          </div>

          <button className="btn-ghost" onClick={() => { setForm(p => ({ ...p, medium:"", w:"", h:"", unit:"in", year:"" })); setResult(null); setStep(1); }}>
            Price Another Piece →
          </button>
        </div>
      </Root>
    );
  }

  return null;
}
