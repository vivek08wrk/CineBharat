# CineBharat - Comprehensive Technical Walkthrough

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Tech Stack Analysis](#tech-stack-analysis)
3. [Data Flow: Booking a Movie](#data-flow-booking-a-movie)
4. [API Documentation](#api-documentation)
5. [Key Features Implementation](#key-features-implementation)
6. [Deployment Readiness](#deployment-readiness)

---

## 🏗️ Architecture Overview

### Project Structure
```
CineBharat/
├── Frontend/          # User-facing React application
├── admin/             # Admin dashboard (React)
└── Backend/           # Node.js/Express API server
    ├── Config/        # Database configuration
    ├── Controllers/   # Business logic layer
    ├── Middleware/    # Auth & validation
    ├── Models/        # Mongoose schemas
    ├── Routes/        # API route definitions
    └── uploads/       # Static file storage
```

### Design Pattern: **MVC (Model-View-Controller)**

**Backend Architecture:**
- **Models** (`Models/`): Mongoose schemas defining data structure
  - `userModel.js` - User authentication & profiles
  - `movieModel.js` - Movie catalog with nested schemas
  - `bookingModels.js` - Ticket reservations & payments

- **Controllers** (`Controllers/`): Business logic & data processing
  - `userController.js` - Registration, login, JWT generation
  - `moviesController.js` - CRUD for movies, trailers, file uploads
  - `bookingController.js` - Seat selection, payment integration, booking management

- **Routes** (`Routes/`): API endpoint definitions
  - Maps HTTP methods to controller functions
  - Applies middleware (authentication, file uploads)

**Frontend Architecture:**
- **Component-Based** React with functional components
- **React Router** for SPA navigation
- **Separated Concerns:**
  - `Components/` - Reusable UI elements (Navbar, Footer, MovieCard)
  - `Pages/` - Route-level components (Home, Login, Booking)
  - `assets/` - Styles, dummy data, configuration

**Key Architectural Decisions:**
1. **Separation of Concerns**: Admin panel as separate app for role-based access
2. **RESTful API**: Stateless backend with JWT for authentication
3. **File Upload Strategy**: Multer with disk storage + static serving
4. **Nested Schemas**: Mongoose schemas with embedded documents (e.g., `latestTrailer` within `Movie`)

---

## 🛠️ Tech Stack Analysis

### Backend Dependencies

| Package | Version | Purpose | Why Chosen |
|---------|---------|---------|------------|
| **express** | ^5.2.1 | Web framework | Industry standard, minimal, flexible routing |
| **mongoose** | ^8.21.0 | MongoDB ODM | Schema validation, query building, relationships |
| **jsonwebtoken** | ^9.0.3 | Authentication | Stateless auth, scalable for multiple clients |
| **bcryptjs** | ^3.0.3 | Password hashing | Secure password storage with salt rounds |
| **multer** | ^2.0.2 | File uploads | Handles multipart/form-data for images/videos |
| **stripe** | ^20.1.0 | Payment processing | PCI-compliant payment integration |
| **cors** | ^2.8.5 | Cross-origin requests | Enables frontend-backend communication |
| **dotenv** | ^17.2.3 | Environment variables | Secure configuration management |
| **validator** | ^13.15.26 | Input validation | Email, phone, URL validation |
| **nodemon** | ^3.1.11 | Dev server | Auto-restart on file changes |

### Frontend Dependencies

| Package | Version | Purpose | Why Chosen |
|---------|---------|---------|------------|
| **react** | ^19.2.0 | UI library | Component-based, virtual DOM, huge ecosystem |
| **react-router-dom** | ^7.11.0 | Client-side routing | SPA navigation without page reloads |
| **axios** | ^1.13.2 | HTTP client | Promise-based, interceptors, better than fetch |
| **tailwindcss** | ^4.1.18 | CSS framework | Utility-first, rapid styling, responsive design |
| **lucide-react** | ^0.562.0 | Icon library | Lightweight, tree-shakeable SVG icons |
| **react-toastify** | ^11.0.5 | Notifications | User feedback for actions (success/error) |
| **qrcode** | ^1.5.4 | QR generation | Ticket verification system |
| **vite** | ^7.2.4 | Build tool | Fast HMR, ES modules, better than CRA |

---

## 🔄 Data Flow: Booking a Movie

### Complete Flow from Frontend → Backend → Database

#### **Step 1: User Interaction (Frontend)**
**File:** `Frontend/src/Components/SeatSelectorPage.jsx`

```javascript
// User selects seats and clicks "Proceed to Payment"
const handleBooking = async () => {
  const bookingData = {
    movieId: movie._id,
    customer: userName,
    seats: selectedSeats,  // ["A1", "A2"]
    showtime: selectedSlot.date,
    auditorium: "Audi 1"
  };
  
  // POST request with JWT token
  const response = await axios.post(
    'http://localhost:5000/api/bookings',
    bookingData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
```

#### **Step 2: API Route (Backend)**
**File:** `Backend/Routes/bookingRouter.js`

```javascript
import authMiddleware from "../Middleware/auth.js";
import { createBooking } from "../Controllers/bookingController.js";

// Protected route - requires valid JWT
bookingRouter.post("/", authMiddleware, createBooking);
```

#### **Step 3: Authentication Middleware**
**File:** `Backend/Middleware/auth.js`

```javascript
export default async function authMiddleware(req, res, next) {
  // Extract token from "Bearer <token>"
  const token = req.headers.authorization?.split(' ')[1];
  
  // Verify JWT signature
  const payload = jwt.verify(token, JWT_SECRET);
  
  // Fetch user from database
  const user = await User.findById(payload.id).select('-password');
  
  // Attach user to request object
  req.user = user;
  next();  // Proceed to controller
}
```

#### **Step 4: Controller Logic**
**File:** `Backend/Controllers/bookingController.js`

```javascript
export async function createBooking(req, res) {
  // 1. Extract data from request
  const { movieId, seats, showtime } = req.body;
  const userId = req.user._id;  // From auth middleware
  
  // 2. Fetch movie details
  const movie = await Movie.findById(movieId);
  
  // 3. Calculate pricing
  const amountPaise = computeTotalPaiseFromSeats(movie, seats);
  
  // 4. Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'inr',
        product_data: { name: movie.movieName },
        unit_amount: amountPaise
      },
      quantity: 1
    }],
    metadata: { bookingId: newBooking._id }
  });
  
  // 5. Save booking to database
  const newBooking = await Booking.create({
    movieId, userId, seats, showtime,
    amountPaise, status: 'pending'
  });
  
  // 6. Return Stripe checkout URL
  res.json({
    success: true,
    checkoutUrl: session.url,
    bookingId: newBooking._id
  });
}
```

#### **Step 5: Database Operation**
**File:** `Backend/Models/bookingModels.js`

```javascript
// Mongoose saves document to MongoDB
const bookingSchema = new Schema({
  movieId: { type: Schema.Types.ObjectId, ref: "Movie" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  seats: { type: [Schema.Types.Mixed], required: true },
  amountPaise: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "paid"], default: "pending" }
});
```

**MongoDB Document Created:**
```json
{
  "_id": "67a1b2c3d4e5f6a7b8c9d0e1",
  "movieId": "67a1a2a3a4a5a6a7a8a9a0a1",
  "userId": "67a0a1a2a3a4a5a6a7a8a9a0",
  "seats": ["A1", "A2"],
  "showtime": "2026-01-20T18:30:00Z",
  "amountPaise": 60000,
  "status": "pending",
  "createdAt": "2026-01-18T10:00:00Z"
}
```

#### **Step 6: Payment Confirmation Flow**
1. User completes Stripe payment
2. Stripe redirects to: `frontend/verify-payment?session_id=xxx`
3. Frontend calls: `GET /api/bookings/confirm-payment?session_id=xxx`
4. Backend verifies with Stripe API
5. Updates booking status to `"paid"`
6. Frontend displays booking confirmation with QR code

---

## 📡 API Documentation

### Authentication Endpoints

#### **POST** `/api/auth/register`
**Purpose:** Create new user account

**Request Body:**
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "birthDate": "1995-05-15",
  "password": "secure123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67a...",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

**Validation:**
- Email format check
- Username uniqueness
- Password min 6 characters
- Phone number extraction
- Bcrypt password hashing (10 salt rounds)

---

#### **POST** `/api/auth/login`
**Purpose:** Authenticate user and generate JWT

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "secure123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67a...",
    "fullName": "John Doe"
  }
}
```

---

### Movie Endpoints

#### **GET** `/api/movies`
**Purpose:** Fetch movies with filtering

**Query Parameters:**
- `type` - Filter by movie type: `normal | featured | releaseSoon | latestTrailers`
- `category` - Filter by genre (e.g., "Action", "Horror")
- `search` - Text search in title/story
- `page` - Pagination (default: 1)
- `limit` - Results per page (default: 12, max: 200)
- `latestTrailer` - Boolean flag for trailer-only results

**Example Request:**
```
GET /api/movies?type=featured&limit=6
```

**Response:**
```json
{
  "success": true,
  "total": 25,
  "page": 1,
  "limit": 6,
  "items": [
    {
      "_id": "67a...",
      "movieName": "The Dark Knight",
      "type": "featured",
      "categories": ["Action", "Crime"],
      "poster": "http://localhost:5000/uploads/movie-1234.jpg",
      "rating": 9.0,
      "duration": 152,
      "seatPrices": { "standard": 250, "recliner": 400 }
    }
  ]
}
```

---

#### **POST** `/api/movies`
**Purpose:** Create new movie (Admin only)

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `type` - Movie category
- `movieName` - Title
- `categories` - JSON array of genres
- `rating` - Decimal (0-10)
- `duration` - Minutes (integer)
- `story` - Description
- `slots` - JSON array of showtimes
- `seatPrices` - JSON object `{standard, recliner}`

**File Uploads:**
- `poster` - Movie poster image
- `castFiles[]` - Cast member images
- `directorFiles[]` - Director images
- `producerFiles[]` - Producer images

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/movies \
  -H "Content-Type: multipart/form-data" \
  -F "movieName=Inception" \
  -F "type=featured" \
  -F "categories=[\"Sci-Fi\",\"Thriller\"]" \
  -F "poster=@poster.jpg" \
  -F "rating=8.8" \
  -F "duration=148"
```

---

#### **GET** `/api/movies/:id`
**Purpose:** Fetch single movie details

**Response includes:**
- Full movie information
- Embedded cast/director/producer data
- Latest trailer details (if applicable)
- Available showtimes

---

#### **DELETE** `/api/movies/:id`
**Purpose:** Delete movie and associated files

**Behavior:**
- Removes database document
- Deletes uploaded poster/images from disk
- Returns success confirmation

---

### Booking Endpoints

#### **POST** `/api/bookings`
**Purpose:** Create booking and initiate payment

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "movieId": "67a1a2a3a4a5a6a7a8a9a0a1",
  "seats": [
    { "seatId": "A1", "type": "standard" },
    { "seatId": "A2", "type": "recliner" }
  ],
  "showtime": "2026-01-20T18:30:00Z",
  "auditorium": "Audi 1",
  "customer": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
  "bookingId": "67a1b2c3d4e5f6a7b8c9d0e1",
  "sessionId": "cs_test_..."
}
```

**Process Flow:**
1. Validate seat availability
2. Calculate total from seat types
3. Create Stripe checkout session
4. Save booking with `pending` status
5. Return payment URL

---

#### **GET** `/api/bookings/my`
**Purpose:** Fetch user's bookings

**Authentication:** Required

**Query Parameters:**
- `paymentStatus` - Filter: `paid | pending | all`
- `status` - Filter: `confirmed | cancelled | all`

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "_id": "67a...",
      "movie": {
        "title": "Inception",
        "poster": "...",
        "durationMins": 148
      },
      "seats": ["A1", "A2"],
      "showtime": "2026-01-20T18:30:00Z",
      "auditorium": "Audi 1",
      "amountPaise": 60000,
      "paymentStatus": "paid"
    }
  ]
}
```

---

#### **GET** `/api/bookings/confirm-payment`
**Purpose:** Verify Stripe payment and update booking

**Query Parameters:**
- `session_id` - Stripe checkout session ID

**Process:**
1. Retrieve session from Stripe API
2. Verify `payment_status === "paid"`
3. Extract `bookingId` from metadata
4. Update booking: `paymentStatus: "paid", status: "confirmed"`
5. Return updated booking

**Response:**
```json
{
  "success": true,
  "booking": {
    "_id": "67a...",
    "paymentStatus": "paid",
    "status": "confirmed",
    "paymentIntentId": "pi_..."
  }
}
```

---

#### **GET** `/api/bookings/occupied`
**Purpose:** Get booked seats for a showtime

**Query Parameters:**
- `movieId` - Movie ID
- `showtime` - ISO date string
- `auditorium` - Hall name

**Response:**
```json
{
  "success": true,
  "occupiedSeats": ["A1", "A2", "B5", "C3"]
}
```

**Use Case:** Disable already-booked seats in seat selector UI

---

#### **GET** `/api/bookings`
**Purpose:** Admin endpoint - list all bookings

**Query Parameters:**
- `movieId` - Filter by movie
- `page`, `limit` - Pagination
- `paymentStatus`, `status` - Filters

---

#### **DELETE** `/api/bookings/:id`
**Purpose:** Cancel booking

**Note:** Should include refund logic for paid bookings

---

## 🔑 Key Features Implementation

### 1. Authentication (JWT + Bcrypt)

**Registration Flow:**
```javascript
// userController.js
export const registerUser = async (req, res) => {
  // 1. Validate inputs
  if (!fullName || !username || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields required" });
  }
  
  // 2. Check email/username uniqueness
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "Email exists" });
  
  // 3. Hash password (10 salt rounds)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // 4. Create user
  const newUser = await User.create({
    fullName, username, email, phone,
    password: hashedPassword
  });
  
  // 5. Generate JWT (24h expiry)
  const token = jwt.sign(
    { id: newUser._id, username: newUser.username },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
  
  // 6. Return token + user data (no password)
  res.json({
    success: true,
    token,
    user: { id: newUser._id, fullName, email }
  });
};
```

**Login Flow:**
```javascript
export const login = async (req, res) => {
  // 1. Find user by username
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  
  // 2. Compare password hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  
  // 3. Generate new JWT
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "24h" });
  
  // 4. Return token
  res.json({ success: true, token });
};
```

**Middleware Protection:**
```javascript
// auth.js
export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token missing' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    req.user = user;  // Attach user to request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalid' });
  }
}
```

---

### 2. State Management (Frontend)

**No Redux/Context** - Uses **Local State + LocalStorage**

**Token Storage:**
```javascript
// After login success
localStorage.setItem('token', response.data.token);

// Retrieving token for API calls
const token = localStorage.getItem('token');
axios.get('/api/bookings/my', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**User State Management:**
```javascript
// App.jsx or Navbar.jsx
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const token = localStorage.getItem('token');
  setIsLoggedIn(!!token);
}, []);

