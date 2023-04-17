ALTER TABLE node ADD COLUMN node_name text;
UPDATE node SET node_name = worker WHERE node_name IS NULL;
ALTER TABLE node_hash ADD COLUMN node_name text;