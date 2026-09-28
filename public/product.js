
function stars(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function renderTab() {
  $("tabs").innerHTML = Object.keys(TABS).map(k => `<button class="tab${k === tab ? " on" : ""}" data-t="${k}">${TABS[k].t}</button>`).join("");
  $("tabbody").innerHTML = TABS[tab].h(current);
}

function renderReviews(g) {
  const all = store.get(REVIEWS_KEY, {});
  const list = Array.isArray(all[g.id]) ? all[g.id] : [];
  const avg = list.length ? list.reduce((s, r) => s + r.r, 0) / list.length : 0;
  const bars = [5, 4, 3, 2, 1].map(k => {
    const w = list.length ? Math.round(list.filter(r => r.r === k).length / list.length * 100) : 0;
    return `<div class="bar5"><span>${k} ★</span><i><u style="width:${w}%"></u></i></div>`;
  }).join("");
  const cards = list.length ? list.slice().reverse().map(r => `
    <div class="rcard"><div class="rtop"><b>${esc(r.n)}</b><span class="stars">${stars(r.r)}</span></div>${r.t ? `<p>${esc(r.t)}</p>` : ""}</div>`).join("") : `<p class="empty">لسه مفيش تقييمات. كن أول واحد يقيّم.</p>`;
  $("reviews").innerHTML = `
    <h2>تقييمات العملاء <small>(${list.length} تقييم)</small></h2>
    <div class="rsum">
      <div class="ravg"><b>${list.length ? avg.toFixed(1) : "—"}</b><span class="stars">${stars(Math.round(avg))}</span></div>
      <div class="rbars">${bars}</div>
    </div>
    <div class="rgrid">
      <div>${cards}</div>
      <div class="rform">
        <h3>اكتب تقييمك</h3>
        <div class="rst">${[1, 2, 3, 4, 5].map(k => `<button class="star" data-k="${k}">☆</button>`).join("")}</div>
        <input id="rname" class="inp" placeholder="اسمك">
        <textarea id="rtext" class="inp" rows="3" placeholder="شاركنا تجربتك..."></textarea>
        <button id="rsend" class="btn full">إرسال التقييم</button>
      </div>
    </div>`;
}

function coins(cur, n) {
  const count = Math.min(n + 1, 5);
  const size = cur.length <= 2 ? 13 : cur.length <= 4 ? 10 : 8;
  let layers = "";
  for (let k = 0; k < count; k++) {
    const y = 62 - k * 9;
    layers += `<ellipse cx="40" cy="${y + 6}" rx="26" ry="9" fill="#000"/><rect x="14" y="${y}" width="52" height="6" fill="#fff"/><ellipse cx="40" cy="${y}" rx="26" ry="9" fill="#fff" stroke="#000" stroke-width="1.5"/>`;
  }
  const top = 62 - (count - 1) * 9;
  return `<svg viewBox="0 0 80 80" aria-hidden="true">${layers}<text x="40" y="${top + 4}" text-anchor="middle" font-size="${size}" font-weight="900" fill="#000">${esc(cur)}</text></svg>`;
}

function packCard(g, p, i) {
  const label = labelOf(g, p);
  const best = i === (g.best === undefined ? 1 : g.best);
  const old = p[2] > p[1];
  const custom = IMAGES.packs[g.id + "-" + p[0]] || IMAGES.packs[g.id];
  return `
    <button class="pack${best ? " best" : ""}" data-i="${i}">
      ${best ? `<span class="pbest">★ الأفضل مبيعًا</span>` : ""}
      <span class="ptitle">${esc(label)}</span>
      <span class="pthumb">${custom ? pic(custom) : coins(g.cur || "$", i)}</span>
      <span class="pfoot">
        <small>من</small>
        <b>${fmt(p[1])}</b>
        ${old ? `<span class="pold"><s>${fmt(p[2])}</s><i>-${Math.round((1 - p[1] / p[2]) * 100)}%</i></span>` : ""}
      </span>
    </button>`;
}

function refreshBuy() {
  const p = selPack < 0 ? null : current.packs[selPack];
  const m = payOf(selPay);
  document.querySelectorAll(".pack").forEach(b => b.classList.toggle("on", +b.dataset.i === selPack));
  document.querySelectorAll(".payopt").forEach(b => {
    b.classList.toggle("on", b.dataset.p === selPay);
    b.querySelector(".pprice").textContent = p ? fmt(withFee(p[1], b.dataset.p)) : "—";
  });
  $("bmeta").textContent = p ? m.name + " • " + labelOf(current, p) : "اختر باقة وطريقة دفع";
  $("btotal").textContent = p ? fmt(withFee(p[1], selPay)) : "—";
}

function readBuy(full) {
  if (selPack < 0) {
    toast("اختار الباقة الأول");
    $("packs").scrollIntoView();
    return null;
  }
  const input = $("uid");
  const uid = input.value.trim();
  if (!uid) {
    input.classList.add("err");
    input.focus();
    toast("اكتب " + current.field + " الأول");
    return null;
  }
  const name = $("bname").value.trim();
  const phone = $("bphone").value.replace(/\s/g, "");
  if (full && (!name || !/^\+?\d{10,14}$/.test(phone))) {
    toast("اكتب اسمك ورقم واتساب صحيح");
    return null;
  }
  return {p: current.packs[selPack], uid, name, phone};
}

async function placeOrder(name, phone, items, payId, btn, fromCart) {
  const idle = btn.textContent;
  btn.disabled = true;
  btn.textContent = "جاري تسجيل الطلب...";
  const sum = items.reduce((s, i) => s + i.price * i.qty, 0);
  const order = {
    customer: {name, phone},
    payment: payOf(payId).name,
    items: items.map(({game, label, price, uid, qty}) => ({game, label, price, uid, qty})),
    total: withFee(sum, payId)
  };
  try {
    const res = await api.createOrder(order);
    const orders = store.get("orders", []);
    orders.push({...order, id: res.id});
    store.set("orders", orders);
    const lines = order.items.map(i => `- ${i.game} ${i.label} x${i.qty} (ID: ${i.uid})`).join("\n");
    const text = `طلب جديد ${res.id}
الاسم: ${name}
واتساب: ${phone}
${lines}
الإجمالي: ${fmt(order.total)}
الدفع: ${order.payment}

برجاء تحويل مبلغ ${fmt(order.total)} على وسيلة الدفع المختارة، وإرسال صورة وصل التحويل هنا عشان نأكد الطلب ونبدأ التنفيذ.`;
    const waLink = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text);
    $("oid").textContent = "رقم الطلب: " + res.id;
    $("wa").href = waLink;
    $("cartBody").hidden = true;
    $("done").hidden = false;
    window.open(waLink, "_blank");
    if (fromCart) {
      cart = [];
      save();
      renderCart();
    } else {
      openCart();
    }
  } catch (err) {
    toast("الطلب ماتسجلش، جرب تاني");
  }
  btn.disabled = false;
  btn.textContent = idle;
}

