const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch (e) {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      return;
    }
  }
};

const api = {
  async createOrder(order) {
    if (CONFIG.apiUrl) {
      const r = await fetch(CONFIG.apiUrl + "/orders", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(order)
      });
      if (!r.ok) throw new Error("api");
      return r.json();
    }
    await new Promise(res => setTimeout(res, 900));
    return {id: "GS-" + Date.now().toString(36).toUpperCase(), status: "pending"};
  }
};

function mktDeliveryBadge() {
  return `<span class="mdeliv">⚡ التسليم خلال 15–20 دقيقة</span>`;
}

function mktThumb(it, big) {
  const h = big ? "320px" : "100%";
  if (it.imageURL) {
    return `<img src="${esc(it.imageURL)}" alt="" style="width:100%;height:${h};object-fit:cover;display:block">`;
  }
  return `<div style="width:100%;height:${h};background:var(--surface)"></div>`;
}

function priceBlock(it) {
  if (it.oldPrice && it.oldPrice > it.price) {
    return `<span class="gfrom"><s style="opacity:.5;margin-inline-end:6px;font-weight:400">${fmt(it.oldPrice)}</s>${fmt(it.price)}</span>`;
  }
  return `<span class="gfrom">${fmt(it.price)}</span>`;
}

function stockLabel(it) {
  if (it.stock === 0) return "نفذت الكمية";
  if (it.stock != null) return `متبقي ${it.stock}`;
  return "";
}

function mktCard(it) {
  const stock = stockLabel(it);
  return `
    <a href="market.html#${it.id}" class="gcard" data-open="${it.id}" style="text-decoration:none">
      <div class="gimg">${mktThumb(it, false)}${it.game ? `<span class="gcat">${esc(it.game)}</span>` : ""}</div>
      <div class="gover"><b>${esc(it.title)}</b>${priceBlock(it)}${stock ? `<span class="${it.stock === 0 ? "gends" : "gstock"}">${esc(stock)}</span>` : ""}</div>
    </a>`;
}

const CLOUDINARY_CLOUD_NAME = "oy83zdfl";
const CLOUDINARY_UPLOAD_PRESET = "gamestore_uploads";

function compressImage(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width;
      let h = img.height;
      if (w > h && w > maxSize) {
        h = Math.round(h * (maxSize / w));
        w = maxSize;
      } else if (h > maxSize) {
        w = Math.round(w * (maxSize / h));
        h = maxSize;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error("compress-failed"));
          return;
        }
        resolve(blob);
      }, "image/jpeg", quality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image-load-failed"));
    };
    img.src = url;
  });
}

async function uploadImageFile(file) {
  if (!file) return "";
  const blob = await compressImage(file, 1280, 0.72);
  const form = new FormData();
  form.append("file", blob, `${Date.now()}.jpg`);
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form
  });
  if (!res.ok) throw new Error("cloudinary-upload-failed");
  const data = await res.json();
  return data.secure_url;
}

// شكل افتراضي (SVG) لوسيلة الدفع لو مفيش صورة حقيقية ليها لسه، أو الصورة مش موجودة.
function payBadgeSvg(m, h) {
  return `<svg width="${Math.round(h * 1.7)}" height="${h}" viewBox="0 0 84 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="82" height="38" rx="9" fill="${m.color}"></rect>
    <text x="42" y="25" text-anchor="middle" font-family="Cairo, Tahoma, sans-serif" font-size="${m.mark.length > 3 ? 13 : 16}" font-weight="900" fill="${m.ink}">${m.mark}</text>
  </svg>`;
}

