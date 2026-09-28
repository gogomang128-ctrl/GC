let marketItems = [];
let view = "list";
let activeId = null;
let picked = null;

function renderMarketGrid() {
  const grid = $("marketGrid");
  if (!grid) return;
  grid.innerHTML = marketItems.length
    ? marketItems.map(mktCard).join("")
    : `<p class="empty">لسه مفيش إعلانات، تابعنا قريبًا.</p>`;
}

function sellerAccessBlock() {
  if (!isAdmin()) return "";
  return `<button id="addItemBtn" class="btn">+ أضف إعلان</button>`;
}

function renderList() {
  $("app").innerHTML = `
    <section class="wrap sec">
      <div class="crumbs">الرئيسية / السوق</div>
      <div class="sechead"><h2>سوق البيع والشراء</h2></div>
      <p class="sub">إعلانات حقيقية من المتجر، تقدر تطلبها على طول. ${mktDeliveryBadge()}</p>
      ${sellerAccessBlock()}
      <div id="itemForm" hidden class="mform">
        <input id="itTitle" class="inp" placeholder="اسم الحساب / المنتج">
        <input id="itGame" class="inp" style="margin-top:10px" placeholder="اللعبة (مثلاً ببجي، فري فاير)">
        <div style="display:flex;gap:10px;margin-top:10px">
          <input id="itPrice" class="inp" style="flex:1" placeholder="السعر الحالي بالجنيه" inputmode="numeric">
          <input id="itOldPrice" class="inp" style="flex:1" placeholder="السعر قبل الخصم (اختياري)" inputmode="numeric">
        </div>
        <input id="itStock" class="inp" style="margin-top:10px" placeholder="الكمية المتاحة (اختياري، سيبها فاضية لو غير محدودة)" inputmode="numeric">
        <textarea id="itDesc" class="inp" style="margin-top:10px;min-height:90px" placeholder="وصف تفصيلي: حالة الحساب، رتبة، محتوى، أي تفاصيل مهمة"></textarea>
        <label class="lbl">صورة (اختياري)</label>
        <input id="itImg" type="file" accept="image/*" class="inp">
        <div id="itPreviewWrap" hidden style="margin-top:10px"><img id="itPreview" class="mpreview"></div>
        <button id="itSubmit" class="btn full">نشر الإعلان</button>
        <p id="itErr" class="mform-err"></p>
      </div>
      <div id="marketGrid" class="grid" style="margin-top:20px"></div>
    </section>`;
  renderMarketGrid();
}

function renderDetail() {
  const it = marketItems.find(x => x.id === activeId);
  if (!it) {
    view = "list";
    renderList();
    return;
  }
  const outOfStock = it.stock === 0;
  const qty = 1;
  const pays = availablePayments().filter(m => !m.manual);
  const msg = encodeURIComponent(`مهتم بإعلان: ${it.title} — السعر ${it.price} ${CONFIG.currency}`);
  const waLink = `https://wa.me/${CONFIG.whatsapp}?text=${msg}`;
  const priceLine = it.oldPrice && it.oldPrice > it.price
    ? `<s style="opacity:.5;margin-inline-end:8px;font-weight:400;font-size:16px">${fmt(it.oldPrice)}</s>${fmt(it.price)}`
    : fmt(it.price);
  $("app").innerHTML = `
    <section class="wrap sec">
      <div class="crumbs">الرئيسية / السوق / ${esc(it.game || "إعلان")}</div>
      <button id="backBtn" class="link" style="margin-bottom:14px">→ رجوع للسوق</button>
      <div class="mdet">
        <div class="mmain">
          <h1 class="mtitle">${esc(it.title)}</h1>
          <div class="mseller">
            <span class="mavatar">${esc((it.sellerName || "م")[0])}</span>
            <div class="msellerinfo">
              <b>${esc(it.sellerName || "مستخدم")}</b>
              <small>بائع موثوق على المنصة</small>
            </div>
          </div>
          <div class="minfobox">${it.imageURL ? `<img src="${esc(it.imageURL)}" alt="" class="mmainimg">` : `<div class="mmainimg mmainimg-empty"></div>`}</div>
          <h3 class="mh3">تفاصيل المنتج</h3>
          <div class="ptiles">
            <div>🎮 ${esc(it.game || "غير محدد")}</div>
            <div>⚡ تسليم خلال 15–20 دقيقة</div>
            ${it.stock != null ? `<div>📦 ${outOfStock ? "نفذت الكمية" : "متبقي " + it.stock}</div>` : ""}
          </div>
          <h3 class="mh3">الوصف</h3>
          <p class="mdesc">${esc(it.desc || "لا يوجد وصف إضافي من البائع.")}</p>
        </div>
        <aside class="msidebar">
          <div class="mprice">
            <span>السعر</span>
            <b>${priceLine}</b>
          </div>
          ${outOfStock ? `
          <p class="msub" style="margin-top:14px">نفذت الكمية دلوقتي، تقدر تتواصل مع البائع لمعرفة متى تتوفر تاني.</p>
          <a class="btn full" target="_blank" rel="noopener" href="${waLink}">تواصل مع البائع</a>
          ` : `
          <div class="mqty">
            <span>الكمية</span>
            <div class="mqtybtns">
              <button id="qtyMinus" type="button">−</button>
              <b id="qtyVal">${qty}</b>
              <button id="qtyPlus" type="button">+</button>
            </div>
          </div>
          <div class="mtotal">
            <span>الإجمالي</span>
            <b id="mtotalVal">${fmt(it.price * qty)}</b>
          </div>
          <button class="btn full" type="button" id="mcheckout">إتمام الطلب</button>
          `}
          <div class="mprotect">
            <div>🛡️ حمايتك مضمونة، الدفع بيتأكد قبل التسليم</div>
            <div>🕒 تغطية 14 يوم من وقت التسليم</div>
          </div>
          <div class="mpaylbl">وسائل الدفع المتاحة</div>
          <div class="mpayrow">${pays.map(m => `<span title="${m.name}">${payBadge(m, 28)}</span>`).join("")}</div>
        </aside>
      </div>
    </section>`;
  if (outOfStock) return;
  let curQty = qty;
  const upd = () => {
    $("qtyVal").textContent = curQty;
    $("mtotalVal").textContent = fmt(it.price * curQty);
  };
  $("qtyMinus").addEventListener("click", () => {
    if (curQty > 1) curQty--;
    upd();
  });
  $("qtyPlus").addEventListener("click", () => {
    if (it.stock == null || curQty < it.stock) curQty++;
    upd();
  });
  $("mcheckout").addEventListener("click", () => {
    const key = "market-" + it.id;
    const found = cart.find(i => i.key === key);
    if (found) found.qty = curQty;
    else cart.push({key, game: it.game || "السوق", label: it.title, price: it.price, uid: "", img: it.imageURL || "", qty: curQty, stock: it.stock});
    save();
    renderCart();
    location.href = "checkout.html";
  });
}

