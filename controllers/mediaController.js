const mediaModel = require("../models/mediaModel");
const cloudinary = require("../config/cloudinaryConfig");

exports.uploadMedia = async (req, res) => {
  try {
    // Lấy đường dẫn file đã upload từ Multer
    // const filePath = `uploads/${req.file.filename}`;

    // // Tạo mới một Media trong MongoDB
    // const newMedia = new mediaModel({
    //   url: filePath, // Đường dẫn file
    // });

    // await newMedia.save();

    // res.status(201).json({
    //   success: true,
    //   message: "File uploaded successfully!",
    //   data: newMedia,
    // });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    cloudinary.uploader
      .upload_stream(
        { folder: "uploads" }, // Chọn thư mục upload trên Cloudinary
        async (error, result) => {
          if (error) {
            return res.status(500).json({
              success: false,
              message: "Lỗi upload file lên Cloudinary!",
              error: error.message,
            });
          }

          // Save image to DB
          const newMedia = await mediaModel.create({
            url: result.secure_url,
            public_id: result.public_id,
          });

          res.status(200).json({
            success: true,
            message: "Upload file thành công!",
            data: newMedia,
          });
        }
      )
      .end(req.file.buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Description: Get single image
 * Router: /api/v1/upload
 * Method: GET
 * Access: Public
 */
exports.getMedia = async (req, res) => {
  try {
    const { id, ids } = req.params;

    console.log(">>>", id);

    // Build query
    let categoryQuery = mediaModel.findById(id);

    const category = await categoryQuery;

    if (!category) {
      // Check if category exists
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
