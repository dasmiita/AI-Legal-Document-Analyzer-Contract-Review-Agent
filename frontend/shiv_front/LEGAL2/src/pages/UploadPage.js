import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeDocument } from '../api';

/* ─────────────────────────────────────  DATA  ── */
const LEGAL_FRAGMENTS = [
  'WHEREAS','INDEMNIFICATION','ARBITRATION','NON-DISCLOSURE',
  'FORCE MAJEURE','GOVERNING LAW','CONSIDERATION','COVENANT',
  'JURISDICTION','SEVERABILITY','CONFIDENTIAL','TERMINATION',
  'AMENDMENT','MATERIAL BREACH','WAIVER','ASSIGNABILITY',
  'IN WITNESS WHEREOF','HEREINAFTER','PURSUANT TO','NOTWITHSTANDING',
  'INTELLECTUAL PROPERTY','REPRESENTATIONS','WARRANTIES','LIABILITIES',
  'ART. IV §2(b)','CLAUSE 7.3','EXHIBIT A','SCHEDULE 1',
  'SECTION 12.4','ADDENDUM B','§ 9(a)(iii)',
  'mutatis mutandis','bona fide','pro rata','inter alia',
  'res judicata','prima facie','mens rea','caveat emptor',
];
const META_LEFT = [
  'DOC TYPE ........ NDA','RISK INDEX ...... —','CLAUSES ......... —',
  'PARTIES ......... —','JURISDICTION .... INDIA','EFFECTIVE ....... —',
  'DURATION ........ —','RENEWAL ......... —','PENALTIES ....... —',
  'ARBITRATION ..... —','GOVERNING LAW ... —','LAST SCAN ....... —',
  'HASH ............ —','ENCODING ........ UTF-8','FORMAT .......... PDF',
  'COMPLIANCE ...... PENDING','REVIEWED ........ NO',
];
const META_RIGHT = [
  'AI MODEL ........ v4.1','CONFIDENCE ...... —','TOKENS .......... —',
  'LATENCY ......... —ms','RED FLAGS ....... —','AMBER FLAGS ..... —',
  'GREEN FLAGS ..... —','ENTITIES ........ —','DATES FOUND ..... —',
  'SIGNATURES ...... —','EXHIBITS ........ —','SCHEDULES ....... —',
  'RIDERS .......... —','STATUS .......... IDLE','QUEUE ........... 0',
  'SESSION ......... NEW','API READY ....... YES',
];
const FEATURES = [
  { label:'Risk Detection', desc:'Identify high-risk clauses instantly',
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { label:'Clause Breakdown', desc:'Full entity and context extraction',
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  { label:'AI Chat', desc:'Ask questions about your document',
    icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

/* ═══════════════════════════════════════════════════════════
   INDIAN SUPREME COURT SVG ILLUSTRATION
   Based on actual building: white dome on terracotta drum,
   4 corner chattris, sandstone-red bands, central portico,
   wide wings, fountain garden, steps
═══════════════════════════════════════════════════════════ */
function CourthouseBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', overflow:'hidden' }}>
      <style>{`
        @keyframes domeBreath { 0%,100%{opacity:.22} 50%{opacity:.34} }
        @keyframes cloudDrift { from{transform:translateX(-40px)} to{transform:translateX(40px)} }
        @keyframes cloudDrift2 { from{transform:translateX(20px)} to{transform:translateX(-30px)} }
        @keyframes fountainRipple { 0%,100%{rx:18;opacity:.5} 50%{rx:26;opacity:.2} }
        @keyframes flagWave {
          0%,100%{d:path("M540 38 L562 41 L560 50 L540 47 Z")}
          50%{d:path("M540 38 L564 44 L561 53 L540 47 Z")}
        }
        @keyframes starPulse { 0%,100%{opacity:.7} 50%{opacity:1} }
        .dome-breath { animation: domeBreath 5s ease-in-out infinite; }
        .cloud1 { animation: cloudDrift 22s ease-in-out infinite alternate; }
        .cloud2 { animation: cloudDrift2 18s ease-in-out infinite alternate; }
        .cloud3 { animation: cloudDrift 28s ease-in-out infinite alternate; }
        .star-pulse { animation: starPulse 3s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 1080 660"
        xmlns="http://www.w3.org/2000/svg"
        width="100%" height="100%"
        preserveAspectRatio="xMidYMax slice"
        style={{ position:'absolute', inset:0, top:'25%' }}
      >
        <defs>
          {/* Sky: deep navy at top, lightening slightly toward horizon */}
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#04080f"/>
            <stop offset="55%"  stopColor="#080e1c"/>
            <stop offset="100%" stopColor="#0c1428"/>
          </linearGradient>

          {/* Main building body: light sandstone tinted dark */}
          <linearGradient id="mainBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#1e2740"/>
            <stop offset="100%" stopColor="#111928"/>
          </linearGradient>

          {/* Terracotta/copper drum — the signature dark-red band */}
          <linearGradient id="terracotta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#5c2e18"/>
            <stop offset="50%"  stopColor="#7a3a1e"/>
            <stop offset="100%" stopColor="#4a2412"/>
          </linearGradient>

          {/* White dome */}
          <linearGradient id="whiteDome" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%"  stopColor="#d8dde8"/>
            <stop offset="60%" stopColor="#a0aabf"/>
            <stop offset="100%" stopColor="#6e7a94"/>
          </linearGradient>

          {/* Sandstone red horizontal bands */}
          <linearGradient id="sandstone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#6b3420"/>
            <stop offset="100%" stopColor="#4e2515"/>
          </linearGradient>

          {/* Garden green */}
          <linearGradient id="gardenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#1a3520"/>
            <stop offset="100%" stopColor="#0d1f12"/>
          </linearGradient>

          {/* Gold line */}
          <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#c9a84c" stopOpacity="0"/>
            <stop offset="30%"  stopColor="#c9a84c" stopOpacity="0.7"/>
            <stop offset="70%"  stopColor="#c9a84c" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
          </linearGradient>

          {/* Dome ambient glow */}
          <radialGradient id="domeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#c9a84c" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
          </radialGradient>

          {/* Fountain glow */}
          <radialGradient id="fountainGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#c9a84c" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
          </radialGradient>

          {/* Vignette */}
          <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
            <stop offset="0%"   stopColor="#04080f" stopOpacity="0"/>
            <stop offset="100%" stopColor="#04080f" stopOpacity="0.65"/>
          </radialGradient>
          <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#04080f" stopOpacity="0.5"/>
            <stop offset="30%" stopColor="#04080f" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="btmFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="65%" stopColor="#04080f" stopOpacity="0"/>
            <stop offset="100%" stopColor="#04080f" stopOpacity="0.95"/>
          </linearGradient>

          <filter id="glow4">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="clip"><rect width="1080" height="660"/></clipPath>
        </defs>

        {/* ── SKY ── */}
        <rect width="1080" height="660" fill="url(#sky)"/>

        {/* Stars */}
        <g clipPath="url(#clip)" opacity="0.55">
          {[[60,30],[130,55],[200,22],[280,48],[370,18],[440,52],[530,28],
            [620,42],[710,15],[790,38],[870,25],[960,50],[1020,32],[1055,60],
            [100,90],[250,80],[410,95],[570,78],[730,88],[900,72],[1040,85],
            [45,120],[190,115],[360,108],[510,122],[680,105],[850,118],[1010,100],
          ].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y}
              r={i%4===0?1.3:0.75}
              fill="#c9a84c"
              opacity={0.25+((i*37)%100)/200}
              className={i%5===0?'star-pulse':''}
            />
          ))}
        </g>

        {/* Drifting clouds */}
        <g opacity="0.07" className="cloud1">
          <ellipse cx="180" cy="70" rx="130" ry="20" fill="#c9a84c"/>
          <ellipse cx="180" cy="62" rx="80"  ry="14" fill="#c9a84c"/>
        </g>
        <g opacity="0.05" className="cloud2">
          <ellipse cx="760" cy="55" rx="110" ry="18" fill="#c9a84c"/>
          <ellipse cx="830" cy="48" rx="70"  ry="12" fill="#c9a84c"/>
        </g>
        <g opacity="0.06" className="cloud3">
          <ellipse cx="520" cy="85" rx="150" ry="16" fill="#c9a84c"/>
        </g>

        {/* ════════════════════════════════
            GARDEN / FOREGROUND BASE
        ════════════════════════════════ */}
        {/* Main lawn */}
        <rect x="0" y="500" width="1080" height="160" fill="url(#gardenGrad)" opacity="0.9"/>
        {/* Lawn highlight band */}
        <rect x="0" y="498" width="1080" height="3" fill="#c9a84c" opacity="0.12"/>

        {/* Hedge rows */}
        <rect x="60"  y="516" width="400" height="18" rx="9"  fill="#162a1a" opacity="0.9"/>
        <rect x="620" y="516" width="400" height="18" rx="9"  fill="#162a1a" opacity="0.9"/>
        <rect x="100" y="506" width="330" height="12" rx="6"  fill="#1e3822" opacity="0.8"/>
        <rect x="650" y="506" width="330" height="12" rx="6"  fill="#1e3822" opacity="0.8"/>

        {/* Fountain area — central */}
        <ellipse cx="540" cy="530" rx="80" ry="22" fill="#0a1f28" opacity="0.85"/>
        <ellipse cx="540" cy="530" rx="80" ry="22" fill="none" stroke="#c9a84c" strokeWidth="0.7" opacity="0.3"/>
        {/* Fountain ripple rings */}
        <ellipse cx="540" cy="530" rx="55" ry="15" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.2"/>
        <ellipse cx="540" cy="530" rx="30" ry="8"  fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.25"/>
        {/* Fountain spout base */}
        <rect x="535" y="512" width="10" height="20" rx="5" fill="#1a3040" opacity="0.9"/>
        <ellipse cx="540" cy="512" rx="12" ry="5" fill="#1e3848" opacity="0.9"/>
        {/* Fountain glow */}
        <ellipse cx="540" cy="522" rx="50" ry="28" fill="url(#fountainGlow)"/>

        {/* Round topiary bushes */}
        {[130,200,270,340,410,670,740,810,880,950].map((x,i)=>(
          <g key={i}>
            <circle cx={x} cy={510} r={i%2===0?16:12} fill="#162818" opacity="0.9"/>
            <circle cx={x} cy={510} r={i%2===0?14:10} fill="#1e3320" opacity="0.8"/>
            <circle cx={x} cy={510} r={i%2===0?8:6}   fill="#243d26" opacity="0.6"/>
          </g>
        ))}
        {/* Pathway */}
        <path d="M 490 660 L 490 500 L 590 500 L 590 660 Z" fill="#141e30" opacity="0.6"/>
        <path d="M 510 660 L 510 500 L 570 500 L 570 660 Z" fill="#1a2840" opacity="0.4"/>

        {/* ════════════════════════════════
            BROAD STEPS
        ════════════════════════════════ */}
        {[
          {x:160,w:760,y:498,h:8},
          {x:180,w:720,y:490,h:8},
          {x:200,w:680,y:482,h:8},
          {x:220,w:640,y:474,h:8},
        ].map((s,i)=>(
          <g key={i}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="1" fill="#151e36" opacity={0.9-i*0.05}/>
            <line x1={s.x} y1={s.y} x2={s.x+s.w} y2={s.y} stroke="#c9a84c" strokeWidth="0.5" opacity={0.2-i*0.03}/>
          </g>
        ))}

        {/* ════════════════════════════════
            WIDE WINGS — LEFT & RIGHT
        ════════════════════════════════ */}

        {/* LEFT WING body */}
        <rect x="30"  y="290" width="310" height="200" fill="url(#mainBody)" opacity="0.92"/>
        {/* Sandstone red band top of left wing */}
        <rect x="30"  y="288" width="310" height="14" fill="url(#sandstone)" opacity="0.7"/>
        <rect x="30"  y="302" width="310" height="5"  fill="url(#sandstone)" opacity="0.4"/>
        {/* Mid red band on left wing */}
        <rect x="30"  y="370" width="310" height="10" fill="url(#sandstone)" opacity="0.5"/>
        <rect x="30"  y="420" width="310" height="8"  fill="url(#sandstone)" opacity="0.4"/>

        {/* Left wing columns — 9 */}
        {[48,80,112,144,176,208,240,272,304].map((x,i)=>(
          <g key={i}>
            <rect x={x}   y={308} width={16} height={164} rx="3" fill="#1a2440" opacity="0.95"/>
            <rect x={x+1} y={315} width={4}  height={150} rx="2" fill="#253050" opacity="0.3"/>
            {/* Capital */}
            <rect x={x-3} y={305} width={22} height={6}   rx="1" fill="#c9a84c" opacity="0.2"/>
            {/* Base */}
            <rect x={x-3} y={470} width={22} height={5}   rx="1" fill="#c9a84c" opacity="0.15"/>
            {/* Window between columns */}
            {i<8 && <rect x={x+18} y={330} width={x+80-x-18} height={80} rx="2" fill="#060e1c" opacity="0.7"/>}
          </g>
        ))}

        {/* LEFT WING small dome/chattri — top left */}
        <ellipse cx="90"  cy="268" rx="38" ry="12" fill="url(#terracotta)" opacity="0.8"/>
        <path d="M 55 268 Q 90 238 125 268" fill="#1a2848" opacity="0.9"/>
        <path d="M 55 268 Q 90 238 125 268" fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.35"/>
        <ellipse cx="90"  cy="238" rx="20" ry="8"  fill="#d0d5e0" opacity="0.5"/>
        <line x1="90" y1="230" x2="90" y2="220"   stroke="#c9a84c" strokeWidth="1" opacity="0.5"/>
        <circle cx="90" cy="219" r="2.5" fill="#c9a84c" opacity="0.6"/>

        {/* LEFT WING small dome/chattri — top right (between wing & center) */}
        <ellipse cx="280" cy="268" rx="38" ry="12" fill="url(#terracotta)" opacity="0.8"/>
        <path d="M 245 268 Q 280 238 315 268" fill="#1a2848" opacity="0.9"/>
        <path d="M 245 268 Q 280 238 315 268" fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.35"/>
        <ellipse cx="280" cy="238" rx="20" ry="8"  fill="#d0d5e0" opacity="0.5"/>
        <line x1="280" y1="230" x2="280" y2="220"  stroke="#c9a84c" strokeWidth="1" opacity="0.5"/>
        <circle cx="280" cy="219" r="2.5" fill="#c9a84c" opacity="0.6"/>

        {/* RIGHT WING body */}
        <rect x="740" y="290" width="310" height="200" fill="url(#mainBody)" opacity="0.92"/>
        <rect x="740" y="288" width="310" height="14" fill="url(#sandstone)" opacity="0.7"/>
        <rect x="740" y="302" width="310" height="5"  fill="url(#sandstone)" opacity="0.4"/>
        <rect x="740" y="370" width="310" height="10" fill="url(#sandstone)" opacity="0.5"/>
        <rect x="740" y="420" width="310" height="8"  fill="url(#sandstone)" opacity="0.4"/>

        {/* Right wing columns — 9 */}
        {[756,788,820,852,884,916,948,980,1012].map((x,i)=>(
          <g key={i}>
            <rect x={x}   y={308} width={16} height={164} rx="3" fill="#1a2440" opacity="0.95"/>
            <rect x={x+1} y={315} width={4}  height={150} rx="2" fill="#253050" opacity="0.3"/>
            <rect x={x-3} y={305} width={22} height={6}   rx="1" fill="#c9a84c" opacity="0.2"/>
            <rect x={x-3} y={470} width={22} height={5}   rx="1" fill="#c9a84c" opacity="0.15"/>
            {i<8 && <rect x={x+18} y={330} width={30} height={80} rx="2" fill="#060e1c" opacity="0.7"/>}
          </g>
        ))}

        {/* RIGHT WING chattris */}
        <ellipse cx="800" cy="268" rx="38" ry="12" fill="url(#terracotta)" opacity="0.8"/>
        <path d="M 765 268 Q 800 238 835 268" fill="#1a2848" opacity="0.9"/>
        <path d="M 765 268 Q 800 238 835 268" fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.35"/>
        <ellipse cx="800" cy="238" rx="20" ry="8"  fill="#d0d5e0" opacity="0.5"/>
        <line x1="800" y1="230" x2="800" y2="220"  stroke="#c9a84c" strokeWidth="1" opacity="0.5"/>
        <circle cx="800" cy="219" r="2.5" fill="#c9a84c" opacity="0.6"/>

        <ellipse cx="990" cy="268" rx="38" ry="12" fill="url(#terracotta)" opacity="0.8"/>
        <path d="M 955 268 Q 990 238 1025 268" fill="#1a2848" opacity="0.9"/>
        <path d="M 955 268 Q 990 238 1025 268" fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.35"/>
        <ellipse cx="990" cy="238" rx="20" ry="8"  fill="#d0d5e0" opacity="0.5"/>
        <line x1="990" y1="230" x2="990" y2="220"  stroke="#c9a84c" strokeWidth="1" opacity="0.5"/>
        <circle cx="990" cy="219" r="2.5" fill="#c9a84c" opacity="0.6"/>

        {/* ════════════════════════════════
            CENTRAL PORTICO BLOCK
        ════════════════════════════════ */}
        {/* Portico body — slightly taller/wider than wings */}
        <rect x="300" y="250" width="480" height="240" fill="url(#mainBody)" opacity="0.96"/>

        {/* Sandstone red bands on portico — horizontal stripes like real ISC */}
        <rect x="300" y="248" width="480" height="15" fill="url(#sandstone)" opacity="0.75"/>
        <rect x="300" y="262" width="480" height="5"  fill="url(#sandstone)" opacity="0.45"/>
        <rect x="300" y="340" width="480" height="12" fill="url(#sandstone)" opacity="0.6"/>
        <rect x="300" y="352" width="480" height="4"  fill="url(#sandstone)" opacity="0.35"/>
        <rect x="300" y="415" width="480" height="10" fill="url(#sandstone)" opacity="0.55"/>
        <rect x="300" y="424" width="480" height="4"  fill="url(#sandstone)" opacity="0.3"/>

        {/* Portico columns — 8 prominent columns */}
        {[320,375,430,485,540,595,650,705].map((x,i)=>(
          <g key={i}>
            {/* Shaft */}
            <rect x={x}   y={270} width={22} height={216} rx="4" fill="#18223a" opacity="0.97"/>
            {/* Entasis highlight */}
            <rect x={x+2} y={278} width={5}  height={200} rx="2" fill="#243060" opacity="0.25"/>
            {/* Fluting */}
            <line x1={x+7}  y1={278} x2={x+7}  y2={480} stroke="#0a1020" strokeWidth="1.2" opacity="0.6"/>
            <line x1={x+12} y1={278} x2={x+12} y2={480} stroke="#0a1020" strokeWidth="1.2" opacity="0.6"/>
            <line x1={x+17} y1={278} x2={x+17} y2={480} stroke="#0a1020" strokeWidth="1.2" opacity="0.6"/>
            {/* Capital */}
            <rect x={x-4} y={266} width={30} height={8} rx="2" fill="#c9a84c" opacity="0.28"/>
            <rect x={x-2} y={262} width={26} height={5} rx="1" fill="#c9a84c" opacity="0.16"/>
            {/* Base */}
            <rect x={x-4} y={484} width={30} height={7} rx="2" fill="#c9a84c" opacity="0.22"/>
            {/* Subtle highlight */}
            <rect x={x}   y={278} width={2}  height={198} fill="#c9a84c" opacity="0.05"/>
          </g>
        ))}

        {/* Central door arch */}
        <rect x="510" y="390" width="60" height="96" rx="4" fill="#04080e" opacity="0.95"/>
        <path d="M 510 390 Q 540 368 570 390" fill="#04080e" opacity="0.95"/>
        <rect x="513" y="392" width="54" height="90" rx="3" fill="#060c18" opacity="0.8"/>

        {/* Side windows on portico */}
        {[320,395,635,710].map((x,i)=>(
          <rect key={i} x={x} y={380} width={50} height={70} rx="3" fill="#04080e" opacity="0.8"/>
        ))}

        {/* Portico entablature band */}
        <rect x="298" y="248" width="484" height="20" rx="2" fill="#1c2848" opacity="0.97"/>
        {/* Triglyph frieze */}
        {[310,340,370,400,430,460,490,520,550,580,610,640,670,700,730].map((x,i)=>(
          <g key={i} opacity="0.28">
            <rect x={x} y={250} width="10" height="15" rx="1" fill="#c9a84c"/>
            <line x1={x+3} y1={250} x2={x+3} y2={265} stroke="#060a14" strokeWidth="1.5"/>
            <line x1={x+7} y1={250} x2={x+7} y2={265} stroke="#060a14" strokeWidth="1.5"/>
          </g>
        ))}

        {/* ════════════════════════════════
            TERRACOTTA DRUM — the signature ISC element
            Octagonal/cylindrical dark red section under dome
        ════════════════════════════════ */}
        {/* Drum base ring */}
        <ellipse cx="540" cy="252" rx="110" ry="20" fill="url(#terracotta)" opacity="0.92"/>
        <ellipse cx="540" cy="252" rx="110" ry="20" fill="none" stroke="#c9a84c" strokeWidth="0.6" opacity="0.3"/>

        {/* Drum body — tall cylindrical red section */}
        <rect x="432" y="130" width="216" height="126" fill="url(#terracotta)" opacity="0.9"/>
        {/* Drum vertical pilasters */}
        {[435,462,489,516,543,570,597,624,639].map((x,i)=>(
          <g key={i}>
            <rect x={x} y={132} width={8} height={122} rx="2" fill="#4a2010" opacity="0.8"/>
            <rect x={x+2} y={135} width={2} height={116} fill="#7a4020" opacity="0.3"/>
          </g>
        ))}
        {/* Drum horizontal bands */}
        <rect x="430" y="130" width="220" height="10" fill="#5a2c14" opacity="0.9"/>
        <rect x="430" y="168" width="220" height="8"  fill="#5a2c14" opacity="0.7"/>
        <rect x="430" y="205" width="220" height="8"  fill="#5a2c14" opacity="0.7"/>
        <rect x="430" y="243" width="220" height="8"  fill="#5a2c14" opacity="0.8"/>
        {/* Drum top ring */}
        <ellipse cx="540" cy="132" rx="108" ry="18" fill="url(#terracotta)" opacity="0.95"/>
        <ellipse cx="540" cy="132" rx="108" ry="18" fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.35"/>

        {/* 4 corner CHATTRI TURRETS on drum corners */}
        {/* Front-left chattri */}
        <ellipse cx="450" cy="130" rx="28" ry="9"  fill="url(#terracotta)" opacity="0.9"/>
        <path d="M 423 130 Q 450 108 477 130" fill="#1e2c50" opacity="0.9"/>
        <path d="M 423 130 Q 450 108 477 130" fill="none" stroke="#c9a84c" strokeWidth="0.7" opacity="0.4"/>
        <ellipse cx="450" cy="109" rx="14" ry="5" fill="#c8ced8" opacity="0.55"/>
        <ellipse cx="450" cy="109" rx="14" ry="5" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.3"/>
        <line x1="450" y1="104" x2="450" y2="96"  stroke="#c9a84c" strokeWidth="0.9" opacity="0.5"/>
        <circle cx="450" cy="95" r="2" fill="#c9a84c" opacity="0.6" className="star-pulse"/>

        {/* Front-right chattri */}
        <ellipse cx="630" cy="130" rx="28" ry="9"  fill="url(#terracotta)" opacity="0.9"/>
        <path d="M 603 130 Q 630 108 657 130" fill="#1e2c50" opacity="0.9"/>
        <path d="M 603 130 Q 630 108 657 130" fill="none" stroke="#c9a84c" strokeWidth="0.7" opacity="0.4"/>
        <ellipse cx="630" cy="109" rx="14" ry="5" fill="#c8ced8" opacity="0.55"/>
        <ellipse cx="630" cy="109" rx="14" ry="5" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.3"/>
        <line x1="630" y1="104" x2="630" y2="96"  stroke="#c9a84c" strokeWidth="0.9" opacity="0.5"/>
        <circle cx="630" cy="95" r="2" fill="#c9a84c" opacity="0.6" className="star-pulse"/>

        {/* Rear chattri hints (behind dome) */}
        <ellipse cx="480" cy="118" rx="20" ry="6" fill="url(#terracotta)" opacity="0.6"/>
        <ellipse cx="600" cy="118" rx="20" ry="6" fill="url(#terracotta)" opacity="0.6"/>

        {/* ════════════════════════════════
            WHITE DOME — true semicircle using SVG arc
            cx=540, cy=132, r=108
            Arc from (432,132) sweeping up to (648,132)
        ════════════════════════════════ */}

        {/* Dome fill — proper semicircle arc */}
        <path
          d="M 432 132 A 108 108 0 0 1 648 132 Z"
          fill="url(#whiteDome)"
          opacity="0.95"
        />
        {/* Dome shading — right side darker */}
        <path
          d="M 540 24 A 108 108 0 0 1 648 132 L 540 132 Z"
          fill="#6070a0"
          opacity="0.18"
        />
        {/* Dome vertical ribs — lines from top of arc to base */}
        {[
          {x1:490,y1:132,cx:480,cy:75,x2:540,y2:24},
          {x1:510,y1:132,cx:505,cy:60,x2:540,y2:24},
          {x1:540,y1:132,cx:540,cy:24,x2:540,y2:24},
          {x1:570,y1:132,cx:575,cy:60,x2:540,y2:24},
          {x1:590,y1:132,cx:600,cy:75,x2:540,y2:24},
        ].map(({x1,y1,cx,cy,x2,y2},i)=>(
          <path key={i} d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
            fill="none" stroke="#8090b8" strokeWidth="0.7" opacity="0.22"/>
        ))}
        {/* Dome horizontal latitude bands */}
        <path d="M 436 118 A 104 104 0 0 1 644 118" fill="none" stroke="#8090b8" strokeWidth="0.6" opacity="0.2"/>
        <path d="M 448  96 A  92  92 0 0 1 632  96" fill="none" stroke="#8090b8" strokeWidth="0.6" opacity="0.18"/>
        <path d="M 466  74 A  74  74 0 0 1 614  74" fill="none" stroke="#8090b8" strokeWidth="0.5" opacity="0.15"/>
        <path d="M 490  52 A  50  50 0 0 1 590  52" fill="none" stroke="#8090b8" strokeWidth="0.5" opacity="0.12"/>
        {/* Dome outline */}
        <path
          d="M 432 132 A 108 108 0 0 1 648 132"
          fill="none" stroke="#b0bcd4" strokeWidth="1.2" opacity="0.5"
        />
        {/* Dome ambient glow */}
        <ellipse cx="540" cy="90" rx="110" ry="90" fill="url(#domeGlow)" className="dome-breath"/>

        {/* Lantern base ring on top of dome */}
        <ellipse cx="540" cy="24" rx="24" ry="8" fill="url(#terracotta)" opacity="0.9"/>
        {/* Lantern cylinder */}
        <rect x="528" y="10" width="24" height="16" rx="3" fill="#c8d0e0" opacity="0.75"/>
        {/* Lantern top cap */}
        <path d="M 528 10 A 12 6 0 0 1 552 10" fill="#d8dfe8" opacity="0.85"/>
        <ellipse cx="540" cy="10" rx="12" ry="4" fill="#dde4f0" opacity="0.9"/>

        {/* Flag pole */}
        <line x1="540" y1="6" x2="540" y2="-22" stroke="#c9a84c" strokeWidth="1.4" opacity="0.7"/>
        {/* Indian Tricolour */}
        <rect x="540" y="-22" width="28" height="7"  fill="#e05818" opacity="0.75"/>
        <rect x="540" y="-15" width="28" height="7"  fill="#e8e4d8" opacity="0.65"/>
        <rect x="540" y="-8"  width="28" height="7"  fill="#2a7040" opacity="0.75"/>
        {/* Ashoka Chakra */}
        <circle cx="554" cy="-11" r="4" fill="none" stroke="#1a3a8a" strokeWidth="0.9" opacity="0.75"/>
        <circle cx="554" cy="-11" r="1" fill="#1a3a8a" opacity="0.75"/>
        {/* Finial */}
        <circle cx="540" cy="-24" r="3.5" fill="#c9a84c" opacity="0.9" filter="url(#glow2)" className="star-pulse"/>

        {/* ════════════════════════════════
            HORIZONTAL GOLD ARCHITECTURAL LINES
        ════════════════════════════════ */}
        <rect x="0" y="470" width="1080" height="1.5" fill="url(#goldLine)" opacity="0.45"/>
        <rect x="0" y="490" width="1080" height="1"   fill="url(#goldLine)" opacity="0.3"/>
        <rect x="0" y="248" width="1080" height="1"   fill="url(#goldLine)" opacity="0.28"/>
        <rect x="0" y="130" width="1080" height="1"   fill="url(#goldLine)" opacity="0.2"/>

        {/* ════════════════════════════════
            VIGNETTE / FADES
        ════════════════════════════════ */}
        <rect width="1080" height="660" fill="url(#vignette)"/>
        <rect width="1080" height="660" fill="url(#topFade)"/>
        <rect width="1080" height="660" fill="url(#btmFade)"/>
        {/* Final dark overlay — keeps it atmospheric, not harsh */}
        <rect width="1080" height="660" fill="#04080f" opacity="0.08"/>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CANVAS — floating legal text particles
───────────────────────────────────────────── */
function LegalCanvas() {
  const canvasRef = useRef(null);
  const pRef = useRef([]);
  const raf  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const spawn = () => ({
      text: LEGAL_FRAGMENTS[Math.floor(Math.random()*LEGAL_FRAGMENTS.length)],
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      size: 9+Math.random()*6,
      opacity: 0,
      maxOpacity: 0.04+Math.random()*0.08,
      phase: 'in',
      holdTimer: 0,
      holdMax: 130+Math.random()*210,
      drift: (Math.random()-0.5)*0.2,
      vy: -0.15-Math.random()*0.1,
    });

    for (let i=0; i<35; i++) {
      const p = spawn();
      p.opacity = Math.random()*p.maxOpacity;
      p.phase = 'hold';
      p.holdTimer = Math.random()*p.holdMax;
      pRef.current.push(p);
    }

    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pRef.current.forEach((p,i)=>{
        if (p.phase==='in') {
          p.opacity+=0.004;
          if (p.opacity>=p.maxOpacity) { p.opacity=p.maxOpacity; p.phase='hold'; }
        } else if (p.phase==='hold') {
          p.holdTimer++;
          if (p.holdTimer>=p.holdMax) p.phase='out';
        } else {
          p.opacity-=0.003;
          if (p.opacity<=0) { pRef.current[i]=spawn(); return; }
        }
        p.x+=p.drift; p.y+=p.vy;
        ctx.save();
        ctx.globalAlpha=p.opacity;
        ctx.fillStyle='#c9a84c';
        ctx.font=`500 ${p.size}px "DM Mono",monospace`;
        ctx.fillText(p.text,p.x,p.y);
        ctx.restore();
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize',resize); cancelAnimationFrame(raf.current); };
  },[]);

  return <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:2,pointerEvents:'none'}}/>;
}

/* ─────────────────────────────────────────────
   SCAN BEAM
───────────────────────────────────────────── */
function ScanBeam() {
  return (
    <div style={{position:'fixed',inset:0,zIndex:3,pointerEvents:'none',overflow:'hidden'}}>
      <style>{`
        @keyframes scanSweep {
          0%{transform:translateY(-100px);opacity:0}
          5%{opacity:1} 95%{opacity:1}
          100%{transform:translateY(calc(100vh + 100px));opacity:0}
        }
        .sline{position:absolute;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent 0%,rgba(201,168,76,0)8%,rgba(201,168,76,.6)30%,rgba(201,168,76,.9)50%,rgba(201,168,76,.6)70%,rgba(201,168,76,0)92%,transparent 100%);
          animation:scanSweep 10s cubic-bezier(.4,0,.6,1) infinite;filter:blur(.4px)}
        .sglow{position:absolute;left:0;right:0;height:100px;
          background:linear-gradient(180deg,transparent 0%,rgba(201,168,76,.02)40%,rgba(201,168,76,.045)50%,rgba(201,168,76,.02)60%,transparent 100%);
          animation:scanSweep 10s cubic-bezier(.4,0,.6,1) infinite;transform:translateY(-50px)}
      `}</style>
      <div className="sglow"/><div className="sline"/>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCROLLING META COLUMNS
───────────────────────────────────────────── */
function MetaColumn({ lines, side }) {
  const doubled = [...lines,...lines];
  return (
    <div style={{position:'fixed',top:0,bottom:0,[side]:0,width:'210px',zIndex:4,pointerEvents:'none',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,
        background: side==='left'
          ? 'linear-gradient(90deg,#04080f 0%,#04080f 25%,rgba(4,8,15,.55)65%,transparent 100%)'
          : 'linear-gradient(270deg,#04080f 0%,#04080f 25%,rgba(4,8,15,.55)65%,transparent 100%)',
        zIndex:2}}/>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'100px',background:'linear-gradient(180deg,#04080f,transparent)',zIndex:3}}/>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'100px',background:'linear-gradient(0deg,#04080f,transparent)',zIndex:3}}/>
      <style>{`@keyframes mScroll{from{transform:translateY(0)}to{transform:translateY(-50%)}}`}</style>
      <div style={{animation:'mScroll 32s linear infinite',display:'flex',flexDirection:'column'}}>
        {doubled.map((line,i)=>(
          <div key={i} style={{fontFamily:'"DM Mono",monospace',fontSize:'.61rem',color:'rgba(201,168,76,.24)',
            padding:'5px 14px',letterSpacing:'.04em',whiteSpace:'nowrap',borderBottom:'1px solid rgba(201,168,76,.04)'}}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CORNER BRACKETS
───────────────────────────────────────────── */
function Corner({ pos }) {
  const iL = pos.includes('left'), iT = pos.includes('top');
  return (
    <div style={{position:'fixed',[iT?'top':'bottom']:'18px',[iL?'left':'right']:'218px',zIndex:5,pointerEvents:'none',opacity:.3}}>
      <svg width="52" height="52" viewBox="0 0 52 52">
        <path d={iL&&iT?'M0 52 L0 0 L52 0':iL?'M0 0 L0 52 L52 52':iT?'M52 52 L52 0 L0 0':'M52 0 L52 52 L0 52'}
          fill="none" stroke="#c9a84c" strokeWidth="1.2"/>
        <circle cx={iL?0:52} cy={iT?0:52} r="2.8" fill="#c9a84c"/>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function UploadPage({ onFileUpload, uploadedFile, onAnalysis }) {
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (file) => {
    if (file && file.type==='application/pdf') onFileUpload(file);
    else alert('Please upload a PDF file.');
  };

  const handleAnalyze = async () => {
    if (!uploadedFile||!uploadedFile.type) return;
    setLoading(true); setError(null);
    try {
      const data = await analyzeDocument(uploadedFile);
      onAnalysis(data); navigate('/dashboard');
    } catch(e) { setError('Analysis failed: '+e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root{
          --ink:#04080f; --surface:#111726; --surface2:#171e30; --surface3:#1d2540;
          --border:rgba(255,255,255,0.06); --border2:rgba(255,255,255,0.11);
          --gold:#c9a84c; --gold-dim:rgba(201,168,76,.12); --gold-glow:rgba(201,168,76,.22);
          --text:#e6e8f0; --text-muted:#8b93a8; --text-dim:#484f65;
          --green:#34d399; --green-dim:rgba(52,211,153,.1); --red:#f87171;
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        .pw{
          min-height:calc(100vh - 58px);
          display:flex;align-items:center;justify-content:center;
          padding:60px 24px;
          background:var(--ink);
          position:relative;overflow:hidden;
          font-family:'DM Sans',sans-serif;
        }
        .pw::after{
          content:'';position:fixed;inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity:.018;pointer-events:none;z-index:6;
        }
        .co{position:relative;z-index:10;width:100%;max-width:545px;}
        .fi{opacity:0;animation:riseIn .7s ease forwards;}
        .fi1{animation-delay:.04s}.fi2{animation-delay:.14s}.fi3{animation-delay:.27s}
        .fi4{animation-delay:.39s}.fi5{animation-delay:.51s}
        @keyframes riseIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .eyebrow{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:22px;}
        .el{height:1px;width:40px;}.el.l{background:linear-gradient(90deg,transparent,var(--gold))}
        .el.r{background:linear-gradient(90deg,var(--gold),transparent)}
        .et{font-family:'DM Mono',monospace;font-size:.65rem;font-weight:500;letter-spacing:.18em;color:var(--gold);text-transform:uppercase;}
        .mt{font-family:'Playfair Display',serif;font-size:2.55rem;font-weight:700;color:var(--text);
          letter-spacing:-.4px;line-height:1.15;text-align:center;margin-bottom:14px;}
        .mt em{font-style:italic;font-weight:600;color:var(--gold);}
        .st{text-align:center;color:var(--text-muted);font-size:.86rem;line-height:1.7;
          max-width:390px;margin:0 auto 32px;font-weight:300;}
        .dz{position:relative;border-radius:16px;padding:42px 34px;text-align:center;cursor:pointer;
          background:rgba(17,23,38,.88);backdrop-filter:blur(14px);
          border:1.5px dashed rgba(201,168,76,.25);
          transition:border-color .25s,box-shadow .25s,background .25s;overflow:hidden;}
        .dz::before,.dz::after{content:'';position:absolute;width:18px;height:18px;
          border-color:var(--gold);border-style:solid;opacity:0;transition:opacity .3s,width .3s,height .3s;}
        .dz::before{top:10px;left:10px;border-width:1.5px 0 0 1.5px;}
        .dz::after{bottom:10px;right:10px;border-width:0 1.5px 1.5px 0;}
        .dz:hover::before,.dz:hover::after,.dz.drag::before,.dz.drag::after{opacity:1;width:28px;height:28px;}
        .dz:hover,.dz.drag{border-color:var(--gold);background:rgba(20,28,52,.92);
          box-shadow:0 0 50px var(--gold-glow),inset 0 0 40px rgba(201,168,76,.03);}
        .dz.done{border-color:var(--green);border-style:solid;background:rgba(20,28,52,.92);
          box-shadow:0 0 35px rgba(52,211,153,.12);}
        .di{width:54px;height:54px;border-radius:14px;border:1px solid var(--border2);
          background:var(--surface3);display:flex;align-items:center;justify-content:center;
          margin:0 auto 18px;color:var(--text-dim);transition:all .25s;}
        .dz:hover .di{border-color:var(--gold);color:var(--gold);background:var(--gold-dim);}
        .dz.done .di{border-color:var(--green);color:var(--green);background:var(--green-dim);}
        .dt{color:var(--text);font-weight:500;font-size:.9rem;margin-bottom:7px;}
        .ds{color:var(--text-muted);font-size:.78rem;margin-bottom:18px;font-weight:300;}
        .fc{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:6px;
          background:var(--surface3);border:1px solid var(--border);color:var(--text-dim);
          font-family:'DM Mono',monospace;font-size:.67rem;letter-spacing:.05em;}
        .fn{color:var(--green);font-weight:600;font-size:.88rem;margin-bottom:5px;font-family:'DM Mono',monospace;}
        .fm{color:var(--text-muted);font-size:.74rem;font-family:'DM Mono',monospace;letter-spacing:.03em;}
        .cb{width:100%;margin-top:13px;padding:16px;border-radius:10px;border:none;
          font-size:.88rem;font-weight:700;font-family:'DM Sans',sans-serif;
          letter-spacing:.1em;text-transform:uppercase;transition:all .2s;cursor:pointer;position:relative;overflow:hidden;}
        .cb.on{background:linear-gradient(115deg,#a07830 0%,#d4a84b 45%,#b8933e 100%);
          color:#04080f;box-shadow:0 6px 28px rgba(201,168,76,.45);font-size:.88rem;letter-spacing:.12em;}
        .cb.on::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);transition:left .45s;}
        .cb.on:hover::after{left:160%;}
        .cb.on:hover{box-shadow:0 8px 36px rgba(201,168,76,.6);transform:translateY(-2px);}
        .cb.off{background:var(--surface2);color:var(--text-dim);cursor:not-allowed;border:1px solid var(--border);}
        @keyframes db{0%,80%,100%{opacity:.2}40%{opacity:1}}
        .dot{display:inline-block;animation:db 1.2s infinite;}
        .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
        .sb{margin-top:10px;width:100%;background:transparent;border:1px solid rgba(201,168,76,0.2);border-radius:8px;color:var(--text-muted);
          font-size:.76rem;font-family:'DM Mono',monospace;cursor:pointer;padding:10px;
          transition:all .15s;letter-spacing:.05em;}
        .sb:hover{color:var(--gold);border-color:rgba(201,168,76,0.45);background:var(--gold-dim);}
        .divrow{display:flex;align-items:center;gap:12px;margin:26px 0 0;}
        .dl{flex:1;height:1px;background:var(--border);}
        .dlb{color:var(--text-dim);font-size:.62rem;font-family:'DM Mono',monospace;letter-spacing:.1em;text-transform:uppercase;}
        .fg{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:12px;}
        .fcd{background:rgba(17,23,38,.82);backdrop-filter:blur(8px);border:1px solid var(--border);
          border-radius:10px;padding:15px 14px;transition:all .22s;position:relative;overflow:hidden;}
        .fcd::before{content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,var(--gold-dim),transparent);opacity:0;transition:opacity .25s;}
        .fcd:hover{border-color:rgba(201,168,76,.3);transform:translateY(-2px);}
        .fcd:hover::before{opacity:1;}
        .fi2c{color:var(--gold);margin-bottom:9px;opacity:.75;}
        .fl{font-size:.76rem;font-weight:600;color:var(--text);margin-bottom:3px;}
        .fd{font-size:.68rem;color:var(--text-muted);line-height:1.5;font-weight:300;}
        .statbar{display:flex;align-items:center;gap:14px;margin-top:24px;padding:10px 16px;
          background:rgba(17,23,38,.82);backdrop-filter:blur(8px);
          border:1px solid var(--border);border-radius:8px;justify-content:space-between;flex-wrap:wrap;}
        .si{display:flex;align-items:center;gap:6px;font-family:'DM Mono',monospace;
          font-size:.6rem;color:var(--text-dim);letter-spacing:.04em;}
        .sd{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
        .sd.g{background:var(--green);box-shadow:0 0 6px var(--green);animation:sdp 2s infinite;}
        .sd.a{background:#f59e0b;}.sd.d{background:var(--text-dim);}
        @keyframes sdp{0%,100%{opacity:1}50%{opacity:.35}}
        .err{color:var(--red);font-size:.74rem;margin-top:8px;text-align:center;font-family:'DM Mono',monospace;}
        @media(max-width:960px){.meta-col,.corner-deco{display:none!important;}}
        @media(max-width:480px){.mt{font-size:2rem;}.fg{grid-template-columns:1fr;}}
      `}</style>

      <CourthouseBackground />
      <LegalCanvas />
      <ScanBeam />
      <div className="meta-col"><MetaColumn lines={META_LEFT}  side="left"/></div>
      <div className="meta-col"><MetaColumn lines={META_RIGHT} side="right"/></div>
      <div className="corner-deco"><Corner pos="top-left"/></div>
      <div className="corner-deco"><Corner pos="top-right"/></div>
      <div className="corner-deco"><Corner pos="bottom-left"/></div>
      <div className="corner-deco"><Corner pos="bottom-right"/></div>

      <div className="pw">
        <div className="co">

          <div className="eyebrow fi fi1">
            <span className="el l"/><span className="et">AI-Powered Legal Analysis</span><span className="el r"/>
          </div>

          <h1 className="mt fi fi2">Review Contracts<br/><em>In Seconds</em></h1>
          <p className="st fi fi2">Upload any NDA or agreement and receive instant risk scoring, clause extraction, and plain-English summaries — powered by AI.</p>

          <div
            className={`dz fi fi3${dragging?' drag':''}${uploadedFile?' done':''}`}
            onDragOver={e=>{e.preventDefault();setDragging(true);}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}}
            onClick={()=>inputRef.current.click()}
          >
            <input ref={inputRef} type="file" accept=".pdf" style={{display:'none'}}
              onChange={e=>handleFile(e.target.files[0])}/>
            {uploadedFile ? (
              <>
                <div className="di"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg></div>
                <p className="fn">{uploadedFile.name}</p>
                <p className="fm">{(uploadedFile.size/1024).toFixed(1)} KB · PDF · Ready to analyze</p>
              </>
            ) : (
              <>
                <div className="di"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg></div>
                <p className="dt">{dragging?'Release to upload':'Drop your PDF here'}</p>
                <p className="ds">or click to browse from your computer</p>
                <span className="fc">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2h11"/></svg>
                  PDF · Max 50 MB
                </span>
              </>
            )}
          </div>

          {error && <p className="err">⚠ {error}</p>}

          <button className={`cb fi fi4 ${uploadedFile&&!loading?'on':'off'}`}
            onClick={handleAnalyze} disabled={!uploadedFile||loading}>
            {loading
              ? <span>Analyzing<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></span>
              : 'Analyze Document →'}
          </button>

          {!uploadedFile && (
            <button className="sb fi fi4"
              onClick={()=>onFileUpload({name:'Sample_NDA_Agreement.pdf',size:245760,type:'application/pdf'})}>
              — or try a sample document —
            </button>
          )}

          <div className="divrow fi fi5"><span className="dl"/><span className="dlb">What you get</span><span className="dl"/></div>

          <div className="fg fi fi5">
            {FEATURES.map(({label,desc,icon})=>(
              <div key={label} className="fcd">
                <div className="fi2c">{icon}</div>
                <p className="fl">{label}</p>
                <p className="fd">{desc}</p>
              </div>
            ))}
          </div>

          <div className="statbar fi fi5">
            <div className="si"><span className="sd g"/>SYSTEM ONLINE</div>
            <div className="si"><span className="sd a"/>{uploadedFile?'FILE STAGED':'AWAITING INPUT'}</div>
            <div className="si"><span className="sd d"/>API v4.1 READY</div>
            <div className="si" style={{color:'rgba(201,168,76,.42)'}}>
              {new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',hour12:false,day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).toUpperCase()} IST
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
