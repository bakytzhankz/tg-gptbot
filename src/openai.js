import OpenAI from "openai";
import config from "config";
import { createReadStream } from "fs";
class OpenAi {
  roles = {
    ASSISTANT: "assistant",
    USER: "user",
    SYSTEM: "system",
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.get("OPENAI_KEY"),
    });
  }
  async chat(messages) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.log("ERROR WHILE CHAT", error.message);
    }
  }
  async transcription(filepath) {
    try {
      const response = await this.openai.audio.transcriptions.create({
        model: "whisper-1",
        file: createReadStream(filepath),
      });
      return response.text;
    } catch (error) {
      console.log(error);
      console.log("ERROR WHILE TRANSCRIPTION", error.message);
    }
  }
}

export const openai = new OpenAi();
