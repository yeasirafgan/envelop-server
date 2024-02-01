const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// generate token
const createToken = (_id) => {
  return jwt.sign({_id}, process.env.SECRET, {expiresIn: "3d"});
}

// register users
const registerUser = async (req,res) =>{
  const {name,email,password} = req.body;

  try{

  const exist = await userModel.findOne({email});

  if(exist){
    return res.status(400).json("Email already exist!");
  }
  
// validation

  if(!name || !email || !password){
    return res.status(400).json("All fields are required!");
  }

  if(!validator.isEmail(email)){
    return res.status(400).json("Invalid email!");
  }

  if(!validator.isStrongPassword(password)){
    return res.status(400).json("Password must be contain uppercase, lowercase, number, symbol and minimum 8+ characters!")
  }

// hash password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

// create an user
  const user = await userModel.create({name,email,password: hash})

// create a token
  const token = createToken(user._id);
  
  res.status(200).json({ _id: user._id, name, email, password: user.password, token })
  }
  catch(err){
    console.log(err);
    res.status(500).json(err)
  }
}

// login users

const loginUser = async (req,res) => {
  const {email, password} = req.body;

  try{
    const user = await userModel.findOne({email});

    if(!user){
      return res.status(400).json("Invalid email or password!");
    }

  // comparing password
  const isValidPass = await bcrypt.compare(password, user.password);

  if(!isValidPass){
    return res.status(400).json("Incorrect password!");
  }
  // create a token
  const token = createToken(user._id);
  res.status(200).json({_id: user._id, name: user.name, email, password: user.password, token})
  }catch(err){
    console.log(err);
    res.status(500).json(err)
  }
}

module.exports = {registerUser, loginUser};