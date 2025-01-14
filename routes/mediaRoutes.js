const express = require("express");
const router = express.Router();
const { uploadMedia, getMedia } = require("../controllers/mediaController");
const upload = require("../config/multerConfig"); // Import Multer config

// // Cấu hình Multer để lưu trữ file
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Thư mục lưu trữ file
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + "-" + file.originalname); // Đặt tên file
//   },
// });

// // Bộ lọc file (Chỉ chấp nhận ảnh)
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true); // Accept file
//   } else {
//     cb(new Error("File không được hỗ trợ!"), false); // Reject file
//   }
// };

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn file 5MB
//   fileFilter: fileFilter,
// });

// const uploadMiddleware = (req, res, next) => {
//   upload(req, res, function (err) {
//     if (err instanceof multer.MulterError) {
//       if (err.code === "LIMIT_FILE_SIZE") {
//         return res.status(400).json({
//           success: false,
//           message: "Kích thước file quá lớn! Giới hạn tối đa là 5MB.",
//         });
//       }
//       return res.status(400).json({
//         success: false,
//         message: "Đã xảy ra lỗi khi upload file.",
//       });
//     } else if (err) {
//       return res.status(400).json({
//         success: false,
//         message: err.message,
//       });
//     }
//     next();
//   });
// };

router.post("/", upload.single("media"), uploadMedia);
router.get("/:id", getMedia);
module.exports = router;
