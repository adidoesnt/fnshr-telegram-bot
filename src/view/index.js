require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { startButtons, taskButtons, commands } = require("./constants");
const {
  setTask,
  giveUpOnTask,
  completeTask,
  getTasks,
} = require("../controller/controller");

const TOKEN = process.env.API_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

const menuCommandHandler = (msg) => {
  bot.sendMessage(msg.chat.id, "What would you like to to do?", {
    reply_markup: {
      inline_keyboard: [[taskButtons[0]], [taskButtons[1]], [taskButtons[2]]],
    },
  });
};

const exitQueryHandler = (query) => {
  bot.sendMessage(query.message.chat.id, "See you later!");
};

const setTaskHandler = (query) => {
  const username = query.from.username;
  // set task
};

async function giveUpHandler(query) {
  const username = query.from.username;
  const tasks = await getTasks(username);
  const buttons = tasks.map((task) => {
    return { text: task, callback_data: `forfeit_task:${task}` };
  });
  bot.sendMessage(
    query.message.chat.id,
    "Which task would you like to mark forfeir?",
    {
      reply_markup: {
        inline_keyboard: buttons.map((button) => [button]),
      },
    }
  );
};

async function completeHandler(query) {
  const username = query.from.username;
  const tasks = await getTasks(username);
  const buttons = tasks.map((task) => {
    return { text: task, callback_data: `complete_task:${task}` };
  });
  bot.sendMessage(
    query.message.chat.id,
    "Which task would you like to mark complete?",
    {
      reply_markup: {
        inline_keyboard: buttons.map((button) => [button]),
      },
    }
  );
}

const invalidOptionHandler = (query) => {
  bot.sendMessage(query.message.chat.id, "Invalid option.");
};

bot.setMyCommands(commands);

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome to Fnshr! I'm Finn, how can I help?", {
    reply_markup: {
      inline_keyboard: [[startButtons[0]], [startButtons[1]]],
    },
  });
});

bot.onText(/\/menu/, (msg) => {
  menuCommandHandler(msg);
});

bot.on("callback_query", (query) => {
  if (query.data.startsWith("complete_task:")) {
    const username = query.from.username;
    const taskTitle = query.data.replace("complete_task:", "");
    completeTask(username, taskTitle);
  } else if (query.data.startsWith("forfeit_task:")) {
    const username = query.from.username;
    const taskTitle = query.data.replace("forfeit_task:", "");
    giveUpOnTask(username, taskTitle);
  } else {
    switch (query.data) {
      case "show_menu":
        menuCommandHandler(query.message);
        break;
      case "see_you":
        exitQueryHandler(query);
        break;
      case "set_task":
        setTaskHandler(query);
        break;
      case "give_up":
        giveUpHandler(query);
        break;
      case "mark_task_complete":
        completeHandler(query);
        break;
      default:
        invalidOptionHandler(query);
        break;
    }
  }
});
