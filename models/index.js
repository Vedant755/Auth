const mongoose = require('mongoose');

//connecting to database "mongodb+srv://admin:admin@cluster0.xpzz8wo.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect("mongodb://127.0.0.1:27017/bull-niveza", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Database connected successfully."))
.catch(err => console.log("Something went wrong Database connection.", err));