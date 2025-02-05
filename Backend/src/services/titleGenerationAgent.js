import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Define the output schema using Zod without .length()
// Removing .length(10) and .length(6) to avoid minItems constraints
const TitleSchema = z.string();
const CategorySchema = z.object({
    name: z.string(),
    titles: z.array(TitleSchema)
});
const ResponseSchema = z.object({
    categories: z.array(CategorySchema)
});

export async function generateTitlesWithAgent(userInfo) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key is not configured');
        }

        // Validate user info with detailed error message
        if (!userInfo) {
            throw new Error('User information object is missing');
        }

        const { niche, linkedinAudience, narative } = userInfo;
        
        if (!niche || !linkedinAudience || !narative) {
            throw new Error(`Missing required user information: ${[
                !niche && 'niche',
                !linkedinAudience && 'linkedinAudience',
                !narative && 'narative'
            ].filter(Boolean).join(', ')}`);
        }

        const model = new ChatOpenAI({
            modelName: "gpt-4", // Fixed typo in model name from "gpt-4o"
            openAIApiKey: apiKey,
            temperature: 0.7
        }).withStructuredOutput(ResponseSchema);

        const systemPrompt = `You are a LinkedIn post title generator. Generate engaging titles based on:
            Niche: ${userInfo.niche}
            Audience: ${userInfo.linkedinAudience}
            Narrative: ${userInfo.narative}

            Requirements:
            - Generate exactly 6 categories
            - Each category must have exactly 10 titles
            - Titles should be concise (5-10 words)`;

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", systemPrompt],
            ["human", "Generate the structured response now."],
        ]);

        const chain = prompt.pipe(model);
        const response = await chain.invoke({});
        return response;
    } catch (error) {
        console.error('Title generation detailed error:', {
            message: error.message,
            userInfo: userInfo ? {
                hasNiche: Boolean(userInfo.niche),
                hasAudience: Boolean(userInfo.linkedinAudience),
                hasNarative: Boolean(userInfo.narative)
            } : 'No userInfo provided'
        });
        throw error;
    }
}
