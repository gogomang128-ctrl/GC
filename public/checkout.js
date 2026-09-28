
let selPayCo = (PAYMENTS.find(m => m.id === "vodafone") || PAYMENTS[0]).id;
let selCountryCo = payOf(selPayCo).country || "EG";

function coCountryOptions() {
  return Object.keys(PHONE_COUNTRIES).map(k => `<option value="${k}"${k === selCountryCo ? " selected" : ""}>${PHONE_COUNTRIES[k].flag} ${PHONE_COUNTRIES[k].label}</option>`).join("");
}

function coThumb(i) {
  if (i.img) return `<img src="${esc(i.img)}" alt="">`;
  const gid = (i.key || "").split("|")[0];
  const img = gid && IMAGES.games[gid];
  return img ? `<img src="${img}" alt="">` : "🎮";
}

function coItemRow(i) {
  return `
    <div class="coitem">
      <div class="coithumb">${coThumb(i)}<span class="coibadge">${i.qty}</span></div>
      <div class="coiinfo"><b>${esc(i.label)}</b><small>${esc(i.game)}${i.uid ? " — " + esc(i.uid) : ""}</small></div>
      <div class="coiprice">${fmt(i.price * i.qty)}</div>
    </div>`;
}

function coPayRow(m) {
  const on = m.id === selPayCo;
  const desc = m.note || "سيتم عرض تفاصيل الدفع بعد إكمال هذه المرحلة";
  return `
    <button class="corow${on ? " on" : ""}" type="button" data-pay="${m.id}">
      <span class="coradio"></span>
      <span class="coleft">${payBadge(m, 26)}<b>${esc(m.name)}${m.fee ? " (+" + Math.round(m.fee * 100) + "%)" : ""}</b></span>
      <small>${desc}</small>
    </button>`;
}

// وسيلة الدفع من المحفظة: بتظهر بس للزائر المسجّل، ولو مش مسجّل بتقوله يسجل.
// بنستخدمها في مكانين: هنا في السلة، وفي صفحات الألعاب عن طريق availablePayments() في state.js.
function coWalletRow() {
  const on = selPayCo === "wallet";
  const note = currentUser
    ? `الرصيد المتاح: ${fmtEGP(walletBalance())}`
    : "سجّل دخولك الأول عشان تقدر تدفع من رصيد محفظتك";
  return `<button class="corow${on ? " on" : ""}${currentUser ? "" : " needs-login"}" type="button" data-pay="wallet">
    <span class="coradio"></span><span class="coleft">💳<b>الدفع من المحفظة</b></span>
    <small>${note}</small>
  </button>`;
}

// Payments العادية بس من غير المحفظة، لأن المحفظة ليها صف خاص بيها فوق.
function coPayRowsHtml() {
  return PAYMENTS.filter(m => !m.wallet).map(coPayRow).join("");
}

function coPaysHtml() {
  return coWalletRow() + coPayRowsHtml();
}

// بعد تسجيل الدخول بنحدّث قائمة الدفع بس (من غير ما نعيد رسم الفورم ونمسيح اللي كتبه الزائر).
function onAuthChangedPage() {
  const box = $("coPays");
  if (box) box.innerHTML = coPaysHtml();
  const totalEl = $("coTotal");
  if (totalEl) totalEl.textContent = fmtEGP(selPayCo === "wallet" ? total() : withFee(total(), selPayCo));
}

function coEmpty() {
  $("app").innerHTML = `
    <div class="wrap sec" style="text-align:center;padding:60px 0">
      <h2>سلتك فاضية</h2>
      <p class="sub">أضف باقة الأول عشان تكمل الطلب.</p>
      <a class="btn" href="index.html">تصفح الألعاب</a>
    </div>`;
}

