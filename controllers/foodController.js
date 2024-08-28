import foodModel from "../models/foodModel.js";
import fs from "fs";

// add food item - POST
const addFood = async (req, res) => {
  // let image_filename = `${req.file.filename}`;

  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: req.body.image, //image_filename
  });

  try {
    await food.save(); // insert in DB
    res.json({
      success: true,
      message: "Food Added",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// food list - GET
const listFood = async (req, res) => {
  try {
    const food = await foodModel.find({});
    res.json({ success: true, data: food });
  } catch (error) {
    console.log(error);
    res.json({ success: false, data: "Something went wrong" });
  }
};

// remove food item -  POST [POST for delete bcz I want image name ]
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body._id); // by this find the whole object for that specific ID
    // fs.unlink(`uploads/${food.image}`, () => {}); // Delete img from uploads folder

    await foodModel.findByIdAndDelete(req.body._id); // Delete from DB
    res.json({ success: true, message: "Food removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, data: "Something went wrong" });
  }
};

export { addFood, listFood, removeFood };
