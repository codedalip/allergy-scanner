const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const vision = require("@google-cloud/vision");

const checkAllergy = require("./utils/allergyChecker");


require("dotenv").config();



const foodDB = {
  pizza: ["milk", "gluten", "cheese"],
  burger: ["gluten", "egg"],
  padthai: ["peanut", "egg"],
  pasta: ["milk", "gluten"],
  salad: ["lettuce", "tomato"]
};


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: "vision-key.json"
});

app.use(cors());
// app.use(express.json());
app.use(express.json({
  limit: "10mb"
}));

app.use(express.urlencoded({
  limit: "10mb",
  extended: true
}));


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log(err));

app.post("/signup", async (req,res)=>{
  try {
    const {email,password} = req.body;

    const existing = await User.findOne({email});
    if(existing) return res.send("User already exists");

    const hash = await bcrypt.hash(password,10);

    const user = new User({
      email,
      password: hash
    });

    await user.save();

    res.send("Signup successful ✅");

  } catch(err){
    res.status(500).send(err);
  }
});

app.post("/login", async (req,res)=>{
  try {
    const {email,password} = req.body;

    const user = await User.findOne({email});
    if(!user) return res.send("User not found");

    const valid = await bcrypt.compare(password,user.password);
    if(!valid) return res.send("Wrong password");

    const token = jwt.sign(
      {id:user._id},
      "secret123"
    );

    res.json({
      message:"Login success ✅",
      token,
      userId:user._id
    });

  } catch(err){
    res.status(500).send(err);
  }
});

app.post("/save-allergies", async (req,res)=>{
  try {
    const { userId, allergies } = req.body;

    const user = await User.findById(userId);

    if(!user) return res.send("User not found");

    user.allergies = allergies.map(a =>
      a.toLowerCase().trim()
    );

    await user.save();

    res.send("Allergies saved ✅");

  } catch(err){
    res.status(500).send(err);
  }
});

app.post("/check-food", async (req,res)=>{
  try {

    const { userId, ingredients } = req.body;

    const user = await User.findById(userId);

    if(!user) return res.send("User not found");

    const result = checkAllergy(
      user.allergies,
      ingredients
    );

    res.json(result);

  } catch(err){
    res.status(500).send(err);
  }
});
app.post("/detect-food", async (req,res)=>{
  try {

    const base64 = req.body.image.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    const buffer = Buffer.from(base64,"base64");

    const [result] =
      await visionClient.labelDetection(buffer);

    const labels = result.labelAnnotations;

    const detectedFood = labels[0].description;

    res.json({
      food: detectedFood,
      confidence: labels[0].score
    });

  } catch(err){
  console.log("VISION ERROR:", err);
  res.status(500).send("Vision error");
}

});

app.post("/analyze-food", async (req,res)=>{
  try {

    const { userId, food } = req.body;

    const user = await User.findById(userId);
    if(!user) return res.send("User not found");

    const key = food.toLowerCase().replace(/\s/g,"");

    const ingredients = foodDB[key];

    if(!ingredients){
      return res.send("Food not found");
    }

    const result = checkAllergy(
      user.allergies,
      ingredients
    );

    res.json({
      food,
      ingredients,
      result
    });

  } catch(err){
    res.status(500).send(err);
  }
});



// test route
app.get("/", (req,res)=>{
  res.send("Backend running 🚀");
});

app.listen(3000, ()=>{
  console.log("Server running on port 3000");
});

app.get("/user/:id", async (req,res)=>{
  const user = await User.findById(req.params.id);
  res.json(user);
});