// لو حطيت صورة شعار حقيقية لوسيلة الدفع (بنفس اسم الملف المكتوب في PAYMENTS)، هتتعرض بدل الشكل الافتراضي تلقائي.
// لو الصورة مش موجودة أو حصل خطأ في تحميلها، بيرجع تلقائي للشكل الافتراضي (الـ SVG الملوّن).
function payBadge(m, size) {
  const h = size || 32;
  const w = Math.round(h * 1.7);
  if (!m.image) return payBadgeSvg(m, h);
  return `<span class="paybadge" data-payid="${esc(m.id)}" data-size="${h}" style="display:inline-flex;align-items:center;justify-content:center;height:${h}px;width:${w}px;border-radius:9px;overflow:hidden;background:#fff;padding:3px">
    <img src="${esc(m.image)}" alt="${esc(m.name)}" style="width:100%;height:100%;object-fit:contain" onerror="payBadgeFallback(this)">
  </span>`;
}

function payBadgeFallback(imgEl) {
  const wrap = imgEl.closest(".paybadge");
  if (!wrap) return;
  const m = payOf(wrap.dataset.payid);
  wrap.style.background = "transparent";
  wrap.style.padding = "0";
  wrap.innerHTML = payBadgeSvg(m, +wrap.dataset.size || 32);
}

const $ = id => document.getElementById(id);

// أدمن الموقع المسموح لهم يضيفوا/يديروا إعلانات السوق، بيتحددوا بإيميل حساب جوجل بتاعهم.
function isAdmin() {
  return !!(currentUser && adminAccess);
}

let adminAccess = false;

function isOwner() {
  return !!(currentUser && currentUser.email === "gogomang128@gmail.com");
}

async function loadAdminAccess(user) {
  adminAccess = false;
  if (!user || !user.email) return false;
  if (user.email === "gogomang128@gmail.com") {
    adminAccess = true;
    return true;
  }
  try {
    const snap = await db.collection("admins").doc(user.email).get();
    adminAccess = snap.exists && snap.data().active !== false;
  } catch (err) {
    adminAccess = false;
  }
  return adminAccess;
}

const WALLET_TOPUP_METHODS = [
  {id: "instapay", name: "انستا باي"},
  {id: "vodafone", name: "فودافون كاش"},
  {id: "orange", name: "أورنج كاش"},
  {id: "etisalat", name: "اتصالات كاش"},
  {id: "card", name: "فيزا"},
  {id: "paypal", name: "PayPal"},
  {id: "points", name: "نقاط الموقع"}
];

function walletBalance() {
  return Math.max(0, Number(currentProfile && currentProfile.walletBalance) || 0);
}

function walletPoints() {
  return Math.max(0, Math.floor(Number(currentProfile && currentProfile.walletPoints) || 0));
}

function walletMethodName(id) {
  const method = WALLET_TOPUP_METHODS.find(x => x.id === id);
  return method ? method.name : id;
}

function walletErrorMessage(err) {
  if (err && err.message === "insufficient-funds") return "رصيد المحفظة غير كافي";
  if (err && err.code === "permission-denied") return "قواعد Firestore لا تسمح بهذه العملية. انشر firestore.rules أولًا.";
  return "حصل خطأ، حاول تاني";
}

async function refreshWalletProfile() {
  if (!currentUser) {
    currentProfile = null;
    refreshWalletUI();
    return;
  }
  const snap = await db.collection("users").doc(currentUser.uid).get();
  currentProfile = snap.exists ? snap.data() : currentProfile;
  refreshWalletUI();
}

function openWallet() {
  if (!currentUser) {
    openAuth();
    return;
  }
  refreshWalletProfile().catch(() => {});
  $("walletDrawer").classList.add("open");
  $("overlay").classList.add("open");
}

function closeWallet() {
  const drawer = $("walletDrawer");
  if (drawer) drawer.classList.remove("open");
  const overlay = $("overlay");
  if (overlay) overlay.classList.remove("open");
}

function refreshWalletUI() {
  const button = $("walletBtn");
  const label = $("walletLabel");
  const balance = $("walletBalance");
  if (button) button.hidden = !currentUser;
  if (label) label.textContent = walletBalance().toLocaleString("en-US") + " ج.م";
  if (balance) balance.textContent = label ? label.textContent : "0 ج.م";
  const points = $("walletPoints");
  if (points) points.textContent = walletPoints().toLocaleString("en-US");
}

