

let chatMsgsUnsub = null;
let chatBadgeUnsub = null;
let chatOpen = false;

const BOT_RULES = [
  {kw: ["مرحبا", "اهلا", "أهلا", "هاي", "السلام عليكم", "هلا"], reply: "أهلاً بيك في " + (typeof CONFIG !== "undefined" ? CONFIG.brand : "المتجر") + "! 👋 قولي محتاج مساعدة في إيه؟"},
  {kw: ["تسليم", "استلام", "هيوصل", "وقت الشحن", "كام هيوصل", "بيتاخر", "امتى هيوصل"], reply: "التسليم بيتم عادةً خلال 15–20 دقيقة من تأكيد الدفع. لو اتأخر أكتر من كدا ابعتلنا رقم الطلب وهنتابعه."},
  {kw: ["دفع", "ادفع", "فودافون", "انستاباي", "فوري", "اورانج", "فيزا", "ماستر كارد", "instapay", "paypal"], reply: "بندعم الدفع بفودافون كاش، انستاباي، فوري، أورانج كاش، بطاقة بنكية، وPayPal."},
  {kw: ["طلبي", "اوردر", "order", "حالة الطلب", "الطلب بتاعي", "وصل طلبي"], reply: "لو عندك رقم الطلب ابعتهولنا هنا وهنتابعلك حالته على طول."},
  {kw: ["مواعيد", "شغالين", "متاحين", "اونلاين امتى", "بتردوا امتى", "شغل من الساعة كام"], reply: "فريق الدعم بيرد يوميًا تقريبًا من 10 الصبح لحد 12 بالليل، وهيوصلك رد من حد حقيقي في أقرب وقت."},
  {kw: ["مشكلة", "غلط", "مضروب", "مانوصلنيش", "مش شغال", "معطل"], reply: "آسفين على أي إزعاج! ابعتلنا تفاصيل المشكلة ورقم الطلب لو موجود، وهنحلها بأسرع وقت."},
  {kw: ["سعر", "بكام", "اسعار", "أسعار", "تكلفة", "تمن"], reply: "الأسعار مختلفة حسب اللعبة والباقة اللي هتختارها — افتح صفحة اللعبة من الرئيسية وهتلاقي كل الباقات وأسعارها موضحة."},
  {kw: ["ازاي اطلب", "طريقة الطلب", "كيف اشتري", "كيفية الشراء", "ازاي اشحن"], reply: "بسيطة: ادخل صفحة اللعبة، اختار الباقة، اكتب الـ ID بتاعك، اختار وسيلة الدفع، وأكّد الطلب. الشحن بييجيلك بعد تأكيد الدفع."},
  {kw: ["حد ادنى", "أقل حد", "الحد الأدنى", "اقل مبلغ"], reply: "مفيش حد أدنى للطلب، تقدر تشحن أي باقة من أصغر باقة متاحة في صفحة اللعبة."},
  {kw: ["الغاء", "إلغاء", "استرجاع", "استرداد", "ارجاع الفلوس", "عايز فلوسي"], reply: "لو الطلب لسه ما اتنفذش ممكن نلغيه ونرجعلك فلوسك، ابعتلنا رقم الطلب هنا وهنشوفه. أما بعد الشحن فمينفعش استرجاع لأنه بيتحول فورًا للحساب."},
  {kw: ["نصابين", "امان", "موثوق", "ثقة", "حقيقي ولا نصب"], reply: "المتجر شغال بشكل رسمي وفيه آلاف الطلبات المنفذة، والدفع بيتم بعد تأكيدك، والتسليم بييجي على حسابك مباشرة. لو عندك أي قلق تقدر تتابع طلبك من هنا في أي وقت."},
  {kw: ["الايدي", "ال id", "منين اجيب الايدي", "player id", "uid بتاعي"], reply: "الـ ID أو Player ID بتلاقيه في بروفايلك جوه اللعبة نفسها، أو في صفحة الحساب. لو مش لاقيه ابعتلنا اسم اللعبة وهنوضحلك مكانه بالظبط."},
  {kw: ["خصم", "كوبون", "عرض", "كود خصم"], reply: "لو فيه عروض أو أكواد خصم شغالة هتلاقيها ظاهرة في صفحة اللعبة أو في السلة وقت الدفع."},
  {kw: ["كارت هدية", "جيفت كارد", "gift card", "ايتونز", "جوجل بلاي", "ستيم كارد"], reply: "أيوه بنوفر كروت هدايا زي ستيم وجوجل بلاي وايتونز، تقدر تلاقيهم في صفحة كروت الهدايا من القائمة الرئيسية."},
  {kw: ["بيع حساب", "اشتري حساب", "السوق", "market"], reply: "لو عايز تبيع أو تشتري حساب لعبة، عندنا صفحة السوق مخصصة لده — تقدر توصلها من رابط \"السوق\" في القائمة فوق."},
  {kw: ["عايز اتكلم مع حد", "موظف حقيقي", "مش عايز بوت", "مش انسان", "حد يرد"], reply: "تمام، رسالتك وصلت لفريق الدعم وهيرد عليك شخص حقيقي في أقرب وقت ممكن."},
  {kw: ["شكرا", "تسلم", "متشكر", "الله يخليك"], reply: "العفو، تحت أمرك في أي وقت! 🙏"},
  {kw: ["عندكم", "متاح", "لعبة", "ببجي", "فري فاير", "روبلوكس", "فورت نايت", "فالورانت", "لول", "mlbb", "efootball", "كول اوف ديوتي"], reply: "أيوه، كل الألعاب دي متاحة عندنا — هتلاقيها كلها في الرئيسية تحت قسم \"الألعاب\"، وكل لعبة ليها صفحة باقات خاصة بيها."}
];
const BOT_FALLBACK = "استلمنا رسالتك! فريق الدعم هيراجعها ويرد عليك بنفسه بأقرب وقت. تقدر كمان تشوف الأسئلة الشائعة في صفحة الدعم أو تكلمنا على واتساب من الفوتر لو الموضوع مستعجل.";

