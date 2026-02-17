import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   GLOBAL STYLES + KEYFRAMES
═══════════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&family=Caveat:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { background:#05050f; color:#fff; overflow-x:hidden; font-family:'Space Grotesk',sans-serif; cursor:none; }
  ::-webkit-scrollbar { width:0; }

  :root {
    --pink:#ff4da6; --pink-light:#ff80c0; --pink-glow:rgba(255,77,166,.6);
    --cyan:#00e5ff; --cyan-glow:rgba(0,229,255,.5);
    --purple:#9d4edd; --purple-glow:rgba(157,78,221,.5);
    --gold:#ffc857; --rose:#ff6b9d; --lavender:#c77dff;
    --bg:#05050f; --bg2:#0a0a1a;
    --glass-bg:rgba(255,255,255,.032); --glass-border:rgba(255,255,255,.08);
  }

  @keyframes drift        { 0%,100%{transform:translateY(0)rotate(0deg)} 33%{transform:translateY(-22px)rotate(1.5deg)} 66%{transform:translateY(-10px)rotate(-1deg)} }
  @keyframes orbit        { from{transform:rotate(0deg)translateX(var(--r,110px))rotate(0deg)} to{transform:rotate(360deg)translateX(var(--r,110px))rotate(-360deg)} }
  @keyframes spinCW       { to{transform:rotate(360deg)} }
  @keyframes spinCCW      { to{transform:rotate(-360deg)} }
  @keyframes pulseRing    { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.2);opacity:0} }
  @keyframes blink        { 50%{opacity:0} }
  @keyframes gradShift    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes fadeSlideUp  { from{opacity:0;transform:translateY(50px)scale(.97)} to{opacity:1;transform:translateY(0)scale(1)} }
  @keyframes fadeSlideLeft{ from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimmer      { 0%{left:-100%} 100%{left:220%} }
  @keyframes ribbonFlow   { from{stroke-dashoffset:800} to{stroke-dashoffset:0} }
  @keyframes waveText     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes morphBlob    { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
  @keyframes coffeeRise   { 0%,100%{transform:translateY(0)rotate(-3deg)} 50%{transform:translateY(-6px)rotate(3deg)scale(1.08)} }
  @keyframes starPop      { 0%{transform:scale(0)rotate(0)} 70%{transform:scale(1.4)rotate(20deg)} 100%{transform:scale(1)rotate(0)} }
  @keyframes heartbeat    { 0%,100%{transform:translate(-50%,-50%)scale(1)} 14%{transform:translate(-50%,-50%)scale(1.08)} 28%{transform:translate(-50%,-50%)scale(1)} 42%{transform:translate(-50%,-50%)scale(1.05)} }
  @keyframes glassReveal  { from{opacity:0;transform:translateY(40px)scale(.94);filter:blur(12px)} to{opacity:1;transform:translateY(0)scale(1);filter:blur(0)} }
  @keyframes progressFill { from{width:0} to{width:var(--target,80%)} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(50px)} to{opacity:1;transform:translateX(0)} }
  @keyframes scanDot      { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(12px);opacity:0} }
  @keyframes roleSwap     { 0%{opacity:0;transform:translateY(16px)} 15%,85%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-16px)} }
  @keyframes neonPulse    { 0%,100%{box-shadow:0 0 30px var(--pink-glow),0 0 60px rgba(255,77,166,.2)} 50%{box-shadow:0 0 80px var(--pink-glow),0 0 160px rgba(255,77,166,.3)} }
  @keyframes toastPop     { 0%{opacity:0;transform:translateX(-50%)translateY(20px)} 15%,85%{opacity:1;transform:translateX(-50%)translateY(0)} 100%{opacity:0;transform:translateX(-50%)translateY(-10px)} }
  @keyframes particleFly  { 0%{transform:translate(0,0)rotate(0deg)scale(1);opacity:1} 100%{transform:translate(var(--dx,0),var(--dy,-200px))rotate(360deg)scale(0);opacity:0} }

  .neon-gradient {
    background:linear-gradient(135deg,#ff4da6,#c77dff,#00e5ff,#ff4da6);
    background-size:300% 300%;
    animation:gradShift 5s ease infinite;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .glass {
    background:var(--glass-bg); backdrop-filter:blur(24px)saturate(180%);
    -webkit-backdrop-filter:blur(24px)saturate(180%);
    border:1px solid var(--glass-border); border-radius:24px;
    position:relative; overflow:hidden;
  }
  .glass::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.035) 0%,transparent 50%,rgba(255,255,255,.015) 100%); pointer-events:none; border-radius:inherit; }
  .shimmer-el { position:absolute; top:0; width:45%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.055),transparent); animation:shimmer 3.5s ease-in-out infinite; pointer-events:none; }

  .card-hover { transition:transform .45s cubic-bezier(.34,1.56,.64,1),box-shadow .45s ease; }
  .card-hover:hover { transform:translateY(-10px)scale(1.015); box-shadow:0 28px 90px rgba(255,77,166,.18),0 0 0 1px rgba(255,77,166,.12); }

  .reveal { opacity:0; transform:translateY(64px); transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1); }
  .reveal.in { opacity:1; transform:translateY(0); }

  .btn-primary { background:linear-gradient(135deg,#ff4da6,#9d4edd); border:none; border-radius:100px; color:#fff; font-family:'Space Grotesk',sans-serif; font-weight:700; cursor:pointer; position:relative; overflow:hidden; transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s; }
  .btn-primary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.22),transparent); opacity:0; transition:opacity .3s; }
  .btn-primary:hover { transform:scale(1.07)translateY(-3px); box-shadow:0 24px 70px rgba(255,77,166,.55); }
  .btn-primary:hover::before { opacity:1; }

  .btn-ghost { background:transparent; border:1.5px solid rgba(0,229,255,.4); border-radius:100px; color:#00e5ff; font-family:'Space Grotesk',sans-serif; font-weight:600; cursor:pointer; transition:all .35s cubic-bezier(.34,1.56,.64,1); position:relative; overflow:hidden; }
  .btn-ghost::before { content:''; position:absolute; inset:0; background:rgba(0,229,255,.1); transform:scaleX(0); transform-origin:left; transition:transform .35s ease; }
  .btn-ghost:hover { border-color:#00e5ff; transform:scale(1.07)translateY(-3px); box-shadow:0 16px 50px rgba(0,229,255,.3); }
  .btn-ghost:hover::before { transform:scaleX(1); }

  .node-pill { position:absolute; border-radius:50px; cursor:pointer; font-family:'Space Mono',monospace; font-size:12px; padding:10px 20px; transition:all .35s cubic-bezier(.34,1.56,.64,1); white-space:nowrap; z-index:3; user-select:none; }
  .node-pill:hover { transform:scale(1.18)!important; z-index:10; }

  @media(max-width:900px) { .bento-grid { grid-template-columns:1fr 1fr!important; } .span-7,.span-8,.span-12 { grid-column:span 2!important; } .span-5,.span-4,.span-3 { grid-column:span 1!important; } }
  @media(max-width:580px) { .bento-grid { grid-template-columns:1fr!important; } .span-7,.span-8,.span-12,.span-5,.span-4,.span-3 { grid-column:span 1!important; } .neural-box { height:320px!important; } .node-pill { font-size:10px!important; padding:7px 13px!important; } }
`;

/* ─── Inject once ─── */
const InjectStyles = () => {
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = STYLES;
    document.head.prepend(s);
    return () => s.remove();
  }, []);
  return null;
};

/* ═══════════════════════════════════════════════════════════════
   REVEAL ON SCROLL — runs once per mount
═══════════════════════════════════════════════════════════════ */
const useReveal = () => {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.delay || 0;
          setTimeout(() => e.target.classList.add("in"), parseFloat(delay) * 1000);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: .1 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
};

/* ═══════════════════════════════════════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════════════════════════════════════ */
const Cursor = () => {
  const dot  = useRef(null);
  const ring = useRef(null);
  const pos  = useRef({ x:-200, y:-200 });
  const lag  = useRef({ x:-200, y:-200 });
  const sc   = useRef(1);

  useEffect(() => {
    const onMove = e => { pos.current = { x:e.clientX, y:e.clientY }; };
    const onOver = e => {
      const t = e.target;
      if (t.matches("button,a,.node-pill,.card-hover,.sketch-item,[data-cur]")) {
        sc.current = 2.6;
        if (dot.current) dot.current.style.background = "#00e5ff";
      }
    };
    const onOut = () => { sc.current = 1; if (dot.current) dot.current.style.background = "var(--pink)"; };
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout",  onOut);
    let raf;
    const tick = () => {
      lag.current.x += (pos.current.x - lag.current.x) * .1;
      lag.current.y += (pos.current.y - lag.current.y) * .1;
      if (dot.current)  { dot.current.style.left  = pos.current.x+"px"; dot.current.style.top  = pos.current.y+"px"; }
      if (ring.current) { ring.current.style.left  = lag.current.x+"px"; ring.current.style.top  = lag.current.y+"px"; ring.current.style.width  = (36*sc.current)+"px"; ring.current.style.height = (36*sc.current)+"px"; }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("mousemove",onMove); document.removeEventListener("mouseover",onOver); document.removeEventListener("mouseout",onOut); cancelAnimationFrame(raf); };
  }, []);

  const base = { position:"fixed", borderRadius:"50%", pointerEvents:"none", zIndex:99999, transform:"translate(-50%,-50%)", transition:"width .3s,height .3s,background .3s" };
  return (
    <>
      <div ref={dot}  style={{ ...base, width:10, height:10, background:"var(--pink)", boxShadow:"0 0 14px var(--pink),0 0 36px var(--pink-glow)" }} />
      <div ref={ring} style={{ ...base, width:36, height:36, border:"1.5px solid rgba(255,77,166,.55)", boxShadow:"0 0 18px rgba(255,77,166,.2)", transition:"width .3s,height .3s" }} />
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PARTICLE CANVAS
═══════════════════════════════════════════════════════════════ */
const BgCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext("2d");
    let W, H, raf;
    let stars = [], orbs = [];

    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };

    const init = () => {
      stars = Array.from({ length:190 }, () => ({
        x:Math.random()*W, y:Math.random()*H,
        r:Math.random()*1.5+.3,
        ph:Math.random()*Math.PI*2, sp:Math.random()*.02+.007,
        col: Math.random()>.78 ? "255,77,166" : Math.random()>.9 ? "0,229,255" : "255,255,255",
      }));
      orbs = Array.from({ length:6 }, () => ({
        x:Math.random()*W, y:Math.random()*H,
        r:Math.random()*200+80,
        ph:Math.random()*Math.PI*2, sp:Math.random()*.003+.001,
        col: [255,77,166,Math.random()>.5?0:Math.random()>.5?1:2].slice(0,3),
        palIdx: Math.floor(Math.random()*3),
      }));
    };

    const PALS = [[255,77,166],[0,229,255],[157,78,221]];

    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const bg = ctx.createLinearGradient(0,0,W*.7,H);
      bg.addColorStop(0,"#05050f"); bg.addColorStop(.5,"#080814"); bg.addColorStop(1,"#05050f");
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

      // Grid
      ctx.strokeStyle = "rgba(255,77,166,0.022)"; ctx.lineWidth = 1;
      for (let x=0; x<W; x+=90) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y=0; y<H; y+=90) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // Orbs
      orbs.forEach(o => {
        o.ph += o.sp;
        const ox = o.x+Math.sin(o.ph)*70, oy = o.y+Math.cos(o.ph*.6)*45;
        const p = PALS[o.palIdx];
        const g = ctx.createRadialGradient(ox,oy,0,ox,oy,o.r);
        g.addColorStop(0,`rgba(${p.join(",")},0.07)`); g.addColorStop(1,`rgba(${p.join(",")},0)`);
        ctx.beginPath(); ctx.arc(ox,oy,o.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      });

      // Stars
      stars.forEach(s => {
        s.ph += s.sp;
        const o = .18+.72*Math.abs(Math.sin(s.ph));
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(${s.col},${o})`; ctx.fill();
        if (s.r > 1.3 && o > .85) {
          ctx.strokeStyle = `rgba(${s.col},${o*.5})`;
          ctx.lineWidth = .4;
          ctx.beginPath(); ctx.moveTo(s.x-s.r*2.5,s.y); ctx.lineTo(s.x+s.r*2.5,s.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(s.x,s.y-s.r*2.5); ctx.lineTo(s.x,s.y+s.r*2.5); ctx.stroke();
        }
      });

      raf = requestAnimationFrame(draw);
    };

    resize(); init(); draw();
    window.addEventListener("resize", ()=>{ resize(); init(); });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, []);

  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }} />;
};

