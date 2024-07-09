import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cartData: {
    type: Object,
    default: {},
  },
}, {minimize: false}); //minimize: false ---- if you dont add this then mongoose will store {} -> Null

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
