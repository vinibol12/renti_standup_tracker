# Standup Tracker

A simple web application for tracking daily standup updates within a team.

Offers basic functionality to:

- Team member to entry their daily stand up. 
- Allows members to edit their already entered stand up.
- Limits users to one stand up entry per day.
- Allows users to view their own standup history.
- Allows team members to view the most recent standup entries for each team member.

## Authentication

- Does not implement proper authentication. 
- Login only requires the username.
- Sign up 
   - does not require password
   - checks if user exists by username or email and shows error message if user does
- Scopes the data to the current user tracking by userId stored in localStorage


## Technology Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- React Router for navigation
- Shadcn UI components
- Tailwind CSS for styling

### Backend
- Node.js with Express
- MongoDB for data storage
- RESTful API endpoints

## Setup and Development

### Prerequisites
- Node.js (v18+)
- MongoDB

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Deployment to Railway

This project is configured to deploy both frontend and backend to Railway using GitHub Actions.

App is deployed at [https://frontend-production-b6c4.up.railway.app/daily](https://frontend-production-b6c4.up.railway.app/daily)


## Project Structure

Project uses an MVC structure in the backend. 
Adds some level of model validation to remove logic from controllers.
Exposes validation errors to the frontend by attribute allowing field-specific error messages.

Typescript enforcement is not as strict in the frontend around react components. 

## Notes

- Happy to discuss the validation duplication in the controllers and models. End goal would be to fully move the validation to the models implementing some validation middleware. Hopefully this will be a good conversation starter. 
