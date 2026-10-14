"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Axis3d,
  Check,
  ChevronDown,
  Cog,
  Droplets,
  Flame,
  Handshake,
  Layers,
  Mail,
  MapPin,
  Menu,
  PackageCheck,
  Phone,
  Ruler,
  Sparkles,
  Mountain,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Configurazione: solo dati verificati sul sito tecnomarmisrl.it    */
/* ------------------------------------------------------------------ */

const CONFIG = {
  ragione: "Tecnomarmi srl",
  indirizzo: "Via Piroleri, 27 · 31030 Altivole (TV) · Italia",
  telefono: "+39 0423 915466",
  telefonoHref: "tel:+390423915466",
  fax: "+39 0423 919901",
  email: "commerciale@tecnomarmisrl.it",
  sito: "https://tecnomarmisrl.it",
  /* Da fornire: lasciati vuoti, i link non vengono mostrati */
  piva: "",
  linkedin: "",
  /* Se valorizzato (es. endpoint Formspree) il form invia via POST, altrimenti mailto */
  formEndpoint: "",
};

const VIDEO_URL = "/media/hero-scrub.mp4";
const VIDEO_BYTES = 9113891;

/* I cinque gate dell'hero statico: identici alla custom variant `static-hero` in globals.css */
const GATES = [
  "(max-width: 720px)",
  "(orientation: portrait) and (max-width: 1024px)",
  "(orientation: portrait) and (pointer: coarse)",
  "(orientation: landscape) and (pointer: coarse) and (max-height: 560px)",
  "(prefers-reduced-motion: reduce)",
];

