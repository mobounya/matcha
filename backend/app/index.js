const express = require("express");
const morgan = require("morgan");
const app = express();
const userRouter = require("./routes/users-router");
const searchRouter = require("./routes/search-router");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.use("/users", userRouter);

app.use("/search", searchRouter);

module.exports = app;
