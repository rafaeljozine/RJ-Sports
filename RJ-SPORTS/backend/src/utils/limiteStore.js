/* ==========================================================
   Armazenamento do limite de tentativas (express-rate-limit)
   na base de dados. No Vercel o servidor corre em várias
   instâncias de curta duração: um contador só em memória
   recomeçava do zero e não travava ataques de força bruta.
   Cada contador é uma linha da tabela LimitePedido.
   ========================================================== */

const prisma = require("../config/database");

class LimiteStore {
  /** prefixo separa os contadores de cada limite (login, encomendas…) */
  constructor(prefixo) {
    this.prefixo = prefixo;
    // a mesma instância não pode ser partilhada por vários limites
    this.localKeys = false;
  }

  init(opcoes) {
    this.janelaMs = opcoes.windowMs;
  }

  chave(k) {
    return this.prefixo + ":" + k;
  }

  async get(k) {
    const linha = await prisma.limitePedido.findUnique({ where: { chave: this.chave(k) } });
    if (!linha || linha.expiraEm <= new Date()) return undefined;
    return { totalHits: linha.contagem, resetTime: linha.expiraEm };
  }

  /** Soma 1 de forma atómica; se a janela já terminou, recomeça em 1 */
  async increment(k) {
    const expira = new Date(Date.now() + this.janelaMs);
    const [linha] = await prisma.$queryRaw`
      INSERT INTO "LimitePedido" ("chave", "contagem", "expiraEm")
      VALUES (${this.chave(k)}, 1, ${expira})
      ON CONFLICT ("chave") DO UPDATE SET
        "contagem" = CASE WHEN "LimitePedido"."expiraEm" <= NOW() THEN 1 ELSE "LimitePedido"."contagem" + 1 END,
        "expiraEm" = CASE WHEN "LimitePedido"."expiraEm" <= NOW() THEN EXCLUDED."expiraEm" ELSE "LimitePedido"."expiraEm" END
      RETURNING "contagem", "expiraEm"`;

    // de vez em quando, apaga contadores já expirados
    if (Math.random() < 0.02) {
      prisma.limitePedido.deleteMany({ where: { expiraEm: { lt: new Date() } } }).catch(() => {});
    }
    return { totalHits: Number(linha.contagem), resetTime: linha.expiraEm };
  }

  async decrement(k) {
    await prisma.limitePedido.updateMany({
      where: { chave: this.chave(k), contagem: { gt: 0 } },
      data: { contagem: { decrement: 1 } }
    });
  }

  async resetKey(k) {
    await prisma.limitePedido.deleteMany({ where: { chave: this.chave(k) } });
  }
}

module.exports = LimiteStore;
