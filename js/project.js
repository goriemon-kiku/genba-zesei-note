const message = document.getElementById("message");
const projectId = new URLSearchParams(location.search).get("id");

async function init() {
  const user = await requireLogin();
  if (!user) return;

  loadProject();
}

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

  document.getElementById("project-name").textContent = data.name;
  document.getElementById("project-address").textContent = data.address || "住所なし";
}

init();