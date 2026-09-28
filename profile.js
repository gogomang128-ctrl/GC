let myItems = [];
let editingId = null;
let editPicked = null;

function renderProfile() {
  if (!currentUser) {
    $("app").innerHTML = `
      <section class="wrap sec" style="text-align:center;padding:60px 0">
        <h2>سجّل دخول عشان تشوف حسابك</h2>
        <p class="sub">لازم تسجل دخول أو تعمل حساب الأول.</p>
        <button id="goAuth" class="btn" style="margin-top:14px">تسجيل الدخول</button>
      </section>`;
    return;
  }
  const p = currentProfile || {};
  $("app").innerHTML = `
    <section class="wrap sec">
      <div class="sechead"><h2>حسابي</h2></div>
      <div style="max-width:420px">
        <label class="lbl">الاسم</label>
        <input id="pName" class="inp" value="${esc(p.name || "")}">
        <label class="lbl">رقم واتساب للتواصل</label>
        <input id="pWa" class="inp" value="${esc(p.whatsapp || "")}" inputmode="tel" placeholder="01012345678">
        <button id="pSave" class="btn full">حفظ التعديلات</button>
        <button id="pLogout" class="ghost">تسجيل الخروج</button>
        <p id="pErr" style="color:#e0212b;font-weight:700;min-height:20px"></p>
      </div>
      <div class="sechead" style="margin-top:30px"><h2>إعلاناتي</h2></div>
      <div id="myGrid" class="grid"></div>
    </section>`;
  renderMyGrid();
}

function myItemCard(it) {
  if (editingId === it.id) return myItemEditForm(it);
  const stock = stockLabel(it);
  return `
    <div class="gcard" style="cursor:default">
      <div class="gimg">${mktThumb(it, false)}${it.game ? `<span class="gcat">${esc(it.game)}</span>` : ""}</div>
      <div class="gover">
        <b>${esc(it.title)}</b>
        ${priceBlock(it)}
        ${stock ? `<span class="${it.stock === 0 ? "gends" : "gstock"}">${esc(stock)}</span>` : ""}
        <div style="display:flex;gap:8px;margin-top:6px">
          <button class="ghost" data-edit="${it.id}">تعديل</button>
          <button class="ghost" data-del="${it.id}">حذف الإعلان</button>
        </div>
      </div>
    </div>`;
}

function myItemEditForm(it) {
  return `
    <div class="gcard mform" style="cursor:default;grid-column:1/-1">
      <input id="etTitle" class="inp" value="${esc(it.title)}" placeholder="اسم الحساب / المنتج">
      <input id="etGame" class="inp" style="margin-top:10px" value="${esc(it.game || "")}" placeholder="اللعبة (مثلاً ببجي، فري فاير)">
      <div style="display:flex;gap:10px;margin-top:10px">
        <input id="etPrice" class="inp" style="flex:1" value="${it.price}" placeholder="السعر الحالي بالجنيه" inputmode="numeric">
        <input id="etOldPrice" class="inp" style="flex:1" value="${it.oldPrice || ""}" placeholder="السعر قبل الخصم (اختياري)" inputmode="numeric">
      </div>
      <input id="etStock" class="inp" style="margin-top:10px" value="${it.stock != null ? it.stock : ""}" placeholder="الكمية المتاحة (اختياري، سيبها فاضية لو غير محدودة)" inputmode="numeric">
      <textarea id="etDesc" class="inp" style="margin-top:10px;min-height:90px" placeholder="وصف تفصيلي">${esc(it.desc || "")}</textarea>
      <label class="lbl">تغيير الصورة (اختياري، سيبها لو عايز تسيب الصورة الحالية)</label>
      <input id="etImg" type="file" accept="image/*" class="inp">
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn" data-save="${it.id}">حفظ التعديلات</button>
        <button class="ghost" id="etCancel">إلغاء</button>
      </div>
      <p id="etErr" class="mform-err"></p>
    </div>`;
}

