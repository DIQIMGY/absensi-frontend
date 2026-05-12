import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Star, Zap, Gift, Sparkles as SparklesIcon, X } from 'lucide-react'
import { siswaApi } from '../services/siswaService'
import { useThemeStore } from '../stores/themeStore'
import toast from 'react-hot-toast'

const th = (isDark, dark, light) => isDark ? dark : light

// ─── RARITY CONFIG ────────────────────────────────────────────
export const RARITY_CFG = {
  limited: {
    label:'Limited', short:'LTD', stars:6,
    text:'text-rose-300', particle:'#ff2d78',
    glow:'rgba(255,45,120,0.9)', glow2:'rgba(255,180,220,0.5)',
    grad:'linear-gradient(135deg,#4a0020,#be0058,#ff2d78,#ff9ec8,#ffe0f0)',
    gradBtn:'linear-gradient(135deg,#be0058,#ff2d78,#ff9ec8)',
    cardBg:'linear-gradient(160deg,#1a0010,#2d0020,#1a0010)',
    beam:'rgba(255,45,120,0.35)',
    frameGrad:['#ff2d78','#ff9ec8','#be0058','#ffe0f0'],
  },
  permanent: {
    label:'Permanent', short:'PERM', stars:7,
    text:'text-cyan-300', particle:'#00e5ff',
    glow:'rgba(0,229,255,0.95)', glow2:'rgba(0,180,220,0.6)',
    grad:'linear-gradient(135deg,#001a2e,#003d5c,#00e5ff,#80f4ff,#ffffff)',
    gradBtn:'linear-gradient(135deg,#003d5c,#00e5ff,#80f4ff)',
    cardBg:'linear-gradient(160deg,#000d14,#001a28,#000d14)',
    beam:'rgba(0,229,255,0.4)',
    frameGrad:['#00e5ff','#80f4ff','#003d5c','#ffffff'],
  },
  legendary: {
    label:'Legendary', short:'LEG', stars:5,
    text:'text-amber-400', particle:'#f59e0b',
    glow:'rgba(245,158,11,0.8)', glow2:'rgba(251,191,36,0.4)',
    grad:'linear-gradient(135deg,#92400e,#f59e0b,#fde68a,#f97316)',
    gradBtn:'linear-gradient(135deg,#f59e0b,#fbbf24,#f97316)',
    cardBg:'linear-gradient(160deg,#1c0900,#2d1200,#1c0900)',
    beam:'rgba(251,191,36,0.25)',
    frameGrad:['#f59e0b','#fde68a','#f97316','#fbbf24'],
  },
  epic: {
    label:'Epic', short:'EPIC', stars:4,
    text:'text-fuchsia-300', particle:'#d946ef',
    glow:'rgba(217,70,239,0.8)', glow2:'rgba(192,38,211,0.4)',
    grad:'linear-gradient(135deg,#4a044e,#a21caf,#d946ef,#7c3aed)',
    gradBtn:'linear-gradient(135deg,#a21caf,#d946ef,#7c3aed)',
    cardBg:'linear-gradient(160deg,#1a0020,#2d0045,#1a0020)',
    beam:'rgba(217,70,239,0.25)',
    frameGrad:['#a21caf','#d946ef','#7c3aed','#c026d3'],
  },
  rare: {
    label:'Rare', short:'RARE', stars:3,
    text:'text-sky-300', particle:'#38bdf8',
    glow:'rgba(56,189,248,0.8)', glow2:'rgba(14,165,233,0.4)',
    grad:'linear-gradient(135deg,#0c2a4a,#0369a1,#38bdf8,#06b6d4)',
    gradBtn:'linear-gradient(135deg,#0369a1,#38bdf8,#06b6d4)',
    cardBg:'linear-gradient(160deg,#00101a,#001e35,#00101a)',
    beam:'rgba(56,189,248,0.25)',
    frameGrad:['#0369a1','#38bdf8','#06b6d4','#0ea5e9'],
  },
  uncommon: {
    label:'Uncommon', short:'UNC', stars:2,
    text:'text-emerald-300', particle:'#34d399',
    glow:'rgba(52,211,153,0.7)', glow2:'rgba(16,185,129,0.35)',
    grad:'linear-gradient(135deg,#052e16,#065f46,#34d399,#0d9488)',
    gradBtn:'linear-gradient(135deg,#065f46,#34d399,#0d9488)',
    cardBg:'linear-gradient(160deg,#001a0e,#002d1a,#001a0e)',
    beam:'rgba(52,211,153,0.2)',
    frameGrad:['#065f46','#34d399','#0d9488','#10b981'],
  },
  common: {
    label:'Common', short:'COM', stars:1,
    text:'text-slate-300', particle:'#94a3b8',
    glow:'rgba(148,163,184,0.6)', glow2:'rgba(100,116,139,0.3)',
    grad:'linear-gradient(135deg,#1e293b,#475569,#94a3b8,#64748b)',
    gradBtn:'linear-gradient(135deg,#475569,#94a3b8,#64748b)',
    cardBg:'linear-gradient(160deg,#0a0f1a,#111827,#0a0f1a)',
    beam:'rgba(148,163,184,0.15)',
    frameGrad:['#475569','#94a3b8','#64748b','#cbd5e1'],
  },
  zonk: {
    label:'Zonk', short:'ZNK', stars:0,
    text:'text-slate-400', particle:'#64748b',
    glow:'rgba(100,116,139,0.5)', glow2:'rgba(71,85,105,0.3)',
    grad:'linear-gradient(135deg,#1e293b,#334155,#475569)',
    gradBtn:'linear-gradient(135deg,#334155,#475569,#64748b)',
    cardBg:'linear-gradient(160deg,#0a0f1a,#111827,#0a0f1a)',
    beam:'rgba(100,116,139,0.1)',
    frameGrad:['#334155','#475569','#64748b','#94a3b8'],
  },
}

