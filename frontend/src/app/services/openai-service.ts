import OpenAI from "openai";

export const openaiClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export const sendPromptToGpt = async (prompt: string) => {
  const openai = openaiClient();

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const gptResponseMessage = completion.choices[0].message.content;
  return gptResponseMessage;
};
