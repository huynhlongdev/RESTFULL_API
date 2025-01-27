const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;
