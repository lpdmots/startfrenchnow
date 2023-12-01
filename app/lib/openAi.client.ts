import OpenAI from "openai";

const clientOpenai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default clientOpenai;
