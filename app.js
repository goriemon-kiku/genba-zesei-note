// ===== Supabase への接続設定 =====
// Supabase の「Project Settings」→「API Keys」から取得した値を入れる
const SUPABASE_URL = "https://pqethnaxpeorvizufofs.supabase.co";
const SUPABASE_KEY = "ここに公開用キー（anon または publishable）を貼る";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== 画面の部品を取得 =====
const siteSelect = document.getElementById("site-select");
const siteForm = document.getElementById("site-form");
const siteNameInput = document.getElementById("site-name");
const siteAddressInput = document.getElementById("site-address");

const formTitle = document.getElementById("form-title");
const correctionForm = document.getElementById("correction-form");
const titleInput = document.getElementById("c-title");
const detailInput = document.getElementById("c-detail");
const dueInput = document.getElementById("c-due");
const statusInput = document.getElementById("c-status");
const submitButton = document.getElementById("c-submit");
const cancelButton = document.getElementById("c-cancel");
const message = document.getElementById("message");
const correctionList = document.getElementById("correction-list");

// ===== アプリの状態 =====
let currentSiteId = null; // 今選んでいる現場の id
let editingId = null;     // 編集中の是正項目の id（新規登録のときは null）

// =====================================================
// 現場（sites）
// =====================================================

// 現場の一覧を読み込んで、選択欄に並べる
async function loadSites() {
  const { data, error } = await db
    .from("sites")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    message.textContent = "現場の読み込みに失敗しました：" + error.message;
    return;
  }

  siteSelect.innerHTML = "";

  if (data.length === 0) {
    siteSelect.innerHTML = '<option value="">まず現場を登録してください</option>';
    currentSiteId = null;
  } else {
    data.forEach((site) => {
      const option = document.createElement("option");
      option.value = site.id;
      option.textContent = site.name;
      siteSelect.appendChild(option);
    });

    // 選んでいた現場がなければ、先頭の現場を選ぶ
    const exists = data.some((site) => site.id === currentSiteId);
    if (!exists) currentSiteId = data[0].id;
    siteSelect.value = currentSiteId;
  }

  loadCorrections();
}

// 現場を切り替えたとき
siteSelect.addEventListener("change", () => {
  currentSiteId = Number(siteSelect.value);
  resetForm();
  loadCorrections();
});

// 現場を登録したとき
siteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const { data, error } = await db
    .from("sites")
    .insert({
      name: siteNameInput.value,
      address: siteAddressInput.value || null,
    })
    .select()
    .single();

  if (error) {
    message.textContent = "現場の登録に失敗しました：" + error.message;
    return;
  }

  currentSiteId = data.id; // 登録した現場をそのまま選ぶ
  siteForm.reset();
  siteForm.closest("details").open = false;
  message.textContent = "現場「" + data.name + "」を登録しました";
  loadSites();
});

// =====================================================
// 是正項目（corrections）… この回の主役。CRUD を一周させる
// =====================================================

// 【Read】選んでいる現場の是正項目を一覧表示する
async function loadCorrections() {
  correctionList.innerHTML = "";

  if (!currentSiteId) {
    correctionList.innerHTML = '<li class="empty">現場を登録すると、ここに是正項目が並びます</li>';
    return;
  }

  const { data, error } = await db
    .from("corrections")
    .select("*")
    .eq("site_id", currentSiteId)
    .order("created_at", { ascending: false });

  if (error) {
    message.textContent = "是正項目の読み込みに失敗しました：" + error.message;
    return;
  }

  if (data.length === 0) {
    correctionList.innerHTML = '<li class="empty">まだ是正項目はありません</li>';
    return;
  }

  data.forEach((item) => {
    correctionList.appendChild(createCorrectionItem(item));
  });
}

// 是正項目1件分の表示を作る
function createCorrectionItem(item) {
  const li = document.createElement("li");

  const head = document.createElement("div");
  head.className = "item-head";

  const badge = document.createElement("span");
  badge.className = "badge status-" + item.status;
  badge.textContent = item.status;

  const title = document.createElement("strong");
  title.textContent = item.title;

  head.append(badge, title);
  li.appendChild(head);

  if (item.due_date) {
    const due = document.createElement("span");
    due.className = "sub";
    due.textContent = "期限：" + item.due_date;
    li.appendChild(due);
  }

  if (item.detail) {
    const detail = document.createElement("p");
    detail.className = "detail";
    detail.textContent = item.detail;
    li.appendChild(detail);
  }

  const actions = document.createElement("div");
  actions.className = "actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "secondary";
  editButton.textContent = "編集";
  editButton.addEventListener("click", () => startEdit(item));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "danger";
  deleteButton.textContent = "削除";
  deleteButton.addEventListener("click", () => deleteCorrection(item));

  actions.append(editButton, deleteButton);
  li.appendChild(actions);

  return li;
}

// 【Create / Update】フォームが送信されたとき
correctionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentSiteId) {
    message.textContent = "先に現場を登録してください";
    return;
  }

  const values = {
    title: titleInput.value,
    detail: detailInput.value || null,
    due_date: dueInput.value || null,
    status: statusInput.value,
  };

  let result;
  if (editingId === null) {
    // 新規登録（Create）
    result = await db.from("corrections").insert({ ...values, site_id: currentSiteId });
  } else {
    // 更新（Update）
    result = await db.from("corrections").update(values).eq("id", editingId);
  }

  if (result.error) {
    message.textContent = "保存に失敗しました：" + result.error.message;
    return;
  }

  message.textContent = editingId === null ? "登録しました！" : "更新しました！";
  resetForm();
  loadCorrections();
});

// 【Update】編集ボタンが押されたら、フォームに中身を入れる
function startEdit(item) {
  editingId = item.id;
  titleInput.value = item.title;
  detailInput.value = item.detail || "";
  dueInput.value = item.due_date || "";
  statusInput.value = item.status;

  formTitle.textContent = "是正項目を編集";
  submitButton.textContent = "更新する";
  cancelButton.hidden = false;
  message.textContent = "";
  correctionForm.scrollIntoView({ behavior: "smooth" });
}

// 【Delete】削除ボタンが押されたとき
async function deleteCorrection(item) {
  if (!confirm("「" + item.title + "」を削除しますか？")) return;

  const { error } = await db.from("corrections").delete().eq("id", item.id);

  if (error) {
    message.textContent = "削除に失敗しました：" + error.message;
    return;
  }

  if (editingId === item.id) resetForm();
  message.textContent = "削除しました";
  loadCorrections();
}

// フォームを「新規登録」の状態に戻す
function resetForm() {
  editingId = null;
  correctionForm.reset();
  formTitle.textContent = "是正項目を登録";
  submitButton.textContent = "登録する";
  cancelButton.hidden = true;
}

cancelButton.addEventListener("click", () => {
  resetForm();
  message.textContent = "";
});

// ===== ページを開いたときに読み込む =====
loadSites();
