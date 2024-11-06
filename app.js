import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import cors from 'cors';
import userModel from './userSchema.js'; 
import jwt from 'jsonwebtoken';
import userVerifyMiddle from './userVerify.js';

const app = express();
const PORT = process.env.PORT || 5000;
const DBURI = process.env.MONGODB_URI;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// Middleware
app.use(cors());
app.use(express.urlencoded({extended: true}))
app.use(express.json());

// Check for required environment variables
if (!DBURI) {
    console.error("Error: MONGODB_URI is not set in the environment.");
    process.exit(1);
}

// Connect to MongoDB without deprecated options
mongoose.connect(DBURI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("Initial MongoDB connection error:", err);
        process.exit(1);
    });

// Routes

// Signup route
app.post('/signup', async (req, res) => {
    try {
        const { name, username, password } = req.body;

        if (!name || !username || !password) {
            return res.json({
                message: "Required fields are missing",
                status: false,
            });
        }

        // Check if username already exists
        const existingUser = await userModel.findOne({ username });
        if (existingUser) {
            return res.statusCode(304).json({
                message: "Username already exists",
                status: false,
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const createuser = await userModel.create({
            name,
            username,
            password: hashedPassword,
        });

        res.statusCode(200).json({
            message: "User created successfully",
            status: true,
            data: createuser,
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
});

// Login route with added debugging
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Log the request body for debugging
        console.log("Login request body:", req.body);

        // Validate input
        if (!username || !password) {
            return res.json({
                message: "Required fields are missing",
                status: false,
            });
        }

        const user = await userModel.findOne({ username });
        console.log("Found user:", user); 
        
        if (!user) {
            return res.json({
                message: "User not found",
                status: false,
            });
        }
        
  
        const isPasswordValid = await bcrypt.compare(password, user.password);
     
        
        if (!isPasswordValid) {
            return res.json({
                message: "Password does not match",
                status: false,
            });
        }
        
        // JWT token
        const token = jwt.sign({ username: user.username }, JWT_SECRET_KEY);
        console.log("Generated token:", token); 

        return res.json({
            message: "Login successful",
            status: true,
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
});


//api protected
app.get('/getusers', userVerifyMiddle, async (req, res) => {
    try {
      const users = await userModel.find({});
      res.json({
        message: "All users retrieved successfully",
        status: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving users",
        status: false
      });
    }
  });

// Start server once MongoDB connection is open
mongoose.connection.once("open", () => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
