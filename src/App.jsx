import { useCallback, useEffect, useRef, useState } from "react";
import BookingForm from "./BookingForm.jsx";
import Carousel from "./Carousel.jsx";
import { initPixel } from "./pixel.js";

const TABS = [["home", "الرئيسية"], ["about", "عن المهندس  أبانوب"], ["learning", "نظام الدراسة"], ["faq", "الأسئلة"]];
const FEATURES = [
  ["01 · الحصة", "حصتين أسبوعيا", "شرح في مجموعة صغيرة، مع مساحة للسؤال والمناقشة أثناء الحصة."],
  ["02 · المذكرة", "ملازم PDF", "ملزمة منظمة لكل وحدة، بملخصات وصور من كتاب الوزارة حسب المنهج."],
  ["03 · التطبيق", "واجبات على المنصة", "أسئلة اختيار من متعدد تساعد الطالب يراجع الدرس ويختبر فهمه من الموبايل."],
  ["04 · المراجعة", "فيديوهات مسجلة", "يرجع للفيديو وقت ما يحتاج يراجع نقطة أو يعوض جزء فاته من الشرح."],
];
const FAQ = [
  ["الاشتراك الشهري بيشمل إيه؟", "الحصص الأسبوعية ، الواجبات على المنصة، والفيديوهات المسجلة ."],
  ["هل الشرح على منهج الوزارة؟", "الشرح والملازم والأسئلة مبنية على كتاب الوزارة الرسمي للبكالوريا، وفق المعلومات المتاحة عن البرنامج."],
  ["فين مكان الحصص؟", "الحصص في طنطا . هنبعتلك العنوان بالتفصيل بعد الاستفسار وتأكيد المجموعة."],
  ["هل التسجيل معناه إن الحجز اتأكد؟", "التسجيل بيوصلنا بيانات الطالب واهتمامه بالمجموعة. بنأكد الحجز بعد التواصل ومراجعة التوفر."],
  ["لو المواعيد مش مناسبة أعمل إيه؟", "ابعت الأيام والأوقات اللي تناسبك. لو فيه طلب كافي على ميعاد معين، ممكن ندرس فتح مجموعة جديدة."],
  ["هل فيه فيديوهات لو فاتتني حصة؟", "فيه فيديوهات مسجلة للمراجعة والرجوع للنقاط اللي محتاج توضيحها."],
];

