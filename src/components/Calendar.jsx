// src/components/Calendar.jsx
function Calendar() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <main className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-6">Weekly Calendar</h1>

      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => (
          <div key={day} className="bg-blue-950 p-4 rounded-lg shadow-md min-h-[300px]">
            <h2 className="text-lg font-semibold mb-2 border-b border-blue-800 pb-1">{day}</h2>
            {/* Placeholder for future appointments */}
            <div className="text-sm italic text-gray-400">Appts</div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Calendar;

