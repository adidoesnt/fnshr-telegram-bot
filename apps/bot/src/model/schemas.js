const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const taskSchema = new Schema({
  title: { type: String, required: true }, // title unique
  date: { type: String, required: true },
  deadline: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["ongoing", "completed", "forfeited"],
  },
});

const userSchema = new Schema({
  username: { type: String, required: true },
  tasks: { type: [taskSchema], required: true },
});

const Task = model("Task", taskSchema);
const User = model("User", userSchema);

module.exports = {
  Task,
  User,
};
