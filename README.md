# Electronic Medical Record (EMR) Workflow Prototype

## Overview

This project is a full-stack Electronic Medical Record (EMR) prototype built using React, Node.js, Express, and PostgreSQL.

Rather than recreating a traditional CRUD application, the project focuses on solving a specific clinician workflow problem encountered in home health and outpatient documentation.

Many current EMR systems restrict clinicians to a single active patient chart, encouraging unsafe workarounds such as photographing medication lists or repeatedly switching between patient records and historical documentation. This prototype explores an alternative workflow that allows multiple windows for the same patient while preventing simultaneous access to different patient charts.

---

## Problem

Current clinician workflows often require referencing multiple documents while documenting patient care.

Examples include:

- Reviewing previous notes while writing a new note.
- Performing medication reconciliation using an external medication list.
- Switching repeatedly between documentation screens.

These limitations reduce efficiency and increase the risk of documenting in the wrong patient's chart.

---

## Solution

The application is designed around a patient-centered workspace.

Current functionality allows clinicians to:

- Browse a patient directory.
- Open a dedicated patient workspace.
- View appointments and clinical notes for the selected patient.
- Open individual notes in separate windows while maintaining patient identification.
- Retrieve only patient-specific records from the database.

Future work will restrict concurrent viewing of different patient charts while allowing multiple windows for the same patient.

---

## Features

### Implemented

- Patient directory
- Dedicated patient workspace
- Patient-specific appointment retrieval
- Patient-specific note retrieval
- Toggle between appointments and notes
- Individual note viewer
- Sticky patient identification header
- Multiple note windows for the selected patient
- React frontend with Express REST API and PostgreSQL backend

### In Progress

- Appointment calendar
- Note authoring and signing workflow
- Patient profile page

### Planned

- Medication reconciliation workflow
- Medication source document viewer
- Cross-patient access restrictions
- Authentication and user roles

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express

### Database

- PostgreSQL

---

## Database Schema

### patient_info

- patient_id (PK)
- fname
- lname
- dob
- phone

### notes

- note_id (PK)
- patient_id (FK)
- content
- created_at
- signed_therapist

### appointments

- appointment_id (PK)
- patient_id (FK)
- scheduled_date
- scheduled_time
- signed_therapist

---

## Architecture

```text
React Frontend
        │
HTTP Requests
        │
Express REST API
        │
PostgreSQL
        │
JSON Response
        │
React UI
```

---

## Future Direction

The long-term goal is not to build a production EMR, but to demonstrate thoughtful software design around a real healthcare workflow problem.

Future development will focus on:

- Safe concurrent documentation
- Medication reconciliation
- Multi-window workflow for a single patient
- Preventing simultaneous access to different patient charts

---

## Screenshots

(Add later...)

---

## Running Locally

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm start
```

Frontend:
http://localhost:5173

Backend:
http://localhost:3001

---

## Author

Ryan Dailey

- B.S. Computer Science
- Doctor of Physical Therapy
- Software Engineering & Product Management