# Kuja Twende — Adventures Website 🚀

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-13+-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A futuristic & playful travel agency web application built with Next.js, Tailwind CSS, and MongoDB. Features smooth animations, modern UI design, and comprehensive travel booking functionality.

**🔗 Repository:** `https://github.com/Phylan001/kujatwende`

## 📖 Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Timeline & Pricing](#timeline--pricing)
- [Known Limitations](#known-limitations)
- [License](#license)
- [Contact](#contact)

## 🌟 About The Project

Kuja Twende is a modern travel agency web application designed as a learning project that showcases full-stack development skills. The application allows users to browse destinations, make bookings, leave reviews, and provides administrators with comprehensive management tools.

### Design Philosophy

- **Student-friendly:** Clean, readable, and well-documented code
- **Modern UI:** Futuristic design with smooth animations and micro-interactions
- **Responsive:** Mobile-first approach with Tailwind CSS
- **Educational:** Focus on learning core web development concepts

## ✨ Key Features

### Core Functionality

- 🏠 **Landing Page** - Animated hero section with featured destinations
- 🗺️ **Destinations** - Browse, search, and filter travel destinations
- 📝 **Booking System** - Complete booking flow with form validation
- ⭐ **Reviews** - User reviews and ratings for destinations
- 👤 **User Authentication** - Secure signup/login with JWT
- 🔐 **Admin Dashboard** - Comprehensive management interface

### UI/UX Features

- 🎨 **Modern Design** - Glassmorphism cards and neon gradients
- 🚀 **Smooth Animations** - GSAP, AOS, and Framer Motion
- 📱 **Responsive Design** - Mobile-first with Tailwind CSS
- 🔍 **Search & Filter** - Advanced destination filtering
- 💫 **Micro-interactions** - Hover effects and transitions

### Optional Extensions

- 💳 **Mock Payments** - Payment confirmation flow (no real gateway)
- 📸 **Image Upload** - Local or cloud-based image management

## 🛠 Tech Stack

### Frontend

- **Framework:** Next.js 13+ (App Router)
- **Styling:** Tailwind CSS
- **Animations:** GSAP, AOS, Framer Motion
- **Fonts:** Google Fonts (Fredoka, Baloo 2, Pacifico)

### Backend

- **Runtime:** Node.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** bcrypt + JWT
- **API:** Next.js API Routes

### Development Tools

- **Linting:** ESLint
- **Formatting:** Prettier
- **Version Control:** Git

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm
- MongoDB Atlas account (or local MongoDB installation)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Phylan001/kujatwende.git
   cd kujatwende
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Environment Setup

Create a `.env.local` file in the project root:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/kujatwende?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
PORT=3000

# Optional: Image Upload (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Running the Application

1. **Development mode**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`

2. **Build for production**

   ```bash
   npm run build
   npm run start
   ```

3. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

## 📁 Project Structure

```
kujatwende/
├── app/                       # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── destinations/      # Destinations CRUD
│   │   ├── bookings/          # Booking management
│   │   └── reviews/           # Review system
│   ├── destinations/          # Destination pages
│   ├── bookings/              # Booking pages
│   ├── dashboard/             # Admin dashboard
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Homepage
├── components/                # Reusable components
│   ├── ui/                    # Base UI components
│   ├── forms/                 # Form components
│   └── layout/                # Layout components
├── lib/                       # Utilities
│   ├── db.js                  # Database connection
│   ├── auth.js                # Authentication helpers
│   └── utils.js               # General utilities
├── models/                    # Mongoose models
│   ├── User.js
│   ├── Destination.js
│   ├── Booking.js
│   └── Review.js
├── scripts/                   # Utility scripts
│   └── seed.js                # Database seeding
├── public/                    # Static assets
└── README.md
```

## 🔌 API Documentation

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Destinations

- `GET /api/destinations` - List all destinations
- `GET /api/destinations/[id]` - Get destination by ID
- `POST /api/destinations` - Create destination (Admin)
- `PUT /api/destinations/[id]` - Update destination (Admin)
- `DELETE /api/destinations/[id]` - Delete destination (Admin)

### Bookings

- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Cancel booking

### Reviews

- `GET /api/reviews/[destinationId]` - Get reviews for destination
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/[id]` - Delete review

## 🗄 Database Models

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  passwordHash: String (required),
  role: String (enum: ["user", "admin"], default: "user"),
  timestamps: true
}
```

### Destination Model

```javascript
{
  title: String,
  slug: String (unique, indexed),
  description: String,
  location: String,
  price: Number,
  durationDays: Number,
  images: [String],
  highlights: [String],
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### Booking Model

```javascript
{
  user: ObjectId (ref: User),
  destination: ObjectId (ref: Destination),
  name: String,
  email: String,
  phone: String,
  date: Date,
  status: String (enum: ["pending", "confirmed", "cancelled"]),
  notes: String,
  timestamps: true
}
```

### Review Model

```javascript
{
  user: ObjectId (ref: User),
  destination: ObjectId (ref: Destination),
  rating: Number (1-5),
  comment: String,
  timestamps: true
}
```

## 🚀 Deployment

### Recommended Platforms

- **Vercel** (Best for Next.js)
- **Render**
- **Railway**
- **Heroku**

### Deployment Steps

1. Push your code to GitHub
2. Connect your repository to your chosen platform
3. Set environment variables in the platform dashboard
4. Deploy!

### Environment Variables for Production

```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

## 📊 Timeline & Pricing

### MVP Development (2-3 weeks)

- Basic CRUD functionality
- Simple authentication
- Basic UI
- **Estimated Cost:** $200-$400 (KES 28,000-56,000)

### Polished Version (3-5 weeks)

- Advanced animations
- Admin dashboard
- Search & filtering
- Responsive design
- **Estimated Cost:** $500-$800 (KES 70,000-112,000)

_Prices are estimates for educational/freelance projects_

## ⚠️ Known Limitations

This is a student/learning project with the following limitations:

- **Security:** Basic JWT implementation (not production-grade)
- **Payments:** Mock payment system only
- **Scaling:** Designed for small user loads
- **Testing:** Limited automated testing
- **Image Storage:** Basic local storage (no CDN optimization)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**DonArtkins** - Project Creator

- **GitHub:** [@Phylan001](https://github.com/Phylan001)
- **Repository:** [https://github.com/Phylan001/kujatwende](https://github.com/Phylan001/kujatwende)

---

**Built with ❤️ for learning and demonstration purposes**

---

## 🙏 Acknowledgments

- **GSAP** - Amazing animation library
- **AOS** - Animate on scroll
- **Framer Motion** - React motion library
- **Tailwind CSS** - Utility-first CSS framework
- **Google Fonts** - Beautiful typography
- **Next.js** - React framework
- **MongoDB** - Document database
- **Vercel** - Deployment platform

---

_If you found this project helpful, please consider giving it a ⭐!_