function renderMarket() {
  if (view === "detail") renderDetail();
  else renderList();
}

function listenMarket() {
  db.collection("items").orderBy("createdAt", "desc").onSnapshot(snap => {
    marketItems = snap.docs.map(d => ({id: d.id, ...d.data()}));
    if (view === "list") renderMarketGrid();
    else if (view === "detail") renderDetail();
  }, err => console.error(err));
}

document.addEventListener("click", e => {
  if (e.target.id === "addItemBtn") {
    $("itemForm").hidden = !$("itemForm").hidden;
  }

  if (e.target.id === "backBtn") {
    view = "list";
    activeId = null;
    renderMarket();
  }

  const open = e.target.closest("[data-open]");
  if (open) {
    e.preventDefault();
    activeId = open.dataset.open;
    view = "detail";
    renderMarket();
  }
});

document.addEventListener("change", e => {
  if (e.target.id !== "itImg") return;
  const file = e.target.files[0];
  picked = file || null;
  if (!file) {
    $("itPreviewWrap").hidden = true;
    return;
  }
  const url = URL.createObjectURL(file);
  $("itPreview").src = url;
  $("itPreviewWrap").hidden = false;
});

document.addEventListener("click", async e => {
  if (e.target.id !== "itSubmit") return;
  if (!currentUser) {
    openAuth();
    return;
  }
  if (!isAdmin()) {
    toast("النشر متاح للإدارة بس");
    return;
  }
  const title = $("itTitle").value.trim();
  const game = $("itGame").value.trim();
  const price = +$("itPrice").value;
  const oldPriceRaw = $("itOldPrice").value.trim();
  const stockRaw = $("itStock").value.trim();
  const oldPriceVal = oldPriceRaw ? +oldPriceRaw : null;
  const oldPrice = oldPriceVal && oldPriceVal > price ? oldPriceVal : null;
  const stock = stockRaw ? Math.max(0, Math.floor(+stockRaw)) : null;
  const desc = $("itDesc").value.trim();
  $("itErr").textContent = "";
  if (!title || !price) {
    $("itErr").textContent = "اكتب اسم المنتج والسعر";
    return;
  }
  e.target.disabled = true;
  e.target.textContent = "جاري رفع الصورة...";
  try {
    const imageURL = await uploadImageFile(picked);
    e.target.textContent = "جاري النشر...";
    await db.collection("items").add({
      sellerId: currentUser.uid,
      sellerName: (currentProfile && currentProfile.name) || currentUser.displayName || "مستخدم",
      title, game, price, oldPrice, stock, desc, imageURL,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    $("itTitle").value = "";
    $("itGame").value = "";
    $("itPrice").value = "";
    $("itOldPrice").value = "";
    $("itStock").value = "";
    $("itDesc").value = "";
    $("itImg").value = "";
    $("itPreviewWrap").hidden = true;
    picked = null;
    $("itemForm").hidden = true;
    toast("تم نشر إعلانك ✓");
  } catch (err) {
    console.error(err);
    $("itErr").textContent = "حصل خطأ، حاول تاني";
  } finally {
    e.target.disabled = false;
    e.target.textContent = "نشر الإعلان";
  }
});

function onAuthChangedPage() {
  renderMarket();
}

if (location.hash) {
  activeId = decodeURIComponent(location.hash.slice(1));
  view = "detail";
}

buildShell();
wireShell();
renderCart();
renderMarket();
listenMarket();