/* Bande del copy in progresso di scroll (valori di partenza, validati col flick test) */
const BANDS: { a: number; b: number; ramp?: number }[] = [
  { a: 0.0, b: 0.18 },
  { a: 0.22, b: 0.46 },
  { a: 0.5, b: 0.74 },
  { a: 0.79, b: 1.0, ramp: 0.06 },
];
/* Il film arriva a riposo al 90% dello scroll: l'ultimo tratto è la quiete del bagno finito */
const VIDEO_END = 0.9;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (p: number, e0: number, e1: number) => {
  const t = clamp((p - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ */
/*  Contenuti                                                          */
/* ------------------------------------------------------------------ */

const NAV = [
  { href: "#lavorazioni", label: "Lavorazioni" },
  { href: "#materioteca", label: "Materioteca" },
  { href: "#metodo", label: "Come lavoriamo" },
  { href: "#contatti", label: "Contatti" },
];

const TIPOLOGIE = [
  "Bagno",
  "Cucina",
  "Pavimenti e scale",
  "Contract",
  "Rivestimenti",
  "Mobili e complementi",
  "Altro",
];

type Tile = {
  id: string;
  title: string;
  tag: string;
  text: string;
  img: string;
  w: number;
  h: number;
  alt: string;
  span: string;
  illustrative: boolean;
  option: string;
};

const TILES: Tile[] = [
  {
    id: "bagni",
    title: "Bagni",
    tag: "Interior",
    text: "Rivestimenti, piani e vasche monolitiche in marmo, pietra e solid surface.",
    img: "/img/real-bagni.jpg",
    w: 2000,
    h: 1333,
    alt: "Bagno con rivestimento e doccia in marmo venato",
    span: "lg:col-span-7",
    illustrative: false,
    option: "Bagno",
  },
  {
    id: "cucine",
    title: "Cucine",
    tag: "Interior",
    text: "Top, isole e schienali in marmo, quarzo, Krion e pietra, con lavelli integrati.",
    img: "/img/real-cucine.jpg",
    w: 2000,
    h: 1333,
    alt: "Cucina nera con isola rivestita in marmo venato",
    span: "lg:col-span-5",
    illustrative: false,
    option: "Cucina",
  },
  {
    id: "scale",
    title: "Pavimenti e scale",
    tag: "Architettura",
    text: "Scale sospese, scalinate e pavimenti in pietra e marmo, anche intarsiati.",
    img: "/img/real-scale.jpg",
    w: 1800,
    h: 1200,
    alt: "Scala sospesa in pietra chiara con parapetto in vetro",
    span: "lg:col-span-5",
    illustrative: false,
    option: "Pavimenti e scale",
  },
  {
    id: "contract",
    title: "Contract",
    tag: "Ambienti speciali",
    text: "Hall, banchi bar e ambienti navali di lusso: pavimentazioni intarsiate e colonnati lavorati a 5 assi.",
    img: "/img/real-contract.jpg",
    w: 1200,
    h: 675,
    alt: "Pavimento in marmo intarsiato e scale retroilluminate in una hall navale",
    span: "lg:col-span-7",
    illustrative: false,
    option: "Contract",
  },
  {
    id: "rivestimenti",
    title: "Rivestimenti",
    tag: "Architettura",
    text: "Pareti in lastra con lavorazione a 45° per mantenere la continuità della vena.",
    img: "/img/gen-rivestimenti.jpg",
    w: 1920,
    h: 1280,
    alt: "Parete rivestita in lastre di marmo con venatura speculare",
    span: "lg:col-span-6",
    illustrative: true,
    option: "Rivestimenti",
  },
  {
    id: "mobili",
    title: "Mobili",
    tag: "Interior",
    text: "Mobili rivestiti in marmo alleggerito, con tecnologie che vanno dal honeycomb al carbonio.",
    img: "/img/gen-mobili.jpg",
    w: 1920,
    h: 1280,
    alt: "Consolle con piano in marmo venato su base grafite",
    span: "lg:col-span-6",
    illustrative: true,
    option: "Mobili e complementi",
  },
];

const TECH = [
  { icon: Droplets, label: "Taglio Waterjet", text: "Intarsi e geometrie complesse, lastra su lastra." },
  { icon: Axis3d, label: "Lavorazione a 5 assi", text: "Sagomature, colonne, bancali e zoccolature." },
  { icon: Flame, label: "Termoformatura", text: "Solid surface curvo, con saldature a scomparsa." },
  { icon: Layers, label: "Marmo alleggerito", text: "Pannelli con anime honeycomb e carbonio." },
];

type Material = {
  id: string;
  name: string;
  family: string;
  img: string;
  text: string;
  finishes: string;
  note: string;
};

const MATERIALS: Material[] = [
  {
    id: "pietra",
    name: "Pietra",
    family: "Materiale naturale",
    img: "/img/gen-pietra.jpg",
    text: "Materiale di base prevalentemente calcarea, molto comune nel nostro territorio. Molto usata in edilizia, ha trovato spazio anche nell'architettura dell'arredamento.",
    finishes: "Levigatura, bocciardatura, carteggiatura, rullatura, fiammatura, sabbiatura, spazzolatura.",
    note: "In ambienti ostili prevede sempre un trattamento di protezione.",
  },
  {
    id: "marmo",
    name: "Marmo",
    family: "Materiale naturale",
    img: "/img/gen-marmo.jpg",
    text: "Prodotto naturale a base calcarea o cristallina, si presta molto bene all'arredamento e ai complementi. Rispetto alla pietra, la lavorazione lucida rende meglio.",
    finishes: "Tutte le lavorazioni della pietra, più la finitura lucida.",
    note: "L'esposizione agli agenti atmosferici fa perdere nel tempo la brillantezza del lucido.",
  },
  {
    id: "granito",
    name: "Granito",
    family: "Materiale naturale",
    img: "/img/gen-granito.jpg",
    text: "Roccia intrusiva a struttura granulare, molto dura e resistente. Usata in edilizia, arredamento e arte funeraria, regge anche ambienti molto ostili.",
    finishes: "Tutte le lavorazioni dei materiali precedenti.",
    note: "Si consiglia sempre un trattamento di protezione.",
  },
  {
    id: "quarzo",
    name: "Agglomerato di quarzo",
    family: "Materiale composto",
    img: "/img/gen-quarzo.jpg",
    text: "Sabbie di silicio e quarzo con una percentuale di resina strutturale di poliestere. Usato soprattutto per piani cucina, top bagno e arredi per comunità.",
    finishes: "Lucido, levigato ed effetti materici.",
    note: "Di norma non viene trattato.",
  },
  {
    id: "solid",
    name: "Solid surface",
    family: "Materiale composto",
    img: "/img/gen-solid.jpg",
    text: "Miscele di minerali, resine acriliche o poliestere e pigmenti. Si può termoformare e ha un sistema di saldature a scomparsa: lavelli integrati e schienali in un solo corpo.",
    finishes: "Tutte le gradazioni di levigatura, senza mai arrivare a una lucidità elevata.",
    note: "Di norma non viene trattato. Molto apprezzato in ambiente medicale.",
  },
];

const STEPS = [
  {
    icon: Ruler,
    title: "Ascoltiamo il progetto",
    text: "Partiamo dal disegno e da ciò che serve a chi lo firma: misure, ambiente, materiali previsti, tempi del cantiere.",
  },
  {
    icon: Layers,
    title: "Scegliamo il materiale",
    text: "In materioteca mettiamo a confronto pietra, marmo, granito, quarzo e solid surface, con finiture e protezioni adatte all'uso.",
  },
  {
    icon: Cog,
    title: "Lavoriamo in laboratorio",
    text: "Taglio Waterjet, 5 assi, termoformatura e finitura: la forma prende vita nel laboratorio di Altivole.",
  },
  {
    icon: PackageCheck,
    title: "Controlliamo e consegniamo",
    text: "Verifichiamo il pezzo finito sul disegno e lo consegniamo a chi lo aspetta, in cantiere o in azienda.",
  },
];

const PILLARS = [
  {
    icon: Handshake,
    title: "Rapporto umano",
    text: "Creiamo sinergia con il cliente per ottenere il massimo dai progetti. A fine lavoro, ogni cliente diventa parte della nostra storia.",
  },
  {
    icon: Sparkles,
    title: "Tecnologia e innovazione",
    text: "Investiamo da sempre in macchinari e software di ultima generazione, con personale altamente specializzato.",
  },
  {
    icon: Mountain,
    title: "Territorio",
    text: "La passione per l'arte e la bellezza del nostro territorio, un'eccellenza che portiamo con impegno in tutto il mondo.",
  },
];

/* ------------------------------------------------------------------ */
/*  Primitive                                                          */
/* ------------------------------------------------------------------ */

const KICKER =
  "text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-stone/70 sm:text-xs";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className={`${KICKER} flex items-center gap-3`}>
      <span aria-hidden className="inline-block h-px w-8 bg-white/40 animate-breath [animation-delay:-2s]" />
      {children}
    </p>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
  y = 28,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

const BTN_BASE =
  "inline-flex min-h-12 whitespace-nowrap items-center justify-center gap-3 px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] transition-[background-color,color,border-color] duration-300 ease-soft";
const BTN_FULL = `${BTN_BASE} bg-white text-ink hover:bg-stone`;
const BTN_LINE = `${BTN_BASE} border border-white/60 text-white hover:border-white hover:bg-white/10`;

/* Parole con entrata scrub guidata da --k della banda */
function Words({
  text,
  kind,
  className = "",
  spread = 0.55,
}: {
  text: string;
  kind: "drift" | "rise";
  className?: string;
  spread?: number;
}) {
  const words = text.split(" ");
  const motionClass =
    kind === "drift"
      ? "[--kc:clamp(0,calc((var(--k,0)_-_var(--th,0))_*_2.8),1)] opacity-(--kc) [transform:translateY(calc((1_-_var(--kc))_*_-26px))]"
      : "[--kc:clamp(0,calc((var(--k,0)_-_var(--th,0))_*_3),1)] opacity-(--kc) [transform:translateY(calc((1_-_var(--kc))_*_30px))]";
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className={className}>
        {words.map((w, i) => (
          <span
            key={i}
            className={`inline-block will-change-transform ${motionClass}`}
            style={{ "--th": ((i / Math.max(1, words.length)) * spread).toFixed(3) } as React.CSSProperties}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function Header({ onCta }: { onCta: () => void }) {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = false;
    const onScroll = () => {
      const c = window.scrollY > 40;
      if (c !== last) {
        last = c;
        setCompact(c);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,padding] duration-500 ease-soft ${
        compact || open
          ? "border-white/10 bg-ink/90 py-2.5"
          : "border-transparent bg-gradient-to-b from-ink/70 to-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <a href="#top" aria-label="Tecnomarmi, torna all'inizio" className="shrink-0">
          <Image
            src="/brand/logo-bianco.webp"
            alt="Tecnomarmi. Nessun limite all'immaginazione"
            width={1088}
            height={178}
            sizes="(min-width:640px) 220px, 180px"
            priority
            className={`w-auto transition-[height] duration-500 ease-soft ${compact ? "h-6 sm:h-7" : "h-7 sm:h-9"}`}
          />
        </a>

        <nav aria-label="Principale" className="hidden items-center gap-9 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-xs font-semibold uppercase tracking-[0.22em] text-stone/80 transition-colors duration-300 hover:text-white"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#contatti"
            onClick={onCta}
            className={`hidden min-h-11 items-center bg-white px-5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-stone sm:inline-flex`}
          >
            Parliamo del vostro progetto
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Chiudi il menu" : "Apri il menu"}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex size-11 items-center justify-center border border-white/20 text-white lg:hidden"
          >
            {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Menu mobile" className="border-t border-white/10 bg-ink px-5 pb-6 pt-4 lg:hidden">
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center border-b border-white/10 text-sm font-semibold uppercase tracking-[0.22em] text-stone"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contatti"
            onClick={() => {
              setOpen(false);
              onCta();
            }}
            className={`${BTN_FULL} mt-5 w-full`}
          >
            Parliamo del vostro progetto
          </a>
        </nav>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero: il film in scrub                                             */
/* ------------------------------------------------------------------ */

const SCRIM_BAND =
  "pointer-events-none absolute inset-[-6%] opacity-[calc(.25_+_.75_*_var(--k,1))] bg-[radial-gradient(ellipse_74%_62%_at_32%_50%,rgba(16,18,20,.72)_0%,rgba(16,18,20,.5)_46%,rgba(16,18,20,0)_76%)]";
const BAND_BASE =
  "absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-[8vw] text-white [text-shadow:var(--shadow-tx)] group-data-[video=failed]/stage:hidden static-hero:hidden";

function HeroFilm({ onCta }: { onCta: () => void }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const bandRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    const ring = ringRef.current;
    if (!section || !stage || !video || !ring) return;
    const bands = bandRefs.current.filter(Boolean) as HTMLDivElement[];

    let scrubOn = false;
    let started = false;
    let heroOnScreen = true;
    let target = 0;
    let shown = 0;
    let rafId: number | null = null;
    let lastTick = 0;
    let seekBusy = false;
    let pendingTime: number | null = null;
    let loadK = 0;
    let loadRaf = 0;
    let ctrl: AbortController | null = null;
    let objectUrl = "";
    const cache = bands.map(() => ({ op: -1, k: -1, pe: "" }));

    const heroProgress = () => {
      const r = section.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      if (range <= 0) return 0;
      return clamp(-r.top / range, 0, 1);
    };

    /* ---- bande del copy: scritture solo sul cambio ---- */
    const updateBands = (p: number) => {
      bands.forEach((el, i) => {
        const { a, b, ramp } = BANDS[i];
        const f = Math.min(0.02, (b - a) / 3);
        const first = i === 0;
        const last = i === BANDS.length - 1;
        const inn = first ? 1 : smoothstep(p, a, a + f);
        const out = last ? 1 : 1 - smoothstep(p, b - f, b);
        const op = Math.round(inn * out * 1000) / 1000;
        let k = clamp((p - a) / (ramp ?? Math.min(0.025, (b - a) * 0.35)), 0, 1);
        if (first) k = Math.max(k, loadK);
        k = Math.round(k / 0.008) * 0.008;
        const c = cache[i];
        if (c.op !== op) {
          c.op = op;
          el.style.opacity = String(op);
        }
        if (c.k !== k) {
          c.k = k;
          el.style.setProperty("--k", k.toFixed(3));
        }
        const pe = op > 0.5 ? "auto" : "none";
        if (c.pe !== pe) {
          c.pe = pe;
          el.style.pointerEvents = pe;
        }
      });
    };

    /* ---- seek gated ---- */
    let seekGuard = 0;
    const requestSeek = (t: number) => {
      if (!video.duration || !isFinite(video.duration)) return;
      if (seekBusy) {
        pendingTime = t;
        return;
      }
      /* un seek al tempo già mostrato non genera mai "seeked": non entra nel gate */
      if (Math.abs(video.currentTime - t) < 0.02) return;
      seekBusy = true;
      video.currentTime = t;
      /* rete di sicurezza: il gate non può restare bloccato */
      window.clearTimeout(seekGuard);
      seekGuard = window.setTimeout(() => {
        seekBusy = false;
        if (pendingTime !== null) {
          const q = pendingTime;
          pendingTime = null;
          requestSeek(q);
        }
      }, 300);
    };
    const onSeeked = () => {
      window.clearTimeout(seekGuard);
      seekBusy = false;
      if (pendingTime !== null) {
        const t = pendingTime;
        pendingTime = null;
        requestSeek(t);
      }
    };
    const onVideoError = () => {
      seekBusy = false;
      pendingTime = null;
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onVideoError);

    /* ---- lerp rAF che si ferma ---- */
    const tick = (now: number) => {
      const dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      const k = 0.16;
      shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
      if (Math.abs(target - shown) < 0.0004) {
        shown = target;
        rafId = null;
        lastTick = 0;
      } else {
        rafId = requestAnimationFrame(tick);
      }
      requestSeek(shown * video.duration);
    };

    const onScroll = () => {
      const p = heroProgress();
      updateBands(p);
      target = clamp(p / VIDEO_END, 0, 1);
      if (rafId === null && heroOnScreen && stage.dataset.video === "ready") {
        rafId = requestAnimationFrame(tick);
      }
    };

    /* ---- blob in streaming con anello onesto ---- */
    let failed = false;
    const failVideo = () => {
      /* senza film la pagina diventa un hero statico completo: frame finale, claim e CTA */
      failed = true;
      stage.dataset.video = "failed";
      section.dataset.video = "failed";
      disableScrub();
    };
    const loadHeroBlob = async () => {
      ctrl = new AbortController();
      const c = ctrl;
      let watchdog = window.setTimeout(() => c.abort(), 20000);
      const res = await fetch(VIDEO_URL, { priority: "low", signal: c.signal } as RequestInit);
      if (!res.ok || !res.body) throw new Error("video non disponibile");
      const total = Number(res.headers.get("Content-Length")) || VIDEO_BYTES;
      const reader = res.body.getReader();
      const chunks: BlobPart[] = [];
      let got = 0;
      let lastRing = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        window.clearTimeout(watchdog);
        watchdog = window.setTimeout(() => c.abort(), 20000);
        chunks.push(value);
        got += value.length;
        const frac = Math.min(1, got / total);
        const now = performance.now();
        if (now - lastRing > 100 || frac === 1) {
          lastRing = now;
          ring.style.setProperty("--ld", String(Math.round(126 * (1 - frac))));
        }
      }
      window.clearTimeout(watchdog);
      ring.style.setProperty("--ld", "0");
      objectUrl = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
      video.src = objectUrl;
      video.load();
      video.addEventListener(
        "canplay",
        () => {
          stage.dataset.video = "ready";
          const p = heroProgress();
          target = clamp(p / VIDEO_END, 0, 1);
          shown = target;
          requestSeek(shown * video.duration);
        },
        { once: true },
      );
    };
    const startBlobFetch = () => {
      if (started) return;
      started = true;
      loadHeroBlob().catch(failVideo);
    };
    const initHeroOnce = () => {
      if (started) return;
      /* il poster vince la corsa: il video parte solo a poster arrivato (o fallito) */
      const img = new window.Image();
      img.onload = startBlobFetch;
      img.onerror = startBlobFetch;
      img.src = "/media/hero-poster.jpg";
      window.setTimeout(startBlobFetch, 4000);
    };

    /* ---- gate live ---- */
    const enableScrub = () => {
      if (scrubOn || failed) return;
      scrubOn = true;
      initHeroOnce();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      cache.forEach((c) => {
        c.op = -1;
        c.k = -1;
        c.pe = "";
      });
      loadK = 0;
      const t0 = performance.now();
      const step = (now: number) => {
        loadK = Math.min(1, (now - t0) / 1100);
        updateBands(heroProgress());
        if (loadK < 1) loadRaf = requestAnimationFrame(step);
      };
      loadRaf = requestAnimationFrame(step);
      onScroll();
    };
    const disableScrub = () => {
      if (!scrubOn) return;
      scrubOn = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      cancelAnimationFrame(loadRaf);
      /* via gli stili inline: la variante static-hero torna a comandare */
      bands.forEach((el) => {
        el.style.removeProperty("opacity");
        el.style.removeProperty("--k");
        el.style.removeProperty("pointer-events");
      });
    };
    const applyHeroMode = () => {
      if (GATES.some((q) => window.matchMedia(q).matches)) disableScrub();
      else enableScrub();
    };
    const mqls = GATES.map((q) => window.matchMedia(q));
    mqls.forEach((m) => m.addEventListener("change", applyHeroMode));
    applyHeroMode();

    const io = new IntersectionObserver(
      ([e]) => {
        heroOnScreen = e.isIntersecting;
        if (heroOnScreen && scrubOn) onScroll();
      },
      { threshold: 0 },
    );
    io.observe(section);

    const onVis = () => document.body.classList.toggle("paused", document.hidden);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      disableScrub();
      mqls.forEach((m) => m.removeEventListener("change", applyHeroMode));
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.clearTimeout(seekGuard);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onVideoError);
      ctrl?.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const setBand = (i: number) => (el: HTMLDivElement | null) => {
    bandRefs.current[i] = el;
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-label="Tecnomarmi, dal blocco al progetto"
      className="relative h-[900vh] bg-ink data-[video=failed]:h-svh static-hero:h-svh"
    >
      <div
        ref={stageRef}
        data-video="loading"
        className="group/stage sticky top-0 h-svh overflow-hidden bg-ink"
      >
        {/* poster del film (scrub) e frame finale (statico) */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center bg-[url('/media/hero-poster.jpg')] group-data-[video=failed]/stage:hidden static-hero:hidden"
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-cover bg-center bg-[url('/media/hero-ending.jpg')] group-data-[video=failed]/stage:block static-hero:block"
        />

        <video
          ref={videoRef}
          preload="none"
          muted
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full transform-gpu object-cover opacity-0 transition-opacity duration-700 ease-soft group-data-[video=ready]/stage:opacity-100 static-hero:hidden"
        />

        {/* scrim globale: nessun frame è mai grezzo sotto il testo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_45%,rgba(16,18,20,0)_35%,rgba(16,18,20,.62)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[60%] bg-gradient-to-t from-ink/90 via-ink/55 to-transparent group-data-[video=failed]/stage:block static-hero:block"
        />

        {/* anello di caricamento onesto */}
        <svg
          viewBox="0 0 48 48"
          aria-hidden
          className="absolute bottom-6 right-6 size-10 -rotate-90 text-white/70 group-data-[video=ready]/stage:hidden group-data-[video=failed]/stage:hidden static-hero:hidden"
        >
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
          <circle
            ref={ringRef}
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="126"
            style={{ strokeDashoffset: "var(--ld,126)" }}
          />
        </svg>

        {/* Banda 1: si avvicina come la camera */}
        <div ref={setBand(0)} className={`${BAND_BASE} opacity-100`}>
          <div aria-hidden className={SCRIM_BAND} />
          <div className="relative max-w-[34rem]">
            <p className={`${KICKER} mb-5 text-stone/80`}>Tecnomarmi · Altivole (TV)</p>
            <h1 className="text-[clamp(2.4rem,6.2vw,5.4rem)] font-light leading-[1.02] tracking-tight [transform:scale(calc(.84_+_.16_*_var(--k,0)))] [transform-origin:0_50%] opacity-(--k)">
              Ogni progetto nasce da un blocco.
            </h1>
          </div>
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-stone/80">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em]">Scorri</span>
            <ChevronDown aria-hidden size={20} strokeWidth={1.5} className="animate-breath" />
          </div>
        </div>

        {/* Banda 2: le due metà si aprono */}
        <div ref={setBand(1)} className={`${BAND_BASE} opacity-0`}>
          <div aria-hidden className={SCRIM_BAND} />
          <h2 className="relative max-w-[52rem] text-[clamp(2rem,4.6vw,4rem)] font-light leading-[1.08] tracking-tight">
            <span className="sr-only">Lo tagliamo su misura della vostra idea.</span>
            <span aria-hidden className="block">
              <span className="block opacity-(--k) [transform:translateX(calc((1_-_var(--k,0))_*_-70px))]">
                Lo tagliamo su misura
              </span>
              <span className="block opacity-(--k) [transform:translateX(calc((1_-_var(--k,0))_*_70px))]">
                della vostra idea.
              </span>
            </span>
          </h2>
        </div>

        {/* Banda 3: le parole si posano come le lastre */}
        <div ref={setBand(2)} className={`${BAND_BASE} opacity-0`}>
          <div aria-hidden className={SCRIM_BAND} />
          <h2 className="relative max-w-[32rem] text-[clamp(2.2rem,5.6vw,4.8rem)] font-light leading-[1.05] tracking-tight">
            <Words text="E il marmo prende vita." kind="drift" />
          </h2>
        </div>

        {/* Banda 4: la quiete del bagno finito, claim e doppia CTA */}
        <div
          ref={setBand(3)}
          className="absolute inset-0 flex flex-col justify-end px-6 pb-[11vh] text-white opacity-0 [text-shadow:var(--shadow-tx)] sm:px-10 lg:px-[8vw] group-data-[video=failed]/stage:pointer-events-auto group-data-[video=failed]/stage:opacity-100 group-data-[video=failed]/stage:[--k:1] static-hero:pointer-events-auto static-hero:opacity-100 static-hero:[--k:1]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[-6%] bg-[radial-gradient(ellipse_90%_75%_at_28%_88%,rgba(16,18,20,.82)_0%,rgba(16,18,20,.58)_48%,rgba(16,18,20,0)_78%)]"
          />
          <div className="relative max-w-[44rem]">
            <p className={`${KICKER} mb-4 text-stone/85`}>Lavorazione di marmo, pietra e granito su progetto</p>
            <h2 className="text-[clamp(2.1rem,5.4vw,4.6rem)] font-light leading-[1.04] tracking-tight">
              <Words text="Nessun limite all'immaginazione." kind="rise" spread={0.5} />
            </h2>
            <p className="mt-5 max-w-[38rem] text-base font-normal leading-relaxed text-stone sm:text-lg opacity-[clamp(0,calc((var(--k,0)_-_.66)_*_4),1)]">
              Marmo, pietra, granito e solid surface lavorati su disegno per studi di architettura e aziende
              d&apos;arredo. Altivole, Treviso.
            </p>
            <div className="mt-7 flex flex-col gap-3 opacity-[clamp(0,calc((var(--k,0)_-_.78)_*_5),1)] sm:flex-row sm:items-center">
              <a href="#contatti" onClick={onCta} className={`${BTN_FULL} [text-shadow:none]`}>
                Parliamo del vostro progetto
                <ArrowUpRight aria-hidden size={18} strokeWidth={1.5} />
              </a>
              <a href="#lavorazioni" className={`${BTN_LINE} [text-shadow:none]`}>
                Vedi le lavorazioni
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  La venatura: unico elemento firma                                  */
/* ------------------------------------------------------------------ */

const VEIN_MAIN =
  "M8 0 C12 40 6 70 14 110 L11 150 C20 190 30 210 26 260 L31 300 C40 340 52 350 49 410 L55 450 C62 500 80 510 77 570 L84 610 C90 660 70 690 66 740 L60 790 C54 840 30 850 34 900 L28 940 C24 970 20 990 22 1000";
const VEIN_BRANCHES: { d: string; start: number }[] = [
  { d: "M26 260 C14 270 8 300 3 335", start: 0.26 },
  { d: "M49 410 C62 400 75 380 94 372", start: 0.41 },
  { d: "M77 570 C90 560 96 590 99 625", start: 0.57 },
  { d: "M34 900 C44 910 60 905 74 928", start: 0.9 },
];

function Vein() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<SVGPathElement | null>(null);
  const branchRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const main = mainRef.current;
    if (!wrap || !main) return;
    const branches = branchRefs.current.filter(Boolean) as SVGPathElement[];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let target = 0;
    let shown = 0;
    let raf: number | null = null;
    let lastTick = 0;
    let lastMain = -1;
    const lastBr = branches.map(() => -1);

    const paint = (p: number) => {
      const m = Math.round((1 - p) * 1000) / 1000;
      if (m !== lastMain) {
        lastMain = m;
        main.style.strokeDashoffset = String(m);
      }
      branches.forEach((b, i) => {
        const bp = clamp((p - VEIN_BRANCHES[i].start) / 0.1, 0, 1);
        const v = Math.round((1 - bp) * 1000) / 1000;
        if (v !== lastBr[i]) {
          lastBr[i] = v;
          b.style.strokeDashoffset = String(v);
        }
      });
    };

    const compute = () => {
      const r = wrap.getBoundingClientRect();
      return clamp((window.innerHeight * 0.62 - r.top) / r.height, 0, 1);
    };
    const tick = (now: number) => {
      const dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.1, dt / 16.667));
      if (Math.abs(target - shown) < 0.0004) {
        shown = target;
        raf = null;
        lastTick = 0;
      } else raf = requestAnimationFrame(tick);
      paint(shown);
    };
    const onScroll = () => {
      if (reduce.matches) return;
      target = compute();
      if (raf === null) raf = requestAnimationFrame(tick);
    };
    const onReduce = () => {
      if (reduce.matches) {
        if (raf !== null) cancelAnimationFrame(raf);
        raf = null;
        paint(1);
      } else {
        target = compute();
        shown = target;
        paint(shown);
      }
    };
    reduce.addEventListener("change", onReduce);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if (reduce.matches) paint(1);
    else {
      target = compute();
      shown = target;
      paint(shown);
    }
    return () => {
      reduce.removeEventListener("change", onReduce);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-50 sm:opacity-100">
      <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="h-full w-full">
        <path
          ref={mainRef}
          d={VEIN_MAIN}
          pathLength={1}
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
        />
        {VEIN_BRANCHES.map((b, i) => (
          <path
            key={i}
            ref={(el) => {
              branchRefs.current[i] = el;
            }}
            d={b.d}
            pathLength={1}
            fill="none"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sezioni                                                            */
/* ------------------------------------------------------------------ */

function Lavorazioni({ onPick }: { onPick: (option: string) => void }) {
  return (
    <section id="lavorazioni" aria-labelledby="h-lavorazioni" className="relative px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <div className="mx-auto max-w-[90rem]">
        <Reveal>
          <Kicker>Lavorazioni</Kicker>
          <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2
              id="h-lavorazioni"
              className="text-[clamp(2rem,4.4vw,3.8rem)] font-light leading-[1.05] tracking-tight lg:col-span-7"
            >
              Sei famiglie di lavoro,{" "}
              <span className="bg-gradient-to-b from-white to-stone/55 bg-clip-text text-transparent">
                un solo laboratorio.
              </span>
            </h2>
            <p className="text-base leading-relaxed text-stone/75 sm:text-lg lg:col-span-5">
              Dall&apos;architettura all&apos;interior: grandi colonne, scale sospese, piani bagno e cucina, mobili
              rivestiti in marmo alleggerito. Se riesci a immaginarlo, lo puoi fare.
            </p>
          </div>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {TILES.map((t, i) => (
            <li key={t.id} className={`${t.span} sm:col-span-1`}>
              <Reveal delay={(i % 2) * 0.1} className="h-full">
                <article className="group relative aspect-[4/3] overflow-hidden bg-graphite lg:aspect-auto lg:h-[30rem]">
                  <Image
                    src={t.img}
                    alt={t.alt}
                    width={t.w}
                    height={t.h}
                    sizes="(min-width:1024px) 55vw, (min-width:640px) 50vw, 100vw"
                    className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-soft group-hover:scale-[1.04] ${
                      t.illustrative ? "" : "saturate-[.78] brightness-[.96]"
                    }`}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/45 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                    <p className={`${KICKER} text-stone/75`}>
                      {t.tag}
                      {t.illustrative ? " · Immagine illustrativa" : ""}
                    </p>
                    <h3 className="mt-2 text-2xl font-normal tracking-tight text-white sm:text-3xl">{t.title}</h3>
                    <p className="mt-2 max-w-[34rem] text-sm leading-relaxed text-stone/85 sm:text-base">{t.text}</p>
                    <a
                      href="#contatti"
                      onClick={() => onPick(t.option)}
                      className="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-[gap] duration-300 ease-soft hover:gap-4"
                    >
                      Chiedi di questa lavorazione
                      <ArrowUpRight aria-hidden size={18} strokeWidth={1.5} />
                    </a>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        <ul className="mt-3 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {TECH.map((t) => (
            <li key={t.label} className="flex gap-4 bg-ink p-6 sm:p-7">
              <t.icon aria-hidden size={28} strokeWidth={1.5} className="mt-0.5 shrink-0 text-white" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{t.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-stone/70">{t.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Materioteca() {
  const [active, setActive] = useState(1);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let n = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % MATERIALS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + MATERIALS.length) % MATERIALS.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = MATERIALS.length - 1;
    else return;
    e.preventDefault();
    setActive(n);
    tabRefs.current[n]?.focus();
  };

  const m = MATERIALS[active];

  return (
    <section
      id="materioteca"
      aria-labelledby="h-materioteca"
      className="relative border-y border-white/10 bg-graphite/45 px-5 py-24 sm:px-8 sm:py-32 lg:px-12"
    >
      <div className="mx-auto max-w-[90rem]">
        <Reveal>
          <Kicker>Materioteca</Kicker>
          <h2
            id="h-materioteca"
            className="mt-6 max-w-[48rem] text-[clamp(2rem,4.4vw,3.8rem)] font-light leading-[1.05] tracking-tight"
          >
            Scegli la materia{" "}
            <span className="bg-gradient-to-b from-white to-stone/55 bg-clip-text text-transparent">
              prima della forma.
            </span>
          </h2>
          <p className="mt-5 max-w-[40rem] text-base leading-relaxed text-stone/75 sm:text-lg">
            La materioteca serve a scegliere il materiale giusto per il progetto. Selezionane uno e leggi come si
            lavora.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="relative aspect-[3/2] overflow-hidden bg-ink">
              {MATERIALS.map((mat, i) => (
                <Image
                  key={mat.id}
                  src={mat.img}
                  alt={i === active ? `Dettaglio di ${mat.name.toLowerCase()}, illustrazione` : ""}
                  aria-hidden={i !== active}
                  width={1920}
                  height={1280}
                  sizes="(min-width:1024px) 55vw, 100vw"
                  className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[900ms] ease-soft ${
                    i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                  }`}
                />
              ))}
              <p className="absolute bottom-3 left-4 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-stone/70">
                Immagine illustrativa
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div role="tablist" aria-label="Materiali" className="flex flex-wrap gap-2">
              {MATERIALS.map((mat, i) => (
                <button
                  key={mat.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  type="button"
                  id={`tab-${mat.id}`}
                  aria-selected={i === active}
                  aria-controls="panel-materiale"
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={`min-h-11 border px-4 text-xs font-semibold uppercase tracking-[0.18em] transition-[background-color,color,border-color] duration-300 ease-soft ${
                    i === active
                      ? "border-white bg-white text-ink"
                      : "border-white/25 text-stone hover:border-white/70"
                  }`}
                >
                  {mat.name}
                </button>
              ))}
            </div>

            <div
              id="panel-materiale"
              role="tabpanel"
              aria-labelledby={`tab-${m.id}`}
              tabIndex={0}
              className="mt-8"
            >
              <p className={KICKER}>{m.family}</p>
              <h3 className="mt-3 text-3xl font-light tracking-tight text-white sm:text-4xl">{m.name}</h3>
              <p className="mt-5 text-base leading-relaxed text-stone/85">{m.text}</p>
              <dl className="mt-7 space-y-5 border-t border-white/10 pt-6 text-sm leading-relaxed">
                <div>
                  <dt className={KICKER}>Finiture</dt>
                  <dd className="mt-2 text-stone/85">{m.finishes}</dd>
                </div>
                <div>
                  <dt className={KICKER}>Da sapere</dt>
                  <dd className="mt-2 text-stone/85">{m.note}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metodo() {
  return (
    <section id="metodo" aria-labelledby="h-metodo" className="relative px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <div className="mx-auto grid max-w-[90rem] gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <Kicker>Come lavoriamo</Kicker>
              <h2
                id="h-metodo"
                className="mt-6 text-[clamp(2rem,4.2vw,3.6rem)] font-light leading-[1.06] tracking-tight"
              >
                Un solo interlocutore,{" "}
                <span className="bg-gradient-to-b from-white to-stone/55 bg-clip-text text-transparent">
                  dal disegno alla consegna.
                </span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-stone/75 sm:text-lg">
                Per studi di architettura e aziende d&apos;arredo: lavoriamo su disegno, con il tuo progetto al
                centro e la tecnologia giusta per ogni pezzo.
              </p>
            </Reveal>
            <Reveal delay={0.15} className="mt-8">
              <Image
                src="/img/real-waterjet.jpg"
                alt="Testa di taglio Waterjet in lavorazione su una lastra"
                width={1200}
                height={800}
                sizes="(min-width:1024px) 38vw, 100vw"
                className="aspect-[3/2] w-full object-cover saturate-[.78] brightness-[.92]"
              />
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ol className="divide-y divide-white/10 border-y border-white/10">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <Reveal delay={0.05} className="grid grid-cols-[3rem_1fr] gap-5 py-8 sm:grid-cols-[4rem_1fr] sm:py-10">
                  <span aria-hidden className="text-4xl font-light text-white/35 sm:text-5xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex items-center gap-3">
                      <s.icon aria-hidden size={28} strokeWidth={1.5} className="text-white" />
                      <h3 className="text-xl font-normal tracking-tight text-white sm:text-2xl">{s.title}</h3>
                    </div>
                    <p className="mt-3 max-w-[36rem] text-base leading-relaxed text-stone/75">{s.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          <ul className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
            {PILLARS.map((p) => (
              <li key={p.title} className="bg-ink p-6">
                <p.icon aria-hidden size={28} strokeWidth={1.5} className="text-white" />
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone/70">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Modulo di contatto                                                 */
/* ------------------------------------------------------------------ */

type FormValues = {
  nome: string;
  azienda: string;
  ruolo: string;
  email: string;
  telefono: string;
  tipologia: string;
  messaggio: string;
  consenso: boolean;
  web: string;
};
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = {
  nome: "",
  azienda: "",
  ruolo: "",
  email: "",
  telefono: "",
  tipologia: "",
  messaggio: "",
  consenso: false,
  web: "",
};

const FIELD =
  "block w-full min-h-12 rounded-sm border border-white/25 bg-ink px-4 py-3 text-base text-white placeholder:text-stone/45 transition-[border-color] duration-300 ease-soft focus:border-white focus:outline-none data-[invalid=true]:border-white";

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (v.nome.trim().length < 2) e.nome = "Scrivi il tuo nome.";
  if (v.azienda.trim().length < 2) e.azienda = "Indica lo studio o l'azienda.";
  if (v.ruolo.trim().length < 2) e.ruolo = "Indica il tuo ruolo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Inserisci un indirizzo email valido.";
  if (v.telefono.trim() && !/^[0-9+()\s./-]{6,}$/.test(v.telefono.trim())) e.telefono = "Controlla il numero di telefono.";
  if (!v.tipologia) e.tipologia = "Scegli la tipologia di progetto.";
  if (v.messaggio.trim().length < 10) e.messaggio = "Raccontaci in due righe cosa devi realizzare.";
  if (!v.consenso) e.consenso = "Serve il consenso al trattamento dei dati per inviare la richiesta.";
  return e;
}

function Field({
  name,
  label,
  optional,
  error,
  children,
}: {
  name: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={`f-${name}`}
        className="mb-2 flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.2em] text-stone/85"
      >
        <span>{label}</span>
        {optional && <span className="text-[0.65rem] normal-case tracking-normal text-stone/60">facoltativo</span>}
      </label>
      {children}
      <p id={`e-${name}`} role={error ? "alert" : undefined} className="mt-2 min-h-5 text-sm text-white">
        {error}
      </p>
    </div>
  );
}

function Contatti({ tipologia }: { tipologia: string }) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "mailto" | "error">("idle");
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (tipologia) setValues((v) => ({ ...v, tipologia }));
  }, [tipologia]);

  const set = <K extends keyof FormValues>(k: K, val: FormValues[K]) => {
    setValues((v) => ({ ...v, [k]: val }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (values.web) return; // honeypot
    const errs = validate(values);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const subject = `Richiesta dal sito: ${values.tipologia} · ${values.azienda}`;
    const body = [
      `Nome: ${values.nome}`,
      `Azienda: ${values.azienda}`,
      `Ruolo: ${values.ruolo}`,
      `Email: ${values.email}`,
      `Telefono: ${values.telefono || "non indicato"}`,
      `Tipologia di progetto: ${values.tipologia}`,
      "",
      values.messaggio,
    ].join("\n");

    if (CONFIG.formEndpoint) {
      try {
        setStatus("sending");
        const res = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...values, _subject: subject }),
        });
        setStatus(res.ok ? "sent" : "error");
      } catch {
        setStatus("error");
      }
      return;
    }
    setStatus("mailto");
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const err = (k: keyof FormValues) => errors[k];

  const done = status === "sent" || status === "mailto";

  return (
    <section
      id="contatti"
      aria-labelledby="h-contatti"
      className="relative border-t border-white/10 bg-graphite/45 px-5 py-24 sm:px-8 sm:py-32 lg:px-12"
    >
      <div className="mx-auto grid max-w-[90rem] gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <Kicker>Contatti</Kicker>
            <h2
              id="h-contatti"
              className="mt-6 text-[clamp(2.2rem,4.6vw,4rem)] font-light leading-[1.04] tracking-tight"
            >
              Iniziamo un{" "}
              <span className="bg-gradient-to-b from-white to-stone/55 bg-clip-text text-transparent">
                progetto insieme.
              </span>
            </h2>
            <p className="mt-5 max-w-[30rem] text-base leading-relaxed text-stone/75 sm:text-lg">
              Raccontaci cosa devi realizzare e per quando. Ti rispondiamo all&apos;indirizzo che ci lasci.
            </p>
            <ul className="mt-9 space-y-5 text-base">
              <li className="flex items-start gap-4">
                <Mail aria-hidden size={20} strokeWidth={1.5} className="mt-1 shrink-0" />
                <a href={`mailto:${CONFIG.email}`} className="break-all text-white underline-offset-4 hover:underline">
                  {CONFIG.email}
                </a>
              </li>
              <li className="flex items-start gap-4">
                <Phone aria-hidden size={20} strokeWidth={1.5} className="mt-1 shrink-0" />
                <a href={CONFIG.telefonoHref} className="text-white underline-offset-4 hover:underline">
                  {CONFIG.telefono}
                </a>
              </li>
              <li className="flex items-start gap-4">
                <MapPin aria-hidden size={20} strokeWidth={1.5} className="mt-1 shrink-0" />
                <span className="text-stone/85">{CONFIG.indirizzo}</span>
              </li>
            </ul>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          {done ? (
            <div role="status" className="border border-white/25 bg-ink p-8 sm:p-10">
              <Check aria-hidden size={28} strokeWidth={1.5} />
              <h3 className="mt-5 text-2xl font-normal tracking-tight text-white">
                {status === "sent" ? "Richiesta inviata." : "Il messaggio è pronto."}
              </h3>
              <p className="mt-3 max-w-[34rem] text-base leading-relaxed text-stone/85">
                {status === "sent"
                  ? "Abbiamo ricevuto la tua richiesta e ti rispondiamo all'indirizzo indicato."
                  : `Si sta aprendo il tuo programma di posta con la richiesta già compilata: premi Invia per spedirla a ${CONFIG.email}. Se non si apre, scrivici direttamente a quell'indirizzo.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setValues(EMPTY);
                }}
                className={`${BTN_LINE} mt-7`}
              >
                Scrivi un&apos;altra richiesta
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-x-6 sm:grid-cols-2" aria-label="Richiesta di contatto">
              <Field name="nome" error={errors.nome} label="Nome e cognome">
                <input
                  id="f-nome"
                  name="nome"
                  autoComplete="name"
                  value={values.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  aria-invalid={!!err("nome")}
                  aria-describedby="e-nome"
                  data-invalid={!!err("nome")}
                  className={FIELD}
                />
              </Field>
              <Field name="azienda" error={errors.azienda} label="Studio o azienda">
                <input
                  id="f-azienda"
                  name="azienda"
                  autoComplete="organization"
                  value={values.azienda}
                  onChange={(e) => set("azienda", e.target.value)}
                  aria-invalid={!!err("azienda")}
                  aria-describedby="e-azienda"
                  data-invalid={!!err("azienda")}
                  className={FIELD}
                />
              </Field>
              <Field name="ruolo" error={errors.ruolo} label="Ruolo">
                <input
                  id="f-ruolo"
                  name="ruolo"
                  autoComplete="organization-title"
                  value={values.ruolo}
                  onChange={(e) => set("ruolo", e.target.value)}
                  aria-invalid={!!err("ruolo")}
                  aria-describedby="e-ruolo"
                  data-invalid={!!err("ruolo")}
                  className={FIELD}
                />
              </Field>
              <Field name="email" error={errors.email} label="Email">
                <input
                  id="f-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-invalid={!!err("email")}
                  aria-describedby="e-email"
                  data-invalid={!!err("email")}
                  className={FIELD}
                />
              </Field>
              <Field name="telefono" error={errors.telefono} label="Telefono" optional>
                <input
                  id="f-telefono"
                  name="telefono"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={values.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  aria-invalid={!!err("telefono")}
                  aria-describedby="e-telefono"
                  data-invalid={!!err("telefono")}
                  className={FIELD}
                />
              </Field>
              <Field name="tipologia" error={errors.tipologia} label="Tipologia di progetto">
                <select
                  id="f-tipologia"
                  name="tipologia"
                  value={values.tipologia}
                  onChange={(e) => set("tipologia", e.target.value)}
                  aria-invalid={!!err("tipologia")}
                  aria-describedby="e-tipologia"
                  data-invalid={!!err("tipologia")}
                  className={FIELD}
                >
                  <option value="">Seleziona</option>
                  {TIPOLOGIE.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field name="messaggio" error={errors.messaggio} label="Il progetto in breve">
                  <textarea
                    id="f-messaggio"
                    name="messaggio"
                    rows={5}
                    value={values.messaggio}
                    onChange={(e) => set("messaggio", e.target.value)}
                    aria-invalid={!!err("messaggio")}
                    aria-describedby="e-messaggio"
                    data-invalid={!!err("messaggio")}
                    placeholder="Materiale, misure indicative, tempi, dove sarà installato."
                    className={`${FIELD} resize-y`}
                  />
                </Field>
              </div>

              {/* honeypot */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Sito web
                  <input tabIndex={-1} autoComplete="off" value={values.web} onChange={(e) => set("web", e.target.value)} />
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-stone/85">
                  <input
                    type="checkbox"
                    name="consenso"
                    checked={values.consenso}
                    onChange={(e) => set("consenso", e.target.checked)}
                    aria-invalid={!!err("consenso")}
                    aria-describedby="e-consenso"
                    className="mt-1 size-5 shrink-0 accent-white"
                  />
                  <span>
                    Acconsento al trattamento dei miei dati personali come previsto dalla{" "}
                    <a
                      href={`${CONFIG.sito}/privacy-policy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline underline-offset-4"
                    >
                      Privacy Policy
                    </a>{" "}
                    (Regolamento UE 2016/679).
                  </span>
                </label>
                <p id="e-consenso" role={err("consenso") ? "alert" : undefined} className="mt-2 min-h-5 text-sm text-white">
                  {err("consenso")}
                </p>
              </div>

              <div className="sm:col-span-2 mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button type="submit" disabled={status === "sending"} className={`${BTN_FULL} disabled:opacity-60`}>
                  {status === "sending" ? "Invio in corso" : "Invia la richiesta"}
                  <ArrowUpRight aria-hidden size={18} strokeWidth={1.5} />
                </button>
                <p className="text-sm leading-relaxed text-stone/65">
                  {CONFIG.formEndpoint
                    ? "La richiesta arriva direttamente al nostro ufficio commerciale."
                    : `Si apre il tuo programma di posta con il messaggio pronto per ${CONFIG.email}.`}
                </p>
              </div>
              {status === "error" && (
                <p role="alert" className="sm:col-span-2 mt-4 border border-white/30 p-4 text-sm text-white">
                  Non siamo riusciti a inviare la richiesta. Scrivici a {CONFIG.email} o chiama il {CONFIG.telefono}.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink px-5 pb-10 pt-16 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[90rem] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Image
            src="/brand/logo-bianco.webp"
            alt="Tecnomarmi"
            width={1088}
            height={178}
            sizes="(min-width:640px) 270px, 220px"
            className="h-9 w-auto sm:h-11"
          />
          <p className="mt-6 max-w-[28rem] text-xl font-light leading-snug tracking-tight text-stone">
            Nessun limite all&apos;immaginazione.
          </p>
        </div>
        <address className="space-y-3 text-sm not-italic leading-relaxed text-stone/80 lg:col-span-3">
          <p className="font-semibold uppercase tracking-[0.2em] text-white">{CONFIG.ragione}</p>
          <p>{CONFIG.indirizzo}</p>
          {CONFIG.piva && <p>P.IVA {CONFIG.piva}</p>}
        </address>
        <div className="space-y-3 text-sm leading-relaxed text-stone/80 lg:col-span-3">
          <p>
            Tel{" "}
            <a href={CONFIG.telefonoHref} className="text-white underline-offset-4 hover:underline">
              {CONFIG.telefono}
            </a>
          </p>
          <p>Fax {CONFIG.fax}</p>
          <p>
            <a href={`mailto:${CONFIG.email}`} className="break-all text-white underline-offset-4 hover:underline">
              {CONFIG.email}
            </a>
          </p>
          {CONFIG.linkedin && (
            <p>
              <a
                href={CONFIG.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline-offset-4 hover:underline"
              >
                LinkedIn
              </a>
            </p>
          )}
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-[90rem] flex-col gap-3 border-t border-white/10 pt-6 text-xs text-stone/60 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {CONFIG.ragione}</p>
        <p className="flex flex-wrap gap-x-5 gap-y-2">
          <a href={`${CONFIG.sito}/privacy-policy`} className="min-h-6 hover:text-white">Privacy Policy</a>
          <a href={`${CONFIG.sito}/cookie-policy`} className="min-h-6 hover:text-white">Cookie Policy</a>
          <a href={`${CONFIG.sito}/termini-e-condizioni`} className="min-h-6 hover:text-white">Termini e Condizioni</a>
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Pagina                                                             */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [tipologia, setTipologia] = useState("");
  const clearPick = useCallback(() => undefined, []);

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[60] -translate-y-20 bg-white px-4 py-3 text-sm font-semibold text-ink focus:translate-y-0"
      >
        Vai al contenuto
      </a>

      {/* ambiente fisso: grana e deriva luminosa lentissima */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -inset-[10%] animate-drift bg-[radial-gradient(ellipse_50%_40%_at_70%_30%,rgba(234,235,235,.07),transparent_70%),radial-gradient(ellipse_45%_40%_at_20%_75%,rgba(44,48,54,.55),transparent_70%)]" />
        <div className="absolute inset-0 bg-grain opacity-[.05] mix-blend-screen" />
      </div>

      <Header onCta={clearPick} />

      <main id="main" tabIndex={-1} className="outline-none">
        <HeroFilm onCta={clearPick} />
        <div className="relative">
          <Vein />
          <div className="relative z-10">
            <Lavorazioni onPick={setTipologia} />
            <Materioteca />
            <Metodo />
            <Contatti tipologia={tipologia} />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
