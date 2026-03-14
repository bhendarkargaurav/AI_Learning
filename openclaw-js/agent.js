import dotenv from 'dotenv';
dotenv.config();

import { exec, execSync } from 'node:child_process';
import { zodTextFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import { z } from 'zod';


import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



//Tools(body)
// function executeCommand(cmd = '') {
//     const result = execSync(cmd);
//     return result.toString();
// }
function executeCommand(cmd = '') {
    try {
        // 🔹 Windows Fixes
        if (process.platform === 'win32') {

            // touch -> create file
            if (cmd.startsWith('touch ')) {
                const fileName = cmd.split(' ')[1];
                execSync(`type nul > "${fileName}"`);
                return `File ${fileName} created`;
            }

            // mkdir works in Windows, so no change needed

            // ls -> dir
            if (cmd.trim() === 'ls') {
                cmd = 'dir';
            }
        }

        const result = execSync(cmd, { stdio: 'pipe' });
        return result.toString();

    } catch (error) {
        return `Command failed: ${error.message}`;
    }
}

const functionMapping = {
    executeCommand,
}


const SYSTEM_PROMPT = `You are an AI Assistent that is expert in controlling the user's machine
Analyese the user's query carefully and plan the steps on what need to be done.
based on the user's query you can create command and the call the tool to run that command and execute on to the user's machine

Available Tools:
- executeCommand(command: String): Output from the command

You can use executeCommand Tool to execute any command on user's machine

`;


const outputSchema = z.object({
    type: z.enum(['tool_call', 'text']).describe('what kind of response this is'),
    finalOutput: z.boolean().describe('if this is the last message of chat'),
    text_content: z
        .string()
        .optional()
        .nullable()
        .describe('text content if type is text'),
    tool_call: z.object({
        tool_name: z.string().describe('name of the tool'),
        params: z.array(z.string()),
    })
    .optional()
    .nullable()
    .describe('the params to call the tool if the type is tool call')
});


const messages = [
    {
        role: 'system',
        content: SYSTEM_PROMPT,
    }
]

//whatever user send the input
export async function run(query = '') {
    messages.push({ role: 'user', content: query,})
    while(true) {
        const result = await client.responses.parse({
            model: 'gpt-4.1',
            text: {
                format: zodTextFormat(outputSchema, 'output'),
            },
            input: messages,
        });
        const parsedOutput = result.output_parsed
        messages.push({role: 'assistant', content: result.output_text})

        
    switch(parsedOutput.type) {
        case 'tool_call': 
        {
            if(parsedOutput.tool_call) {
                const {params, tool_name} = parsedOutput.tool_call;
            console.log(`Tool Call, ${tool_name}: ${params}`);
            if(functionMapping[tool_name]) {
                const toolOutput = functionMapping[tool_name](...params) 
                    console.log(`Tool Output(${tool_name})`, toolOutput);
                    messages.push({role: 'developer', content: JSON.stringify({
                        tool_name,
                        params,
                        tool_output: toolOutput,
                    }),
                }) 
                continue;
            }
        }
        }
        break;
        case 'text': 
        {
            console.log('Text', parsedOutput.text_content)
         break;
        }
        
    }
    if(parsedOutput.finalOutput) {
        return messages;
    }
}
}

//run('make a new folder named test');
// console.log(executeCommand('dir'));