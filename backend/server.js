const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");
dotenv.config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//connect to database
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})