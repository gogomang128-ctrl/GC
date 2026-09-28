
function renderCart() {
  $("count").textContent = cart.reduce((s, i) => s + i.qty, 0);
  $("items").innerHTML = cart.length ? cart.map((i, n) => `
    <div class="item">
      <div><b>${esc(i.game)} - ${esc(i.label)}</b><small>${esc(i.uid)}</small></div>
      <div class="qty"><button data-a="dec" data-n="${n}">−</button><span>${i.qty}</span><button data-a="inc" data-n="${n}">+</button></div>
      <div class="ip">${fmt(i.price * i.qty)}</div>
      <button class="rm" data-a="rm" data-n="${n}" aria-label="حذف">✕</button>
    </div>`).join("") : `<p class="empty">السلة فاضية. اختار لعبة وأضف باقة.</p>`;
  $("total").textContent = fmt(total());
  $("totlbl").textContent = "الإجمالي";
  $("checkout").hidden = !cart.length;
}

function openCart() {
  closeAuth();
  closeChat();
  $("drawer").classList.add("open");
  $("overlay").classList.add("open");
}

function closeCart() {
  $("drawer").classList.remove("open");
  $("overlay").classList.remove("open");
}

document.addEventListener("click", e => {
  const b = e.target.closest("#items button[data-a]");
  if (!b) return;
  const n = +b.dataset.n;
  const i = cart[n];
  if (!i) return;
  if (b.dataset.a === "inc") {
    if (i.stock == null || i.qty < i.stock) i.qty++;
    else toast("الكمية المتاحة من المنتج ده " + i.stock + " بس");
  }
  if (b.dataset.a === "dec") i.qty--;
  if (b.dataset.a === "rm" || i.qty < 1) cart.splice(n, 1);
  save();
  renderCart();
});

// عناصر السلة اللي اتضافت زمان (قبل ما نبعت رقم الستوك مع كل عنصر) أو من متصفح فيه نسخة قديمة
// من الموقع محفوظة كانت بتفضل من غير حد أقصى للأبد. الدالة دي بتجيب أحدث رقم ستوك من قاعدة
// البيانات لأي عنصر سوق موجود في السلة وتظبطه (وتقص الكمية لو كانت زودت عن المتاح فعلاً).
function syncCartStockFromDB() {
  if (typeof db === "undefined") return;
  const items = cart.filter(i => (i.key || "").startsWith("market-"));
  if (!items.length) return;
  Promise.all(items.map(i =>
    db.collection("items").doc(i.key.slice(7)).get()
      .then(doc => {
        if (!doc.exists) return;
        i.stock = doc.data().stock;
        if (i.stock != null && i.qty > i.stock) i.qty = i.stock;
      })
      .catch(() => {})
  )).then(() => {
    save();
    renderCart();
  });
}

syncCartStockFromDB();
