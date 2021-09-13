

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const passport = require('passport');
const nodemailer = require('nodemailer');
const load = require('lodash');
var ObjectId = require('mongoose').Types.ObjectId;
const Employee = require('../models/data');
const responses = require('../helpers/responses');
const photo = require('../fileupload/fileuploadController');
let path = require("path");

let fs = require('fs');

//const check = photo.upload.single

const jwt = require('jsonwebtoken');
const jsonPath = path.join(__dirname,'./employee.json');




  // router.post('/Google',(req,res)=>{
  //   let fetchedUser;
  //    Employee.findOne({email:req.body.email}).then(result =>{
  //     fetchedUser = result;
  //     console.log(fetchedUser,"user fetch")
  //      if(!fetchedUser){
  //       var newUser = new Employee(req.body);
  //       newUser.save((err,save)=>{
  //         if(err){
  //           next(err);
  //         }else{
  //           let payLoad = {subject:save._id}
  //             jwt.sign(payLoad,'secretkey',(err,token)=>{
  //               res.status(200).json({
  //                  "success":true,
  //                  token
  //                 // responses.responseSuccessJSON(200,"success","user added successfully")
  //               });
  //             })
           
  //         }
  //       })
  //      }else{
  //       const payloadsss = {userName:fetchedUser.userName}
  //       jwt.sign(payloadsss,'secretkey',(err,token)=>{
  //         res.status(200).json({
  //           "success":true,
  //           token
  //        });
  //       })
  //       // res.json(responses.responseSuccessJSON(200,"success","user retrived successfully"))
  //     }
  //    }).catch(err => console.log(err))
  // })

 

  //test-googlelogin
  router.post('/Google',(req,res,next)=>{
    let fetchedUser;
   
  
    Employee.findOne({name:req.body.name},(err,user)=>{
      if(err){
        next(err)
      }
      fetchedUser = user;
      console.log(fetchedUser,"user fetched");
      if(!user){
        var newUser = new Employee(req.body);
        newUser.save((err,save)=>{
          if(err){
            next(err);
          }else{
            let payLoad = {subject:save._id}
              jwt.sign(payLoad,'secretkey',(err,token)=>{
                res.status(200).json({
                   "success":true,
                   token
                  // responses.responseSuccessJSON(200,"success","user added successfully")
                });
              })
          }
        })
      }else{
        const payloadsss = {userName:fetchedUser.userName}
        jwt.sign(payloadsss,'secretkey',(err,token)=>{
          res.status(200).json({
            "success":true,
            token,
            fetchedUser
         });
        })
        // res.json(responses.responseSuccessJSON(200,"success","user retrived successfully"))
      }
    })
     
  })

  //test-Fb login
  router.post('/Facebook',(req,res,next)=>{
    let fetchedUser;
    Employee.findOne({name:req.body.name},(err,user)=>{
      if(err){
        next(err)
      }
      fetchedUser = user;
      console.log(fetchedUser,"user fetched");
      if(!user){
        var newUser = new Employee(req.body);
        newUser.save((err,save)=>{
          if(err){
            next(err);
          }else{
            let payLoad = {subject:save._id}
              jwt.sign(payLoad,'secretkey',(err,token)=>{
                res.status(200).json({
                   "success":true,
                   token,
                  
                  // responses.responseSuccessJSON(200,"success","user added successfully")
                });
              })
          }
        })
      }else{
        const payloadsss = {fbUserName:fetchedUser.fbUserName}
        jwt.sign(payloadsss,'secretkey',(err,token)=>{
          res.status(200).json({
            "success":true,
            token,
            fetchedUser
         });
        })
        // res.json(responses.responseSuccessJSON(200,"success","user retrived successfully"))
      }
    })
     
  })

  //login with google

  // router.get('/google',passport.authenticate('google',{
  //   scope:['profile']
  // }))

  //google-redirect
  // router.get('/google/redirect',passport.authenticate('google'),(req,res) =>{
  //      res.redirect('/employees/')
  //    // res.send("welcome")
  // })
  
  
  ////=> localhost:8080/employees/login
