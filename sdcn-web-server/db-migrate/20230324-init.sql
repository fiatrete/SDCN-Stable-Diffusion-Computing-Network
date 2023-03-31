create database sdcn;

\c sdcn

create table account (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  uuid text unique NOT NULL,
  nickname text,
  avatar_img text,
  email text,
  create_time timestamptz
);

-- auto-increment sequence, to generate node_seq
-- SELECT nextval('node_seq');
CREATE SEQUENCE node_seq START 1;

-- mapping relathionship between user and node
create table node_hash (
  account_id bigint NOT NULL,
  worker text NOT NULL,
  seq bigint,
  constraint unique_manager unique(account_id, worker)
);

create table node (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  node_seq bigint unique,
  account_id bigint NOT NULL,
  task_count integer,
  worker text,
  status integer,
  deleted integer,
  create_time timestamptz,
  last_modify_time timestamptz
);
comment on column node.status is '0:deactivate, 1:activate';

