import { useState } from 'react';
import { extractCalendarInfo } from './services/apiService';

function App() {
  const [inputText, setInputText] = useState('');
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to process');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const calendarInfo = await extractCalendarInfo(inputText);
      setEventData(calendarInfo);
    } catch (error) {
      console.error("Error processing text:", error);
      setError('Failed to extract event details. Please try again with clearer event information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-indigo-600">AI Text-to-Calendar Converter</h1>

        <textarea
          className="w-full p-3 border border-gray-300 rounded-md"
          rows="4"
          placeholder="Enter event details (e.g., 'Team meeting tomorrow at 2 PM in Conference Room A')"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          onClick={handleProcess}
          disabled={isLoading}
          className={`w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Processing...' : 'Extract details'}
        </button>

        {eventData && (
          <div className="bg-green-50 p-4 rounded-md space-y-2 border border-green-200">
            <h2 className="text-lg font-semibold text-green-700">Event Preview</h2>
            <p><strong>Title:</strong> {eventData.title}</p>
            <p><strong>Time:</strong> {new Date(eventData.startTime).toLocaleString()}</p>
            {eventData.location && <p><strong>Location:</strong> {eventData.location}</p>}
            {eventData.description && <p><strong>Description:</strong> {eventData.description}</p>}

            <div className="flex space-x-2 pt-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                Export .ics
              </button>
              <a
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
              >
                Add to Google Calendar
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
