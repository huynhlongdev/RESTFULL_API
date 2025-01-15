const express = require("express");
const router = express.Router();
const { uploadMedia, getMedia } = require("../controllers/mediaController");
const upload = require("../config/multerConfig"); // Import Multer config
const { protected, allowedRole } = require("../middleware/authMiddleware");

router.post(
  "/",
  protected,
  allowedRole("admin", "manage"),
  upload.single("media"),
  uploadMedia
);
router.get("/:id", getMedia);
module.exports = router;
