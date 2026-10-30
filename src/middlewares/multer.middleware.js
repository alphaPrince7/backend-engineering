import multer from "multer";
import crypto from "crypto";
import path from "path";

// const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err);
      const ext = path.extname(file.originalname);

      cb(null, file.fieldname + "-" + raw.toString("hex") + ext);
    });
  }, //explore this
});

export const upload = multer({
  storage,
});
