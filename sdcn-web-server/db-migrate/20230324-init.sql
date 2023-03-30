create database sdcn;

create table account (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  nickname text,
  avatar_img text,
  email text,
  create_time timestamptz
);

-- third-party login acount
create table account_oauth (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  account_id bigint NOT NULL,
  username text unique NOT NULL,
  name text,
  email text,
  info json,
  type intger,
  create_time timestamptz
);

comment on column account_oauth.type is '1:github, 2:google, 3:wallet';

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
  node_seq text unique NOT NULL,
  account_id bigint NOT NULL,
  worker text,
  status integer,
  create_time timestamptz,
  last_modify_time timestamptz
);
comment on column node.status is '0:deactivate, 1:activate';

-- task of node
create table node_task (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  account_id bigint NOT NULL,
  node_id bigint NOT NULL,
  task_type integer,
  task_info json,
  model text,
  lora text,
  status integer,
  finish_time timestamptz,
  create_time timestamptz,
  last_modify_time timestamptz
);
comment on column node_task.status_net is '0:offline, 1:online,';
comment on column node_task.status is '0:default, 1:processing, 2:success, 3:failure';
comment on column node_task.task_type is '0:txt2img, 1:img2img';
