import { createOpenAI } from '@ai-sdk/openai';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

const customOpenAI = createOpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'compatible'  // 对第三方API使用兼容模式
});

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: customOpenAI(apiIdentifier),
    middleware: customMiddleware,
  });
};
