require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const {
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

const setTaskHandler = (message) => {
  const username = message.from.username;
  const task = {};
  const chatId = message.chat.id;
  const userId = message.from.id;
  let listenerId;

  const taskHandler = (msg) => {
    taskCallback(msg, username, chatId, task, userId);
    bot.removeReplyListener(listenerId);
  };

  bot
    .sendMessage(
      chatId,
      `@${username}, send me your task in this format: <title>/<deadline>. The deadline should be 24-hour time later today. For example, if it is 13:00 now, you can input any time from 13:01 to 23:59.`,
      {
        reply_markup: { force_reply: true, selective: true },
      }
    )
    .then((sentMessage) => {
      const messageId = sentMessage.message_id;
      listenerId = bot.onReplyToMessage(chatId, messageId, taskHandler);
    });

  const taskCallback = (msg, username, chatId, task, userId) => {
    if (msg.from.id == userId && msg.chat.id == chatId) {
      const params = msg.text.split("/");
      if (params?.length != 2) {
        const reply = `Sorry @${username}, your task is in an invalid format!`;
        bot.sendMessage(chatId, reply).then(() => {
          setTaskHandler(message);
        });
      } else {
        const title = params[0];
        const time = params[1];
        if (!isValidTime(time)) {
          bot
            .sendMessage(chatId, `Sorry @${username}, that's an invalid time!`)
            .then(() => {
              setTaskHandler(message);
            });
        } else {
          task.title = title;
          task.date = getDate();
          task.deadline = time;
          task.status = "ongoing";
          const reply = `Alright @${username}, I'll set the deadline for "${title}" to ${time} today.`;
          bot.sendMessage(chatId, reply).then(() => {
            setTask(username, task);
            const now = new Date();
            const [hours, minutes] = time.split(":");
            const future = new Date();
            future.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            const diff = future - now.getTime();
            setTimeout(() => {
              deadlineCheckHandler(username, chatId, task, userId);
            }, diff);
          });
        }
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
        const listenerId = bot.onReplyToMessage(
          chatId,
          sentMessage.message_id,
          (msg) => {
            deadlineCheckCallback(msg, username, chatId, task, userId, listenerId);
          }
        );
      });
  };

  const deadlineCheckCallback = (msg, username, chatId, task, userId, listenerId) => {
    if (msg.from.id == userId && msg.chat.id == chatId) {
      const response = msg.text.toLowerCase();
      switch (response) {
        case "yes":
          bot.sendMessage(
            chatId,
            `Amazing @${username}, I'll mark the task complete!`
          );
          completeTask(username, task.title);
          bot.removeReplyListener(listenerId);
          break;
        case "no":
          bot.sendMessage(
            chatId,
            `Uh oh, @${username} has been caught lacking!`
          );
          giveUpOnTask(username, task.title);
          bot.removeReplyListener(listenerId);
          break;
        default:
          bot
            .sendMessage(
              chatId,
              `Sorry @${username}, that's an invalid response. Please try again.`
            )
            .then(() => {
              deadlineCheckHandler(username, chatId, task, userId);
            });
          break;
      }
    }
  };
};

bot.setMyCommands(commands);

bot.onText(/\/start/, (msg) => {
  const username = msg.from.username;
  bot.sendMessage(
    msg.chat.id,
    `Hi @${username}! Use /set to set a task, and use /help if you need further assistance.`
  );
});

bot.onText(/\/help/, (msg) => {
  const username = msg.from.username;
  bot.sendMessage(
    msg.chat.id,
    `Hi @${username}! Use /set to set a task. When setting a task, the format of your message should be <title>/<deadline>. ` +
      `The format for the deadline should be HH:mm, and the time should be a 24 hour time later today. ` +
      `For example, if it is 13:00 now, you can input any time from 13:01 to 23:59. ` +
      `Please ensure your task title does not contain "/".`
  );
});

bot.onText(/\/set/, (msg) => {
  setTaskHandler(msg);
});
