const express = require("express");
const connectToDb = require("./config/connectToDb");
const xss = require("xss-clean");
const rateLimiting = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const { errorHandler, notFound } = require("./middlewares/error");
const cors = require("cors");
require("dotenv").config();

// Connect To Db
connectToDb();
//Init App
const app = express();

// Middlewares
app.use(express.json());

// Security Headers (helmet)
app.use(helmet());

// Prevent HTTP Parameter Pollution (hpp)
 app.use(hpp());
/*
 // Prevent NoSQL Injection attacks
 app.use(require("express-mongo-sanitize"));

 // Sanitize inputs
 app.use(express.urlencoded({ extended: true }));

 // Enable Cross-Origin Resource Sharing (CORS)
 app.use(cors());

 // Routes
app.use("/api/auth", require("./routes/authRoute"));
*/

// Prevent XSS(Cross Site Scripting) Attacks
app.use(xss());

// Rate Limiting
 const limiter = rateLimiting({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
 });

app.use(limiter);

// Cors policy
app.use(cors({
origin: process.env.CLIENT_DOMAIN // "http://localhost:3000"
}));

// Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/posts", require("./routes/postsRoute"));
app.use("/api/comments", require("./routes/commentsRoute"));
app.use("/api/categories", require("./routes/categoriesRoute"));
app.use("/api/password", require("./routes/passwordRoute"));

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

// Running The Server
const PORT = process.env.PORT || 8000
app.listen(PORT,()=>console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`));