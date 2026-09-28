
let marketItemsAdmin = [];
let chats = [];
let selectedChatUid = null;
let chatThreadMsgs = [];
let chatThreadUnsub = null;
let walletRequests = [];
let teamAdmins = [];

function itemRow(it) {
  return `
    <div class="item">
      <div><b>${esc(it.title || "بدون اسم")}</b><small>${esc(it.game || "")} — ${fmt(it.price)} — ${esc(it.sellerName || "مستخدم")}</small></div>
      <button class="btn" data-delitem="${it.id}">مسح الإعلان</button>
    </div>`;
}

function chatRow(c) {
  const unread = c.adminUnread > 0;
  return `
    <div class="item crow ${unread ? "unread" : ""}" data-openchat="${c.id}">
      <div><b>${esc(c.name || "مستخدم")}</b><small>${esc(c.lastMessage || "")}</small></div>
      ${unread ? `<span class="cbadge" style="position:static">${c.adminUnread > 9 ? "9+" : c.adminUnread}</span>` : ""}
    </div>`;
}

function chatThreadBubble(m) {
  const fromAdmin = m.from === "admin";
  return `<div class="cmsg ${fromAdmin ? "cmsg-me" : "cmsg-them"}"><span>${esc(m.text)}</span></div>`;
}

function walletRequestRow(r) {
  const pending = r.status === "pending";
  const title = r.type === "withdraw" ? "طلب سحب" : r.type === "convert" ? "تحويل نقاط" : "شحن محفظة";
  return `<div class="item">
    <div><b>${title}: ${esc(r.name || "مستخدم")} — ${Number(r.amount || 0).toLocaleString("en-US")} ج.م</b><small>${esc(r.email || "")} — ${esc(walletMethodName(r.method))} — ${esc(r.note || "بدون ملاحظات")}</small></div>
    ${pending ? `<div style="display:flex;gap:8px"><button class="btn" data-wallet-approve="${r.id}">إضافة الرصيد</button><button class="ghost" data-wallet-reject="${r.id}">رفض</button></div>` : `<small>${r.status === "approved" ? "تمت الموافقة" : "مرفوض"}</small>`}
  </div>`;
}

function teamAdminRow(member) {
  return `<div class="item"><div><b>${esc(member.name || member.email)}</b><small>${esc(member.email)} — ${member.active === false ? "موقوف" : "نشط"}</small></div><button class="ghost" data-remove-admin="${esc(member.email)}">إزالة</button></div>`;
}

function renderChatThread() {
  const box = $("chatThread");
  if (!box) return;
  if (!selectedChatUid) {
    box.innerHTML = `<p class="empty">اختار محادثة من اللي فوق عشان تشوف الرسائل وترد.</p>`;
    return;
  }
  const c = chats.find(x => x.id === selectedChatUid) || {};
  box.innerHTML = `
    <div class="sechead" style="margin-bottom:10px"><h3>${esc(c.name || "مستخدم")}${c.whatsapp ? " — " + esc(c.whatsapp) : ""}</h3></div>
    <div id="chatThreadMsgs" style="max-height:360px;overflow-y:auto;margin-bottom:12px">
      ${chatThreadMsgs.length ? chatThreadMsgs.map(chatThreadBubble).join("") : `<p class="empty">لسه مفيش رسائل.</p>`}
    </div>
    <div class="chatbar" style="border:0;padding:0">
      <input id="adminChatInput" class="inp" placeholder="اكتب الرد...">
      <button id="adminChatSend" class="btn">إرسال</button>
    </div>`;
  const box2 = $("chatThreadMsgs");
  if (box2) box2.scrollTop = box2.scrollHeight;
}

