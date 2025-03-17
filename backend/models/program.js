import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

const Program = mongoose.model('Program', programSchema);

export default Program;