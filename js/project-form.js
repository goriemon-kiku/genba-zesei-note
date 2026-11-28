const form = document.getElementById("project-form");
const message = document.getElementById("message");

// URL に「?id=○○」があれば編集、なければ新規登録
const projectId = new URLSearchParams(location.search).get("id");

async function init() {
  const user = await requireLogin();
  if (!user) return;

  if (projectId) {
    document.getElementById("form-title").textContent = "現場を編集";
    document.title = "現場を編集 | 現場是正ノート";
    document.getElementById("cancel-link").href = "project.html?id=" + projectId;
    loadProject();
  }
}

// 編集のとき：今の値を入力欄に入れておく
async function loadProject() {
  const { data, error } = await db
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    message.textContent = "読み込みに失敗しました：" + error.message;
    return;
  }

  document.getElementById("name").value = data.name;
  document.getElementById("address").value = data.address || "";
}

// 保存ボタンが押されたら、登録（Create）か更新（Update）をする
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();

  let result;
  if (projectId) {
    result = await db
      .from("projects")
      .update({ name: name, address: address })  // この内容に書き換える
      .eq("id", projectId);                       // id が一致する行を
  } else {
    result = await db
      .from("projects")
      .insert({ name: name, address: address });
  }

  if (result.error) {
    message.textContent = "保存できませんでした：" + result.error.message;
    return;
  }

  location.href = projectId ? "project.html?id=" + projectId : "index.html";
});

init();