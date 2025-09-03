import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // email optional if phone is used
    password: { type: String }, // hashed password, required only for email signup
    phone: { type: String, unique: true, sparse: true }, // phone optional if email is used
    role: { type: String, default: "citizen" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
