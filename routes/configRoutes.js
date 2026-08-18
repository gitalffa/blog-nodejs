const express = require("express");
const router = express.Router();

router.get("/cloudinary", (req, res) => {
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  });
});

module.exports = router;
