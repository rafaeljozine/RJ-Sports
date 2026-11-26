# RJ Sports

Loja online de artigos de desporto para Moçambique, em regime de **dropshipping** e com **pagamento na entrega** (numerário, M-Pesa ou e-Mola). Preços em meticais (MT).

```
RJ-SPORTS/
├── frontend/   site da loja (HTML, CSS, JS) e painel de administração (frontend/admin)
├── backend/    servidor Node.js (Express + Prisma + PostgreSQL): API, base de dados e fotos
├── api/        entrada da API como função do Vercel (usa o backend)
└── vercel.json configuração do Vercel
```

## Arrancar o projeto

Precisa do **Node.js 18 ou mais recente** e de um **PostgreSQL** neste computador, com uma base de dados vazia chamada `rjsports`.

```powershell
cd RJ-SPORTS/backend
npm install
copy .env.example .env      # depois edite o .env (DATABASE_URL, JWT_SECRET e ADMIN_PASSWORD)
npm run setup               # cria as tabelas e carrega os produtos
npm run dev                 # arranca o servidor
```

Para criar a base de dados: `createdb -U postgres rjsports` (ou pelo pgAdmin).

Depois abra:

| | Endereço |
|---|---|
| Loja | http://localhost:3000 |
| Painel | http://localhost:3000/admin/login.html |
| Estado da API | http://localhost:3000/api/saude |

Entre no painel com o `ADMIN_EMAIL` e a `ADMIN_PASSWORD` do `.env` e **mude a palavra-passe** em *Configurações* no primeiro acesso.

### Sem servidor

O site também abre só com os ficheiros (por exemplo, `python -m http.server` na pasta `frontend`). Nesse caso usa o catálogo de `frontend/js/produtos.js` e guarda tudo **só no navegador** — serve para ver o design, não para vender.

## Como funciona

- **Catálogo** — a loja carrega `/api/catalogo.js` antes do resto; só vão para o site os produtos visíveis, sem custos nem fornecedores.
- **Encomendas** — o checkout envia para `POST /api/encomendas`. O servidor **recalcula os preços** a partir da base de dados (o navegador não consegue alterá-los), valida o telefone de Moçambique e o tamanho, aplica a taxa da zona e devolve o número `RJS-123456`. O cliente envia ainda a encomenda pelo WhatsApp.
- **Códigos de desconto** — o cliente escreve o código no resumo do checkout (`POST /api/descontos/validar` mostra o desconto). Ao registar a encomenda, o servidor volta a validar a campanha (ligada, dentro das datas, acima da compra mínima) e grava o desconto e o código; o `total` da encomenda já vem com o desconto.
- **Acompanhar** — `GET /api/encomendas/:numero?telefone=…` só responde se o telefone coincidir.
- **Painel** — login com cookie de sessão `httpOnly`/`SameSite=Strict` (JWT) e palavra-passe com bcrypt. As páginas recebem os dados de `/api/admin/dados.js` e cada gravação envia ao servidor só o que mudou.
- **Fotos** — enviadas no painel (JPEG, PNG ou WebP, até 3 MB). No Vercel ficam no **Vercel Blob**; em localhost e no Docker, na pasta `backend/uploads`.

### Segurança incluída

Cabeçalhos de segurança (Helmet, com Content-Security-Policy), limite de tentativas de login (10 / 15 min) e de encomendas (contadores guardados na base de dados, para funcionar também no Vercel), bloqueio de pedidos de outros sites, validação de todos os dados com Zod, e mensagens iguais para "email não existe" e "palavra-passe errada".

## API

| Método | Endereço | Para quê |
|---|---|---|
| GET | `/api/catalogo` · `/api/produtos` · `/api/categorias` · `/api/zonas` | Dados públicos da loja |
| POST | `/api/encomendas` | Checkout (aceita `codigo` de desconto) |
| POST | `/api/descontos/validar` | Pré-visualizar um código de desconto |
| GET | `/api/encomendas/:numero?telefone=` | Acompanhar encomenda |
| POST | `/api/auth/entrar` · `/api/auth/sair` | Login do painel |
| GET · PUT | `/api/auth/eu` · `/api/auth/conta` · `/api/auth/palavra-passe` | Conta |
| CRUD | `/api/admin/produtos` · `categorias` · `fornecedores` · `zonas` · `campanhas` · `despesas` | Gestão |
| GET · PUT · DELETE | `/api/admin/encomendas[/:numero]` | Encomendas (estado, taxa, notas) |
| GET | `/api/admin/clientes` · `/api/admin/financeiro/resumo?mes=AAAA-MM` | Clientes e finanças |
| GET · PUT | `/api/admin/loja` | Contactos da loja |
| POST | `/api/admin/uploads` · `/api/admin/importar` | Fotos e cópia de segurança |

