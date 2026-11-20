// Supabase に接続するための設定（全ページで使う）
const SUPABASE_URL = "https://pqethnaxpeorvizufofs.supabase.co";
const SUPABASE_KEY = "sb_publishable_1-bDd9j80YOHV-ZJG1YleA_F5ouct78";

// db = Supabase への窓口。ここを通して登録・取得などをお願いする
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);