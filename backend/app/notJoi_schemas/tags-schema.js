const notJoi = require("../modules/notJoi");

const tagsSchema = notJoi.object({
  tags: notJoi.array().min(1).required()
});

module.exports = { tagsSchema };