// On logout
const handleLogout = () => {
  localStorage.removeItem('token');
  setIsLoggedIn(false);
  navigate('/login');
};
```

**Why This Approach?**
- Simpler for small-medium apps
- No prop drilling needed
- Token persists across sessions
- Lightweight compared to Redux

---

### 3. Protected Routes

**Implementation in App.jsx:**
```javascript
import { Navigate } from 'react-router-dom';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Protected Routes */}
      <Route path="/bookings" element={
        <ProtectedRoute>
          <Booking />
        </ProtectedRoute>
      } />
      <Route path="/seat-selector/:id" element={
        <ProtectedRoute>
          <SeatSelector />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

**Alternative: Redirect in Component:**
```javascript
// BookingPage.jsx
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
  }
}, [navigate]);
```

---

### 4. File Upload Strategy

**Multer Configuration:**
```javascript
// movieRouter.js
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e5);
    const ext = path.extname(file.originalname);
    cb(null, `movie-${unique}${ext}`);
  }
});

const upload = multer({ storage }).fields([
  { name: "poster", maxCount: 1 },
  { name: "castFiles", maxCount: 20 },
  { name: "directorFiles", maxCount: 20 }
]);

movieRouter.post("/", upload, createMovie);
```

**Serving Static Files:**
```javascript
// server.js
app.use("/uploads", express.static(path.join(process.cwd(), 'uploads')));
```

**Frontend Access:**
```javascript
const imageUrl = `http://localhost:5000/uploads/${filename}`;
<img src={imageUrl} alt="Movie Poster" />
```

---

### 5. Payment Integration (Stripe)

**Creating Checkout Session:**
```javascript
// bookingController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'inr',
      product_data: {
        name: movie.movieName,
        description: `${seats.length} seats for ${showtime}`
      },
      unit_amount: amountPaise  // Amount in paise (₹250 = 25000 paise)
    },
    quantity: 1
  }],
  mode: 'payment',
  success_url: `${FRONTEND_URL}/verify-payment?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${FRONTEND_URL}/booking?payment=cancelled`,
  metadata: {
    bookingId: newBooking._id.toString(),
    userId: req.user._id.toString()
  }
});