// ─── BADGE POOL ───────────────────────────────────────────────
// SINKRON dengan GachaController.php backend
// glow/glow2 = warna aura sesuai tema border masing-masing
// Urutan: Legendary → Epic → Rare → Zonk
export const BADGE_POOL = [
  // ── LIMITED ─────────────────────────────────────────────────
  { id:'blackpink',      name:'BLACKPINK',                emoji:'🎤', rarity:'limited',   borderImg:'/image/b59.png',
    glow:'rgba(255,45,120,0.95)',  glow2:'rgba(255,180,220,0.6)'  },
  { id:'sakura',         name:'Sakura Jepang',            emoji:'🌸', rarity:'limited',   borderImg:'/image/b60.png',
    glow:'rgba(255,160,200,0.95)', glow2:'rgba(200,80,120,0.55)'  },
  { id:'bts',            name:'BTS',                      emoji:'🌟', rarity:'limited',   borderImg:'/image/b61.png',
    glow:'rgba(120,60,220,0.95)',  glow2:'rgba(180,180,255,0.6)'  },
  { id:'babymonster',    name:'BABYMONSTER',              emoji:'👾', rarity:'limited',   borderImg:'/image/b62.png',
    glow:'rgba(20,200,180,0.95)',  glow2:'rgba(100,255,100,0.55)' },
  { id:'aespa',          name:'aespa',                    emoji:'🤖', rarity:'limited',   borderImg:'/image/b63.png',
    glow:'rgba(255,60,200,0.95)',  glow2:'rgba(60,200,255,0.55)'  },
  { id:'seventeen',      name:'SEVENTEEN',                emoji:'💎', rarity:'limited',   borderImg:'/image/b64.png',
    glow:'rgba(200,160,200,0.95)', glow2:'rgba(100,160,220,0.55)' },
  { id:'nct',            name:'NCT',                      emoji:'🌐', rarity:'limited',   borderImg:'/image/b65.png',
    glow:'rgba(60,220,60,0.95)',   glow2:'rgba(180,180,255,0.55)' },
  { id:'mingyu',         name:'Mingyu (SEVENTEEN)',       emoji:'🐶', rarity:'limited',   borderImg:'/image/b66.png',
    glow:'rgba(200,160,200,0.95)', glow2:'rgba(200,160,60,0.55)'  },
  { id:'lisa',           name:'Lisa (BLACKPINK)',         emoji:'🐯', rarity:'limited',   borderImg:'/image/b67.png',
    glow:'rgba(255,45,120,0.95)',  glow2:'rgba(200,140,20,0.55)'  },
  { id:'karina',         name:'Karina (aespa)',           emoji:'🐱', rarity:'limited',   borderImg:'/image/b68.png',
    glow:'rgba(255,60,200,0.95)',  glow2:'rgba(60,200,255,0.55)'  },
  // b71 — Taehyung (V) BTS: ungu, perak, hitam, emas, hijau, biru
  { id:'taehyung',       name:'Taehyung (V) - BTS',       emoji:'🐯', rarity:'limited',   borderImg:'/image/b71.png',
    glow:'rgba(120,60,220,0.95)',  glow2:'rgba(180,180,255,0.6)'  },
  { id:'txt',            name:'TXT',                      emoji:'🌟', rarity:'limited',   borderImg:'/image/b74.png',
    glow:'rgba(80,140,255,0.95)',  glow2:'rgba(200,100,200,0.55)' },
  { id:'itzy',           name:'ITZY',                     emoji:'👑', rarity:'limited',   borderImg:'/image/b75.png',
    glow:'rgba(255,40,180,0.95)',  glow2:'rgba(200,200,200,0.55)' },
  { id:'redvelvet',      name:'Red Velvet',               emoji:'🧁', rarity:'limited',   borderImg:'/image/b76.png',
    glow:'rgba(200,20,40,0.95)',   glow2:'rgba(255,100,140,0.55)' },
  { id:'twice',          name:'TWICE',                    emoji:'🍭', rarity:'limited',   borderImg:'/image/b77.png',
    glow:'rgba(255,100,180,0.95)', glow2:'rgba(180,220,255,0.55)' },
  { id:'ive',            name:'IVE',                      emoji:'💎', rarity:'limited',   borderImg:'/image/b78.png',
    glow:'rgba(40,80,220,0.95)',   glow2:'rgba(220,220,255,0.55)' },
  { id:'straykids',      name:'Stray Kids',               emoji:'🐺', rarity:'limited',   borderImg:'/image/b79.png',
    glow:'rgba(220,20,20,0.95)',   glow2:'rgba(200,200,200,0.55)' },
  { id:'newjeans',       name:'NewJeans',                 emoji:'🐰', rarity:'limited',   borderImg:'/image/b80.png',
    glow:'rgba(60,100,200,0.95)',  glow2:'rgba(255,160,180,0.55)' },
  { id:'treasure',       name:'TREASURE',                 emoji:'🌠', rarity:'limited',   borderImg:'/image/b81.png',
    glow:'rgba(100,180,255,0.95)', glow2:'rgba(220,220,255,0.55)' },
  { id:'h2h',            name:'Hearts2Hearts (H2H)',      emoji:'💙', rarity:'limited',   borderImg:'/image/b82.png',
    glow:'rgba(100,180,255,0.95)', glow2:'rgba(255,160,180,0.55)' },
  { id:'exo',            name:'EXO',                      emoji:'🌌', rarity:'limited',   borderImg:'/image/b83.png',
    glow:'rgba(160,100,255,0.95)', glow2:'rgba(20,40,120,0.55)'   },
  { id:'enhypen',        name:'ENHYPEN',                  emoji:'🌙', rarity:'limited',   borderImg:'/image/b84.png',
    glow:'rgba(20,60,180,0.95)',   glow2:'rgba(160,20,40,0.55)'   },
  { id:'illit',          name:'ILLIT',                    emoji:'🧚', rarity:'limited',   borderImg:'/image/b85.png',
    glow:'rgba(255,160,200,0.95)', glow2:'rgba(160,220,200,0.55)' },
  { id:'lesserafim',     name:'LE SSERAFIM',              emoji:'⚡', rarity:'limited',   borderImg:'/image/b86.png',
    glow:'rgba(20,100,220,0.95)',  glow2:'rgba(200,200,255,0.55)' },
  // ── LEGENDARY ────────────────────────────────────────────────
  // b69 — Nusantara Gong: emas, merah, hitam, putih, hijau, biru, perak, perunggu
  { id:'nusantara_gong',  name:'Nusantara Gong',           emoji:'🛎️', rarity:'legendary', borderImg:'/image/b69.png',
    glow:'rgba(200,160,20,0.95)',  glow2:'rgba(160,80,20,0.58)'  },
  { id:'jfc',            name:'Jember Fashion Carnaval',  emoji:'🎭', rarity:'legendary', borderImg:'/image/b57.png',
    glow:'rgba(220,20,80,0.92)',   glow2:'rgba(200,160,20,0.52)'  },
  { id:'fbim',           name:'Perahu Hias FBIM',         emoji:'🛶', rarity:'legendary', borderImg:'/image/b58.png',
    glow:'rgba(200,140,20,0.92)',  glow2:'rgba(20,80,160,0.52)'   },
  { id:'dragon_scholar', name:'Wayang Kulit',             emoji:'🎭', rarity:'legendary', borderImg:'/image/b1.png',
    glow:'rgba(220,170,40,0.95)',  glow2:'rgba(160,90,20,0.55)'  },
  { id:'gandrung',       name:'Gandrung',                 emoji:'🎶', rarity:'legendary', borderImg:'/image/b18.png',
    glow:'rgba(201,162,39,0.95)',  glow2:'rgba(139,0,0,0.58)'    },
  { id:'night_owl',      name:'Barong Bali',              emoji:'🐉', rarity:'legendary', borderImg:'/image/b5.png',
    glow:'rgba(220,40,30,0.92)',   glow2:'rgba(200,160,20,0.55)' },
  { id:'bookworm',       name:'Reog Ponorogo',            emoji:'🔥', rarity:'legendary',      borderImg:'/image/b8.png',
    glow:'rgba(230,50,20,0.82)',   glow2:'rgba(200,170,0,0.42)'  },
  { id:'banyale',        name:'Festival Bau Nyale',       emoji:'🎨', rarity:'legendary', borderImg:'/image/b49.png',
    glow:'rgba(20,100,200,0.92)',  glow2:'rgba(40,140,60,0.55)'  },
  { id:'bebean',         name:'Layang Bebean',            emoji:'🪁', rarity:'legendary', borderImg:'/image/b21.png',
    glow:'rgba(30,120,200,0.92)',  glow2:'rgba(220,80,20,0.55)'  },
  { id:'early_bird',     name:'Topeng Malangan',          emoji:'🎎', rarity:'legendary', borderImg:'/image/b7.png',
    glow:'rgba(220,60,60,0.92)',   glow2:'rgba(30,160,140,0.55)' },
  { id:'barongan',       name:'Barongan Jawa',            emoji:'🦁', rarity:'legendary', borderImg:'/image/b14.png',
    glow:'rgba(200,20,20,0.92)',   glow2:'rgba(200,160,20,0.55)' },
  { id:'capgomeh',       name:'Cap Go Meh',               emoji:'🥏', rarity:'legendary', borderImg:'/image/b48.png',
    glow:'rgba(220,20,20,0.92)',   glow2:'rgba(200,160,20,0.55)' },
  { id:'nyiroro',      name:'Nyi Roro Kidul',          emoji:'👸', rarity:'legendary', borderImg:'/image/b51.png',
    glow:'rgba(20,160,80,0.92)',   glow2:'rgba(200,160,20,0.55)'  },
  { id:'suntiang',      name:'Pengantin Suntiang',      emoji:'👰', rarity:'legendary', borderImg:'/image/b53.png',
    glow:'rgba(200,160,20,0.92)',  glow2:'rgba(180,20,20,0.52)'   },
  { id:'garuda_m',      name:'Garuda Mitologi',         emoji:'🦅', rarity:'legendary', borderImg:'/image/b54.png',
    glow:'rgba(200,140,20,0.92)',  glow2:'rgba(180,60,20,0.52)'   },
  { id:'sembrani',       name:'Kuda Sembrani',           emoji:'🐎', rarity:'legendary', borderImg:'/image/b56.png',
    glow:'rgba(40,160,220,0.92)',  glow2:'rgba(200,160,20,0.52)'  },
  // ── EPIC ─────────────────────────────────────────────────────
  { id:'seblang',        name:'Seblang Olehsari',         emoji:'🌿', rarity:'epic',      borderImg:'/image/b31.png',
    glow:'rgba(180,30,30,0.88)',   glow2:'rgba(40,120,40,0.48)'  },
  { id:'seblang_tua',    name:'Seblang Bakungan',         emoji:'🌑', rarity:'epic',      borderImg:'/image/b32.png',
    glow:'rgba(100,20,60,0.88)',   glow2:'rgba(40,20,80,0.48)'   },
  { id:'legong',         name:'Tari Legong',              emoji:'💃', rarity:'epic',      borderImg:'/image/b16.png',
    glow:'rgba(220,160,30,0.88)',  glow2:'rgba(180,30,30,0.48)'  },
  { id:'jaranan',        name:'Jaranan Kepang',           emoji:'🐴', rarity:'epic',      borderImg:'/image/b15.png',
    glow:'rgba(220,200,120,0.88)', glow2:'rgba(180,60,40,0.48)'  },
  { id:'leak',          name:'Leak Bali',               emoji:'🦇', rarity:'epic',      borderImg:'/image/b52.png',
    glow:'rgba(20,180,20,0.88)',   glow2:'rgba(180,20,20,0.48)'   },
  { id:'toba',           name:'Danau Toba',               emoji:'🏞️', rarity:'epic',      borderImg:'/image/b12.png',
    glow:'rgba(30,80,180,0.88)',   glow2:'rgba(40,120,60,0.48)'  },
  { id:'bromo',          name:'Bromo Sang Penjaga',       emoji:'🌋', rarity:'epic',      borderImg:'/image/b11.png',
    glow:'rgba(220,100,30,0.88)',  glow2:'rgba(160,60,120,0.48)' },
  { id:'gamelan',        name:'Gamelan Jawa',             emoji:'🔔', rarity:'epic',      borderImg:'/image/b22.png',
    glow:'rgba(180,130,40,0.88)',  glow2:'rgba(120,20,20,0.48)'  },
  { id:'hantu',          name:'Hantu Nusantara',         emoji:'👻', rarity:'epic',      borderImg:'/image/b55.png',
    glow:'rgba(80,20,120,0.88)',   glow2:'rgba(20,160,80,0.48)'   },
  { id:'likurai',        name:'Festival Likurai',         emoji:'⛵', rarity:'epic',      borderImg:'/image/b50.png',
    glow:'rgba(40,20,20,0.88)',    glow2:'rgba(180,140,20,0.48)' },
  { id:'manene',         name:"Ma'nene Toraja",           emoji:'☠️', rarity:'epic',      borderImg:'/image/b20.png',
    glow:'rgba(200,180,100,0.88)', glow2:'rgba(160,20,20,0.48)'  },
  { id:'phoenix_rise',   name:'Garuda Wisnu Kencana',     emoji:'🗿', rarity:'epic',      borderImg:'/image/b3.png',
    glow:'rgba(200,160,80,0.88)',  glow2:'rgba(60,100,180,0.48)' },
  { id:'prambanan',      name:'Prambanan Senja',          emoji:'🛕', rarity:'epic',      borderImg:'/image/b13.png',
    glow:'rgba(220,130,40,0.88)',  glow2:'rgba(120,60,180,0.48)' },
  { id:'phinisi',        name:'Perahu Phinisi',           emoji:'🚤', rarity:'epic',      borderImg:'/image/b27.png',
    glow:'rgba(140,90,40,0.88)',   glow2:'rgba(20,80,160,0.48)'  },
  { id:'wejang',         name:'Boneka Wejang',            emoji:'🎎', rarity:'epic',      borderImg:'/image/b29.png',
    glow:'rgba(160,100,40,0.88)',  glow2:'rgba(20,60,160,0.48)'  },
  { id:'pasola',         name:'Festival Pasola',          emoji:'🎋', rarity:'epic',      borderImg:'/image/b47.png',
    glow:'rgba(200,20,20,0.88)',   glow2:'rgba(40,100,40,0.48)'  },
  { id:'dayak',          name:'Dayak Ngaju',              emoji:'🗡️', rarity:'epic',      borderImg:'/image/b17.png',
    glow:'rgba(200,20,20,0.88)',   glow2:'rgba(180,180,180,0.45)'},
  { id:'star_student',   name:'Batik Mega Mendung',       emoji:'🎨', rarity:'epic',      borderImg:'/image/b4.png',
    glow:'rgba(40,80,180,0.88)',   glow2:'rgba(160,60,30,0.48)'  },
  { id:'team_player',    name:'Rumah Gadang Minangkabau', emoji:'🏺', rarity:'epic',      borderImg:'/image/b9.png',
    glow:'rgba(180,30,30,0.88)',   glow2:'rgba(180,150,40,0.48)' },
  { id:'sumpah',         name:'Sumpah Pemuda',            emoji:'🤝', rarity:'epic',      borderImg:'/image/b46.png',
    glow:'rgba(200,20,20,0.88)',   glow2:'rgba(20,60,180,0.48)'  },
  // b70 — Tari Kembang Goyang + Kawah Ijen: api biru, kuning belerang, merah, emas, hitam, putih
  { id:'kembang_ijen',   name:'Kembang Goyang + Ijen',    emoji:'💃', rarity:'epic',      borderImg:'/image/b70.png',
    glow:'rgba(20,160,255,0.92)',  glow2:'rgba(200,180,20,0.52)' },
  // ── RARE ─────────────────────────────────────────────────────
  { id:'galaxy_brain',   name:'Candi Borobudur',          emoji:'🏯', rarity:'rare',      borderImg:'/image/b2.png',
    glow:'rgba(180,200,140,0.82)', glow2:'rgba(80,120,80,0.42)'  },
  { id:'diamond_mind',   name:'Keris Pusaka',             emoji:'🗡️', rarity:'rare',      borderImg:'/image/b6.png',
    glow:'rgba(180,180,200,0.82)', glow2:'rgba(140,100,20,0.42)' },
  { id:'happy_face',     name:'Lembah Baliem Papua',      emoji:'🌊', rarity:'rare',      borderImg:'/image/b10.png',
    glow:'rgba(40,140,60,0.82)',   glow2:'rgba(120,70,20,0.42)'  },
  { id:'bambu',          name:'Bambu Runcing',            emoji:'🎋', rarity:'rare',      borderImg:'/image/b23.png',
    glow:'rgba(60,140,40,0.82)',   glow2:'rgba(160,20,20,0.42)'  },
  { id:'serabi',         name:'Tari Topeng Cirebon + Pantai',emoji:'🎭', rarity:'rare',      borderImg:'/image/b40.png',
    glow:'rgba(180,20,20,0.85)',   glow2:'rgba(20,80,180,0.45)'   },
  { id:'mrapen',         name:'Api Abadi Mrapen',         emoji:'🔥', rarity:'rare',      borderImg:'/image/b30.png',
    glow:'rgba(40,120,255,0.82)',  glow2:'rgba(220,120,20,0.42)' },
  { id:'kemerdekaan',    name:'Hari Kemerdekaan RI',      emoji:'🎆', rarity:'rare',      borderImg:'/image/b42.png',
    glow:'rgba(220,20,20,0.82)',   glow2:'rgba(200,160,20,0.42)' },
  { id:'tumpeng',        name:'Tari Pendet + Ombak',        emoji:'💃', rarity:'rare',      borderImg:'/image/b33.png',
    glow:'rgba(20,140,200,0.85)',  glow2:'rgba(200,160,20,0.45)'  },
  { id:'sate',           name:'Tari Likurai + Perahu Layar', emoji:'💃', rarity:'rare',      borderImg:'/image/b34.png',
    glow:'rgba(20,20,40,0.85)',    glow2:'rgba(180,20,20,0.45)'   },
  { id:'rawon',          name:'Tari Katuri + Pantai Bira',   emoji:'💃', rarity:'rare',      borderImg:'/image/b35.png',
    glow:'rgba(200,160,20,0.85)',  glow2:'rgba(20,100,180,0.45)'  },
  { id:'rendang',        name:'Tari Balumpa + Phinisi',      emoji:'💃', rarity:'rare',      borderImg:'/image/b36.png',
    glow:'rgba(200,140,20,0.85)',  glow2:'rgba(20,80,160,0.45)'   },
  { id:'esteler',        name:'Tari Sampi + Terumbu Karang', emoji:'💃', rarity:'rare',      borderImg:'/image/b37.png',
    glow:'rgba(20,180,180,0.85)',  glow2:'rgba(20,160,60,0.45)'   },
  { id:'gudeg',          name:'Tari Merak Putih + Laut',     emoji:'🦚', rarity:'rare',      borderImg:'/image/b38.png',
    glow:'rgba(220,220,220,0.88)', glow2:'rgba(20,120,180,0.48)'  },
  { id:'pempek',         name:'Tari Jaripah + Laut',         emoji:'��', rarity:'rare',      borderImg:'/image/b39.png',
    glow:'rgba(180,20,20,0.85)',   glow2:'rgba(20,120,180,0.45)'  },
  { id:'lumpia',         name:'Tari Sintren + Parangtritis', emoji:'💃', rarity:'rare',      borderImg:'/image/b41.png',
    glow:'rgba(120,20,180,0.85)',  glow2:'rgba(20,80,180,0.45)'   },
  { id:'kartini',        name:'Hari Kartini',             emoji:'👩‍🎓', rarity:'rare',      borderImg:'/image/b43.png',
    glow:'rgba(200,160,60,0.82)',  glow2:'rgba(160,60,20,0.42)'  },
  { id:'kebangkitan',    name:'Kebangkitan Nasional',     emoji:'🦅', rarity:'rare',      borderImg:'/image/b44.png',
    glow:'rgba(220,20,20,0.82)',   glow2:'rgba(200,160,20,0.42)' },
  { id:'pahlawan',       name:'Hari Pahlawan',            emoji:'🛡️', rarity:'rare',      borderImg:'/image/b45.png',
    glow:'rgba(180,20,20,0.82)',   glow2:'rgba(180,140,20,0.42)' },
  { id:'gajah',          name:'Gajah Sumatera',           emoji:'🐘', rarity:'rare',      borderImg:'/image/b25.png',
    glow:'rgba(140,120,100,0.82)', glow2:'rgba(40,100,40,0.42)'  },
  { id:'anggrek',        name:'Anggrek Hitam',            emoji:'🌸', rarity:'rare',      borderImg:'/image/b26.png',
    glow:'rgba(120,40,180,0.82)',  glow2:'rgba(20,80,20,0.42)'   },
  { id:'harimau',        name:'Harimau Jawa',             emoji:'🐅', rarity:'rare',      borderImg:'/image/b24.png',
    glow:'rgba(220,100,20,0.82)',  glow2:'rgba(20,80,20,0.42)'   },
  { id:'sukuh',          name:'Candi Sukuh',              emoji:'🏯', rarity:'rare',      borderImg:'/image/b19.png',
    glow:'rgba(160,140,80,0.82)',  glow2:'rgba(60,80,40,0.42)'   },
  { id:'megalitik',      name:'Batu Megalitikum',         emoji:'🗿', rarity:'rare',      borderImg:'/image/b28.png',
    glow:'rgba(120,120,100,0.82)', glow2:'rgba(40,80,40,0.42)'   },
  { id:'joglo',          name:'Rumah Joglo',              emoji:'🏠', rarity:'rare',      borderImg:'/image/b72.png',
    glow:'rgba(140,80,20,0.82)',   glow2:'rgba(200,160,20,0.42)'  },
  // ── PERMANENT FREE ────────────────────────────────────────────
  // b73 = gratis untuk semua siswa, auto-diberikan saat pertama login
  { id:'nusantara_free', name:'Nusantara Classic',        emoji:'🇮🇩', rarity:'permanent', borderImg:'/image/b73.png',
    glow:'rgba(200,20,20,0.88)',   glow2:'rgba(200,160,20,0.52)'  },
  // ── ZONK ──────────────────────────────────────────────────────
  { id:'zonk_rock',  name:'Batu Keberuntungan', emoji:'🪨', rarity:'zonk', borderImg:null, glow:null, glow2:null },
  { id:'zonk_snail', name:'Siput Pelan',        emoji:'🐌', rarity:'zonk', borderImg:null, glow:null, glow2:null },
  { id:'zonk_cloud', name:'Awan Kosong',        emoji:'☁️', rarity:'zonk', borderImg:null, glow:null, glow2:null },
  { id:'zonk_leaf',  name:'Daun Kering',        emoji:'🍂', rarity:'zonk', borderImg:null, glow:null, glow2:null },
  { id:'zonk_sock',  name:'Kaos Kaki Bolong',   emoji:'🧦', rarity:'zonk', borderImg:null, glow:null, glow2:null },
]

