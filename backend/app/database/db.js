const { Client } = require("pg");

const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT
});

client.connect();

async function createUser(userData) {
  const query =
    "INSERT INTO users(email, username, password, is_active) VALUES($1, $2, $3, $4) RETURNING *";
  const isActive = false;
  const data = await client.query(query, [
    userData.email,
    userData.username,
    userData.password,
    isActive
  ]);
  if (data.rowCount == 1) {
    delete data.rows[0].password;
    const user = data.rows[0];
    return user;
  } else {
    return null;
  }
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

async function addUserProfile(
  userId,
  firstName,
  lastName,
  gender,
  sexualPreference,
  biography
) {
  const query =
    "INSERT INTO profiles(id, first_name, last_name, gender, sexual_preference, biography) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
  const data = await client.query(query, [
    userId,
    firstName,
    lastName,
    gender,
    sexualPreference,
    biography
  ]);
  if (data.rowCount == 1) {
    return data.rows[0];
  } else {
    return null;
  }
}

function getUserProfile(userId) {
  const query = "SELECT * FROM profiles WHERE id = $1";
  return client.query(query, [userId]);
}

async function editUserProfile(profile, userId) {
  const query =
    "UPDATE profiles SET (first_name, last_name, gender, sexual_preference, biography) = ($1, $2, $3, $4, $5) WHERE id = $6 RETURNING *";
  const data = await client.query(query, [
    profile.firstName,
    profile.lastName,
    profile.gender,
    profile.sexualPreference,
    profile.biography,
    userId
  ]);
  return data.rows[0];
}

function addTags(tags) {
  const query = generateAddTagQuery(tags.length, true);
  return client.query(query, tags);

  function generateAddTagQuery(size, toReturn) {
    let query = "INSERT INTO tags(tag) VALUES";

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

async function getTags(tags) {
  const query = generateGetTagsQuery(tags.length);

  const returnedTags = await client.query(query, tags);

  if (returnedTags.rowCount > 0) {
    return returnedTags.rows;
  } else {
    return null;
  }

  function generateGetTagsQuery(size) {
    let query = "SELECT * FROM tags WHERE ";
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
    let query = "INSERT INTO user_tags(user_id, tag_id) VALUES";

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

function deleteUserTags(tags, userId) {
  const query = generateDeleteTagsQuery(tags.length);

  return client.query(query, [userId, ...tags]);

  function generateDeleteTagsQuery(size) {
    let query = "DELETE FROM user_tags WHERE user_id = $1 AND ";
    for (let i = 1; i <= tags.length; i++) {
      let value = `tag_id = $${i + 1}`;
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

async function fetchUserTags(userId) {
  const query =
    "SELECT tags.id, tags.tag FROM tags INNER JOIN user_tags ON tags.id = user_tags.tag_id WHERE user_tags.user_id = $1";
  const userTags = await client.query(query, [userId]);
  return userTags.rows;
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
  addUserTags,
  editUserProfile,
  deleteUserTags,
  fetchUserTags
};
