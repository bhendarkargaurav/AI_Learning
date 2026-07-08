# building the agent manually instead of hiding everything behind frameworks like LangChain
Every AI Agent has 5 Parts

User

↓

LLM

↓

Planning

↓

Action (Tool)

↓

Observation



const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
creates the connection to OpenAI.

- const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    is the agent's memory.

## Multi-Step Reasoning
PLAN

↓

Get Bangalore

↓

Observation

↓

PLAN

↓

Get Delhi

↓

Observation

↓

Compare

↓

Output


# Assistant Role

These are the model's previous responses.

# System Role

This is like giving instructions to a new employee before they start working.

Example:

You are an expert backend engineer.

Always answer in JSON.

Never reveal secrets.


# User Role

Anything the human asks.

Example:

{
role:"user",
content:"What's the weather?"
}