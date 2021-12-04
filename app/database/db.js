const { Client } = require("pg");
const client = new Client({
  user: process.env.DB_USER,
  host: "matcha_db",
  database: "matcha_db",
  password: process.env.DB_PASSWORD,
  port: 5432
});

client.connect();

async function createUser(userData) {
  const query =
    "INSERT INTO users(email, username, first_name, last_name, password) VALUES($1, $2, $3, $4, $5) RETURNING *";
  return client.query(query, [
    userData.email,
    userData.username,
    userData.firstName,
    userData.lastName,
    userData.password
  ]);
}

async function getUserByEmail(email) {
  const query = "SELECT * FROM users WHERE email = $1";
  return client.query(query, [email]);
}

module.exports = { createUser, getUserByEmail };
