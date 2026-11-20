const form = document.getElementById("signup-form");
const message = document.getElementById("message");

// フォームが送信されたら動く
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // ページの再読み込みを止める

  // ① 画面の入力を取り出す
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // ② Supabase に「この人を登録して」とお願いする
  const { error } = await db.auth.signUp({
    email: email,
    password: password,
    options: { data: { name: name } }
  });

  // ③ 失敗したらメッセージを出して終わり
  if (error) {
    message.textContent = "登録できませんでした：" + error.message;
    return;
  }

  // ④ 成功したらトップページへ移動
  location.href = "index.html";
});