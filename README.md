# 🏠 RentRadar - Smart Rental Finder

> **Copyright © Faith Wanjiru 2025. All rights reserved.**
> 
> This project is proprietary and not open source. Do not copy, use, or redistribute any part of this codebase without explicit permission from the author. For collaboration or usage rights, contact me (see below). See LICENSE for details.

A comprehensive rental platform that helps budget-conscious tenants find their perfect home with smart filtering, location-based search, agent services, and more.

---

## 🚀 Project Overview
RentRadar is a full-stack web app for discovering, booking, and managing rental properties in Kenya. It features smart search, interactive maps, agent and booking systems, reviews, notifications, and more.

**Live Demo:** [https://rentradar254.netlify.app/](https://rentradar254.netlify.app/)

**Tech Stack:**
- **Frontend:** React, Tailwind CSS, Vite, Google Maps API, Formik, Yup, Axios
- **Backend:** Express.js, Node.js, MongoDB, JWT, Multer

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Google Maps API key (see below)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rent-radar
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd client && npm install
   # Backend
   cd ../server && npm install
   ```

3. **Environment setup**
   - In `server/.env`:
     ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/rent-radar
   JWT_SECRET=your_jwt_secret
     ```
   - In `client/.env`:
     ```env
     VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Start development servers**
   ```bash
   # Backend
   cd server && npm run dev
   # Frontend (in new terminal)
   cd client && npm run dev
   ```

---

## ✨ Core Features
- Smart search & filtering (location, budget, amenities)
- Interactive map with listings, contributions, and landmarks
- User authentication (JWT)
- Agent registration & dashboard
- Booking system
- Favorites & profile management
- Reviews & ratings
- Notifications (in-app, email)
- Admin dashboard (user/listing/contribution management, analytics)
- CSV export for admin data
- Responsive, modern UI

---

## 🔮 Planned & Future Features
- Advanced notifications (push, email, in-app improvements)
- M-PESA payment integration (full production flow)
- Admin dashboard enhancements (analytics, moderation tools)
- Gamification (badges, points, leaderboards)
- Advanced map features (heatmaps, drawing, more filters)
- Improved mobile UX/UI
- User-to-user messaging
- More granular search filters (amenities, neighborhoods, etc)
- Multi-language support
- Accessibility improvements
- Real-time chat/support
- More robust review and rating system
- AI-powered recommendations
- Virtual reality property tours
- Blockchain-based rental agreements
- Integration with utility companies
- Community features and reviews

> **Note:** Some features are in progress or will be updated in future releases. This list is evolving—contributions and ideas are welcome!

---

## 📁 Project Structure

```
rent-radar/
├── client/                 # Frontend (React + Tailwind)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── package.json
│   └── vite.config.js
├── server/                 # Backend (Express + MongoDB)
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Helper functions
│   ├── uploads/            # Image uploads
│   ├── .env
│   ├── index.js
│   └── package.json
└── README.md
```

---

## 🎨 Features in Detail

### Smart Search
- Location-based filtering (city, neighborhood, landmarks)
- Budget range selection
- Amenities filtering (water, power, WiFi, security)
- Property type selection
- Number of bedrooms/bathrooms

### Visual Experience
- High-quality property photos
- Virtual tours (future)
- Street view integration
- Neighborhood photos

### Location Services
- Interactive maps showing all listings
- Route planning from current location
- Distance calculations
- Public transport information

### Premium Services
- Verified local guides
- Property viewing appointments
- Detailed property reports
- Negotiation assistance

---

## 💰 Revenue Model
- Freemium: Basic search free, premium features paid
- Commission: Percentage from successful rentals
- Agent Fees: Commission from local guides
- Featured Listings: Promoted listings for landlords
- Advertising: Property management companies

---

## 📝 Notes
- Some features are in progress or will be updated in future releases.
- The feature list is evolving—feel free to suggest or contribute!

---

**Built with ❤️ for the Kenyan rental market** 

---

## 📺 Live Demo / How It Works

> Coming soon: A video walkthrough or live demo link will be added here to showcase the main features and user experience of RentRadar.

---

## 📸 Screenshots & Demo

> **Video Walkthrough:** [Watch the demo](#) (Coming soon!)
>
> _Screenshots coming soon!_

---

## ❓ Why RentRadar?

Finding a good house in Kenya is a real hustle—lots of toiling, wasted time, and uncertainty. RentRadar was built to make the process easier, safer, and smarter for everyone. No more endless searching, unreliable listings, or wasted trips. Just the right home, found fast.

---

## 🗺️ Roadmap

- [x] Core search, listings, and map features
- [x] User authentication and profiles
- [x] Agent and booking system
- [x] Reviews, ratings, and notifications
- [x] Admin dashboard and analytics
- [ ] M-PESA integration (coming soon)
- [ ] Gamification and advanced notifications
- [ ] Mobile app and more map features
- [ ] ...and more! See the Planned & Future Features section above

---

## 🤝 Collaboration & Contact

Interested in collaborating or contributing to make RentRadar even better? Reach out!

- **Email:** njerifaith697@gmail.com
- **WhatsApp:** +254769399819
- **Telegram:** [@Nimblefawn](https://t.me/Nimblefawn) (ID: 6372116024)

Feel free to contact me with ideas, feedback, or if you'd like to join the project as a developer, designer, or tester. All contributions and suggestions are welcome!

--- 