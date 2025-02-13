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

    const sampleText = text.length > 200 ? text.substring(0, 200) + "..." : text;
    const messages = [
      {
        role: "user",
        content: `You are an AI assistant for a text formatting tool that generates JavaScript functions to transform text. When provided with a short sample of the user's text and a clear transformation instruction, generate a complete JavaScript function that takes a single parameter 'inputText' and returns the modified text. Your response must be a well-formed JSON object with exactly two keys: 'explanation' and 'code'. Do not include any additional text.

Text Sample: \"${sampleText}\"
Instruction: \"${query}\". Please generate a JavaScript function named "transformText" that takes 'inputText' as its parameter and returns the text transformed as per the instruction.`
      }
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: 'o1-mini',
        messages: messages,
        max_completion_tokens: 1000
      });

      let resultText = completion.choices[0].message.content.trim();
      if (resultText.startsWith("```")) {
        resultText = resultText.replace(/```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '');
      }
      const result = JSON.parse(resultText);

      if (result.code) {
        try {
          // Create a new function from the generated code
          const operationFunction = new Function('inputText', `
            ${result.code}
            return ${getFunctionName(result.code)}(inputText);
          `);
          // Apply the operation to the text
          const newText = operationFunction(text);
          // Update the text in the main component
          updateText(newText);
          return `${result.explanation}\n\nI've applied the operation to your text.`;
        } catch (error) {
          console.error('Error executing generated code:', error);
          return `I generated some code, but encountered an error when trying to run it. Here's what I was attempting to do:\n\n${result.explanation}\n\nError: ${error.message}\n\nGenerated code:\n${result.code}`;
        }
      } else {
        return result.explanation;
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
    <div className={`${theme === 'dark' ? 'bg-brand-primary/10 text-white' : 'bg-white text-brand-primary'} p-6 rounded-2xl  border border-brand-primary/10`}>
      <div className="flex items-center gap-3 mb-6">
        <span className="bg-brand-accent/20 p-2 rounded-lg">
          <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </span>
        <h2 className="text-2xl font-bold text-brand-primary">AI-Powered Transformations</h2>
      </div>
      <div className="h-64 overflow-y-auto mb-4 p-4 border rounded">
        {conversation.map((message, index) => (
          <div key={index} className={`mb-3 flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'user' ? (
              <div className="mr-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">U</div>
              </div>
            ) : (
              <div className="mr-2">
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">A</div>
              </div>
            )}
            <div className={`max-w-[70%] inline-block p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800')}`}>
              {message.content}
            </div>
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
          aria-label="AI query input"
        />
        <button 
          type="submit"
          aria-label="Send query"
          className={`bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-lg transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin inline-block w-5 h-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Processing...
            </>
          ) : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;