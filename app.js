const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const userApi = require("./routes/user");
const catApi = require("./routes/categories");
const PodcastApi = require("./routes/podcast");


require("dotenv").config();
require("./conn/conn")
app.use(express.json());
app.use(cookieParser());

//all routes
app.use("", userApi);
app.use("", catApi);
app.use("", PodcastApi);


app.listen(process.env.PORT, ()=>{
    console.log(`Server started on port: ${process.env.PORT}`);
});