// ─── CONFETTI ─────────────────────────────────────────────────
function Confetti({ color, run }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!run) return
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    c.width = 500; c.height = 500
    const pts = Array.from({ length: 80 }, () => ({
      x:250, y:250,
      vx:(Math.random()-0.5)*22, vy:(Math.random()-0.5)*22-5,
      r:Math.random()*6+2, a:1, rot:Math.random()*6.28,
      rv:(Math.random()-0.5)*0.2,
      col:Math.random()>0.4?color:'#fff',
      shape:['circle','rect','tri'][Math.floor(Math.random()*3)],
    }))
    let raf
    const tick = () => {
      ctx.clearRect(0,0,500,500)
      let alive=false
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.35; p.a-=0.013; p.rot+=p.rv
        if(p.a<=0) return; alive=true
        ctx.save(); ctx.globalAlpha=p.a; ctx.fillStyle=p.col
        ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.beginPath()
        if(p.shape==='circle'){ctx.arc(0,0,p.r,0,6.28)}
        else if(p.shape==='rect'){ctx.rect(-p.r,-p.r*0.5,p.r*2,p.r)}
        else{ctx.moveTo(0,-p.r);ctx.lineTo(p.r,p.r);ctx.lineTo(-p.r,p.r)}
        ctx.closePath(); ctx.fill(); ctx.restore()
      })
      if(alive) raf=requestAnimationFrame(tick)
    }
    raf=requestAnimationFrame(tick)
    return ()=>cancelAnimationFrame(raf)
  },[run,color])
  return <canvas ref={ref} className="absolute pointer-events-none"
    style={{width:500,height:500,left:'50%',top:'50%',transform:'translate(-50%,-50%)',zIndex:2}}/>
}

