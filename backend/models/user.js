import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      default: 'Unknown User'
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    displayPicture: String,
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

export default User;