/* ═══════════════════════════════════════════════════════════════
   SCROLL THREAD
═══════════════════════════════════════════════════════════════ */
const ScrollThread = ({ pct }) => (
  <div style={{ position:"fixed", right:14, top:0, width:3, height:"100vh", zIndex:200, pointerEvents:"none" }}>
    <div style={{ position:"absolute", inset:0, background:"rgba(255,255,255,.03)", borderRadius:2 }} />
    <div style={{ position:"absolute", top:0, left:0, right:0, height:`${pct}%`, background:"linear-gradient(to bottom,#ff4da6,#c77dff,#00e5ff)", boxShadow:"0 0 14px #ff4da6,0 0 30px rgba(255,77,166,.35)", borderRadius:2, transition:"height .09s linear" }} />
    <div style={{ position:"absolute", left:"50%", top:`${Math.min(pct,98)}%`, transform:"translate(-50%,-50%)", width:13, height:13, borderRadius:"50%", background:"#ff4da6", boxShadow:"0 0 18px #ff4da6,0 0 40px rgba(255,77,166,.7)", transition:"top .09s linear" }} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════ */
const Toast = ({ msg, show }) => (
  <div style={{ position:"fixed", bottom:30, left:"50%", zIndex:9000, padding:"12px 30px", borderRadius:100, background:"rgba(255,77,166,.07)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,77,166,.28)", boxShadow:"0 10px 40px rgba(255,77,166,.18)", fontFamily:"'Caveat',cursive", fontSize:19, color:"#ff80c0", whiteSpace:"nowrap", pointerEvents:"none", opacity:show?1:0, transform:show?"translateX(-50%) translateY(0)":"translateX(-50%) translateY(18px)", transition:"opacity .5s ease,transform .5s ease" }}>
    {msg}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════════════════════════ */
const SectionHeader = ({ tag, title, sub, delay=0 }) => (
  <div className="reveal" data-delay={delay} style={{ textAlign:"center", marginBottom:60 }}>
    <p style={{ fontFamily:"'Space Mono',monospace", fontSize:11, letterSpacing:7, color:"rgba(0,229,255,.7)", textTransform:"uppercase", marginBottom:14 }}>{tag}</p>
    <h2 className="neon-gradient" style={{ fontFamily:"'Orbitron',monospace", fontWeight:900, fontSize:"clamp(30px,5.5vw,64px)", display:"block", lineHeight:1.1 }}>{title}</h2>
    {sub && <p style={{ fontFamily:"'Caveat',cursive", fontSize:22, color:"rgba(255,255,255,.38)", marginTop:12 }}>{sub}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════ */
const Hero = ({ onEnter, onSurprise }) => {
  const [roleIdx, setRoleIdx] = useState(0);
  const ROLES = ["Neural Seamstress ✦","AI / ML Engineer 🧠","Sketch Artist 🎨","Habit Architect 📖","Coffee Connoisseur ☕","BBDU's Finest 🏛️"];
  useEffect(() => { const id = setInterval(()=>setRoleIdx(r=>(r+1)%ROLES.length), 2600); return ()=>clearInterval(id); }, []);

  return (
    <section id="hero" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", zIndex:1, padding:"40px 24px", textAlign:"center" }}>

      {/* Orbiting particles */}
      {[0,1,2,3,4,5,6,7].map(i=>(
        <div key={i} style={{ position:"absolute", top:"50%", left:"50%", width:0, height:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", width:i%2===0?8:5, height:i%2===0?8:5, borderRadius:"50%", background:i%3===0?"#ff4da6":i%3===1?"#00e5ff":"#c77dff", "--r":`${100+i*28}px`, animation:`orbit ${9+i*2.5}s linear infinite`, animationDelay:`${i*-1.8}s`, boxShadow:"0 0 12px currentColor", top:"50%", left:"50%", transformOrigin:`${-(100+i*28)}px 0`, opacity:.5+i*.04 }} />
        </div>
      ))}

      {/* Eyebrow */}
      <div style={{ animation:"fadeSlideUp .8s .05s both" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center", marginBottom:28 }}>
          <div style={{ height:1, width:44, background:"linear-gradient(to right,transparent,rgba(255,77,166,.6))" }} />
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, letterSpacing:6, color:"rgba(255,77,166,.7)", textTransform:"uppercase" }}>the neural seamstress</span>
          <div style={{ height:1, width:44, background:"linear-gradient(to left,transparent,rgba(255,77,166,.6))" }} />
        </div>
      </div>

      {/* NAME */}
      <div style={{ position:"relative", animation:"fadeSlideUp .9s .2s both" }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:"italic", fontSize:"clamp(72px,13vw,158px)", lineHeight:.9, letterSpacing:"-3px", position:"relative" }}>
          <span className="neon-gradient">Shaloni</span>
        </h1>
        {/* Mirror reflection */}
        <div style={{ position:"absolute", top:"98%", left:0, right:0, height:"50%", overflow:"hidden", userSelect:"none", pointerEvents:"none" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontStyle:"italic", fontSize:"clamp(72px,13vw,158px)", lineHeight:.9, letterSpacing:"-3px", background:"linear-gradient(to bottom,rgba(255,77,166,.2),transparent)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", transform:"scaleY(-1) translateY(2px)", filter:"blur(4px)" }}>Shaloni</div>
        </div>
      </div>

      {/* Animated role */}
      <div style={{ marginTop:52, height:36, overflow:"hidden", animation:"fadeSlideUp .9s .38s both" }}>
        <p key={roleIdx} style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:300, fontSize:"clamp(16px,3vw,26px)", color:"rgba(255,255,255,.6)", letterSpacing:2, animation:"roleSwap 2.6s ease forwards" }}>
          {ROLES[roleIdx]}
        </p>
      </div>

      {/* Tagline */}
      <div style={{ animation:"fadeSlideUp .9s .54s both", marginTop:24 }}>
        <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"clamp(14px,2vw,20px)", color:"rgba(255,255,255,.32)", maxWidth:520, margin:"0 auto", lineHeight:1.9 }}>
          "She doesn't just code — she stitches dreams into algorithms,<br/>and sketches the future before it exists."
        </p>
      </div>

      {/* Avatar */}
      <div style={{ position:"relative", margin:"52px auto 0", width:230, height:230, animation:"fadeSlideUp 1s .7s both" }}>
        {[1,2,3].map(i=>(
          <div key={i} style={{ position:"absolute", inset:`${-i*16}px`, borderRadius:"50%", border:`1px solid rgba(255,77,166,${.28-i*.07})`, animation:`pulseRing ${2.2+i*.6}s ${i*.5}s ease-out infinite` }} />
        ))}
        <div style={{ position:"absolute", inset:-12, borderRadius:"50%", border:"2px dashed rgba(255,77,166,.45)", animation:"spinCW 14s linear infinite" }}>
          {[0,72,144,216,288].map(deg=>(
            <div key={deg} style={{ position:"absolute", width:9, height:9, borderRadius:"50%", background:"#ff4da6", boxShadow:"0 0 12px #ff4da6,0 0 24px rgba(255,77,166,.5)", top:"50%", left:"50%", transform:`rotate(${deg}deg) translate(${(230/2)+12}px,-50%) translateX(-50%)` }} />
          ))}
        </div>
        <div style={{ position:"absolute", inset:-26, borderRadius:"50%", border:"1px dashed rgba(0,229,255,.2)", animation:"spinCCW 28s linear infinite" }} />
        <div style={{ position:"absolute", inset:-40, borderRadius:"50%", border:"1px solid rgba(157,78,221,.12)", animation:"spinCW 40s linear infinite" }} />
        <div style={{ position:"relative", width:"100%", height:"100%", animation:"drift 5s ease-in-out infinite" }}>
          <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"radial-gradient(circle at 30% 28%,#ffaad6,#d0006e 52%,#200050 80%)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:100, boxShadow:"0 0 90px rgba(255,77,166,.75),0 0 180px rgba(255,77,166,.3),inset 0 0 70px rgba(255,255,255,.07)" }}>
          👩🏻‍💻
          </div>
          <div style={{ position:"absolute", top:"10%", left:"16%", width:"32%", height:"24%", borderRadius:"50%", background:"rgba(255,255,255,.2)", filter:"blur(12px)", transform:"rotate(-28deg)" }} />
        </div>
      </div>

      {/* Tags */}
      <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginTop:40, animation:"fadeSlideUp .9s 1s both" }}>
        {["🎨 Sketch","🧠 AI/ML","☕ Coffee","📖 Atomic Habits","🏛️ BBDU","✨ Youngest"].map((b,i)=>(
          <span key={i} style={{ padding:"7px 18px", borderRadius:100, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.09)", fontFamily:"'Space Mono',monospace", fontSize:11, color:"rgba(255,255,255,.55)", backdropFilter:"blur(10px)", letterSpacing:.5, transition:"all .25s", cursor:"default" }}
            onMouseEnter={e=>{e.target.style.background="rgba(255,77,166,.12)";e.target.style.borderColor="rgba(255,77,166,.35)";e.target.style.color="#ff80c0";}}
            onMouseLeave={e=>{e.target.style.background="rgba(255,255,255,.04)";e.target.style.borderColor="rgba(255,255,255,.09)";e.target.style.color="rgba(255,255,255,.55)";}}>
            {b}
          </span>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", marginTop:48, animation:"fadeSlideUp .9s 1.15s both" }}>
        <button className="btn-primary" onClick={onEnter} style={{ padding:"17px 44px", fontSize:14, letterSpacing:2 }}>ENTER HER WORLD →</button>
        <button className="btn-ghost"   onClick={onSurprise} style={{ padding:"17px 44px", fontSize:14, letterSpacing:2 }}>✦ SURPRISE ME</button>
      </div>

      {/* Scroll indicator */}
      <div style={{ position:"absolute", bottom:30, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:10, animation:"fadeSlideUp 1s 1.5s both" }}>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:5, color:"rgba(255,255,255,.25)", textTransform:"uppercase" }}>scroll</span>
        <svg width="22" height="36" viewBox="0 0 22 36">
          <rect x="1" y="1" width="20" height="34" rx="10" stroke="rgba(255,77,166,.3)" strokeWidth="1.5" fill="none"/>
          <circle cx="11" cy="9" r="3.5" fill="#ff4da6" style={{ animation:"scanDot 1.6s ease-in-out infinite" }}/>
        </svg>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PROFILE CARD — with animated skill bars
═══════════════════════════════════════════════════════════════ */
const ProfileCard = () => {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting){ setVis(true); obs.disconnect(); }},{ threshold:.3 });
    if(ref.current) obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[]);

  const SKILLS = [
    { label:"Machine Learning",     pct:88, color:"#ff4da6" },
    { label:"Sketch / Illustration",pct:95, color:"#c77dff" },
    { label:"Deep Learning",        pct:80, color:"#00e5ff" },
    { label:"Coffee Expertise",     pct:100, color:"#ffc857" },
  ];

  return (
    <div ref={ref} className="glass card-hover" style={{ height:"100%", padding:"32px", minHeight:280, background:"linear-gradient(145deg,rgba(255,77,166,.06),rgba(157,78,221,.04))" }}>
      <div className="shimmer-el" />
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:22, flexWrap:"wrap" }}>
        <div style={{ width:54, height:54, borderRadius:"50%", background:"linear-gradient(135deg,#ff4da6,#9d4edd)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, boxShadow:"0 0 30px rgba(255,77,166,.5), inset 0 0 16px rgba(255,255,255,.1)" }}>🧕</div>
        <div>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:4, color:"var(--pink)", textTransform:"uppercase", marginBottom:3 }}>// System Profile</p>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:24, lineHeight:1.1 }}>Shaloni</h3>
          <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:"rgba(255,255,255,.4)", marginTop:3 }}>Neural Seamstress · BBDU · Lucknow</p>
        </div>
      </div>
      <p style={{ fontFamily:"'Caveat',cursive", fontSize:18, color:"rgba(255,255,255,.58)", lineHeight:1.85, marginBottom:22 }}>
        The youngest. The sharpest. She sketches neural networks before coding them — fuelled entirely by coffee ☕, curiosity, and <em style={{color:"var(--pink-light)"}}>Atomic Habits</em>.
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {SKILLS.map((s,i)=>(
          <div key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"rgba(255,255,255,.45)", letterSpacing:.5 }}>{s.label}</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:s.color }}>{s.pct}%</span>
            </div>
            <div style={{ height:5, background:"rgba(255,255,255,.05)", borderRadius:100, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:100, background:`linear-gradient(90deg,${s.color},${s.color}77)`, boxShadow:`0 0 10px ${s.color}`, width:vis?s.pct+"%":"0%", transition:`width 1.3s ${.1+i*.18}s cubic-bezier(.16,1,.3,1)` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TERMINAL CARD — Staged typewriter
═══════════════════════════════════════════════════════════════ */
const TerminalCard = () => {
  const [shown, setShown] = useState(0);
  const LINES = [
    { p:"$", t:" import { Shaloni } from './universe'",        c:"rgba(255,255,255,.7)" },
    { p:"✓", t:" Module loaded — genius.level = MAXIMUM",      c:"#00e5ff" },
    { p:"$", t:" Shaloni.getSkills()",                          c:"rgba(255,255,255,.7)" },
    { p:"→", t:" ['AI','ML','Sketch','Coffee','Dreams++']",     c:"#ffc857" },
    { p:"$", t:" Shaloni.dailyRitual()",                        c:"rgba(255,255,255,.7)" },
    { p:"→", t:" \"Wake → Coffee → Code → Sketch → Repeat\"", c:"#c77dff" },
    { p:"$", t:" Shaloni.mode",                                 c:"rgba(255,255,255,.7)" },
    { p:"→", t:" UNSTOPPABLE 🔥",                              c:"#ff4da6" },
    { p:"$", t:" Shaloni.level",                                c:"rgba(255,255,255,.7)" },
    { p:"→", t:" \"LEGENDARY ✦ BBDU's Finest\"",               c:"#ffc857" },
  ];
  useEffect(()=>{ if(shown>=LINES.length) return; const id=setTimeout(()=>setShown(s=>s+1), shown===0?600:380); return()=>clearTimeout(id); },[shown]);
  return (
    <div className="glass card-hover" style={{ height:"100%", padding:"26px 30px", background:"rgba(2,2,12,.75)", minHeight:260 }}>
      <div className="shimmer-el" />
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18, paddingBottom:14, borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        {["#ff5f57","#febc2e","#28c840"].map((c,i)=><div key={i} style={{ width:12,height:12,borderRadius:"50%",background:c,boxShadow:`0 0 10px ${c}` }} />)}
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"rgba(255,255,255,.28)", marginLeft:8, letterSpacing:.5 }}>shaloni@neural-seamstress ~ $</span>
      </div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:12, lineHeight:2.15 }}>
        {LINES.slice(0,shown).map((l,i)=>(
          <div key={i} style={{ display:"flex", gap:10, animation:"fadeSlideLeft .3s ease" }}>
            <span style={{ color:"#ff4da6", flexShrink:0 }}>{l.p}</span>
            <span style={{ color:l.c }}>{l.t}</span>
          </div>
        ))}
        {shown<LINES.length && (
          <div style={{ display:"flex", gap:10 }}>
            <span style={{ color:"#ff4da6" }}>$</span>
            <span style={{ display:"inline-block",width:8,height:16,background:"#ff4da6",verticalAlign:"middle",animation:"blink 1s step-end infinite" }} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   COFFEE CARD
═══════════════════════════════════════════════════════════════ */
const CoffeeCard = () => {
  const [cups, setCups] = useState(3);
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{ const obs=new IntersectionObserver(([e])=>{ if(e.isIntersecting){setVis(true);obs.disconnect();}},{threshold:.4}); if(ref.current) obs.observe(ref.current); return()=>obs.disconnect(); },[]);

  return (
    <div ref={ref} className="glass card-hover" style={{ height:"100%", padding:"28px", background:"linear-gradient(145deg,rgba(139,94,60,.14),rgba(255,200,87,.05))", minHeight:210 }}>
      <div className="shimmer-el" />
      <p style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:4, color:"rgba(255,200,87,.65)", textTransform:"uppercase", marginBottom:14 }}>// Fuel Status</p>
      <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:20 }}>
        <div style={{ fontSize:54, animation:"coffeeRise 2.8s ease-in-out infinite", lineHeight:1 }}>☕</div>
        <div>
          <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:30, fontWeight:700, color:"#ffc857", lineHeight:1 }}>Coffee</p>
          <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, color:"rgba(255,200,87,.45)", marginTop:3 }}>Mode: ALWAYS ON</p>
        </div>
      </div>
      <div style={{ marginBottom:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"rgba(255,255,255,.35)" }}>Shaloni Fuel Level</span>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#ffc857" }}>87%</span>
        </div>
        <div style={{ height:6, background:"rgba(255,255,255,.05)", borderRadius:100, overflow:"hidden" }}>
          <div style={{ height:"100%", borderRadius:100, background:"linear-gradient(90deg,#8b5e3c,#ffc857,#ffe082)", boxShadow:"0 0 12px rgba(255,200,87,.55)", "--target":"87%", width:vis?"87%":"0%", transition:"width 1.4s .3s cubic-bezier(.16,1,.3,1)" }} />
        </div>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
        {Array.from({length:5}).map((_,i)=>(
          <span key={i} data-cur onClick={()=>setCups(i+1)} style={{ fontSize:24, cursor:"pointer", opacity:i<cups?1:.22, transition:"all .2s", transform:i<cups?"scale(1.1)":"scale(.85)", display:"block" }}>☕</span>
        ))}
      </div>
      <p style={{ fontFamily:"'Caveat',cursive", fontSize:15, color:"rgba(255,255,255,.3)", textAlign:"center", marginTop:8 }}>Today's cups: {cups}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   WEATHER CARD
