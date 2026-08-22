const request = require('supertest');
const app = require('../app');
const pool = require('../db');

let testPatientId;
let testNoteId;

describe('Notes API', () => {

  // Create controlled test data before running the test suite.
  // This prevents tests from depending on records in the demo database.
  beforeAll(async () => {
    const patientResult = await pool.query(
      `
      INSERT INTO patient_info (
        fname,
        lname,
        dob,
        phone
      )
      VALUES ($1, $2, $3, $4)
      RETURNING patient_id
      `,
      [
        'Test',
        'Patient',
        '1980-01-01',
        '555-0100',
      ]
    );

    testPatientId = patientResult.rows[0].patient_id;

    const noteResult = await pool.query(
      `
      INSERT INTO notes (
        patient_id,
        content,
        is_signed
      )
      VALUES ($1, $2, FALSE)
      RETURNING note_id
      `,
      [
        testPatientId,
        'Test note content.',
      ]
    );

    testNoteId = noteResult.rows[0].note_id;
  });


  // Verify that requesting one patient's notes does not return
  // notes belonging to another patient.
  test('returns only notes for the requested patient', async () => {
    const response = await request(app)
      .get(`/notes/${testPatientId}/notes`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    response.body.forEach((note) => {
      expect(note.patient_id).toBe(testPatientId);
    });
  });


  // Verify that requesting one specific note returns the correct
  // note content and the patient information used by NoteViewer.
  test('returns the requested note with its content and patient data', async () => {
    const response = await request(app)
      .get(`/notes/${testNoteId}`);

    expect(response.status).toBe(200);
    expect(response.body.note_id).toBe(testNoteId);
    expect(response.body.patient_id).toBe(testPatientId);

    expect(response.body.content).toBe(
      'Test note content.'
    );

    expect(response.body.fname).toBe('Test');
    expect(response.body.lname).toBe('Patient');
  });


  // Verify that requesting a note ID that does not exist
  // returns the expected 404 not-found response.
  test('returns 404 when the requested note does not exist', async () => {
    const response = await request(app)
      .get('/notes/999999');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Note not found');
  });


  // Verify that Jest is connected to the isolated test database
  // rather than the populated demo database.
  test('test environment uses the test database', async () => {
    const result = await pool.query(
      'SELECT current_database() AS database'
    );

    expect(result.rows[0].database).toBe(
      'patients_test'
    );
  });


  // Verify that a new note can be created as an unsigned draft
  // with no signing clinician or signature timestamp.
  test('creates a new unsigned note draft', async () => {
    const response = await request(app)
      .post('/notes')
      .send({
        patient_id: testPatientId,
        content: 'New draft created by automated test.',
      });

    expect(response.status).toBe(201);

    expect(response.body.patient_id).toBe(testPatientId);
    expect(response.body.content).toBe(
      'New draft created by automated test.'
    );

    expect(response.body.is_signed).toBe(false);
    expect(response.body.signed_therapist).toBeNull();
    expect(response.body.signed_at).toBeNull();
  });


  // Verify that an unsigned draft can be edited
  // while remaining in the unsigned state.
  test('updates an unsigned note draft', async () => {
    const createResponse = await request(app)
      .post('/notes')
      .send({
        patient_id: testPatientId,
        content: 'Original draft content.',
      });

    expect(createResponse.status).toBe(201);

    const draftId = createResponse.body.note_id;

    const updateResponse = await request(app)
      .patch(`/notes/${draftId}`)
      .send({
        content: 'Updated draft content.',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.note_id).toBe(draftId);

    expect(updateResponse.body.content).toBe(
      'Updated draft content.'
    );

    expect(updateResponse.body.is_signed).toBe(false);
  });


  // Verify that an unsigned draft can be formally signed,
  // storing the clinician identity, signature timestamp,
  // final content, and signed state.
  test('signs and locks a note draft', async () => {
    const createResponse = await request(app)
      .post('/notes')
      .send({
        patient_id: testPatientId,
        content: 'Draft content before signature.',
      });

    expect(createResponse.status).toBe(201);

    const draftId = createResponse.body.note_id;

    const signResponse = await request(app)
      .patch(`/notes/${draftId}/sign`)
      .send({
        content: 'Final signed note content.',
        signed_therapist: 'Test Clinician, PT',
      });

    expect(signResponse.status).toBe(200);
    expect(signResponse.body.note_id).toBe(draftId);

    expect(signResponse.body.content).toBe(
      'Final signed note content.'
    );

    expect(signResponse.body.signed_therapist).toBe(
      'Test Clinician, PT'
    );

    expect(signResponse.body.is_signed).toBe(true);
    expect(signResponse.body.signed_at).toBeTruthy();
  });


  // Verify that the backend rejects attempts to modify a signed note
  // and that the rejected request does not alter the stored content.
  test('rejects editing a signed note and preserves original content', async () => {
    const createResponse = await request(app)
      .post('/notes')
      .send({
        patient_id: testPatientId,
        content: 'Content before signing.',
      });

    expect(createResponse.status).toBe(201);

    const draftId = createResponse.body.note_id;

    const signResponse = await request(app)
      .patch(`/notes/${draftId}/sign`)
      .send({
        content: 'Final locked content.',
        signed_therapist: 'Test Clinician, PT',
      });

    expect(signResponse.status).toBe(200);

    const editResponse = await request(app)
      .patch(`/notes/${draftId}`)
      .send({
        content: 'This change should not be allowed.',
      });

    expect(editResponse.status).toBe(409);

    expect(editResponse.body.error).toBe(
      'Signed notes cannot be edited'
    );

    // Verify the rejected request did not modify the database record.
    const result = await pool.query(
      `
      SELECT content, is_signed
      FROM notes
      WHERE note_id = $1
      `,
      [draftId]
    );

    expect(result.rows[0].content).toBe(
      'Final locked content.'
    );

    expect(result.rows[0].is_signed).toBe(true);
  });


  // Verify that the backend requires clinician identification
  // before allowing a note to be signed.
  test('rejects signing a note without a clinician name', async () => {
    const createResponse = await request(app)
      .post('/notes')
      .send({
        patient_id: testPatientId,
        content: 'Unsigned draft.',
      });

    expect(createResponse.status).toBe(201);

    const draftId = createResponse.body.note_id;

    const response = await request(app)
      .patch(`/notes/${draftId}/sign`)
      .send({
        content: 'Unsigned draft.',
        signed_therapist: '',
      });

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
      'Note content and signing clinician are required'
    );
  });


  // Verify that the backend rejects creation of a note
  // containing only blank or whitespace content.
  test('rejects creating an empty note draft', async () => {
    const response = await request(app)
      .post('/notes')
      .send({
        patient_id: testPatientId,
        content: '   ',
      });

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
      'patient_id and content are required'
    );
  });


  // Remove all records created specifically for this test suite,
  // then close the PostgreSQL connection pool.
  afterAll(async () => {
    await pool.query(
      'DELETE FROM notes WHERE patient_id = $1',
      [testPatientId]
    );

    await pool.query(
      'DELETE FROM patient_info WHERE patient_id = $1',
      [testPatientId]
    );

    await pool.end();
  });

});