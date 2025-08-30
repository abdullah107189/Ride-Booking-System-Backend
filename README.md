
# Ride Booking API

A secure and scalable **Ride Booking API** built with **Express.js**, **TypeScript**, and **MongoDB**. This project was developed as part of **Assignment 5**.

---

## 📌 Features
- 🔑 **Authentication & Authorization** with JWT & Refresh Tokens
- 👤 **Role-based access control** (Rider, Driver, Admin)
- 🚕 **Ride Management**
  - Request a ride
  - Cancel a ride
  - Track ride status (`requested`, `accepted`, `picked_up`, `in_transit`, `completed`, `canceled`,`paid`)
- 📍 **Geo-based Driver Search** using MongoDB **2dsphere index**
- 💰 **Driver Earnings** tracking
- ⭐ **Driver Rating System**
- 🔒 Secure password hashing with **bcryptjs**
- ✅ Input validation with **Zod**

---

## ⚙️ Tech Stack
- **Backend Framework**: Express.js + TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod
- **Utilities**: cookie-parser, cors, dotenv, http-status-codes

---

## 🗂️ Project Structure
```bash
src/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── ride/
│   ├── driver/
│   └── admin/
├── middleware/
├── utils/
├── app.ts
└── server.ts
```

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/ride-booking-api.git
cd ride-booking-api
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the root directory and add:
```env
DB_URL = mongodb://localhost:27017/
PORT = 3000
NODE_DEV = development
bcrypt_salt_round = 10


# JWT
jwt_secret = G5f8Q1z8W3e9R2t6Y4u7K8j9L0mN5pQ3sT6vB7xY8zA1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3
jwt_expires = 1d
jwt_refresh_secret = H7jK8l9M0nP5qR3sT6vB7xY8zA1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3
jwt_refresh_expires = 30d
```

### 4️⃣ Run the Server
```bash
npm run dev
```

---

## 📡 API Endpoints
# 📌 API Endpoints Summary

## 🔑 Authentication Routes

| Method | Endpoint              | Description         | Role     |
| ------ | --------------------- | ------------------- | -------- |
| POST   | `/auth/register`      | Register a new user | Public   |
| POST   | `/auth/login`         | Login and get JWT   | Public   |
| POST   | `/auth/refresh-token` | Refresh JWT token   | Public   |
| POST   | `/auth/logout`        | Logout user         | Any Role |

---

## 👤 User Routes

| Method | Endpoint                    | Description        | Role         |
| ------ | --------------------------- | ------------------ | ------------ |
| GET    | `/users/me`                 | Get own profile    | Any          |
| PATCH  | `/users/updateOwnProfile`   | Update own profile | Any Role     |
| PATCH  | `/users/changeOnlineStatus` | Set online/offline | Driver, Rider|

---

## 🚖 Driver Routes

| Method | Endpoint                  | Description         | Role   |
| ------ | ------------------------- | ------------------- | ------ |
| GET    | `/drivers/earningHistory` | Get driver earnings | Driver |

---

## 🛺 Ride Routes

| Method | Endpoint                           | Description                  | Role   |
| ------ | ---------------------------------- | ---------------------------- | ------ |
| POST   | `/rides/request`                   | Request a new ride           | Rider  |
| GET    | `/rides/history`                   | Get rider’s ride history     | Rider  |
| PATCH  | `/rides/:id/cancel`                | Cancel a ride                | Rider  |
| GET    | `/rides/available`                 | Get available rides          | Driver |
| PATCH  | `/rides/:id/accept`                | Accept a ride                | Driver |
| PATCH  | `/rides/:id/status`                | Update ride status           | Driver |
| GET    | `/rides/findNearbyDrivers/:rideId` | Find nearby drivers for ride | Rider  |

---

## 🛠️ Admin Routes

| Method | Endpoint                         | Description            | Role  |
| ------ | -------------------------------- | ---------------------- | ----- |
| PATCH  | `/admin/changeBlockStatus/:id`   | Block/unblock a user   | Admin |
| GET    | `/admin/getAllUser`              | Get all users          | Admin |
| GET    | `/admin/getAllRide`              | Get all rides          | Admin |
| PATCH  | `/admin/changeApproveStatus/:id` | Approve/suspend driver | Admin |

---

## 🧪 Testing
Use **Postman** or **Thunder Client** to test APIs. Example request/response payloads are provided in the `/docs` folder.

## 📜 License
Copyright (c) 2025 abdullah107189
```