function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function renderGame(g) {
  document.title = "شحن " + g.name + " | " + CONFIG.brand;
  setMeta("description", "اشحن " + g.name + " بسرعة وأمان في مصر، اختار باقتك وادفع فودافون كاش أو انستاباي أو فوري واستلم شحنك في دقائق.");
  const from = Math.min(...g.packs.map(p => p[1]));
  const cat = CATS.find(c => c.id === g.cat).name;
  const cover = `<span class="gemo">${g.icon}</span>${pic(IMAGES.games[g.id])}`;
  $("app").innerHTML = `
    <div class="wrap">
      <a class="backlnk" href="index.html">→ رجوع</a>
      <div class="pd">
        <div class="pinfo">
          <span class="pcat">${cat}</span>
          <h1>${g.name}</h1>
          <p class="pabout">${g.about}</p>
          <div class="note">⏱ يتم تنفيذ الشحن بعد مراجعة واعتماد الإيصال</div>
          <div class="buyrow">
            <div class="from"><small>تبدأ من</small><b>${fmt(from)}</b><small>${g.packs.length} باقات متاحة</small></div>
            <a class="btn choose" href="#packs">اختر باقة</a>
          </div>
        </div>
        <div class="pmedia">
          <div class="pimg"><div class="gimg" style="background:${g.tint}">${cover}</div><div class="pbs"><span>شحن مباشر</span><span>بعد المراجعة</span></div></div>
          <div class="ptiles"><div>🛡️ دفع يدوي واضح</div><div>⭐ سعر واضح</div></div>
        </div>
      </div>
      <div class="flow" id="packs">
        <section class="fstep">
          <h2><span class="fnum">1</span>اختر الباقة <small>(${g.packs.length} خيار)</small></h2>
          <div class="packs">${g.packs.map((p, i) => packCard(g, p, i)).join("")}</div>
        </section>
        <section class="fstep">
          <h2><span class="fnum">2</span>اختر طريقة الدفع</h2>
          <div class="paygrid">${PAYMENTS.map(m => `
            <button class="payopt${m.id === selPay ? " on" : ""}" data-p="${m.id}">
              <span style="display:block;margin-bottom:8px">${payBadge(m, 32)}</span>
              <span class="pmeth">${m.name}</span>
              <b class="pprice">—</b>
            </button>`).join("")}
          </div>
        </section>
        <section class="fstep">
          <h2><span class="fnum">3</span>أدخل بياناتك</h2>
          <label class="lbl" for="uid">${g.field}</label>
          <input id="uid" class="inp" autocomplete="off" value="${esc(ids[g.id] || "")}">
          <label class="lbl" for="bname">الاسم</label>
          <input id="bname" class="inp" autocomplete="name">
          <label class="lbl" for="bphone">رقم واتساب</label>
          <input id="bphone" class="inp" inputmode="tel" placeholder="01012345678">
        </section>
        <div class="buybar">
          <div class="bsum"><span id="bmeta"></span><b id="btotal"></b></div>
          <div class="bbtns">
            <button id="buynow" class="btn">اشتري الآن</button>
            <button id="cartadd" class="bcart">أضف للسلة</button>
          </div>
          <button id="packSupport" class="ghost full">💬 اسأل الدعم عن هذه الباقة</button>
        </div>
      </div>
      <section class="psec"><div id="tabs" class="tabs"></div><div id="tabbody" class="tabbody"></div></section>
      <section class="psec" id="reviews"></section>
    </div>`;
  renderTab();
  renderReviews(g);
  refreshBuy();
}
