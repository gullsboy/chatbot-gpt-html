const API_KEY = "//api";
const model = "gpt-3.5-turbo";
const stop = [" Human:", " AI:"];
let chatHistory = "";

const outputContainer = document.querySelector("#output");

document.querySelector("#prompt").addEventListener("keydown", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.querySelector("#submit").click();
    document.querySelector("#prompt").value = "";
  }
});

document.querySelector("#submit").addEventListener("click", function() {
  const input = document.querySelector("#prompt").value.toLowerCase();
  if (input.trim() === "") {
    return;
  }

  chatHistory += "Human: " + input + "\n";

  let prompt = "Reponda como um chatbot: \n" + chatHistory;
  document.querySelector("#prompt").value = "";

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add("user-message");
  const messageText = document.createElement("p");
  messageText.innerText = input;
  messageDiv.appendChild(messageText);
  outputContainer.appendChild(messageDiv);

  const output = axios.post('https://api.openai.com/v1/engines/text-davinci-002/completions', {
      prompt,
      max_tokens: 450,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [" Human:", " AI:"]
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      let responseText = response.data.choices[0].text;

      const index = responseText.indexOf(':');
      if (index !== -1) {
        responseText = responseText.substring(index + 1).trim();
      }
      const messages = responseText.split(/\.\s+/).map(m => m.trim() + '');

      chatHistory += "AI: " + responseText + "\n";

      messages.forEach((msg, index) => {
        setTimeout(() => {
          const messageDiv = document.createElement("div");
          messageDiv.classList.add("message");
          messageDiv.classList.add("bot-message");
          const messageText = document.createElement("p");
          messageText.innerHTML = msg;
          messageDiv.appendChild(messageText);
          outputContainer.appendChild(messageDiv);
          outputContainer.scrollTo({ top: outputContainer.scrollHeight, behavior: 'smooth' });
        }, index * 2000);
      });
    })
.catch((error) => {
  console.error(error);

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add("bot-message");
  const messageText = document.createElement("p");

  if (axios.isAxiosError(error)) {
    messageText.innerText = `Erro ao fazer a requisição: ${error.message}`;
  } else if (error.response && error.response.status === 429) {
    const retryAfter = error.response.headers["retry-after"];
    messageText.innerText = `No momento estou exausto! Tente novamente em ${retryAfter} segundos. 😴`;
  } else {
    messageText.innerText =
      "Desculpe, ocorreu um erro inesperado. Por favor, tente novamente mais tarde.";
  }

  messageDiv.appendChild(messageText);
  outputContainer.appendChild(messageDiv);
  outputContainer.scrollTo({ top: outputContainer.scrollHeight, behavior: "smooth" });
});
});