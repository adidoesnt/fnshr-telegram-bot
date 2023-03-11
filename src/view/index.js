require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { startButtons, taskButtons, commands } = require("./constants");

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
  bot.sendMessage(query.message.chat.id, "Setting task.");
};

const giveUpHandler = (query) => {
  bot.sendMessage(query.message.chat.id, "Giving up on task.");
};

const completeHander = (query) => {
  bot.sendMessage(query.message.chat.id, "Marking task complete.");
};

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
      completeHander(query);
      break;
    default:
      invalidOptionHandler(query);
      break;
  }
});
