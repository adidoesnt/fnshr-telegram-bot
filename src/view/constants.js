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

const deadlineCheckButtons = {
  keyboard: [["Yes", "No"]],
};

const commands = [
  { command: "start", description: "Start the bot" },
  { command: "menu", description: "Display the menu" },
];

function isValidTime(timeString) {
  const regex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!regex.test(timeString)) {
    return false;
  }

  const now = new Date();
  const [hours, minutes] = timeString.split(":").map(Number);
  const future = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );
  return future > now;
}

function getDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // add 1 because months are zero-indexed
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
}

module.exports = {
  startButtons,
  taskButtons,
  commands,
  isValidTime,
  getDate,
  deadlineCheckButtons,
};
