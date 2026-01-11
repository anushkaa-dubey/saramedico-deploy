# SaraMedico Frontend

Healthcare platform frontend built with Next.js (App Router) supporting both Patient and Admin dashboards.

## Demo Login (For Testing)

**Patient Dashboard:**
- Email: test@saramedico.com
- Password: 123456
- 2FA Code: 123456

**Admin Dashboard:**
- Email: admin@saramedico.com
- Password: admin123

*(These are dummy credentials for UI testing only.)*

## Project Structure

```
app/
├── layout.jsx                          # Root layout
├── page.tsx                            # Home page
├── globals.css                         # Global styles
│
├── auth/                               # Authentication pages
│   ├── login/
│   │   └── page.jsx                   # Patient login
│   ├── signup/
│   │   └── page.tsx                   # Patient signup
│   ├── 2fa/                           # Two-factor authentication
│   │   ├── login/
│   │   │   └── page.jsx               # 2FA login verification
│   │   └── signup/
│   │       └── page.jsx               # 2FA signup setup
│   └── components/
│       ├── AuthLayout.jsx             # Shared auth layout
│       ├── LoginForm.jsx              # Login form component
│       └── SignupForm.jsx             # Signup form component
│
├── dashboard/
│   ├── admin/                         # Admin dashboard
│   │   ├── page.jsx                   # Admin home
│   │   ├── AdminDashboard.module.css  # Admin styles
│   │   │
│   │   └── manage-accounts/           # Account management
│   │       ├── page.jsx               # Manage accounts page
│   │       ├── ManageAccounts.module.css
│   │       │
│   │       └── invite/                # Invite team members
│   │           ├── page.jsx           # Invite form page
│   │           └── InvitePage.module.css
│   │
│   └── patient/                       # Patient dashboard
│       ├── page.jsx                   # Patient home
│       ├── PatientDashboard.module.css # Patient styles
│       │
│       ├── audio-check/               # Audio calibration
│       │   ├── page.jsx               # Audio check page
│       │   └── AudioCheck.module.css
│       │
│       ├── records/                   # Medical records
│       │   ├── page.jsx               # Records listing
│       │   ├── Records.module.css
│       │   └── components/
│       │       └── RecordsTable.jsx
│       │
│       └── components/                # Patient dashboard components
│           ├── Sidebar.jsx            # Navigation sidebar
│           ├── Topbar.jsx             # Top navigation
│           ├── UpNextCard.jsx         # Upcoming appointments
│           ├── Vitals.jsx             # Vital signs display
│           ├── RecentActivity.jsx     # Activity log
│           └── QuickActions.jsx       # Action shortcuts
│
public/
├── logo.png                           # SaraMedico logo
└── icons/                             # SVG icons
    ├── dashboard.svg                  # Dashboard icon
    ├── mic.svg                        # Microphone icon
    ├── manage.svg                     # Manage icon
    ├── messages.svg                   # Messages icon
    └── settings.svg                   # Settings icon

eslint.config.mjs
next.config.ts
next-env.d.ts
package.json
postcss.config.mjs
tsconfig.json
```

## Key Features

### Patient Dashboard
- Appointment management
- Medical records access
- Vital signs tracking
- Audio calibration for appointments
- Quick actions for common tasks
- Recent activity feed

### Admin Dashboard
- User account management
- Team member invitations
- System overview
- User status monitoring
- Account management interface

## Technology Stack

- **Framework:** Next.js 16+ (App Router)
- **Styling:** CSS Modules
- **Language:** JavaScript/TypeScript
- **Authentication:** 2-Factor Authentication (2FA)

## Design System

### Colors
- **Primary Gradient:** `#359AFF` to `#9CCDFF`
- **Background:** `#f8fafc` (main), `#ffffff` (cards)
- **Borders:** `#eef2f7`
- **Text:** `#0f172a` (primary), `#64748b` (secondary)

### Responsive Breakpoints
- **Desktop:** 1024px+
- **Tablet:** 769px - 1024px
- **Mobile:** ≤768px
- **Small Mobile:** ≤480px

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

The project uses Next.js App Router with server and client components. Styling is handled through CSS Modules for scoped styling and to prevent style conflicts.

### Key Files to Edit
- `app/page.tsx` - Home page
- `app/dashboard/patient/page.jsx` - Patient dashboard
- `app/dashboard/admin/page.jsx` - Admin dashboard
- `app/auth/login/page.jsx` - Login page

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)

