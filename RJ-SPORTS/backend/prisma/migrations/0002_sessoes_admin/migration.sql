-- Sessões do painel: as anteriores a esta data deixam de valer.
-- Grava em UTC explicitamente (a coluna não tem fuso horário e o Prisma lê-a como UTC).
ALTER TABLE "Admin" ADD COLUMN "sessoesDesde" TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC');
