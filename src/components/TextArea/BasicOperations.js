import React from "react";
import UpperCase from "../UpperCase";
import LowerCase from "../LowerCase";
import CapitalizeSentences from "../CapitalizeSentences";
import CapitalizeWords from "../CapitalizeWords";
import RemoveWhitespace from "../RemoveWhitespace";
import RemoveTabs from "../RemoveTabs";
import RemoveLineBreaks from "../RemoveLineBreaks";
import TrimEachLine from "../TrimEachLine";
import SortLinesAscending from "../SortLinesAscending";
import SortLinesDescending from "../SortLinesDescending";
import ExtractEmails from "../ExtractEmails";
import ExtractPhoneNumbers from "../ExtractPhoneNumbers";

const BasicOperations = ({ text, updateText, theme }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Basic Operations</h2>
      <div className="grid grid-cols-2 gap-4">
        <ExtractEmails text={text} updateText={updateText} theme={theme} />
        <ExtractPhoneNumbers text={text} updateText={updateText} theme={theme} />
        <UpperCase text={text} updateText={updateText} theme={theme} />
        <LowerCase text={text} updateText={updateText} theme={theme} />
        <CapitalizeSentences text={text} updateText={updateText} theme={theme} />
        <CapitalizeWords text={text} updateText={updateText} theme={theme} />
        <RemoveWhitespace text={text} updateText={updateText} theme={theme} />
        <RemoveTabs text={text} updateText={updateText} theme={theme} />
        <RemoveLineBreaks text={text} updateText={updateText} theme={theme} />
        <TrimEachLine text={text} updateText={updateText} theme={theme} />
        <SortLinesAscending text={text} updateText={updateText} theme={theme} />
        <SortLinesDescending text={text} updateText={updateText} theme={theme} />
      </div>
    </div>
  );
};

export default BasicOperations;