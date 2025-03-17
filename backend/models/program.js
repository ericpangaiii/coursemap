import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Program = mongoose.model('Program', programSchema);

export default Program;