const { User, Task } = require("../model/schemas");
const { initDb, closeDb } = require("../model/repository");

const tasksAreEqual = (task1, task2) => {
  return task1.title === task2.title;
};

async function addUser(username) {
  const newUser = new User({
    username,
    tasks: [],
  });
  return await newUser.save();
}

async function addTaskToUser(username, newTask) {
  let user = await User.findOne({ username });
  if (!user) user = await addUser(username);
  const _id = user["_id"];
  const taskExists = user.tasks.some((task) => tasksAreEqual(task, newTask));
  if (!taskExists) {
    await User.findByIdAndUpdate(_id, { $push: { tasks: newTask } });
  }
}

async function setTask(username, task) {
  await initDb();
  const newTask = new Task({ ...task });
  await addTaskToUser(username, newTask);
  await closeDb();
}

async function updateTask(username, taskTitle, status) {
  await initDb();
  let user = await User.findOne({ username });
  if (!user) user = await addUser(username);
  const taskIndex = user.tasks.findIndex((task) => task.title === taskTitle);
  if (taskIndex !== -1) {
    const task = user.tasks[taskIndex];
    const updates = {
      title: task.title,
      deadline: task.deadline,
      status: status,
    };
    const updatedTask = { ...user.tasks[taskIndex], ...updates };
    user.tasks[taskIndex] = updatedTask;
    await user.save();
  }
  await closeDb();
}

async function giveUpOnTask(username, taskTitle) {
  // call update task to update its status to forfeited
  updateTask(username, taskTitle, "forfeited");
}

async function completeTask(username, taskTitle) {
  // call update task to update its status to completed
  updateTask(username, taskTitle, "completed");
}

async function getTasks(username) {
  await initDb();
  let user = await User.findOne({ username });
  const tasks = user.tasks.map((task) => task.title);
  await closeDb();
  return tasks;
}

module.exports = {
  setTask,
  giveUpOnTask,
  completeTask,
  getTasks,
};
