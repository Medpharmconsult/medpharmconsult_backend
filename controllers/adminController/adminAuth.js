const {ObjectId}  = require('mongodb')
const MainAdmin = require("../../models/mainAdmin")
const Admin = require("../../models/admin")
const PendingAdmin = require("../../models/pendingAdmin")
const PendingUserUpdate = require("../../models/pendingUserUpdate")
const email = require('../../lib/email')

const utilities = require("../../lib/utilities")


const adminAuth = {}

adminAuth.login = ('/login', async (req, res)=>{
  //extract payload
  let payload = JSON.parse(req.body)

  try{
    //check if data is valid
    if(utilities.adminLoginVlidator(payload, ["username", "password"]).isValid){
      //remove white spaces
      payload = utilities.trimmer(payload)

      //hash the password
      payload.password = utilities.dataHasher(payload.password)

      //Check if the username exists
      const adminObj =  new Admin()
      const adminProps = await adminObj.getPropsOne({username: payload.username})
      //const adminObj = await database.findOne({username: payload.username}, database.collection.admins)
      if(adminProps){
        //check if the password from the client matches the password from the database
        if(payload.password === adminProps.password){
          //send response
          const token = utilities.jwt('sign', {userID: adminProps._id, tokenFor: "admin"})
          utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, mpcToken: token}, true )
        }
        else{
          utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: "wrong username or password"}, true )
          return
        }

      }
      else{
                
        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: "wrong username or password"}, true )
        return
      }

    }
    else{
      utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, errorData: utilities.adminLoginVlidator(payload, ["username", "password"])}, true )
      return
    }

  }
  catch(err){
    console.log(err)
    utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: 'Something went wrong with server'}, true )
    return
    }
})



adminAuth.updatePassword = ('/update-password', async (req, res)=>{
  //get the decoded token
  const decodedToken = req.decodedToken
  let payload = JSON.parse(req.body)
  
  try{

    let adminObj;
    decodedToken.tokenFor == "mainAdmin" ? adminObj = new MainAdmin() : adminObj = new Admin()
    
    //Check if the data sent is valid
    if(utilities.passwordValidator(payload).isValid){
  
      //remove all white spaces from user data if any
      payload = utilities.trimmer(payload)
  
      //get admin object
      const adminProps = await adminObj.getPropsOne({_id: new ObjectId(decodedToken.userID)})
      
      //hash the old and new password
      payload.oldPassword = utilities.dataHasher(payload.oldPassword)
      payload.newPassword = utilities.dataHasher(payload.newPassword)
  
      //check if old password in payload matches the password in the trader object
      if(payload.oldPassword === adminProps.password){
        //create new otp
        const newOtp = utilities.otpMaker()
  
        //delete a userID if it exist in the pendingUsersUpdates
        await new PendingUserUpdate().deleteOne({userID: new ObjectId(decodedToken.userID)})
        
        //insert the admin in the pendingUsersUpdates collection
        await new PendingUserUpdate({userID: new ObjectId(decodedToken.userID), otp: newOtp, dataToUpdate: {parameter: 'password', value: payload.newPassword}}).save()
        
        //send new otp to email
        await email.sendText('medpharmconsult7@gmail.com', adminProps.email, "OTP Verification", email.OtpMessage(adminProps.username, "password", newOtp))
  
        //send token
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, msg: "An OTP has been sent to your email"}, true )
  
      }
      else{
        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `Old password doesn't match the password of this trader`}, true )
        return
      }
  
    }
    else{
      utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `Invalid data, make sure password is 8 characters long`}, true )
      return
    }
  
  }
  catch(err){
    console.log(err)
    utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: 'Something went wrong with server'}, true )
    return
  }
  
})


adminAuth.verifyUpdateOtp = ('verify-update-otp', async (req, res)=>{
  //get the decoded token
  const decodedToken = req.decodedToken
  let payload = JSON.parse(req.body)
  
  try{
    let adminObj;
    decodedToken.tokenFor == "mainAdmin" ? adminObj = new MainAdmin() : adminObj = new Admin()
    
    //check if payload is valid
    if(utilities.otpValidator(payload).isValid){
      //extract data from the pendingUsersUpdates collection
      const pendingUserUpdateObj = new PendingUserUpdate()
      const pendingUserUpdateProps = await pendingUserUpdateObj.getPropsOne({userID: new ObjectId(decodedToken.userID)}, ['otp', 'dataToUpdate'], 1)
      
      //check if payload otp matches the otp in the userObj collection
      if(payload.otp === pendingUserUpdateProps.otp){
        //update the data of the admin
        await adminObj.updateOne({_id: new ObjectId(decodedToken.userID)}, {[pendingUserUpdateProps.dataToUpdate.parameter]: pendingUserUpdateProps.dataToUpdate.value})
       
        //delete user from pendingUsersUpdates collection
        await pendingUserUpdateObj.deleteOne({userID: new ObjectId(decodedToken.userID)})
  
        //send token
        utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, msg: "success"}, true )
      }
      else{
        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `This otp doesn't match the user`}, true )
        return
      }
  
    }
    else{
      utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `Invalid OTP`}, true )
      return
    }
     
  }
  catch(err){
    console.log(err)
    utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: 'Something went wrong with server'}, true )
    return
  }
  
  
})



