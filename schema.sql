create table if not exists users (
  id varchar(50) primary key,
  username varchar(255) unique,
  email varchar(255) unique not null,
  password varchar(255) not null
);