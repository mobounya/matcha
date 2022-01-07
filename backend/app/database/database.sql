CREATE TYPE sexual_preferences AS ENUM ('heterosexual', 'homosexual', 'bisexual');
CREATE TYPE genders AS ENUM ('f', 'm');

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
  id INT NOT NULL PRIMARY KEY,
  gender genders NULL,
  sexual_preference sexual_preferences NULL,
  biography TEXT NULL,
  profile_compeleted boolean DEFAULT 'f',
  FOREIGN KEY(id) REFERENCES users(id)
);
