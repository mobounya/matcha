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

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL NOT NULL PRIMARY KEY,
  tag varchar(10) UNIQUE NOT NULL
)

CREATE TABLE IF NOT EXISTS user_tags (
  user_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(tag_id) REFERENCES tags(id),
  UNIQUE (user_id, tag_id)
)

CREATE TABLE IF NOT EXISTS profiles (
  id INT NOT NULL PRIMARY KEY,
  gender genders NULL,
  sexual_preference sexual_preferences NULL,
  biography TEXT NULL,
  profile_compeleted boolean DEFAULT 'f',
  FOREIGN KEY(id) REFERENCES users(id)
);
