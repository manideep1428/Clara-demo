import OpenAI from 'openai';

export const client = new OpenAI({
  baseURL: 'https://ai.megallm.io/v1',
  apiKey: process.env.MEGALLM_API_KEY
});

