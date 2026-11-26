/* ==========================================================
   Regista as rotas habituais de uma coleção do painel:
   GET /caminho · POST /caminho · PUT /caminho/:id · DELETE /caminho/:id
   ========================================================== */

const { exigirAdmin } = require("../middlewares/authMiddleware");
const validar = require("../validators/validar");

function rotasCrud(router, caminho, controller, esquema) {
  router.get(caminho, exigirAdmin, controller.listar);
  router.post(caminho, exigirAdmin, validar(esquema), controller.criar);
  router.put(caminho + "/:id", exigirAdmin, validar(esquema), controller.atualizar);
  router.delete(caminho + "/:id", exigirAdmin, controller.apagar);
}

module.exports = rotasCrud;
