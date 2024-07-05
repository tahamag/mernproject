const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 8000 ;
const DbUri = process.env.mongoDbUri;
const User = require('./models/user');
const bcrypt = require('bcryptjs/dist/bcrypt');

app.get('/' ,(req ,res) =>{
    return res.status(200).send('welcome to my app');
})
app.use(express.urlencoded({extended:true}));
app.use(express.json());
 
// route for sing up
app.post('/singup', async (req , res)=>{
    const { email } = req.body;
    const userExist = await User.findOne({ email });
  
    // on vérifie si l'email existe ou pas, dans le cas où il est déjà dans la DB
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "E-mail already exists",
      });
    }
      // on crée un nouvel utilisateur avec les données du formulaire
      try {
          const user = await User.create(req.body);
          res.status(201).json({
          success: true,
          user,
          });
      } catch (error) {
          console.log(error);
          res.status(400).json({
          success: false,
          message: error.message,
          });
      }
});
// route fo singin

app.get('/singin', async (req , res)=>{
   
      try {
        const { email , password } = req.body;
        if(!email || !password){
            res.status(400).json({
                success: false,
                message: 'please enter valid email and password',
              });
        }else{
            // Verify user password
            const user  = await User.findOne({ email });

            if(user == null){
                res.status(404).json({
                    success: false,
                    message: 'invalid email',
                });
            }else{
                const isMatched = await user.comparePassword(password);
                if (!isMatched) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid password",
                    });
                }
                res.status(201).json({
                    success: true,
                    user,
                });
            }
            
        }
      } catch (error) {
          console.log(error);
          res.status(400).json({
            success: false,
            message: error.message,
          });
      }
});


mongoose
    .connect(DbUri)
    .then(() =>{
        console.log("App connected successfully");
        
        app.listen(port,()=>{
            console.log(`app is listing on port :${port}`);
        })
    })
    .catch((error)=>{
        console.log("data base connection error :"+error);
    })