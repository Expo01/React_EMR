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
      <p className="p-6 text-red-400">
        Another patient chart is already open.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">
          Edit Medications
        </h1>

        {patient && (
          <p className="text-gray-300 mb-6">
            {patient.fname} {patient.lname}
          </p>
        )}

        <form
          onSubmit={addMedication}
          className="grid grid-cols-2 gap-3 mb-8"
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
              className="p-3 bg-gray-800 border border-gray-600 rounded"
            />
          ))}

          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            placeholder="Instructions"
            className="col-span-2 p-3 bg-gray-800 border border-gray-600 rounded"
          />

          <button
            type="submit"
            className="col-span-2 px-4 py-2 bg-blue-700 rounded hover:bg-blue-600"
          >
            Add Medication
          </button>
        </form>

        <div className="space-y-2">
          {medications.map((medication) => (
            <label
              key={medication.medication_id}
              className="flex items-center gap-3 p-3 bg-blue-950 rounded"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(
                  medication.medication_id
                )}
                onChange={() =>
                  toggleSelected(medication.medication_id)
                }
              />

              <span>
                {medication.medication_name}
                {medication.strength &&
                  ` — ${medication.strength}`}
              </span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={deleteSelected}
          disabled={selectedIds.length === 0}
          className="mt-4 px-4 py-2 bg-red-700 rounded disabled:opacity-50"
        >
          Delete Selected
        </button>

        {status && <p className="mt-4 text-gray-300">{status}</p>}
      </div>
    </div>
  );
}

export default MedicationWriter;