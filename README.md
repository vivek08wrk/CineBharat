# 🎬 CineBharat

A full-stack movie booking platform built with the MERN stack, featuring a modern user interface, admin dashboard, and seamless ticket booking experience with payment integration.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📖 About

CineBharat is a comprehensive movie booking system that allows users to browse movies, view trailers, select seats, and book tickets with secure payment processing. The platform includes a separate admin dashboard for managing movies, showtimes, and bookings.

## ✨ Features

### User Features
- 🎥 Browse current movies and upcoming releases
- 🎬 Watch trailers and view movie details
- 🪑 Interactive seat selection with real-time availability
- 💳 Secure payment processing with Stripe integration
- 📱 QR code generation for booked tickets
- 👤 User authentication and profile management
- 📧 Email notifications for bookings
- 📰 Latest movie news and updates

### Admin Features
- ➕ Add, edit, and delete movies
- 📊 Dashboard with booking analytics
- 🎟️ Manage bookings and view booking history
- 📋 Movie list management
- 🖼️ Image upload for movie posters

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI library
- **React Router DOM** - Navigation
- **TailwindCSS 4** - Styling
- **Axios** - API requests
- **Lucide React** - Icons
- **React Toastify** - Notifications
- **QRCode** - Ticket QR generation
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Stripe** - Payment processing
- **Multer** - File uploads
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
CineBharat/
├── Frontend/              # User-facing React application
│   ├── src/
│   │   ├── Components/    # Reusable components
│   │   ├── Pages/         # Page components
│   │   ├── assets/        # Static assets
│   │   └── App.jsx        # Main app component
│   └── package.json
│
├── admin/                 # Admin dashboard
│   ├── src/
│   │   ├── components/    # Admin components
│   │   ├── pages/         # Admin pages
│   │   └── App.jsx
│   └── package.json
│
└── Backend/               # Node.js API server
    ├── Config/            # Database configuration
    ├── Controllers/       # Business logic
    ├── Middleware/        # Auth middleware
    ├── Models/            # Mongoose schemas
    ├── Routes/            # API routes
    ├── uploads/           # Uploaded files
    └── server.js          # Entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Stripe account (for payment processing)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cinebharat.git
cd cinebharat
```

2. **Install Backend Dependencies**
```bash
cd Backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../Frontend
npm install
```

4. **Install Admin Dependencies**
```bash
cd ../admin
npm install
```

### Environment Variables

Create a `.env` file in the **Backend** directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Authentication
JWT_SECRET=your_jwt_secret_key

# Stripe Payment
STRIPE_SECRET_KEY=your_stripe_secret_key

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### Running the Application

1. **Start the Backend Server**
```bash
cd Backend
npm start
```
The backend will run on `http://localhost:5000`

2. **Start the Frontend**
```bash
cd Frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

3. **Start the Admin Panel**
```bash
cd admin
npm run dev
```
The admin panel will run on `http://localhost:5174`

## 🔌 API Endpoints

### Authentication
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Get user profile (protected)

### Movies
- `GET /api/movies/list` - Get all movies
- `GET /api/movies/:id` - Get movie by ID
- `POST /api/movies/add` - Add new movie (admin only)
- `PUT /api/movies/:id` - Update movie (admin only)
- `DELETE /api/movies/:id` - Delete movie (admin only)

### Bookings
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings/user/:userId` - Get user bookings
- `GET /api/bookings/all` - Get all bookings (admin only)
- `POST /api/bookings/verify-payment` - Verify Stripe payment
- `DELETE /api/bookings/:id` - Cancel booking

## 📸 Screenshots

> Add screenshots of your application here

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Vivek**

## 🙏 Acknowledgments

- Movie data and trailers from various sources
- Icons from Lucide React
- UI inspiration from modern booking platforms
- Stripe for payment processing

## 📞 Support

For support, email vivekrawat08wrk@gmail.com or open an issue in the repository.

---

<div align="center">
  Made with ❤️ by Vivek
</div>