async function submitWalletRequest() {
  if (!currentUser) return openAuth();
  const amount = Math.floor(Number($("walletAmount").value));
  const method = $("walletMethod").value;
  const note = $("walletNote").value.trim();
  if (!amount || amount < 10 || amount > 100000) {
    $("walletErr").textContent = "اكتب مبلغًا بين 10 و100000 جنيه";
    return;
  }
  const btn = $("walletRequestBtn");
  btn.disabled = true;
  $("walletErr").textContent = "";
  try {
    await db.collection("walletRequests").add({
      uid: currentUser.uid,
      name: currentProfile && currentProfile.name || currentUser.displayName || "مستخدم",
      email: currentUser.email || "",
      type: "topup",
      amount,
      method,
      note,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    $("walletAmount").value = "";
    $("walletNote").value = "";
    $("walletErr").textContent = "تم إرسال طلب الشحن، وسيتم مراجعته من الأدمن ✓";
  } catch (err) {
    $("walletErr").textContent = walletErrorMessage(err);
  } finally {
    btn.disabled = false;
  }
}

async function submitWalletWithdrawal() {
  if (!currentUser) return openAuth();
  const amount = Math.floor(Number($("walletWithdrawAmount").value));
  const method = $("walletWithdrawMethod").value;
  const note = $("walletWithdrawNote").value.trim();
  if (!amount || amount < 10 || amount > walletBalance()) {
    $("walletErr").textContent = "اكتب مبلغًا صحيحًا لا يتجاوز رصيد المحفظة";
    return;
  }
  try {
    await db.collection("walletRequests").add({
      uid: currentUser.uid,
      name: currentProfile && currentProfile.name || currentUser.displayName || "مستخدم",
      email: currentUser.email || "",
      type: "withdraw",
      amount,
      method,
      note,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    $("walletWithdrawAmount").value = "";
    $("walletWithdrawNote").value = "";
    $("walletErr").textContent = "تم إرسال طلب السحب، وسيتم مراجعته من الأدمن ✓";
  } catch (err) {
    $("walletErr").textContent = walletErrorMessage(err);
  }
}

async function convertWalletPoints() {
  if (!currentUser) return openAuth();
  const points = walletPoints();
  const amount = Math.floor(points / 100);
  if (amount < 1) {
    $("walletErr").textContent = "تحتاج إلى 100 نقطة على الأقل";
    return;
  }
  try {
    await db.collection("walletRequests").add({
      uid: currentUser.uid,
      name: currentProfile && currentProfile.name || currentUser.displayName || "مستخدم",
      email: currentUser.email || "",
      type: "convert",
      amount,
      points: points,
      method: "points",
      note: "تحويل نقاط إلى رصيد",
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    $("walletErr").textContent = "تم إرسال طلب تحويل النقاط، وسيتم مراجعته من الأدمن ✓";
  } catch (err) {
    $("walletErr").textContent = walletErrorMessage(err);
  }
}

async function spendWallet(amount, order) {
  if (!currentUser) throw new Error("login-required");
  const userRef = db.collection("users").doc(currentUser.uid);
  const orderRef = db.collection("walletOrders").doc();
  await db.runTransaction(async transaction => {
    const snap = await transaction.get(userRef);
    const balance = Number(snap.data() && snap.data().walletBalance) || 0;
    if (balance < amount) throw new Error("insufficient-funds");
    transaction.update(userRef, {
      walletBalance: firebase.firestore.FieldValue.increment(-amount),
      walletPoints: firebase.firestore.FieldValue.increment(Math.floor(amount / 10))
    });
    transaction.set(orderRef, {
      uid: currentUser.uid,
      customer: order.customer,
      items: order.items,
      total: amount,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  });
  await refreshWalletProfile();
  return orderRef.id;
}

// عرض السعر: كل المبالغ متخزنة بالجنيه المصري، وبتتحول للعملة المختارة للعرض فقط.
function currentCurrency() {
  let id = "EGP";
  try { id = localStorage.getItem("gc-currency") || "EGP"; } catch (e) {}
  return CURRENCIES.find(c => c.id === id) || CURRENCIES[0];
}
function fmtIn(n, cur) {
  const converted = n * cur.rate;
  const digits = cur.id === "EGP" ? converted.toLocaleString("en-US") : converted.toLocaleString("en-US", {maximumFractionDigits: 2});
  return digits + " " + cur.symbol;
}
// fmt: السعر بالعملة اللي المستخدم مختارها (للعرض في كروت المنتجات والسلة وتفاصيل المنتج).
const fmt = n => fmtIn(n, currentCurrency());
// fmtEGP: السعر الرسمي بالجنيه المصري دايمًا - يُستخدم في إجمالي الدفع النهائي ورسالة الواتساب
// عشان طرق الدفع (فودافون كاش/انستاباي/فوري) كلها بالجنيه المصري بغض النظر عن العملة المعروضة.
const fmtEGP = n => n.toLocaleString("en-US") + " ج.م";
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
const labelOf = (g, p) => (p[0] + " " + g.cur).trim();
const byId = id => GAMES.find(x => x.id === id);
const payOf = id => PAYMENTS.find(m => m.id === id) || PAYMENTS[0];
// ways to pay that the current visitor can actually use.
// the wallet only shows for a signed-in visitor, and it comes first because it's the fastest.
function availablePayments() {
  const wallet = PAYMENTS.filter(m => m.wallet);
  const others = PAYMENTS.filter(m => !m.wallet);
  return currentUser ? wallet.concat(others) : others;
}
const withFee = (n, id) => Math.round(n * (1 + payOf(id).fee));
const current = byId(document.body.dataset.game);

let cart = store.get("cart", []);
let ids = store.get("ids", {});
let timer;
let filter = "all";
let query = "";
let si = 0;

if (!Array.isArray(cart)) cart = [];

function save() {
  store.set("cart", cart);
}

function toast(m) {
  const t = $("toast");
  t.textContent = m;
  t.classList.add("show");
  clearTimeout(timer);
  timer = setTimeout(() => t.classList.remove("show"), 1800);
}

function total() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

const REVIEWS_KEY = "reviews";

const TABS = {
  desc: {t: "وصف المنتج", h: g => `<p>${g.about}</p><p>اكتب بيانات حسابك بشكل صحيح واختار الباقة، وبعد تأكيد الدفع بنبدأ التنفيذ. مش هنطلب منك كلمة سر اللعبة.</p>`},
  faq: {t: "الأسئلة الشائعة", h: g => `<p><b>هل محتاج كلمة سر؟</b></p><p>لا، بنحتاج ${g.field} فقط.</p><p><b>أدفع إزاي؟</b></p><p>بفودافون كاش أو انستاباي أو فوري، وبتكمل الدفع على واتساب.</p><p><b>لو كتبت البيانات غلط؟</b></p><p>راجعها قبل التأكيد، ولو حصل خطأ كلمنا على واتساب بأسرع وقت.</p>`},
  how: {t: "طريقة الاستخدام", h: g => `<p>1. اكتب ${g.field}.</p><p>2. اختار الباقة وأضفها للسلة.</p><p>3. أكد الطلب وابعته على واتساب وكمل الدفع.</p>`},
  terms: {t: "الشروط والأحكام", h: () => `<p>الشحن بيتم بعد مراجعة واعتماد إيصال الدفع.</p><p>صحة البيانات المكتوبة مسؤولية العميل.</p><p>راجع سياسة المتجر قبل تأكيد الطلب.</p>`}
};

let rating = 0;
let tab = "desc";
let selPack = -1;
let selPay = PAYMENTS[0].id;
