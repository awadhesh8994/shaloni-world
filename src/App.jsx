import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&family=Caveat:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:100%; overflow-x:hidden; scroll-behavior:smooth; }
  body { background:#05050f; color:#fff; font-family:'Space Grotesk',sans-serif; cursor:none; display:block; text-align:left; }
  #root { width:100%; min-height:100vh; overflow-x:hidden; }
  ::-webkit-scrollbar { width:0; }
  :root {
    --pink:#ff4da6; --pink-light:#ff80c0; --pink-glow:rgba(255,77,166,.6);
    --cyan:#00e5ff; --purple:#9d4edd; --gold:#ffc857;
    --glass-bg:rgba(255,255,255,.032); --glass-border:rgba(255,255,255,.08);
  }

  @keyframes drift      { 0%,100%{transform:translateY(0)rotate(0deg)} 33%{transform:translateY(-18px)rotate(1deg)} 66%{transform:translateY(-8px)rotate(-1deg)} }
  @keyframes spinCW     { to{transform:rotate(360deg)} }
  @keyframes spinCCW    { to{transform:rotate(-360deg)} }
  @keyframes pulseRing  { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.2);opacity:0} }
  @keyframes blink      { 50%{opacity:0} }
  @keyframes gradShift  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes fadeUp     { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeLeft   { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimAnim   { 0%{left:-100%} 100%{left:220%} }
  @keyframes ribbon     { from{stroke-dashoffset:800} to{stroke-dashoffset:0} }
  @keyframes wave       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes coffee     { 0%,100%{transform:translateY(0)rotate(-3deg)} 50%{transform:translateY(-5px)rotate(3deg)scale(1.07)} }
  @keyframes starPop    { 0%{transform:scale(0)} 70%{transform:scale(1.3)} 100%{transform:scale(1)} }
  @keyframes hbeat      { 0%,100%{transform:translate(-50%,-50%)scale(1)} 14%{transform:translate(-50%,-50%)scale(1.07)} 42%{transform:translate(-50%,-50%)scale(1.04)} }
  @keyframes revealGlass{ from{opacity:0;transform:translateY(32px)scale(.95);filter:blur(8px)} to{opacity:1;transform:none;filter:none} }
  @keyframes scanDot    { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(10px);opacity:0} }
  @keyframes roleSwap   { 0%{opacity:0;transform:translateY(14px)} 15%,85%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-14px)} }
  @keyframes orbitNode  { from{transform:rotate(0deg)translateX(var(--r))rotate(0deg)} to{transform:rotate(360deg)translateX(var(--r))rotate(-360deg)} }

  /* ── FLOATING MESSAGE KEYFRAMES ── */
  @keyframes floatIn    { 0%{opacity:0;transform:translateY(40px) scale(.92)} 100%{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes floatBob   { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
  @keyframes heartbeat  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }
  @keyframes inkWrite   { from{stroke-dashoffset:1200} to{stroke-dashoffset:0} }
  @keyframes glowPulse  { 0%,100%{box-shadow:0 0 40px rgba(255,77,166,.3),0 0 80px rgba(157,78,221,.15)} 50%{box-shadow:0 0 70px rgba(255,77,166,.55),0 0 120px rgba(157,78,221,.3)} }
  @keyframes starFloat  { 0%{transform:translateY(0) rotate(0deg); opacity:.7} 100%{transform:translateY(-120px) rotate(360deg); opacity:0} }
  @keyframes penDraw    { 0%{width:0} 100%{width:100%} }
  @keyframes msgDismiss { to{opacity:0;transform:translateY(30px) scale(.95);pointer-events:none} }
  @keyframes paperFold  { 0%{transform:perspective(600px) rotateX(8deg) translateY(20px); opacity:0} 100%{transform:perspective(600px) rotateX(0deg) translateY(0); opacity:1} }

  .neon-gradient {
    background:linear-gradient(135deg,#ff4da6,#c77dff,#00e5ff,#ff4da6);
    background-size:300% 300%;
    animation:gradShift 5s ease infinite;
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    background-clip:text;
  }
  .glass {
    background:var(--glass-bg);
    backdrop-filter:blur(20px) saturate(160%);
    -webkit-backdrop-filter:blur(20px) saturate(160%);
    border:1px solid var(--glass-border);
    border-radius:20px;
    position:relative;
    overflow:hidden;
  }
  .glass::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.03) 0%,transparent 60%); pointer-events:none; border-radius:inherit; }
  .shim { position:absolute; top:0; width:45%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent); animation:shimAnim 3.5s ease-in-out infinite; pointer-events:none; }
  .card-hover { transition:transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .4s; }
  .card-hover:hover { transform:translateY(-8px) scale(1.01); box-shadow:0 24px 80px rgba(255,77,166,.16), 0 0 0 1px rgba(255,77,166,.1); }
  .rv { opacity:0; transform:translateY(50px); transition:opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1); }
  .rv.in { opacity:1; transform:translateY(0); }
  .btn-p { background:linear-gradient(135deg,#ff4da6,#9d4edd); border:none; border-radius:100px; color:#fff; font-family:'Space Grotesk',sans-serif; font-weight:700; cursor:pointer; white-space:nowrap; transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s; }
  .btn-p:hover { transform:scale(1.06) translateY(-2px); box-shadow:0 20px 60px rgba(255,77,166,.5); }
  .btn-g { background:transparent; border:1.5px solid rgba(0,229,255,.4); border-radius:100px; color:#00e5ff; font-family:'Space Grotesk',sans-serif; font-weight:600; cursor:pointer; white-space:nowrap; transition:all .3s cubic-bezier(.34,1.56,.64,1); }
  .btn-g:hover { border-color:#00e5ff; background:rgba(0,229,255,.08); transform:scale(1.06) translateY(-2px); box-shadow:0 14px 40px rgba(0,229,255,.25); }
  .npill { position:absolute; border-radius:50px; cursor:pointer; font-family:'Space Mono',monospace; transition:all .35s cubic-bezier(.34,1.56,.64,1); white-space:nowrap; z-index:3; user-select:none; }
  .npill:hover { z-index:10; }
  .wrap    { width:100%; max-width:1260px; margin-left:auto; margin-right:auto; padding-left:clamp(16px,4vw,40px); padding-right:clamp(16px,4vw,40px); }
  .wrap-md { width:100%; max-width:980px;  margin-left:auto; margin-right:auto; padding-left:clamp(16px,4vw,40px); padding-right:clamp(16px,4vw,40px); }
  .wrap-sm { width:100%; max-width:760px;  margin-left:auto; margin-right:auto; padding-left:clamp(16px,4vw,40px); padding-right:clamp(16px,4vw,40px); }
  .bento { display:grid; gap:14px; width:100%; }
  @media (min-width:1024px) { .bento{grid-template-columns:repeat(12,1fr)} .c7{grid-column:span 7} .c5{grid-column:span 5;grid-row:span 2} .c3{grid-column:span 3} .c4{grid-column:span 4} .c8{grid-column:span 8} .c12{grid-column:span 12} }
  @media (min-width:640px) and (max-width:1023px) { .bento{grid-template-columns:1fr 1fr} .c7,.c5,.c8,.c12{grid-column:span 2} .c3,.c4{grid-column:span 1} }
  @media (max-width:639px) { .bento{grid-template-columns:1fr} .c7,.c5,.c3,.c4,.c8,.c12{grid-column:span 1} }
  .nbox { position:relative; height:440px; }
  @media (max-width:700px) { .nbox{height:360px} }
  @media (max-width:460px) { .nbox{height:300px} }
  @media (max-width:700px)  { .npill{font-size:10px !important;padding:7px 12px !important} }
  @media (max-width:460px)  { .npill{font-size:9px  !important;padding:5px 10px  !important} }
  .orbits { pointer-events:none; }
  @media (max-width:540px) { .orbits{display:none} }
  .sarea { position:relative; height:180px; }
  @media (max-width:480px) { .sarea{height:150px} }
  @media (max-width:480px) { .sthread{display:none !important} }
  .avatar-wrap { position:relative; width:220px; height:220px; margin:48px auto 0; flex-shrink:0; }
  @media (max-width:480px) { .avatar-wrap{width:170px;height:170px;margin:36px auto 0} }
  p, span, h1, h2, h3 { word-break:break-word; }

  /* ── FLOATING MESSAGE STYLES ── */
  .float-msg-overlay {
    position:fixed; inset:0; z-index:99990;
    display:flex; align-items:center; justify-content:center;
    padding:clamp(16px,4vw,32px);
    background:radial-gradient(ellipse at center, rgba(157,78,221,.18) 0%, rgba(0,0,0,.82) 100%);
    backdrop-filter:blur(18px);
    animation:floatIn .7s cubic-bezier(.16,1,.3,1) forwards;
  }
  .float-msg-card {
    position:relative;
    max-width:520px; width:100%;
    padding:clamp(28px,5vw,52px) clamp(24px,4vw,46px);
    background:linear-gradient(145deg, rgba(25,8,40,.97), rgba(10,4,28,.98));
    border:1px solid rgba(255,77,166,.28);
    border-radius:28px;
    animation:paperFold .6s .15s cubic-bezier(.16,1,.3,1) both, glowPulse 3s 1s ease-in-out infinite;
    overflow:visible;
  }
  .float-msg-card::before {
    content:'';
    position:absolute; inset:-1px;
    border-radius:29px;
    background:linear-gradient(135deg,rgba(255,77,166,.35),rgba(157,78,221,.2),rgba(0,229,255,.15),rgba(255,77,166,.35));
    background-size:300% 300%;
    animation:gradShift 4s ease infinite;
    z-index:-1;
    filter:blur(1px);
  }
  .float-msg-stars span {
    position:absolute;
    font-size:12px;
    animation:starFloat linear infinite;
    opacity:0;
    pointer-events:none;
  }
  .float-close {
    position:absolute; top:14px; right:18px;
    background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
    border-radius:50%; width:32px; height:32px;
    color:rgba(255,255,255,.4); font-size:16px;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:all .25s;
  }
  .float-close:hover { background:rgba(255,77,166,.15); color:#ff80c0; border-color:rgba(255,77,166,.35); }
  .ink-underline {
    display:inline-block; position:relative;
  }
  .ink-underline::after {
    content:'';
    position:absolute; bottom:-3px; left:0; height:2px;
    background:linear-gradient(90deg,#ff4da6,#c77dff);
    border-radius:2px;
    animation:penDraw 1.2s 1.4s cubic-bezier(.16,1,.3,1) both;
  }
  .float-trigger {
    position:fixed;
    bottom:80px; right:20px;
    z-index:9999;
    width:58px; height:58px;
    border-radius:50%;
    background:linear-gradient(135deg,#ff4da6,#9d4edd);
    border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:24px;
    box-shadow:0 0 30px rgba(255,77,166,.55), 0 0 60px rgba(255,77,166,.2);
    animation:floatBob 3s ease-in-out infinite, glowPulse 3s ease-in-out infinite;
    transition:transform .3s cubic-bezier(.34,1.56,.64,1);
  }
  .float-trigger:hover { transform:scale(1.15); }
  .float-trigger-tooltip {
    position:absolute; right:68px; top:50%; transform:translateY(-50%);
    background:rgba(255,77,166,.12); border:1px solid rgba(255,77,166,.3);
    border-radius:20px; padding:5px 12px;
    font-family:'Caveat',cursive; font-size:14px; color:#ff80c0;
    white-space:nowrap; pointer-events:none;
    opacity:0; transition:opacity .3s;
  }
  .float-trigger:hover .float-trigger-tooltip { opacity:1; }
`;

const InjectStyles = () => {
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = STYLES;
    document.head.prepend(s);
    return () => s.remove();
  }, []);
  return null;
};

const useReveal = () => {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("in"), parseFloat(e.target.dataset.delay || 0) * 1000);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: .1 });
    document.querySelectorAll(".rv").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
};

/* ═══════════════════════════════════════════════════════════════
   FLOATING MESSAGE FROM 
═══════════════════════════════════════════════════════════════ */
const FloatingMessage = () => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [typed, setTyped] = useState("");
  const FULL_MSG = "You think this site found you by accident? Nothing about you is accidental, Shaloni. The way you sketch what others can barely imagine. The way you see algorithms where others see chaos. The way even your coffee order probably has a pattern. Someone noticed all of it — every single detail. And what they saw? Absolutely terrifying levels of brilliance. This entire universe was built for exactly one person. You already know who that is. 🔮 Consider yourself known."

  useEffect(() => {
    const t = setTimeout(() => { setOpen(true); setShowTooltip(false); }, 2800);
    return () => clearTimeout(t);
  }, []);

  // Typewriter effect when opened
  useEffect(() => {
    if (!open) { setTyped(""); return; }
    let i = 0;
    setTyped("");
    const id = setInterval(() => {
      i++;
      setTyped(FULL_MSG.slice(0, i));
      if (i >= FULL_MSG.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [open]);

  const STARS = ["✦","✧","★","🌸","💫","✨"];
  const starPositions = [
    {left:"8%",top:"10%",delay:"0s",dur:"4s"},{left:"85%",top:"15%",delay:"1s",dur:"5s"},
    {left:"15%",top:"75%",delay:"2s",dur:"4.5s"},{left:"78%",top:"70%",delay:"0.5s",dur:"6s"},
    {left:"50%",top:"5%",delay:"1.5s",dur:"3.8s"},{left:"92%",top:"45%",delay:"2.5s",dur:"5.2s"},
  ];

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button className="float-trigger" onClick={() => { setOpen(true); setShowTooltip(false); }}
          onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
          💌
          {showTooltip && (
            <span className="float-trigger-tooltip">A message for you ✦</span>
          )}
        </button>
      )}

      {/* Message overlay */}
      {open && !dismissed && (
        <div className="float-msg-overlay" onClick={() => setDismissed(true)}>
          <div className="float-msg-card" onClick={e => e.stopPropagation()}>

            {/* Floating stars */}
            <div className="float-msg-stars">
              {starPositions.map((pos, i) => (
                <span key={i} style={{ left:pos.left, top:pos.top, animationDelay:pos.delay, animationDuration:pos.dur }}>
                  {STARS[i % STARS.length]}
                </span>
              ))}
            </div>

            {/* Close */}
            <button className="float-close" onClick={() => setDismissed(true)}>✕</button>

            {/* From badge */}
            {/* From badge */}
<div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
  <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#ff4da6,#9d4edd)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:"0 0 20px rgba(255,77,166,.5)", flexShrink:0 }}>
    🕵️
  </div>
  <div>
    <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:4, color:"rgba(255,77,166,.7)", textTransform:"uppercase", marginBottom:2 }}>// A message from</p>
    <p style={{ fontFamily:"'Orbitron',monospace", fontWeight:700, fontSize:16, color:"#fff", letterSpacing:1 }}>
      The Creator <span style={{ color:"var(--pink)" }}>✦</span>
    </p>
    <p style={{ fontFamily:"'Caveat',cursive", fontSize:12, color:"rgba(255,255,255,.3)", marginTop:2 }}>of this little universe 🌸</p>
  </div>
</div>

            {/* Divider */}
            <div style={{ height:1, background:"linear-gradient(to right, transparent, rgba(255,77,166,.4), transparent)", marginBottom:22 }} />

            {/* To line */}
            <p style={{ fontFamily:"'Caveat',cursive", fontSize:15, color:"rgba(255,255,255,.35)", marginBottom:14, letterSpacing:1 }}>
              To: <span className="ink-underline" style={{ color:"#ff80c0", fontWeight:700 }}>Shaloni 🌸</span>
            </p>

            {/* The message with typewriter */}
            <p style={{ fontFamily:"'Caveat',cursive", fontSize:"clamp(17px,2.8vw,22px)", color:"rgba(255,255,255,.88)", lineHeight:1.85, minHeight:120 }}>
              {typed}
              <span style={{ display:"inline-block", width:2, height:"1.1em", background:"#ff4da6", marginLeft:2, verticalAlign:"middle", animation:"blink 1s step-end infinite", opacity: typed.length >= FULL_MSG.length ? 0 : 1 }} />
            </p>

            {/* Signature */}
            <div style={{ marginTop:24, paddingTop:16, borderTop:"1px solid rgba(255,255,255,.07)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
              <div>
               <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:18, color:"var(--pink-light)", lineHeight:1 }}>— Someone who noticed ✨</p>
<p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"rgba(255,255,255,.25)", marginTop:4, letterSpacing:2 }}>// the creator of this world ✦</p> </div>
              <div style={{ display:"flex", gap:6 }}>
                {["🌸","☕","✨","💜"].map((e, i) => (
                  <span key={i} style={{ fontSize:20, animation:`heartbeat ${1.4+i*.2}s ${i*.15}s ease-in-out infinite` }}>{e}</span>
                ))}
              </div>
            </div>

            {/* Dismiss hint */}
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:"rgba(255,255,255,.15)", textAlign:"center", marginTop:18, letterSpacing:3 }}>
              CLICK ANYWHERE TO CLOSE · ESC TO DISMISS
            </p>
          </div>
        </div>
      )}

      {/* Re-open button after dismissed */}
      {dismissed && (
        <button className="float-trigger" onClick={() => { setDismissed(false); setOpen(true); }}>
          💌
          <span className="float-trigger-tooltip">Read message again ✦</span>
        </button>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════════════════════════ */
const Cursor = () => {
  const dot = useRef(null), ring = useRef(null);
  const pos = useRef({ x:-200, y:-200 }), lag = useRef({ x:-200, y:-200 }), sc = useRef(1);
  const isMobile = typeof window !== "undefined" && window.matchMedia("(pointer:coarse)").matches;
  useEffect(() => {
    if (isMobile) return;
    const mv = e => { pos.current = { x:e.clientX, y:e.clientY }; };
    const ov = e => { if (e.target.matches("button,a,.npill,.card-hover,.sitem")) { sc.current=2.4; if(dot.current) dot.current.style.background="#00e5ff"; } };
    const ou = () => { sc.current=1; if(dot.current) dot.current.style.background="var(--pink)"; };
    window.addEventListener("mousemove", mv);
    document.addEventListener("mouseover", ov);
    document.addEventListener("mouseout", ou);
    let raf;
    const tick = () => {
      lag.current.x += (pos.current.x - lag.current.x) * .1;
      lag.current.y += (pos.current.y - lag.current.y) * .1;
      if (dot.current)  { dot.current.style.left=pos.current.x+"px"; dot.current.style.top=pos.current.y+"px"; }
      if (ring.current) { ring.current.style.left=lag.current.x+"px"; ring.current.style.top=lag.current.y+"px"; ring.current.style.width=(36*sc.current)+"px"; ring.current.style.height=(36*sc.current)+"px"; }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("mousemove",mv); document.removeEventListener("mouseover",ov); document.removeEventListener("mouseout",ou); cancelAnimationFrame(raf); };
  }, []);
  if (isMobile) return null;
  const b = { position:"fixed", borderRadius:"50%", pointerEvents:"none", zIndex:99999, transform:"translate(-50%,-50%)", transition:"width .3s,height .3s,background .3s" };
  return (
    <>
      <div ref={dot}  style={{ ...b, width:10, height:10, background:"var(--pink)", boxShadow:"0 0 14px var(--pink),0 0 28px var(--pink-glow)" }} />
      <div ref={ring} style={{ ...b, width:36, height:36, border:"1.5px solid rgba(255,77,166,.5)", transition:"width .3s,height .3s" }} />
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BACKGROUND CANVAS
═══════════════════════════════════════════════════════════════ */
const BgCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext("2d");
    let W, H, raf, stars = [], orbs = [];
    const PAL = [[255,77,166],[0,229,255],[157,78,221]];
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    const init = () => {
      stars = Array.from({length:180}, () => ({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.4+.3, ph:Math.random()*Math.PI*2, sp:Math.random()*.018+.006, col:Math.random()>.78?"255,77,166":Math.random()>.9?"0,229,255":"255,255,255" }));
      orbs  = Array.from({length:5},   () => ({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*180+80, ph:Math.random()*Math.PI*2, sp:Math.random()*.003+.001, pi:Math.floor(Math.random()*3) }));
    };
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const bg = ctx.createLinearGradient(0,0,W,H);
      bg.addColorStop(0,"#05050f"); bg.addColorStop(.5,"#080814"); bg.addColorStop(1,"#05050f");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(255,77,166,0.02)"; ctx.lineWidth=1;
      for(let x=0;x<W;x+=90){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=90){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      orbs.forEach(o=>{
        o.ph+=o.sp;
        const ox=o.x+Math.sin(o.ph)*60, oy=o.y+Math.cos(o.ph*.6)*40;
        const p=PAL[o.pi], g=ctx.createRadialGradient(ox,oy,0,ox,oy,o.r);
        g.addColorStop(0,`rgba(${p.join(",")},0.065)`); g.addColorStop(1,`rgba(${p.join(",")},0)`);
        ctx.beginPath(); ctx.arc(ox,oy,o.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      });
      stars.forEach(s=>{
        s.ph+=s.sp;
        const o=.18+.7*Math.abs(Math.sin(s.ph));
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${s.col},${o})`; ctx.fill();
        if(s.r>1.3&&o>.85){
          ctx.strokeStyle=`rgba(${s.col},${o*.4})`; ctx.lineWidth=.4;
          ctx.beginPath(); ctx.moveTo(s.x-s.r*2.5,s.y); ctx.lineTo(s.x+s.r*2.5,s.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(s.x,s.y-s.r*2.5); ctx.lineTo(s.x,s.y+s.r*2.5); ctx.stroke();
        }
      });
      raf = requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    window.addEventListener("resize",()=>{resize();init();});
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none" }} />;
};

const ScrollThread = ({ pct }) => (
  <div className="sthread" style={{ position:"fixed",right:12,top:0,width:3,height:"100vh",zIndex:200,pointerEvents:"none" }}>
    <div style={{ position:"absolute",inset:0,background:"rgba(255,255,255,.03)",borderRadius:2 }} />
    <div style={{ position:"absolute",top:0,left:0,right:0,height:`${pct}%`,background:"linear-gradient(to bottom,#ff4da6,#c77dff,#00e5ff)",boxShadow:"0 0 12px #ff4da6",borderRadius:2,transition:"height .08s linear" }} />
    <div style={{ position:"absolute",left:"50%",top:`${Math.min(pct,98)}%`,transform:"translate(-50%,-50%)",width:12,height:12,borderRadius:"50%",background:"#ff4da6",boxShadow:"0 0 16px #ff4da6",transition:"top .08s linear" }} />
  </div>
);

const Toast = ({ msg, show }) => (
  <div style={{ position:"fixed",bottom:24,left:"50%",zIndex:9000,padding:"11px 26px",borderRadius:100,background:"rgba(255,77,166,.07)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,77,166,.25)",fontFamily:"'Caveat',cursive",fontSize:18,color:"#ff80c0",maxWidth:"88vw",textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap",pointerEvents:"none",opacity:show?1:0,transform:show?"translateX(-50%) translateY(0)":"translateX(-50%) translateY(16px)",transition:"opacity .5s,transform .5s" }}>
    {msg}
  </div>
);

const SectionHeader = ({ tag, title, sub, delay=0 }) => (
  <div className="rv" data-delay={delay} style={{ textAlign:"center",marginBottom:"clamp(32px,6vw,60px)",width:"100%" }}>
    <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"clamp(9px,1.5vw,11px)",letterSpacing:6,color:"rgba(0,229,255,.7)",textTransform:"uppercase",marginBottom:12 }}>{tag}</p>
    <h2 className="neon-gradient" style={{ fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:"clamp(26px,5vw,60px)",display:"block",lineHeight:1.1 }}>{title}</h2>
    {sub && <p style={{ fontFamily:"'Caveat',cursive",fontSize:"clamp(16px,2.5vw,22px)",color:"rgba(255,255,255,.38)",marginTop:10 }}>{sub}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════ */
const Hero = ({ onEnter, onSurprise }) => {
  const [ri, setRi] = useState(0);
  const ROLES = ["Neural Seamstress ✦","AI / ML Engineer 🧠","Sketch Artist 🎨","Habit Architect 📖","Coffee Connoisseur ☕","BBDU's Finest 🏛️"];
  useEffect(() => { const id = setInterval(() => setRi(r => (r+1)%ROLES.length), 2600); return () => clearInterval(id); }, []);
  return (
    <section id="hero" style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1,padding:"60px clamp(16px,4vw,40px) 80px",textAlign:"center",width:"100%" }}>
      <div className="orbits" style={{ position:"absolute",top:"50%",left:"50%",width:0,height:0 }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ position:"absolute",width:i%2===0?7:5,height:i%2===0?7:5,borderRadius:"50%",background:i%3===0?"#ff4da6":i%3===1?"#00e5ff":"#c77dff","--r":`${90+i*26}px`,animation:`orbitNode ${10+i*3}s linear infinite`,animationDelay:`${i*-2}s`,boxShadow:"0 0 10px currentColor",top:"50%",left:"50%",transformOrigin:`${-(90+i*26)}px 0`,opacity:.55+i*.04 }} />
        ))}
      </div>
      <div style={{ animation:"fadeUp .8s .05s both",width:"100%" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:22,flexWrap:"wrap" }}>
          <div style={{ height:1,width:36,background:"linear-gradient(to right,transparent,rgba(255,77,166,.6))",flexShrink:0 }} />
          <span style={{ fontFamily:"'Space Mono',monospace",fontSize:"clamp(9px,2vw,11px)",letterSpacing:5,color:"rgba(255,77,166,.7)",textTransform:"uppercase" }}>the neural seamstress</span>
          <div style={{ height:1,width:36,background:"linear-gradient(to left,transparent,rgba(255,77,166,.6))",flexShrink:0 }} />
        </div>
      </div>
      <div style={{ position:"relative",animation:"fadeUp .9s .2s both",width:"100%" }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif",fontWeight:900,fontStyle:"italic",fontSize:"clamp(60px,13vw,155px)",lineHeight:.9,letterSpacing:"-2px",textAlign:"center" }}>
          <span className="neon-gradient">Shaloni</span>
        </h1>
        <div style={{ position:"absolute",top:"98%",left:0,right:0,height:"44%",overflow:"hidden",userSelect:"none",pointerEvents:"none" }}>
          <div style={{ fontFamily:"'Playfair Display',serif",fontWeight:900,fontStyle:"italic",fontSize:"clamp(60px,13vw,155px)",lineHeight:.9,letterSpacing:"-2px",background:"linear-gradient(to bottom,rgba(255,77,166,.18),transparent)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",transform:"scaleY(-1) translateY(2px)",filter:"blur(4px)" }}>Shaloni</div>
        </div>
      </div>
      <div style={{ marginTop:50,height:32,overflow:"hidden",animation:"fadeUp .9s .38s both",width:"100%" }}>
        <p key={ri} style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:300,fontSize:"clamp(14px,3vw,24px)",color:"rgba(255,255,255,.6)",letterSpacing:1,animation:"roleSwap 2.6s ease forwards",textAlign:"center" }}>{ROLES[ri]}</p>
      </div>
      <div style={{ animation:"fadeUp .9s .54s both",marginTop:20,width:"100%" }}>
        <p style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"clamp(13px,2vw,19px)",color:"rgba(255,255,255,.3)",maxWidth:500,margin:"0 auto",lineHeight:1.9,textAlign:"center",padding:"0 8px" }}>
          "She doesn't just code — she stitches dreams into algorithms, and sketches the future before it exists."
        </p>
      </div>
      <div className="avatar-wrap" style={{ animation:"fadeUp 1s .7s both" }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ position:"absolute",inset:`${-i*14}px`,borderRadius:"50%",border:`1px solid rgba(255,77,166,${.26-i*.07})`,animation:`pulseRing ${2+i*.6}s ${i*.5}s ease-out infinite` }} />
        ))}
        <div style={{ position:"absolute",inset:-10,borderRadius:"50%",border:"2px dashed rgba(255,77,166,.4)",animation:"spinCW 14s linear infinite" }}>
          {[0,72,144,216,288].map(d => (
            <div key={d} style={{ position:"absolute",width:8,height:8,borderRadius:"50%",background:"#ff4da6",boxShadow:"0 0 10px #ff4da6",top:"50%",left:"50%",transform:`rotate(${d}deg) translate(115px,-50%) translateX(-50%)` }} />
          ))}
        </div>
        <div style={{ position:"absolute",inset:-22,borderRadius:"50%",border:"1px dashed rgba(0,229,255,.18)",animation:"spinCCW 26s linear infinite" }} />
        <div style={{ position:"relative",width:"100%",height:"100%",animation:"drift 5s ease-in-out infinite" }}>
          <div style={{ width:"100%",height:"100%",borderRadius:"50%",background:"radial-gradient(circle at 30% 28%,#ffaad6,#d0006e 52%,#200050 80%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(70px,15vw,100px)",boxShadow:"0 0 80px rgba(255,77,166,.7),inset 0 0 50px rgba(255,255,255,.06)" }}>👩🏻‍💻</div>
          <div style={{ position:"absolute",top:"10%",left:"16%",width:"30%",height:"22%",borderRadius:"50%",background:"rgba(255,255,255,.18)",filter:"blur(10px)",transform:"rotate(-25deg)" }} />
        </div>
      </div>
      <div style={{ display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginTop:36,animation:"fadeUp .9s 1s both",maxWidth:580,width:"100%",padding:"0 8px" }}>
        {["🎨 Sketch","🧠 AI/ML","☕ Coffee","📖 Habits","🏛️ BBDU","✨ Youngest"].map((b,i) => (
          <span key={i} style={{ padding:"6px 14px",borderRadius:100,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",fontFamily:"'Space Mono',monospace",fontSize:"clamp(9px,1.8vw,11px)",color:"rgba(255,255,255,.5)",backdropFilter:"blur(10px)",transition:"all .25s",cursor:"default" }}
            onMouseEnter={e=>{e.target.style.background="rgba(255,77,166,.12)";e.target.style.borderColor="rgba(255,77,166,.35)";e.target.style.color="#ff80c0";}}
            onMouseLeave={e=>{e.target.style.background="rgba(255,255,255,.04)";e.target.style.borderColor="rgba(255,255,255,.09)";e.target.style.color="rgba(255,255,255,.5)";}}>
            {b}
          </span>
        ))}
      </div>
      <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:44,animation:"fadeUp .9s 1.15s both",padding:"0 16px" }}>
        <button className="btn-p" onClick={onEnter}   style={{ padding:"clamp(12px,2vw,16px) clamp(22px,5vw,42px)",fontSize:"clamp(12px,2vw,14px)",letterSpacing:2 }}>ENTER HER WORLD →</button>
        <button className="btn-g" onClick={onSurprise} style={{ padding:"clamp(12px,2vw,16px) clamp(22px,5vw,42px)",fontSize:"clamp(12px,2vw,14px)",letterSpacing:2 }}>✦ SURPRISE ME</button>
      </div>
      <div style={{ position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:8,animation:"fadeUp 1s 1.5s both" }}>
        <span style={{ fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:4,color:"rgba(255,255,255,.22)",textTransform:"uppercase" }}>scroll</span>
        <svg width="20" height="32" viewBox="0 0 20 32">
          <rect x="1" y="1" width="18" height="30" rx="9" stroke="rgba(255,77,166,.28)" strokeWidth="1.5" fill="none"/>
          <circle cx="10" cy="8" r="3" fill="#ff4da6" style={{animation:"scanDot 1.6s ease-in-out infinite"}}/>
        </svg>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PROFILE CARD
