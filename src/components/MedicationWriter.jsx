import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePatientAccessGuard from '../hooks/usePatientAccessGuard';

function MedicationWriter() {
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [status, setStatus] = useState('');

  const [form, setForm] = useState({
    medication_name: '',
    strength: '',
    dose: '',
    dosage_form: '',
    route: '',
    frequency: '',
    instructions: '',
  });

  const isBlocked = usePatientAccessGuard(patientId);

  const fetchMedications = async () => {
    const response = await fetch(
      `http://localhost:3001/medications/${patientId}`
    );

    if (!response.ok) {
      throw new Error('Unable to retrieve medications.');
    }

    const data = await response.json();
    setMedications(data);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const patientResponse = await fetch(
          `http://localhost:3001/patients/${patientId}`
        );

        if (!patientResponse.ok) {
          throw new Error('Unable to retrieve patient.');
        }

        setPatient(await patientResponse.json());
        await fetchMedications();
      } catch (error) {
        setStatus(error.message);
      }
    };

    loadData();
  }, [patientId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const addMedication = async (event) => {
    event.preventDefault();

    if (!form.medication_name.trim()) {
      setStatus('Medication name is required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: Number(patientId),
          ...form,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to add medication.');
      }

      setForm({
        medication_name: '',
        strength: '',
        dose: '',
        dosage_form: '',
        route: '',
        frequency: '',
        instructions: '',
      });

      setStatus('Medication added.');
      await fetchMedications();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(
        selectedIds.map(async (medicationId) => {
          const response = await fetch(
            `http://localhost:3001/medications/${medicationId}`,
            { method: 'DELETE' }
          );

          if (!response.ok) {
            throw new Error('Unable to delete medication.');
          }
        })
      );

      setSelectedIds([]);
      setStatus('Selected medications deleted.');
      await fetchMedications();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const toggleSelected = (medicationId) => {
    setSelectedIds((current) =>
      current.includes(medicationId)
        ? current.filter((id) => id !== medicationId)
        : [...current, medicationId]
    );
  };

  if (isBlocked) {
    return (
      <div className="emr-page flex items-center justify-center">
        <div className="emr-workspace max-w-md text-center border border-emr-border">
          <h2 className="text-xl font-semibold text-emr-error mb-4">
            Access Denied
          </h2>

          <p className="text-emr-text">
            Another patient chart is already open.
          </p>

          <p className="emr-secondary-text mt-2 text-sm">
            Close all windows for the current patient before opening a different patient's chart.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="emr-page">
      <div className="emr-workspace min-h-[calc(100vh-1.5rem)]">

        {/* Patient header */}
        <div className="emr-patient-header border-b border-emr-border">
          <h1 className="text-2xl font-bold text-emr-text">
            Edit Medications
          </h1>

          {patient ? (
            <p className="mt-2 text-emr-text">
              <strong>{patient.fname} {patient.lname}</strong>

              {patient.dob && (
                <>
                  <span className="mx-3 text-emr-border">|</span>
                  <strong>DOB:</strong> {patient.dob.slice(0, 10)}
                </>
              )}

              {patient.phone && (
                <>
                  <span className="mx-3 text-emr-border">|</span>
                  <strong>Phone:</strong> {patient.phone}
                </>
              )}
            </p>
          ) : (
            <p className="emr-secondary-text mt-2">
              Loading patient information...
            </p>
          )}
        </div>

        {/* Add medication */}
        <form
          onSubmit={addMedication}
          className="grid grid-cols-2 gap-3 mt-6 mb-8"
        >
          {[
            ['medication_name', 'Medication name'],
            ['strength', 'Strength'],
            ['dose', 'Dose'],
            ['dosage_form', 'Dosage form'],
            ['route', 'Route'],
            ['frequency', 'Frequency'],
          ].map(([name, placeholder]) => (
            <input
              key={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="p-3 bg-emr-surface border border-emr-border rounded text-emr-text focus:outline-none focus:border-emr-primary"
            />
          ))}

          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            placeholder="Instructions"
            className="col-span-2 p-3 bg-emr-surface border border-emr-border rounded text-emr-text focus:outline-none focus:border-emr-primary"
          />

          <button
            type="submit"
            className="emr-primary-button col-span-2"
          >
            Add Medication
          </button>
        </form>

        {/* Current medications */}
        <div className="emr-table-container">
          <table className="emr-table">
            <thead className="emr-table-header">
              <tr>
                <th className="emr-table-heading">Select</th>
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
                  className="emr-table-row"
                >
                  <td className="emr-table-cell">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(
                        medication.medication_id
                      )}
                      onChange={() =>
                        toggleSelected(medication.medication_id)
                      }
                    />
                  </td>

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

        <button
          type="button"
          onClick={deleteSelected}
          disabled={selectedIds.length === 0}
          className="mt-4 px-4 py-2 rounded bg-emr-error text-white font-medium hover:opacity-90 disabled:opacity-50"
        >
          Delete Selected
        </button>

        {status && (
          <p className="emr-secondary-text mt-4">
            {status}
          </p>
        )}

      </div>
    </div>
  );
}

export default MedicationWriter;