// ログインしていなければ、ログイン画面へ戻す
async function requireLogin() {
  const { data } = await db.auth.getSession();
  if (!data.session) {
    location.href = "login.html";
    return null;
  }
  return data.session.user; // ログイン中の人の情報を返す
}

// ログアウトして、ログイン画面へ
async function logout() {
  await db.auth.signOut();
  location.href = "login.html";
}