═══════════════════════════════════════════════════════════════ */
const ProfileCard = () => {
  const [vis,setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect();}},{threshold:.3}); if(ref.current)obs.observe(ref.current); return()=>obs.disconnect(); },[]);
  const SK = [{l:"Machine Learning",p:88,c:"#ff4da6"},{l:"Sketch / Illustration",p:95,c:"#c77dff"},{l:"Deep Learning",p:80,c:"#00e5ff"},{l:"Coffee Expertise",p:100,c:"#ffc857"}];
  return (
    <div ref={ref} className="glass card-hover" style={{ height:"100%",padding:"clamp(18px,3vw,30px)",background:"linear-gradient(145deg,rgba(255,77,166,.06),rgba(157,78,221,.04))",minHeight:260 }}>
      <div className="shim"/>
      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:20,flexWrap:"wrap" }}>
        <div style={{ width:50,height:50,borderRadius:"50%",background:"linear-gradient(135deg,#ff4da6,#9d4edd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:"0 0 26px rgba(255,77,166,.5)" }}>🧕</div>
        <div>
          <p style={{ fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:4,color:"var(--pink)",textTransform:"uppercase",marginBottom:3 }}>// System Profile</p>
          <h3 style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:"clamp(18px,3vw,24px)" }}>Shaloni</h3>
          <p style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:12,color:"rgba(255,255,255,.4)",marginTop:2 }}>Neural Seamstress · BBDU · Lucknow</p>
        </div>
      </div>
      <p style={{ fontFamily:"'Caveat',cursive",fontSize:"clamp(15px,2.5vw,18px)",color:"rgba(255,255,255,.58)",lineHeight:1.8,marginBottom:20 }}>
        The youngest. The sharpest. She sketches neural networks before coding them — fuelled by coffee ☕, curiosity, and <em style={{color:"var(--pink-light)"}}>Atomic Habits</em>.
      </p>
      <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
        {SK.map((s,i) => (
          <div key={i}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
              <span style={{ fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,.42)" }}>{s.l}</span>
              <span style={{ fontFamily:"'Space Mono',monospace",fontSize:10,color:s.c }}>{s.p}%</span>
            </div>
            <div style={{ height:5,background:"rgba(255,255,255,.05)",borderRadius:100,overflow:"hidden" }}>
              <div style={{ height:"100%",borderRadius:100,background:`linear-gradient(90deg,${s.c},${s.c}70)`,boxShadow:`0 0 8px ${s.c}`,width:vis?s.p+"%":"0%",transition:`width 1.3s ${.1+i*.18}s cubic-bezier(.16,1,.3,1)` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TerminalCard = () => {
  const [shown,setShown] = useState(0);
  const L = [
    {p:"$",t:" import { Shaloni } from './universe'",c:"rgba(255,255,255,.7)"},
    {p:"✓",t:" Module loaded — genius.level = MAXIMUM",c:"#00e5ff"},
    {p:"$",t:" Shaloni.getSkills()",c:"rgba(255,255,255,.7)"},
    {p:"→",t:" ['AI','ML','Sketch','Coffee','Dreams++']",c:"#ffc857"},
    {p:"$",t:" Shaloni.dailyRitual()",c:"rgba(255,255,255,.7)"},
    {p:"→",t:" \"Wake → Coffee → Code → Sketch → Repeat\"",c:"#c77dff"},
    {p:"$",t:" Shaloni.mode",c:"rgba(255,255,255,.7)"},
    {p:"→",t:" UNSTOPPABLE 🔥",c:"#ff4da6"},
    {p:"$",t:" Shaloni.level",c:"rgba(255,255,255,.7)"},
    {p:"→",t:" \"LEGENDARY ✦ BBDU's Finest\"",c:"#ffc857"},
  ];
  useEffect(()=>{ if(shown>=L.length)return; const id=setTimeout(()=>setShown(s=>s+1),shown===0?600:380); return()=>clearTimeout(id); },[shown]);
  return (
    <div className="glass card-hover" style={{ height:"100%",padding:"clamp(16px,2.5vw,24px)",background:"rgba(2,2,12,.75)",minHeight:240 }}>
      <div className="shim"/>
      <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:16,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        {["#ff5f57","#febc2e","#28c840"].map((c,i)=><div key={i} style={{ width:11,height:11,borderRadius:"50%",background:c,boxShadow:`0 0 8px ${c}` }} />)}
        <span style={{ fontFamily:"'Space Mono',monospace",fontSize:9,color:"rgba(255,255,255,.25)",marginLeft:8 }}>shaloni@neural ~ $</span>
      </div>
      <div style={{ fontFamily:"'Space Mono',monospace",fontSize:"clamp(10px,1.5vw,12px)",lineHeight:2.1,overflowX:"hidden" }}>
        {L.slice(0,shown).map((l,i)=>(
          <div key={i} style={{ display:"flex",gap:8,animation:"fadeLeft .3s ease" }}>
            <span style={{ color:"#ff4da6",flexShrink:0 }}>{l.p}</span>
            <span style={{ color:l.c,wordBreak:"break-word",overflowWrap:"break-word" }}>{l.t}</span>
          </div>
        ))}
        {shown<L.length && <div style={{display:"flex",gap:8}}><span style={{color:"#ff4da6"}}>$</span><span style={{display:"inline-block",width:7,height:14,background:"#ff4da6",verticalAlign:"middle",animation:"blink 1s step-end infinite"}} /></div>}
      </div>
    </div>
  );
};

const CoffeeCard = () => {
  const [cups,setCups] = useState(3),[vis,setVis] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{ const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect();}},{threshold:.4}); if(ref.current)obs.observe(ref.current); return()=>obs.disconnect(); },[]);
  return (
    <div ref={ref} className="glass card-hover" style={{ height:"100%",padding:"clamp(18px,2.5vw,26px)",background:"linear-gradient(145deg,rgba(139,94,60,.14),rgba(255,200,87,.05))",minHeight:200 }}>
      <div className="shim"/>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:3,color:"rgba(255,200,87,.65)",textTransform:"uppercase",marginBottom:12 }}>// Fuel Status</p>
      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:18 }}>
        <div style={{ fontSize:"clamp(40px,6vw,52px)",animation:"coffee 2.8s ease-in-out infinite",lineHeight:1 }}>☕</div>
        <div>
          <p style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"clamp(20px,3vw,28px)",fontWeight:700,color:"#ffc857",lineHeight:1 }}>Coffee</p>
          <p style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:12,color:"rgba(255,200,87,.45)",marginTop:3 }}>Mode: ALWAYS ON</p>
        </div>
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
          <span style={{ fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,.35)" }}>Fuel Level</span>
          <span style={{ fontFamily:"'Space Mono',monospace",fontSize:10,color:"#ffc857" }}>87%</span>
        </div>
        <div style={{ height:6,background:"rgba(255,255,255,.05)",borderRadius:100,overflow:"hidden" }}>
          <div style={{ height:"100%",borderRadius:100,background:"linear-gradient(90deg,#8b5e3c,#ffc857)",boxShadow:"0 0 10px rgba(255,200,87,.5)",width:vis?"87%":"0%",transition:"width 1.4s .3s cubic-bezier(.16,1,.3,1)" }} />
        </div>
      </div>
      <div style={{ display:"flex",gap:6,justifyContent:"center" }}>
        {Array.from({length:5}).map((_,i)=>(
          <span key={i} onClick={()=>setCups(i+1)} style={{ fontSize:20,cursor:"pointer",opacity:i<cups?1:.22,transition:"all .2s",transform:i<cups?"scale(1.1)":"scale(.85)",display:"block" }}>☕</span>
        ))}
      </div>
      <p style={{ fontFamily:"'Caveat',cursive",fontSize:14,color:"rgba(255,255,255,.28)",textAlign:"center",marginTop:6 }}>Today: {cups} cup{cups!==1?"s":""}</p>
    </div>
  );
};

