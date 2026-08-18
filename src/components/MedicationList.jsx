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
      <div className="relative mb-3">
        <h2 className="emr-section-title mb-0">
          Medications
        </h2>

        <button
          type="button"
          onClick={openMedicationWriter}
          className="emr-primary-button absolute right-0 top-1/2 -translate-y-1/2 text-sm"
        >
          Edit Medications
        </button>
      </div>

      {medications.length === 0 ? (
        <p className="emr-empty-message">
          No medications found.
        </p>
      ) : (
        <div className="emr-table-container">
          <table className="emr-table">
            <thead className="emr-table-header">
              <tr>
                <th className="emr-table-heading">Medication</th>
                <th className="emr-table-heading">Strength</th>
                <th className="emr-table-heading">Dose</th>
                <th className="emr-table-heading">Form</th>
                <th className="emr-table-heading">Route</th>
                <th className="emr-table-heading">Frequency</th>
              </tr>
            </thead>

            <tbody>
              {medications.map((medication) => (
                <tr
                  key={medication.medication_id}
                  className="emr-table-row-focus"
                >
                  <td className="emr-table-cell font-medium">
                    {medication.medication_name}
                  </td>

                  <td className="emr-table-cell">
                    {medication.strength || '—'}
                  </td>

                  <td className="emr-table-cell">
                    {medication.dose || '—'}
                  </td>

                  <td className="emr-table-cell">
                    {medication.dosage_form || '—'}
                  </td>

                  <td className="emr-table-cell">
                    {medication.route || '—'}
                  </td>

                  <td className="emr-table-cell">
                    {medication.frequency || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MedicationList;