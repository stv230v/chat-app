// app/api/response/route.ts

import { NextResponse } from "next/server";
import { openaiClient, sendPromptToGpt } from "@/app/services/openai-service";

export async function POST(request: Request) {
  const openai = openaiClient();

  const { prompt } = await request.json();

  const gptResponseMessage = await sendPromptToGpt(prompt);
  const response = NextResponse.json({ gptResponseMessage });
  return response;
}
