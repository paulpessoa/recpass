import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Puxar as credenciais do .env
const env = readFileSync(".env", "utf-8");
let url = "";
let key = "";
for (const line of env.split("\n")) {
  if (line.startsWith("SUPABASE_URL=")) url = line.split("=")[1].trim();
  if (line.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) key = line.split("=")[1].trim();
}

console.log("Conectando ao Supabase em:", url);

const sb = createClient(url, key, { auth: { persistSession: false } });

async function test() {
  console.log("Enviando feedback de teste...");
  const { data, error } = await sb.from("app_feedback").insert({
    rating: 5,
    recommend: 10,
    would_use: "sim",
    liked: ["Diagnóstico", "Alternativas"],
    missing: "Tudo perfeito, este é um teste automatizado da IA Antigravity.",
    area: "Tecnologia",
    role: "IA Assistant",
    name: "Teste Antigravity",
    contact: "ia@teste.com",
    can_contact: true,
    context: { test: true }
  });

  if (error) {
    console.error("ERRO ao inserir na tabela:", error.message, error.details, error.hint);
  } else {
    console.log("SUCESSO! O teste foi inserido na tabela app_feedback sem erros.");
  }
}

test();
