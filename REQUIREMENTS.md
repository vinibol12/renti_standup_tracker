# Renti Take-Home Project: Checkpoint – A Daily Standup Tracker

## 📌 Overview

Build **Checkpoint**, a lightweight tool that helps teams track their daily standups asynchronously.

The app should let team members log:
- What they did yesterday
- What they plan to do today
- Any blockers they're facing

This project is about clean implementation, intuitive UX, and solid full-stack fundamentals. Keep the scope tight but thoughtful.

---

## 🧰 Feature Requirements

### 1. User Accounts
- Sign up / log in / log out
- Can be mocked (e.g., assume one user) or implemented with JWT/session auth

### 2. Daily Updates
- One standup entry per user per day
- Fields: `yesterday`, `today`, `blockers`
- Ability to edit the current day's standup

### 3. Team View
- Display the most recent standup from each team member
- Optional filters: by date or user
- Optional: Visual indicators (colour, profile pic) on entries to quickly see what user each entry belongs to

### 4. History View
- Let users view their previous standups
- Filter or sort by date

---

## 🛠️ Tech Stack

Front end: React with TypeScript
Backend: 
Node JS with TypeScript and Express JS. 

Database 
MongoDB - mongoose as ODM

API Style
- trpc

Authentication
- JWT - Passport

---

## 🧪 Nice-to-Haves (Optional)

- Markdown support in standup entries
- Daily reminder UI (e.g., “You haven’t submitted today’s standup”)
- Weekly summary
- Mobile-optimized or dark mode interface
- Live deployed version
- CI/CD processes set up

---

## 📦 Deliverables

- A public GitHub repository with:
  - Clear, modular code
  - A README with setup instructions and technical rationale
- We'll deploy this application to Railway. Add support to run the application locally and in Railway configuring secrets in environment variables. 

---

## ✅ Evaluation Criteria

- **Functionality**: Are the main features implemented and usable?
- **Code Quality**: Clean, idiomatic code with attention to structure
- **Architecture**: Logical, modular, and testable codebase
- **Unit Testing**: You should be including a test suite including meaningful unit tests. While there is no coverage requirement, you should be able to justify tested and non-tested code
- **UX/UI**: Is the product intuitive and visually clean?
- **Documentation**: Clear instructions and overview. These should include directions to the hosted application, as well as instructions for running the application locally.

---