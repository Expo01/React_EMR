function MedicationList({ medications, patientId }) {
  const openMedicationWriter = () => {
    window.open(
      `/patient/${patientId}/medications/edit`,
      '_blank',
      'width=900,height=700'
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Medications</h2>

        <button
          type="button"
          onClick={openMedicationWriter}
          className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600"
        >
          Edit Medications
        </button>
      </div>

      {medications.length === 0 ? (
        <p className="text-gray-400">No medications found.</p>
      ) : (
        <ul className="space-y-3">
          {medications.map((medication) => (
            <li
              key={medication.medication_id}
              className="p-4 bg-blue-900 rounded"
            >
              <p className="font-semibold">
                {medication.medication_name}
                {medication.strength && ` — ${medication.strength}`}
              </p>

              <p className="text-gray-300">
                {[
                  medication.dose,
                  medication.dosage_form,
                  medication.route,
                  medication.frequency,
                ]
                  .filter(Boolean)
                  .join(' | ')}
              </p>

              {medication.instructions && (
                <p className="text-gray-400 mt-1">
                  {medication.instructions}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MedicationList;