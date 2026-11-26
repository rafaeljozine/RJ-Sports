/* ==========================================================
   Resumo financeiro de um mês
   Receita = encomendas entregues · Lucro = receita − custo − despesas
   ========================================================== */

const prisma = require("../config/database");

async function resumoMes(mes) {
  const [ano, m] = mes.split("-").map(Number);
  const inicio = new Date(Date.UTC(ano, m - 1, 1));
  const fim = new Date(Date.UTC(ano, m, 1));

  const [entregues, despesas, aCaminho] = await Promise.all([
    prisma.encomenda.findMany({
      where: { estado: "Entregue", data: { gte: inicio, lt: fim } },
      include: { itens: true }
    }),
    prisma.despesa.findMany({ where: { data: { startsWith: mes } } }),
    prisma.encomenda.findMany({ where: { estado: "Enviada" }, select: { total: true, taxaEntrega: true } })
  ]);

  const receita = entregues.reduce((s, e) => s + e.total, 0);
  const custo = entregues.reduce((s, e) => s + e.itens.reduce((s2, i) => s2 + (i.custo || 0) * i.quantidade, 0), 0);
  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);

  return {
    mes,
    encomendasEntregues: entregues.length,
    receita,
    custoProdutos: custo,
    despesas: totalDespesas,
    taxasEntrega: entregues.reduce((s, e) => s + (e.taxaEntrega || 0), 0),
    lucro: receita - custo - totalDespesas,
    aReceber: aCaminho.reduce((s, e) => s + e.total + (e.taxaEntrega || 0), 0)
  };
}

module.exports = { resumoMes };
