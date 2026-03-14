import OpenAI from "openai";
import readlineSync from "readline-sync"
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});



// const client = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// })

//Tools

function getWeatherDetails(city = '') {
    if(city.toLowerCase() === 'patiala') return '10°c';
    if(city.toLowerCase() === 'mohali') return '14°c';
    if(city.toLowerCase() === 'banglore') return '20°c';
    if(city.toLowerCase() === 'chandighar') return '8°c';
    if(city.toLowerCase() === 'delhi') return '12°c';
}

const tools = {
    "getWeatherDetails": getWeatherDetails 
}


const SYSTEM_PROMPT = `
You are an AI Assistent with START, PLAN, ACTION, OBSERVATION and OUTPUT Starte.
wait for the user prompt and firstPLAN using available tools.
After Planning, take the action with appropriate tool and wait for observation based on Action.
once you get the observation, Return the AI response based on START prompt and observation

Strictly follow the JSON output format as in example

Available Tools:
- Function getWeatherDetails(city: String): string
getWeatherDetails is a function that accepts city name as string and return the weatehr details.


Example:
START
{ "type": "user", "user": "What is the sum of weather of patiala and Mohali?"}
{ "type": "plan", "plan": "i will call the getweatherDetails for patiala"}
{ "type": "action, "function": "getweatherDetails", "input:" "patiala"}
{ "type": "observation, "observation": "10°c"}
{ "type": "plan", "plan": "i will call getweatherDetails for Mohali"}
{ "type": "action, "function": "getweatherDetails", "input:"Mohali"}
{ "type": "observation, "observation": "14°c"}
{ "type": "output, "output": "The sum of weather of patiala and mohali 24°c"}
`

const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

while(true) {
    const query = readlineSync.question('>> ');
   const q = {
    type: 'user',
    user: query,
};
    messages.push({ role: 'user', content: JSON.stringify(q) });

    while(true) {
        const chat = await client.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            response_format: {type: 'json_object'},
        })

      

        const result = chat.choices[0].message.content;
        messages.push({role: 'assistant', content: result });

          console.log(`\n\n-------------------Start AI----------------`);
        console.log(result);
        console.log(`-------------------End AI----------------\n\n`)

        const call = JSON.parse(result);

        if(call.type == 'output') {
            console.log(`${call.output}`);
            break;
        }
        else if(call.type == 'action') {
            const fn = tools[call.function] 
            const observation = fn(call.input);
            const obs = {"type": "observation", "observation": observation}
    messages.push({role: "developer", content: JSON.stringify(obs)});            
        }
    }
}



