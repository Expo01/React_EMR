import { useEffect, useState } from 'react';

function PatientAppointments() {
    const [appointments, setAppointments] = useState([])

    useEffect(() => {
        fetch('http://localhost:3001/appointments')
            .then((res) => res.json())
            .then((data) => setAppointments(data))
            .catch((err) => console.error('Error fetching appointments:', err))
    }, [])

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Appointment List</h1>
            <table className="min-w-full table-auto border border-gray-300 bg-blue-950 text-white text-left">
                <thead className="bg-blue-900 text-gray-200">
                    <tr>
                        <th className="data-table-header">Scheduled Date</th>
                        <th className="data-table-header">Scheduled Time</th>
                        <th className="data-table-header">Scheduled Therapist</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((appointment) => (
                        <tr key={appointment.appointment_id} className="hover:bg-blue-800">
                            <td className="data-table-row">{appointment.scheduled_date.slice(0, 10)}</td>
                            <td className="data-table-row">
                                {(() => {
                                    const [hourStr, minuteStr] = appointment.scheduled_time.split(':');
                                    let hour = parseInt(hourStr, 10);
                                    const ampm = hour >= 12 ? 'PM' : 'AM';
                                    hour = hour % 12 || 12; // Convert 0 -> 12, 13 -> 1, etc.
                                    return `${hour}:${minuteStr} ${ampm}`;
                                })()}
                            </td>
                            <td className="data-table-row">{appointment.scheduled_therapist}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

}



export default PatientAppointments;