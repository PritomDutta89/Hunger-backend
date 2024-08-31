import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";

const foodRouter = express.Router();

//  Image storage engine - store in local [Best way - store in some service provider, e.g. Google cloud storage, aws s3 etc]
const storage = multer.diskStorage({
  destination: "uploads", // specify folder name where you want to store
  filename: function (req, file, cb) {
    return cb(null, Date.now() + "-" + file.originalname); // Specify the file name
  },
});

// Create the multer instance with the storage configuration
const upload = multer({ storage: storage });

// routes
// foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.post("/add", addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);


export default foodRouter;
