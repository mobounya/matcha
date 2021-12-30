const express = require("express");
const morgan = require('morgan')
const app = express();
const userRouter = require("./routes/users-router");

app.use(express.json());
app.use(morgan('dev'))
app.use("/users", userRouter);

module.exports = app;