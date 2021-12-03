const express = require("express");
const router = express.Router();

const {
  validateSchema,
  requestFields
} = require("../middlewares/schema-validator");

const { signupSchema } = require("../notJoi_schemas/signup-schema");

/* 
  User routes
*/

router.post("/signup", validateSchema(signupSchema, requestFields.BODY));

module.exports = router;
