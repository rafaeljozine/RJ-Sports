-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "inicial" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "contacto" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "cidade" TEXT,
    "prazo" TEXT,
    "notas" TEXT,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "sku" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoriaId" TEXT NOT NULL,
    "preco" INTEGER NOT NULL,
    "precoAntigo" INTEGER,
    "custo" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "fornecedorId" TEXT,
    "imagem" TEXT,
    "tamanhos" TEXT NOT NULL DEFAULT '[]',
    "publico" TEXT NOT NULL DEFAULT '[]',
    "idades" TEXT NOT NULL DEFAULT '[]',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "novo" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encomenda" (
    "numero" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'Recebida',
    "clienteNome" TEXT NOT NULL,
    "clienteTelefone" TEXT NOT NULL,
    "clienteTelefone2" TEXT,
    "provincia" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "observacoes" TEXT,
    "pagamento" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "desconto" INTEGER,
    "codigoDesconto" TEXT,
    "taxaEntrega" INTEGER,
    "pedidoFornecedor" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,

    CONSTRAINT "Encomenda_pkey" PRIMARY KEY ("numero")
);

-- CreateTable
CREATE TABLE "EncomendaItem" (
    "id" SERIAL NOT NULL,
    "encomendaNumero" TEXT NOT NULL,
    "produtoId" TEXT,
    "nome" TEXT NOT NULL,
    "tamanho" TEXT,
    "quantidade" INTEGER NOT NULL,
    "preco" INTEGER NOT NULL,
    "custo" INTEGER,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "EncomendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoEstado" (
    "id" SERIAL NOT NULL,
    "encomendaNumero" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nota" TEXT,

    CONSTRAINT "HistoricoEstado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zona" (
    "id" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "taxa" INTEGER,
    "prazo" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Zona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campanha" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'percentagem',
    "valor" INTEGER NOT NULL,
    "minimo" INTEGER,
    "inicio" TEXT,
    "fim" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Campanha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Despesa" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "valor" INTEGER NOT NULL,

    CONSTRAINT "Despesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("chave")
);

-- CreateTable
CREATE TABLE "LimitePedido" (
    "chave" TEXT NOT NULL,
    "contagem" INTEGER NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LimitePedido_pkey" PRIMARY KEY ("chave")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Encomenda_clienteTelefone_idx" ON "Encomenda"("clienteTelefone");

-- CreateIndex
CREATE INDEX "Encomenda_estado_idx" ON "Encomenda"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Zona_provincia_key" ON "Zona"("provincia");

-- CreateIndex
CREATE UNIQUE INDEX "Campanha_codigo_key" ON "Campanha"("codigo");

-- CreateIndex
CREATE INDEX "LimitePedido_expiraEm_idx" ON "LimitePedido"("expiraEm");

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncomendaItem" ADD CONSTRAINT "EncomendaItem_encomendaNumero_fkey" FOREIGN KEY ("encomendaNumero") REFERENCES "Encomenda"("numero") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoEstado" ADD CONSTRAINT "HistoricoEstado_encomendaNumero_fkey" FOREIGN KEY ("encomendaNumero") REFERENCES "Encomenda"("numero") ON DELETE CASCADE ON UPDATE CASCADE;

