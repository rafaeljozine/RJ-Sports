-- Código de desconto aplicado no checkout
ALTER TABLE "Encomenda" ADD COLUMN "desconto" INTEGER;
ALTER TABLE "Encomenda" ADD COLUMN "codigoDesconto" TEXT;
