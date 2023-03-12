# Fnshr Telegram Bot
This is the repository for Fnshr's Telegram bot MVP.
This document contains setup instructions to run the bot locally.

## Cloning the Repository
Navigate the to the folder you want to clone the repository into via your terminal. For example:
```
adityabanerjee@Adityas-MacBook-Air-2 ~ % cd Desktop/Repositories
```
Then, run the following command:
```
git clone https://github.com/adidoesnt/fnshr-telegram-bot.git
```

## Running the Bot
Once the repository has been cloned, run the following to install dependencies:
```
git pull origin main
yarn
```

To run the bot, use the following command:
```
yarn start
```

You can also use:
```
yarn dev
```
However, I do not recommend this as the hot reload may cause you to hit Telegram's request limit.

## Additional Information
The bot's telegram handle is ```@fnshr_bot```.
