/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message as a bot message in the chat window
const initialMessage = "👋 Hello! How can I help you today?";
chatWindow.textContent = ""; // Clear any previous content
chatWindow.innerHTML += `<div class="bot-message"><strong>Bot:</strong> ${initialMessage}</div>`;

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message
  const message = userInput.value;

  // Show user's message in the chat window
  chatWindow.innerHTML += `<div class="user-message"><strong>You:</strong> ${message}</div>`;

  // Clear the input box
  userInput.value = "";

  // Show a loading message
  chatWindow.innerHTML += `<div class="bot-message">Thinking...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Prepare the API request
  if (typeof OPENAI_API_KEY === "undefined" || !OPENAI_API_KEY) {
    // Remove the loading message and show an error
    const botMessages = document.querySelectorAll(".bot-message");
    if (botMessages.length > 0) {
      botMessages[botMessages.length - 1].remove();
    }
    chatWindow.innerHTML += `<div class="bot-message error">Error: No OpenAI API key found. Please add your API key to <code>secrets.js</code>.</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return;
  }
  const apiKey = OPENAI_API_KEY;
  const endpoint = "https://api.openai.com/v1/chat/completions";

  // Create the request body for the Chat Completions API
  const requestBody = {
    model: "gpt-4o", // Use the gpt-4o model
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant for L'Oréal product advice.",
      },
      { role: "user", content: message },
    ],
  };

  try {
    // Send the request to OpenAI's API
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    // Parse the response as JSON
    const data = await response.json();

    // Get the assistant's reply
    let reply = "Sorry, I couldn't get a response.";
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      reply = data.choices[0].message.content;
    }

    // Remove the loading message and show the assistant's reply
    const botMessages = document.querySelectorAll(".bot-message");
    if (botMessages.length > 0) {
      botMessages[botMessages.length - 1].remove();
    }
    chatWindow.innerHTML += `<div class="bot-message"><strong>Bot:</strong> ${reply}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
    // Log only the assistant's text response to the console
    console.log(reply);
  } catch (error) {
    // Remove the loading message and show an error
    const botMessages = document.querySelectorAll(".bot-message");
    if (botMessages.length > 0) {
      botMessages[botMessages.length - 1].remove();
    }
    chatWindow.innerHTML += `<div class="bot-message error">Error: ${error.message}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
