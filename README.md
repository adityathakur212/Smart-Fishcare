# Smart Fish Care

A web application for monitoring and managing aquariums with features for water quality tracking, automated feeding, and more.

## Features

- User authentication with JWT and bcrypt
- Dashboard for monitoring fish tank conditions
- Temperature, pH, and water level tracking
- User profile management

## Tech Stack

- **Frontend**: EJS templates, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt

## Project Structure

```
├── config/         # Database configuration
├── controllers/    # Application controllers
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── public/         # Static assets
├── routes/         # Application routes
├── utils/          # Utility functions
├── views/          # EJS templates
├── .env            # Environment variables
├── index.js        # Main application file
├── package.json    # Project dependencies
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Make sure MongoDB is running locally
4. Create a `.env` file with the following variables:
   ```
   PORT=3002
   MONGO_URI=mongodb://localhost:27017/smartfishcare
   JWT_SECRET=your_secret_key
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## Workflow

1. User signs up with name, email, and password
2. Data is stored in MongoDB with password hashed using bcrypt
3. User logs in and receives JWT token stored in cookies
4. Dashboard displays personalized user information and fish tank data

## API Endpoints

- `POST /api/signup`: Register a new user
- `POST /api/login`: Authenticate user and generate JWT
- `GET /api/logout`: Clear user session
- `GET /dashboard`: Protected route for user dashboard

## License

ISC 