-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "column_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3),
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "position" DOUBLE PRECISION NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_column_id_idx" ON "tasks"("column_id");

-- CreateIndex
CREATE INDEX "tasks_created_by_idx" ON "tasks"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_column_id_position_key" ON "tasks"("column_id", "position");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

