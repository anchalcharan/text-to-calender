import { useState } from 'react';
import axios from 'axios';
import ics from 'ics';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

function App() {
  const [text, setText] = useState('');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Extract event details from plain text. Return JSON with title, date, time, location, and description.",
            },
            {
              role: "user",
              content: text,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);
      setEvent(parsed);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to process the text');
    } finally {
      setLoading(false);
    }
  };

  const generateGoogleCalendarURL = (event) => {
    const start = `${event.date.replace(/-/g, '')}T${event.time.replace(':', '')}00Z`;
    const endHour = (parseInt(event.time.split(':')[0]) + 1).toString().padStart(2, '0');
    const end = `${event.date.replace(/-/g, '')}T${endHour}${event.time.split(':')[1]}00Z`;

    return `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
  };

  const generateICSFile = (event) => {
    const { error, value } = ics.createEvent({
      start: event.date.split('-').map(Number).concat(event.time.split(':').map(Number)),
      duration: { hours: 1 },
      title: event.title,
      description: event.description,
      location: event.location,
    });

    if (error) {
      console.error(error);
      return;
    }

    const blob = new Blob([value], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title}.ics`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          📅 AI Text-to-Calendar Converter
        </h1>

        <textarea
          className="w-full h-32 p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          placeholder="e.g. Meet mentor at 10:30 am in seminar hall on 13/04/2025"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl mt-4 w-full transition-all"
          onClick={handleProcess}
          disabled={loading}
        >
          {loading ? 'Extracting Details...' : 'Extract Details'}
        </button>

        {event && (
          <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📝 Event Preview</h2>
            <p className="mb-1"><strong>📌 Title:</strong> {event.title}</p>
            <p className="mb-1"><strong>📅 Date:</strong> {event.date}</p>
            <p className="mb-1"><strong>⏰ Time:</strong> {event.time}</p>
            <p className="mb-1"><strong>📍 Location:</strong> {event.location}</p>
            <p className="mb-4"><strong>🗒️ Description:</strong> {event.description}</p>

            <div className="flex flex-wrap gap-4">
              <button
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                onClick={() => generateICSFile(event)}
              >
                Export .ics
              </button>
              <a
                href={generateGoogleCalendarURL(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
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
