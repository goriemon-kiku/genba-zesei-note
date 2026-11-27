async function init() {
  const user = await requireLogin(); // ログインしていなければ、ここでログイン画面へ
  if (!user) return;

  // 新規登録のときに保存した名前を表示する
  document.getElementById("user-name").textContent = user.user_metadata.name + " さん";
  document.getElementById("logout-button").addEventListener("click", logout);
}

init();