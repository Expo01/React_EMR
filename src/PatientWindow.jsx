import Draggable from 'react-draggable'

function PatientWindow({ patient, onClose }) {
  if (!patient) return null

  return (
    // <Draggable handle=".handle">
      <div className="absolute top-20 left-20 bg-blue-950 text-white shadow-lg rounded-lg w-96 p-4 z-[9999] border border-white">
        <div className="handle cursor-move flex justify-between items-center border-b border-gray-400 pb-2 mb-2">
          <h2 className="text-lg font-bold">{patient.fname} {patient.lname}</h2>
          <button className="text-white text-xl" onClick={onClose}>&times;</button>
        </div>
        <p><strong>Date of Birth:</strong> {patient.dob}</p>
        <p><strong>Phone:</strong> {patient.phone}</p>
        <div className="mt-4 text-gray-300 italic">More details coming soon...</div>
      </div>
    // </Draggable>
  )
}

export default PatientWindow
