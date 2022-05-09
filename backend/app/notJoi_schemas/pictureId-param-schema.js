const notJoi = require("../modules/notJoi");

const pictureIdParamSchema = notJoi.object({
  pictureId: notJoi.integer().min(1).required()
});

module.exports = { pictureIdParamSchema };
