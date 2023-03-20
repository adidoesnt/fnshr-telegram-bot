const { User } = require("../model/schemas");
const { initDb, closeDb } = require("../model/repository");

async function init() {
    await initDb();
}

async function getUsers() {
    const users = await User.find();
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

async function getTasksByDate() {
    const { tasks, completedTasks } = await getTasks();
    const dateMap = new Map();
    const completedDateMap = new Map;
    for(let task of tasks) {
        const date = task.date;
        let dateTasks = dateMap.get(date);
        if(!dateTasks) {
            dateMap.set(date, 1)
        } else {
            let val = dateMap.get(date);
            val++
            dateMap.set(date, val);
        }
    }

    for(let task of completedTasks) {
        const date = task.date;
        let dateTasks = completedDateMap.get(date);
        if(!dateTasks) {
            completedDateMap.set(date, 1)
        } else {
            let val = completedDateMap.get(date);
            val++
            completedDateMap.set(date, val);
        }
    }

    return {
        dateMap,
        completedDateMap
    }
}

async function cleanup() {
    await closeDb();
}

module.exports = {
    init,
    getTasks,
    getTasksByDate,
    closeDb,
    cleanup
}
