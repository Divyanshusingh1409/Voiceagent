import React from 'react';
import VoiceAgent from './components/VoiceAgent';

const App: React.FC = () => {
  // Access API key from environment variable as required
  const apiKey = process.env.API_KEY || '';

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4">
      {apiKey ? (
        <VoiceAgent apiKey={apiKey} />
      ) : (
        <div className="text-center p-8 bg-slate-800 rounded-xl border border-red-500/50 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">API Key Missing</h2>
          <p className="text-slate-300">
            Could not find the API Key in <code>process.env.API_KEY</code>.
            Please ensure the environment is configured correctly.
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
