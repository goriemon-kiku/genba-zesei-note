async function init() {
  const user = await requireLogin();
  if (!user) return;

  document.getElementById("user-name").textContent = user.user_metadata.name + " さん";
  document.getElementById("logout-button").addEventListener("click", logout);

  loadProjects();
}

// 現場の一覧を取ってきて、画面に並べる（Read）
async function loadProjects() {
  const list = document.getElementById("project-list");

  const { data, error } = await db
    .from("projects")      // projects の表から
    .select("*")           // 全部の列を取ってきて
    .order("created_at");  // 作った順に並べる

  if (error) {
    list.textContent = "読み込みに失敗しました：" + error.message;
    return;
  }
  if (data.length === 0) {
    list.textContent = "まだ現場がありません。";
    return;
  }

  list.innerHTML = "";
  data.forEach((project) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "project.html?id=" + project.id;
    link.textContent = project.name;
    li.appendChild(link);
    li.append("（" + (project.address || "住所なし") + "）");
    list.appendChild(li);
  });
}

init();