router.post('/login',(req,res)=>{
  let fetchedUser;
  let username = req.body.name;
  let email    = req.body.email;
  console.log(username,"name")
    console.log(email,"email")
  let conditions = !!email ? {username: username} : {email: email};

  Employee.findOne(conditions).then(result=>{
      if(!result){
          return res.status(401).json({
              message:'login failed wrong email entered',
              "success":false,
              result:result
          });
      }
        fetchedUser = result;
       return bcrypt.compare(req.body.password,result.password);
  }).then(result =>{
       if(!result){
           return res.status(401).json({
               message:'login failed wrong password entered',
               "success":false,
               result:result
           })
       }else{
           const payload = {email:fetchedUser._id}
           console.log(req.body.password,"hash password")
          jwt.sign(payload,'secretkey',(err,token)=>{
             
              if(err){
                console.log(err)
              }
              res.json({
                "success":true,
                token,
                fetchedUser
              });
            });
      }
  })
  .catch(err => console.log(err));
  
})


function verifytoken(req,res,next){
   // auth header value
    const bearerHeader = req.headers['x-access-token']
   //  check if bearer is undefined
    if( typeof bearerHeader !== 'undefined'){
   //    split token
   //   const split = bearerHeader.split(' ')
   //    assign to another
   //   const assign = split[1];
   //    set token
      req.token = bearerHeader
       //next
     next();
    }else{
      res.sendStatus(403);
    }

 }



//  function verifytoken(req,res,next){
//   //auth header value
//    const bearerHeader = req.headers['authorization']
//    //check if bearer is undefined
//    if( typeof bearerHeader !== 'undefined'){
//      //split token
//   //   const split = bearerHeader.split(' ')
//      //assign to another
//   //   const assign = split[1];
//      //set token
//      req.token = bearerHeader;
//      //next
//        next();
//    }else{
//      res.sendStatus(403);
//    }

// }

//=> localhost:8080/employees/
router.get('/', verifytoken, (req , res) =>{
  jwt.verify(req.token,'secretkey',(err)=>{
      if(err){
       res.sendStatus(403)
      }else{
      //   res.json({
      //     message:'welcome',
      //     data
      //   })
      Employee.find((err,docs) =>{
          if(!err) {res.send(docs);}
          else {console.log('Error in retriving Employess: '+JSON.stringify(err,undefined,2));}
      });
      }
    }) 
});


router.get('/postmanCheck',verifytoken,(req,res)=>{

  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.sendStatus(403)
    }else{
      res.send("example of postman token")
    }
  })
  
  // res.send("example of postman token")
  // res.send("example of postman token")
})


//search with id
router.get('/:id',verifytoken,(req , res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(!err){
      if(!ObjectId.isValid(req.params.id))
      return res.status(400).send(`no record with given id: ${req.params.id}`);
      Employee.findById(req.params.id,(err,doc) => {
          if (!err) {res.send(doc);}
          else {console.log('Error in retreving employee: '+JSON.stringify(err,undefined,2));}
      });

    }else{
      console.log(err,"error")
    }
  })
   
});


//re-set pwd link

router.put('/forgot-passwordlink',(req,res)=>{
  Employee.findOne({email:req.body.email}).then(result=>{
    console.log(result,"result fetched..")
    if(!result){
        // return res.status(400).json({
        //     message:'user with this mail not exists',
        //     result:result
        // });
        return res.json(responses.responseErrorJSON(401,"error","user with these mail not available"))
     //   response.json(utill.responseErrorJSON(401, "error", error));
    }

    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: 'sairampyla96@gmail.com',
        pass: 'SaiRamPyla@123'
      }
    });
    
    let payLoad = {_id:result._id}
    let token = jwt.sign(payLoad,'secretkey',{expiresIn:'120s'})
    var mailOptions = {
        from: 'samplemail@gmail.com',
        to: req.body.email,
        subject: 'Password Reset',
        // text: 'That was easy!',
        html:`   
          <h2>Please click on the below link to reset your password </h2>
          <p>http://autoexpo-sai.herokuapp.com/resetPassword/${token}</p> 
          
        `
    }; 
     return Employee.updateOne({name:result.name},{resetLink:token}).then(result =>{
       if(!result){
         return res.json(responses.responseErrorJSON(400,"error","error"))
       }else{
            transporter.sendMail(mailOptions).then(result =>{
              if(!result){
                return res.json(responses.responseErrorJSON(400,"error","error"))
              }
              return res.json(responses.responseSuccessJSON(200, "success", "Email has been sent successfully"));
          
              
            })
          }
     })
  }).catch(err =>{console.log(err)})
})

