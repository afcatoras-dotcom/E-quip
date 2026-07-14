# E-quip

**Campus Laboratory Equipment Monitoring System**

E-quip is a web-based laboratory equipment monitoring and management system developed for the Computer Engineering and Electronics/Electrical Engineering laboratories of FEU Institute of Technology. The system streamlines equipment inventory, borrowing and returns, maintenance tracking, user management, and reporting through a centralized platform with role-based access control.

---

## Features

- Secure user authentication
- Role-based access control
- Equipment inventory management
- Equipment borrowing and returns
- Maintenance monitoring
- User management
- Inventory analytics and reports
- Laboratory suggestion box
- Responsive modern interface

---

## Technologies Used

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React
- Recharts

### Backend
- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)

### Deployment
- GitHub
- Vercel

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Administrator** | Full system access including user management, reports, equipment, maintenance, borrowing, and returns. |
| **Laboratory Technician** | Equipment management, borrowing, returns, maintenance, and reports. |
| **Faculty** | Borrow and return own equipment, view inventory, and submit suggestions. |
| **Student** | Borrow and return own equipment, view inventory, and submit suggestions. |

---

## Installation

Clone the repository:

```bash
git clone https://github.com/afcatoras-dotcom/E-quip.git
```

Navigate to the project folder:

```bash
cd E-quip
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## Project Structure

```
E-quip
│
├── src
│   ├── components
│   ├── layouts
│   ├── pages
│   ├── routes
│   ├── lib
│   └── assets
│
├── public
├── package.json
├── vite.config.ts
└── README.md
```

---

## Modules

- Login
- Dashboard
- Equipment Management
- Borrowing
- Returns
- Maintenance
- Reports
- User Management
- Suggestions
- Settings

---

## Developers

### Angelbert F. Catoras
**Lead Developer**
- Full Stack Development
- Database Design
- Authentication
- Deployment
- UI/UX Design
- Presentation
- Project Initiation

### Denyce Maryll F. Soria
- PowerPoint Presentation
- Quality Assurance
- Video Presentation
- Project Initiation

### Arnold Brian Eustaquio
- Database
- Documentation
- Presentation
- Quality Assurance

### Diosdado Jr. Bancoro
- Database
- Presentation

### Raenard Christ B. Ensorio
- Presentation

### Marc Justine Esquivel
- Presentation

---

## Developed For

**FEU Institute of Technology**

Bachelor of Science in Computer Engineering

Software Design Project

Academic Year 2025–2026

---

## License

This project was developed for academic purposes as part of the Software Design course at FEU Institute of Technology.
