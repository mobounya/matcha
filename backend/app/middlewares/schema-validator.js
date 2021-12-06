const httpStatus = require("../lib/http-status");

function validateSchema(schema, field) {
  return function (request, response, next) {
    const { errors, value } = schema.validate(request[field]);

    if (errors) {
      response.status(httpStatus.HTTP_BAD_REQUEST).json({
        errors: errors
      });
    } else {
      request[field] = value;
      next();
    }
  };
}

module.exports = {
  validateSchema,
  requestFields: {
    BODY: "body",
    PARAMS: "params",
    QUERY: "query"
  }
};
