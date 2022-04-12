CREATE TYPE sexual_preferences AS ENUM ('heterosexual', 'homosexual', 'bisexual');
CREATE TYPE genders AS ENUM ('f', 'm');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL NOT NULL PRIMARY KEY,
  email varchar(254) NOT NULL,
  username varchar(30) NOT NULL,
  password varchar(64) NOT NULL,
  email_verified boolean DEFAULT 'f',
  is_active boolean DEFAULT 'f'
);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL NOT NULL PRIMARY KEY,
  tag varchar(10) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_tags (
  user_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(tag_id) REFERENCES tags(id),
  UNIQUE (user_id, tag_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id INT NOT NULL PRIMARY KEY,
  first_name varchar(35) NOT NULL,
  last_name varchar(35) NOT NULL,
  gender genders NULL,
  sexual_preference sexual_preferences NULL,
  biography TEXT NULL,
  profile_compeleted boolean DEFAULT 'f',
  FOREIGN KEY(id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS pictures (
  pictures_id SERIAL NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  pictures_index INT DEFAULT 0,
  is_profile_picture boolean DEFAULT 'f',
  upload_date timestamp,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Drop all tables --
DROP TABLE pictures;
DROP TABLE profiles;
DROP TYPE genders;
DROP TYPE sexual_preferences;
DROP TABLE user_tags;
DROP TABLE tags;
DROP TABLE users;