const { Client } = require("pg");
const client = new Client({
  user: process.env.POSTGRES_USER,
  host: "matcha_db",
  database: "matcha_db",
  password: process.env.POSTGRES_PASSWORD,
  port: 5432
});

client.connect();

async function createUser(userData) {
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
  return client.query(query, [email]);
}

module.exports = { createUser, getUserByEmail };