function renderCheckout() {
  if (!cart.length) {
    coEmpty();
    return;
  }
  const t = total();
  $("app").innerHTML = `
    <div class="wrap co">
      <div class="cogrid">
        <div class="fstep cosum">
          <h2><span class="obadge">${cart.reduce((s, i) => s + i.qty, 0)}</span>تأكيد الطلب</h2>
          <div>${cart.map(coItemRow).join("")}</div>
          <div class="corow2"><span>سلة التسوق</span><b>${fmt(t)}</b></div>
          <div class="corow2 disc"><span>خصم</span><b>${fmt(0)}</b></div>
          <div class="corow2 total"><span>المجموع (بالجنيه المصري)</span><b id="coTotal">${fmtEGP(withFee(t, selPayCo))}</b></div>
          ${currentCurrency().id !== "EGP" ? `<p id="coEstNote" class="sub" style="margin-top:-6px;font-size:13px">≈ ${fmt(withFee(t, selPayCo))} (سعر تقريبي — الدفع الفعلي بالجنيه المصري)</p>` : ""}
        </div>
        <div class="cocol">
          <div class="fstep">
            <h2>تفاصيل الفاتورة</h2>
            <div class="cofields">
              <div><label class="lbl" for="coName">اسمك *</label><input id="coName" class="inp" autocomplete="name" placeholder="اكتب اسمك"></div>
              <div><label class="lbl" for="coEmail">بريدك الالكتروني (اختياري)</label><input id="coEmail" class="inp" type="email" autocomplete="email" placeholder="example@mail.com"></div>
            </div>
            <label class="lbl" for="coPhone">رقم الهاتف *</label>
            <div class="cophone">
              <select id="coCountry" class="coflag-sel">${coCountryOptions()}</select>
              <input id="coPhone" class="inp" inputmode="tel" autocomplete="tel" placeholder="ادخل رقم هاتفك">
            </div>
            <label class="lbl" for="coNote">معلومات إضافية (اختياري)</label>
            <textarea id="coNote" class="inp" rows="3" placeholder="أي تفاصيل إضافية عن طلبك"></textarea>
          </div>
          <div class="fstep">
            <h2>وسيلة الدفع</h2>
            <div id="coPays">${coPaysHtml()}</div>
          </div>
          <button id="coSubmit" class="btn full lg">تأكيد الطلب!</button>
        </div>
      </div>
    </div>`;
}

function coDone(orderId, waText) {
  const waLink = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(waText);
  $("app").innerHTML = `
    <div class="wrap sec" style="text-align:center;padding:60px 0">
      <h2>تم تسجيل طلبك ✅</h2>
      <p>رقم الطلب: ${esc(orderId)}</p>
      <p>هنفتحلك واتساب على طول عشان تكمل تحويل المبلغ وترفع صورة الوصل.</p>
      <a class="btn" target="_blank" rel="noopener" href="${waLink}">فتح واتساب</a>
      <a class="ghost" style="display:inline-block;margin-top:10px" href="index.html">رجوع للمتجر</a>
    </div>`;
  window.open(waLink, "_blank");
}