res.json({ checkoutUrl: session.url, sessionId: session.id });
```

**Payment Verification:**
```javascript
export async function confirmPayment(req, res) {
  const { session_id } = req.query;
  
  // Retrieve session from Stripe
  const session = await stripe.checkout.sessions.retrieve(session_id);
  
  if (session.payment_status !== "paid") {
    return res.status(400).json({ message: "Payment not completed" });
  }
  
  // Update booking status
  const bookingId = session.metadata.bookingId;
  await Booking.findByIdAndUpdate(bookingId, {
    paymentStatus: "paid",
    status: "confirmed",
    paymentIntentId: session.payment_intent
  });
  
  res.json({ success: true });
}
```

---

### 6. QR Code Generation (Ticket System)

**Frontend Implementation:**
```javascript
// BookingPage.jsx
import QRCode from 'qrcode';

const generateQR = async (booking) => {
  const payload = JSON.stringify({
    bookingId: booking._id,
    title: booking.movie.title,
    showtime: booking.showtime,
    seats: booking.seats,
    auditorium: booking.auditorium
  });
  
  const qrDataURL = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    scale: 6
  });
  
  return qrDataURL;  // Base64 image string
};

// Display QR
<img src={qrDataURL} alt="Ticket QR" />
```

**Scanning Logic:**
```javascript
const handleQRScan = (qrData) => {
  const booking = JSON.parse(qrData);
  // Verify booking exists in database
  // Mark as "used" for entry
};
```

---

## 🚀 Deployment Readiness

### Environment Variables Required

**Backend (.env file):**
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinebharat
# Or for local: mongodb://localhost:27017/cinebharat

# JWT Secret (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# Stripe Payment
STRIPE_SECRET_KEY=sk_live_...  # Production key
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Frontend URL (for Stripe redirects)
FRONTEND_URL=https://cinebharat.vercel.app

# Server Port
PORT=5000

# Node Environment
NODE_ENV=production
```

