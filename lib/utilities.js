const crypto = require('crypto')
const jwt = require('jsonwebtoken') 
require('dotenv').config()

const utilities = {}

utilities.isJSON = (data)=>{
    try{
        JSON.parse(data)
        return true
    }
    catch{
        return false
    }
}

utilities.setResponseData = (res, status, headers, data, isJSON)=>{
    res.status(status)
    const headerKeys = Object.keys(headers)
    for(key of headerKeys){
        res.set(key, headers[key])
    }

    if(isJSON){
        res.json(data)
    }
    else{res.send(data)}

    return res.end()
}


utilities.dataHasher = (data)=>{
    if(typeof data == "string" && data.length > 0){

        return crypto.createHmac("sha256", process.env.HASH_STRING).update(data).digest('hex')
    }
    return false
}

utilities.jwt = (operation, data)=>{
    if(operation == 'sign'){
        return jwt.sign(data, process.env.JWT_KEY, {expiresIn: '1h'} )
    }
    if(operation == 'verify'){
        return jwt.verify(data, process.env.JWT_KEY, (err, payload)=>{
            if(err){
                return {isVerified: false}
            }
        
            return {isVerified: true, decodedToken: payload}
        })
    }  
}

utilities.trimmer = (data)=>{
    const trimmedData = {}

    for(i in data){
        trimmedData[i] = data[i].trim()
    }

    return trimmedData
}



utilities.adminLoginVlidator = (data, expectedData)=>{
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9-_]+$/
    const dataKeys = Object.keys(data) 
    if(dataKeys.length === expectedData.length){
        for(let i of dataKeys){
            if(i === "username" && (typeof data[i] !== "string" || !usernameRegex.test(data[i].trim()))){
                return {
                    isValid: false,
                    errorField: i,
                    msg: `${i} should be a string and it should not be empty`
                }
            }

            if(i === "password" && (typeof data[i] !== "string" || data[i].trim().length < 1 )){
                return {
                    isValid: false,
                    errorField: i,
                    msg: `${i} should be a string and it should not be empty`
                }
            }
        }

        return{
            isValid: true,
            errorField: null,
        }

    }
    else{
        return {
            isValid: false,
            msg: `incomplete data or unrequired data detected`
        }
    }
}

utilities.passwordValidator = (data)=>{
    if(data.newPassword){
        if(typeof data.newPassword === "string"){
            if(data.newPassword.length >= 8){
                if(!data.newPassword.includes(' ')){
                    return {
                        isValid: true
                    }
                }
                else{
                    return {
                        isValid: false,
                        msg: `the password should not contain a space`
                    }
                    
                }
            }
            else{
                return {
                    isValid: false,
                    msg: `password should have 8 or more characters`
                }
            }

        }
        else{
            return {
                isValid: false,
                msg: `password should be in string format`
            } 
        }
    }
    else{
        return {
            isValid: false,
            msg: "No new password found."
        }
    }
}

utilities.otpValidator = (data)=>{
    if(data.otp && typeof data.otp === "string" && data.otp.length === 4){
        return {
            isValid: true
        }
    }
    else{
        return {
            isValid: false
        }
    }
}


utilities.emailValidator = (data)=>{
    const emailRegex = /^[a-zA-Z0-9\+\.]+@[a-zA-Z]+\.[a-z]+$/
    if(data.email && typeof data.email === 'string' && emailRegex.test(data.email.trim())){
        return {
            isValid: true
        }
    }
    else{
        return {
            isValid: false,
            msg: "invalid email, make sure email is valid and in string format"
        }
    }
}


utilities.usernameValidator = (data)=>{
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9-_]+$/

    if(data.username && typeof data.username === 'string' && usernameRegex.test(data.username.trim())){
        return {
            isValid: true
        }
    }
    else{
        return {
            isValid: false,
            msg: "invalid username, make sure your username is valid and in string format"
        }
    }
}

utilities.otpMaker = ()=>{
    let otp = ''
    const max = 9
    const min = 0
    for(i = 0; i < 4; i++){
       otp += Math.floor(Math.random() * (max - min + 1)) + min
    }
    return otp   
}


module.exports = utilities