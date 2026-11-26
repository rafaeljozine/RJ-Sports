/* ==========================================================
   Arranque do servidor
   npm run dev   → desenvolvimento (reinicia ao guardar)
   npm start     → produção
   ========================================================== */

const env = require("./config/env");
const app = require("./app");
const prisma = require("./config/database");

const servidor = app.listen(env.porta, () => {
  console.log("✔ RJ Sports a correr em http://localhost:" + env.porta);
  console.log("  Loja:   http://localhost:" + env.porta + "/");
  console.log("  Painel: http://localhost:" + env.porta + "/admin/login.html");
  console.log("  API:    http://localhost:" + env.porta + "/api/saude");
});

// fecho limpo (Ctrl+C ou reinício do serviço)
function desligar() {
  servidor.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
}
process.on("SIGINT", desligar);
process.on("SIGTERM", desligar);
