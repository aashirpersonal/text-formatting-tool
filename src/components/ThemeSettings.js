import React, { useState } from "react";

const ThemeSettings = ({
  onThemeChange,
  onFontSizeChange,
  onFontFamilyChange,
}) => {
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Arial");

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    onThemeChange(theme);
  };

  const handleFontSizeChange = (event) => {
    const size = parseInt(event.target.value);
    setFontSize(size);
    onFontSizeChange(size);
  };

  const handleFontFamilyChange = (event) => {
    const family = event.target.value;
    setFontFamily(family);
    onFontFamilyChange(family);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Theme Settings</h2>
      <div className="mb-4">
        <label htmlFor="theme" className="block text-gray-700 font-bold mb-2">
          Select Theme
        </label>
        <select
          id="theme"
          value={selectedTheme}
          onChange={(e) => handleThemeChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="default">Default</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div className="mb-4">
        <label
          htmlFor="fontSize"
          className="block text-gray-700 font-bold mb-2"
        >
          Font Size
        </label>
        <input
          type="number"
          id="fontSize"
          value={fontSize}
          onChange={handleFontSizeChange}
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div>
        <label
          htmlFor="fontFamily"
          className="block text-gray-700 font-bold mb-2"
        >
          Font Family
        </label>
        <select
          id="fontFamily"
          value={fontFamily}
          onChange={handleFontFamilyChange}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>
    </div>
  );
};

export default ThemeSettings;
