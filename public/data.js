
const CONFIG = {
  brand: "GC",
  whatsapp: "201113141064",
  email: "gogomang128@gmail.com",
 
  admins: [],
  apiUrl: "",
  currency: "ج.م"
};


const CURRENCIES = [
  {id: "EGP", flag: "🇪🇬", label: "مصر", symbol: "ج.م", rate: 1},
  {id: "DZD", flag: "🇩🇿", label: "الجزائر", symbol: "د.ج", rate: 2.7},
  {id: "SAR", flag: "🇸🇦", label: "السعودية", symbol: "ر.س", rate: 0.076},
  {id: "USD", flag: "🇺🇸", label: "أمريكا", symbol: "$", rate: 0.0202}
];

const CATS = [
  {id: "mobile", name: "ألعاب الموبايل", icon: "📱", note: "ببجي، فري فاير، موبايل ليجندز وغيرهم"},
  {id: "pc", name: "ألعاب الكمبيوتر", icon: "💻", note: "فورتنايت، فالورانت، روبلوكس وغيرهم"},
  {id: "cards", name: "كروت الهدايا", icon: "🎁", note: "جوجل بلاي، آيتونز، ستيم"}
];

const GAMES = [
  {id: "pubg", name: "ببجي موبايل", en: "pubg", icon: "", tint: "#ffffff", cat: "mobile", cur: "UC", field: "ID اللاعب", about: "اشحن الـ UC على حسابك بدون كلمة سر.", packs: [[60, 50], [325, 250], [660, 500], [1800, 1250], [3850, 2500], [8100, 4900]]},
  {id: "freefire", name: "فري فاير", en: "free fire", icon: "", tint: "#ffffff", cat: "mobile", cur: "جوهرة", field: "ID اللاعب", about: "جواهر فري فاير توصل لحسابك بالـ ID فقط.", packs: [[100, 45], [310, 130], [520, 220], [1060, 440], [2180, 880]]},
  {id: "roblox", name: "روبلوكس", en: "roblox", icon: "", tint: "#ffffff", cat: "pc", cur: "Robux", field: "اسم المستخدم", about: "روبوكس لحسابك على روبلوكس (Gamepass&Tax covered).", packs: [[100, 45], [500, 225], [1000, 450], [2000, 900], [5000, 2250],[10000,4500]]},
  {id: "ArcRaiders", name: " ارك رايدرز", en: "  Arc Raiders ", icon: "", tint: "#ffffff", cat: "cards", cur: "", field: "رقم واتساب لاستلام الكود", about: "أكواد جاهزة تستلمها على واتساب.", packs:  [[575, 260], [1380, 600], [2800, 1100]]},
  {id: "cards", name: "كروت الهدايا", en: "gift cards google play itunes steam", icon: "", tint: "#ffffff", cat: "cards", cur: "", field: "رقم واتساب لاستلام الكود", about: "أكواد جاهزة تستلمها على واتساب.", packs: [["Google Play 10$", 520], ["Google Play 25$", 1290], ["iTunes 10$", 530], ["Steam 20$", 1050]]}
];

const SLIDES = [
  {id: "pubg", t: "اشحن ببجي موبايل", p: "اكتب الـ ID واختار الباقة، والـ UC توصلك في دقائق."},
  {id: "roblox", t: "روبوكس لحسابك", p: "من 80 Robux لحد الباقات الكبيرة، بالجنيه المصري."},
  {id: "freefire", t: "جواهر فري فاير", p: "اشحن جواهرك على طول من غير كلمة سر."}
];

const FEATS = [
  {i: "⚡", t: "تسليم سريع", d: "بنبدأ التنفيذ فور تأكيد الدفع."},
  {i: "🔒", t: "دفع آمن", d: "فودافون كاش وانستاباي وفوري."},
  {i: "💬", t: "دعم على واتساب", d: "بنرد عليك في أي وقت تحتاجنا."},
  {i: "🏷️", t: "أسعار واضحة", d: "السعر اللي تشوفه هو اللي تدفعه."}
];

const REVIEWS = [
  {n: "أحمد", t: "الطلب اتنفذ بسرعة وكل حاجة كانت واضحة."},
  {n: "منة", t: "أول مرة أشحن أونلاين ومحصلتش أي مشكلة."},
  {n: "كريم", t: "الأسعار كويسة والدعم بيرد بسرعة."}
];

const STEPS = [
  {t: "اختار لعبتك", d: "افتح صفحة اللعبة واكتب الـ ID."},
  {t: "أضف الباقة وادفع", d: "كمل الطلب وادفع من محفظتك."},
  {t: "استلم الشحن", d: "بيوصل لحسابك بعد تأكيد الدفع."}
];


const PHONE_COUNTRIES = {
  EG: {dial: "20", flag: "🇪🇬", label: "مصر (+20)", min: 9, max: 10, strip0: true},
  SA: {dial: "966", flag: "🇸🇦", label: "السعودية (+966)", min: 8, max: 9, strip0: true},
  DZ: {dial: "213", flag: "🇩🇿", label: "الجزائر (+213)", min: 8, max: 9, strip0: true},
  INTL: {dial: "", flag: "🌍", label: "دولي (اكتب الكود بنفسك)", min: 6, max: 15, strip0: false}
};

const PAYMENTS = [
  {id: "vodafone", name: "فودافون كاش", mark: "VF", color: "#e60000", ink: "#fff", fee: 0, image: "vodafone.png", country: "EG"},
  {id: "instapay", name: "انستا باي", mark: "IP", color: "#6d28d9", ink: "#fff", fee: 0, image: "instapay.png", country: "EG"},
  {id: "fawry", name: "فوري", mark: "Fawry", color: "#f5b800", ink: "#111", fee: 0, image: "fawry.png", country: "EG"},
  {id: "orange", name: "أورانج كاش", mark: "OR", color: "#ff7900", ink: "#fff", fee: 0, image: "orange.png", country: "EG"},
  {id: "card", name: "فيزا / بطاقة بنكية", mark: "VISA", color: "#1e3a8a", ink: "#fff", fee: 0.12, image: "visa.png", country: "INTL"},
  {id: "paypal", name: "PayPal", mark: "PayPal", color: "#003087", ink: "#fff", fee: 0, image: "paypal.png", country: "INTL"},
  {id: "telda", name: "تيلدا", mark: "Telda", color: "#c6f135", ink: "#111", fee: 0, image: "telda.png", country: "EG"},
  {id: "binance", name: "Binance Pay", mark: "BNB", color: "#f0b90b", ink: "#111", fee: 0, image: "binance.png", country: "INTL"},
  {id: "stcpay", name: "STC Pay (ريال سعودي)", mark: "STC", color: "#5b2c6f", ink: "#fff", fee: 0, image: "stcpay.png", country: "SA"},
  {id: "baridimob", name: "BaridiMob (دينار جزائري)", mark: "BM", color: "#00874e", ink: "#fff", fee: 0, image: "baridimob.png", country: "DZ"},
  {id: "whatsapp", name: "تواصل معنا للتأكيد", mark: "WA", color: "#25d366", ink: "#fff", fee: 0, note: "هنتواصل معاك على واتساب لتأكيد وسيلة الدفع بعد إرسال الطلب.", manual: true, country: "INTL"},
  {id: "wallet", name: "محفظة الموقع", mark: "W", color: "#0f766e", ink: "#fff", fee: 0, wallet: true, note: "ادفع على طول من رصيد محفظتك، من غير تحويل وبلا رسوم."}
];
