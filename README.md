# Pashu Drishti

Pashu Drishti is a full-stack digital livestock management platform for farms, veterinarians, district officers, and administrators. It supports farm registration, animal records, MRL testing, antimicrobial usage tracking, RFID/QR traceability, analytics, and role-based dashboards.

## Features

- Farm registration and farm profile management
- Animal registration, detail views, vaccination history, QR generation, and RFID assignment
- MRL residue testing and failed-test corrective actions
- AMR antimicrobial usage tracking with withdrawal-period monitoring
- Scan history for RFID and animal traceability
- Role-based dashboards for farmers, veterinarians, district officers, state officers, and admins
- Public pages such as About, Contact, Privacy, and Terms
- Live platform summary and farm insights
- Unique Pashu Drishti branding and logo across the app

## Tech Stack

- Backend: Java 17, Spring Boot 3.5, Spring Security, MongoDB, JWT, SpringDoc OpenAPI, ZXing
- Frontend: React 19, Vite, React Router, Axios, Tailwind CSS, Recharts, lucide-react, html5-qrcode

## Repository Structure

- `backend/` Spring Boot API and MongoDB models/services/controllers
- `frontend/` React application and UI pages
- `README.md` Project overview and setup guide

## Prerequisites

- Java 17
- Maven 3.9+
- Node.js 18+ and npm
- MongoDB running locally

## Backend Setup

1. Open a terminal in the repository root.
2. Start MongoDB locally. The app expects:
```properties
mongodb://localhost:27017/farmportal?replicaSet=rs0&directConnection=true
```
3. Run the backend:
```powershell
cd backend
mvn spring-boot:run
```

The backend runs on:
- `http://localhost:8080`
- API base path: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`

## Frontend Setup

1. Open a second terminal in the repository root.
2. Install dependencies:
```powershell
cd frontend
npm install
```
3. Start the frontend:
```powershell
npm run dev
```

The frontend usually runs on:
- `http://localhost:5173`

## Demo Accounts

The app seeds demo data on startup.

- `vet_demo` / `Vet@12345`
- `district_demo` / `District@123`
- `state_demo` / `State@12345`
- `farmer_demo` / `Farmer@123`
- `superadmin` / `Admin@12345`

## Main Workflows

- Register a farm from the Farms section
- Register an animal and assign it to a farm
- Open an animal detail page to update health, assign RFID, generate QR, and record vaccinations
- Create MRL tests and review failed residue cases
- Record AMR usage and track withdrawal periods
- Use the Scan page to log RFID scans
- Review analytics and role-specific dashboards

## API Highlights

The backend exposes these main areas:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/farms`
- `GET /api/v1/animals`
- `GET /api/v1/mrl-tests`
- `GET /api/v1/antimicrobial`
- `POST /api/v1/rfid/scan`
- `GET /api/v1/admin/dashboard`

## Configuration

Backend configuration lives in:
- `backend/src/main/resources/application.properties`

Key settings:

- MongoDB connection
- JWT secret and token expiry
- Server port
- Context path `/api/v1`

## Build Commands

Backend:
```powershell
cd backend
mvn -q -DskipTests compile
```

Frontend:
```powershell
cd frontend
npm run build
```

## Notes

- The app includes seeded demo data for quick testing.
- Some pages depend on role-based access, so sign in with the right demo account before testing them.
- If you change the MongoDB database name or URI, update `application.properties` before starting the backend.

## License

No license has been declared yet.