async function submitCheckout(btn) {
  if (selPayCo === "wallet" && !currentUser) {
    toast("سجّل دخولك الأول عشان تقدر تدفع من محفظتك");
    openAuth();
    return;
  }
  const name = $("coName").value.trim();
  const phoneRaw = $("coPhone").value.replace(/\s/g, "");
  const c = PHONE_COUNTRIES[selCountryCo] || PHONE_COUNTRIES.EG;
  const digits = c.strip0 ? phoneRaw.replace(/^0/, "") : phoneRaw.replace(/^\+/, "");
  const digitsOnly = digits.replace(/\D/g, "");
  const validLen = digitsOnly.length >= c.min && digitsOnly.length <= c.max;
  if (!name || !validLen) {
    toast("اكتب اسمك ورقم هاتف صحيح");
    return;
  }
  const idle = btn.textContent;
  btn.disabled = true;
  btn.textContent = "جاري تسجيل الطلب...";
  const email = $("coEmail").value.trim();
  const note = $("coNote").value.trim();
  const phone = c.dial ? "+" + c.dial + digitsOnly : "+" + digitsOnly;
  const sum = total();
  const order = {
    customer: {name, phone, email},
    payment: selPayCo === "wallet" ? "المحفظة" : payOf(selPayCo).name,
    items: cart.map(({game, label, price, uid, qty}) => ({game, label, price, uid, qty})),
    total: withFee(sum, selPayCo)
  };
  try {
    if (selPayCo === "wallet") {
      if (!currentUser) throw new Error("login-required");
      const walletOrderId = await spendWallet(order.total, order);
      const orders = store.get("orders", []);
      orders.push({...order, id: walletOrderId, payment: "المحفظة"});
      store.set("orders", orders);
      cart = [];
      save();
      renderCart();
      coDoneWallet(walletOrderId);
      return;
    }
    const res = await api.createOrder(order);
    const orders = store.get("orders", []);
    orders.push({...order, id: res.id});
    store.set("orders", orders);
    const lines = order.items.map(i => `- ${i.game} ${i.label} x${i.qty}${i.uid ? " (ID: " + i.uid + ")" : ""}`).join("\n");
    const text = `طلب جديد ${res.id}\nالاسم: ${name}\nالهاتف: ${phone}${email ? "\nالإيميل: " + email : ""}\n${lines}${note ? "\nملاحظات: " + note : ""}\nالإجمالي: ${fmtEGP(order.total)}\nالدفع: ${order.payment}\n\nبرجاء تحويل مبلغ ${fmtEGP(order.total)} على وسيلة الدفع المختارة، وإرسال صورة وصل التحويل هنا عشان نأكد الطلب ونبدأ التنفيذ.`;
    cart = [];
    save();
    renderCart();
    coDone(res.id, text);
  } catch (err) {
    toast(selPayCo === "wallet" ? walletErrorMessage(err) : "الطلب ماتسجلش، جرب تاني");
    btn.disabled = false;
    btn.textContent = idle;
  }
}

function coDoneWallet(orderId) {
  $("app").innerHTML = `<div class="wrap sec" style="text-align:center;padding:60px 0">
    <h2>تم الدفع من المحفظة ✅</h2><p>رقم الطلب: ${esc(orderId)}</p>
    <p>تم خصم المبلغ وسيبدأ تنفيذ طلبك بعد المراجعة.</p>
    <a class="btn" href="index.html">رجوع للمتجر</a></div>`;
}

document.addEventListener("click", e => {
  const p = e.target.closest(".corow[data-pay]");
  if (p) {
    // المحفظة محتاجة حساب مسجّل، فبنحوّله لتسجيل الدخول بدل ما نختار وسيلة مستحيلة.
    if (p.dataset.pay === "wallet" && !currentUser) {
      openAuth();
      return;
    }
    selPayCo = p.dataset.pay;
    document.querySelectorAll(".corow").forEach(b => b.classList.toggle("on", b.dataset.pay === selPayCo));
    const totalEl = $("coTotal");
    if (totalEl) totalEl.textContent = fmtEGP(selPayCo === "wallet" ? total() : withFee(total(), selPayCo));
    const estEl = $("coEstNote");
    if (estEl) estEl.textContent = `≈ ${fmt(selPayCo === "wallet" ? total() : withFee(total(), selPayCo))} (الدفع بالجنيه المصري)`;
    const country = payOf(selPayCo).country;
    if (country) {
      selCountryCo = country;
      const sel = $("coCountry");
      if (sel) sel.value = selCountryCo;
    }
  }
  if (e.target.id === "coSubmit") submitCheckout(e.target);
});

document.addEventListener("change", e => {
  if (e.target.id === "coCountry") selCountryCo = e.target.value;
});

buildShell();
wireShell();
renderCart();
renderCheckout();