## Comandos úteis (pasta `backend`)

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor em desenvolvimento (reinicia ao guardar) |
| `npm start` | Servidor em produção |
| `npm run setup` | Aplica as migrações e carrega os dados iniciais (só numa base vazia) |
| `npm run db:migrate` | Aplica migrações novas da base de dados |
| `npm run db:nova-migracao -- --name descricao` | Depois de mudar o `schema.prisma`, cria a migração |
| `npm run backup` | Cópia de segurança dos dados (ficheiro JSON, reposto pelo painel) em `backend/backups` |
| `npm run db:studio` | Abre o Prisma Studio para ver a base de dados |

## Pôr online no Vercel

Tudo fica no Vercel:
- **Site e painel:** ficheiros estáticos (pasta `frontend`).
- **API:** função do Vercel (`api/index.js`, que usa o mesmo Express do `backend`).
- **Base de dados:** **Neon** (PostgreSQL).
- **Fotos:** **Vercel Blob**.

Para uma loja deste tamanho, os planos gratuitos chegam para começar.

### 1. Criar o projeto

1. Em [vercel.com](https://vercel.com): **Add New → Project** e importe o repositório do GitHub.
2. **Root Directory** = `RJ-SPORTS`. O resto vem do `vercel.json`: *Framework Preset* = Other, a instalação, o build e a pasta `frontend`.
3. O primeiro *Deploy* falha por ainda não haver base de dados. É normal: continue no passo 2.

### 2. Base de dados e fotos (separador *Storage* do projeto)

1. **Create Database → Neon** (Postgres), região **Frankfurt** (a mais próxima de Moçambique) → ligar ao projeto. São criadas as variáveis `DATABASE_URL` e `DATABASE_URL_UNPOOLED`.
2. **Create → Blob** → ligar ao projeto. É criada a variável `BLOB_READ_WRITE_TOKEN`.

### 3. Variáveis (*Settings → Environment Variables*)

| Variável | Valor |
|---|---|
| `JWT_SECRET` | texto aleatório com 48+ caracteres |
| `ADMIN_EMAIL` · `ADMIN_PASSWORD` | primeira conta do painel (palavra-passe com 12+ caracteres) |
| `ADMIN_NOME` | opcional |
| `SITE_URL` | opcional — sem ela usa o endereço de produção do Vercel |

Para gerar o `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

### 4. Publicar

Em **Deployments → Redeploy** (ou um `git push`). No build:
1. as tabelas são criadas (`prisma migrate deploy`);
2. o catálogo é carregado;
3. é criada a conta do painel.

Depois disso, cada `git push` publica de novo sozinho.

### 5. Verificar

- `https://SEU-PROJETO.vercel.app/api/saude` responde `"ok":true`. O campo `"ip"` tem de ser o seu IP.
- Entre em `/admin/login.html` e **mude a palavra-passe**.
- Envie uma foto num produto. O endereço da foto começa por `https://…blob.vercel-storage.com`.
- Faça uma encomenda de teste e apague-a no painel.

### Domínio próprio (ex.: `rjsports.co.mz`)

1. **Settings → Domains** → acrescente o domínio e siga as instruções de DNS.
2. Defina `SITE_URL=https://www.rjsports.co.mz`.
3. Defina `ORIGENS_PERMITIDAS=https://SEU-PROJETO.vercel.app`, para o painel continuar a funcionar também nesse endereço.

### Cópias de segurança

- **Base de dados:** o Neon guarda o histórico e permite voltar a um momento anterior (*restore*). No plano gratuito são poucas horas, por isso não conte só com isto.
- **Faça também a sua cópia:** **Painel → Configurações → Descarregar cópia de segurança**, por exemplo uma vez por semana. Em alternativa, corra no seu computador `npm run backup` com o `DATABASE_URL` do Neon no `.env`.
- **Fotos:** ficam no Vercel Blob. A cópia de segurança guarda os endereços das fotos, não as imagens.

### Limites do Vercel a ter em conta

- **Pedidos até 4,5 MB.** As fotos (3 MB) cabem. Uma cópia de segurança maior do que isso não pode ser reposta pelo painel; nesse caso, reponha-a com o servidor a correr no seu computador e o `DATABASE_URL` do Neon.
- **Builds de pré-visualização.** Cada push para outro ramo também corre as migrações. Se a base de dados for a mesma da produção, use migrações compatíveis com a versão anterior. Também pode ativar no Neon uma base separada para as pré-visualizações (*Preview branches*).

## Alternativa: servidor VPS com Docker

Um servidor virtual Linux (Ubuntu 22.04 ou 24.04, com 1 GB de RAM) e Docker:
- o **Caddy** trata do **HTTPS automaticamente** (certificado gratuito, renovado sozinho);
- a base de dados **PostgreSQL** e as fotos ficam em volumes do Docker, com cópias diárias.

### Antes de começar

- [ ] Um **domínio** (ex.: `rjsports.co.mz`) com um registo DNS **A** a apontar para o IP do servidor (e outro para `www`, se usar).
- [ ] Um **servidor VPS** com as portas **80** e **443** abertas.
- [ ] O **número de WhatsApp** e as **redes sociais** reais (alteram-se depois no painel → Configurações).
- [ ] **Fotos reais** dos produtos (as atuais são do Unsplash, só para ilustrar).

### 1. Instalar o Docker no servidor

```bash
curl -fsSL https://get.docker.com | sh
```

### 2. Enviar o projeto e configurar

Copie a pasta `RJ-SPORTS` para o servidor (por Git ou `scp`) e, dentro dela:

```bash
cp .env.producao.example .env.producao
nano .env.producao
```

Preencha **DOMINIO**, **SITE_URL**, **JWT_SECRET** (texto aleatório longo), **POSTGRES_PASSWORD**, **ADMIN_EMAIL** e **ADMIN_PASSWORD** (12+ caracteres). O servidor recusa arrancar se faltar alguma destas.

### 3. Arrancar

```bash
docker compose up -d --build
docker compose logs -f loja      # ver o arranque (Ctrl+C para sair)
```

No primeiro arranque são criadas as tabelas, carregados os produtos e criada a conta do painel. Abra `https://SEU-DOMINIO/admin/login.html`, entre e **mude a palavra-passe**.

### 4. Cópias de segurança diárias

No servidor, `crontab -e` e acrescente (todos os dias às 3h):

```
0 3 * * * cd /caminho/para/RJ-SPORTS && docker compose exec -T loja npm run backup >> backup.log 2>&1
```

As cópias (ficheiros JSON, as últimas 14) ficam no volume, em `/dados/backups`. As fotos ficam em `/dados/uploads`. **Guarde também uma cópia fora do servidor** de vez em quando:

```bash
docker compose cp loja:/dados/backups ./backups-copia
docker compose cp loja:/dados/uploads ./uploads-copia
```

Além disso, o painel tem *Configurações → Descarregar cópia de segurança* (ficheiro JSON).

### Atualizar a loja

```bash
git pull                      # ou copie os ficheiros novos
docker compose up -d --build  # as migrações novas são aplicadas sozinhas
```

### Repor uma cópia de segurança

No painel: **Configurações → Repor cópia de segurança** e escolha o ficheiro JSON. As fotos repõem-se com:

```bash
docker compose cp ./uploads-copia/. loja:/dados/uploads/
```

### Já incluído para produção

- HTTPS automático e redirecionamento do domínio alternativo (Caddy).
- Cabeçalhos de segurança, incluindo HSTS e Content-Security-Policy.
- Compressão das respostas e cache dos ficheiros (imagens 7 dias, CSS/JS 1 hora, páginas sempre atualizadas).
- `robots.txt` e `sitemap.xml` (gerado com os produtos) para o Google.
- Ícone da loja (favicon) e descrição para partilhas nas redes sociais.
- Registo de pedidos sem dados pessoais e verificação de saúde (`/api/saude`) com reinício automático.
- O servidor corre sem privilégios de administrador dentro do contentor.

## Ainda por fazer

- Envio automático de avisos (SMS / WhatsApp) quando o estado da encomenda muda.
- Fotos reais dos produtos (as atuais são do Unsplash, só para ilustrar).
