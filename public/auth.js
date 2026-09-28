

let currentUser = null;
let currentProfile = null;

function buildAuthUI() {
  document.body.insertAdjacentHTML("beforeend", `
    <aside id="authDrawer" class="drawer">
      <div class="dh"><b id="authTitle">تسجيل الدخول</b><button id="authClose" class="x" aria-label="إغلاق">✕</button></div>
      <div class="db">
        <p class="sub" style="margin-top:0">سجّل دخولك بحساب جوجل عشان تكمل.</p>
        <button id="googleBtn" class="btn full">المتابعة بحساب جوجل</button>
        <p id="authErr" style="color:#e0212b;font-weight:700;min-height:20px;margin-top:10px"></p>
      </div>
    </aside>`);
}

function openAuth() {
  closeCart();
  closeChat();
  $("authErr").textContent = "";
  $("authDrawer").classList.add("open");
  $("overlay").classList.add("open");
}

function closeAuth() {
  $("authDrawer").classList.remove("open");
  $("overlay").classList.remove("open");
}

function unauthorizedDomainMsg() {
  const host = location.hostname;
  if (location.protocol === "file:") {
    return "الموقع مفتوح مباشرة كملف (file://) وده مش مسموح في Firebase. شغّل سيرفر محلي وافتح الموقع من http://localhost:8080 بدل ما تفتح index.html مباشرة.";
  }
  return "النطاق غير مسموح في Firebase. افتح Firebase Console > Authentication > Settings > Authorized domains وأضف: " + (host || "localhost");
}

function authErrMsg(err) {
  const m = {
    "auth/popup-closed-by-user": "اتقفلت نافذة جوجل قبل ما تكمل",
    "auth/cancelled-popup-request": "نافذة تسجيل دخول أخرى مفتوحة بالفعل، أغلقها وانتظر لحظة ثم حاول مرة واحدة",
    "auth/network-request-failed": "فيه مشكلة في الاتصال بالإنترنت",
    "auth/configuration-not-found": "تسجيل Google غير مفعّل في مشروع Firebase الجديد. فعّل Authentication ومزوّد Google من Firebase Console.",
    "auth/unauthorized-domain": unauthorizedDomainMsg(),
    "permission-denied": "تم تسجيل الدخول، لكن قواعد Firestore غير منشورة أو لا تسمح بحفظ حسابك. انشر ملف firestore.rules إلى مشروع Firebase ثم حاول مرة أخرى."
  };
  return m[(err && err.code) || ""] || (err && err.message) || "حصل خطأ، حاول تاني";
}

let authBusy = false;

async function ensureUserDoc(user) {
  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      name: user.displayName || "مستخدم",
      email: user.email || "",
      whatsapp: "",
      photoURL: user.photoURL || "",
      walletBalance: 0,
      walletPoints: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
  const fresh = await ref.get();
  currentProfile = fresh.data();
}

async function signInGoogle() {
  if (authBusy) return;
  authBusy = true;
  $("authErr").textContent = "";
  const button = $("googleBtn");
  if (button) {
    button.disabled = true;
    button.textContent = "جاري فتح تسجيل الدخول...";
  }
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await auth.signInWithPopup(provider);
    await ensureUserDoc(cred.user);
    closeAuth();
  } catch (err) {
    if (err && (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request")) {
      try {
        await auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
        return;
      } catch (redirectErr) {
        $("authErr").textContent = authErrMsg(redirectErr);
      }
    }
    $("authErr").textContent = authErrMsg(err);
  } finally {
    authBusy = false;
    if (button) {
      button.disabled = false;
      button.textContent = "المتابعة بحساب جوجل";
    }
  }
}

auth.getRedirectResult().then(result => {
  if (result && result.user) return ensureUserDoc(result.user);
}).catch(err => {
  const box = $("authErr");
  if (box) box.textContent = authErrMsg(err);
});

function logOut() {
  auth.signOut();
  location.href = "index.html";
}

function updateAccountUI() {
  const lbl = $("acctLabel");
  if (!lbl) return;
  lbl.textContent = currentUser ? ((currentProfile && currentProfile.name) || "حسابي").split(" ")[0] : "دخول";
}

auth.onAuthStateChanged(async user => {
  currentUser = user;
  if (user) {
    await ensureUserDoc(user);
  } else {
    currentProfile = null;
  }
  if (typeof loadAdminAccess === "function") await loadAdminAccess(user);
  if (user && typeof isAdmin === "function" && isAdmin() && !location.pathname.endsWith("/admin.html")) {
    location.replace("admin.html");
    return;
  }
  updateAccountUI();
  if (typeof refreshWalletUI === "function") refreshWalletUI();
  if (typeof onAuthChangedPage === "function") onAuthChangedPage();
});

document.addEventListener("click", e => {
  if (e.target.closest("#acctBtn")) {
    if (currentUser) location.href = "profile.html";
    else openAuth();
  }
  if (e.target.id === "authClose") closeAuth();
  if (e.target.id === "googleBtn") signInGoogle();
});
