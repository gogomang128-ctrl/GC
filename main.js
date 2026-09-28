
buildShell();
wireShell();

if (current) renderGame(current);
else renderHome();

renderCart();

$("app").addEventListener("click", e => {
  const s = e.target.closest(".dot");
  if (s) showSlide(+s.dataset.s);
  if (e.target.id === "greset") {
    filter = "all";
    renderGrid();
  }
  if (!current) return;
  const b = e.target.closest(".pack");
  if (b) {
    selPack = +b.dataset.i;
    refreshBuy();
  }
  const m = e.target.closest(".payopt");
  if (m) {
    selPay = m.dataset.p;
    refreshBuy();
  }
  if (e.target.id === "cartadd") {
    const d = readBuy(false);
    if (!d) return;
    const label = labelOf(current, d.p);
    const key = current.id + "|" + label + "|" + d.uid;
    const found = cart.find(i => i.key === key);
    if (found) found.qty++;
    else cart.push({key, game: current.name, label, price: d.p[1], uid: d.uid, qty: 1});
    save();
    renderCart();
    toast("تمت الإضافة للسلة ✓");
  }
  if (e.target.id === "buynow") {
    const d = readBuy(true);
    if (!d) return;
    const item = {game: current.name, label: labelOf(current, d.p), price: d.p[1], uid: d.uid, qty: 1};
    placeOrder(d.name, d.phone, [item], selPay, e.target, false);
  }
  if (e.target.id === "packSupport") {
    if (selPack < 0) {
      toast("اختار الباقة الأول");
      $("packs").scrollIntoView();
      return;
    }
    const selected = current.packs[selPack];
    sendPackToSupport({
      game: current.name,
      label: labelOf(current, selected),
      price: withFee(selected[1], selPay),
      uid: $("uid").value.trim()
    });
  }
});

$("app").addEventListener("input", e => {
  if (e.target.id === "q") {
    query = e.target.value;
    renderGrid();
  }
  if (e.target.id === "uid" && current) {
    ids[current.id] = e.target.value;
    store.set("ids", ids);
    e.target.classList.remove("err");
  }
});

$("again").addEventListener("click", () => {
  $("done").hidden = true;
  $("cartBody").hidden = false;
  closeCart();
});

$("app").addEventListener("click", e => {
  if (!current) return;
  const tb = e.target.closest(".tab");
  if (tb) {
    tab = tb.dataset.t;
    renderTab();
  }
  const st = e.target.closest(".star");
  if (st) {
    rating = +st.dataset.k;
    document.querySelectorAll(".star").forEach(x => {
      x.textContent = +x.dataset.k <= rating ? "★" : "☆";
    });
  }
  if (e.target.id !== "rsend") return;
  const name = $("rname").value.trim();
  const text = $("rtext").value.trim();
  if (!rating || !name) {
    toast("اختار عدد النجوم واكتب اسمك");
    return;
  }
  const all = store.get(REVIEWS_KEY, {});
  const list = Array.isArray(all[current.id]) ? all[current.id] : [];
  list.push({n: name, r: rating, t: text});
  all[current.id] = list;
  store.set(REVIEWS_KEY, all);
  rating = 0;
  renderReviews(current);
  toast("شكرا على تقييمك ✓");
});