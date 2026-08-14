function Calendar() {
  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  return (
    <main className="emr-workspace">
      <h1 className="text-2xl font-bold text-emr-text mb-6">
        Weekly Calendar
      </h1>

      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => (
          <div
            key={day}
            className="bg-emr-surface border border-emr-border rounded-lg min-h-[300px] overflow-hidden"
          >
            <h2 className="bg-emr-nav text-emr-text text-center font-semibold px-2 py-3 border-b border-emr-border">
              {day}
            </h2>

            {/* Placeholder for future appointments */}
            <div className="emr-secondary-text text-sm italic text-center p-3">
              Appts
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Calendar;
