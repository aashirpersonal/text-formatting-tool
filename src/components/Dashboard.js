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
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="flex-1 p-2 overflow-hidden">
      <style>{`
  .gutter {
    background-repeat: no-repeat;
    background-position: 50%;
    transition: all 0.2s;
    z-index: 10;
  }
  .gutter.gutter-horizontal {
    cursor: col-resize;
    background-color: transparent;
    width: 12px !important;
    margin: 0 -2px;
    position: relative;
  }
  .gutter.gutter-horizontal:hover {
    background-color: ${theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)'};
  }
  .gutter.gutter-horizontal::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 3px;
    height: 32px;
    background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
    border-radius: 3px;
    transition: all 0.2s;
  }
  .gutter.gutter-horizontal:hover::before {
    width: 4px;
    background: ${theme === 'dark' ? '#6b7280' : '#9ca3af'};
  }
`}</style>
        <Split
  className="flex h-full"
  sizes={[25, 50, 25]}
  minSize={[200, 400, 200]}
  gutterSize={12}
  snapOffset={30}
>
          {/* Left Column: Other operations */}
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-2 h-full overflow-auto rounded-lg shadow-sm`}>
            <h2 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Operations</h2>
            <div className="space-y-4">
              <div>
                <h3 className={`text-md font-semibold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Basic</h3>
                <div className="flex flex-wrap gap-2">
                  <UpperCase text={text} updateText={updateText} theme={theme} />
                  <LowerCase text={text} updateText={updateText} theme={theme} />
                  <CapitalizeSentences text={text} updateText={updateText} theme={theme} />
                  <CapitalizeWords text={text} updateText={updateText} theme={theme} />
                </div>
              </div>
              <div>
                <h3 className={`text-md font-semibold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Line Ops</h3>
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
                <h3 className={`text-md font-semibold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Replacement</h3>
                <ReplaceText text={text} updateText={updateText} theme={theme} showInfo={showInfo} setShowInfo={setShowInfo} />
              </div>
            </div>
          </div>

          {/* Middle Column: Text Editor */}
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-2 h-full overflow-auto rounded-lg shadow-sm`}>
            <h2 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Text Editor</h2>
            <DashboardTextArea text={text} updateText={updateText} undo={undo} redo={redo} theme={theme} />
          </div>

          {/* Right Column: AI Assistant */}
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-2 h-full flex flex-col overflow-hidden rounded-lg shadow-sm`}>
            <div className="flex-1 min-h-0">
              <AIAssistant text={text} updateText={updateText} theme={theme} />
            </div>
          </div>
        </Split>
      </div>
    </div>
  );
};

export default Dashboard;