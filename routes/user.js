const express = require("express");
const router = express.Router(); 
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (username.length < 5)  {
      return res.status(400).json({ message: "Username must have 5 characters" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must have 6 characters" });
    }

    const existingEmail = await User.findOne({ email: email });
    const existingUsername = await User.findOne({ username: username });
    if (existingEmail || existingUsername) {
      return res
      .status(400)
      .json({ message: "Username or email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPass });
    await newUser.save();
    return res.status(200).json({ message: "Account created" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

//SignIn Route
router.post("/signin", async(req, res) =>{
  try {
    const {email, password} = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
//check user exists
const existingUser = await User.findOne({ email: email });
if (!existingUser) {
  return res.status(400).json({ message: "Invalid Credentials" });
}

//check is matched or not
const isMatch = await bcrypt.compare(password,existingUser.password)
if (!isMatch) {
  return res.status(400).json({ message: "Invalid Credentials" });
}

//Generate JWT token 
const token = jwt.sign({id:existingUser._id, email:existingUser.email},
   process.env.JWT_SECRET, 
   {expiresIn:"30d"});

   //cookie generation
   res.cookie("podcasterUserToken", token, {
    httpOnly:true, 
    maxAge:30 * 24 * 60 * 60 * 1000, //30days
    secure:process.env.NODE_ENV === "production",
    sameSite:"None",
  });
  return res.status(200).json({
    id:existingUser._id,
    username:existingUser.username, 
    email:email,
    message:"Sign-in Successfull"
  })
  } catch (error) {
    res.status(500).json({ error });
  };

  

})

//Logout Route
router.post("/logout", async(req, res)=>{
  res.clearCookie("podcasterUserToken",{
    httpOnly:true,
  });
  res.status(200).json({message:"Logged Out"});
});

//chekc cookie present or not
router.get("/checkcookie", async(req, res)=>{
  const token = req.cookies.podcasterUserToken;
  if(token)
  {
    res.status(200).json({message:true});
  }
  res.status(200).json({message:false});
});

//Route to Fetch user details
router.get("/userdetails",authMiddleware, async(req, res)=>{
  try {
    const {email} = req.user;
    const existingUser = await User.findOne({email:email}).select(
      "-password"
    );
    return res.status(200).json({
      user:existingUser,  
    })
  } catch (error) {
    res.status(500).json({message:error})
  }
});


module.exports = router;
