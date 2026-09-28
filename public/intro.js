/* ============================================================
   شاشة الترحيب: بتتحقن في الـ head قبل رسم الصفحة، عشان أول
   frame اللي الزائر يشوفه هي الشاشة دي مش الموقع.
   بتظهر مرة واحدة في الجلسة (sessionStorage)، وبتقدر تتخطى
   بأي ضغطة أو زر، وبتحترم prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "gc-intro-seen";
  var DURATION = 2500; // طول الأنيميشن قبل ما تتشال

  function alreadySeen() {
    try {
      return sessionStorage.getItem(KEY) === "1";
    } catch (e) {
      return true; // لو المتصفح منع التخزين، متعرضش الأنيميشن تاني
    }
  }

  function markSeen() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch (e) {
      /* مفيش مشكلة */
    }
  }

  // بطلّع الدالة لوحدها: لو المستخدم طلب تقليل الحركة، متعرضش خالص
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    markSeen();
    return;
  }

  if (alreadySeen()) return;

  var root = document.documentElement;
  root.classList.add("gc-intro-active");

  var el = document.createElement("div");
  el.id = "gcIntro";
  el.setAttribute("role", "status");
  el.setAttribute("aria-label", "Welcome to GC");
  el.innerHTML =
    '<div class="gc-intro-box">' +
    '  <div class="gc-intro-logo"><img src="logo.jpg" alt="GC" width="900" height="491" fetchpriority="high" decoding="async"></div>' +
    '  <div class="gc-intro-text">' +
    '    <h1 class="gc-intro-en"><span class="gc-w" style="animation-delay:.62s">Welcome</span> <span class="gc-w" style="animation-delay:.74s">to</span> <span class="gc-w" style="animation-delay:.86s">GC</span></h1>' +
    '    <p class="gc-intro-ar">أهلاً بيك في <b>GC</b> — شحن ألعاب فوري</p>' +
    "  </div>" +
    '  <div class="gc-intro-bar"></div>' +
    "</div>" +
    '<button class="gc-intro-skip" type="button" aria-label="تخطي">تخطي ✕</button>';

  // بنحقنها في أول الـ body عشان تظهر فورًا
  function mount() {
    (document.body || root).appendChild(el);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);

  var done = false;
  var timer = null;

  function finish() {
    if (done) return;
    done = true;
    markSeen();
    if (timer) clearTimeout(timer);
    el.classList.add("gc-out");
    root.classList.remove("gc-intro-active");
    // بنشيل العنصر بالكامل بعد ماخلص الانتقال عشان مايقفشش في الـ DOM
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 650);
  }

  // تخطي بأي ضغطة / لمس / زر
  el.addEventListener("click", finish);
  window.addEventListener("keydown", finish, { once: true });
  window.addEventListener("touchstart", finish, { once: true, passive: true });

  // لو الصفحة اتنقلت لبره بالـ back/forward بنشيلها على طول
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) finish();
  });

  // نبدأ العدّاد بعد ما الـ DOM جاهز (يبقى الأنيميشن متزامن مع الرسم)
  function start() {
    if (done) return;
    timer = setTimeout(finish, DURATION);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
