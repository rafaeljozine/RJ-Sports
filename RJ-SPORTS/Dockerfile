# ==========================================================
# RJ SPORTS — imagem de produção (site + API num só serviço)
# Construir:  docker compose build
# A base de dados é PostgreSQL (serviço "db" do docker-compose).
# Fotos e cópias ficam em /dados, num volume — não se perdem ao
# atualizar a imagem.
# ==========================================================

FROM node:22-alpine

# o Prisma precisa do OpenSSL
RUN apk add --no-cache openssl tini su-exec

WORKDIR /app/backend

# 1) dependências (camada em cache enquanto o package.json não mudar)
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 2) Prisma (esquema, migrações e cliente para este sistema)
COPY backend/prisma ./prisma
RUN npx prisma generate

# 3) código do servidor e do site
COPY backend/src ./src
COPY backend/scripts ./scripts
COPY frontend /app/frontend
COPY deploy/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh \
  && mkdir -p /dados/uploads /dados/backups \
  && chown -R node:node /dados

ENV NODE_ENV=production \
    PORT=3000 \
    UPLOADS_DIR=/dados/uploads \
    BACKUP_DIR=/dados/backups \
    FRONTEND_DIR=/app/frontend

# O arranque acerta as permissões de /dados e depois corre o servidor
# como o utilizador "node", sem privilégios. O volume é definido no
# docker-compose.yml.
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3000}/api/saude || exit 1

ENTRYPOINT ["/sbin/tini", "--", "entrypoint.sh"]
CMD ["node", "src/server.js"]