═══════════════════════════════════════════════════════════════ */
const WeatherCard = () => {
  const [time,setTime] = useState("");
  useEffect(()=>{
    const upd=()=>setTime(new Date().toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",second:"2-digit"}));
    upd(); const id=setInterval(upd,1000); return()=>clearInterval(id);
  },[]);
  return (
    <div className="glass card-hover" style={{ height:"100%", padding:"28px", background:"linear-gradient(145deg,rgba(0,229,255,.05),rgba(157,78,221,.07))", minHeight:210 }}>
      <div className="shimmer-el" />
      <p style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:3, color:"rgba(0,229,255,.55)", marginBottom:10 }}>◈ LUCKNOW, INDIA · IST</p>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:4 }}>
            <span style={{ fontFamily:"'Orbitron',monospace", fontWeight:900, fontSize:54, lineHeight:1 }}>32</span>
            <span style={{ fontFamily:"'Orbitron',monospace", fontSize:20, color:"rgba(255,255,255,.35)", paddingBottom:7 }}>°C</span>
          </div>
          <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:"rgba(255,255,255,.45)", marginTop:5 }}>Partly Sunny ☀️ Humid</p>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:12, color:"rgba(0,229,255,.6)", marginTop:10 }}>{time}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:52, animation:"drift 4s ease-in-out infinite" }}>🎨</div>
          <p style={{ fontFamily:"'Caveat',cursive", fontSize:14, color:"rgba(255,255,255,.35)", marginTop:8, maxWidth:120, textAlign:"right", lineHeight:1.5 }}>Sketching under the ceiling fan</p>
        </div>
      </div>
      <div style={{ marginTop:14, padding:"10px 14px", borderRadius:12, background:"rgba(0,229,255,.04)", border:"1px solid rgba(0,229,255,.1)" }}>
        <p style={{ fontFamily:"'Caveat',cursive", fontSize:16, color:"rgba(255,255,255,.5)" }}>Chai in hand, neural network on screen ☕</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SKETCHBOOK
