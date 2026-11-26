/* ==========================================================
   Ligação à base de dados (Prisma)
   ========================================================== */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
