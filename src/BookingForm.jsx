import { useEffect, useRef, useState } from "react";
import { API, track } from "./pixel.js";

const digits = (s) => s.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\D/g, "");
const okPhone = (p) => /^01[0125]\d{8}$/.test(p);

export default function BookingForm() {
  const [groups, setGroups] = useState(null); // null = loading
  const [f, setF] = useState({ name: "", studentPhone: "", parentPhone: "", groupId: "", hp: "" });
  const [err, setErr] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | fail
  const sent = useRef(false);

  useEffect(() => {
    if (!API) return setGroups([]);
    fetch(API + "?action=groups").then((r) => r.json()).then((j) => setGroups(j.groups || [])).catch(() => setGroups([]));
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (sent.current || status === "sending") return;
    const v = { ...f, studentPhone: digits(f.studentPhone), parentPhone: digits(f.parentPhone), name: f.name.trim() };
    const bad = {};
    if (v.name.length < 3) bad.name = "اكتب اسم الطالب بالكامل";
    if (!okPhone(v.studentPhone)) bad.studentPhone = "رقم موبايل مصري صحيح (11 رقم)";
    if (!okPhone(v.parentPhone)) bad.parentPhone = "رقم موبايل مصري صحيح (11 رقم)";
    if (!v.groupId) bad.groupId = "اختار المجموعة";
    setErr(bad);
    if (Object.keys(bad).length) return;
    setStatus("sending");
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight on Apps Script
        body: JSON.stringify({ ...v, utm: location.search.slice(1) }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "failed");
      sent.current = true;
      const g = groups.find((x) => x.id === v.groupId);
      track("Lead", { content_name: g ? g.label : "", value: 500, currency: "EGP" });
      setStatus("done");
    } catch {
      setStatus("fail");
    }
  }

  const field = (k, label, props) => (
    <div className="booking-preview-field">
      <label htmlFor={"f-" + k}>{label}</label>
      <input id={"f-" + k} value={f[k]} onChange={set(k)} aria-invalid={!!err[k]} {...props} />
      {err[k] && <p className="err">{err[k]}</p>}
    </div>
  );

  return (
    <div className="booking-panel" id="booking">
      <div className="booking-heading">
        <div><h2>سجّل بياناتك واختار المجموعة</h2><p>هنراجع طلبك ونتواصل معاك لتأكيد الحجز.</p></div>
        <span className="booking-state">دقيقة واحدة</span>
      </div>
      {status === "done" ? (
        <div className="success" role="status">
          <strong>تم استلام طلبك ✓</strong>
          <p>هنتواصل معاك قريبًا لتأكيد الميعاد. لو عايز تستعجل كلمنا على <a href="tel:+201017747943" dir="ltr">01017747943</a>.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="booking-preview-grid">
            {field("name", "اسم الطالب", { placeholder: "اسم الطالب بالكامل", autoComplete: "name" })}
            {field("studentPhone", "رقم موبايل الطالب", { placeholder: "01012345678", inputMode: "tel", dir: "ltr", autoComplete: "tel" })}
            {field("parentPhone", "رقم موبايل ولي الأمر", { placeholder: "01012345678", inputMode: "tel", dir: "ltr" })}
            <div className="booking-preview-field">
              <label htmlFor="f-groupId">المجموعة والميعاد</label>
              <select id="f-groupId" value={f.groupId} onChange={set("groupId")} aria-invalid={!!err.groupId}>
                <option value="">{groups === null ? "بنحمّل المواعيد..." : groups.length ? "اختار الميعاد" : "مفيش مواعيد متاحة حاليًا"}</option>
                {(groups || []).map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
              {err.groupId && <p className="err">{err.groupId}</p>}
            </div>
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.hp} onChange={set("hp")} />
          </div>
          <button className="booking-submit live" type="submit" disabled={status === "sending" || !API}>
            {status === "sending" ? "جاري الإرسال..." : "أكد طلب الحجز"}
          </button>
          {status === "fail" && <p className="err" role="alert">حصلت مشكلة في الإرسال. جرّب تاني أو كلمنا على 01017747943.</p>}
          {!API && <p className="booking-setup-note">التسجيل هيتفتح قريبًا. تقدر تتواصل معانا على <a href="tel:+201017747943" dir="ltr">01017747943</a>.</p>}
        </form>
      )}
    </div>
  );
}
