const deadlineCheckButtons = {
  keyboard: [["Yes", "No"]],
  one_time_keyboard: true,
  force_reply: true,
  selective: true
};

const commands = [
  { command: "start", description: "Start the bot" },
  { command: "set", description: "Set a task" },
  { command: "finn", description: "Ask Finn to do a simple task for you! (beta)"},
  { command: "help", description: "Need some help?"}
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
  commands,
  isValidTime,
  getDate,
  deadlineCheckButtons,
};
