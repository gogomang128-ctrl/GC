
function gameCard(g, i) {
  const from = Math.min(...g.packs.map(p => p[1]));
  const cat = CATS.find(c => c.id === g.cat).name;
  return `
    <a class="gcard" href="${g.id}.html" style="--i:${i}">
      <div class="gimg" style="background:${g.tint}">
        <span class="gemo">${g.icon}</span>${pic(IMAGES.games[g.id])}
        <span class="gcat">${cat}</span>
        <span class="garrow">←</span>
      </div>
      <div class="gover"><b>${g.name}</b><span class="gfrom">من ${fmt(from)}</span></div>
    </a>`;
}

function renderGrid() {
  const q = query.trim().toLowerCase();
  const list = GAMES.filter(g => (filter === "all" || g.cat === filter) && (g.name + " " + g.en).toLowerCase().includes(q));
  const cat = CATS.find(c => c.id === filter);
  $("gtitle").textContent = cat ? cat.name : "كل الألعاب";
  $("greset").hidden = filter === "all";
  $("grid").innerHTML = list.length ? list.map(gameCard).join("") : `<p class="empty">مفيش نتيجة بالاسم ده، جرب اسم تاني.</p>`;
}

function showSlide(n) {
  si = n;
  document.querySelectorAll(".slide").forEach((s, i) => {
    s.classList.toggle("on", i === n);
    const v = s.querySelector("video");
    if (!v) return;
    if (i !== n) {
      v.pause();
      return;
    }
    const played = v.play();
    if (played && played.catch) played.catch(() => {});
  });
  document.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("on", i === n));
}

function loadMarketPreview() {
  const grid = $("marketPreviewGrid");
  if (!grid || typeof db === "undefined") return;
  db.collection("items").orderBy("createdAt", "desc").get()
    .then(snap => {
      const items = snap.docs.map(d => ({id: d.id, ...d.data()}));
      grid.innerHTML = items.length
        ? items.map(mktCard).join("")
        : `<p class="empty">لسه مفيش إعلانات في السوق، كن أول واحد ينشر.</p>`;
    })
    .catch(() => {
      grid.innerHTML = `<p class="empty">مش قادرين نجيب إعلانات السوق دلوقتي.</p>`;
    });
}

function renderHome() {
  const slides = SLIDES.filter(s => byId(s.id));
  $("app").innerHTML = `
    <div class="wrap">
      <div class="slider">${slides.map((s, i) => {
        const g = byId(s.id);
        return `
        <div class="slide${i === 0 ? " on" : ""}">
          ${pic(IMAGES.slides[g.id])}
          <video muted loop playsinline preload="auto"><source src="${g.id}.mp4" type="video/mp4"><source src="${g.id}.webm" type="video/webm"></video>
          <div class="shade"></div>
          <div class="big">${g.icon}</div>
          <div class="stext"><h2>${s.t}</h2><p>${s.p}</p><a class="btn" href="${g.id}.html">اشحن الآن</a></div>
        </div>`;
      }).join("")}
        <div class="dots">${slides.map((s, i) => `<button class="dot${i === 0 ? " on" : ""}" data-s="${i}" aria-label="شريحة ${i + 1}"></button>`).join("")}</div>
      </div>
      <div class="marq"><div class="track">${GAMES.concat(GAMES).map(g => `<span>${g.icon} ${g.name}</span>`).join("")}</div></div>
      <div class="strip"><span>تسليم بعد تأكيد الدفع</span><span>دفع بالمحافظ المحلية</span><span>دعم عبر واتساب</span></div>
      <div class="searchrow">
        <input id="q" class="inp" placeholder="ابحث عن لعبة أو بطاقة..." autocomplete="off">
        <a class="btn" href="#games">تصفح الكل</a>
      </div>
      <div class="chips"><a class="chip" href="cards.html">Google Play</a><a class="chip" href="cards.html">iTunes</a><a class="chip" href="cards.html">Steam</a></div>
      <a class="promo" href="#games">
        <span class="promo-emo promo-emo1">🛒</span>
        <span class="promo-emo promo-emo2">🪙</span>
        <span class="promo-text"><b>عروض حصرية على شحن الألعاب</b><small>خصومات لفترة محدودة على أشهر الباقات</small><span class="promo-btn">تصفح العروض</span></span>
      </a>
      <section class="sec" id="games">
        <div class="sechead"><h2 id="gtitle"></h2><button id="greset" class="link" hidden>عرض الكل</button></div>
        <p class="sub">ادخل على صفحة اللعبة واختار الباقة المناسبة.</p>
        <div id="grid" class="grid"></div>
      </section>
      <section class="sec" id="marketPreview">
        <div class="sechead"><h2>سوق البيع والشراء</h2><a class="link" href="market.html">عرض كل الإعلانات</a></div>
        <p class="sub">إعلانات حقيقية بيحطها زوار الموقع نفسهم، بأسعار وتفاصيل واضحة.</p>
        <div id="marketPreviewGrid" class="grid"><p class="empty">جاري تحميل الإعلانات...</p></div>
      </section>
    </div>`;
  renderGrid();
  loadMarketPreview();
  document.querySelectorAll(".slide video").forEach(v => {
    v.muted = true;
    const last = v.querySelector("source:last-child");
    last.addEventListener("error", () => {
      console.warn("الفيديو مش لاقيه أو مش بيشتغل:", v.querySelector("source").src);
      v.remove();
    });
  });
  showSlide(0);
  setInterval(() => showSlide((si + 1) % slides.length), 6000);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(x => {
      if (!x.isIntersecting) return;
      x.target.classList.add("in");
      io.unobserve(x.target);
    }), {threshold: 0.1});
    document.querySelectorAll(".sec").forEach(s => {
      s.classList.add("rv");
      io.observe(s);
    });
  }
}
