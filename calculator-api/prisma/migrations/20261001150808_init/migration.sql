-- CreateTable
CREATE TABLE "calculations" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculation_steps" (
    "id" SERIAL NOT NULL,
    "calculation_id" INTEGER NOT NULL,
    "step_order" INTEGER NOT NULL,
    "operation" TEXT NOT NULL,
    "inputs" DECIMAL(65,30)[],
    "result" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "calculation_steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "calculation_steps" ADD CONSTRAINT "calculation_steps_calculation_id_fkey" FOREIGN KEY ("calculation_id") REFERENCES "calculations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
