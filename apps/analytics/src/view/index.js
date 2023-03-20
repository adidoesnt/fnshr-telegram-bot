require("dotenv").config();
const { init, getTasks, getTasksByDate, cleanup } = require("../controller/contoller");

async function computeCompletionRate() {
    console.info("computing overall task completion rate...")
    await init();
    const { tasks, completedTasks } = await getTasks();
    const numComplete = completedTasks.length;
    const total = tasks.length;
    return numComplete/total;
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
    const rates = [];
    sortedDateMap.forEach((value, key) => {
        const date = key;
        const numComplete = sortedCompletedDateMap.get(key);
        const total = value;
        const rate = numComplete/total;
        rates.push({date, rate});
    });
    return rates;
}

computeCompletionRate().then((completionRate) => {
    console.log(`overall task completion rate: ${completionRate}\n`);
})

getDateMaps().then(maps => {
    const {dateMap, completedDateMap} = maps;
    const completionRates = computeCompletionRateByDate(dateMap, completedDateMap);
    for(let completionRate of completionRates) {
        const { date, rate } = completionRate;
        console.log(`completion rate for ${date}: ${rate}`);
    }
})
