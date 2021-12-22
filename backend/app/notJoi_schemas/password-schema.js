const notJoi = require("../modules/notJoi");

const passwordSchema = notJoi.object({
  password: notJoi.string().trim().min(8).max(64).required()
});

module.exports = { passwordSchema };
