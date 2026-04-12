ALTER TABLE "columns"
ALTER COLUMN "position" TYPE DOUBLE PRECISION
USING "position"::double precision;