// ─── BADGE OVERLAY ────────────────────────────────────────────
export function BadgeOverlay({ badgeId, badges=[], size='md' }) {
  const badgeFromResponse = badges.find(b => b.id === badgeId)
  const badgeFromPool     = BADGE_POOL.find(b => b.id === badgeId)
  const badge = badgeFromPool
    ? { ...badgeFromPool, ...(badgeFromResponse || {}) }
    : badgeFromResponse
  if (!badge || !badge.borderImg) return null
  const cfg   = RARITY_CFG[badge.rarity] || RARITY_CFG.legendary
  const glow  = badge.glow  || cfg.glow
  const glow2 = badge.glow2 || cfg.glow2
  const scale = { sm:1.45, md:1.45, lg:1.45 }[size] ?? 1.45
  return (
    <motion.img
      src={badge.borderImg}
      alt={badge.name}
      className="absolute pointer-events-none select-none"
      style={{
        top:'50%', left:'50%',
        transform:`translate(-50%,-50%) scale(${scale})`,
        width:'100%', height:'100%',
        objectFit:'contain', zIndex:20,
      }}
      animate={{ filter:[
        `drop-shadow(0 0 6px ${glow2})`,
        `drop-shadow(0 0 18px ${glow}) drop-shadow(0 0 8px ${glow2})`,
        `drop-shadow(0 0 6px ${glow2})`,
      ]}}
      transition={{ repeat:Infinity, duration:2.6, ease:'easeInOut' }}
    />
  )
}

// ─── BADGE CIRCLE (preview kecil di GiftBox) ──────────────────
function BadgeCircle({ borderImg, emoji, rarity, size, delay }) {
  const cfg = RARITY_CFG[rarity]
  return (
    <motion.div
      className="relative flex items-center justify-center rounded-full select-none flex-shrink-0 overflow-hidden"
      style={{
        width:size, height:size,
        background:cfg.gradBtn,
        boxShadow:`0 4px 14px ${cfg.glow2}, 0 0 0 2px ${cfg.particle}44`,
      }}
      animate={{
        y:[0,-7,0], scale:[1,1.07,1],
        boxShadow:[
          `0 4px 14px ${cfg.glow2}, 0 0 0 2px ${cfg.particle}44`,
          `0 10px 26px ${cfg.glow}, 0 0 0 3px ${cfg.particle}88`,
          `0 4px 14px ${cfg.glow2}, 0 0 0 2px ${cfg.particle}44`,
        ],
      }}
      transition={{repeat:Infinity,duration:2.2,delay,ease:'easeInOut'}}>
      {borderImg
        ? <img src={borderImg} alt={emoji} className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" style={{borderRadius:'inherit'}}/>
        : <span style={{fontSize:size*0.44}}>{emoji}</span>
      }
    </motion.div>
  )
}

