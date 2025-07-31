# Copilot Instructions for Educate Project

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a MERN stack educational resource sharing platform called "Educate" designed for engineering students.

## Project Context
- **Purpose**: Platform for engineering students to share notes, books, blogs, recommendations, projects, etc.
- **Target Users**: Engineering students from different colleges and streams
- **Key Features**: Authentication, resource sharing, voting system, filtering, bookmarking, comments

## Technology Stack
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Multer
- **Frontend**: React, TypeScript, Material-UI, React Router, React Query, React Hook Form
- **Database**: MongoDB with User and Resource models

## Code Standards
- Use TypeScript for frontend components
- Follow React functional components with hooks
- Use Material-UI components for consistent styling
- Implement proper error handling and validation
- Use async/await for asynchronous operations
- Follow RESTful API conventions
- Implement proper authentication middleware

## Key Models
- **User**: Authentication, profile info, college, stream, year, reputation
- **Resource**: Title, description, type, category, files, votes, comments, bookmarks

## Engineering Streams Supported
Computer Science, Information Technology, Electronics & Communication, Electrical Engineering, Mechanical Engineering, Civil Engineering, Chemical Engineering, Aerospace Engineering, Biomedical Engineering, Industrial Engineering

## Resource Types
notes, book, blog, recommendation, project, assignment, research_paper

## Authentication Flow
- JWT-based authentication
- Protected routes for authenticated users
- User profile management
- Role-based access (student, moderator, admin)

## File Structure
- Backend: models/, routes/, middleware/, uploads/
- Frontend: components/, contexts/, types/, utils/
- Separate auth, pages, and common components

## Best Practices
- Always validate user input
- Implement proper error handling
- Use environment variables for configuration
- Follow security best practices
- Implement pagination for large datasets
- Use proper HTTP status codes
- Implement rate limiting for API endpoints