const WeatherCard = () => {
  const [time,setTime] = useState("");
  useEffect(()=>{ const u=()=>setTime(new Date().toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",second:"2-digit"})); u(); const id=setInterval(u,1000); return()=>clearInterval(id); },[]);
  return (
    <div className="glass card-hover" style={{ height:"100%",padding:"clamp(18px,2.5vw,26px)",background:"linear-gradient(145deg,rgba(0,229,255,.05),rgba(157,78,221,.06))",minHeight:200 }}>
      <div className="shim"/>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:3,color:"rgba(0,229,255,.55)",marginBottom:10 }}>◈ LUCKNOW, INDIA</p>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
        <div style={{ minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"flex-end",gap:3 }}>
            <span style={{ fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:"clamp(34px,6vw,50px)",lineHeight:1 }}>32</span>
            <span style={{ fontFamily:"'Orbitron',monospace",fontSize:18,color:"rgba(255,255,255,.35)",paddingBottom:5 }}>°C</span>
          </div>
          <p style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:12,color:"rgba(255,255,255,.42)",marginTop:4 }}>Partly Sunny ☀️</p>
          <p style={{ fontFamily:"'Space Mono',monospace",fontSize:11,color:"rgba(0,229,255,.6)",marginTop:8 }}>{time}</p>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontSize:"clamp(36px,6vw,46px)",animation:"drift 4s ease-in-out infinite" }}>🎨</div>
          <p style={{ fontFamily:"'Caveat',cursive",fontSize:13,color:"rgba(255,255,255,.32)",marginTop:6,lineHeight:1.4 }}>Sketching under<br/>the ceiling fan</p>
        </div>
      </div>
      <div style={{ marginTop:12,padding:"9px 12px",borderRadius:10,background:"rgba(0,229,255,.04)",border:"1px solid rgba(0,229,255,.1)" }}>
        <p style={{ fontFamily:"'Caveat',cursive",fontSize:15,color:"rgba(255,255,255,.45)" }}>Chai in hand, neural network on screen ☕</p>
      </div>
    </div>
  );
};