// ─── GIFT BOX ─────────────────────────────────────────────────
function GiftBox({ canRoll, rolling, onClick, isDark }) {
  return (
    <div className="flex flex-col items-center gap-4 select-none w-full">
      <div className="relative mx-auto" style={{width:300,height:240}}>
        {canRoll && (
          <motion.div animate={{opacity:[0.06,0.16,0.06]}} transition={{repeat:Infinity,duration:3.5,ease:'easeInOut'}}
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{background:'radial-gradient(ellipse at 50% 65%, rgba(180,140,60,0.35) 0%, transparent 70%)'}}/>
        )}
        {canRoll && !rolling && [
          {l:20,t:28,s:2,d:0},{l:265,t:22,s:3,d:0.8},
          {l:10,t:155,s:2,d:1.3},{l:280,t:150,s:2,d:0.5},
          {l:145,t:6,s:3,d:1.0},{l:55,t:208,s:2,d:1.6},
          {l:238,t:202,s:2,d:0.3},{l:22,t:90,s:2,d:1.9},
          {l:270,t:88,s:2,d:0.7},
        ].map((sp,i)=>(
          <motion.div key={i} className="absolute rounded-full pointer-events-none"
            style={{width:sp.s,height:sp.s,left:sp.l,top:sp.t,
              background:i%3===0?'rgba(255,200,80,0.7)':i%3===1?'rgba(200,160,60,0.6)':'rgba(255,255,255,0.4)'}}
            animate={{opacity:[0,0.8,0],scale:[0.5,1.4,0.5]}}
            transition={{repeat:Infinity,duration:2+i*0.18,delay:sp.d}}/>
        ))}
        <div className="absolute" style={{left:'50%',top:0,transform:'translateX(-50%)'}}>
          <BadgeCircle borderImg="/image/b1.png" emoji="🐉" rarity="legendary" size={48} delay={0}/>
        </div>
        <div className="absolute" style={{left:8,top:55}}>
          <BadgeCircle borderImg="/image/b7.png" emoji="🦂" rarity="rare" size={42} delay={0.5}/>
        </div>
        <div className="absolute" style={{right:8,top:55}}>
          <BadgeCircle borderImg="/image/b4.png" emoji="🦁" rarity="epic" size={42} delay={0.2}/>
        </div>
        <div className="absolute" style={{left:16,bottom:16}}>
          <BadgeCircle borderImg="/image/b10.png" emoji="🐅" rarity="common" size={36} delay={1.0}/>
        </div>
        <div className="absolute" style={{right:16,bottom:16}}>
          <BadgeCircle borderImg="/image/b5.png" emoji="🧊" rarity="epic" size={36} delay={0.7}/>
        </div>
        <div className="absolute" style={{left:'50%',top:'50%',transform:'translate(-50%,-44%)'}}>
          {canRoll && (
            <motion.div animate={{scaleX:[1,1.4,1],opacity:[0.15,0.4,0.15]}}
              transition={{repeat:Infinity,duration:2.8,ease:'easeInOut'}}
              className="absolute pointer-events-none"
              style={{bottom:-4,left:'50%',transform:'translateX(-50%)',
                width:100,height:8,borderRadius:'50%',filter:'blur(8px)',
                background:'rgba(200,150,40,0.6)'}}/>
          )}
          <motion.button onClick={onClick} disabled={!canRoll||rolling}
            className="focus:outline-none block"
            style={{cursor:canRoll&&!rolling?'pointer':'not-allowed'}}
            animate={canRoll&&!rolling?{y:[0,-10,0]}:{y:0}}
            transition={canRoll&&!rolling?{repeat:Infinity,duration:2.8,ease:'easeInOut'}:{duration:0.2}}
            whileTap={canRoll&&!rolling?{scale:0.9}:{}}>
            <div className="relative" style={{width:120,height:130}}>
              {!rolling && canRoll && (
                <img src="/image/kotak1.png" alt="kotak kado"
                  className="w-full h-full object-contain select-none pointer-events-none"
                  style={{filter:'drop-shadow(0 8px 20px rgba(200,150,40,0.5)) drop-shadow(0 0 40px rgba(180,130,30,0.3))'}}/>
              )}
              {rolling && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div animate={{rotate:360,scale:[1,1.3,1]}}
                    transition={{rotate:{repeat:Infinity,duration:0.4,ease:'linear'},scale:{repeat:Infinity,duration:0.8}}}
                    className="w-full h-full">
                    <img src="/image/kotak2.png" alt="kotak terbuka"
                      className="w-full h-full object-contain"
                      style={{filter:'drop-shadow(0 0 24px rgba(255,200,60,0.9)) brightness(1.15)'}}/>
                  </motion.div>
                </div>
              )}
              {!canRoll && !rolling && (
                <div className="relative w-full h-full">
                  <img src="/image/kotak1.png" alt="kotak kado"
                    className="w-full h-full object-contain select-none"
                    style={{filter:'grayscale(1) opacity(0.3)'}}/>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <Lock size={16} className="text-slate-500"/>
                    <span className="text-[9px] text-slate-600 font-bold tracking-wider uppercase">Besok</span>
                  </div>
                </div>
              )}
            </div>
          </motion.button>
        </div>
      </div>
      {canRoll ? (
        <motion.div animate={{opacity:[0.5,1,0.5]}} transition={{repeat:Infinity,duration:2}}
          className="flex items-center gap-2 text-xs font-black tracking-[0.2em] uppercase"
          style={{color:'rgba(200,160,60,0.9)'}}>
          <Zap size={12} fill="currentColor"/> Buka Sekarang
        </motion.div>
      ) : (
        <p className="text-[11px] text-slate-600 dark:text-slate-500 font-medium tracking-wider uppercase">
          Sudah dibuka hari ini
        </p>
      )}
    </div>
  )
}
// --- REVEAL MODAL ---------------------------------------------
function RevealModal({ badge, onClose }) {
  const cfg   = RARITY_CFG[badge?.rarity] || RARITY_CFG.common
  const glow  = badge?.glow  || cfg.glow
  const glow2 = badge?.glow2 || cfg.glow2
  const [phase, setPhase] = useState('box')
  const [burst, setBurst]  = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('question'), 700)
    const t2 = setTimeout(() => { setPhase('reveal'); setBurst(true) }, 1600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{background:'rgba(0,0,5,0.97)',backdropFilter:'blur(24px)'}}>

      <AnimatePresence>
        {phase==='reveal' && (
          <motion.div initial={{scaleY:0,opacity:0}} animate={{scaleY:1,opacity:1}} exit={{opacity:0}}
            transition={{duration:0.8,ease:'easeOut'}}
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{width:300,height:'60%',transformOrigin:'top center',
              background:`linear-gradient(to bottom, ${glow}22 0%, transparent 100%)`}}/>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <Confetti color={glow} run={burst}/>
      </div>

      <motion.div initial={{scale:0.4,opacity:0,y:60}} animate={{scale:1,opacity:1,y:0}}
        exit={{scale:0.95,opacity:0,y:-20}}
        transition={{type:'spring',stiffness:160,damping:18,delay:0.04}}
        className="relative w-full max-w-[320px] mx-auto rounded-2xl overflow-hidden"
        onClick={e=>e.stopPropagation()}
        style={{
          background:`linear-gradient(160deg, #020205 0%, #08080f 50%, #020205 100%)`,
          boxShadow:`0 0 0 1px ${glow}44, 0 0 80px ${glow2}, 0 40px 80px rgba(0,0,0,0.95)`,
        }}>

        <div className="h-[2px]" style={{background:`linear-gradient(90deg,transparent,${glow},transparent)`}}/>

        <div className="relative px-6 pt-5 pb-2 text-center overflow-hidden">
          <motion.div animate={{x:['-100%','220%']}}
            transition={{repeat:Infinity,duration:3.5,ease:'linear',repeatDelay:2.5}}
            className="absolute inset-0 w-1/3 skew-x-12 pointer-events-none"
            style={{background:`linear-gradient(90deg,transparent,${glow}18,transparent)`}}/>
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            {Array.from({length:cfg.stars}).map((_,i)=>(
              <motion.span key={i} initial={{scale:0,y:10}} animate={{scale:1,y:0}}
                transition={{delay:0.08*i,type:'spring',stiffness:400}}
                className="text-sm" style={{color:glow,textShadow:`0 0 10px ${glow}`}}>?</motion.span>
            ))}
          </div>
          <p className="text-[10px] font-black tracking-[0.45em] uppercase"
            style={{color:glow,textShadow:`0 0 16px ${glow2}`}}>{cfg.label}</p>
        </div>

        <div className="relative flex items-center justify-center" style={{height:230}}>
          <motion.div animate={{scale:[1,1.15,1],opacity:[0.12,0.28,0.12]}}
            transition={{repeat:Infinity,duration:3,ease:'easeInOut'}}
            className="absolute w-56 h-56 rounded-full pointer-events-none"
            style={{background:`radial-gradient(circle, ${glow} 0%, transparent 70%)`}}/>

          <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:12,ease:'linear'}}
            className="absolute w-52 h-52 rounded-full pointer-events-none"
            style={{background:`conic-gradient(${glow}22, transparent 40%, ${glow}22 60%, transparent 100%)`}}/>

          {phase==='box' && (
            <motion.div animate={{scale:[0.95,1.05,0.98,1.02,1],rotate:[0,-4,4,-2,0]}}
              transition={{duration:0.7,ease:'easeOut'}}
              className="relative z-10 w-32 h-32">
              <img src="/image/kotak2.png" alt="kotak"
                className="w-full h-full object-contain"
                style={{filter:`drop-shadow(0 0 20px ${glow}) brightness(1.1)`}}/>
            </motion.div>
          )}

          {phase==='question' && (
            <motion.div initial={{scale:0,y:20}} animate={{scale:1,y:0}}
              transition={{type:'spring',stiffness:280,damping:14}}
              className="relative z-10 select-none font-black text-white"
              style={{fontSize:96,lineHeight:1,textShadow:`0 0 30px ${glow2}`}}>?</motion.div>
          )}

          {phase==='reveal' && (
            <motion.div initial={{scale:0.1,opacity:0,rotate:-15}} animate={{scale:1,opacity:1,rotate:0}}
              transition={{type:'spring',stiffness:180,damping:13}}
              className="relative z-10 flex items-center justify-center"
              style={{width:175,height:175}}>
              <div className="absolute inset-0 rounded-full"
                style={{background:`radial-gradient(circle, ${glow}18 0%, transparent 70%)`}}/>
              {badge.borderImg && (
                <motion.img src={badge.borderImg} alt={badge.name}
                  className="absolute pointer-events-none select-none"
                  style={{top:'50%',left:'50%',transform:'translate(-50%,-50%) scale(1.45)',
                    width:'100%',height:'100%',objectFit:'contain',zIndex:10}}
                  animate={{filter:[
                    `drop-shadow(0 0 10px ${glow2})`,
                    `drop-shadow(0 0 28px ${glow}) drop-shadow(0 0 12px ${glow2})`,
                    `drop-shadow(0 0 10px ${glow2})`,
                  ]}}
                  transition={{repeat:Infinity,duration:2.2,ease:'easeInOut'}}/>
              )}
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {phase==='reveal' && (
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
              className="px-6 pb-2 text-center">
              <p className="text-xl font-black text-white tracking-tight">{badge.name}</p>
              <p className="text-[11px] mt-1" style={{color:`${glow}88`}}>
                Border baru aktif di profilmu
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase==='reveal' && (
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
              className="px-5 pt-2 pb-5">
              <motion.button whileTap={{scale:0.97}} onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-black text-white tracking-widest uppercase"
                style={{
                  background:`linear-gradient(135deg, ${glow}cc 0%, ${glow}66 100%)`,
                  boxShadow:`0 4px 24px ${glow2}, 0 0 0 1px ${glow}44`,
                }}>
                Lihat Border
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-[1px]" style={{background:`linear-gradient(90deg,transparent,${glow2},transparent)`}}/>
      </motion.div>
    </motion.div>
  )
}

// --- EQUIP DIALOG ---------------------------------------------
function EquipDialog({ badge, onEquip, onSkip, onClose, isDark }) {
  const cfg   = RARITY_CFG[badge?.rarity] || RARITY_CFG.common
  const glow  = badge?.glow  || cfg.glow
  const glow2 = badge?.glow2 || cfg.glow2
  const [loading, setLoading] = useState(false)
  const handleClose = onClose || onSkip

  const handleEquip = async () => {
    setLoading(true)
    try {
      await siswaApi.equipBadge(badge.id)
      onEquip(badge.id)
      toast.success(`${badge.name} terpasang!`)
      handleClose()
    } catch { toast.error('Gagal memasang border') }
    finally { setLoading(false) }
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{background:'rgba(0,0,0,0.8)',backdropFilter:'blur(16px)'}}
      onClick={handleClose}>
      <motion.div initial={{y:60,opacity:0,scale:0.96}} animate={{y:0,opacity:1,scale:1}}
        exit={{y:40,opacity:0}}
        transition={{type:'spring',stiffness:220,damping:24}}
        className="w-full max-w-sm rounded-2xl overflow-hidden relative"
        onClick={e=>e.stopPropagation()}
        style={{
          background:'linear-gradient(160deg,#060608,#0e0c14)',
          boxShadow:`0 0 0 1px ${glow}33, 0 20px 60px rgba(0,0,0,0.7), 0 0 50px ${glow2}`,
        }}>
        <div className="h-[2px]" style={{background:`linear-gradient(90deg,transparent,${glow},transparent)`}}/>
        <button onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center"
          style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.35)'}}>
          <X size={12}/>
        </button>
        <div className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative flex-shrink-0" style={{width:68,height:68}}>
              <div className="w-full h-full rounded-full"
                style={{background:`radial-gradient(circle, ${glow}18 0%, transparent 70%)`,border:`1px solid ${glow}22`}}/>
              {badge.borderImg && (
                <motion.img src={badge.borderImg} alt={badge.name}
                  className="absolute pointer-events-none select-none"
                  style={{top:'50%',left:'50%',transform:'translate(-50%,-50%) scale(1.45)',
                    width:'100%',height:'100%',objectFit:'contain',zIndex:10}}
                  animate={{filter:[`drop-shadow(0 0 6px ${glow2})`,`drop-shadow(0 0 16px ${glow})`,`drop-shadow(0 0 6px ${glow2})`]}}
                  transition={{repeat:Infinity,duration:2.4,ease:'easeInOut'}}/>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black tracking-[0.35em] uppercase mb-1"
                style={{color:glow}}>{cfg.label}</p>
              <p className="text-base font-black text-white leading-tight">{badge.name}</p>
              <div className="flex gap-0.5 mt-1">
                {Array.from({length:cfg.stars}).map((_,i)=>(
                  <span key={i} className="text-[10px]" style={{color:glow}}>?</span>
                ))}
              </div>
            </div>
          </div>
          <div className="h-px mb-4" style={{background:`${glow}18`}}/>
          <p className="text-xs font-medium mb-4 text-center" style={{color:'rgba(255,255,255,0.35)'}}>
            Pasang border ini ke foto profilmu?
          </p>
          <div className="flex gap-2">
            <motion.button whileTap={{scale:0.97}} onClick={handleEquip} disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-black text-white tracking-widest uppercase disabled:opacity-50"
              style={{
                background:`linear-gradient(135deg, ${glow}cc 0%, ${glow}66 100%)`,
                boxShadow:`0 4px 20px ${glow2}, 0 0 0 1px ${glow}44`,
              }}>
              {loading ? '...' : 'Pasang'}
            </motion.button>
            <motion.button whileTap={{scale:0.97}} onClick={handleClose}
              className="px-5 py-3 rounded-xl text-sm font-semibold"
              style={{background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.3)',border:'1px solid rgba(255,255,255,0.07)'}}>
              Lewati
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// --- GACHA INLINE PANEL ---------------------------------------
function GachaInlinePanel({ canRoll, badges, activeId, rolling, nextLabel, isDark, onRoll, onToggle }) {
  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{
        background:canRoll
          ? th(isDark,'linear-gradient(160deg,#06050a,#0e0c18,#06050a)','linear-gradient(160deg,#f5f3ff,#ede9fe,#f5f3ff)')
          : th(isDark,'linear-gradient(160deg,#0c1018,#141c28,#0c1018)','linear-gradient(160deg,#f8fafc,#f1f5f9,#f8fafc)'),
        boxShadow:canRoll
          ? th(isDark,'0 0 0 1px rgba(200,160,60,0.2), 0 20px 60px rgba(0,0,0,0.5)','0 0 0 1px rgba(200,160,60,0.15), 0 20px 60px rgba(0,0,0,0.08)')
          : th(isDark,'0 0 0 1px rgba(71,85,105,0.2), 0 8px 32px rgba(0,0,0,0.3)','0 0 0 1px rgba(203,213,225,0.8), 0 8px 32px rgba(0,0,0,0.06)'),
      }}>
      <motion.div animate={canRoll?{opacity:[0.3,1,0.3]}:{opacity:0.15}} transition={{repeat:Infinity,duration:2.5}}
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{background:canRoll?'linear-gradient(90deg,transparent,rgba(200,160,60,0.8),transparent)':'linear-gradient(90deg,transparent,rgba(71,85,105,0.4),transparent)'}}/>
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{background:canRoll?th(isDark,'rgba(200,160,60,0.12)','rgba(200,160,60,0.08)'):th(isDark,'rgba(71,85,105,0.15)','rgba(203,213,225,0.5)'),
              border:`1px solid ${canRoll?th(isDark,'rgba(200,160,60,0.3)','rgba(200,160,60,0.2)'):th(isDark,'rgba(71,85,105,0.25)','rgba(203,213,225,0.8)')}`}}>
            {canRoll ? <Gift size={18} style={{color:'rgba(200,160,60,0.9)'}}/> : <Lock size={18} className="text-slate-400"/>}
          </div>
          {canRoll && <motion.span animate={{scale:[1,1.4,1],opacity:[0.7,1,0.7]}} transition={{repeat:Infinity,duration:1.1}}
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500"
            style={{border:`2px solid ${th(isDark,'#06050a','#f5f3ff')}`}}/>}
        </div>
        <div>
          <p className={`text-sm font-black ${th(isDark,'text-white','text-slate-800')}`}>Gacha Harian</p>
          <p className="text-[10px] font-medium"
            style={{color:canRoll?th(isDark,'rgba(200,160,60,0.8)','rgba(160,120,30,0.9)'):th(isDark,'rgba(100,116,139,0.7)','rgba(100,116,139,0.8)')}}>
            {canRoll ? '? Hadiahmu menunggu hari ini!' : `Tersedia lagi pukul ${nextLabel}`}
          </p>
        </div>
      </div>
      <div className="flex justify-center px-5 py-4">
        <GiftBox canRoll={canRoll} rolling={rolling} onClick={onRoll} isDark={isDark}/>
      </div>
      {badges.length > 0 && (
        <div className="px-5 pb-5">
          <div className="flex flex-wrap gap-2">
            {badges.map(badge => {
              const cfg = RARITY_CFG[badge.rarity] || RARITY_CFG.common
              const pool = BADGE_POOL.find(b => b.id === badge.id)
              const glow = pool?.glow || cfg.glow
              const isActive = activeId === badge.id
              return (
                <motion.button key={badge.id} whileTap={{scale:0.88}}
                  onClick={() => onToggle(badge)}
                  className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={isActive
                    ? {background:`linear-gradient(135deg,${glow}cc,${glow}66)`,border:`1px solid ${glow}66`,color:'#fff',boxShadow:`0 0 16px ${glow}44`}
                    : {background:th(isDark,'rgba(255,255,255,0.04)','rgba(0,0,0,0.04)'),
                       border:`1px solid ${th(isDark,'rgba(255,255,255,0.08)','rgba(0,0,0,0.08)')}`,
                       color:th(isDark,'rgba(255,255,255,0.4)','rgba(0,0,0,0.45)')}}>
                  <div className="relative w-5 h-5 rounded-md overflow-hidden flex-shrink-0"
                    style={{background:cfg.gradBtn}}>
                    {badge.borderImg && <img src={badge.borderImg} alt="" className="absolute inset-0 w-full h-full object-cover"/>}
                  </div>
                  <span>{badge.name}</span>
                  {isActive && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
                    style={{border:`2px solid ${th(isDark,'#06050a','#f5f3ff')}`}}>
                    <span className="text-[8px] text-white font-black">?</span>
                  </span>}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// --- MAIN COMPONENT -------------------------------------------
export default function GachaHarian({ onBadgeChange, floating = false }) {
  const [status, setStatus]           = useState(null)
  const [rolling, setRolling]         = useState(false)
  const [result, setResult]           = useState(null)
  const [equipDialog, setEquipDialog] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [showPanel, setShowPanel]     = useState(false)
  const { isDark } = useThemeStore()

  useEffect(() => { fetchStatus() }, [])

  const fetchStatus = async () => {
    try {
      const res = await siswaApi.getGachaStatus()
      setStatus(res.data)
      onBadgeChange?.(res.data.active_badge ?? null, res.data.badges ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const handleRoll = async () => {
    if (rolling || !status?.can_roll) return
    setRolling(true)
    try {
      const res = await siswaApi.rollGacha()
      const d = res.data
      const badge = d.result ?? null
      const isZonk = d.is_zonk ?? false
      setStatus(prev => ({...prev, can_roll:false,
        badges: d.badges ?? prev?.badges ?? [],
        active_badge: d.active_badge ?? prev?.active_badge ?? null}))
      onBadgeChange?.(d.active_badge ?? null, d.badges ?? [])
      if (badge && !isZonk) {
        setResult(badge)
      } else if (badge && isZonk) {
        toast(`${badge.emoji} ${badge.name} � ${badge.desc || 'Coba lagi besok!'}`, { icon: badge.emoji })
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal membuka kotak')
    } finally { setRolling(false) }
  }

  const handleEquipFromModal = (badgeId) => {
    setStatus(prev => ({...prev, active_badge:badgeId}))
    onBadgeChange?.(badgeId, status?.badges ?? [])
  }

  const handleToggleBadge = async (badge) => {
    const isActive = status?.active_badge === badge.id
    try {
      if (isActive) {
        await siswaApi.unequipBadge()
        setStatus(prev => ({...prev, active_badge:null}))
        onBadgeChange?.(null, status?.badges ?? [])
        toast.success('Border dilepas')
      } else {
        await siswaApi.equipBadge(badge.id)
        setStatus(prev => ({...prev, active_badge:badge.id}))
        onBadgeChange?.(badge.id, status?.badges ?? [])
        toast.success(`${badge.name} terpasang!`)
      }
    } catch { toast.error('Gagal') }
  }

  if (loading) return null

  const canRoll  = !!status?.can_roll
  const badges   = status?.badges ?? []
  const activeId = status?.active_badge ?? null

  let nextLabel = 'besok'
  if (!canRoll && status?.next_roll_at) {
    try { nextLabel = new Date(status.next_roll_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) }
    catch { /**/ }
  }

  // -- FLOATING MODE --
  if (floating) {
    return (
      <>
        <AnimatePresence>
          {canRoll && !showPanel && (
            <motion.button key="float-btn"
              initial={{scale:0,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}}
              exit={{scale:0,opacity:0,y:20,transition:{duration:0.3}}}
              transition={{type:'spring',stiffness:260,damping:18}}
              onClick={() => setShowPanel(true)}
              className="fixed top-20 right-4 z-50 cursor-pointer select-none"
              title="Gacha Harian tersedia!">
              <motion.div animate={{y:[0,-8,0]}} transition={{repeat:Infinity,duration:2,ease:'easeInOut'}}>
                <div className="relative w-16 h-16">
                  <motion.div animate={{scale:[1,1.3,1],opacity:[0.6,0.2,0.6]}} transition={{repeat:Infinity,duration:2}}
                    className="absolute inset-0 rounded-2xl"
                    style={{background:'radial-gradient(circle, rgba(200,150,40,0.6) 0%, transparent 70%)'}}/>
                  <img src="/image/kotak.png" alt="kotak kado"
                    className="relative z-10 w-full h-full object-contain select-none pointer-events-none"
                    style={{filter:'drop-shadow(0 8px 16px rgba(200,150,40,0.6))'}}/>
                  <motion.span animate={{scale:[1,2,1],opacity:[1,0,1]}} transition={{repeat:Infinity,duration:1.5}}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-lg"/>
                </div>
                <motion.div animate={{opacity:[0.8,1,0.8]}} transition={{repeat:Infinity,duration:2}} className="mt-1 text-center">
                  <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1"
                    style={{background:'linear-gradient(135deg,#b45309,#92400e)',boxShadow:'0 2px 8px rgba(180,83,9,0.5)'}}>
                    <Gift size={9}/> BUKA!
                  </span>
                </motion.div>
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPanel && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPanel(false)}>
              <motion.div initial={{scale:0.85,y:30,opacity:0}} animate={{scale:1,y:0,opacity:1}}
                exit={{scale:0.85,y:30,opacity:0}}
                transition={{type:'spring',stiffness:280,damping:22}}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm relative">
                <button onClick={() => setShowPanel(false)}
                  className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-500 text-sm font-bold">
                  ?
                </button>
                <GachaInlinePanel canRoll={canRoll} badges={badges} activeId={activeId}
                  rolling={rolling} nextLabel={nextLabel} isDark={isDark}
                  onRoll={handleRoll} onToggle={handleToggleBadge}/>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && <RevealModal badge={result} isDark={isDark}
            onClose={() => { setResult(null); setEquipDialog(result) }}/>}
        </AnimatePresence>
        <AnimatePresence>
          {equipDialog && <EquipDialog badge={equipDialog} activeId={activeId} isDark={isDark}
            onEquip={handleEquipFromModal} onClose={() => setEquipDialog(null)} onSkip={() => setEquipDialog(null)}/>}
        </AnimatePresence>
      </>
    )
  }

  // -- INLINE MODE --
  return (
    <>
      <div className="relative rounded-2xl overflow-hidden"
        style={{
          background:canRoll
            ? th(isDark,'linear-gradient(160deg,#06050a,#0e0c18,#06050a)','linear-gradient(160deg,#f5f3ff,#ede9fe,#f5f3ff)')
            : th(isDark,'linear-gradient(160deg,#0c1018,#141c28,#0c1018)','linear-gradient(160deg,#f8fafc,#f1f5f9,#f8fafc)'),
          boxShadow:canRoll
            ? th(isDark,'0 0 0 1px rgba(200,160,60,0.2), 0 20px 60px rgba(0,0,0,0.5)','0 0 0 1px rgba(200,160,60,0.15), 0 20px 60px rgba(0,0,0,0.08)')
            : th(isDark,'0 0 0 1px rgba(71,85,105,0.2), 0 8px 32px rgba(0,0,0,0.3)','0 0 0 1px rgba(203,213,225,0.8), 0 8px 32px rgba(0,0,0,0.06)'),
        }}>
        <motion.div animate={canRoll?{opacity:[0.3,1,0.3]}:{opacity:0.15}} transition={{repeat:Infinity,duration:2.5}}
          className="absolute top-0 inset-x-0 h-px pointer-events-none"
          style={{background:canRoll?'linear-gradient(90deg,transparent,rgba(200,160,60,0.8),transparent)':'linear-gradient(90deg,transparent,rgba(71,85,105,0.4),transparent)'}}/>

        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{background:canRoll?th(isDark,'rgba(200,160,60,0.12)','rgba(200,160,60,0.08)'):th(isDark,'rgba(71,85,105,0.15)','rgba(203,213,225,0.5)'),
                border:`1px solid ${canRoll?th(isDark,'rgba(200,160,60,0.3)','rgba(200,160,60,0.2)'):th(isDark,'rgba(71,85,105,0.25)','rgba(203,213,225,0.8)')}`}}>
              {canRoll ? <Gift size={18} style={{color:'rgba(200,160,60,0.9)'}}/> : <Lock size={18} className="text-slate-400"/>}
            </div>
            {canRoll && <motion.span animate={{scale:[1,1.4,1],opacity:[0.7,1,0.7]}} transition={{repeat:Infinity,duration:1.1}}
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500"
              style={{border:`2px solid ${th(isDark,'#06050a','#f5f3ff')}`}}/>}
          </div>
          <div>
            <p className={`text-sm font-black ${th(isDark,'text-white','text-slate-800')}`}>Gacha Harian</p>
            <p className="text-[10px] font-medium"
              style={{color:canRoll?th(isDark,'rgba(200,160,60,0.8)','rgba(160,120,30,0.9)'):th(isDark,'rgba(100,116,139,0.7)','rgba(100,116,139,0.8)')}}>
              {canRoll ? '? Hadiahmu menunggu hari ini!' : `Tersedia lagi pukul ${nextLabel}`}
            </p>
          </div>
          <div className="ml-auto px-2.5 py-1 rounded-full"
            style={{background:th(isDark,'rgba(255,255,255,0.04)','rgba(0,0,0,0.04)'),
              border:`1px solid ${th(isDark,'rgba(255,255,255,0.07)','rgba(0,0,0,0.08)')}`}}>
            <span className="text-[10px] font-bold" style={{color:th(isDark,'rgba(255,255,255,0.2)','rgba(0,0,0,0.25)')}}> 1� / hari</span>
          </div>
        </div>

        <div className="flex justify-center px-5 py-4">
          <GiftBox canRoll={canRoll} rolling={rolling} onClick={handleRoll} isDark={isDark}/>
        </div>

        {badges.length > 0 && (
          <div className="px-5 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1" style={{background:th(isDark,'rgba(255,255,255,0.05)','rgba(0,0,0,0.06)')}}/>
              <span className="text-[10px] font-bold uppercase tracking-widest"
                style={{color:th(isDark,'rgba(255,255,255,0.15)','rgba(0,0,0,0.25)')}}>Koleksi Border</span>
              <div className="h-px flex-1" style={{background:th(isDark,'rgba(255,255,255,0.05)','rgba(0,0,0,0.06)')}}/>
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => {
                const cfg  = RARITY_CFG[badge.rarity] || RARITY_CFG.common
                const pool = BADGE_POOL.find(b => b.id === badge.id)
                const glow = pool?.glow || cfg.glow
                const isActive = activeId === badge.id
                return (
                  <motion.button key={badge.id} whileTap={{scale:0.88}}
                    onClick={() => handleToggleBadge(badge)}
                    title={`${badge.name} � ${cfg.label}${isActive?' (aktif)':''}`}
                    className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={isActive
                      ? {background:`linear-gradient(135deg,${glow}cc,${glow}66)`,border:`1px solid ${glow}66`,color:'#fff',boxShadow:`0 0 18px ${glow}44`}
                      : {background:th(isDark,'rgba(255,255,255,0.04)','rgba(0,0,0,0.04)'),
                         border:`1px solid ${th(isDark,'rgba(255,255,255,0.08)','rgba(0,0,0,0.08)')}`,
                         color:th(isDark,'rgba(255,255,255,0.4)','rgba(0,0,0,0.45)')}}>
                    <div className="relative w-5 h-5 rounded-md overflow-hidden flex-shrink-0"
                      style={{background:cfg.gradBtn}}>
                      {(pool?.borderImg || badge.borderImg) && (
                        <img src={pool?.borderImg || badge.borderImg} alt="" className="absolute inset-0 w-full h-full object-cover"/>
                      )}
                    </div>
                    <span className="hidden sm:inline">{badge.name}</span>
                    <span className={`text-[9px] font-black ${isActive?'text-white/70':cfg.text}`}>{cfg.short}</span>
                    {isActive && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
                        style={{border:`2px solid ${th(isDark,'#06050a','#f5f3ff')}`}}>
                        <span className="text-[8px] text-white font-black">?</span>
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
          style={{background:'linear-gradient(90deg,transparent,rgba(200,160,60,0.2),transparent)'}}/>
      </div>

      <AnimatePresence>
        {result && (
          <RevealModal badge={result} onClose={() => {
            const b = result; setResult(null)
            setTimeout(() => setEquipDialog(b), 50)
          }}/>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {equipDialog && (
          <EquipDialog badge={equipDialog} isDark={isDark}
            onEquip={badgeId => { handleEquipFromModal(badgeId); setEquipDialog(null) }}
            onSkip={() => setEquipDialog(null)}/>
        )}
      </AnimatePresence>
    </>
  )
}
