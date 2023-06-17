require('dotenv').config();
require('./models/index')
const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser')
const authRoute = require("./routes/auth.routes.js");

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Bull Niveza application." });
});
app.use('/api', authRoute)

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});