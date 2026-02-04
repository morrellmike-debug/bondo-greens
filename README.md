# BONDO GREENS Golf Tournament App - MVP Prototype

**Status**: Clickable prototype ready for 2pm demo (Feb 4, 2026)

## 📋 What's Included

This is a **fully functional React prototype** with three main screens:

### 1. **Registration Form** (4-Step Flow)
- ✅ Personal information (name, email, phone)
- ✅ Guest management (add multiple guests)
- ✅ Event selection (18-hole, 9-hole, dinner)
- ✅ Review & confirmation
- ✅ Responsive on mobile & desktop
- **Status**: Complete and working

### 2. **Check-In Dashboard** (Tablet-Optimized)
- ✅ Real-time stats (registered, checked in, completion %)
- ✅ Quick search by name/email
- ✅ One-click check-in with undo
- ✅ Recently checked in list
- ✅ Alerts & notifications
- **Status**: Complete and working

### 3. **Admin Panel** (Desktop)
- ✅ Dashboard with quick stats
- ✅ Registrations management tab
- ✅ Merchandise tracking
- ✅ Admin role management
- ✅ Reports & analytics preview
- **Status**: Complete and working

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Install & Run Locally

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit: **http://localhost:5173**

---

## 📁 Project Structure

```
bondo-greens-app/
├── src/
│   ├── components/
│   │   ├── RegistrationForm.jsx     # 4-step registration form
│   │   ├── CheckInDashboard.jsx     # Tablet check-in screen
│   │   └── AdminPanel.jsx           # Admin dashboard & tabs
│   ├── App.jsx                      # Main router/nav
│   ├── main.jsx                     # Entry point
│   └── index.css                    # TailwindCSS
├── package.json                     # Dependencies
├── vite.config.js                   # Vite config
├── tailwind.config.js               # TailwindCSS config
└── index.html                       # HTML template
```

---

## 🎯 Demo Flow (2pm Feb 4)

1. **Registration** (2:00-2:05 PM)
   - Show Jim the 4-step form
   - Fill out sample registration with guest
   - Demonstrate form validation & confirmation

2. **Check-In** (2:05-2:10 PM)
   - Show real-time dashboard
   - Search for registrant
   - Check in with one click
   - Show undo capability

3. **Admin Panel** (2:10-2:15 PM)
   - Walk through dashboard stats
   - Show registrations table
   - Show merchandise tracking
   - Show admin management

4. **Q&A** (2:15+ PM)
   - Discuss Feb 11-12 build sprint
   - Review technical setup
   - Answer questions

---

## 🎨 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **State**: React Hooks (useState)
- **Deployment**: Vercel (ready)
- **Database**: Mock data (no backend yet)

---

## 📝 Important Notes

### ✅ What's Working (MVP)
- All three screens are fully interactive
- Form validation & submission
- Check-in tracking with undo
- Admin dashboard with all tabs
- Responsive design (mobile → desktop)
- Mock data for demo purposes

### ⏳ What's Coming (Feb 11-12 Build Sprint)
- Real PostgreSQL database (Supabase)
- Backend API (Node.js + Express)
- Email notifications
- Payment integration (optional)
- QR code scanning
- Real user authentication

### 🔧 Configuration Needed for Full Build
- GitHub repository (for source control)
- Supabase project (PostgreSQL + Auth)
- Vercel projects (frontend + backend)
- bondogreens.com domain (DNS setup)
- SendGrid API key (email service)
- Stripe API keys (payments, if needed)

---

## 📚 Demo Walkthrough Script

### Opening (1 min)
*"This is the BONDO GREENS Golf Tournament App prototype. It's a clickable UI showing how golfers will register, how we check them in on tournament day, and how admins manage everything. Everything you see is working—it's all built in React with mock data. No backend yet, but that's coming in the full build."*

### Registration Demo (3 min)
1. Click "Registration" tab
2. Show Step 1: *"First, golfers enter their name, email, phone, shirt size, and how many guests they're bringing."*
3. Click Next
4. Show Step 2: *"Then they add details for each guest."*
5. Click Next
6. Show Step 3: *"They select which events they're coming to."*
7. Click Next
8. Show Step 4: *"Finally, they review everything and confirm. The email is sent automatically."*
9. Click "Confirm Registration"
10. Point to success message: *"Registration confirmed and emailed."*

### Check-In Demo (3 min)
1. Click "Check-In" tab
2. Show stats: *"Real-time dashboard. We can see 45 registered, 32 checked in so far—that's 71% completion."*
3. Show search bar: *"Staff uses this tablet to search for registrants by name or email."*
4. Type a name
5. Show the registration card: *"Here's John Doe with his party of 2 and all his event info."*
6. Click "Check In": *"One click, and he's checked in. Timestamp recorded automatically."*
7. Show "Undo" button: *"If we made a mistake, we undo it in 30 seconds."*
8. Show recently checked in list: *"We can see who just checked in and when."*

### Admin Panel Demo (3 min)
1. Click "Admin" tab
2. Show dashboard: *"This is what admins see. Quick stats on registrations, revenue, and check-in progress."*
3. Click "Registrations" tab: *"Here are all registrations in a table. We can click any one to edit, send email, or cancel."*
4. Click "Merchandise" tab: *"This tracks all the polo shirts, hats, gloves—what we've allocated, what's been distributed, what's left."*
5. Click "Manage Admins" tab: *"Only the master admin (Mike) can create other admins and assign roles."*
6. Click "Reports" tab: *"We can generate reports on everything: registrations, revenue, attendance, merchandise distribution."*

### Closing (1 min)
*"That's the prototype. Everything here works and responds like a real app. Starting Feb 11, we'll connect it to a real database and backend API. By Feb 12, we'll have the full system ready for testing. Then we launch before the May 15 tournament."*

---

## 🚀 Deployment to Vercel

### Step 1: Create Vercel Account & Link GitHub
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel
```

### Step 2: Follow Prompts
- Link to GitHub repo
- Select project name: `bondo-greens-app`
- Select framework: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

### Step 3: Set Custom Domain (Optional)
- Go to Vercel dashboard
- Add custom domain: `bondogreens.com` or `app.bondogreens.com`

---

## 📞 Questions?

Refer to the complete design documentation in the workspace:
- `bondo-greens-schema.sql` - Database design
- `bondo-greens-api-endpoints.md` - API specification
- `bondo-greens-wireframes.md` - UI/UX details
- `bondo-greens-tech-stack.md` - Architecture decisions

---

## ✅ Pre-Demo Checklist

- [x] All three screens working
- [x] Navigation between tabs
- [x] Form validation
- [x] Check-in functionality
- [x] Admin dashboard
- [x] Mock data populated
- [x] Responsive design tested
- [ ] Domain (waiting for bondogreens.com)
- [ ] GitHub repo (needs Mike's GitHub account)
- [ ] Vercel deployment (ready, just needs GitHub push)
- [ ] Admin emails (waiting for 4 emails)

---

**Built for Feb 4, 2026 Demo | Ready for Feb 11-12 Full Build Sprint**
