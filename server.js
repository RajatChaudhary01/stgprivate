const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: "./public/images",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

app.use(express.static("./public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Add this line to set views directory

app.get("/", (req, res) => {
  const images = [];

  fs.readdirSync("./public/images").forEach((file) => {
    images.push({ filename: file });
  });

  res.render("gallery", { images, msg: null }); // Set default value of msg to null
});

app.get("/gallery", (req, res) => {
  const msg = "Hello world";
  res.render("gallery", { images: [], msg });
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render("gallery", {
        msg: err,
        images: [],
      });
    } else {
      if (req.file == undefined) {
        res.render("gallery", {
          msg: "Error: No File Selected!",
          images: [],
        });
      } else {
        res.redirect("/");
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
