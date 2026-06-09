# Online Learning Platform

Full-stack online learning platform with Express.js backend and React Native Expo frontend.

## Project Structure

```
├── backend/          # Express.js + MongoDB API
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/    # Auth, error handling
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   └── utils/        # Helpers
│   └── seeds/        # Database seed data
│
└── frontend/         # React Native Expo app
    └── src/
        ├── components/   # Reusable components
        ├── context/      # Auth state
        ├── navigation/   # App navigation
        ├── screens/      # App screens
        ├── services/     # API client
        └── theme/        # Colors/styles
```

## Tech Stack

- **Backend:** Express.js, MongoDB, Mongoose, JWT
- **Frontend:** React Native, Expo SDK 54, React Navigation

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/courses | List courses |
| POST | /api/enrollments | Enroll in course |
| POST | /api/lessons/:id/progress | Update progress |
