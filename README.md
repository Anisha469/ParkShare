# ParkShare

ParkShare is a full-stack parking-sharing web application that allows users to discover available parking spaces, book parking slots, and list their own parking spaces for others.

## Features

- User registration and login
- Secure password hashing using bcrypt
- Search parking spaces by name or location
- Check parking availability
- Book parking spaces for a selected date and time
- Prevent duplicate bookings for the same parking space, date, and time
- View personal bookings
- Cancel bookings
- List personal parking spaces
- Edit and delete owned parking spaces
- Ownership-based authorization
- Frontend and backend form validation
- Persistent database storage using SQLite and Prisma

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- TypeScript
- REST APIs
- CORS

### Database
- SQLite
- Prisma ORM

### Security
- bcrypt password hashing
- Ownership validation
- Duplicate booking prevention
- Server-side input validation

## Project Structure

```text
ParkShare/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ParkingCard.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   └── server.ts
│   ├── prisma.config.ts
│   ├── .env
│   └── package.json
│
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd ParkShare
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

### 4. Configure the database

Create a `.env` file inside the `server` folder:

```env
DATABASE_URL="file:./dev.db"
```

### 5. Run Prisma migrations

Inside the `server` folder, run:

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Start the backend

```bash
npx tsx src/server.ts
```

The backend will run at:

```text
http://localhost:5000
```

### 7. Start the frontend

Inside the `client` folder, run:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login an existing user |
| GET | `/api/parking-spaces` | Get all parking spaces |
| POST | `/api/parking-spaces` | List a new parking space |
| GET | `/api/my-parking-spaces` | Get parking spaces owned by a user |
| PUT | `/api/parking-spaces/:id` | Update an owned parking space |
| DELETE | `/api/parking-spaces/:id` | Delete an owned parking space |
| GET | `/api/bookings` | Get user bookings |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/check` | Check booking availability |
| DELETE | `/api/bookings/:id` | Cancel a booking |

## Database Design

The application uses three main models:

- `User`
- `ParkingSpace`
- `Booking`

A user can own multiple parking spaces and create multiple bookings. Each booking is connected to a specific parking space and user.

A composite unique constraint prevents two bookings for the same parking space, date, and time.

## Future Improvements

- JWT-based authentication
- Google Maps integration
- Parking-space images
- Ratings and reviews
- Email notifications
- Payment integration
- Deployment using Render, Railway, or Vercel

## Author

Anisha