# Project Backend Setup and Overview

## Table of Contents
- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Dependencies](#dependencies)

---

## Introduction
This document provides instructions for setting up and running the backend of the project. It also outlines the structure and key features of the backend codebase.

---

## Prerequisites
Ensure the following software is installed on your system:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **npm** (Node Package Manager) - Comes with Node.js.
3. **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
4. **Git** - [Download here](https://git-scm.com/)

---

## Environment Variables
Create a `.env` file in the root directory of the project and add the following environment variables:

```env
# Server Configuration
PORT=5000

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/your_database_name

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
```

---

## Installation
Follow these steps to set up the backend project:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/your-repository.git
   ```

2. **Navigate to the Project Directory:**
   ```bash
   cd your-repository
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Start MongoDB Server:**
   Ensure MongoDB is running on your local machine or a remote server specified in `MONGO_URI`.

---

## Running the Project

### Development Mode
Run the following command to start the backend server in development mode:
```bash
npm run dev
```
This will use `nodemon` to watch for file changes and restart the server automatically.

### Production Mode
Run the following command to start the server in production mode:
```bash
npm start
```

### Accessing the Server
Once the server is running, access it at:
```
http://localhost:<PORT>
```

## API Documentation
This backend includes the following key APIs:

### Authentication
1. **POST /api/auth/register** - Register a new user.
2. **POST /api/auth/login** - Authenticate a user and return tokens.
3. **POST /api/auth/refresh** - Refresh access tokens using a refresh token.

### User Management
1. **GET /api/users/:id** - Get user details.
2. **PUT /api/users/:id** - Update user information.

### File Upload
1. **POST /api/upload** - Upload a file to the server or Cloudinary.

More API details can be added as the project grows.

---

## Dependencies
The project uses the following key dependencies:

### Core Dependencies
- **express**: Web framework for Node.js
- **mongoose**: MongoDB object modeling tool
- **dotenv**: Load environment variables from `.env` file
- **bcryptjs**: Password hashing
- **jsonwebtoken**: Token-based authentication
- **multer**: File upload middleware
- **cloudinary**: Cloudinary API for image and video management

### Development Dependencies
- **nodemon**: Monitor file changes during development

To view all dependencies, check the `package.json` file.

---

## Contribution Guidelines
-  Fork the repository.
-  Create a new branch for your feature or bugfix.
- Submit a pull request with a detailed description of your changes.

---

## License
This project is licensed under the [SweAbhishek](LICENSE).

---

## Contact
For any queries or issues, contact:
- **Email**: Abhishekgajananraut@gmail.com
- **GitHub**: [Abhishekraut01](https://github.com/Abhishekraut01)