function botReplyFor(text) {
  const t = String(text || "").toLowerCase();
  const hit = BOT_RULES.find(r => r.kw.some(k => t.includes(k)));
  return (hit && hit.reply) || BOT_FALLBACK;
}

async function sendBotAutoReply(uid, userText) {
  const ref = db.collection("chats").doc(uid);
  const replyText = botReplyFor(userText);
  try {
    await ref.collection("messages").add({
      text: replyText,
      from: "admin",
      bot: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await ref.set({
      lastMessage: replyText,
      lastFrom: "admin",
      lastAt: firebase.firestore.FieldValue.serverTimestamp(),
      userUnread: firebase.firestore.FieldValue.increment(1)
    }, {merge: true});
  } catch (err) {
    console.error(err);
  }
}

function buildChatUI() {
  document.body.insertAdjacentHTML("beforeend", `
    <aside id="chatDrawer" class="drawer">
      <div class="dh"><b>الدردشة مع الدعم</b><button id="chatClose" class="x" aria-label="إغلاق">✕</button></div>
      <div class="db" id="chatBody">
        <div id="chatLoginPrompt" style="text-align:center;padding:40px 0" hidden>
          <p>سجّل دخول عشان تقدر تتواصل مع الدعم</p>
          <button id="chatGoAuth" class="btn" style="margin-top:14px">تسجيل الدخول</button>
        </div>
        <div id="chatMsgs"></div>
      </div>
      <div id="chatInputBar" class="chatbar" hidden>
        <input id="chatInput" class="inp" placeholder="اكتب رسالتك...">
        <button id="chatSend" class="btn">إرسال</button>
      </div>
    </aside>`);
}

function chatBubble(m) {
  const mine = m.from === "user";
  const tag = !mine && m.bot ? `<small class="cbot"><img src="icon-bot.png" alt="">رد تلقائي</small>` : "";
  return `<div class="cmsg ${mine ? "cmsg-me" : "cmsg-them"}">${tag}<span>${esc(m.text)}</span></div>`;
}

function renderChatMsgs(list) {
  const box = $("chatMsgs");
  if (!box) return;
  box.innerHTML = list.length ? list.map(chatBubble).join("") : `<p class="empty">ابعت أول رسالة وهنرد عليك أول ما نقدر.</p>`;
  box.scrollTop = box.scrollHeight;
}

function openChat() {
  closeCart();
  closeAuth();
  $("chatDrawer").classList.add("open");
  $("overlay").classList.add("open");
  chatOpen = true;
  if (!currentUser) {
    $("chatLoginPrompt").hidden = false;
    $("chatInputBar").hidden = true;
    renderChatMsgs([]);
    return;
  }
  $("chatLoginPrompt").hidden = true;
  $("chatInputBar").hidden = false;
  db.collection("chats").doc(currentUser.uid).set({userUnread: 0}, {merge: true}).catch(() => {});
  listenChatMsgs();
}

function closeChat() {
  $("chatDrawer").classList.remove("open");
  $("overlay").classList.remove("open");
  chatOpen = false;
}

function listenChatMsgs() {
  if (chatMsgsUnsub) chatMsgsUnsub();
  chatMsgsUnsub = db.collection("chats").doc(currentUser.uid).collection("messages")
    .orderBy("createdAt", "asc")
    .onSnapshot(snap => {
      renderChatMsgs(snap.docs.map(d => d.data()));
    }, err => console.error(err));
}

function listenChatBadge() {
  if (chatBadgeUnsub) chatBadgeUnsub();
  if (!currentUser) {
    setChatBadge(0);
    return;
  }
  chatBadgeUnsub = db.collection("chats").doc(currentUser.uid)
    .onSnapshot(snap => {
      const d = snap.data();
      setChatBadge((d && d.userUnread) || 0);
    }, err => console.error(err));
}

function setChatBadge(n) {
  const b = $("chatBadge");
  if (!b) return;
  b.hidden = !n;
  b.textContent = n > 9 ? "9+" : n;
}

async function sendPackToSupport(pack) {
  if (!currentUser) {
    openAuth();
    toast("سجّل دخولك أولًا عشان تبعت الباقة للدعم");
    return;
  }
  const ref = db.collection("chats").doc(currentUser.uid);
  const text = `عايز أطلب الباقة دي:\nاللعبة: ${pack.game}\nالباقة: ${pack.label}\nالسعر: ${fmtEGP(pack.price)}${pack.uid ? `\nالـID: ${pack.uid}` : ""}`;
  try {
    await ref.collection("messages").add({text, from: "user", createdAt: firebase.firestore.FieldValue.serverTimestamp()});
    await ref.set({
      name: (currentProfile && currentProfile.name) || currentUser.displayName || "مستخدم",
      whatsapp: (currentProfile && currentProfile.whatsapp) || "",
      lastMessage: text,
      lastFrom: "user",
      lastAt: firebase.firestore.FieldValue.serverTimestamp(),
      adminUnread: firebase.firestore.FieldValue.increment(1),
      userUnread: 0
    }, {merge: true});
    openChat();
    toast("تم إرسال الباقة للدعم ✓");
  } catch (err) {
    toast(err.code === "permission-denied" ? "صلاحيات الدردشة غير منشورة في Firestore" : "تعذر إرسال الباقة للدعم");
  }
}

async function sendChatMsg() {
  const input = $("chatInput");
  const text = input.value.trim();
  if (!text || !currentUser) return;
  input.value = "";
  const ref = db.collection("chats").doc(currentUser.uid);
  try {
    await ref.collection("messages").add({
      text,
      from: "user",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await ref.set({
      name: (currentProfile && currentProfile.name) || "مستخدم",
      whatsapp: (currentProfile && currentProfile.whatsapp) || "",
      lastMessage: text,
      lastFrom: "user",
      lastAt: firebase.firestore.FieldValue.serverTimestamp(),
      adminUnread: firebase.firestore.FieldValue.increment(1),
      userUnread: 0
    }, {merge: true});
    // بعد ما رسالة العميل تتسجل، البوت بيرد عليه بعد ثانية بسيطة (حس طبيعي إن حد "بيكتب")
    setTimeout(() => sendBotAutoReply(currentUser.uid, text), 900);
  } catch (err) {
    toast("حصل خطأ، حاول تاني");
    input.value = text;
  }
}

document.addEventListener("click", e => {
  if (e.target.closest("#chatBtn")) openChat();
  if (e.target.id === "chatClose") closeChat();
  if (e.target.id === "chatGoAuth") {
    closeChat();
    openAuth();
  }
  if (e.target.id === "chatSend") sendChatMsg();
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.id === "chatInput") sendChatMsg();
});

auth.onAuthStateChanged(user => {
  listenChatBadge();
  if (chatOpen) openChat();
});
