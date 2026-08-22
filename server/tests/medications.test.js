const request = require('supertest');
const app = require('../app');
const pool = require('../db');

let testPatientId;
let otherPatientId;
let testMedicationId;

describe('Medications API', () => {

  // Create controlled patients before running the medication tests.
  // Two patients are used so patient-scoped retrieval can be verified.
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
        'Medication',
        'Patient',
        '1980-01-01',
        '555-0200',

        'Other',
        'Patient',
        '1985-02-02',
        '555-0201',
      ]
    );

    testPatientId = patientResult.rows[0].patient_id;
    otherPatientId = patientResult.rows[1].patient_id;

    const medicationResult = await pool.query(
      `
      INSERT INTO medications (
        patient_id,
        medication_name,
        strength,
        dose,
        dosage_form,
        route,
        frequency,
        instructions
      )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8),
        ($9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING medication_id, patient_id
      `,
      [
        testPatientId,
        'Test Medication',
        '10 mg',
        '1 tablet',
        'Tablet',
        'Oral',
        'Daily',
        'Take with food',

        otherPatientId,
        'Other Patient Medication',
        '20 mg',
        '1 tablet',
        'Tablet',
        'Oral',
        'Twice daily',
        null,
      ]
    );

    testMedicationId =
      medicationResult.rows.find(
        (medication) =>
          medication.patient_id === testPatientId
      ).medication_id;
  });


  // Verify that requesting one patient's medications does not
  // return medications belonging to another patient.
  test('returns only medications for the requested patient', async () => {
    const response = await request(app)
      .get(`/medications/${testPatientId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    response.body.forEach((medication) => {
      expect(medication.patient_id).toBe(testPatientId);
    });

    expect(
      response.body.some(
        (medication) =>
          medication.medication_name ===
          'Other Patient Medication'
      )
    ).toBe(false);
  });


  // Verify that a new medication can be created with all
  // structured medication fields associated with the correct patient.
  test('creates a medication for the requested patient', async () => {
    const response = await request(app)
      .post('/medications')
      .send({
        patient_id: testPatientId,
        medication_name: 'Automated Test Medication',
        strength: '25 mg',
        dose: '1 tablet',
        dosage_form: 'Tablet',
        route: 'Oral',
        frequency: 'Daily',
        instructions: 'Automated test instructions',
      });

    expect(response.status).toBe(201);

    expect(response.body.patient_id).toBe(testPatientId);
    expect(response.body.medication_name).toBe(
      'Automated Test Medication'
    );
    expect(response.body.strength).toBe('25 mg');
    expect(response.body.dose).toBe('1 tablet');
    expect(response.body.dosage_form).toBe('Tablet');
    expect(response.body.route).toBe('Oral');
    expect(response.body.frequency).toBe('Daily');
    expect(response.body.instructions).toBe(
      'Automated test instructions'
    );
  });


  // Verify that medication creation is rejected when the
  // required medication name is missing.
  test('rejects medication creation without a medication name', async () => {
    const response = await request(app)
      .post('/medications')
      .send({
        patient_id: testPatientId,
        medication_name: '',
        strength: '10 mg',
        dose: '1 tablet',
      });

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
      'patient_id and medication_name are required'
    );
  });


  // Verify that medication creation is rejected when the
  // required patient association is missing.
  test('rejects medication creation without a patient ID', async () => {
    const response = await request(app)
      .post('/medications')
      .send({
        medication_name: 'Unassigned Medication',
        strength: '10 mg',
        dose: '1 tablet',
      });

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
      'patient_id and medication_name are required'
    );
  });


  // Verify that an existing medication can be deleted
  // through the medication DELETE endpoint.
  test('deletes an existing medication', async () => {
    const createResponse = await request(app)
      .post('/medications')
      .send({
        patient_id: testPatientId,
        medication_name: 'Medication To Delete',
        strength: '5 mg',
        dose: '1 tablet',
        dosage_form: 'Tablet',
        route: 'Oral',
        frequency: 'Daily',
        instructions: null,
      });

    expect(createResponse.status).toBe(201);

    const medicationId =
      createResponse.body.medication_id;

    const deleteResponse = await request(app)
      .delete(`/medications/${medicationId}`);

    expect(deleteResponse.status).toBe(200);

    expect(deleteResponse.body.message).toBe(
      'Medication deleted'
    );

    // Verify the medication was actually removed from PostgreSQL.
    const result = await pool.query(
      `
      SELECT *
      FROM medications
      WHERE medication_id = $1
      `,
      [medicationId]
    );

    expect(result.rows.length).toBe(0);
  });


  // Verify that deleting a medication ID that does not exist
  // returns the expected 404 response.
  test('returns 404 when deleting a nonexistent medication', async () => {
    const response = await request(app)
      .delete('/medications/999999');

    expect(response.status).toBe(404);

    expect(response.body.error).toBe(
      'Medication not found'
    );
  });


  // Verify that medication records returned by the API contain
  // the structured fields required by the medication list UI.
  test('returns structured medication details', async () => {
    const response = await request(app)
      .get(`/medications/${testPatientId}`);

    expect(response.status).toBe(200);

    const medication = response.body.find(
      (item) =>
        item.medication_id === testMedicationId
    );

    expect(medication).toBeDefined();

    expect(medication.medication_name).toBe(
      'Test Medication'
    );
    expect(medication.strength).toBe('10 mg');
    expect(medication.dose).toBe('1 tablet');
    expect(medication.dosage_form).toBe('Tablet');
    expect(medication.route).toBe('Oral');
    expect(medication.frequency).toBe('Daily');
    expect(medication.instructions).toBe(
      'Take with food'
    );
  });


  // Remove all medications and patients created for this suite,
  // then close this Jest worker's PostgreSQL connection pool.
  afterAll(async () => {
    await pool.query(
      `
      DELETE FROM medications
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