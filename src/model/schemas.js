const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  deadline: { type: Date, required: true },
});

const userSchema = new Schema({
  username: { type: String, required: true },
  chatId: { type: Number, required: true },
  tasks: { type: Array[taskSchema], required: true },
});

const Task = model("Task", taskSchema);
const User = model("User", userSchema);

module.exports = {
  Task,
  User,
};
