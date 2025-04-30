# VidTube 🎥

VidTube is a full-featured backend system that powers a YouTube-like video sharing platform. It supports video uploading, user authentication, commenting, playlist management, and video publishing functionality.

## 🚀 Features

- 🔐 User Signup & Login (Email Authentication)
- 📹 Upload, Edit, Delete, and Publish Videos
- 💬 Add, Edit, Delete Comments on Videos
- 📂 Create, Update, and Delete Playlists
- 📺 Add/Remove Videos from Playlists
- ✅ Email Verification
- 🔐 Forgot Password and Password Reset

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: Custom Email Auth
- **File Storage**: Local or Cloud (configurable)
- **Other**: JWT, Bcrypt, Nodemailer

## 📁 Project Structure

vidtube/ ├── controllers/ ├── routes/ ├── models/ ├── middleware/ ├── utils/ ├── config/ ├── uploads/ ├── .env ├── .gitignore ├── server.js └── README.md


## 🔧 Setup Instructions

1. **Clone the repo**

```bash
git clone https://github.com/your-username/vidtube.git
cd vidtube


## Install Dependencies
npm install

## .env

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
BASE_URL=http://localhost:5000

## Start Server
npm start

## Api Endpoints

🧪 API Endpoints (Sample)
Auth
POST /api/auth/signup

POST /api/auth/login

POST /api/auth/forgot-password

POST /api/auth/reset-password

Video
POST /api/videos/upload

GET /api/videos/:id

PUT /api/videos/:id

DELETE /api/videos/:id

PATCH /api/videos/:id/publish

Comments
POST /api/comments/:videoId

PUT /api/comments/:commentId

DELETE /api/comments/:commentId

Playlists
POST /api/playlists/

PUT /api/playlists/:playlistId

DELETE /api/playlists/:playlistId

POST /api/playlists/:playlistId/videos/:videoId (Add video)

DELETE /api/playlists/:playlistId/videos/:videoId (Remove video)

📬 Contact
For questions or suggestions, reach out to me at [prajapatiamresh03@gmail.com].

