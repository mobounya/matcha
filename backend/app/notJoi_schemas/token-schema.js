const notJoi = require("../modules/notJoi");

const tokenSchema = notJoi.object({
  token: notJoi.string().min(1).required()
});

module.exports = { tokenSchema };