function renderMyGrid() {
  const grid = $("myGrid");
  if (!grid) return;
  grid.innerHTML = myItems.length
    ? myItems.map(myItemCard).join("")
    : `<p class="empty">لسه معملتش أي إعلان. تقدر تنشر واحد من صفحة السوق.</p>`;
}

function listenMyItems() {
  if (!currentUser) {
    myItems = [];
    renderMyGrid();
    return;
  }
  db.collection("items").where("sellerId", "==", currentUser.uid).onSnapshot(snap => {
    myItems = snap.docs.map(d => ({id: d.id, ...d.data()}));
    renderMyGrid();
  }, err => console.error(err));
}

document.addEventListener("click", async e => {
  if (e.target.id === "goAuth") openAuth();
  if (e.target.id === "pLogout") logOut();

  if (e.target.id === "pSave") {
    const name = $("pName").value.trim();
    const wa = $("pWa").value.replace(/\D/g, "");
    $("pErr").textContent = "";
    if (!name) {
      $("pErr").textContent = "اكتب اسمك";
      return;
    }
    e.target.disabled = true;
    try {
      await db.collection("users").doc(currentUser.uid).set({name, whatsapp: wa}, {merge: true});
      currentProfile = {...currentProfile, name, whatsapp: wa};
      updateAccountUI();
      toast("تم الحفظ ✓");
    } catch (err) {
      $("pErr").textContent = "حصل خطأ، حاول تاني";
    } finally {
      e.target.disabled = false;
    }
  }

  const del = e.target.closest("[data-del]");
  if (del) {
    if (!confirm("متأكد إنك عايز تحذف الإعلان ده؟")) return;
    try {
      await db.collection("items").doc(del.dataset.del).delete();
      toast("اتحذف الإعلان ✓");
    } catch (err) {
      toast("حصل خطأ، حاول تاني");
    }
  }

  const edit = e.target.closest("[data-edit]");
  if (edit) {
    editingId = edit.dataset.edit;
    editPicked = null;
    renderMyGrid();
  }

  if (e.target.id === "etCancel") {
    editingId = null;
    editPicked = null;
    renderMyGrid();
  }

  const save = e.target.closest("[data-save]");
  if (save) {
    const id = save.dataset.save;
    const it = myItems.find(x => x.id === id);
    if (!it) return;
    const title = $("etTitle").value.trim();
    const game = $("etGame").value.trim();
    const price = +$("etPrice").value;
    const oldPriceRaw = $("etOldPrice").value.trim();
    const stockRaw = $("etStock").value.trim();
    const oldPriceVal = oldPriceRaw ? +oldPriceRaw : null;
    const oldPrice = oldPriceVal && oldPriceVal > price ? oldPriceVal : null;
    const stock = stockRaw ? Math.max(0, Math.floor(+stockRaw)) : null;
    const desc = $("etDesc").value.trim();
    $("etErr").textContent = "";
    if (!title || !price) {
      $("etErr").textContent = "اكتب اسم المنتج والسعر";
      return;
    }
    save.disabled = true;
    save.textContent = editPicked ? "جاري رفع الصورة..." : "جاري الحفظ...";
    try {
      const imageURL = editPicked ? await uploadImageFile(editPicked) : it.imageURL;
      await db.collection("items").doc(id).update({
        title, game, price, oldPrice, stock, desc, imageURL
      });
      editingId = null;
      editPicked = null;
      toast("تم حفظ التعديلات ✓");
    } catch (err) {
      $("etErr").textContent = "حصل خطأ، حاول تاني";
      save.disabled = false;
      save.textContent = "حفظ التعديلات";
    }
  }
});

document.addEventListener("change", e => {
  if (e.target.id !== "etImg") return;
  editPicked = e.target.files[0] || null;
});

function onAuthChangedPage() {
  renderProfile();
  listenMyItems();
}

buildShell();
wireShell();
renderCart();
renderProfile();
listenMyItems();
