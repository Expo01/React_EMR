const request = require('supertest');
const app = require('../app');
const pool = require('../db');

let testPatientId;
let otherPatientId;

describe('Patients and Appointments API', () => {

  // Create controlled patients and appointments before running the suite.
  beforeAll(async () => {
    const patientResult = await pool.query(
      `
      INSERT INTO patient_info (
        fname,
        lname,
        dob,
        phone
      )
      VALUES
        ($1, $2, $3, $4),
        ($5, $6, $7, $8)
      RETURNING patient_id
      `,
      [
        'Appointment',
        'Patient',
        '1970-01-01',
        '555-0400',

        'Other',
        'AppointmentPatient',
        '1975-02-02',
        '555-0401',
      ]
    );

    testPatientId = patientResult.rows[0].patient_id;
    otherPatientId = patientResult.rows[1].patient_id;

    await pool.query(
      `
      INSERT INTO appointments (
        patient_id,
        scheduled_date,
        scheduled_time,
        scheduled_therapist
      )
      VALUES
        ($1, $2, $3, $4),
        ($1, $5, $6, $7),
        ($8, $9, $10, $11)
      `,
      [
        testPatientId,
        '2026-08-25',
        '14:00',
        'Test Therapist, PT',

        '2026-08-24',
        '09:00',
        'Test Therapist, PT',

        otherPatientId,
        '2026-08-24',
        '10:00',
        'Other Therapist, PT',
      ]
    );
  });


  // Verify that the patient directory endpoint returns
  // patient records from the database.
  test('returns the patient directory', async () => {
    const response = await request(app)
      .get('/patients');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    expect(
      response.body.some(
        (patient) =>
          patient.patient_id === testPatientId
      )
    ).toBe(true);
  });


  // Verify that requesting one patient by ID returns
  // the correct patient and identifying information.
  test('returns the requested patient by ID', async () => {
    const response = await request(app)
      .get(`/patients/${testPatientId}`);

    expect(response.status).toBe(200);

    expect(response.body.patient_id).toBe(
      testPatientId
    );

    expect(response.body.fname).toBe(
      'Appointment'
    );

    expect(response.body.lname).toBe(
      'Patient'
    );

    expect(response.body.phone).toBe(
      '555-0400'
    );
  });


  // Verify that requesting a patient ID that does not exist
  // returns the expected 404 response.
  test('returns 404 when the requested patient does not exist', async () => {
    const response = await request(app)
      .get('/patients/999999');

    expect(response.status).toBe(404);

    expect(response.body.message).toBe(
      'Patient not found'
    );
  });


  // Verify that requesting appointments for one patient
  // does not return appointments belonging to another patient.
  test('returns only appointments for the requested patient', async () => {
    const response = await request(app)
      .get(`/appointments/${testPatientId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    response.body.forEach((appointment) => {
      expect(appointment.patient_id).toBe(
        testPatientId
      );
    });
  });


  // Verify that appointments are ordered by date
  // and then by scheduled time as defined by the API.
  test('returns appointments in chronological order', async () => {
    const response = await request(app)
      .get(`/appointments/${testPatientId}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    expect(
      response.body[0].scheduled_date.slice(0, 10)
    ).toBe('2026-08-24');

    expect(
      response.body[0].scheduled_time.slice(0, 5)
    ).toBe('09:00');

    expect(
      response.body[1].scheduled_date.slice(0, 10)
    ).toBe('2026-08-25');

    expect(
      response.body[1].scheduled_time.slice(0, 5)
    ).toBe('14:00');
  });


  // Remove all appointments and patients created for this suite,
  // then close this Jest worker's PostgreSQL connection pool.
  afterAll(async () => {
    await pool.query(
      `
      DELETE FROM appointments
      WHERE patient_id IN ($1, $2)
      `,
      [testPatientId, otherPatientId]
    );

    await pool.query(
      `
      DELETE FROM patient_info
      WHERE patient_id IN ($1, $2)
      `,
      [testPatientId, otherPatientId]
    );

    await pool.end();
  });

});