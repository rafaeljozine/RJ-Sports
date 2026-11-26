-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "inicial" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "contacto" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "cidade" TEXT,
    "prazo" TEXT,
    "notas" TEXT
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Produto_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Encomenda" (
    "numero" TEXT NOT NULL PRIMARY KEY,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "taxaEntrega" INTEGER,
    "pedidoFornecedor" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT
);

-- CreateTable
CREATE TABLE "EncomendaItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "encomendaNumero" TEXT NOT NULL,
    "produtoId" TEXT,
    "nome" TEXT NOT NULL,
    "tamanho" TEXT,
    "quantidade" INTEGER NOT NULL,
    "preco" INTEGER NOT NULL,
    "custo" INTEGER,
    "subtotal" INTEGER NOT NULL,
    CONSTRAINT "EncomendaItem_encomendaNumero_fkey" FOREIGN KEY ("encomendaNumero") REFERENCES "Encomenda" ("numero") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoricoEstado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "encomendaNumero" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nota" TEXT,
    CONSTRAINT "HistoricoEstado_encomendaNumero_fkey" FOREIGN KEY ("encomendaNumero") REFERENCES "Encomenda" ("numero") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Zona" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provincia" TEXT NOT NULL,
    "taxa" INTEGER,
    "prazo" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Campanha" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'percentagem',
    "valor" INTEGER NOT NULL,
    "minimo" INTEGER,
    "inicio" TEXT,
    "fim" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Despesa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "valor" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "chave" TEXT NOT NULL PRIMARY KEY,
    "valor" TEXT NOT NULL
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

