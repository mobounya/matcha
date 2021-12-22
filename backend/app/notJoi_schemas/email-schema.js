const notJoi = require("../modules/notJoi");

const emailSchema = notJoi.object({
  email: notJoi.string().trim().email().required()
});

module.exports = { emailSchema };
