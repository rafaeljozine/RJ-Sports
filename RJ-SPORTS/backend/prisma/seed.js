/* ==========================================================
   RJ SPORTS — dados iniciais da base de dados
   - Categorias e produtos: lidos do catálogo do site
     (frontend/js/produtos.js), para haver uma só origem.
   - Zonas de entrega: as 11 províncias (taxas por definir).
   - Conta de administrador: a partir do .env.
   Pode ser corrido várias vezes (o servidor corre-o a cada arranque):
   o catálogo e as zonas só são carregados se a base de dados
   estiver vazia, e a conta só é criada se ainda não houver nenhuma.
   Assim nunca volta a criar produtos apagados no painel.
   ========================================================== */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PROVINCIAS = ["Maputo Cidade", "Maputo Província", "Gaza", "Inhambane", "Sofala", "Manica",
  "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"];

/** Executa o produtos.js do site num ambiente isolado e devolve o catálogo */
function lerCatalogoDoSite() {
  const ficheiro = path.join(__dirname, "..", "..", "frontend", "js", "produtos.js");
  const codigo = fs.readFileSync(ficheiro, "utf8");
  const ambiente = { console, localStorage: { getItem: () => null } };
  ambiente.window = ambiente;
  vm.createContext(ambiente);
  vm.runInContext(codigo, ambiente, { filename: "produtos.js" });
  return {
    categorias: ambiente.RJS.categoriasBase || ambiente.RJS.categorias,
    produtos: ambiente.RJS.produtosBase || ambiente.RJS.produtos
  };
}

async function main() {
  // Validar a configuração ANTES de mexer na base de dados
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const palavraPasse = process.env.ADMIN_PASSWORD || "";
  if (!email || palavraPasse.length < 8) {
    throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 8 caracteres) no ficheiro .env");
  }
  if (process.env.NODE_ENV === "production" && (palavraPasse.length < 12 || /mude|rjsports2026/i.test(palavraPasse))) {
    throw new Error("Em produção, a ADMIN_PASSWORD tem de ter pelo menos 12 caracteres e não pode ser a de exemplo.");
  }

  const jaTemCatalogo = (await prisma.categoria.count()) + (await prisma.produto.count()) > 0;
  const { categorias, produtos } = jaTemCatalogo ? { categorias: [], produtos: [] } : lerCatalogoDoSite();

  // Categorias
  for (const [i, c] of categorias.entries()) {
    await prisma.categoria.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, nome: c.nome, descricao: c.descricao || null, ordem: i }
    });
  }

  // Produtos (custo e stock ficam por preencher no painel)
  for (const [i, p] of produtos.entries()) {
    await prisma.produto.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        sku: "RJS-" + String(i + 1).padStart(3, "0"),
        nome: p.nome,
        descricao: p.descricao || null,
        categoriaId: p.categoria,
        preco: p.preco,
        precoAntigo: p.precoAntigo || null,
        stock: 0,
        imagem: p.imagem || null,
        tamanhos: JSON.stringify(p.tamanhos || []),
        publico: JSON.stringify(p.publico || []),
        idades: JSON.stringify(p.idades || []),
        destaque: !!p.destaque,
        novo: !!p.novo,
        ativo: true
      }
    });
  }

  // Zonas de entrega
  const jaTemZonas = (await prisma.zona.count()) > 0;
  for (const [i, provincia] of (jaTemZonas ? [] : PROVINCIAS).entries()) {
    await prisma.zona.upsert({
      where: { provincia },
      update: {},
      create: { id: "zona-" + (i + 1), provincia, ativa: true }
    });
  }

  // Administrador
  const existe = await prisma.admin.count();
  if (!existe) {
    await prisma.admin.create({
      data: {
        nome: process.env.ADMIN_NOME || "Administrador",
        email,
        hash: await bcrypt.hash(palavraPasse, 12),
        inicial: true
      }
    });
    console.log("✔ Conta de administrador criada:", email);
  }

  if (jaTemCatalogo) console.log("✔ Base de dados já tem catálogo — nada a carregar.");
  else console.log(`✔ Carregados ${categorias.length} categorias, ${produtos.length} produtos e ${PROVINCIAS.length} zonas.`);
}

main()
  .catch((erro) => {
    console.error("✖ Erro ao preparar a base de dados:", erro.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
