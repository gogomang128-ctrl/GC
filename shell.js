
function buildShell() {
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="ann" id="ann"><span>شحن ألعاب الموبايل والكمبيوتر بالجنيه المصري</span><button id="annx" aria-label="إغلاق">✕</button></div>
    <header class="nav">
      <div class="wrap bar">
        <a class="brand" href="index.html">${CONFIG.brand}</a>
        <nav id="links" class="links">
          <a href="index.html">الرئيسية</a>
          <a href="index.html#games">الألعاب</a>
          <a href="market.html">السوق</a>
          <a href="#support">الدعم</a>
        </nav>
        <div class="acts">
          <button id="currBtn" class="cartbtn currbtn" aria-label="العملة" title="تغيير العملة"><span id="currLabel">ج.م</span></button>
          <button id="themeBtn" class="cartbtn themebtn" aria-label="الوضع الليلي/النهاري" title="تبديل الوضع الليلي/النهاري"><span id="themeIcon">🌙</span></button>
          <button id="walletBtn" class="cartbtn walletbtn" aria-label="المحفظة" title="المحفظة" hidden>💳<span id="walletLabel">0 ج.م</span></button>
          <button id="acctBtn" class="cartbtn" aria-label="الحساب" title="الحساب"><img class="navico" src="icon-account.png" alt=""><span id="acctLabel" class="sr-only">دخول</span></button>
          <button id="chatBtn" class="cartbtn chatbtn" aria-label="الدردشة" title="الدردشة"><img class="navico" src="icon-chat.png" alt=""><span id="chatBadge" class="cbadge" hidden></span></button>
          <button id="cartBtn" class="cartbtn" aria-label="السلة" title="السلة"><img class="navico" src="icon-cart.png" alt=""><span id="count" class="cbadge cbadge-blue">0</span></button>
          <button id="menu" class="menu" aria-label="القائمة">☰</button>
        </div>
      </div>
    </header>`);
  document.body.insertAdjacentHTML("beforeend", `
    <footer class="foot" id="support">
      <div class="wrap">
        <div class="fgrid">
          <div><h4>${CONFIG.brand}</h4><p>متجر لشحن الألعاب وكروت الهدايا الرقمية في مصر، بدفع محلي وتسليم بعد تأكيد الطلب.</p></div>
          <div><h4>روابط سريعة</h4><ul><li><a href="index.html">الرئيسية</a></li><li><a href="index.html#games">كل الألعاب</a></li><li><a href="cards.html">كروت الهدايا</a></li></ul></div>
          <div><h4>تواصل معنا</h4><ul><li>القاهرة، مصر</li><li><a href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">واتساب: +${CONFIG.whatsapp}</a></li><li>${CONFIG.email}</li></ul></div>
        </div>
        <div class="fbar">
          <div class="pays"><span>فودافون كاش</span><span>انستاباي</span><span>فوري</span><span>أورانج كاش</span><span>PayPal</span></div>
          <div>© ${new Date().getFullYear()} ${CONFIG.brand}. كل الحقوق محفوظة. <button id="adminDot" class="admin-dot" aria-label="الإدارة" title="الإدارة">•</button></div>
        </div>
      </div>
    </footer>
    <div id="overlay" class="overlay"></div>
    <aside id="drawer" class="drawer">
      <div class="dh"><b>سلة المشتريات</b><button id="close" class="x" aria-label="إغلاق">✕</button></div>
      <div id="cartBody" class="db">
        <div id="items"></div>
        <div id="checkout" hidden>
          <div class="tot"><span id="totlbl">الإجمالي</span><b id="total"></b></div>
          <a id="goCheckout" href="checkout.html" class="btn full">استكمال الطلب</a>
        </div>
      </div>
      <div id="done" class="db" hidden>
        <h3>تم تسجيل طلبك ✅</h3>
        <p id="oid"></p>
        <p>ابعت الطلب على واتساب وهنكمل الدفع والشحن معاك.</p>
        <a id="wa" class="btn full" target="_blank" rel="noopener">ابعت الطلب على واتساب</a>
        <button id="again" class="ghost">رجوع للمتجر</button>
      </div>
    </aside>
    <div id="toast" class="toast"></div>
    <aside id="walletDrawer" class="drawer wallet-drawer">
      <div class="dh"><b>محفظتي</b><button id="walletClose" class="x" aria-label="إغلاق">✕</button></div>
      <div class="db">
        <div class="wallet-total"><div><small>الرصيد الحالي</small><strong id="walletBalance">0 ج.م</strong></div><div><small>النقاط</small><strong id="walletPoints">0</strong></div></div>
        <button id="walletConvertBtn" class="ghost full">تحويل كل 100 نقطة إلى 1 ج.م</button>
        <h3>شحن المحفظة</h3>
        <p class="sub">اختر وسيلة التحويل وأرسل الطلب، وسيضيف الأدمن الرصيد بعد المراجعة.</p>
        <label class="lbl" for="walletAmount">المبلغ بالجنيه</label>
        <input id="walletAmount" class="inp" type="number" min="10" max="100000" placeholder="مثال: 100">
        <label class="lbl" for="walletMethod">وسيلة الدفع</label>
        <select id="walletMethod" class="inp">${WALLET_TOPUP_METHODS.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}</select>
        <label class="lbl" for="walletNote">رقم العملية أو ملاحظات</label>
        <textarea id="walletNote" class="inp" rows="3" placeholder="اكتب رقم العملية أو أي تفاصيل تساعدنا"></textarea>
        <button id="walletRequestBtn" class="btn full">إرسال طلب الشحن</button>
        <p id="walletErr" class="form-err"></p>
      </div>
    </aside>
    <div id="adminGate" class="admin-gate" hidden>
      <div class="admin-gate-box">
        <button id="adminGateClose" class="x" aria-label="إغلاق">✕</button>
        <h3>دخول الإدارة</h3>
        <input id="adminPassword" class="inp" type="password" inputmode="numeric" placeholder="كلمة المرور">
        <button id="adminPasswordBtn" class="btn full">دخول</button>
        <p id="adminPasswordErr" class="form-err"></p>
      </div>
    </div>
    <div id="currMenu" class="currmenu" hidden>
      ${CURRENCIES.map(c => `<button class="curropt" data-cur="${c.id}"><span>${c.flag}</span><b>${c.label}</b><small>${c.symbol}</small></button>`).join("")}
    </div>`);
  buildAuthUI();
  buildChatUI();
  updateAccountUI();
  updateThemeUI();
  updateCurrencyUI();
}

function wireShell() {
  $("cartBtn").addEventListener("click", openCart);
  $("close").addEventListener("click", closeCart);
  $("overlay").addEventListener("click", () => {
    closeCart();
    closeAuth();
    closeChat();
    closeWallet();
    closeCurrMenu();
  });
  $("menu").addEventListener("click", () => {
    $("links").classList.toggle("open");
    $("menu").classList.toggle("open");
  });
  $("links").addEventListener("click", () => {
    $("links").classList.remove("open");
    $("menu").classList.remove("open");
  });
  document.addEventListener("click", e => {
    if (!e.target.closest("#links") && !e.target.closest("#menu")) {
      $("links").classList.remove("open");
      $("menu").classList.remove("open");
    }
  });
  $("annx").addEventListener("click", () => $("ann").remove());
  $("themeBtn").addEventListener("click", toggleTheme);
  $("walletBtn").addEventListener("click", openWallet);
  $("walletClose").addEventListener("click", closeWallet);
  $("walletRequestBtn").addEventListener("click", submitWalletRequest);
  $("walletConvertBtn").addEventListener("click", convertWalletPoints);
  $("adminDot").addEventListener("click", () => {
    $("adminGate").hidden = false;
    $("adminPassword").focus();
  });
  $("adminGateClose").addEventListener("click", () => { $("adminGate").hidden = true; });
  $("adminPasswordBtn").addEventListener("click", () => {
    if ($("adminPassword").value === "01147497465") {
      location.assign("admin.html");
      return;
    }
    $("adminPasswordErr").textContent = "كلمة المرور غير صحيحة";
  });
  $("currBtn").addEventListener("click", e => {
    e.stopPropagation();
    $("currMenu").hidden = !$("currMenu").hidden;
  });
  $("currMenu").addEventListener("click", e => {
    const btn = e.target.closest(".curropt");
    if (!btn) return;
    setCurrency(btn.dataset.cur);
    closeCurrMenu();
  });
  document.addEventListener("click", e => {
    if (!e.target.closest("#currMenu") && !e.target.closest("#currBtn")) closeCurrMenu();
  });
}

function closeCurrMenu() {
  const m = $("currMenu");
  if (m) m.hidden = true;
}

// الوضع الليلي/النهاري: بيتخزن الاختيار في المتصفح وبيتطبق على كل صفحات الموقع.
// التطبيق الفعلي بيحصل بسكربت صغير في أول <head> كل صفحة عشان يمنع "ومضة" اللون
// الغلط لحظة تحميل الصفحة؛ هنا بنظبط بس شكل الزرار وبنسمح للمستخدم يبدّل.
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  document.documentElement.style.colorScheme = next;
  try { localStorage.setItem("gc-theme", next); } catch (e) {}
  updateThemeUI();
}

function updateThemeUI() {
  const icon = $("themeIcon");
  const cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  if (icon) icon.textContent = cur === "light" ? "☀️" : "🌙";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", cur === "light" ? "#ffffff" : "#19191c");
}

function setCurrency(id) {
  const c = CURRENCIES.find(x => x.id === id) || CURRENCIES[0];
  const changed = c.id !== currentCurrency().id;
  try { localStorage.setItem("gc-currency", c.id); } catch (e) {}
  updateCurrencyUI();
  // بنعمل ريفريش للصفحة عشان كل الأسعار المعروضة (كروت، سلة، تفاصيل المنتج) تتحول للعملة الجديدة فورًا.
  if (changed) location.reload();
}

function updateCurrencyUI() {
  const lbl = $("currLabel");
  if (!lbl) return;
  lbl.textContent = currentCurrency().symbol;
}

function pic(...srcs) {
  const c = [];
  srcs.filter(Boolean).forEach(s => {
    const base = s.replace(/\.[a-z0-9]+$/i, "");
    [s, ...["jpg", "jpeg", "png", "webp"].map(e => base + "." + e)].forEach(x => {
      if (!c.includes(x)) c.push(x);
    });
  });
  if (!c.length) return "";
  return `<img src="${c[0]}" alt="" data-q="${c.slice(1).join("|")}" loading="lazy" onerror="imgFail(this)">`;
}

function imgFail(el) {
  const q = (el.dataset.q || "").split("|").filter(Boolean);
  if (!q.length) {
    el.remove();
    return;
  }
  el.src = q.shift();
  el.dataset.q = q.join("|");
}

function startAutoRefresh() {
  const refresh = () => {
    const editing = document.querySelector("input:focus, textarea:focus, select:focus, [contenteditable='true']");
    const openPanel = document.querySelector(".drawer.open, .admin-gate:not([hidden])");
    if (document.visibilityState === "visible" && !editing && !openPanel) location.reload();
  };
  setInterval(refresh, 120000);
}

startAutoRefresh();
