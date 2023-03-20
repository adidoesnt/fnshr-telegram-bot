const { User } = require("../model/schemas");
const { initDb, closeDb } = require("../model/repository");

async function init() {
    await initDb();
}

async function getUsers() {
    const users = await User.find({});
    return users;
}

async function getTasks() {
    const users = await getUsers();
    const tasks = users.flatMap(user => user.tasks);
    const completedTasks = tasks.filter(task => task.status == "completed");
    return {
        tasks,
        completedTasks
    }
}

async function cleanup() {
    await closeDb();
}

module.exports = {
    init,
    getAllTasks,
    closeDb
}