//Reset-password
router.put('/changePassword',(req,res)=>{
  let check = req.body;
  console.log(check,"actual req.body checking..")
  let {resetLink,newPass} = req.body;
  console.log(resetLink,"reset link console")
  console.log(newPass,"newPass console")
  if(resetLink){
  jwt.verify(resetLink,"secretkey",(error,decodedData)=>{
    if(error){
      return res.status(401).json({
        message:"In correct token or it is expired"
      })
    }
     
    Employee.findOne({resetLink},(err,user) =>{
      if(err || !user){
        return res.status(401).json({
          message:"user with this token does not exists"
        })
      }
    
      let salt = bcrypt.genSaltSync(10);
      newPasss = bcrypt.hashSync(newPass,salt);

      const obj ={
        password:newPasss,
        resetLink:''
      }
      
      user = load.extend(user,obj)

      user.save((err,result) => {
        if(err){
          return res.status(401).json({
            message:"reset password error"
          })
        }else{
          return res.status(200).json({
            message:"Password has been changed successfully ..pls login with new one"
          })
        }
      })

    })
  })

  }else{
    return res.status(401).json({
      message:'user with this email does not exists'
    })
  }

})

//change-Password
router.put('/newPassword/:id',(req,res)=>{
  
 let passwordFetch = req.body.password;
 console.log(passwordFetch,"pwd from user");

 let hashedPwd;
 let saltPassword = bcrypt.genSaltSync(10);
 hashedPwd = bcrypt.hashSync(passwordFetch,saltPassword);
 console.log(hashedPwd,"hashed pwd")

Employee.findByIdAndUpdate(req.params.id,{password:hashedPwd},{new:true}, (err,doc)=>{
  if(!err) {
    // res.send(doc);
    return res.json(responses.responseSuccessJSON(200, "success", "password has been change successfully"));
  }
  else {
    console.log(err)
    return res.json(responses.responseErrorJSON(400,"error","error"))
  }


})


  // bcrypt.hash(passwordFetch, 10).then((hash) => {
       
  //   passwordFetch = hash;
  //   console.log(passwordFetch,"pwd from haash");
  //   Employee.findByIdAndUpdate(req.params.id,{password:passwordFetch},{new:true}, (err,doc)=>{
  //     if(!err) {
  //       // res.send(doc);
  //       return res.json(responses.responseSuccessJSON(200, "success", "password has been change successfully"));
  //     }
  //     else {
  //       console.log(err)
  //       return res.json(responses.responseErrorJSON(400,"error","error"))
  //     }


  //   })
  //       .catch(error => {
  //           res.status(500).json({
  //               error: error
  //           });
  //       });
  //   });
})



//add employee
router.post('/', photo.upload.single('file'),(req,res) =>{

  // const reqFiles = []
 
  // for (var i = 0; i < req.files.length; i++) {
  //   reqFiles.push(req.files[i].filename)
  // }

   //const url = req.protocol + '://' + req.get('host')

  const reqFiles = req.file.filename;
 console.log(reqFiles,"filename");

 if(!reqFiles){
   return res.send("error occured")
 }


  Employee.find({email:req.body.email}).then(resp =>{
      if(resp.length !=0){
          return res.json({
              data:[],
              success:false,
              msg:"Email already exists"
          })
      }
      else{
        let postData = req.body

        let haash = '';
        let salt = bcrypt.genSaltSync(10);
      haash = bcrypt.hashSync(postData.password,salt);

           let postdata = req.body.name;
           let postPwd = req.body.password;
           console.log(postdata,"name we given")
           console.log(postPwd,"pwd we given")
          var emp = new Employee({
              // name:req.body.name,
              // email:req.body.email,
              // 
              // joiningDate:req.body.joiningDate,
              // country:req.body.country,
              // phone:req.body.phone,
              // gender:req.body.gender,
              ...req.body,
              password:haash,
              file:reqFiles
          });
          emp.save((err,doc)=>{
              // if(!err) {res.send(doc);}
              // else {console.log('Error in Employee save: '+JSON.stringify(err,undefined,2));}
              if(err){
                  console.log(err);
              }else{
                
        
                  let payLoad = {subject:doc._id}
                  let token = jwt.sign(payLoad,'secretkey')
                  res.status(200).json({
                      token:token,
                      success:true,
                      
                  })
                
                  
              }
          });
      }
  })
});

