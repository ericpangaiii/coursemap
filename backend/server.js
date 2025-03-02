import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import router from "./routes.js"
import connectToMongoDB from "./database.js";

// load port number from .env file
dotenv.config();

// initialize the express app and enable CORS
const app = express();
app.use(cors()); 
app.use(express.json());
const corsOptions = {
    origin: ["http://localhost:5173/"],
}
app.use(cors(corsOptions));

// initialize the router
router(app);

// connect to the database
connectToMongoDB();

// start the server
app.listen(process.env.PORT, () => {
  console.log('Server has started on port ' + process.env.PORT);
});