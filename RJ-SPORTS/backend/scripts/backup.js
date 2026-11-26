/* ==========================================================
   Cópia de segurança dos dados da loja (PostgreSQL)
   Uso: npm run backup
   Cria backups/rj-sports-copia-AAAA-MM-DD_HHMM.json — o mesmo
   formato de "Painel → Configurações → Descarregar cópia de
   segurança", por isso repõe-se pelo painel (Repor cópia).
   As fotos não entram: no Vercel ficam no Vercel Blob e no
   Docker na pasta uploads (copie-a à parte).
   Mantém as últimas BACKUP_MANTER cópias (por omissão 14).
   ========================================================== */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const prisma = require("../src/config/database");
const { fotografia } = require("../src/services/adminService");

const PASTA = process.env.BACKUP_DIR ? path.resolve(process.env.BACKUP_DIR) : path.join(__dirname, "..", "backups");
const MANTER = Number(process.env.BACKUP_MANTER) || 14;
const PADRAO = /^rj-sports-copia-\d{4}-\d{2}-\d{2}_\d{4}\.json$/;

async function main() {
  fs.mkdirSync(PASTA, { recursive: true });
  const nome = "rj-sports-copia-" + new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "") + ".json";
  const destino = path.join(PASTA, nome);

  const { db } = await fotografia({ nome: "", email: "", inicial: false });
  fs.writeFileSync(destino, JSON.stringify(db, null, 2));

  // apagar cópias antigas
  const copias = fs.readdirSync(PASTA).filter((f) => PADRAO.test(f)).sort();
  const aApagar = copias.slice(0, Math.max(0, copias.length - MANTER));
  aApagar.forEach((f) => fs.rmSync(path.join(PASTA, f), { force: true }));

  console.log("✔ Cópia criada em " + destino + " (" + db.produtos.length + " produtos, " + db.encomendas.length + " encomendas)");
  if (aApagar.length) console.log("  Apagadas " + aApagar.length + " cópia(s) antiga(s).");
}

main()
  .catch((erro) => {
    console.error("✖ Falhou a cópia de segurança:", erro.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
