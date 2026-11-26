#!/bin/sh
# ==========================================================
# Arranque do contentor:
#   0) se arrancar como administrador: acerta as permissões de
#      /dados e continua como o utilizador "node" (sem privilégios)
#   1) aplica as migrações pendentes da base de dados
#   2) carrega os dados iniciais (só se a base estiver vazia)
#   3) arranca o servidor
# ==========================================================
set -e

if [ "$(id -u)" = "0" ]; then
  mkdir -p /dados/uploads /dados/backups
  chown -R node:node /dados
  exec su-exec node "$0" "$@"
fi

echo "→ A aplicar migrações da base de dados…"
npx prisma migrate deploy

echo "→ A verificar dados iniciais…"
node prisma/seed.js

echo "→ A arrancar o servidor…"
exec "$@"
