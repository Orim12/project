create table messages (
    id serial primary key,
    sender text not null,
    text text not null,
    timestamp timestamptz not null default now()
);
