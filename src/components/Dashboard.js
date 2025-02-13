import React, { useState } from 'react';
import { useTextHistory } from './utils';
import TextArea from './TextArea';
import AIAssistant from './AIAssistant';
import UpperCase from './UpperCase';
import LowerCase from './LowerCase';
import CapitalizeSentences from './CapitalizeSentences';
import CapitalizeWords from './CapitalizeWords';
import TrimEachLine from './TrimEachLine';
import RemoveLineBreaks from './RemoveLineBreaks';
import RemoveTabs from './RemoveTabs';
import RemoveWhitespace from './RemoveWhitespace';
import SortLinesAscending from './SortLinesAscending';
import SortLinesDescending from './SortLinesDescending';
import ReplaceText from './ReplaceText';
import DashboardTextArea from './DashboardTextArea';
import Split from 'react-split';

const Dashboard = ({ theme }) => {
  const [text, updateText, undo, redo] = useTextHistory("");
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="h-screen w-full p-2 overflow-hidden">
      <style>{`
        .gutter {
          background-color: ${theme === 'dark' ? '#374151' : '#e5e7eb'};
          background-repeat: no-repeat;
          background-position: center;
          cursor: col-resize;
        }
        .gutter.gutter-horizontal {
          width: 10px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='30'%3E%3Cpath d='M5 0 L5 30' stroke='%23707070' stroke-width='2' stroke-dasharray='4'/%3E%3C/svg%3E");
        }
        .gutter:hover {
          background-color: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
        }
      `}</style>
      <Split
        className="flex h-full"
        sizes={[33, 34, 33]}
        minSize={100}
        gutterSize={10}
        gutterAlign="center"
        snapOffset={30}
      >
        {/* Left Column: Other operations */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-2 h-full overflow-auto`}
        >
          <h2 className="text-lg font-bold mb-2">Operations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-semibold mb-1">Basic</h3>
              <div className="flex flex-wrap gap-2">
                <UpperCase text={text} updateText={updateText} theme={theme} />
                <LowerCase text={text} updateText={updateText} theme={theme} />
                <CapitalizeSentences text={text} updateText={updateText} theme={theme} />
                <CapitalizeWords text={text} updateText={updateText} theme={theme} />
              </div>
            </div>
            <div>
              <h3 className="text-md font-semibold mb-1">Line Ops</h3>
              <div className="flex flex-wrap gap-2">
                <TrimEachLine text={text} updateText={updateText} theme={theme} />
                <RemoveLineBreaks text={text} updateText={updateText} theme={theme} />
                <RemoveTabs text={text} updateText={updateText} theme={theme} />
                <RemoveWhitespace text={text} updateText={updateText} theme={theme} />
                <SortLinesAscending text={text} updateText={updateText} theme={theme} />
                <SortLinesDescending text={text} updateText={updateText} theme={theme} />
              </div>
            </div>
            <div>
              <h3 className="text-md font-semibold mb-1">Replacement</h3>
              <ReplaceText text={text} updateText={updateText} theme={theme} showInfo={showInfo} setShowInfo={setShowInfo} />
            </div>
          </div>
        </div>

        {/* Middle Column: Text Editor */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-2 h-full overflow-auto`}
        >
          <h2 className="text-lg font-bold mb-2">Text Editor</h2>
          <DashboardTextArea text={text} updateText={updateText} undo={undo} redo={redo} theme={theme} />
        </div>

        {/* Right Column: AI Assistant */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-2 h-full flex flex-col overflow-hidden`}
        >
          <div className="flex-1 min-h-0">
            <AIAssistant text={text} updateText={updateText} theme={theme} />
          </div>
        </div>
      </Split>
    </div>
  );
};

export default Dashboard; 