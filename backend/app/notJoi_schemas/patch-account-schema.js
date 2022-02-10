const notJoi = require("../modules/notJoi");

const patchAccountSchema = notJoi.object({
  email: notJoi.string().trim().email().required(),
  username: notJoi.string().trim().min(3).max(30).required()
});

module.exports = { patchAccountSchema };