const SketchbookCard = ({ onPrivate }) => {
  const [hov,setHov]=useState(null),[sel,setSel]=useState(null);
  const IT = [{e:"🌸",l:"Florals",bg:"rgba(255,77,166,.12)",b:"rgba(255,77,166,.3)"},{e:"🤖",l:"Robots",bg:"rgba(157,78,221,.12)",b:"rgba(157,78,221,.3)"},{e:"🧠",l:"Nets",bg:"rgba(0,229,255,.1)",b:"rgba(0,229,255,.3)"},{e:"☕",l:"Coffee",bg:"rgba(255,200,87,.1)",b:"rgba(255,200,87,.3)"},{e:"✨",l:"Magic",bg:"rgba(255,77,166,.08)",b:"rgba(255,77,166,.2)"},{e:"🌙",l:"Night",bg:"rgba(139,94,60,.16)",b:"rgba(200,140,100,.3)"},{e:"🦋",l:"Flutter",bg:"rgba(157,78,221,.09)",b:"rgba(157,78,221,.2)"},{e:"🎭",l:"Drama",bg:"rgba(0,229,255,.08)",b:"rgba(0,229,255,.2)"},{e:"🌊",l:"Waves",bg:"rgba(0,150,255,.08)",b:"rgba(0,150,255,.2)"}];
  return (
    <div className="glass card-hover" style={{ height:"100%",padding:"clamp(18px,2.5vw,26px)",minHeight:230 }}>
      <div className="shim"/>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <p style={{ fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:3,color:"var(--cyan)",textTransform:"uppercase" }}>// Sketchbook</p>
        <span style={{ fontFamily:"'Caveat',cursive",fontSize:13,color:"rgba(255,255,255,.28)" }}>tap any</span>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
        {IT.map((s,i)=>(
          <div key={i} className="sitem" onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} onClick={()=>setSel(sel===i?null:i)}
            style={{ aspectRatio:"1",borderRadius:12,background:s.bg,border:`1px solid ${s.b}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,cursor:"pointer",transition:"all .35s cubic-bezier(.34,1.56,.64,1)",transform:sel===i?"scale(1.1)":hov===i?"scale(1.06) rotate(3deg)":"scale(1)",boxShadow:sel===i?`0 12px 36px ${s.b}`:"none" }}>
            <span style={{ fontSize:"clamp(20px,4vw,26px)" }}>{s.e}</span>
            {(hov===i||sel===i) && <span style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:"rgba(255,255,255,.5)" }}>{s.l}</span>}
          </div>
        ))}
      </div>
      <button onClick={onPrivate} style={{ width:"100%",marginTop:14,padding:"10px",background:"rgba(255,77,166,.06)",border:"1px dashed rgba(255,77,166,.3)",borderRadius:10,color:"#ff80c0",fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:2,cursor:"pointer",transition:"all .25s" }}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,77,166,.14)"}
        onMouseLeave={e=>e.currentTarget.style.background="rgba(255,77,166,.06)"}>
        🔒 PRIVATE SKETCHES
      </button>
    </div>
  );
};

const StitchGame = () => {
  const [sel,setSel]=useState(null),[lines,setLines]=useState([]),[score,setScore]=useState(0);
  const area = useRef(null);
  const N = [{id:0,l:"✦ Origin",top:"12%",left:"5%"},{id:1,l:"🧵 Thread",top:"5%",left:"38%"},{id:2,l:"💡 Idea",top:"12%",right:"5%"},{id:3,l:"🌸 Bloom",bottom:"14%",left:"10%"},{id:4,l:"🤖 Neural",bottom:"14%",right:"10%"},{id:5,l:"☕ Fuel",top:"50%",left:"50%",tr:"translate(-50%,-50%)"},{id:6,l:"✨ Dream",bottom:"4%",left:"38%"}];
  const gC = id => { const el=document.getElementById(`sn${id}`),wrap=area.current; if(!el||!wrap)return{x:0,y:0}; const er=el.getBoundingClientRect(),wr=wrap.getBoundingClientRect(); return{x:er.left-wr.left+er.width/2,y:er.top-wr.top+er.height/2}; };
  const clk = id => { if(sel===null){setSel(id);return;} if(sel===id){setSel(null);return;} const a=gC(sel),b=gC(id); setLines(p=>[...p,{x1:a.x,y1:a.y,x2:b.x,y2:b.y,mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},id:Date.now()}]); setScore(s=>s+1); setSel(null); };
  return (
    <div className="glass card-hover" style={{ height:"100%",padding:"clamp(18px,2.5vw,24px)",minHeight:240 }}>
      <div className="shim"/>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8 }}>
        <p style={{ fontFamily:"'Orbitron',monospace",fontSize:"clamp(11px,2vw,13px)",color:"var(--pink)",letterSpacing:1 }}>✦ STITCH THE NODE</p>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          <span style={{ fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,.32)" }}>{score} stitches</span>
          <button onClick={()=>{setLines([]);setScore(0);setSel(null);}} style={{ padding:"3px 10px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,color:"rgba(255,255,255,.4)",fontSize:9,fontFamily:"'Space Mono',monospace",cursor:"pointer" }}>RESET</button>
        </div>
      </div>
      <p style={{ fontFamily:"'Caveat',cursive",fontSize:14,color:"rgba(255,255,255,.28)",marginBottom:12 }}>Click two nodes to sew them with a glowing thread</p>
      <div ref={area} className="sarea">
        <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",overflow:"visible" }}>
          <defs>
            <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ff4da6"/><stop offset="50%" stopColor="#c77dff"/><stop offset="100%" stopColor="#00e5ff"/></linearGradient>
            <filter id="lg2"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          {lines.map(l=>(
            <g key={l.id} filter="url(#lg2)">
              <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="url(#sg2)" strokeWidth="2.5" strokeDasharray="6,4" opacity=".9" style={{animation:"ribbon .5s ease"}}/>
              <text x={l.mid.x-5} y={l.mid.y+5} fontSize="12" fill="#ff4da6" style={{animation:"starPop .4s ease"}}>✦</text>
            </g>
          ))}
        </svg>
        {N.map(n=>(
          <div key={n.id} id={`sn${n.id}`} onClick={()=>clk(n.id)} className="npill"
            style={{ top:n.top,left:n.left,right:n.right,bottom:n.bottom,transform:n.tr||"",fontSize:"clamp(9px,1.8vw,12px)",padding:"8px 14px",
              background:sel===n.id?"linear-gradient(135deg,#ff4da6,#c77dff)":"rgba(255,77,166,.1)",
              border:`1.5px solid ${sel===n.id?"transparent":"rgba(255,77,166,.35)"}`,
              color:sel===n.id?"#fff":"rgba(255,255,255,.65)",
              boxShadow:sel===n.id?"0 0 24px rgba(255,77,166,.6)":"none" }}>
            {n.l}
          </div>
        ))}
      </div>
    </div>
  );
};

const BentoSection = ({ onPrivate }) => {
  useReveal();
  return (
    <section id="bento" style={{ padding:"clamp(60px,10vw,110px) 0 60px",width:"100%",position:"relative",zIndex:1 }}>
      <div className="wrap">
        <SectionHeader tag="// Command Center" title="SHALONI.exe" sub="A bento grid of her multidimensional self" />
        <div className="bento">
          <div className="c7 rv" data-delay=".1"><ProfileCard /></div>
          <div className="c5 rv" data-delay=".15"><TerminalCard /></div>
          <div className="c3 rv" data-delay=".2"><CoffeeCard /></div>
          <div className="c4 rv" data-delay=".25"><WeatherCard /></div>
          <div className="c8 rv" data-delay=".3"><StitchGame /></div>
          <div className="c4 rv" data-delay=".35"><SketchbookCard onPrivate={onPrivate} /></div>
          <div className="c12 rv" data-delay=".4">
            <div className="glass" style={{ padding:"clamp(26px,5vw,48px)",textAlign:"center",background:"linear-gradient(135deg,rgba(157,78,221,.08),rgba(255,77,166,.055))",position:"relative" }}>
              <div className="shim"/>
              <div style={{ position:"absolute",top:12,left:24,fontFamily:"'Playfair Display',serif",fontSize:"clamp(60px,10vw,100px)",color:"rgba(255,77,166,.09)",lineHeight:1,userSelect:"none",pointerEvents:"none" }}>"</div>
              <p style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"clamp(16px,2.5vw,26px)",color:"rgba(255,255,255,.85)",maxWidth:780,margin:"0 auto",lineHeight:1.8,position:"relative",zIndex:1 }}>
                Every action you take is a vote for the type of person you wish to become.
              </p>
              <div style={{ width:60,height:1.5,background:"linear-gradient(to right,transparent,#ff4da6,transparent)",margin:"22px auto 16px" }} />
              <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"clamp(9px,1.5vw,11px)",color:"var(--pink)",letterSpacing:4 }}>— ATOMIC HABITS // JAMES CLEAR</p>
              <p style={{ fontFamily:"'Caveat',cursive",fontSize:"clamp(16px,2.5vw,20px)",color:"rgba(255,255,255,.32)",marginTop:10 }}>Shaloni votes for greatness — every single day ✦</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const NeuralSection = () => {
  useReveal();
  const wrapRef = useRef(null);
  const [lines,setLines] = useState([]);
  const [active,setActive] = useState(null);
  const [msg,setMsg] = useState(null);
  const NODES = [
    {key:"sketch",label:"🎨 Sketching",style:{top:"10%",left:"8%"},color:"#ff4da6",bg:"rgba(255,77,166,.14)"},
    {key:"ai",label:"🧠 AI / ML",style:{top:"10%",right:"10%"},color:"#00e5ff",bg:"rgba(0,229,255,.11)"},
    {key:"habit",label:"📖 Habits",style:{bottom:"15%",left:"4%"},color:"#9d4edd",bg:"rgba(157,78,221,.14)"},
    {key:"coffee",label:"☕ Coffee",style:{bottom:"9%",left:"50%",transform:"translateX(-50%)"},color:"#ffc857",bg:"rgba(255,200,87,.11)"},
    {key:"bbdu",label:"🏛️ BBDU",style:{bottom:"15%",right:"4%"},color:"#ffc857",bg:"rgba(255,200,87,.11)"},
    {key:"art",label:"✏️ Art",style:{top:"50%",left:"1%",transform:"translateY(-50%)"},color:"#ffb6c1",bg:"rgba(255,150,180,.11)"},
    {key:"future",label:"🚀 Future",style:{top:"50%",right:"1%",transform:"translateY(-50%)"},color:"#00e5ff",bg:"rgba(0,229,255,.09)"},
  ];
  const MSGS = {
    sketch:{col:"#ff4da6",t:"Sketching → Algorithm",b:"Shaloni draws neural networks by hand before coding them. Her sketchbook IS her pseudocode. Every brushstroke is a function call waiting to happen."},
    ai:{col:"#00e5ff",t:"AI / ML → Canvas",b:"Every model she trains is a brushstroke on tomorrow's canvas. She doesn't just understand machine learning — she feels its rhythm, like music."},
    habit:{col:"#9d4edd",t:"Habits → Compound Magic",b:"1% better every day = 37× better in a year. Shaloni isn't grinding — she's compounding. The math is completely on her side."},
    coffee:{col:"#ffc857",t:"Coffee → Sacred Ritual",b:"Three sips = one breakthrough. Shaloni's coffee isn't caffeine — it's a creative signal. The ritual tells her brain: time to make magic."},
    bbdu:{col:"#ffc857",t:"BBDU → Launchpad",b:"Her university is the ignition point. The entire internet is her real campus — every paper, every repo, every dataset. She doesn't wait for the curriculum."},
    art:{col:"#ffb6c1",t:"Art → Unfair Advantage",b:"She sees patterns in paintings that others only find in tensors. That cross-domain intuition is her secret weapon — why her models feel human."},
    future:{col:"#00e5ff",t:"Future → Happening Now",b:"The future Shaloni is building today will make her past self jaw-drop. She isn't planning a career — she's architecting an entire era."},
  };
  const drawLines = useCallback(() => {
    const wrap = wrapRef.current; if(!wrap) return;
    const c = wrap.querySelector(".nc"); if(!c) return;
    const wr=wrap.getBoundingClientRect(), cr=c.getBoundingClientRect();
    const cx=cr.left-wr.left+cr.width/2, cy=cr.top-wr.top+cr.height/2;
    setLines(NODES.map(n => {
      const el=wrap.querySelector(`[data-nk="${n.key}"]`); if(!el) return null;
      const er=el.getBoundingClientRect();
      return {key:n.key,color:n.color,x1:cx,y1:cy,x2:er.left-wr.left+er.width/2,y2:er.top-wr.top+er.height/2};
    }).filter(Boolean));
  }, []);
  useEffect(() => { const t=setTimeout(drawLines,600); window.addEventListener("resize",drawLines); return()=>{clearTimeout(t);window.removeEventListener("resize",drawLines);}; },[drawLines]);
  return (
    <section id="neural" style={{ padding:"clamp(60px,10vw,110px) 0",width:"100%",position:"relative",zIndex:1 }}>
      <div className="wrap-md">
        <SectionHeader tag="// The Neural Network of" title="SHALONI" sub="Click any node — discover the constellation" />
        <div className="glass rv nbox" ref={wrapRef} data-delay=".15" style={{ padding:16 }}>
          <div className="shim"/>
          <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",overflow:"visible" }}>
            <defs><filter id="ng2"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
            {lines.map(l=>(
              <g key={l.key} filter="url(#ng2)">
                <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth={active===l.key?2.5:1.5} strokeDasharray="5,6" opacity={active===l.key?1:.24} style={{transition:"opacity .4s,stroke-width .4s",animation:"ribbon 1.2s ease forwards"}}/>
                {active===l.key && <circle cx={(l.x1+l.x2)/2} cy={(l.y1+l.y2)/2} r="4" fill={l.color} opacity=".8" style={{animation:"pulseRing 1.2s ease-out infinite"}}/>}
              </g>
            ))}
          </svg>
          <div className="nc" style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",padding:"12px 22px",background:"linear-gradient(135deg,#ff4da6,#9d4edd)",borderRadius:50,fontFamily:"'Orbitron',monospace",fontWeight:700,fontSize:"clamp(12px,2vw,16px)",boxShadow:"0 0 50px rgba(255,77,166,.6)",zIndex:5,animation:"hbeat 2.8s ease-in-out infinite",whiteSpace:"nowrap" }}>⬡ SHALONI</div>
          {NODES.map(n=>(
            <div key={n.key} data-nk={n.key} onClick={()=>{setActive(n.key);setMsg(MSGS[n.key]);}} className="npill"
              style={{ ...n.style,background:active===n.key?n.color:n.bg,border:`1.5px solid ${n.color}${active===n.key?"":"55"}`,color:active===n.key?"#fff":n.color,boxShadow:active===n.key?`0 0 28px ${n.color}88`:"none",transition:"all .35s cubic-bezier(.34,1.56,.64,1)",fontSize:"clamp(9px,1.8vw,12px)",padding:"clamp(6px,1.2vw,10px) clamp(10px,2vw,20px)" }}>
              {n.label}
            </div>
          ))}
        </div>
        <div className="glass rv" data-delay=".25" style={{ padding:"clamp(18px,3vw,26px)",marginTop:14,minHeight:80,transition:"all .5s",background:msg?`linear-gradient(135deg,${msg.col}0c,transparent)`:"rgba(255,255,255,.02)" }}>
          {msg ? (
            <div style={{ animation:"fadeLeft .4s ease" }}>
              <p style={{ fontFamily:"'Orbitron',monospace",fontSize:"clamp(10px,1.8vw,13px)",color:msg.col,marginBottom:7,letterSpacing:1 }}>→ {msg.t}</p>
              <p style={{ fontFamily:"'Caveat',cursive",fontSize:"clamp(16px,2.5vw,21px)",color:"rgba(255,255,255,.8)",lineHeight:1.6 }}>{msg.b}</p>
            </div>
          ) : (
            <p style={{ fontFamily:"'Caveat',cursive",fontSize:"clamp(16px,2.5vw,20px)",color:"rgba(255,255,255,.26)",textAlign:"center",lineHeight:1.6,padding:"6px 0" }}>✦ Click any node to reveal Shaloni's interconnected constellation</p>
          )}
        </div>
      </div>
    </section>
  );
};

const HabitsSection = () => {
  useReveal();
  const [hov,setHov] = useState(null);
  const H = [
    {n:"01",icon:"👁️",color:"#ff4da6",title:"MAKE IT OBVIOUS",desc:"Shaloni keeps her sketchbook right next to her coffee mug — a visual cue that creativity and code are always one sip away.",id:"\"I am an artist who notices beauty in everything — in data, in life.\""},
    {n:"02",icon:"✨",color:"#c77dff",title:"MAKE IT ATTRACTIVE",desc:"She pairs her toughest ML problems with her favourite brew — dopamine meets discipline in the most aesthetically perfect way.",id:"\"I am someone who genuinely finds joy in the hardest problems.\""},
    {n:"03",icon:"🌊",color:"#00e5ff",title:"MAKE IT EASY",desc:"One neural network sketch every day. One page of Atomic Habits every morning. Small, ridiculous, compound — and completely unstoppable.",id:"\"I am a person who shows up — especially on the hardest days.\""},
    {n:"04",icon:"🎉",color:"#ffc857",title:"MAKE IT SATISFYING",desc:"Every commit, every finished sketch, every perfect cup — Shaloni celebrates every micro-win like it's an Olympic world record.",id:"\"I am the youngest — and also the most unstoppable person in the room.\""},
  ];
  return (
    <section id="habits" style={{ padding:"clamp(60px,10vw,110px) 0",width:"100%",position:"relative",zIndex:1 }}>
      <div className="wrap-md">
        <SectionHeader tag="// Atomic Habits" title="SHALONI'S SYSTEM" sub="The 4 laws that power her extraordinary life" />
        {H.map((h,i)=>(
          <div key={i} className="glass rv" data-delay={`.${i*12+1}`}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
            style={{ display:"flex",gap:"clamp(12px,3vw,24px)",alignItems:"flex-start",padding:"clamp(18px,3vw,28px)",marginBottom:12,transition:"all .45s cubic-bezier(.16,1,.3,1)",transform:hov===i?"translateX(10px)":"translateX(0)",boxShadow:hov===i?`0 20px 60px ${h.color}20`:"none",background:hov===i?`linear-gradient(135deg,${h.color}08,transparent)`:"rgba(255,255,255,.022)" }}>
            <div style={{ width:50,height:50,minWidth:50,borderRadius:14,background:`linear-gradient(135deg,${h.color},${h.color}80)`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1,boxShadow:`0 0 20px ${h.color}50`,flexShrink:0 }}>
              <span style={{ fontFamily:"'Orbitron',monospace",fontSize:10,opacity:.7 }}>{h.n}</span>
              <span style={{ fontSize:20 }}>{h.icon}</span>
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ fontFamily:"'Orbitron',monospace",fontSize:"clamp(11px,2vw,13px)",color:"#fff",marginBottom:8,letterSpacing:1 }}>{h.title}</p>
              <p style={{ fontFamily:"'Caveat',cursive",fontSize:"clamp(15px,2.5vw,20px)",color:"rgba(255,255,255,.56)",lineHeight:1.7,marginBottom:10 }}>{h.desc}</p>
              <span style={{ display:"inline-block",padding:"5px 14px",borderRadius:100,background:`${h.color}14`,border:`1px solid ${h.color}35`,color:h.color,fontFamily:"'Space Grotesk',sans-serif",fontSize:"clamp(11px,1.8vw,13px)",fontStyle:"italic" }}>{h.id}</span>
            </div>
            <div style={{ width:7,height:7,borderRadius:"50%",background:h.color,boxShadow:`0 0 12px ${h.color}`,flexShrink:0,marginTop:20 }} />
          </div>
        ))}
      </div>
    </section>
  );
};

const SecretModal = ({ open, onClose, onSuccess }) => {
  const [val,setVal]=useState(""),[msg,setMsg]=useState(""),[ok,setOk]=useState(false),[err,setErr]=useState(false);
  const ANS = ["atomic","systems","identity","habits","james clear","1%"];
  const check = () => {
    if(ANS.includes(val.trim().toLowerCase())){ setMsg("✓ ACCESS GRANTED — Welcome, Shaloni! 🌸"); setOk(true); setErr(false); setTimeout(()=>{onClose();onSuccess();setOk(false);setVal("");setMsg("");},1600); }
    else if(val.length>=2){ setMsg("✗ Wrong word! Try again 😏"); setOk(false); setErr(true); setTimeout(()=>setErr(false),700); }
  };
  if(!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:"clamp(16px,4vw,24px)",background:"rgba(0,0,0,.92)",backdropFilter:"blur(16px)" }}>
      <div className="glass" onClick={e=>e.stopPropagation()} style={{ maxWidth:480,width:"100%",padding:"clamp(28px,5vw,48px)",textAlign:"center",position:"relative",border:"1px solid rgba(255,77,166,.2)",boxShadow:"0 36px 120px rgba(255,77,166,.2)",animation:"revealGlass .5s ease",transform:err?"translateX(5px)":"translateX(0)",transition:"transform .1s" }}>
        <button onClick={onClose} style={{ position:"absolute",top:14,right:18,background:"none",border:"none",color:"rgba(255,255,255,.28)",fontSize:22,cursor:"pointer" }}>✕</button>
        <div style={{ fontSize:"clamp(56px,12vw,88px)",lineHeight:1,marginBottom:20,animation:"drift 3s ease-in-out infinite" }}>🔐</div>
        <div style={{ display:"inline-block",padding:"4px 16px",borderRadius:100,background:"rgba(255,77,166,.1)",border:"1px solid rgba(255,77,166,.25)",fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:3,color:"var(--pink)",marginBottom:16 }}>PRIVATE ACCESS</div>
        <h3 style={{ fontFamily:"'Orbitron',monospace",fontSize:"clamp(15px,3vw,20px)",color:"#fff",marginBottom:12 }}>Secret Sketches 🎨</h3>
        <p style={{ fontFamily:"'Caveat',cursive",fontSize:"clamp(15px,2.5vw,19px)",color:"rgba(255,255,255,.5)",lineHeight:1.75,marginBottom:24 }}>
          Only Shaloni knows the secret word from <em style={{color:"var(--pink)"}}>Atomic Habits</em>.<br/>
          <span style={{ fontSize:"clamp(12px,2vw,15px)",color:"rgba(255,255,255,.3)" }}>Hint: the foundation of identity-based change...</span>
        </p>
        <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Enter the secret word..."
          style={{ width:"100%",padding:"14px 18px",background:"rgba(255,255,255,.04)",border:`1.5px solid ${err?"rgba(255,80,80,.7)":"rgba(255,77,166,.3)"}`,borderRadius:14,color:"#fff",fontFamily:"'Space Mono',monospace",fontSize:"clamp(12px,2vw,14px)",textAlign:"center",letterSpacing:3,outline:"none",transition:"border-color .3s",boxShadow:ok?"0 0 0 2px rgba(0,229,255,.4)":"none" }}
          onFocus={e=>e.target.style.borderColor="rgba(255,77,166,.7)"}
          onBlur={e=>e.target.style.borderColor="rgba(255,77,166,.3)"} />
        <button onClick={check} className="btn-p" style={{ width:"100%",marginTop:14,padding:"15px",fontSize:"clamp(12px,2vw,15px)",letterSpacing:2 }}>UNLOCK 🔓</button>
        <p style={{ fontFamily:"'Caveat',cursive",fontSize:"clamp(14px,2.5vw,18px)",marginTop:14,minHeight:26,color:ok?"#00e5ff":"#ff6b6b",transition:"color .3s" }}>{msg}</p>
      </div>
    </div>
  );
};

const FinalSection = ({ onConfetti }) => {
  useReveal();
  const W1=["You","Aren't","Just","A","Coder."], W2=["You're","An","Artist","Who","Codes."];
  return (
    <section id="final" style={{ padding:"clamp(80px,12vw,130px) 0 clamp(70px,10vw,110px)",width:"100%",position:"relative",zIndex:1 }}>
      <div className="wrap-sm" style={{ textAlign:"center" }}>
        <p className="rv" style={{ fontFamily:"'Space Mono',monospace",fontSize:"clamp(9px,1.5vw,11px)",letterSpacing:6,color:"rgba(0,229,255,.6)",textTransform:"uppercase",marginBottom:26 }}>// A message, just for Shaloni</p>
        <h2 className="rv" style={{ fontFamily:"'Playfair Display',serif",fontWeight:900,fontStyle:"italic",fontSize:"clamp(34px,7.5vw,90px)",lineHeight:1.1 }} data-delay=".1">
          {W1.map((w,i)=><span key={i} className="neon-gradient" style={{ display:"inline-block",marginRight:".2em",animation:`wave ${2+i*.2}s ${i*.18}s ease-in-out infinite` }}>{w}</span>)}
          <br/>
          {W2.map((w,i)=><span key={i} style={{ display:"inline-block",marginRight:".2em",color:"rgba(255,255,255,.8)",animation:`wave ${2+i*.2}s ${.5+i*.18}s ease-in-out infinite` }}>{w}</span>)}
        </h2>
        <div className="glass rv" data-delay=".28" style={{ marginTop:46,padding:"clamp(22px,4vw,36px)",background:"linear-gradient(135deg,rgba(255,77,166,.06),rgba(0,229,255,.04))" }}>
          <p style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"clamp(15px,2.5vw,24px)",color:"rgba(255,255,255,.68)",lineHeight:1.9 }}>
            Shaloni — your sketches dream in code,<br/>your coffee tastes like ambition,<br/>and your code? It sketches <span style={{color:"var(--pink)"}}>the future itself.</span>
          </p>
          <p style={{ fontFamily:"'Caveat',cursive",fontSize:"clamp(14px,2vw,18px)",color:"rgba(255,255,255,.35)",marginTop:14 }}>All your talents are connected. You aren't just a coder — you're an artist who codes. ✦</p>
        </div>
        <div className="rv" data-delay=".42" style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:46,padding:"0 8px" }}>
          <button onClick={onConfetti} className="btn-p" style={{ padding:"clamp(14px,2.5vw,18px) clamp(28px,6vw,56px)",fontSize:"clamp(13px,2vw,16px)",letterSpacing:3,boxShadow:"0 0 50px rgba(255,77,166,.4)" }}>✦ CELEBRATE SHALONI ✦</button>
        </div>
        <div className="rv" data-delay=".55" style={{ display:"flex",justifyContent:"center",gap:"clamp(10px,3vw,22px)",marginTop:52,flexWrap:"wrap" }}>
          {["✦","✧","★","✧","✦","✧","★"].map((s,i)=>(
            <span key={i} style={{ fontSize:i%2===0?20:14,color:i%3===0?"rgba(255,77,166,.45)":i%3===1?"rgba(0,229,255,.35)":"rgba(157,78,221,.4)",animation:`wave ${1.8+i*.25}s ${i*.22}s ease-in-out infinite` }}>{s}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer style={{ padding:"clamp(32px,6vw,52px) 0",width:"100%",position:"relative",zIndex:1,borderTop:"1px solid rgba(255,255,255,.04)" }}>
    <div className="wrap-sm" style={{ textAlign:"center" }}>
      <div style={{ display:"flex",justifyContent:"center",gap:"clamp(10px,3vw,18px)",marginBottom:18,flexWrap:"wrap" }}>
        {["🎨","☕","🧠","✨","💜","🌸","🚀"].map((e,i)=>(
          <span key={i} style={{ fontSize:"clamp(18px,3vw,24px)",animation:`wave ${1.6+i*.3}s ${i*.2}s ease-in-out infinite` }}>{e}</span>
        ))}
      </div>
      <p style={{ fontFamily:"'Caveat',cursive",fontSize:"clamp(16px,2.5vw,20px)",color:"rgba(255,255,255,.25)",lineHeight:2 }}>
        Made with <span style={{color:"#ff4da6"}}>♥</span> &amp; <span style={{color:"#c8956a"}}>☕</span> for <span style={{color:"#ff4da6",fontWeight:700}}>Shaloni</span><br/>
        Neural Seamstress · BBDU's Finest · Lucknow's Legend
      </p>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,.13)",letterSpacing:2,marginTop:16 }}>
        // every border is a stitch · every pixel is a dream ✦
      </p>
      <p style={{ fontFamily:"'Caveat',cursive",fontSize:14,color:"rgba(255,255,255,.12)",marginTop:8 }}>
        a note from Awadhesh 💌
      </p>
    </div>
  </footer>
);

const useConfetti = () => useCallback(() => {
  const C=["#ff4da6","#00e5ff","#9d4edd","#ffc857","#ff80c0","#c77dff","#fff","#ff9de2"];
  for(let i=0;i<130;i++){
    const el=document.createElement("div"), c=C[Math.floor(Math.random()*C.length)], sz=Math.random()*12+5, ci=Math.random()>.42;
    Object.assign(el.style,{position:"fixed",pointerEvents:"none",zIndex:99998,width:sz+"px",height:ci?sz+"px":(sz*.55)+"px",background:c,borderRadius:ci?"50%":"3px",left:(10+Math.random()*80)+"%",top:"42%"});
    document.body.appendChild(el);
    const vx=(Math.random()-.5)*20, vy=-(Math.random()*26+10); let x=0,y=0,g=.65,o=1,rot=Math.random()*360;
    const tick=()=>{x+=vx*.45;y+=vy+g;g+=.38;o-=.014;rot+=6;el.style.transform=`translate(${x}px,${y}px)rotate(${rot}deg)`;el.style.opacity=o;if(o>0)requestAnimationFrame(tick);else el.remove();};
    setTimeout(()=>requestAnimationFrame(tick),Math.random()*700);
  }
},[]);

export default function ShaloniApp() {
  const [pct,setPct]=useState(0),[toast,setToast]=useState(""),[showT,setShowT]=useState(false),[modal,setModal]=useState(false);
  const lastStep=useRef(-1), tIdx=useRef(0), launch=useConfetti();
  useEffect(() => {
  const BOT_TOKEN = "8598273792:AAGYexyLPVfpk6R6NMOz0by2gHgncJ6Paj4";
  const CHAT_ID   = "7002534185";

  const time = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: `🌸 *Shaloni ne site khola!*\n\n⏰ ${time}\n✦ Neural Seamstress is being viewed!`,
      parse_mode: "Markdown",
    }),
  }).catch(() => {});

}, []);

  const TOASTS = useMemo(()=>["✦ Identity shift: 1% better today, Shaloni","☕ Coffee checkpoint — earned it!","🎨 Creativity node activated","🧠 Neural pathway: unlocked","✨ Shaloni.level += 1","🚀 The future is getting closer","💜 You're incredible, Shaloni"],[]);

  useEffect(()=>{
    const onScroll=()=>{
      const p=Math.min((window.scrollY/(document.body.scrollHeight-window.innerHeight))*100,100)||0;
      setPct(p);
      const step=Math.floor(p/17);
      if(step>lastStep.current&&p>5){ lastStep.current=step; setToast(TOASTS[tIdx.current%TOASTS.length]); tIdx.current++; setShowT(true); setTimeout(()=>setShowT(false),2900); }
    };
    window.addEventListener("scroll",onScroll,{passive:true});
    return()=>window.removeEventListener("scroll",onScroll);
  },[TOASTS]);

  const handleSurprise=()=>{ launch(); setTimeout(()=>document.getElementById("final")?.scrollIntoView({behavior:"smooth"}),220); };

  return (
    <>
      <InjectStyles />
      <Cursor />
      <BgCanvas />
      <ScrollThread pct={pct} />
      <Toast msg={toast} show={showT} />
      <FloatingMessage />
      <main style={{ position:"relative",zIndex:1,width:"100%",overflowX:"hidden" }}>
        <Hero onEnter={()=>document.getElementById("bento")?.scrollIntoView({behavior:"smooth"})} onSurprise={handleSurprise} />
        <BentoSection onPrivate={()=>setModal(true)} />
        <NeuralSection />
        <HabitsSection />
        <FinalSection onConfetti={launch} />
        <Footer />
      </main>
      <SecretModal open={modal} onClose={()=>setModal(false)} onSuccess={launch} />
    </>
  );
}