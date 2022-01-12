const { Client } = require("pg");

const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT
});

client.connect();

function createUser(userData) {
  const query =
    "INSERT INTO users(email, username, first_name, last_name, password, is_active) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
  const is_active = true;
  return client.query(query, [
    userData.email,
    userData.username,
    userData.firstName,
    userData.lastName,
    userData.password,
    is_active
  ]);
}

async function getUserByEmail(email) {
  const query = "SELECT * FROM users WHERE email = $1";
  const data = await client.query(query, [email]);
  if (data.rowCount == 1) {
    return data.rows[0];
  } else {
    return null;
  }
}

async function getUserById(id) {
  const query = "SELECT * FROM users WHERE id = $1";
  const data = await client.query(query, [id]);
  if (data.rowCount == 1) {
    return data.rows[0];
  } else {
    return null;
  }
}

function changeEmailVerifiedValue(email, isVerified) {
  const query = "UPDATE users SET email_verified = $1 WHERE email = $2;";
  return client.query(query, [isVerified, email]);
}

function changeUserPassword(email, newPassword) {
  const query = "UPDATE users SET password = $1 WHERE email = $2";
  return client.query(query, [newPassword, email]);
}

function addUserProfile(userId, gender, sexualPreference, biography) {
  const query =
    "INSERT INTO profiles(id, gender, sexual_preference, biography) VALUES($1, $2, $3, $4) RETURNING *";
  return client.query(query, [userId, gender, sexualPreference, biography]);
}

function getUserProfile(userId) {
  const query = "SELECT * FROM profiles WHERE id = $1";
  return client.query(query, [userId]);
}

function addTags(tags) {
  const query = generateAddTagQuery(tags.length, true);
  return client.query(query, tags);

  function generateAddTagQuery(size, toReturn) {
    var query = "INSERT INTO tags(tag) VALUES";

    for (let i = 1; i <= size; i++) {
      let value = `($${i})`;
      if (i != size) {
        value += ",";
      } else {
        value += " ON CONFLICT DO NOTHING";
        value += toReturn ? " RETURNING *" : "";
        value += ";";
      }
      query += value;
    }

    return query;
  }
}

function getTags(tags) {
  const query = generateGetTagsQuery(tags.length);

  return client.query(query, tags);

  function generateGetTagsQuery(size) {
    var query = "SELECT * FROM tags WHERE ";
    for (let i = 1; i <= tags.length; i++) {
      let value = `tag = $${i}`;
      if (i == size) {
        value += ";";
      } else {
        value += " OR ";
      }
      query += value;
    }
    return query;
  }
}

function addUserTags(userId, tags) {
  const query = generateAddUserTagsQuery(tags.length, true);

  return client.query(query, [userId, ...tags]);

  function generateAddUserTagsQuery(size, toReturn) {
    var query = "INSERT INTO user_tags(user_id, tag_id) VALUES";

    for (let i = 2; i <= size + 1; i++) {
      let value = ` ($1, $${i})`;
      if (i != size + 1) {
        value += ",";
      } else {
        value += " ON CONFLICT DO NOTHING";
        value += toReturn ? " RETURNING *" : "";
        value += ";";
      }
      query += value;
    }

    return query;
  }
}

module.exports = {
  createUser,
  getUserByEmail,
  changeEmailVerifiedValue,
  changeUserPassword,
  addUserProfile,
  getUserProfile,
  getUserById,
  addTags,
  getTags,
  addUserTags
};
