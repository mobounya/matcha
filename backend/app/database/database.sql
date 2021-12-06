CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL NOT NULL PRIMARY KEY,
  first_name varchar(35) NOT NULL,
  last_name varchar(35) NOT NULL,
  username varchar(30) NOT NULL,
  email varchar(254) NOT NULL,
  password varchar(64) NOT NULL,
  email_verified boolean DEFAULT 'f',
  profile_compeleted boolean DEFAULT 'f',
  is_active boolean DEFAULT 'f'
);