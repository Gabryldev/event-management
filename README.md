# Stagepass — Event Management Platform

Full-stack event management platform: organizers create events and upload flyers,
users buy tickets and get QR-code tickets by email, admins approve events, and
everyone gets analytics. Built with Node/Express + MongoDB on the backend and
React (Vite + Tailwind) on the frontend.

## Features

- **Authentication** — JWT-based, roles: `user`, `organizer`, `admin`
- **Event creation** — organizers create events with flyer image upload
- **Admin approval** — events start `pending`, admin approves/rejects (with email notice)
- **Ticket purchase** — supports both:
  - **General admission** (capacity counter, buy multiple at once)
  - **Assigned seating** (interactive seat map, atomic per-seat reservation to prevent double-booking)
- **QR code tickets** — generated per ticket, emailed as an attachment, and shown in-app
- **Email confirmation** — ticket purchase & event approval/rejection emails (via nodemailer)
- **Attendance check-in** — organizers scan a ticket's QR (camera, via the browser's native
  BarcodeDetector where supported) or type the code manually to register attendance
- **Analytics** — per-event stats (sales, revenue, attendance rate, sales-over-time chart),
  organizer-wide rollup, and platform-wide admin stats

## Project structure

```
event-platform/
  backend/     Express API (MongoDB via Mongoose)
  frontend/    React app (Vite + Tailwind)
```

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env      # then edit .env with your Mongo URI, JWT secret, SMTP creds
npm install
npm run seed:admin        # creates an admin user from ADMIN_EMAIL / ADMIN_PASSWORD in .env
npm run dev                # starts on http://localhost:5000
```

You'll need a running MongoDB instance — either local (`mongodb://127.0.0.1:27017/event_platform`)
or a hosted one (e.g. MongoDB Atlas — just paste its connection string into `MONGO_URI`).

For email, the easiest way to test locally is [Ethereal](https://ethereal.email/) (fake SMTP,
lets you view sent emails in a browser) or [Mailtrap](https://mailtrap.io/). Put the credentials
in `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`. If email sending fails, it's logged but won't
break ticket purchases or event approvals — it's fire-and-forget.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`, so just run
both servers side by side and open http://localhost:5173.

### 3. Try it out

1. Register as an **organizer** (choose "Organize events" at sign-up)
2. Create an event — upload a flyer, choose general admission or assigned seats
3. Log in as the seeded **admin** account, go to `/admin`, approve the event
4. Register a second account as a **user**, buy a ticket — you'll get a QR code on-screen
   and (if SMTP is configured) by email
5. Log back in as the organizer, go to **Check-in**, and scan/paste the ticket code to
   register attendance
6. Check **My Events → Analytics** as the organizer to see sales & attendance stats

## Notes on design decisions

- **Seat reservation concurrency**: both general-admission and assigned-seat purchases use
  MongoDB atomic `findOneAndUpdate` operations with a condition on current availability, so
  two people can't buy the same seat or overshoot capacity even under concurrent requests.
- **QR codes**: each ticket gets a UUID `ticketCode`; the QR encodes that code as JSON. In
  production you'd want to HMAC-sign the payload so tickets can't be forged — noted as a
  possible improvement.
- **Re-approval on edit**: if an organizer edits an already-approved event, it's automatically
  sent back to `pending` so admins can review the change.
- **File storage**: flyers are stored on local disk under `backend/uploads/flyers` and served
  statically. For production/multi-server deployments, swap this for S3 or similar (the
  `middleware/upload.js` file is the only place that would need to change).

## Environment variables (backend/.env)

See `.env.example` for the full list — MongoDB URI, JWT secret, SMTP credentials, and the
default admin's email/password used by `npm run seed:admin`.
