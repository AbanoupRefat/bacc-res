import { useEffect, useRef, useState } from "react";

const SLIDES = [
  ["assets/achievements/students-certificates-1.jpg", "طلاب البكالوريا مع شهادات التقدير بعد التكريم", "تكريم طلاب البكالوريا"],
  ["assets/achievements/students-certificates-2.jpg", "مجموعة أخرى من الطلاب تحمل شهادات التقدير", "شهادات تقدير للطلاب"],
];

export default function Carousel() {
  const track = useRef(null);
  const paused = useRef(false);
  const [i, setI] = useState(0);
  const n = SLIDES.length;
  const cur = () => { const t = track.current; return Math.min(n - 1, Math.max(0, Math.round(Math.abs(t.scrollLeft) / t.clientWidth))); };
  const go = (k) => {
    const t = track.current, sign = getComputedStyle(t).direction === "rtl" ? -1 : 1;
    t.scrollTo({ left: sign * k * t.clientWidth, behavior: "smooth" });
  };

  // Auto-advance every 3.5s; pauses on hover/touch/focus; off for reduced-motion users.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || n < 2) return;
    const id = setInterval(() => { if (!paused.current && !document.hidden) go((cur() + 1) % n); }, 3500);
    return () => clearInterval(id);
  }, []);

  const hold = () => { paused.current = true; }, release = () => { paused.current = false; };
  return (
    <aside className="ig-carousel" aria-roledescription="carousel" aria-label="صور تكريم الطلاب"
      onMouseEnter={hold} onMouseLeave={release} onFocus={hold} onBlur={release}
      onTouchStart={hold} onTouchEnd={() => setTimeout(release, 2500)}>
      <div className="ig-top"><span className="ig-title">تكريم الطلاب · مقر شارع البحر</span><span className="ig-count" dir="ltr">{i + 1} / {n}</span></div>
      <div className="ig-track" ref={track} tabIndex={0} onScroll={() => setI(cur())}>
        {SLIDES.map(([src, alt, cap], k) => (
          <figure className="ig-slide" key={src} aria-roledescription="slide" aria-label={`${k + 1} من ${n}`}>
            <img src={src} alt={alt} width="1600" height="1200" loading="lazy" /><figcaption>{cap}</figcaption>
          </figure>
        ))}
      </div>
      <div className="ig-dots" aria-hidden="true">{SLIDES.map((_, k) => <span key={k} className={k === i ? "on" : ""} />)}</div>
    </aside>
  );
}
