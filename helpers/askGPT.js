const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: "org-4pZyMecDsAioe5GBBpOeSskR",
});
const openai = new OpenAIApi(configuration);
let messages = [];
async function askGPT(prompt, systemContent, didChangeLanguage) {
  if (didChangeLanguage) messages = [];
  const newMessage = { role: "user", content: prompt }
  messages.push(newMessage);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    max_tokens: 200,
    messages: [
      { role: "system", content: systemContent }, ...messages
    ]
  })
  const newAssistantMessage = { role: "assistant", content: completion.data.choices[0].message.content }
  messages.push(newAssistantMessage);
  console.log(messages);
  return completion.data.choices[0].message.content
  /* const completion = await openai.createCompletion({
     model: "text-davinci-003",
     temperature: 0.2,
     max_tokens: 50,
     prompt,
     // Or any number that suits your needs
   })
   return completion.data.choices[0].text*/
}

module.exports = askGPT