function renderLists() {
  const il = $("itemsList");
  const cl = $("chatsList");
  if (il) il.innerHTML = marketItemsAdmin.length ? marketItemsAdmin.map(itemRow).join("") : `<p class="empty">مفيش إعلانات في السوق دلوقتي.</p>`;
  if (cl) cl.innerHTML = chats.length ? chats.map(chatRow).join("") : `<p class="empty">مفيش محادثات دلوقتي.</p>`;
  const wl = $("walletRequestsList");
  if (wl) wl.innerHTML = walletRequests.length ? walletRequests.map(walletRequestRow).join("") : `<p class="empty">مفيش طلبات محفظة.</p>`;
  const al = $("teamAdminsList");
  if (al) al.innerHTML = teamAdmins.length ? teamAdmins.map(teamAdminRow).join("") : `<p class="empty">أضف أول عضو للفريق.</p>`;
}

function renderAdmin() {
  if (!currentUser) {
    $("app").innerHTML = `
      <section class="wrap sec" style="text-align:center;padding:60px 0">
        <h2>سجّل دخول</h2>
        <button id="goAuth" class="btn" style="margin-top:14px">تسجيل الدخول</button>
      </section>`;
    return;
  }
  if (!isAdmin()) {
    $("app").innerHTML = `
      <section class="wrap sec" style="text-align:center;padding:60px 0">
        <h2>الصفحة دي مش متاحة</h2>
      </section>`;
    return;
  }
  $("app").innerHTML = `
    <section class="wrap sec">
      <div class="sechead"><h2>كل إعلانات السوق</h2></div>
      <div id="itemsList"></div>
      <div class="sechead" style="margin-top:30px"><h2>الدردشات</h2></div>
      <div id="chatsList"></div>
      <div class="sechead" style="margin-top:30px"><h2>طلبات المحفظة</h2></div>
      <div id="walletRequestsList"></div>
      ${isOwner() ? `<div class="sechead" style="margin-top:30px"><h2>فريق الإدارة</h2></div>
      <div id="teamAdminsList"></div>
      <div class="mform" style="max-width:520px">
        <input id="teamAdminEmail" class="inp" type="email" placeholder="بريد موظف Google">
        <input id="teamAdminName" class="inp" style="margin-top:10px" placeholder="اسم الموظف (اختياري)">
        <button id="teamAdminAdd" class="btn" style="margin-top:10px">إضافة عضو للفريق</button>
        <p id="teamAdminErr" class="mform-err"></p>
      </div>` : ""}
      <div class="sechead" style="margin-top:30px"><h2>تعديل رصيد عميل</h2></div>
      <div class="mform" style="max-width:520px">
        <input id="walletAdminUid" class="inp" placeholder="UID أو بريد أو اسم العميل">
        <input id="walletAdminAmount" class="inp" style="margin-top:10px" type="number" placeholder="المبلغ (موجب إضافة، سالب خصم)">
        <input id="walletAdminReason" class="inp" style="margin-top:10px" placeholder="سبب العملية">
        <button id="walletAdminApply" class="btn" style="margin-top:10px">تطبيق التعديل</button>
        <p id="walletAdminErr" class="mform-err"></p>
      </div>
      <div id="chatThread" style="margin-top:16px"></div>
    </section>`;
  renderLists();
  renderChatThread();
}

function listenAdmin() {
  if (!isAdmin()) return;
  db.collection("items").orderBy("createdAt", "desc")
    .onSnapshot(snap => {
      marketItemsAdmin = snap.docs.map(d => ({id: d.id, ...d.data()}));
      renderLists();
    }, err => console.error(err));
  db.collection("chats").orderBy("lastAt", "desc")
    .onSnapshot(snap => {
      chats = snap.docs.map(d => ({id: d.id, ...d.data()}));
      renderLists();
    }, err => console.error(err));
  db.collection("walletRequests").orderBy("createdAt", "desc")
    .onSnapshot(snap => {
      walletRequests = snap.docs.map(d => ({id: d.id, ...d.data()}));
      renderLists();
    }, err => console.error(err));
  if (isOwner()) db.collection("admins").onSnapshot(snap => {
    teamAdmins = snap.docs.map(d => ({email: d.id, ...d.data()}));
    renderLists();
  }, err => console.error(err));
}

