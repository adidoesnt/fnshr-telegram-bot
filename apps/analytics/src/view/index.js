const { init, getTasks, cleanup } = require("../controller/contoller");

function computeCompletionRate(tasks, completedTasks) {
    const numComplete = completedTasks.length;
    const total = tasks.length;
    return numComplete/total;
}

init();
const { tasks, completedTasks } = getTasks();
const completionRate = computeCompletionRate(tasks, completedTasks);
console.log(completionRate);
cleanup();
