/* ==========================================================
   Cópia de segurança: base de dados + fotos enviadas
   Uso: npm run backup
   Cria backups/AAAA-MM-DD_HHMM/ com:
     - rjsports.db  (cópia consistente, feita com o servidor a correr)
     - uploads/     (fotos dos produtos)
   Mantém as últimas BACKUP_MANTER cópias (por omissão 14).
   ========================================================== */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const env = require("../src/config/env");

const PASTA = process.env.BACKUP_DIR ? path.resolve(process.env.BACKUP_DIR) : path.join(__dirname, "..", "backups");
const MANTER = Number(process.env.BACKUP_MANTER) || 14;

async function main() {
  if (!/^file:/.test(process.env.DATABASE_URL || "")) {
    throw new Error("Este script é para SQLite. Para PostgreSQL use pg_dump (ver README).");
  }

  const agora = new Date();
  const nome = agora.toISOString().slice(0, 16).replace("T", "_").replace(":", "");
  const destino = path.join(PASTA, nome);
  fs.mkdirSync(destino, { recursive: true });

  // 1) Base de dados — VACUUM INTO faz uma cópia consistente mesmo com a loja a funcionar
  const prisma = new PrismaClient();
  const ficheiroDb = path.join(destino, "rjsports.db").replace(/\\/g, "/").replace(/'/g, "''");
  await prisma.$executeRawUnsafe("VACUUM INTO '" + ficheiroDb + "'");
  await prisma.$disconnect();

  // 2) Fotos enviadas
  if (fs.existsSync(env.pastaUploads)) {
    fs.cpSync(env.pastaUploads, path.join(destino, "uploads"), {
      recursive: true,
      filter: (origem) => !origem.endsWith(".gitkeep")
    });
  }

  // 3) Apagar cópias antigas
  const copias = fs.readdirSync(PASTA).filter((d) => /^\d{4}-\d{2}-\d{2}_\d{4}$/.test(d)).sort();
  const aApagar = copias.slice(0, Math.max(0, copias.length - MANTER));
  aApagar.forEach((d) => fs.rmSync(path.join(PASTA, d), { recursive: true, force: true }));

  const tamanho = fs.statSync(path.join(destino, "rjsports.db")).size;
  console.log("✔ Cópia criada em " + destino + " (" + Math.round(tamanho / 1024) + " KB de base de dados)");
  if (aApagar.length) console.log("  Apagadas " + aApagar.length + " cópia(s) antiga(s).");
}

main().catch((erro) => {
  console.error("✖ Falhou a cópia de segurança:", erro.message);
  process.exitCode = 1;
});
