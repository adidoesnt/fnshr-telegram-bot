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

const menuCommandHandler = (msg, username) => {
  bot.sendMessage(msg.chat.id, `@${username}, what would you like to to do?`, {
    reply_markup: {
      inline_keyboard: [[taskButtons[0]]],
      selective: true,
    },
  });
};

const exitQueryHandler = (query) => {
  const username = query.from.username;
  bot.sendMessage(query.message.chat.id, `See you later @${username}!`);
};

const setTaskHandler = (query) => {
  const username = query.from.username;
  const task = {};
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  let listenerId;

  const titleHandler = (msg) => {
    taskTitleCallback(msg, username, chatId, task, userId);
    bot.removeReplyListener(listenerId);
  };

  bot
    .sendMessage(chatId, `@${username}, what is the title for this task?`, {
      reply_markup: { force_reply: true, selective: true },
    })
    .then((sentMessage) => {
      listenerId = bot.onReplyToMessage(chatId, sentMessage.message_id, titleHandler);
    });
};

const taskTitleCallback = (msg, username, chatId, task, userId) => {
  if (msg.from.id == userId && msg.chat.id == chatId) {
    const title = msg.text;
    task.title = title;
    const reply = `Okay @${username}, I'll title this task "${title}".`;
    bot.sendMessage(chatId, reply).then(() => {
      taskDescriptionHandler(username, chatId, task, userId);
    });
  }
};

const taskDescriptionHandler = (username, chatId, task, userId) => {
  let listenerId;
  const descriptionHandler = (msg) => {
    taskDescriptionCallback(msg, username, chatId, task, userId);
    bot.removeReplyListener(listenerId);
  };
  bot
    .sendMessage(
      chatId,
      `@${username}, what is the description for this task?`,
      {
        reply_markup: { force_reply: true, selective: true },
      }
    )
    .then((sentMessage) => {
      listenerId = bot.onReplyToMessage(chatId, sentMessage.message_id, descriptionHandler);
    });
};

const taskDescriptionCallback = (msg, username, chatId, task, userId) => {
  if (msg.from.id == userId && msg.chat.id == chatId) {
    const description = msg.text;
    task.description = description;
    const reply = `Okay @${username}, I'll set the description for this task to "${description}".`;
    bot.sendMessage(chatId, reply).then(() => {
      taskDeadlineHandler(username, chatId, task, userId);
    });
  }
};

const taskDeadlineHandler = (username, chatId, task, userId) => {
  let listenerId;
  const deadlineHandler = (msg) => {
    taskDeadlineCallack(msg, username, chatId, task, userId);
    bot.removeReplyListener(listenerId);
  };
  bot
    .sendMessage(
      chatId,
      `@${username}, what is the deadline for this task? This should be 24-hour time, for example "13:00".`,
      {
        reply_markup: { force_reply: true, selective: true },
      }
    )
    .then((sentMessage) => {
      listenerId = bot.onReplyToMessage(chatId, sentMessage.message_id, deadlineHandler);
    });
};

const taskDeadlineCallack = (msg, username, chatId, task, userId) => {
  if (msg.from.id == userId && msg.chat.id == chatId) {
    const deadline = msg.text;
    if (!isValidTime(deadline)) {
      bot
        .sendMessage(
          chatId,
          `Sorry @${username}, that's an invalid time. Please try again.`
        )
        .then(() => {
          taskDeadlineHandler(username, chatId, task, userId);
        });
    } else {
      task.date = getDate();
      task.deadline = deadline;
      task.status = "ongoing";
      const reply = `Alright @${username}, I'll set the deadline for this task to ${deadline} today.`;
      bot.sendMessage(chatId, reply).then(() => {
        setTask(username, task);
        const now = new Date();
        const [hours, minutes] = deadline.split(":");
        const future = new Date();
        future.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const diff = future - now.getTime();
        setTimeout(() => {
          deadlineCheckHandler(username, chatId, task, userId);
        }, diff);
      });
    }
  }
};

const deadlineCheckHandler = (username, chatId, task, userId) => {
  const title = task.title;
  bot
    .sendMessage(
      chatId,
      `@${username}, did you complete your task "${title}"?`,
      {
        reply_markup: deadlineCheckButtons,
      }
    )
    .then((sentMessage) => {
      const listenerId = bot.onReplyToMessage(chatId, sentMessage.message_id, (msg) => {
        deadlineCheckCallback(msg, username, chatId, task, userId);
        bot.removeReplyListener(listenerId);
      });
    });
};

const deadlineCheckCallback = (msg, username, chatId, task, userId) => {
  if (msg.from.id == userId && msg.chat.id == chatId) {
    const response = msg.text.toLowerCase();
    switch (response) {
      case "yes":
        bot.sendMessage(
          chatId,
          `Amazing @${username}, I'll mark the task complete!`
        );
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
            `Sorry @${username}, that's an invalid response. Please try again.`
          )
          .then(() => {
            deadlineCheckHandler(username, chatId, task);
          });
        break;
    }
  }
};

const invalidOptionHandler = (query) => {
  const username = query.from.username;
  bot.sendMessage(
    query.message.chat.id,
    `Sorry @${username}, that's an invalid option.`
  );
};

bot.setMyCommands(commands);

bot.onText(/\/start/, (msg) => {
  const username = msg.from.username;
  bot.sendMessage(
    msg.chat.id,
    `Hi @${username}, welcome to Fnshr! I'm Finn, how can I help?`,
    {
      reply_markup: {
        inline_keyboard: [[startButtons[0]], [startButtons[1]]],
        selective: true,
      },
    }
  );
});

bot.onText(/\/menu/, (msg) => {
  const username = msg.from.username;
  menuCommandHandler(msg, username);
});

bot.on("callback_query", (query) => {
  switch (query.data) {
    case "show_menu":
      menuCommandHandler(query.message, query.from.username);
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