//Edit employee
router.put('/:id',(req,res)=>{
  // const reqFile = req.file.filename
  // console.log(reqFile,"filename");
 
  // if(!reqFile){
  //   return res.send("error occured")
  // }

  photo.upload.single('file')(req,res,function(error){
      const files = req.file
                           
      if(files){

        let fileRes = files.filename
        console.log(`upload.single error: ${error}`);
        if(!ObjectId.isValid(req.params.id))
        return res.status(400).send(`no record with given id: ${req.params.id}`); 
        else{
          
         // let postData = req.body
          // let haash = '';
          // let saltRounds = 10;
          // let salt = bcrypt.genSaltSync(saltRounds);
          //  let salt = bcrypt.genSalt(10);
          // haash = bcrypt.hashSync(postData.password,salt);

        //   let haash = '';
        //   let salt = bcrypt.genSaltSync(10);
        // haash = bcrypt.hashSync(postData.password,salt);
        //   console.log(haash,"hashing pwd");
    var emp = {
        //  name:req.body.name,
        //  email:req.body.email,
        //  joiningDate:req.body.joiningDate,
        //  country:req.body.country,
        //  phone:req.body.phone,
        //  gender:req.body.gender,
        ...req.body,
         file:fileRes
         
    };
    Employee.findByIdAndUpdate(req.params.id,{$set:emp},{new:true},(err ,doc)=>{
      if(!err) {
                   
      
        // res.send(doc);
        res.status(200).json({
          // token:token,
          doc:doc,
          success:true,
          
      })
      }
      else {console.log(err)}
  });

        }
    

      }else{

        if(!ObjectId.isValid(req.params.id))
        return res.status(400).send(`no record with given id: ${req.params.id}`); 
        else{

          let postData = req.body.password
          let postData1 = req.body.name
          let postData2 = req.body.email

           console.log(postData,"new pwd")
           console.log(postData1,"new name")
           console.log(postData2,"new email")

         
        //   let haash = '';
        //   let salt = bcrypt.genSaltSync(10);
        //   console.log(salt,"saltt")
        // haash = bcrypt.hashSync(postData,salt);
        
                // Store hash in your password DB.
                  //  console.log(haash,"hashpwd")
                var emp = {
                  // name:req.body.name,
                  // email:req.body.email,
                  // joiningDate:req.body.joiningDate,
                  // country:req.body.country,
                  // phone:req.body.phone,
                  // gender:req.body.gender,
                 // file:req.body.file
                 ...req.body
                  
             };
             Employee.findByIdAndUpdate(req.params.id,{$set:emp},{new:true},(err ,doc)=>{
                 if(!err) {
                              
                 
                 //  res.send(doc);
                 res.status(200).json({
                  // token:token,
                  doc:doc,
                  success:true,
                  
              })
                  }
                 else {console.log(err)}
             });
          
    

    
        }
      }
   });
    // code
});


//Delete Employee
router.delete('/:id',(req,res)=>{
    if(!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
    Employee.findByIdAndRemove(req.params.id,(err,doc)=>{
        if(!err) {res.send(doc);}
        else {console.log('Error in Employee Delete')}
    })
});


//in-valid URL
router.get("*",(req,res)=>{
  res.send("Sorry, this is an Invalid URL...")
})


module.exports = router;





