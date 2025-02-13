import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Navigation from "./components/Navigation";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import HowToUse from "./components/HowToUse";
import SEO from "./components/SEO";

const App = () => {
  const [theme, setTheme] = useState("light");

  const handleThemeChange = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Router>
      <div
        className={`min-h-screen flex flex-col ${
          theme === "dark" ? "dark bg-gray-900 text-white" : "bg-gray-100"
        }`}
      >
        <SEO
          title="Text Formatting Tool"
          description="A powerful online tool for formatting and manipulating text. Easily convert case, replace text, perform line operations, and more."
          keywords="text formatting, text manipulation, online tool, uppercase, lowercase, replace text, line operations"
        />
        <Navigation theme={theme} onThemeChange={handleThemeChange} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard theme={theme} />} />
            <Route path="/how-to-use" element={<HowToUse theme={theme} />} />
            <Route path="/privacy" element={<PrivacyPolicy theme={theme} />} />
            <Route path="/contact" element={<Contact theme={theme} />} />
          </Routes>
        </main>
        <Footer theme={theme} />
      </div>
    </Router>
  );
};

export default App;
