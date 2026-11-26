/* ==========================================================
   Validação dos dados recebidos (zod)
   Campos desconhecidos são ignorados.
   ========================================================== */

const { z } = require("zod");

const texto = (max = 200) => z.string().trim().max(max);
const textoOpcional = (max = 500) => z.string().trim().max(max).optional().nullable().or(z.literal(""));
const inteiro = z.number().int().nonnegative().max(100000000);
const inteiroOpcional = inteiro.optional().nullable();
const idTexto = z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/i, "Identificador inválido");
const dataTexto = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (AAAA-MM-DD)");

const ESTADOS = ["Recebida", "Confirmada", "Enviada", "Entregue", "Cancelada"];
const PAGAMENTOS = ["Numerário", "M-Pesa", "e-Mola"];
const PROVINCIAS = ["Maputo Cidade", "Maputo Província", "Gaza", "Inhambane", "Sofala", "Manica",
  "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"];

/* ---------- Loja (público) ---------- */
const checkout = z.object({
  cliente: z.object({
    nome: texto(120).min(3, "Indique o nome completo."),
    telefone: texto(20),
    telefone2: textoOpcional(20),
    provincia: z.enum(PROVINCIAS, { message: "Província inválida." }),
    cidade: texto(80).min(2),
    bairro: texto(80).min(2),
    endereco: texto(300).min(5),
    observacoes: textoOpcional(500)
  }),
  pagamento: z.enum(PAGAMENTOS),
  codigo: textoOpcional(30),
  itens: z.array(z.object({
    id: idTexto,
    tamanho: textoOpcional(10),
    quantidade: z.number().int().min(1).max(20)
  })).min(1, "O carrinho está vazio.").max(30)
});

// Pré-visualização do código no checkout (o valor final é recalculado na encomenda)
const validarDesconto = z.object({
  codigo: texto(30).min(1, "Escreva o código."),
  subtotal: inteiro
});

/* ---------- Autenticação ---------- */
const login = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  palavraPasse: z.string().min(1).max(200)
});

const conta = z.object({
  nome: texto(80).min(2),
  email: z.string().trim().toLowerCase().email().max(160)
});

const palavraPasse = z.object({
  atual: z.string().min(1).max(200),
  nova: z.string().min(8, "Mínimo 8 caracteres.").max(200)
});

/* ---------- Painel ---------- */
const produto = z.object({
  id: idTexto,
  sku: textoOpcional(40),
  nome: texto(160).min(2),
  categoria: idTexto,
  descricao: textoOpcional(3000),
  preco: inteiro.min(1),
  precoAntigo: inteiroOpcional,
  custo: inteiroOpcional,
  stock: inteiroOpcional,
  fornecedorId: z.string().max(120).optional().nullable(),
  // URL, caminho /uploads/… ou foto em data:URL (limitada pelo tamanho do pedido)
  imagem: z.string().max(3000000).optional().nullable(),
  tamanhos: z.array(texto(10)).max(40).optional(),
  publico: z.array(z.enum(["homem", "mulher", "crianca"])).optional(),
  idades: z.array(texto(10)).max(10).optional(),
  destaque: z.boolean().optional(),
  novo: z.boolean().optional(),
  ativo: z.boolean().optional()
}).refine((p) => !p.precoAntigo || p.precoAntigo > p.preco, {
  message: "O preço antigo tem de ser maior que o preço de venda.",
  path: ["precoAntigo"]
});

const categoria = z.object({ id: idTexto, nome: texto(80).min(2), descricao: textoOpcional(200) });

const fornecedor = z.object({
  id: idTexto,
  nome: texto(120).min(2),
  contacto: textoOpcional(120),
  telefone: textoOpcional(30),
  email: z.string().trim().email().max(160).optional().nullable().or(z.literal("")),
  cidade: textoOpcional(80),
  prazo: textoOpcional(60),
  notas: textoOpcional(1000)
});

const zona = z.object({
  id: idTexto,
  provincia: z.enum(PROVINCIAS),
  taxa: inteiroOpcional,
  prazo: textoOpcional(60),
  ativa: z.boolean().optional()
});

const campanha = z.object({
  id: idTexto,
  nome: texto(120).min(2),
  codigo: z.string().trim().max(30).regex(/^[A-Za-z0-9_-]*$/).optional().nullable(),
  tipo: z.enum(["percentagem", "valor"]).optional(),
  valor: inteiro.min(1),
  minimo: inteiroOpcional,
  inicio: dataTexto.optional().nullable().or(z.literal("")),
  fim: dataTexto.optional().nullable().or(z.literal("")),
  ativa: z.boolean().optional()
});

const despesa = z.object({
  id: idTexto,
  data: dataTexto,
  descricao: texto(200).min(2),
  categoria: textoOpcional(60),
  valor: inteiro.min(1)
});

const atualizarEncomenda = z.object({
  estado: z.enum(ESTADOS),
  taxaEntrega: inteiroOpcional,
  pedidoFornecedor: z.boolean().optional(),
  notas: textoOpcional(2000),
  historico: z.array(z.object({
    estado: z.enum(ESTADOS),
    data: z.string().datetime({ offset: true }).or(z.string().datetime()),
    nota: textoOpcional(500)
  })).max(200).optional()
});

const loja = z.object({
  nome: textoOpcional(80),
  cidade: textoOpcional(120),
  telefone: textoOpcional(30),
  whatsapp: z.string().regex(/^258\d{9}$/, "WhatsApp inválido (258 + 9 algarismos).").optional().or(z.literal("")),
  instagram: z.string().trim().url().max(200).optional().or(z.literal("")),
  facebook: z.string().trim().url().max(200).optional().or(z.literal("")),
  horario: z.array(z.tuple([texto(40), texto(60)])).max(10).optional()
});

module.exports = {
  ESTADOS, PAGAMENTOS, PROVINCIAS,
  checkout, validarDesconto, login, conta, palavraPasse,
  produto, categoria, fornecedor, zona, campanha, despesa, atualizarEncomenda, loja
};
