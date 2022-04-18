const fs = require("fs");
const multer = require("multer");
const httpStatus = require("../lib/http-status");
const { isPng, isJpeg } = require("./check-file-signature");

const limits = {
	fileSize: 5 * 1024 * 1024,
	files: 1
}

const storage = multer.memoryStorage();

const options = {
	limits: limits,
	storage: storage,
}

const fileFilter = (req, res, next) => {
	((req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg') && isJpeg(req.file.buffer)) ? next() : 
	(req.file.mimetype === 'image/png' && isPng(file.buffer)) ? next() :
	res.status(httpStatus.HTTP_UNSUPPORTED_MEDIA_TYPE).json({
		message: "Unsupported file type, please upload a jpeg or png picture"
	});
}

const upload = multer(options).single('picture');

const uploadPicture = (req, res, next) => {
	 upload(req, res, (err) => {
		if (err) {
			return res.status(httpStatus.HTTP_UNSUPPORTED_MEDIA_TYPE).json({
				message: "Unsupported file type, please upload a jpeg or png file"
			});
		} else { next(); }
	});
}

const streamPicture = (path, buffer) => {
	return new Promise((resolve, reject) => {
	const writableStream = fs.createWriteStream(path);
	writableStream.write(buffer);
	writableStream.end();
	writableStream.on('finish', () => {
		resolve();
	});
	writableStream.on('error', (err) => {
		reject(err);
	});
});
}


module.exports = { fileFilter, uploadPicture, streamPicture };
