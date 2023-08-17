import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import config from "config";
import { ogg } from "./ogg.js";
import { openai } from "./openai.js";
import { removeFile } from "./utils.js";

const INITIAL_SESSION = {
  messages: [],
};

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.use(session());

bot.command("new", async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply("Started new chat");
});
bot.command("start", async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply("Started new chat");
});

bot.on(message("text"), async (ctx) => {
  try {
    await ctx.reply("Working...");
    ctx.session ??= INITIAL_SESSION;

    ctx.session.messages.push({
      role: openai.roles.USER,
      content: ctx.message.text,
    });
    const response = await openai.chat(ctx.session.messages);
    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response,
    });

    await ctx.reply(response);
  } catch (error) {
    console.log("ERROR IN TEXT", error.message);
  }
});

bot.on(message("voice"), async (ctx) => {
  try {
    await ctx.reply("Working...");
    ctx.session ??= INITIAL_SESSION;
    const fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = ctx.message.from.id;
    const oggPath = await ogg.create(fileLink.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    const text = await openai.transcription(mp3Path);
    removeFile(mp3Path);
    ctx.session.messages.push({ role: openai.roles.USER, content: text });

    const response = await openai.chat(ctx.session.messages);
    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response,
    });

    await ctx.reply(response);
  } catch (error) {
    console.log("ERROR IN VOICE MESSAGE", error.message);
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

console.log("Started bot");
