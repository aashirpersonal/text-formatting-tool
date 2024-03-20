import React from "react";
import SEO from "./SEO";

const HowToUse = ({ theme }) => {
  return (
    <div
      className={`${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white"
      } min-h-screen`}
    >
      <SEO
        title="How to Use - Text Formatting Tool"
        description="Learn how to use the Text Formatting Tool effectively. Detailed instructions and examples for each feature."
        keywords="text formatting tool, how to use, instructions, examples"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">
          How to Use Text Formatting Tool
        </h1>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Basic Operations</h2>
          <p className="mb-4">
            The basic operations section provides a set of easy-to-use
            formatting options for your text. Simply click on the desired
            operation to apply it to the text in the textarea.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Uppercase: Converts all characters in the text to uppercase.
            </li>
            <li>
              Lowercase: Converts all characters in the text to lowercase.
            </li>
            <li>
              Capitalize Sentences: Capitalizes the first letter of each
              sentence in the text.
            </li>
            <li>
              Capitalize Words: Capitalizes the first letter of each word in the
              text.
            </li>
            {/* ... */}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Replace Text</h2>
          <p className="mb-4">
            The replace text section allows you to search for specific text
            patterns and replace them with new text. It provides options for
            using regular expressions and case-sensitive searching.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Search Text: Enter the text or regular expression to search for.
            </li>
            <li>
              Replace Text: Enter the replacement text. Use %N for newline
              characters.
            </li>
            <li>
              Use Regular Expression: Check this option to use regular
              expressions for searching.
            </li>
            <li>
              Case Sensitive: Check this option to perform a case-sensitive
              search.
            </li>
          </ul>
          <p className="mb-4">
            Example: To replace all occurrences of "apple" with "orange", enter
            "apple" in the search text and "orange" in the replace text.
          </p>
          <p className="mb-4">
            Regular Expression Example: To replace all email addresses with
            "email@example.com", use the regular expression{" "}
            <code>/[\w.-]+@[\w.-]+\.[\w.-]+/g</code> in the search text and
            "email@example.com" in the replace text.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Line Operations</h2>
          <p className="mb-4">
            The line operations section allows you to perform various operations
            on each line of the text. You can add a prefix or suffix to each
            line, and trim characters from the start or end of each line.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Prefix: Enter the text to add at the beginning of each line.
            </li>
            <li>Suffix: Enter the text to add at the end of each line.</li>
            <li>
              Trim Start: Enter the characters to remove from the start of each
              line.
            </li>
            <li>
              Trim End: Enter the characters to remove from the end of each
              line.
            </li>
          </ul>
          <p className="mb-4">
            Example: To add a bullet point (<code>•</code>) to the start of each
            line, enter "• " in the prefix field.
          </p>
          <p className="mb-4">
            Example: To remove any leading whitespace from each line, enter
            spaces or tabs in the trim start field.
          </p>
        </section>

        {/* ... */}
      </div>
    </div>
  );
};

export default HowToUse;
