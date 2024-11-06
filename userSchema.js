import mongoose from "mongoose";

// User schema and model
const userSchema = mongoose.Schema({
    name: String,
    username: String, // Change 'user' to 'username'
    password: String,
});

const userModel = mongoose.model("User", userSchema);
export default userModel;