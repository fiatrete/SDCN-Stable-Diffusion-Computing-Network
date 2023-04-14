ALTER TABLE account ADD COLUMN role smallint default 0;
ALTER TABLE account ADD COLUMN honor_amount bigint default 0;
ALTER TABLE account ADD COLUMN api_key text;
comment on column account.role is comment "0:default 1:admin";
comment on column account.honor_amount is comment "unit: ten to the power of negative four";

create table honor_record (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  account_id bigint NOT NULL,
  payer_id bigint,
  node_seq bigint,
  task_id text,
  type smallint default 0,
  amount bigint NOT NULL,
  create_time timestamptz
);
comment on column honor_record.type is comment "0:present 1:transfer 2:reward-online 3:reward-task";


--- add random_string func
create or replace function random_string(integer)
returns text as
$body$
    select upper(array_to_string(array(select substring('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' FROM (ceil(random()*62))::int FOR 1) FROM generate_series(1, $1)), ''));
$body$
language sql volatile;
--- update api_key
update account set api_key = 'sk-' || random_string(40)  where api_key is null;

-- update honor_amount
update account set honor_amount = 10000 where id in (select account.id from account
left join honor_record on honor_record.account_id = account.id and honor_record.type = 0
where honor_record.id is null);

-- add present honor record
insert into honor_record(account_id, type, amount, create_time) 
select account.id, 0, 10000, now() from account
left join honor_record on honor_record.account_id = account.id and honor_record.type = 0
where honor_record.id is null;