**Frontend (.env file):**
```bash
# API Base URL
VITE_API_BASE_URL=https://cinebharat-api.onrender.com

# Stripe Publishable Key
VITE_STRIPE_KEY=pk_live_...
```

---

### Deployment Checklist

#### Backend (Render/Railway/Heroku)

**1. Update `package.json`:**
```json
{
  "scripts": {
    "start": "node server.js",  // Remove nodemon for production
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "20.x"  // Specify Node version
  }
}
```

**2. CORS Configuration:**
```javascript
// server.js
const allowedOrigins = [
  'https://cinebharat.vercel.app',
  'https://cinebharat-admin.vercel.app',
  'http://localhost:5173'  // Keep for local dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
```

**3. Database Connection:**
```javascript
// Congfig/db.js
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinebharat';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

**4. File Upload Storage:**
- **Option A**: Use cloud storage (AWS S3, Cloudinary)
- **Option B**: Persistent disk (Render paid tier)

**Example Cloudinary Integration:**
```javascript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cinebharat',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});
```

**5. Security Headers:**
```javascript
import helmet from 'helmet';
app.use(helmet());
```

---

#### Frontend (Vercel/Netlify)

**1. Update API Base URL:**
```javascript
// Create config file
// src/config.js
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

**2. Build Configuration (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**3. Environment Variables in Vercel:**
```
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_STRIPE_KEY=pk_live_...
```

---

### Performance Optimizations

**Backend:**
1. **Enable Compression:**
```javascript
import compression from 'compression';
app.use(compression());
```

2. **Database Indexing:**
```javascript
// movieModel.js
movieSchema.index({ type: 1, categories: 1 });
bookingSchema.index({ showtime: 1, auditorium: 1 });
```

3. **Rate Limiting:**
```javascript
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // Limit each IP to 100 requests per window
});
app.use('/api/', limiter);
```

**Frontend:**
1. **Code Splitting:**
```javascript
import { lazy, Suspense } from 'react';
const MovieDetail = lazy(() => import('./Pages/MovieDetailPage'));

<Suspense fallback={<Loading />}>
  <MovieDetail />
</Suspense>
```

2. **Image Optimization:**
- Use WebP format
- Lazy loading: `<img loading="lazy" />`
- Responsive images: `srcset`

---

### Monitoring & Logging

**Backend:**
```javascript
// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error tracking (Sentry)
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

### Testing Strategy

**Backend Tests (Jest + Supertest):**
```javascript
// __tests__/auth.test.js
import request from 'supertest';
import app from '../server';

describe('Auth Endpoints', () => {
  it('should register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        birthDate: '1990-01-01'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });
});
```

**Frontend Tests (Vitest + React Testing Library):**
```javascript
import { render, screen } from '@testing-library/react';
import MovieCard from './MovieCard';

test('renders movie title', () => {
  render(<MovieCard title="Inception" />);
  expect(screen.getByText('Inception')).toBeInTheDocument();
});
```

---

## 📊 Database Schema Relationships

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │         │    Movie    │         │   Booking   │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ _id         │         │ _id         │         │ _id         │
│ fullName    │         │ movieName   │         │ movieId ────┼──> Movie._id
│ username    │         │ type        │         │ userId ─────┼──> User._id
│ email       │         │ categories  │         │ seats       │
│ phone       │         │ poster      │         │ showtime    │
│ password    │         │ rating      │         │ auditorium  │
└─────────────┘         │ duration    │         │ amountPaise │
                        │ seatPrices  │         │ status      │
                        │ slots       │         │ paymentStatus│
                        └─────────────┘         └─────────────┘
```

---

## 🎯 Interview Key Points Summary

1. **Architecture**: MVC pattern with clear separation (Model-Controller-Route)
2. **Authentication**: JWT-based stateless auth with bcrypt hashing
3. **Payment**: Stripe integration with webhook-free verification
4. **File Uploads**: Multer with disk storage + static serving
5. **State Management**: LocalStorage + React hooks (no Redux complexity)
6. **Database**: MongoDB with Mongoose, nested schemas for complex data
7. **API Design**: RESTful with consistent response format
8. **Security**: Auth middleware, password hashing, CORS, input validation
9. **Scalability**: Stateless architecture, database indexing, rate limiting
10. **Deployment Ready**: Environment variables, production configs, cloud storage options

---

## 📚 Additional Resources

- **Stripe Docs**: https://stripe.com/docs/api
- **Mongoose Guide**: https://mongoosejs.com/docs/guide.html
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **React Router**: https://reactrouter.com/en/main

---

**Generated on:** January 18, 2026  
**Project:** CineBharat Cinema Booking System  
**Tech Stack:** MERN (MongoDB, Express, React, Node.js)
