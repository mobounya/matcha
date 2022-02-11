const notJoi = require("../modules/notJoi");

const userIdParamSchema = notJoi.object({
  userId: notJoi.integer().min(1).required()
});

module.exports = { userIdParamSchema };
