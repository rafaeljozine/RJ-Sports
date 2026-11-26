#!/bin/sh
# ==========================================================
# Arranque do contentor:
#   1) aplica as migrações pendentes da base de dados
#   2) carrega os dados iniciais (só se a base estiver vazia)
#   3) arranca o servidor
# ==========================================================
set -e

echo "→ A aplicar migrações da base de dados…"
npx prisma migrate deploy

echo "→ A verificar dados iniciais…"
node prisma/seed.js

echo "→ A arrancar o servidor…"
exec "$@"
