/**
 * 2xx Success
 */
module.exports.HTTP_OK = 200;
module.exports.HTTP_CREATED = 201;

/**
 * 4xx Client errors
 */
module.exports.HTTP_BAD_REQUEST = 400;
module.exports.HTTP_UNAUTHORIZED = 401;
module.exports.HTTP_FORBIDDEN = 403;
module.exports.HTTP_NOT_FOUND = 404;
module.exports.HTTP_NOT_ACCEPTABLE = 406;
module.exports.HTTP_CONFLICT = 409;
module.exports.HTTP_UNPROCESSABLE_ENTITY = 422;
module.exports.HTTP_TOO_MANY_REQUESTS = 429;

/**
 * 5xx Server errors
 */
module.exports.HTTP_INTERNAL_SERVER_ERROR = 500;
module.exports.HTTP_NOT_IMPLEMENTED = 501;
module.exports.HTTP_SERVICE_UNVAILABLE = 503;
