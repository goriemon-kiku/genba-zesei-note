const form = document.getElementById("project-form");
const message = document.getElementById("message");

async function init() {
  await requireLogin();
}

// 保存ボタンが押されたら、現場を登録する（Create）
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();

  const { error } = await db
    .from("projects")                           // projects の表に
    .insert({ name: name, address: address });  // この1行を追加して

  if (error) {
    message.textContent = "保存できませんでした：" + error.message;
    return;
  }

  location.href = "index.html";
});

init();