adminAuth.updateEmail = ('/update-email', async (req, res)=>{
  //get the decoded token
  const decodedToken = req.decodedToken
  let payload = JSON.parse(req.body)
  
  try{
    let adminObj;
    decodedToken.tokenFor == "mainAdmin" ? adminObj = new MainAdmin() : adminObj = new Admin()
    
    //Check if the data sent is valid
    if(utilities.emailValidator(payload).isValid){
  
      //remove all white spaces from user data if any
      payload = utilities.trimmer(payload)

      //check if email already exists in admins and pendingAdmis and mainAdmins collection
      const doesEmailExistInMainAdmin = await new MainAdmin().getPropsOne({email: payload.email}, ["email"], 1)
      const doesEmailExistInAdmin = await new Admin().getPropsOne({email: payload.email}, ["email"], 1)
      const doesEmailExistInPendingAdmin = await new PendingAdmin().getPropsOne({email: payload.email}, ["email"], 1)

      if(!doesEmailExistInMainAdmin && !doesEmailExistInAdmin && !doesEmailExistInPendingAdmin){
        //hash the password
        payload.password = utilities.dataHasher(payload.password)
  
        //get admin object properties
        const adminProps = await adminObj.getPropsOne({_id: new ObjectId(decodedToken.userID)})
  
        //check if the payload password matches the password from the admin object property
        if(payload.password === adminProps.password){
          
          //add create otp
          const newOtp = utilities.otpMaker()
  
          //delete a userID if it exist in the pendingUsersUpdates
          await new PendingUserUpdate().deleteOne({userID: new ObjectId(decodedToken.userID)})
  
          //add user to pendingUsersUpdates collection
          await new PendingUserUpdate({userID: new ObjectId(decodedToken.userID), otp: newOtp, dataToUpdate: {parameter: 'email', value: payload.email}}).save()
          
          //send the new otp to the new email
          await email.sendText('medpharmconsult7@gmail.com', payload.email, "OTP Verification", email.OtpMessage(adminProps.username, "email", newOtp))
  
          //send token
          utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, msg: "An OTP has been sent to your new email"}, true )

        }
        else{
          utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `Invalid password`}, true )
          return
        }
      }
      else{
        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `Email already exists`}, true )
        return
      }
  
    }
    else{
      utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: utilities.emailValidator(payload).msg}, true )
      return
    }
  
  }
  catch(err){
    console.log(err)
    utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: 'Something went wrong with server'}, true )
    return
  }
  
})


adminAuth.updateUsername = ('/update-username', async (req, res)=>{
  //get the decoded token
  const decodedToken = req.decodedToken
  let payload = JSON.parse(req.body)
  
  try{
    let adminObj;
    decodedToken.tokenFor == "mainAdmin" ? adminObj = new MainAdmin() : adminObj = new Admin()
    
    //Check if the data sent is valid
    if(utilities.usernameValidator(payload).isValid){
  
      //remove all white spaces from user data if any
      payload = utilities.trimmer(payload)

      //check if username already exists in admins and pendingAdmis and mainAdmins collection
      const doesUsernameExistInMainAdmin = await new MainAdmin().getPropsOne({username: payload.username}, ["username"], 1)
      const doesUsernameExistInAdmin = await new Admin().getPropsOne({username: payload.username}, ["username"], 1)
      const doesUsernameExistInPendingAdmin = await new PendingAdmin().getPropsOne({username: payload.username}, ["username"], 1)

      if(!doesUsernameExistInMainAdmin && !doesUsernameExistInAdmin && !doesUsernameExistInPendingAdmin){
        //hash the password
        payload.password = utilities.dataHasher(payload.password)
  
        //get admin object properties
        const adminProps = await adminObj.getPropsOne({_id: new ObjectId(decodedToken.userID)})
      
        //check if the payload password matches the password from the trader object
        if(payload.password === adminProps.password){
          
          //add create otp
          const newOtp = utilities.otpMaker()
  
          //delete a userID if it exist in the pendingUsersUpdates
          await new PendingUserUpdate().deleteOne({userID: new ObjectId(decodedToken.userID)})
        
          //add user to pendingUsersUpdates collection
          await new PendingUserUpdate({userID: new ObjectId(decodedToken.userID), otp: newOtp, dataToUpdate: {parameter: 'username', value: payload.username}}).save()
           
          //send the new otp to the new email
          await email.sendText('medpharmconsult7@gmail.com', adminProps.email, "OTP Verification", email.OtpMessage(adminProps.username, "username", newOtp))
        
          //send token
          utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, msg: "An OTP has been sent to your email"}, true )

        }
        else{
          utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `Invalid password`}, true )
          return
        }
      }
      else{
        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `username already exist`}, true )
        return
      }
    }
    else{
      utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: utilities.usernameValidator(payload).msg}, true )
      return
    }
  
  }
  catch(err){
    console.log(err)
    utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: 'Something went wrong with server'}, true )
    return
  }
  
})

module.exports = adminAuth