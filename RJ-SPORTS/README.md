# RJ Sports

Loja online de artigos de desporto para Moçambique, em regime de **dropshipping** e com **pagamento na entrega** (numerário, M-Pesa ou e-Mola). Preços em meticais (MT).

```
RJ-SPORTS/
├── frontend/   site da loja (HTML, CSS, JS) e painel de administração (frontend/admin)
└── backend/    servidor Node.js (Express + Prisma): API, base de dados e fotos
```

## Arrancar o projeto

Precisa do **Node.js 18 ou mais recente**.

```powershell
cd RJ-SPORTS/backend
npm install
copy .env.example .env      # depois edite o .env (JWT_SECRET e ADMIN_PASSWORD)
npm run setup               # cria as tabelas e carrega os produtos
npm run dev                 # arranca o servidor
```

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
- **Fotos** — enviadas no painel para `backend/uploads` (JPEG, PNG ou WebP, até 3 MB).

### Segurança incluída

Cabeçalhos de segurança (Helmet, com Content-Security-Policy), limite de tentativas de login (10 / 15 min) e de encomendas, bloqueio de pedidos de outros sites, validação de todos os dados com Zod, e mensagens iguais para "email não existe" e "palavra-passe errada".

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
| `npm run backup` | Cópia de segurança (base de dados + fotos) em `backend/backups` |
| `npm run db:studio` | Abre o Prisma Studio para ver a base de dados |

## Pôr online: Vercel (site) + Railway (servidor)

O **Vercel** serve as páginas da loja e do painel. O **Railway** corre o servidor (API, base de dados SQLite e fotos num disco permanente). O Vercel reencaminha `/api`, `/uploads`, `/robots.txt` e `/sitemap.xml` para o Railway (`frontend/vercel.json`). Para o navegador é um único site, por isso o login do painel e as proteções funcionam como em localhost.

Escolha já o nome do projeto no Vercel (ex.: `rj-sports` → `https://rj-sports.vercel.app`): é preciso no passo 3.

### 1. Railway — criar o servidor

1. Em [railway.com](https://railway.com): **New Project → Deploy from GitHub repo** e escolha o repositório da loja.
2. No serviço criado: **Settings → Source → Root Directory** = `RJ-SPORTS`. O Railway lê o `railway.json` e constrói o `Dockerfile`.
3. **Attach Volume** (clique direito no serviço) com o caminho **`/dados`**. Sem isto, as encomendas e as fotos perdem-se a cada atualização.

### 2. Railway — variáveis (separador *Variables*)

| Variável | Valor |
|---|---|
| `SITE_URL` | `https://rj-sports.vercel.app` (o endereço do Vercel) |
| `TRUST_PROXY` | `2` (Vercel + Railway à frente do servidor) |
| `JWT_SECRET` | texto aleatório com 48+ caracteres |
| `ADMIN_EMAIL` · `ADMIN_PASSWORD` | primeira conta do painel (palavra-passe com 12+ caracteres) |
| `ADMIN_NOME` | opcional |

Depois: **Settings → Networking → Generate Domain**. Fica um endereço como `rj-sports-production.up.railway.app`. Confirme que `https://ESSE-ENDERECO/api/saude` responde `"ok":true`.

### 3. Ligar o site ao servidor

Em `frontend/vercel.json`, troque as 4 ocorrências de `ENDERECO-DO-RAILWAY.up.railway.app` pelo endereço do passo anterior. Depois faça commit e push.

### 4. Vercel — publicar o site

1. Em [vercel.com](https://vercel.com): **Add New → Project** e importe o mesmo repositório.
2. **Project Name** = o nome escolhido (ex.: `rj-sports`). **Root Directory** = `RJ-SPORTS/frontend`. **Framework Preset** = *Other*, sem comando de build.
3. **Deploy**.

### 5. Verificar

- Abra `https://rj-sports.vercel.app/api/saude`. O campo `"ip"` tem de ser **o seu IP** (compare com um site "qual é o meu IP"). Se aparecer outro, mude `TRUST_PROXY` no Railway para `3` (ou `1`) até coincidir. Assim, o limite de tentativas conta cada visitante em separado.
- Entre em `https://rj-sports.vercel.app/admin/login.html` e **mude a palavra-passe**.
- Faça uma encomenda de teste e apague-a depois no painel.

### Domínio próprio (ex.: `rjsports.co.mz`)

Acrescente o domínio no Vercel (**Settings → Domains**) e siga as instruções de DNS. No Railway, mude `SITE_URL` para `https://www.rjsports.co.mz` e ponha o endereço antigo em `ORIGENS_PERMITIDAS=https://rj-sports.vercel.app` (pode ter vários, separados por vírgulas).

### Atualizar

Cada `git push` para o GitHub publica sozinho nos dois serviços. As migrações novas da base de dados são aplicadas ao arrancar.

### Cópias de segurança

No Railway não há `crontab`:
- descarregue a cópia em **Painel → Configurações → Descarregar cópia de segurança** (por exemplo, uma vez por semana);
- ative as cópias automáticas do volume no Railway (separador **Backups** do volume), se o seu plano as incluir.

Para **repor** uma cópia grande, entre no painel pelo endereço do Railway (`https://…up.railway.app/admin/login.html`): o Vercel limita o tamanho dos pedidos.

## Pôr online (servidor VPS com Docker)

É a forma mais simples e barata: um servidor virtual Linux (Ubuntu 22.04 ou 24.04, 1 GB de RAM chega para começar) com Docker. O **Caddy** trata do **HTTPS automaticamente** (certificado gratuito, renovado sozinho) e a base de dados **SQLite** fica num volume do Docker, com cópias diárias.

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

Preencha **DOMINIO**, **SITE_URL**, **JWT_SECRET** (texto aleatório longo), **ADMIN_EMAIL** e **ADMIN_PASSWORD** (12+ caracteres). O servidor recusa arrancar se faltar alguma destas.

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

As cópias ficam no volume (`/dados/backups`, as últimas 14). **Guarde também uma cópia fora do servidor** de vez em quando:

```bash
docker compose cp loja:/dados/backups ./backups-copia
```

Além disso, o painel tem *Configurações → Descarregar cópia de segurança* (ficheiro JSON).

### Atualizar a loja

```bash
git pull                      # ou copie os ficheiros novos
docker compose up -d --build  # as migrações novas são aplicadas sozinhas
```

### Repor uma cópia de segurança

```bash
docker compose stop loja
docker compose cp ./backups-copia/AAAA-MM-DD_HHMM/rjsports.db loja:/dados/rjsports.db
docker compose cp ./backups-copia/AAAA-MM-DD_HHMM/uploads/. loja:/dados/uploads/
docker compose start loja
```

### Alternativa: PostgreSQL

Para crescer (vários servidores, muito tráfego), mude `provider = "sqlite"` para `"postgresql"` em `backend/prisma/schema.prisma`, aponte o `DATABASE_URL` para o PostgreSQL, apague a pasta `backend/prisma/migrations` e gere-a de novo (`npm run db:nova-migracao -- --name inicial`). As cópias passam a ser feitas com `pg_dump`.

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