export default function App() {
  const [active, setActive] = useState("home");
  const lock = useRef(0);
  const headRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(initPixel, []);

  // Keep --nav in sync with the real header height (the tabs wrap on phones).
  useEffect(() => {
    const ro = new ResizeObserver(([e]) =>
      document.documentElement.style.setProperty("--nav", Math.round(e.target.getBoundingClientRect().height) + "px"));
    ro.observe(headRef.current);
    return () => ro.disconnect();
  }, []);

  // Scroll-spy: the section crossing the middle of the screen becomes the active tab.
  useEffect(() => {
    const io = new IntersectionObserver((es) => {
      if (Date.now() < lock.current) return; // ignore while a tab click is scrolling
      es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    TABS.forEach(([id]) => io.observe(document.getElementById(id)));
    const hash = location.hash.slice(1);
    if (TABS.some(([id]) => id === hash)) setTimeout(() => go(hash, "auto"), 0);
    return () => io.disconnect();
  }, []);

  useEffect(() => { history.replaceState(null, "", "#" + active); }, [active]);

  // Muted lesson video plays only while it is on screen.
  useEffect(() => {
    const v = videoRef.current; v.muted = true;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.4 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const go = useCallback((id, behavior = "smooth") => {
    lock.current = Date.now() + 900;
    setActive(id);
    document.getElementById(id).scrollIntoView({ behavior, block: "start" });
  }, []);
  const link = (id) => ({ href: "#" + id, onClick: (e) => { e.preventDefault(); go(id); } });

  return (
    <>
      <header className="topbar" ref={headRef}><div className="container nav">
        <a className="brand" {...link("home")} aria-label="كود مع أبانوب"><span className="brand-mark" aria-hidden="true">CWA</span><span>كود مع أبانوب</span></a>
        <nav className="nav-links" aria-label="الأقسام">
          {TABS.map(([id, label]) => <a key={id} {...link(id)} aria-current={active === id ? "page" : undefined}>{label}</a>)}
        </nav>
        <a className="btn btn-primary" {...link("home")}>احجز مجموعة</a>
      </div></header>

      <main>
        <section id="home" className="hero snap"><div className="container">
          <div className="hero-copy-stack">
            <span className="eyebrow">تانية ثانوي · بكالوريا البرمجة والذكاء الاصطناعي · طنطا</span>
            <h1>خلي البرمجة <em>مفهومة</em> من أول مرة.</h1>
            <p className="hero-copy">شرح بسيط وتطبيق خطوة بخطوة، مع متابعة تساعد طالب تانية ثانوي يفهم المنهج ويحل بثقة.</p>
            <div className="trust-col">
              {["شرح مناسب لمنهج البكالوريا", "تطبيق ومراجعة بعد كل درس", "المواعيد المتاحة بتظهر في نموذج الحجز"].map((t, i) =>
                <div className="trust-item" key={t}><span className="trust-symbol" aria-hidden="true">{"١٢٣"[i]}</span><span>{t}</span></div>)}
            </div>
            <a className="scroll-hint" {...link("about")}>اعرف أكتر عن أبانوب ↓</a>
          </div>
          <div className="hero-row"><BookingForm /><Carousel /></div>
        </div></section>

        <section id="about" className="page-content snap"><div className="container about-grid">
          <aside className="about-note">
        <span className="section-kicker">المهندس أبانوب رفعت</span>
            <strong>مهندس البرمجة والذكاء الاصطناعي</strong>
            <p>تخصص ذكاء اصطناعي وعلوم بيانات، من جامعة الأهرام الكندية.</p>
            <figure className="credential-photo"><img src="assets/about/portrait.jpeg" alt="صورة أبانوب رفعت" loading="lazy" /></figure>
          </aside>
          <div className="about-copy">
            <h2>شرح قريب من الطالب وواضح لولي الأمر</h2>
            <p>بدرّس البرمجة من أكتر من 3 سنين، واشتغلت على شرح أساسيات Python وC++ ومناهج IGCSE والذكاء الاصطناعي. في الشرح بنبدأ بفهم الفكرة، ونربطها بمثال عملي، وبعدها الطالب يحل بنفسه.</p>
            <figure className="lesson-video">
              <video ref={videoRef} muted loop playsInline preload="metadata" controls poster="assets/teaching-photos/lesson.jpeg">
                <source src="assets/video/lesson-preview.mp4" type="video/mp4" />
              </video>
              <figcaption>لقطة حقيقية من الشرح</figcaption>
            </figure>
          </div>
        </div></section>

        <section id="learning" className="page-content snap"><div className="container">
          <span className="section-kicker">نظام الدراسة</span>
          <h2>حصة، تطبيق، ومراجعة.</h2>
          <div className="feature-list">
            {FEATURES.map(([i, h, p]) => <article className="feature" key={i}><span className="feature-index">{i}</span><h3>{h}</h3><p>{p}</p></article>)}
          </div>
          <div className="price-band">
            <div><div className="price-label">الاشتراك الشهري</div><div className="price">500 <small>جنيه / شهر</small></div></div>
            <div><p className="note"> </p><a className="btn btn-primary" {...link("home")}>اختار موعد المجموعة</a></div>
          </div>
        </div></section>

        <section id="faq" className="page-content snap"><div className="container">
          <span className="section-kicker">أسئلة شائعة</span>
          <h2>إجابات سريعة قبل التسجيل.</h2>
          <div className="faq-list">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
          <div className="inline-cta">
            <div><h2>جاهز تختار مجموعة؟</h2><p>سجّل بيانات الطالب واختار موعدًا متاحًا.</p></div>
            <a className="btn btn-primary" {...link("home")}>احجز دلوقتي</a>
          </div>
          <footer className="mini-foot"><span>كود مع أبانوب · طنطا</span><a href="tel:+201017747943" dir="ltr">01017747943</a></footer>
        </div></section>
      </main>
    </>
  );
}
