// Infinite starfield: three depth layers drift along the logo's rising
// diagonal and wrap around, so the sky never ends. Pointer parallax is eased.
// The five challenge targets cross the field as illustrated bodies (never
// mistaken for data: they live only here, labelled, outside the sky stage).
import { useEffect, useRef } from 'react';

interface Props {
  theme: string;
  labels: Record<string, string>;
  /** extra density multiplier (1 = default) */
  density?: number;
  /** behind working screens: bodies dim and unlabelled */
  quiet?: boolean;
}

type Body = {
  id: string;
  x: number;
  y: number;
  z: number; // depth: speed and size factor
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, t: number, s: number) => void;
};

const TAU = Math.PI * 2;

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(0.4, `rgba(${rgb},${a * 0.35})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function disk(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

const BODIES: Omit<Body, 'x' | 'y'>[] = [
  {
    id: 'barnard',
    z: 1,
    // red dwarf with a short wake: it is the fastest star in our sky
    draw: (ctx, x, y, _t, s) => {
      for (let k = 3; k >= 1; k--) {
        ctx.globalAlpha = 0.12 * (4 - k);
        disk(ctx, x - k * 9 * s, y + k * 9 * s, (7 - k) * s, '#ff8a6b');
      }
      ctx.globalAlpha = 1;
      glow(ctx, x, y, 34 * s, '255,138,107', 0.5);
      disk(ctx, x, y, 8 * s, '#ff8a6b');
      disk(ctx, x - 2 * s, y - 2 * s, 3 * s, 'rgba(255,244,220,0.5)');
    },
  },
  {
    id: 'wise0855',
    z: 0.7,
    // the coldest brown dwarf: dim, banded
    draw: (ctx, x, y, _t, s) => {
      glow(ctx, x, y, 26 * s, '176,122,106', 0.3);
      const r = 10 * s;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.clip();
      ctx.fillStyle = '#5b3a33';
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.fillStyle = '#9b6a5c';
      ctx.fillRect(x - r, y - r * 0.35, r * 2, r * 0.22);
      ctx.fillRect(x - r, y + r * 0.1, r * 2, r * 0.3);
      ctx.restore();
    },
  },
  {
    id: 'epsindib',
    z: 0.85,
    // two brown dwarfs orbiting each other
    draw: (ctx, x, y, t, s) => {
      const a = t / 2600;
      const dx = Math.cos(a) * 9 * s;
      const dy = Math.sin(a) * 4 * s;
      glow(ctx, x, y, 28 * s, '196,140,110', 0.28);
      disk(ctx, x + dx, y + dy, 5.5 * s, '#a8735e');
      disk(ctx, x - dx * 0.8, y - dy * 0.8, 4.5 * s, '#7d5446');
    },
  },
  {
    id: 'rwaur',
    z: 0.9,
    // a young variable: it brightens and dims in place
    draw: (ctx, x, y, t, s) => {
      const b = 0.55 + 0.45 * Math.sin(t / 1900);
      glow(ctx, x, y, (22 + 14 * b) * s, '242,155,196', 0.35 + 0.3 * b);
      disk(ctx, x, y, 6.5 * s, '#f29bc4');
    },
  },
  {
    id: 'rdra',
    z: 1.15,
    // a Mira giant: big, red, slowly breathing
    draw: (ctx, x, y, t, s) => {
      const p = 1 + 0.08 * Math.sin(t / 2600);
      glow(ctx, x, y, 46 * s * p, '255,120,80', 0.32);
      disk(ctx, x, y, 14 * s * p, '#e8684a');
      disk(ctx, x - 4 * s, y - 4 * s, 5 * s, 'rgba(255,214,170,0.35)');
    },
  },
];

export function Starfield({ theme, labels, density = 1, quiet = false }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    let seed = 1930;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) % 100000) / 100000;
    // three layers of stars; speed grows with nearness
    type Star = { x: number; y: number; r: number; a: number; p: number; warm: boolean; layer: number };
    let stars: Star[] = [];
    const bodies: Body[] = BODIES.map((b, i) => ({ ...b, x: 0.12 + 0.19 * i + rnd() * 0.06, y: 0.2 + rnd() * 0.65 }));
    let comet = { x: -1, y: 0, vx: 0, vy: 0, next: 6000 };
    // eased pointer offset
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    // drift direction: up and to the right, like the logo's diagonal
    const dir = { x: 0.82, y: -0.57 };
    const speeds = [5, 11, 22];

    const build = () => {
      const n = Math.min(700, Math.round(((w * h) / 3600) * density));
      stars = Array.from({ length: n }, () => {
        const layer = rnd() < 0.6 ? 0 : rnd() < 0.7 ? 1 : 2;
        return { x: rnd() * w, y: rnd() * h, r: [0.5, 0.9, 1.4][layer] * (0.7 + rnd() * 0.6), a: [0.45, 0.7, 0.95][layer], p: rnd() * TAU, warm: rnd() < 0.16, layer };
      });
    };
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const frame = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      ctx.clearRect(0, 0, w, h);
      if (theme === 'light') return;
      px += (tx - px) * Math.min(1, dt * 3);
      py += (ty - py) * Math.min(1, dt * 3);
      for (const st of stars) {
        if (!reduce) {
          st.x += dir.x * speeds[st.layer] * dt;
          st.y += dir.y * speeds[st.layer] * dt;
          if (st.x > w + 4) st.x -= w + 8;
          if (st.y < -4) st.y += h + 8;
        }
        const tw = reduce ? 1 : 0.75 + 0.25 * Math.sin(now / 1600 + st.p);
        const ox = px * (st.layer + 1) * 6;
        const oy = py * (st.layer + 1) * 6;
        ctx.globalAlpha = st.a * tw;
        ctx.fillStyle = st.warm ? '#ffe7c9' : '#e9f1ff';
        ctx.beginPath();
        ctx.arc(st.x + ox, st.y + oy, st.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // the challenge bodies, slower than the near stars, wrapping too
      const scale = Math.max(0.7, Math.min(1.3, w / 1200));
      ctx.font = '500 11px Manrope, system-ui, sans-serif';
      ctx.textAlign = 'center';
      for (const b of bodies) {
        if (!reduce) {
          b.x += (dir.x * 7 * b.z * dt) / w;
          b.y += (dir.y * 7 * b.z * dt) / h;
          if (b.x > 1.08) b.x -= 1.16;
          if (b.y < -0.08) b.y += 1.16;
        }
        const x = b.x * w + px * 18 * b.z;
        const y = b.y * h + py * 18 * b.z;
        // fade bodies that pass behind the central reading column
        const off = Math.abs(x / w - 0.5);
        const fade = quiet ? 0.3 : w < 700 ? 0.45 : Math.min(1, Math.max(0.25, (off - 0.18) / 0.14));
        ctx.globalAlpha = fade;
        b.draw(ctx, x, y, now, scale * b.z);
        ctx.globalAlpha = 1;
        const label = labels[b.id];
        if (label && fade > 0.9) {
          ctx.fillStyle = 'rgba(233,241,255,0.55)';
          ctx.fillText(label, x, y + 30 * scale * b.z);
        }
      }
      // a comet now and then
      if (!reduce) {
        comet.next -= dt * 1000;
        if (comet.x < 0 && comet.next <= 0) {
          comet = { x: rnd() * w * 0.5, y: h * (0.6 + rnd() * 0.4), vx: 260 + rnd() * 120, vy: -(140 + rnd() * 80), next: 22000 + rnd() * 16000 };
        }
        if (comet.x >= 0) {
          comet.x += comet.vx * dt;
          comet.y += comet.vy * dt;
          const g = ctx.createLinearGradient(comet.x, comet.y, comet.x - comet.vx * 0.35, comet.y - comet.vy * 0.35);
          g.addColorStop(0, 'rgba(155,232,200,0.9)');
          g.addColorStop(1, 'rgba(155,232,200,0)');
          ctx.strokeStyle = g;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(comet.x, comet.y);
          ctx.lineTo(comet.x - comet.vx * 0.35, comet.y - comet.vy * 0.35);
          ctx.stroke();
          disk(ctx, comet.x, comet.y, 2.2, '#dffbef');
          if (comet.x > w + 60 || comet.y < -60) comet.x = -1;
        }
      }
    };
    const loop = (now: number) => {
      frame(now);
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (!document.hidden && !reduce) raf = requestAnimationFrame(loop);
    };
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    if (reduce) frame(performance.now());
    else {
      window.addEventListener('pointermove', onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [theme, labels, density, quiet]);
  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