═══════════════════════════════════════════════════════════════ */
const SketchbookCard = ({ onPrivate }) => {
  const [hov, setHov] = useState(null);
  const [sel, setSel] = useState(null);
  const ITEMS = [
    { e:"🌸",label:"Florals",   bg:"rgba(255,77,166,.12)",  b:"rgba(255,77,166,.3)"  },
    { e:"🤖",label:"Robots",    bg:"rgba(157,78,221,.12)",  b:"rgba(157,78,221,.3)"  },
    { e:"🧠",label:"Nets",      bg:"rgba(0,229,255,.10)",   b:"rgba(0,229,255,.3)"   },
    { e:"☕",label:"Coffee",    bg:"rgba(255,200,87,.10)",  b:"rgba(255,200,87,.3)"  },
    { e:"✨",label:"Magic",     bg:"rgba(255,77,166,.08)",  b:"rgba(255,77,166,.2)"  },
    { e:"🌙",label:"Night",     bg:"rgba(139,94,60,.16)",   b:"rgba(200,140,100,.3)" },
    { e:"🦋",label:"Creatures", bg:"rgba(157,78,221,.09)",  b:"rgba(157,78,221,.2)"  },
    { e:"🎭",label:"Theatre",   bg:"rgba(0,229,255,.08)",   b:"rgba(0,229,255,.2)"   },
    { e:"🌊",label:"Waves",     bg:"rgba(0,150,255,.08)",   b:"rgba(0,150,255,.2)"   },
  ];
  return (
    <div className="glass card-hover" style={{ height:"100%", padding:"28px", minHeight:240 }}>
      <div className="shimmer-el" />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:4, color:"var(--cyan)", textTransform:"uppercase" }}>// Sketchbook.art</p>
        <span style={{ fontFamily:"'Caveat',cursive", fontSize:14, color:"rgba(255,255,255,.28)" }}>tap any</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
        {ITEMS.map((s,i)=>(
          <div key={i} className="sketch-item" onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} onClick={()=>setSel(sel===i?null:i)}
            style={{ aspectRatio:"1", borderRadius:14, background:s.bg, border:`1px solid ${s.b}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5, cursor:"pointer", transition:"all .38s cubic-bezier(.34,1.56,.64,1)", transform:sel===i?"scale(1.12)":hov===i?"scale(1.07) rotate(4deg)":"scale(1)", boxShadow:sel===i?`0 14px 48px ${s.b}`:"none" }}>
            <span style={{ fontSize:28 }}>{s.e}</span>
            {(hov===i||sel===i) && <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:"rgba(255,255,255,.5)", animation:"fadeSlideUp .2s" }}>{s.label}</span>}
          </div>
        ))}
      </div>
      <button onClick={onPrivate} style={{ width:"100%", marginTop:16, padding:"10px", background:"rgba(255,77,166,.06)", border:"1px dashed rgba(255,77,166,.3)", borderRadius:12, color:"#ff80c0", fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:2, cursor:"pointer", transition:"all .25s" }}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,77,166,.14)"}
        onMouseLeave={e=>e.currentTarget.style.background="rgba(255,77,166,.06)"}>
        🔒 PRIVATE SKETCHES
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STITCH GAME
═══════════════════════════════════════════════════════════════ */
const StitchGame = () => {
  const [sel,setSel] = useState(null);
  const [lines,setLines] = useState([]);
  const [score,setScore] = useState(0);
  const area = useRef(null);

  const NODES = [
    { id:0, label:"✦ Origin",  top:"12%",   left:"6%"   },
    { id:1, label:"🧵 Thread", top:"6%",    left:"38%"  },
    { id:2, label:"💡 Idea",   top:"12%",   right:"6%"  },
    { id:3, label:"🌸 Bloom",  bottom:"14%",left:"12%"  },
    { id:4, label:"🤖 Neural", bottom:"14%",right:"12%"  },
    { id:5, label:"☕ Fuel",   top:"50%",   left:"50%", transform:"translate(-50%,-50%)" },
    { id:6, label:"✨ Dream",  bottom:"4%", left:"38%"  },
  ];

  const getC = id => {
    const el=document.getElementById(`sn${id}`), wrap=area.current;
    if(!el||!wrap) return {x:0,y:0};
    const er=el.getBoundingClientRect(), wr=wrap.getBoundingClientRect();
    return { x:er.left-wr.left+er.width/2, y:er.top-wr.top+er.height/2 };
  };

  const click = id => {
    if(sel===null){ setSel(id); return; }
    if(sel===id){ setSel(null); return; }
    const a=getC(sel), b=getC(id);
    const mid={x:(a.x+b.x)/2, y:(a.y+b.y)/2};
    setLines(prev=>[...prev,{ x1:a.x,y1:a.y,x2:b.x,y2:b.y,mid,id:Date.now() }]);
    setScore(s=>s+1);
    setSel(null);
  };

  return (
    <div className="glass card-hover" style={{ height:"100%", padding:"24px 28px", minHeight:250 }}>
      <div className="shimmer-el" />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <p style={{ fontFamily:"'Orbitron',monospace", fontSize:13, color:"var(--pink)", letterSpacing:1 }}>✦ STITCH THE NODE</p>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"rgba(255,255,255,.35)" }}>{score} stitches ✦</span>
          <button onClick={()=>{setLines([]);setScore(0);setSel(null);}} style={{ padding:"4px 12px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, color:"rgba(255,255,255,.4)", fontSize:10, fontFamily:"'Space Mono',monospace", cursor:"pointer" }}>RESET</button>
        </div>
      </div>
      <p style={{ fontFamily:"'Caveat',cursive", fontSize:15, color:"rgba(255,255,255,.3)", marginBottom:14 }}>Click two nodes to sew them with a glowing thread</p>
      <div ref={area} style={{ position:"relative", height:180 }}>
        <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",overflow:"visible" }}>
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ff4da6"/><stop offset="50%" stopColor="#c77dff"/><stop offset="100%" stopColor="#00e5ff"/></linearGradient>
            <filter id="lg"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          {lines.map(l=>(
            <g key={l.id} filter="url(#lg)">
              <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="url(#sg)" strokeWidth="2.5" strokeDasharray="6,4" opacity=".9" style={{animation:"ribbonFlow .5s ease"}}/>
              <text x={l.mid.x-6} y={l.mid.y+5} fontSize="13" fill="#ff4da6" style={{animation:"starPop .4s ease"}}>✦</text>
            </g>
          ))}
        </svg>
        {NODES.map(n=>(
          <div key={n.id} id={`sn${n.id}`} onClick={()=>click(n.id)} className="node-pill"
            style={{ top:n.top,left:n.left,right:n.right,bottom:n.bottom,transform:n.transform||"",
              background:sel===n.id?"linear-gradient(135deg,#ff4da6,#c77dff)":"rgba(255,77,166,.1)",
              border:`1.5px solid ${sel===n.id?"transparent":"rgba(255,77,166,.35)"}`,
              color:sel===n.id?"#fff":"rgba(255,255,255,.65)",
              boxShadow:sel===n.id?"0 0 28px rgba(255,77,166,.7),0 0 60px rgba(255,77,166,.3)":"none"
            }}>
            {n.label}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BENTO SECTION
═══════════════════════════════════════════════════════════════ */
const BentoSection = ({ onPrivate }) => {
  useReveal();
  return (
    <section id="bento" style={{ padding:"110px 24px 70px", maxWidth:1260, margin:"0 auto", position:"relative", zIndex:1 }}>
      <SectionHeader tag="// Command Center" title="SHALONI.exe" sub="A bento grid of her multidimensional self" />

      <div className="bento-grid" style={{ display:"grid", gridTemplateColumns:"repeat(12,1fr)", gap:16 }}>
        <div className="span-7 reveal" style={{ gridColumn:"span 7" }}                            data-delay=".1"><ProfileCard /></div>
        <div className="span-5 reveal" style={{ gridColumn:"span 5", gridRow:"span 2" }}          data-delay=".15"><TerminalCard /></div>
        <div className="reveal"        style={{ gridColumn:"span 3" }}                            data-delay=".2"><CoffeeCard /></div>
        <div className="reveal"        style={{ gridColumn:"span 4" }}                            data-delay=".25"><WeatherCard /></div>
        <div className="span-8 reveal" style={{ gridColumn:"span 8" }}                            data-delay=".3"><StitchGame /></div>
        <div className="reveal"        style={{ gridColumn:"span 4" }}                            data-delay=".35"><SketchbookCard onPrivate={onPrivate} /></div>
        <div className="span-12 reveal" style={{ gridColumn:"span 12" }}                          data-delay=".4">
          <div className="glass" style={{ padding:"50px 44px", textAlign:"center", background:"linear-gradient(135deg,rgba(157,78,221,.08),rgba(255,77,166,.055))", position:"relative", overflow:"hidden" }}>
            <div className="shimmer-el" />
            <div style={{ position:"absolute", top:16, left:28, fontFamily:"'Playfair Display',serif", fontSize:100, color:"rgba(255,77,166,.1)", lineHeight:1, userSelect:"none", pointerEvents:"none" }}>"</div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"clamp(19px,2.8vw,28px)", color:"rgba(255,255,255,.85)", maxWidth:800, margin:"0 auto", lineHeight:1.8, position:"relative", zIndex:1 }}>
              Every action you take is a vote for the type of person you wish to become.
            </p>
            <div style={{ width:70, height:1.5, background:"linear-gradient(to right,transparent,#ff4da6,transparent)", margin:"26px auto 18px" }} />
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--pink)", letterSpacing:4 }}>— ATOMIC HABITS // JAMES CLEAR</p>
            <p style={{ fontFamily:"'Caveat',cursive", fontSize:21, color:"rgba(255,255,255,.33)", marginTop:12 }}>Shaloni votes for greatness — every single day ✦</p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NEURAL NETWORK
═══════════════════════════════════════════════════════════════ */
const NeuralSection = () => {
  useReveal();
  const wrapRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [active, setActive] = useState(null);
  const [msg, setMsg] = useState(null);

  const NODES = [
    { key:"sketch",  label:"🎨 Sketching",  style:{ top:"10%",   left:"9%"  }, color:"#ff4da6", bg:"rgba(255,77,166,.15)"   },
    { key:"ai",      label:"🧠 AI / ML",    style:{ top:"10%",   right:"11%"}, color:"#00e5ff", bg:"rgba(0,229,255,.12)"    },
    { key:"habit",   label:"📖 Habits",     style:{ bottom:"16%",left:"5%"  }, color:"#9d4edd", bg:"rgba(157,78,221,.15)"   },
    { key:"coffee",  label:"☕ Coffee",     style:{ bottom:"10%",left:"50%", transform:"translateX(-50%)" }, color:"#ffc857", bg:"rgba(255,200,87,.12)" },
    { key:"bbdu",    label:"🏛️ BBDU",       style:{ bottom:"16%",right:"5%" }, color:"#ffc857", bg:"rgba(255,200,87,.12)"   },
    { key:"art",     label:"✏️ Art",        style:{ top:"50%",   left:"2%",  transform:"translateY(-50%)" }, color:"#ffb6c1", bg:"rgba(255,150,180,.12)" },
    { key:"future",  label:"🚀 Future",     style:{ top:"50%",   right:"2%", transform:"translateY(-50%)" }, color:"#00e5ff", bg:"rgba(0,229,255,.10)"  },
  ];

  const MSGS = {
    sketch:  { col:"#ff4da6", t:"Sketching → Algorithm", b:"Shaloni literally draws neural networks by hand before she codes them. Her sketchbook IS her pseudocode. Every brushstroke is a function call waiting to happen." },
    ai:      { col:"#00e5ff", t:"AI / ML → Canvas", b:"Every model she trains is a brushstroke on tomorrow's canvas. She doesn't just understand machine learning — she feels its rhythm intuitively, like music." },
    habit:   { col:"#9d4edd", t:"Habits → Compound Magic", b:"1% better every day. In 365 days that's 37× the person she was. Shaloni isn't grinding — she's compounding. The math is on her side." },
    coffee:  { col:"#ffc857", t:"Coffee → Sacred Ritual", b:"Three sips = one breakthrough. Shaloni's coffee isn't caffeine — it's a creative signal. The ritual tells her brain: it's time to make something extraordinary." },
    bbdu:    { col:"#ffc857", t:"BBDU → Launchpad", b:"Her university is the ignition. The entire internet is her real campus — every paper, every repo, every dataset. She doesn't wait for the curriculum to catch up to her." },
    art:     { col:"#ffb6c1", t:"Art → Unfair Advantage", b:"She sees patterns in paintings that others find only in tensors. That cross-domain intuition is her secret weapon — the reason her models feel human." },
    future:  { col:"#00e5ff", t:"Future → Happening Now", b:"The future Shaloni is building today will make her 2024 self completely jaw-drop. She isn't planning a career. She's architecting an entire era." },
  };

  const drawLines = useCallback(() => {
    const wrap = wrapRef.current;
    if(!wrap) return;
    const c = wrap.querySelector(".nc");
    if(!c) return;
    const wr=wrap.getBoundingClientRect(), cr=c.getBoundingClientRect();
    const cx=cr.left-wr.left+cr.width/2, cy=cr.top-wr.top+cr.height/2;
    setLines(NODES.map(n => {
      const el=wrap.querySelector(`[data-nk="${n.key}"]`); if(!el) return null;
      const er=el.getBoundingClientRect();
      return { key:n.key, color:n.color, x1:cx, y1:cy, x2:er.left-wr.left+er.width/2, y2:er.top-wr.top+er.height/2 };
    }).filter(Boolean));
  }, []);

  useEffect(() => { const t=setTimeout(drawLines,600); window.addEventListener("resize",drawLines); return()=>{ clearTimeout(t); window.removeEventListener("resize",drawLines); }; },[drawLines]);

  return (
    <section id="neural" style={{ padding:"110px 24px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:980, margin:"0 auto" }}>
        <SectionHeader tag="// The Neural Network of" title="SHALONI" sub="Click any node — discover the constellation" />
        <div className="glass reveal neural-box" ref={wrapRef} style={{ position:"relative", height:450, padding:20 }} data-delay=".15">
          <div className="shimmer-el" />
          <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",overflow:"visible" }}>
            <defs><filter id="ng"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
            {lines.map(l=>(
              <g key={l.key} filter="url(#ng)">
                <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth={active===l.key?2.5:1.5} strokeDasharray="5,6" opacity={active===l.key?1:.26} style={{transition:"opacity .4s,stroke-width .4s",animation:"ribbonFlow 1.2s ease forwards"}}/>
                {active===l.key && <circle cx={(l.x1+l.x2)/2} cy={(l.y1+l.y2)/2} r="4.5" fill={l.color} opacity=".85" style={{animation:"pulseRing 1.2s ease-out infinite"}}/>}
              </g>
            ))}
          </svg>
          <div className="nc" style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",padding:"14px 26px",background:"linear-gradient(135deg,#ff4da6,#9d4edd)",borderRadius:50,fontFamily:"'Orbitron',monospace",fontWeight:700,fontSize:17,boxShadow:"0 0 60px rgba(255,77,166,.65),0 0 130px rgba(255,77,166,.25)",zIndex:5,animation:"heartbeat 2.8s ease-in-out infinite",whiteSpace:"nowrap" }}>⬡ SHALONI</div>
          {NODES.map(n=>(
            <div key={n.key} data-nk={n.key} onClick={()=>{ setActive(n.key); setMsg(MSGS[n.key]); }} className="node-pill"
              style={{ ...n.style, background:active===n.key?n.color:n.bg, border:`1.5px solid ${n.color}${active===n.key?"":"55"}`, color:active===n.key?"#fff":n.color, boxShadow:active===n.key?`0 0 32px ${n.color}99,0 0 70px ${n.color}44`:"none", transition:"all .38s cubic-bezier(.34,1.56,.64,1)" }}>
              {n.label}
            </div>
          ))}
        </div>
        <div className="glass reveal" data-delay=".25" style={{ padding:"26px 34px",marginTop:16,minHeight:92,transition:"all .5s",background:msg?`linear-gradient(135deg,${msg.col}0d,transparent)`:"rgba(255,255,255,.02)",borderColor:msg?`${msg.col}35`:"var(--glass-border)" }}>
          {msg ? (
            <div style={{ animation:"fadeSlideLeft .4s ease" }}>
              <p style={{ fontFamily:"'Orbitron',monospace",fontSize:13,color:msg.col,marginBottom:8,letterSpacing:1 }}>→ {msg.t}</p>
              <p style={{ fontFamily:"'Caveat',cursive",fontSize:22,color:"rgba(255,255,255,.8)",lineHeight:1.65 }}>{msg.b}</p>
            </div>
          ) : (
            <p style={{ fontFamily:"'Caveat',cursive",fontSize:21,color:"rgba(255,255,255,.28)",textAlign:"center",lineHeight:1.6,paddingTop:8 }}>✦ Click any node to reveal how Shaloni's talents form one interconnected constellation</p>
          )}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HABITS
═══════════════════════════════════════════════════════════════ */
const HabitsSection = () => {
  useReveal();
  const [hov,setHov] = useState(null);
  const H = [
    { n:"01",icon:"👁️",color:"#ff4da6",title:"MAKE IT OBVIOUS",    desc:"Shaloni keeps her sketchbook right next to her coffee mug — a visual cue that creativity and code are always one sip away.",            id:"\"I am an artist who notices beauty in everything — in data, in life, in code.\"" },
    { n:"02",icon:"✨",color:"#c77dff",title:"MAKE IT ATTRACTIVE",  desc:"She pairs her toughest ML problems with her favourite brew — dopamine meets discipline in the most aesthetically perfect combination.", id:"\"I am someone who genuinely finds joy in the hardest problems.\"" },
    { n:"03",icon:"🌊",color:"#00e5ff",title:"MAKE IT EASY",        desc:"One neural network sketch every day. One page of Atomic Habits every morning. Small, ridiculous, compound — and completely unstoppable.", id:"\"I am a person who shows up — especially on the hardest days.\"" },
    { n:"04",icon:"🎉",color:"#ffc857",title:"MAKE IT SATISFYING",  desc:"Every commit, every finished sketch, every perfect cup savoured — Shaloni celebrates every micro-win like it's an Olympic world record.", id:"\"I am the youngest — and also the most unstoppable person in the room.\"" },
  ];
  return (
    <section id="habits" style={{ padding:"110px 24px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:940, margin:"0 auto" }}>
        <SectionHeader tag="// Atomic Habits" title="SHALONI'S SYSTEM" sub="The 4 laws that power her extraordinary life" />
        {H.map((h,i)=>(
          <div key={i} className="glass reveal" data-delay={`.${i*12+1}`}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
            style={{ display:"flex",gap:24,alignItems:"flex-start",padding:"30px 34px",marginBottom:14,
              transition:"all .45s cubic-bezier(.16,1,.3,1)",
              transform:hov===i?"translateX(16px) scale(1.015)":"translateX(0)",
              boxShadow:hov===i?`0 24px 70px ${h.color}22,0 0 0 1px ${h.color}28`:"none",
              background:hov===i?`linear-gradient(135deg,${h.color}09,transparent)`:"rgba(255,255,255,.025)" }}>
            <div style={{ width:54,height:54,minWidth:54,borderRadius:16,background:`linear-gradient(135deg,${h.color},${h.color}80)`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1,boxShadow:`0 0 24px ${h.color}55,inset 0 0 12px rgba(255,255,255,.08)` }}>
              <span style={{ fontFamily:"'Orbitron',monospace",fontSize:11,opacity:.7 }}>{h.n}</span>
              <span style={{ fontSize:22 }}>{h.icon}</span>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontFamily:"'Orbitron',monospace",fontSize:14,color:"#fff",marginBottom:10,letterSpacing:1 }}>{h.title}</p>
              <p style={{ fontFamily:"'Caveat',cursive",fontSize:20,color:"rgba(255,255,255,.58)",lineHeight:1.75,marginBottom:12 }}>{h.desc}</p>
              <span style={{ display:"inline-block",padding:"6px 18px",borderRadius:100,background:`${h.color}15`,border:`1px solid ${h.color}38`,color:h.color,fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontStyle:"italic" }}>{h.id}</span>
            </div>
            <div style={{ width:8,height:8,borderRadius:"50%",background:h.color,boxShadow:`0 0 14px ${h.color}`,flexShrink:0,marginTop:22 }} />
          </div>
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BROTHER MODAL
═══════════════════════════════════════════════════════════════ */
const BrotherModal = ({ open, onClose, onSuccess }) => {
  const [val,setVal] = useState("");
  const [msg,setMsg] = useState("");
  const [ok,setOk]   = useState(false);
  const [err,setErr] = useState(false);
  const ANS = ["atomic","systems","identity","habits","james clear","1%"];

  const check = () => {
    if(ANS.includes(val.trim().toLowerCase())){
      setMsg("✓ ACCESS GRANTED — Welcome home, Shaloni! 🌸");
      setOk(true); setErr(false);
      setTimeout(()=>{ onClose(); onSuccess(); setOk(false); setVal(""); setMsg(""); },1600);
    } else if(val.length>=2){
      setMsg("✗ \"Nice try! Wrong word.\" 😎");
      setOk(false); setErr(true);
      setTimeout(()=>setErr(false),700);
    }
  };

  if(!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:"rgba(0,0,0,.92)",backdropFilter:"blur(18px)" }}>
      <div className="glass" onClick={e=>e.stopPropagation()} style={{ maxWidth:500,width:"100%",padding:"50px 46px",textAlign:"center",position:"relative",border:"1px solid rgba(255,77,166,.22)",boxShadow:"0 40px 130px rgba(255,77,166,.22)",animation:"glassReveal .5s ease",transform:err?"translateX(6px)":"translateX(0)",transition:"transform .1s" }}>
        <button onClick={onClose} style={{ position:"absolute",top:18,right:22,background:"none",border:"none",color:"rgba(255,255,255,.28)",fontSize:24,cursor:"pointer" }}>✕</button>
        <div style={{ fontSize:90,lineHeight:1,marginBottom:22,animation:"drift 3s ease-in-out infinite" }}>🕵️‍♂️</div>
        <div style={{ display:"inline-block",padding:"5px 18px",borderRadius:100,background:"rgba(255,77,166,.1)",border:"1px solid rgba(255,77,166,.28)",fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:3,color:"var(--pink)",marginBottom:18 }}>ACCESS DENIED</div>
        <h3 style={{ fontFamily:"'Orbitron',monospace",fontSize:21,color:"#fff",marginBottom:14 }}>Best Friend's Gate 🔐</h3>
        <p style={{ fontFamily:"'Caveat',cursive",fontSize:20,color:"rgba(255,255,255,.52)",lineHeight:1.75,marginBottom:26 }}>
          Only the real Shaloni knows the secret word from <em style={{color:"var(--pink)"}}>Atomic Habits</em>.<br/>
          <span style={{ fontSize:16,color:"rgba(255,255,255,.32)" }}>Hint: the foundation of identity-based change...</span>
        </p>
        <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Enter the secret word..."
          style={{ width:"100%",padding:"16px 22px",background:"rgba(255,255,255,.04)",border:`1.5px solid ${err?"rgba(255,80,80,.7)":"rgba(255,77,166,.3)"}`,borderRadius:16,color:"#fff",fontFamily:"'Space Mono',monospace",fontSize:14,textAlign:"center",letterSpacing:4,outline:"none",transition:"border-color .3s",boxShadow:ok?"0 0 0 2px rgba(0,229,255,.5)":"none" }}
          onFocus={e=>e.target.style.borderColor="rgba(255,77,166,.7)"}
          onBlur={e=>e.target.style.borderColor="rgba(255,77,166,.3)"} />
        <button onClick={check} className="btn-primary" style={{ width:"100%",marginTop:16,padding:"17px",fontSize:15,letterSpacing:2 }}>UNLOCK 🔓</button>
        <p style={{ fontFamily:"'Caveat',cursive",fontSize:20,marginTop:16,minHeight:28,color:ok?"#00e5ff":"#ff6b6b",transition:"color .3s" }}>{msg}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FINAL SECTION
═══════════════════════════════════════════════════════════════ */
const FinalSection = ({ onConfetti }) => {
  useReveal();
  const W1 = ["You","Aren't","Just","A","Coder."];
  const W2 = ["You're","An","Artist","Who","Codes."];
  return (
    <section id="final" style={{ padding:"130px 24px 110px",textAlign:"center",position:"relative",zIndex:1 }}>
      <div style={{ maxWidth:860,margin:"0 auto" }}>
        <p className="reveal" style={{ fontFamily:"'Space Mono',monospace",fontSize:11,letterSpacing:7,color:"rgba(0,229,255,.65)",textTransform:"uppercase",marginBottom:30 }}>// A message, just for Shaloni</p>
        <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif",fontWeight:900,fontStyle:"italic",fontSize:"clamp(38px,7.5vw,96px)",lineHeight:1.08 }} data-delay=".1">
          {W1.map((w,i)=><span key={i} className="neon-gradient" style={{ display:"inline-block",marginRight:".22em",animation:`waveText ${2+i*.2}s ${i*.18}s ease-in-out infinite` }}>{w}</span>)}
          <br/>
          {W2.map((w,i)=><span key={i} style={{ display:"inline-block",marginRight:".22em",color:"rgba(255,255,255,.82)",animation:`waveText ${2+i*.2}s ${(.5+i*.18)}s ease-in-out infinite` }}>{w}</span>)}
        </h2>
        <div className="glass reveal" data-delay=".28" style={{ marginTop:52,padding:"34px 44px",background:"linear-gradient(135deg,rgba(255,77,166,.06),rgba(0,229,255,.04))" }}>
          <p style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"clamp(18px,2.8vw,26px)",color:"rgba(255,255,255,.68)",lineHeight:1.88 }}>
            Shaloni — your sketches dream in code,<br/>your coffee tastes like ambition,<br/>and your code? It sketches <span style={{color:"var(--pink)"}}>the future itself.</span><br/>
            <span style={{ fontSize:".8em",color:"rgba(255,255,255,.4)" }}>All your talents are connected. You aren't just a coder — you're an artist who codes. ✦</span>
          </p>
        </div>
        <div className="reveal" data-delay=".42" style={{ display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginTop:52 }}>
          <button onClick={onConfetti} className="btn-primary" style={{ padding:"20px 60px",fontSize:16,letterSpacing:3,boxShadow:"0 0 50px rgba(255,77,166,.45)" }}>✦ CELEBRATE SHALONI ✦</button>
        </div>
        <div className="reveal" data-delay=".55" style={{ display:"flex",justifyContent:"center",gap:22,marginTop:64 }}>
          {["✦","✧","★","✧","✦","✧","★"].map((s,i)=>(
            <span key={i} style={{ fontSize:i%2===0?22:16,color:i%3===0?"rgba(255,77,166,.45)":i%3===1?"rgba(0,229,255,.35)":"rgba(157,78,221,.4)",animation:`waveText ${1.8+i*.25}s ${i*.22}s ease-in-out infinite` }}>{s}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════ */
const Footer = () => (
  <footer style={{ padding:"52px 24px",textAlign:"center",position:"relative",zIndex:1,borderTop:"1px solid rgba(255,255,255,.04)" }}>
    <div style={{ maxWidth:640,margin:"0 auto" }}>
      <div style={{ display:"flex",justifyContent:"center",gap:18,marginBottom:22,flexWrap:"wrap" }}>
        {["🎨","☕","🧠","✨","💜","🌸","🚀"].map((e,i)=>(
          <span key={i} style={{ fontSize:24,animation:`waveText ${1.6+i*.3}s ${i*.2}s ease-in-out infinite` }}>{e}</span>
        ))}
      </div>
      <p style={{ fontFamily:"'Caveat',cursive",fontSize:21,color:"rgba(255,255,255,.26)",lineHeight:2 }}>
        Made with <span style={{color:"#ff4da6"}}>♥</span> & <span style={{color:"#c8956a"}}>☕</span> for <span style={{color:"#ff4da6",fontWeight:700}}>Shaloni</span><br/>
        Neural Seamstress · BBDU's Finest · Lucknow's Legend
      </p>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,.14)",letterSpacing:2,marginTop:18 }}>
        // every border is a stitch · every pixel is a dream ✦
      </p>
    </div>
  </footer>
);

/* ═══════════════════════════════════════════════════════════════
   CONFETTI ENGINE
═══════════════════════════════════════════════════════════════ */
const useConfetti = () => useCallback(() => {
  const COLS = ["#ff4da6","#00e5ff","#9d4edd","#ffc857","#ff80c0","#c77dff","#ffffff","#ff9de2"];
  for (let i = 0; i < 130; i++) {
    const el = document.createElement("div");
    const c = COLS[Math.floor(Math.random()*COLS.length)];
    const sz = Math.random()*13+5;
    const isCirc = Math.random()>.42;
    Object.assign(el.style,{ position:"fixed",pointerEvents:"none",zIndex:99998,width:sz+"px",height:isCirc?sz+"px":(sz*.55)+"px",background:c,borderRadius:isCirc?"50%":"3px",left:(10+Math.random()*80)+"%",top:"42%" });
    document.body.appendChild(el);
    const vx=(Math.random()-.5)*20, vy=-(Math.random()*26+12);
    let x=0,y=0,g=.65,o=1,rot=Math.random()*360;
    const tick=()=>{ x+=vx*.45; y+=vy+g; g+=.4; o-=.014; rot+=6; el.style.transform=`translate(${x}px,${y}px)rotate(${rot}deg)`; el.style.opacity=o; if(o>0)requestAnimationFrame(tick); else el.remove(); };
    setTimeout(()=>requestAnimationFrame(tick), Math.random()*700);
  }
}, []);

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function ShaloniApp() {
  const [pct, setPct]         = useState(0);
  const [toast, setToast]     = useState("");
  const [showToast,setShow]   = useState(false);
  const [modal, setModal]     = useState(false);
  const lastStep = useRef(-1);
  const tIdx     = useRef(0);
  const launch   = useConfetti();

  const TOASTS = useMemo(()=>[
    "✦ Identity shift: 1% better today, Shaloni",
    "☕ Coffee checkpoint — you've absolutely earned this",
    "🎨 Creativity node is fully activated",
    "🧠 Neural pathway: unlocked",
    "✨ Shaloni.level has increased",
    "🚀 The future is getting closer with every scroll",
    "💜 You're doing incredible, Shaloni",
  ],[]);

  useEffect(()=>{
    const onScroll=()=>{
      const p=Math.min((window.scrollY/(document.body.scrollHeight-window.innerHeight))*100,100)||0;
      setPct(p);
      const step=Math.floor(p/17);
      if(step>lastStep.current&&p>5){ lastStep.current=step; setToast(TOASTS[tIdx.current%TOASTS.length]); tIdx.current++; setShow(true); setTimeout(()=>setShow(false),2900); }
    };
    window.addEventListener("scroll",onScroll,{passive:true});
    return()=>window.removeEventListener("scroll",onScroll);
  },[TOASTS]);

  const handleSurprise = () => { launch(); setTimeout(()=>document.getElementById("final")?.scrollIntoView({behavior:"smooth"}),220); };

  return (
    <>
      <InjectStyles />
      <Cursor />
      <BgCanvas />
      <ScrollThread pct={pct} />
      <Toast msg={toast} show={showToast} />
      <main style={{ position:"relative", zIndex:1 }}>
        <Hero onEnter={()=>document.getElementById("bento")?.scrollIntoView({behavior:"smooth"})} onSurprise={handleSurprise} />
        <BentoSection onPrivate={()=>setModal(true)} />
        <NeuralSection />
        <HabitsSection />
        <FinalSection onConfetti={launch} />
        <Footer />
      </main>
      <BrotherModal open={modal} onClose={()=>setModal(false)} onSuccess={launch} />
    </>
  );
}