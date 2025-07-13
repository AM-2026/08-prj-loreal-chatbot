/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message as a bot message in the chat window
const initialMessage = "👋 Hello! How can I help you today?";
chatWindow.textContent = ""; // Clear any previous content
chatWindow.innerHTML += `<div class="bot-message"><strong>Bot:</strong> ${initialMessage}</div>`;

// Track the conversation history
const messages = [
  {
    role: "system",
    content:
      "You are a very friendly and professional assistant for L'Oréal. Always greet users warmly, use polite and positive language, and help them discover and understand L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations. Keep your responses brief and concise. If the user asks about anything unrelated to L’Oréal products or routines, kindly and professionally say you don't know.",
  },
];

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message
  const message = userInput.value;

  // Add user's message to conversation history
  messages.push({ role: "user", content: message });

  // Show user's message in the chat window
  chatWindow.innerHTML += `<div class="user-message"><strong>You:</strong> ${message}</div>`;

  // Clear the input box
  userInput.value = "";

  // Show a loading message
  chatWindow.innerHTML += `<div class="bot-message">Processing...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Use Cloudflare Worker proxy endpoint (no API key needed on client)
  const endpoint = "https://pj8.monahana.workers.dev/";

  // Create the request body for the Chat Completions API
  const requestBody = {
    model: "gpt-4o", // Use the gpt-4o model
    messages: messages,
  };

  try {
    // Send the request to OpenAI's API
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Check for HTTP errors
    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
    }

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
      // Add assistant's reply to conversation history
      messages.push({ role: "assistant", content: reply });
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
    // Log the error for debugging
    console.error("OpenAI API error:", error);
    chatWindow.innerHTML += `<div class="bot-message error">Sorry, something went wrong connecting to the AI. Please try again later.</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
