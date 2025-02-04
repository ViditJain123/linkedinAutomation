import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool } from "@langchain/core/tools";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { RunnableSequence } from "@langchain/core/runnables";
import { AgentExecutor } from "langchain/agents";
import { formatToOpenAIFunctionMessages } from "langchain/agents/format_scratchpad";
import { OpenAIFunctionsAgentOutputParser } from "langchain/agents/openai/output_parser";
const dotenv = require('dotenv');
dotenv.config();

export async function generatePostWithAgent(userPrompt, userInfo) {
    const model = new ChatOpenAI({
        model: "gpt-4o",
    });

    const systemPrompt = `You are a powerful LinkedIn post writer. Here's how you should approach each post:

1. Understanding the Topic:
- First, grasp the main idea and purpose of the post
- Identify the category (Personal Story, Recent Event, General Story, Industry-Specific)
- Research when needed for recent events or additional context
- Ensure clarity on the key message

2. Writing Guidelines:
- Keep tone informal and conversational
- Use simple, relatable language
- Provide meaningful insights
- Use repetitive line beginnings for rhythm
- End with questions or memorable points
- Write in pointers for readability
- Use clear, concise sentences
- Format in markdown for LinkedIn

Target Audience: ${userInfo.linkedinAudience}
Content Genre: ${userInfo.narative}
Style Reference (Previous Posts):
${userInfo.postExamples.map((example, index) => `Example ${index + 1}: ${example}`).join('\n')}`;

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        ["human", "{input}"],
        new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const tools = [];

    const modelWithFunctions = model.bind({
        functions: tools.map((tool) => convertToOpenAIFunction(tool)),
    });

    const runnableAgent = RunnableSequence.from([
        {
            input: (i) => i.input,
            agent_scratchpad: (i) => formatToOpenAIFunctionMessages(i.steps),
        },
        prompt,
        modelWithFunctions,
        new OpenAIFunctionsAgentOutputParser(),
    ]);

    const executor = AgentExecutor.fromAgentAndTools({
        agent: runnableAgent,
        tools,
    });

    const result = await executor.invoke({
        input: userPrompt,
    });

    return result;
}