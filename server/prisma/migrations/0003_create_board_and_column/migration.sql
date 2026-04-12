-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "columns" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "columns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "boards_created_by_idx" ON "boards"("created_by");

-- CreateIndex
CREATE INDEX "columns_board_id_idx" ON "columns"("board_id");

-- CreateIndex
CREATE UNIQUE INDEX "columns_board_id_position_key" ON "columns"("board_id", "position");

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "columns" ADD CONSTRAINT "columns_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Enable UUID generator for trigger inserts
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed default columns for every new board
CREATE OR REPLACE FUNCTION seed_default_columns_for_board()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO "columns" ("id", "board_id", "name", "position")
    VALUES
      (gen_random_uuid()::text, NEW."id", 'To Do', 0),
      (gen_random_uuid()::text, NEW."id", 'In Progress', 1),
      (gen_random_uuid()::text, NEW."id", 'Done', 2);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_seed_default_columns_for_board ON "boards";

CREATE TRIGGER trigger_seed_default_columns_for_board
AFTER INSERT ON "boards"
FOR EACH ROW
EXECUTE FUNCTION seed_default_columns_for_board();
