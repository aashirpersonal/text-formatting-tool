import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const AIAssistant = ({ text, updateText, theme }) => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (query.trim() === '') return;

    setConversation(prev => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);

    try {
      const response = await processQuery(query, text);
      setConversation(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error processing query:', error);
      setConversation(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    }

    setIsLoading(false);
    setQuery('');
  };

  const processQuery = async (query, text) => {
    if (text === undefined || text === null) {
      return "I'm sorry, but there's no text to work with. Please enter some text in the main text area before asking me to perform operations on it.";
    }

    if (text.trim() === '') {
      return "The text area is empty. Please enter some text before asking me to perform operations on it.";
    }

    const messages = [
      { role: "system", content: "You are an AI assistant for a text formatting tool. Your task is to understand the user's request and generate JavaScript code to perform text operations. The code should be a function that takes a single parameter 'inputText' and returns the modified text." },
      { role: "user", content: `The current text is: "${text}". The user wants to: ${query}. Please provide a JavaScript function to perform this operation. If the operation isn't clear or possible, explain why and ask for clarification. Return your response as a JSON object with 'explanation' and 'code' fields. The code should be a complete function that takes 'inputText' as a parameter and returns the modified text.` }
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      });

      const response = JSON.parse(completion.choices[0].message.content);

      if (response.code) {
        try {
          // Create a new function from the generated code
          const operationFunction = new Function('inputText', `
            ${response.code}
            return ${getFunctionName(response.code)}(inputText);
          `);
          // Apply the operation to the text
          const newText = operationFunction(text);
          // Update the text in the main component
          updateText(newText);
          return `${response.explanation}\n\nI've applied the operation to your text.`;
        } catch (error) {
          console.error('Error executing generated code:', error);
          return `I generated some code, but encountered an error when trying to run it. Here's what I was attempting to do:\n\n${response.explanation}\n\nError: ${error.message}\n\nGenerated code:\n${response.code}`;
        }
      } else {
        return response.explanation;
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(`Failed to process query: ${error.message}`);
    }
  };

  // Helper function to extract the function name from the generated code
  const getFunctionName = (code) => {
    const match = code.match(/function\s+(\w+)/);
    return match ? match[1] : 'operation';
  };
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 rounded-lg shadow-md`}>
      <h2 className="text-2xl font-bold mb-4">AI Assistant</h2>
      <div className="h-64 overflow-y-auto mb-4 p-4 border rounded">
        {conversation.map((message, index) => (
          <div key={index} className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : theme === 'dark' 
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-200 text-gray-800'
            }`}>
              {message.content}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleQuerySubmit} className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`flex-grow p-3 rounded-l-lg ${
            theme === 'dark' 
              ? 'bg-gray-700 text-white' 
              : 'bg-gray-100 text-gray-800'
          }`}
          placeholder="Ask the AI assistant..."
          disabled={isLoading}
        />
        <button 
          type="submit"
          className={`bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-lg transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;