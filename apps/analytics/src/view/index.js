require("dotenv").config();
const { init, getTasks, getTasksByDate, cleanup } = require("../controller/contoller");

async function computeCompletionRate() {
    console.info("computing overall task completion rate...")
    await init();
    const { tasks, completedTasks } = await getTasks();
    const numComplete = completedTasks.length;
    const total = tasks.length;
    const rate = numComplete/total;
    return { numComplete, total, rate };
}

async function getDateMaps() {
    const { dateMap, completedDateMap } = await getTasksByDate();
    await cleanup();
    return { dateMap, completedDateMap };
}

function computeCompletionRateByDate(dateMap, completedDateMap) {
    console.info("computing task completion rate by date...")
    const sortedDateMap = new Map([...dateMap.entries()].sort());
    const sortedCompletedDateMap = new Map([...completedDateMap.entries()].sort());
    const data = [];
    sortedDateMap.forEach((value, key) => {
        const date = key;
        const numComplete = sortedCompletedDateMap.get(key);
        const total = value;
        const rate = numComplete/total;
        data.push({date, numComplete, total, rate});
    });
    return data;
}

computeCompletionRate().then((data) => {
    const { numComplete, total, rate } = data;
    console.log(`OVERALL TASK INFO - completed tasks: ${numComplete}, total tasks: ${total}, completion rate: ${rate}\n`);
})

getDateMaps().then(maps => {
    const {dateMap, completedDateMap} = maps;
    const completionRates = computeCompletionRateByDate(dateMap, completedDateMap);
    for(let completionRate of completionRates) {
        const {date, numComplete, total, rate} = completionRate;
        console.log(`TASK INFO FOR ${date} - completed tasks: ${numComplete}, total tasks: ${total}, completion rate: ${rate}`);
    }
})
