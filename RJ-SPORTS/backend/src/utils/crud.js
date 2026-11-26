/* ==========================================================
   Controller genérico (listar / criar / atualizar / apagar)
   para coleções simples do painel.
   ========================================================== */

const prisma = require("../config/database");
const { assincrono, erros } = require("./erros");

/**
 * @param {string} modelo  nome do modelo Prisma (ex.: "categoria")
 * @param {{paraApi:Function, paraBd:Function}} mapa
 * @param {object} opcoes  { ordenar, aoCriar(dados) → campos extra, antesApagar(id) }
 */
function crud(modelo, mapa, opcoes = {}) {
  const tabela = prisma[modelo];

  return {
    listar: assincrono(async (req, res) => {
      const itens = await tabela.findMany({ orderBy: opcoes.ordenar || undefined });
      res.json(itens.map(mapa.paraApi));
    }),

    obter: assincrono(async (req, res) => {
      const item = await tabela.findUnique({ where: { id: req.params.id } });
      if (!item) throw erros.naoEncontrado();
      res.json(mapa.paraApi(item));
    }),

    criar: assincrono(async (req, res) => {
      const existe = await tabela.findUnique({ where: { id: req.body.id } });
      if (existe) throw erros.conflito("Já existe um registo com este identificador.");
      const extra = opcoes.aoCriar ? await opcoes.aoCriar(req.body) : {};
      const item = await tabela.create({ data: Object.assign({ id: req.body.id }, mapa.paraBd(req.body), extra) });
      res.status(201).json(mapa.paraApi(item));
    }),

    atualizar: assincrono(async (req, res) => {
      const item = await tabela.update({ where: { id: req.params.id }, data: mapa.paraBd(req.body) });
      res.json(mapa.paraApi(item));
    }),

    apagar: assincrono(async (req, res) => {
      if (opcoes.antesApagar) await opcoes.antesApagar(req.params.id);
      await tabela.delete({ where: { id: req.params.id } });
      res.status(204).end();
    })
  };
}

module.exports = crud;
