require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const {
  startButtons,
  taskButtons,
  commands,
  isValidTime,
  getDate,
  deadlineCheckButtons,
} = require("./constants");
const {
  setTask,
  giveUpOnTask,
  completeTask,
} = require("../controller/controller");

const TOKEN = process.env.API_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

const menuCommandHandler = (msg) => {
  bot.sendMessage(msg.chat.id, "What would you like to to do?", {
    reply_markup: {
      inline_keyboard: [[taskButtons[0]]],
    },
  });
};

const exitQueryHandler = (query) => {
  bot.sendMessage(query.message.chat.id, "See you later!");
};

const setTaskHandler = (query) => {
  const username = query.from.username;
  const task = {};
  const chatId = query.message.chat.id;
  const titleHandler = (msg) => {
    taskTitleCallback(msg, username, chatId, task);
    bot.removeListener("message", titleHandler);
  };
  bot.sendMessage(chatId, "What is the title for this task?").then(() => {
    bot.on("message", titleHandler);
  });
};

const taskTitleCallback = (msg, username, chatId, task) => {
  const title = msg.text;
  task.title = title;
  const reply = `Okay, I'll title this task "${title}".`;
  bot.sendMessage(chatId, reply).then(() => {
    taskDescriptionHandler(username, chatId, task);
  });
};

const taskDescriptionHandler = (username, chatId, task) => {
  const descriptionHandler = (msg) => {
    taskDescriptionCallback(msg, username, chatId, task);
    bot.removeListener("message", descriptionHandler);
  };
  bot.sendMessage(chatId, "What is the description for this task?").then(() => {
    bot.on("message", descriptionHandler);
  });
};

const taskDescriptionCallback = (msg, username, chatId, task) => {
  const description = msg.text;
  task.description = description;
  const reply = `Okay, I'll set the description for this task to "${description}".`;
  bot.sendMessage(chatId, reply).then(() => {
    bot.removeListener("message", (msg) => taskDescriptionCallback);
    taskDeadlineHandler(username, chatId, task);
  });
};

const taskDeadlineHandler = (username, chatId, task) => {
  const deadlineHandler = (msg) => {
    taskDeadlineCallack(msg, username, chatId, task);
    bot.removeListener("message", deadlineHandler);
  };
  bot.removeListener("message", deadlineHandler);
  bot
    .sendMessage(
      chatId,
      'What is the deadline for this task? This should be 24-hour time, for example "13:00".'
    )
    .then(() => {
      bot.on("message", deadlineHandler);
    });
};

const taskDeadlineCallack = (msg, username, chatId, task) => {
  const deadline = msg.text;
  if (!isValidTime(deadline)) {
    bot
      .sendMessage(chatId, "Sorry, that's an invalid time. Please try again.")
      .then(() => {
        taskDeadlineHandler(username, chatId, task);
      });
  } else {
    task.date = getDate();
    task.deadline = deadline;
    task.status = "ongoing";
    const reply = `Alright, I'll set the deadline for this task to ${deadline} today.`;
    bot.sendMessage(chatId, reply).then(() => {
      setTask(username, task);
      const now = new Date();
      const [hours, minutes] = deadline.split(":");
      const future = new Date();
      future.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const diff = future - now.getTime();
      setTimeout(() => {
        deadlineCheckHandler(username, chatId, task);
      }, diff);
    });
  }
};

const deadlineCheckHandler = (username, chatId, task) => {
  const title = task.title;
  const deadlineCheckHelper = (msg) => {
    deadlineCheckCallback(msg, username, chatId, task);
    bot.removeListener("message", deadlineCheckHelper);
  };
  bot.removeListener("message", deadlineCheckHelper);
  bot
    .sendMessage(chatId, `Did you complete your task "${title}"?`, {
      reply_markup: deadlineCheckButtons,
    })
    .then(() => {
      bot.on("message", deadlineCheckHelper);
    });
};

const deadlineCheckCallback = (msg, username, chatId, task) => {
  const response = msg.text.toLowerCase();
  switch (response) {
    case "yes":
      bot.sendMessage(chatId, "Amazing, I'll mark the task complete!");
      completeTask(username, task.title);
      break;
    case "no":
      bot.sendMessage(chatId, `Uh oh, @${username} has been caught lacking!`);
      giveUpOnTask(username, task.title);
      break;
    default:
      bot
        .sendMessage(
          chatId,
          "Sorry, that's an invalid response. Please try again."
        )
        .then(() => {
          deadlineCheckHandler(username, chatId, task);
        });
      break;
  }
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
    default:
      invalidOptionHandler(query);
      break;
  }
});
