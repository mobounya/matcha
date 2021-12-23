CREATE TABLE IF NOT EXISTS users (
  id SERIAL NOT NULL PRIMARY KEY,
  first_name varchar(35) NOT NULL,
  last_name varchar(35) NOT NULL,
  username varchar(30) NOT NULL,
  email varchar(254) NOT NULL,
  password varchar(64) NOT NULL,
  email_verified boolean DEFAULT 'f',
  is_active boolean DEFAULT 'f'
);

CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL NOT NULL PRIMARY KEY,
  user_id INT,
  gender CHARACTER NULL,
  sexual_preference varchar(12) NULL,
  biography TEXT NULL,
  profile_compeleted boolean DEFAULT 'f',
  FOREIGN KEY(user_id) REFERENCES users(id)
);
