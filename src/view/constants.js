const startButtons = [
  {
    text: "Show Menu",
    callback_data: "show_menu",
  },
  {
    text: "All Good",
    callback_data: "see_you",
  },
];

const taskButtons = [
  {
    text: "Set Task",
    callback_data: "set_task",
  },
  {
    text: "Mark Task Complete",
    callback_data: "mark_task_complete",
  },
  {
    text: "Give Up On Task",
    callback_data: "give_up",
  },
];

const commands = [
  { command: "start", description: "Start the bot" },
  { command: "menu", description: "Display the menu" },
];

module.exports = {
    startButtons,
    taskButtons,
    commands
}
