const request = require('supertest');
const app = require('../app');
const pool = require('../db');

let testPatientId;
let otherPatientId;
let testDocumentId;

describe('Clinical Documents API', () => {

  // Create controlled patients and clinical-document metadata
  // before running the test suite.
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
        'Document',
        'Patient',
        '1970-01-01',
        '555-0300',

        'Other',
        'DocumentPatient',
        '1975-02-02',
        '555-0301',
      ]
    );

    testPatientId = patientResult.rows[0].patient_id;
    otherPatientId = patientResult.rows[1].patient_id;

    const documentResult = await pool.query(
      `
      INSERT INTO clinical_documents (
        patient_id,
        document_name,
        document_type,
        file_path,
        mime_type
      )
      VALUES
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10)
      RETURNING document_id, patient_id
      `,
      [
        testPatientId,
        'Test_Discharge_Summary.pdf',
        'Hospital Discharge Summary',
        '/uploads/Test_Discharge_Summary.pdf',
        'application/pdf',

        otherPatientId,
        'Other_Patient_Document.pdf',
        'PT Referral',
        '/uploads/Other_Patient_Document.pdf',
        'application/pdf',
      ]
    );

    testDocumentId =
      documentResult.rows.find(
        (document) =>
          document.patient_id === testPatientId
      ).document_id;
  });


  // Verify that requesting clinical documents for one patient
  // does not return documents belonging to another patient.
  test('returns only clinical documents for the requested patient', async () => {
    const response = await request(app)
      .get(`/clinical-documents/${testPatientId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    response.body.forEach((document) => {
      expect(document.patient_id).toBe(testPatientId);
    });

    expect(
      response.body.some(
        (document) =>
          document.document_name ===
          'Other_Patient_Document.pdf'
      )
    ).toBe(false);
  });


  // Verify that requesting one clinical document returns
  // the exact document metadata associated with that document ID.
  test('returns the requested clinical document', async () => {
    const response = await request(app)
      .get(
        `/clinical-documents/document/${testDocumentId}`
      );

    expect(response.status).toBe(200);

    expect(response.body.document_id).toBe(
      testDocumentId
    );

    expect(response.body.patient_id).toBe(
      testPatientId
    );

    expect(response.body.document_name).toBe(
      'Test_Discharge_Summary.pdf'
    );

    expect(response.body.document_type).toBe(
      'Hospital Discharge Summary'
    );
  });


  // Verify that the document metadata returned by the API
  // includes the storage path and MIME type used by the viewer.
  test('returns document file metadata required by the viewer', async () => {
    const response = await request(app)
      .get(
        `/clinical-documents/document/${testDocumentId}`
      );

    expect(response.status).toBe(200);

    expect(response.body.file_path).toBe(
      '/uploads/Test_Discharge_Summary.pdf'
    );

    expect(response.body.mime_type).toBe(
      'application/pdf'
    );
  });


  // Verify that a clinical document ID that does not exist
  // returns the expected 404 response.
  test('returns 404 when the requested clinical document does not exist', async () => {
    const response = await request(app)
      .get('/clinical-documents/document/999999');

    expect(response.status).toBe(404);

    expect(response.body.error).toBe(
      'Clinical document not found'
    );
  });


  // Remove all clinical-document records and patients created
  // specifically for this test suite, then close the DB pool.
  afterAll(async () => {
    await pool.query(
      `
      DELETE FROM clinical_documents
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