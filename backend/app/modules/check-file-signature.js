/**
 * ------------------ Jpeg Signatures -------------------- *
 * ------------------------------------------------------- *
 * -------*Signature*---------------*Description*--------- *
 * ------------------------------------------------------- *
 * ------FF D8 FF E0--------|-----JPEG/JPG IMAGE---------- *
 * ------FF D8 FF E2--------|----CANNON EOS JPEG FILE----- *
 * ------FF D8 FF E3--------|----SAMSUNG D500 JPEG FILE--- *
 * ------------------------------------------------------- *
 * ------------------ Jpg Signatures --------------------- *
 * ------------------------------------------------------- *
 * -------*Signature*---------------*Description*--------- *
 * ------------------------------------------------------- *
 * ------FF D8 FF E1--------|-----------EXIF-------------- *
 * ------FF D8 FF E8--------|-----------SPIFF------------- *
 * ------------------------------------------------------- *
 * -------------------- Png Signatures ------------------- *
 * ------------------------------------------------------- *
 * -------*Signature*---------------*Description*--------- *
 * ------------------------------------------------------- *
 * -89 50 4E 47 0D 0A 1A 0A-|---------PNG IMAGE----------- *
* ------------------------------------------------------- *
 **/

// the following function check if a given buffer's header belongs to a jpeg or jpg file
 const isJpeg = buffer => {
	const jpegHeader = [0xFF, 0xD8, 0xFF];
	const jpegByte4 = [0xE0, 0xE1, 0xE2, 0xE3, 0xE8];

	if (!buffer || buffer.length < 4) {
		return false;
	}

	jpegHeader.forEach(
		(byte, index) => {
			if (buffer[index] !== byte) {
				return false;
			}
		}
	);

	jpegByte4.forEach(
		(byte) => {
			if (buffer[4] !== byte) {
				return false;
			}
		}
	);

	return true;
}

const isPng = buffer => {
	const pngHeader = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
	if (!buffer || buffer.length < 8) {
		return false;
	}
	pngHeader.forEach(
		(byte, index) => {
			if (buffer[index] !== byte) {
				return false;
			}
		}
	);
	return true;
}

module.exports = {isPng, isJpeg};

// All the used signatures are from https://filesignatures.net/index.php?page=all