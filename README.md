# Trading Dashboard

A fully local, free web application featuring a trading journal, analytics, and a modern dashboard UI.

## Features

- **Trading Journal**: Log and track your trades with detailed entry/exit data
- **Analytics Dashboard**: Visualize your performance with equity curves, win/loss charts, and monthly breakdowns
- **Dark/Light Mode**: Switch between themes for comfortable viewing
- **CSV Export**: Export your trade history for external analysis
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express + SQLite3 + JWT
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone or download the project:
```bash
cd trading-dashboard
```

2. Install all dependencies:
```bash
npm run install:all
```

Or install separately:
```bash
# Root dependencies
npm install

# Backend dependencies
cd server && npm install

# Frontend dependencies
cd ../client && npm install
```

3. Create environment file (optional):
```bash
cp .env.example .env
```

### Running the Application

**Development mode (runs both frontend and backend):**
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend (port 5000)
npm run server

# Terminal 2 - Frontend (port 5173)
npm run client
```

### Accessing the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Usage

1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Dashboard**: View your trading overview and quick stats
4. **Journal**: Add, edit, and delete trades
5. **Analytics**: See detailed performance charts
6. **Trade History**: View all trades in a table with filters
7. **Settings**: Update your profile and theme preferences

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### User
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile

### Trades
- `GET /api/trades` - List trades
- `POST /api/trades` - Create trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade
- `GET /api/trades/export` - Export CSV

### Analytics
- `GET /api/analytics/summary` - Performance summary
- `GET /api/analytics/equity` - Equity curve data
- `GET /api/analytics/monthly` - Monthly breakdown

## Database

The app uses SQLite for data storage. The database file is automatically created at `server/data/trading.db` on first run.

## Project Structure

```
trading-dashboard/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   └── ...
├── server/                 # Express Backend
│   ├── config/             # Database config
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API routes
│   ├── models/             # Database init
│   └── index.js            # Entry point
└── package.json            # Root scripts
```

## License

This project is open source and available for personal use.