async function addTeamAdmin() {
  if (!isOwner()) return;
  const email = $("teamAdminEmail").value.trim().toLowerCase();
  const name = $("teamAdminName").value.trim();
  const errBox = $("teamAdminErr");
  errBox.textContent = "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errBox.textContent = "اكتب بريد Google صحيح";
    return;
  }
  try {
    await db.collection("admins").doc(email).set({email, name, active: true, addedBy: currentUser.email, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
    $("teamAdminEmail").value = "";
    $("teamAdminName").value = "";
    toast("تمت إضافة عضو الفريق ✓");
  } catch (err) {
    errBox.textContent = err.code === "permission-denied" ? "صلاحية إدارة الفريق غير منشورة في Firestore" : "تعذر إضافة العضو";
  }
}

async function findWalletUser(identifier) {
  const value = identifier.trim();
  const directRef = db.collection("users").doc(value);
  const directSnap = await directRef.get();
  if (directSnap.exists) return {ref: directRef, snap: directSnap};
  for (const field of ["email", "name"]) {
    const snap = await db.collection("users").where(field, "==", value).limit(1).get();
    if (!snap.empty) return {ref: snap.docs[0].ref, snap: snap.docs[0]};
  }
  throw new Error("user-not-found");
}

async function adjustWallet(identifier, amount, reason, requestId, pointsDelta) {
  const user = await findWalletUser(identifier);
  const userRef = user.ref;
  const uid = userRef.id;
  const requestRef = requestId ? db.collection("walletRequests").doc(requestId) : null;
  await db.runTransaction(async transaction => {
    const snap = await transaction.get(userRef);
    const balance = Number(snap.data().walletBalance) || 0;
    const points = Number(snap.data().walletPoints) || 0;
    if (balance + amount < 0) throw new Error("negative-balance");
    if (pointsDelta && points + pointsDelta < 0) throw new Error("negative-points");
    transaction.update(userRef, {
      walletBalance: firebase.firestore.FieldValue.increment(amount),
      ...(pointsDelta ? {walletPoints: firebase.firestore.FieldValue.increment(pointsDelta)} : {})
    });
    transaction.set(db.collection("walletTransactions").doc(), {
      uid, amount, reason: reason || "تعديل من الأدمن", adminEmail: currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    if (requestRef) transaction.update(requestRef, {status: "approved", reviewedAt: firebase.firestore.FieldValue.serverTimestamp(), reviewedBy: currentUser.email});
  });
}

function openAdminChat(uid) {
  selectedChatUid = uid;
  if (chatThreadUnsub) chatThreadUnsub();
  chatThreadUnsub = db.collection("chats").doc(uid).collection("messages")
    .orderBy("createdAt", "asc")
    .onSnapshot(snap => {
      chatThreadMsgs = snap.docs.map(d => d.data());
      renderChatThread();
    }, err => console.error(err));
  db.collection("chats").doc(uid).set({adminUnread: 0}, {merge: true}).catch(() => {});
}

async function sendAdminChatMsg() {
  const input = $("adminChatInput");
  if (!input || !selectedChatUid) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  const ref = db.collection("chats").doc(selectedChatUid);
  try {
    await ref.collection("messages").add({
      text,
      from: "admin",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await ref.set({
      lastMessage: text,
      lastFrom: "admin",
      lastAt: firebase.firestore.FieldValue.serverTimestamp(),
      userUnread: firebase.firestore.FieldValue.increment(1),
      adminUnread: 0
    }, {merge: true});
  } catch (err) {
    toast("حصل خطأ، حاول تاني");
    input.value = text;
  }
}

document.addEventListener("click", async e => {
  if (e.target.id === "goAuth") openAuth();

  const del = e.target.closest("[data-delitem]");
  if (del) {
    if (!confirm("متأكد إنك عايز تمسح الإعلان ده؟")) return;
    try {
      await db.collection("items").doc(del.dataset.delitem).delete();
      toast("تم مسح الإعلان ✓");
    } catch (err) {
      toast("حصل خطأ، حاول تاني");
    }
  }

  const chatRowEl = e.target.closest("[data-openchat]");
  if (chatRowEl) openAdminChat(chatRowEl.dataset.openchat);

  if (e.target.id === "adminChatSend") sendAdminChatMsg();
  if (e.target.id === "teamAdminAdd") addTeamAdmin();
  const removeAdmin = e.target.closest("[data-remove-admin]");
  if (removeAdmin) {
    if (!isOwner()) return;
    if (removeAdmin.dataset.removeAdmin === currentUser.email) {
      toast("لا يمكن إزالة حسابك الحالي");
      return;
    }
    try {
      await db.collection("admins").doc(removeAdmin.dataset.removeAdmin).delete();
      toast("تمت إزالة عضو الفريق");
    } catch (err) { toast("تعذر إزالة العضو"); }
  }
  const approve = e.target.closest("[data-wallet-approve]");
  if (approve) {
    const request = walletRequests.find(x => x.id === approve.dataset.walletApprove);
    if (!request) return;
    approve.disabled = true;
    try {
      const pointsDelta = request.type === "convert" ? -Number(request.points || 0) : 0;
      const amount = request.type === "withdraw" ? -Number(request.amount) : Number(request.amount);
      await adjustWallet(request.uid, amount, request.type === "convert" ? "تحويل نقاط إلى رصيد" : request.type === "withdraw" ? "سحب من المحفظة عبر " + walletMethodName(request.method) : "شحن محفظة عبر " + walletMethodName(request.method), request.id, pointsDelta);
      toast("تم إضافة الرصيد ✓");
    } catch (err) {
      toast(err.message === "user-not-found" ? "لم يتم العثور على العميل بالـUID أو البريد أو الاسم" : err.code === "permission-denied" ? "صلاحية الأدمن غير منشورة في Firestore أو الحساب غير صحيح" : "تعذر تعديل الرصيد");
      approve.disabled = false;
    }
  }
  const reject = e.target.closest("[data-wallet-reject]");
  if (reject) {
    try {
      await db.collection("walletRequests").doc(reject.dataset.walletReject).update({status: "rejected", reviewedAt: firebase.firestore.FieldValue.serverTimestamp(), reviewedBy: currentUser.email});
      toast("تم رفض الطلب");
    } catch (err) { toast("تعذر تحديث الطلب"); }
  }
  if (e.target.id === "walletAdminApply") {
    const uid = $("walletAdminUid").value.trim();
    const amount = Math.floor(Number($("walletAdminAmount").value));
    const reason = $("walletAdminReason").value.trim();
    const errBox = $("walletAdminErr");
    errBox.textContent = "";
    if (!uid || !amount) { errBox.textContent = "اكتب UID ومبلغًا صحيحًا"; return; }
    e.target.disabled = true;
    try {
      await adjustWallet(uid, amount, reason);
      $("walletAdminUid").value = "";
      $("walletAdminAmount").value = "";
      $("walletAdminReason").value = "";
      toast("تم تعديل الرصيد ✓");
    } catch (err) {
      errBox.textContent = err.message === "user-not-found" ? "لم يتم العثور على العميل بالـUID أو البريد أو الاسم" : err.message === "negative-balance" ? "لا يمكن أن يصبح الرصيد سالبًا" : err.code === "permission-denied" ? "صلاحية الأدمن غير منشورة في Firestore أو الحساب غير صحيح" : "تعذر تعديل الرصيد";
    } finally { e.target.disabled = false; }
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.id === "adminChatInput") sendAdminChatMsg();
});

function onAuthChangedPage() {
  renderAdmin();
  listenAdmin();
}

buildShell();
wireShell();
renderCart();
renderAdmin();
listenAdmin();
