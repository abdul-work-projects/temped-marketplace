# TempEd MVP - Temporary Teaching Placement Platform

A full-stack web application connecting teachers with schools for short-term teaching placements in South Africa.

## 🎯 Features

### Authentication
- ✅ Email/password login and signup
- ✅ Google OAuth (mocked for demo)
- ✅ Separate account types for Teachers and Schools
- ✅ Session management with localStorage

### Teacher Features
- ✅ Complete profile setup with progress tracking
- ✅ Profile includes: name, description, education phase, subjects, location, ID number
- ✅ View available job postings
- ✅ Distance calculation from teacher to school locations
- ✅ Apply to jobs
- ✅ Track application status (Applied, In Progress, Hired, Closed)
- ✅ Public profile view for schools
- ✅ Dashboard with sidebar navigation

### School Features
- ✅ Complete school profile setup
- ✅ Profile includes: name, description, EMIS number, school type, curriculum, location
- ✅ Create job postings with details:
  - Job title, description, subject
  - Education phase and required qualifications
  - Start/end dates and application deadline
  - Urgent tag option
- ✅ View all job postings and applications
- ✅ View applicant profiles
- ✅ Shortlist candidates
- ✅ Update application status
- ✅ Dashboard with sidebar navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm package manager

### Installation

1. The project is already initialized in the current directory

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000 (or the port shown in terminal)
```

## 👤 Demo Accounts

### Teachers
- **sarah.johnson@gmail.com** - Mathematics & Physical Science (100% complete)
- **michael.peters@gmail.com** - English & Drama teacher
- **thandi.mkhize@gmail.com** - Foundation Phase teacher

### Schools
- **greenvalley@school.za** - Green Valley High School (has job postings)
- **sunnyside@school.za** - Sunnyside Primary
- **capetown.high@school.za** - Cape Town International College

**Password**: Use any password for demo

## 🛠 Technology Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Form Handling**: React Hook Form, Zod
- **Data Management**: React Context API
- **Storage**: localStorage (mock database for demo)

## 📁 Project Structure

```
temped-mvp/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── teacher/           # Teacher dashboard & features
│   └── school/            # School dashboard & features
├── components/
│   └── shared/            # Reusable UI components
├── lib/
│   ├── context/           # React Context providers
│   ├── data/              # Mock data
│   └── utils/             # Utility functions
└── types/                 # TypeScript definitions
```

## 🎨 Features Demonstrated

This MVP demonstrates:

1. **Two-sided marketplace** - Separate interfaces for teachers and schools
2. **Profile management** - Complete setup flows with progress tracking
3. **Job posting & application** - Full CRUD operations
4. **Application tracking** - Status management and shortlisting
5. **Distance calculation** - Location-based job matching
6. **Clean UI/UX** - Professional, usability-focused design
7. **Type-safe code** - Full TypeScript coverage
8. **Scalable architecture** - Easy to extend with real database

## 📝 Notes for Production

This demo uses mock data and localStorage. For production:

- Replace Context API with API routes
- Add database integration (e.g., Supabase/PostgreSQL)
- Implement real file uploads (Cloudinary/S3)
- Add proper authentication (NextAuth.js)
- Implement Google Maps for distance calculation
- Add email notifications
- Implement payment processing
- Add review/rating system

## 📄 License

Demo MVP for TempEd platform
