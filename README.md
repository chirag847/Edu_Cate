# Educate - Engineering Resource Sharing Platform

Educate is a comprehensive MERN (MongoDB, Express.js, React, Node.js) stack application designed for engineering students to share and discover educational resources across different colleges and engineering streams.

## Features

- **User Authentication**: Secure registration and login system for students
- **Resource Sharing**: Upload and share notes, books, projects, assignments, and more
- **Smart Filtering**: Advanced filtering by category, type, semester, difficulty, and search
- **Voting System**: Upvote and downvote resources to maintain quality
- **Bookmarking**: Save interesting resources for later reference
- **Comments**: Engage with the community through comments
- **User Profiles**: View user statistics, uploaded resources, and achievements
- **Dashboard**: Personalized dashboard with activity overview
- **Multi-College Support**: Connect with students from different engineering colleges

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - Frontend library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - UI component library
- **React Router** - Navigation
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Yup** - Schema validation
- **Axios** - HTTP client

## Project Structure

```
educate/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Resource.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resources.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   └── pages/
│   │   ├── contexts/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── .env
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd educate
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure backend environment**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/educate
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   ```

5. **Configure frontend environment**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB**
   Make sure MongoDB is running on your system.

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:5000

3. **Start the frontend**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Resources
- `GET /api/resources` - Get all resources (with filtering)
- `GET /api/resources/:id` - Get single resource
- `POST /api/resources` - Create new resource
- `POST /api/resources/:id/vote` - Vote on resource
- `POST /api/resources/:id/bookmark` - Bookmark resource
- `POST /api/resources/:id/comment` - Add comment
- `GET /api/resources/:id/download/:fileIndex` - Download file

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/uploads` - Get user uploads
- `GET /api/users/:id/bookmarks` - Get user bookmarks
- `GET /api/users/leaderboard/top` - Get top users

## Supported Resource Types

- **Notes** - Study notes and lecture materials
- **Books** - Reference books and textbooks
- **Blogs** - Educational blog posts and articles
- **Recommendations** - Course and resource recommendations
- **Projects** - Academic and personal projects
- **Assignments** - Assignment solutions and examples
- **Research Papers** - Academic research papers

## Engineering Streams Supported

- Computer Science
- Information Technology
- Electronics & Communication
- Electrical Engineering
- Mechanical Engineering
- Civil Engineering
- Chemical Engineering
- Aerospace Engineering
- Biomedical Engineering
- Industrial Engineering

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Security headers with Helmet
- File upload restrictions

## Future Enhancements

- Real-time notifications
- Advanced search with Elasticsearch
- AI-powered content recommendations
- Mobile application
- Video content support
- Discussion forums
- Study groups and collaboration tools
- Gamification and achievements
- Integration with college systems

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository or contact the development team.
# Edu_Cate
