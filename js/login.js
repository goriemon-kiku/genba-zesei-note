const form = document.getElementById("login-form");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Supabase に「このメールとパスワードでログインさせて」とお願いする
  const { error } = await db.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    message.textContent = "ログインできませんでした：" + error.message;
    return;
  }

  location.href = "index.html";
});