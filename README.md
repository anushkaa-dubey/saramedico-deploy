# SaraMedico Frontend

Patient-side frontend built with Next.js (App Router) for the SaraMedico healthcare platform.

## Demo Login (For Testing)

Email: test@saramedico.com  
Password: 123456  
2FA Code: 123456  

(These are dummy credentials for UI testing only.)

## Project Structure

app/
├── layout.jsx
├── page.jsx
│
├── auth/
│   ├── login/
│   │   └── page.jsx
│   ├── signup/
│   │   └── page.jsx
│   ├── 2fa/
│   │   ├── login/
│   │   │   └── page.jsx
│   │   └── signup/
│   │       └── page.jsx
│   └── components/
│       ├── LoginForm.jsx
│       ├── SignupForm.jsx
│       └── TwoFactorForm.jsx
│
├── dashboard/
│   └── patient/
│       ├── page.jsx
│       ├── PatientDashboard.module.css
│       │
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── Topbar.jsx
│       │   ├── UpNextCard.jsx
│       │   ├── Vitals.jsx
│       │   ├── RecentActivity.jsx
│       │   └── QuickActions.jsx
│       │
│       └── records/
│           ├── page.jsx
│           ├── Records.module.css
│           └── components/
│               └── RecordsTable.jsx
│
public/
├── icons/
│   ├── home.svg
│   ├── mic.svg
│   ├── chat.svg
│   ├── message.svg
│   └── saramedico.svg
│
└── favicon.ico
│
styles/
└── globals.css


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

