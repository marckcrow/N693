import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hkyyeiyvzglbhroejkfy.supabase.co";
const supabaseAnonKey = "SUA_ANON_KEY_AQUI"; // copie do .env

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: "testeuser@example.com",
    password: "123456",
  });
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
