const { jwtVerifyToken } = require("../modules/jwt");
const httpStatus = require("../lib/http-status");

function verifyToken(jwtSecretKey, field) {
    return async(request, response, next) => {
        try {
            const token = request[field].token;

            const decodedPayload = await jwtVerifyToken(token, jwtSecretKey);
            request.decodedPayload = decodedPayload;
            next();
        } catch (e) {
            response.status(httpStatus.HTTP_BAD_REQUEST).json({
                error: "Invalid token"
            });
        }
    };
}

module.exports = { verifyToken };