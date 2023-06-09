const {ObjectId}  = require('mongodb')
// const fs = require('fs')
const database = require('./database')
const utilities = require('./utilities')
// const multer = require('multer')
// const path = require('path')
// const express = require('express')
// const router = express.Router()


const middleware = {}

middleware.bodyParser = (req, res, next)=>{
    let buffer = ''
    let exceededDataLimit = false
    req.on('data', (dataStream)=>{

        if(Buffer.byteLength(dataStream, 'utf8') > Math.pow(2, 24)){
            exceededDataLimit = true
        }
        buffer += dataStream
    })

    req.on('end', ()=>{
        if(!exceededDataLimit){
            req.body = buffer
            next()  
        }
        else{
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg:'Data sent is too large'}, true )
            
        }
        
    })
}


middleware.isJwtValid = async (req, res, next)=>{
  
    try{

        //check if there is token
        if(req.headers.authorization){
            // Extract token
            const token = req.headers.authorization?.split(' ')[1]

            // Check if the token is valid
            if(utilities.jwt('verify', token).isVerified){
                //check if token is blacklisted
                next()
              
            }
            else{
                utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `Unauthorized`}, true )
                return
            }

        }
        else{
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `Unauthorized`}, true )
            return 
        }
        
        

    }
    catch(err){
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: `Something went wrong with the server`}, true )
        throw err
    }
     
}



middleware.isJSON = (req, res, next)=>{
    //extract decoded token
    const decodedToken = req.decodedToken

    if(utilities.isJSON(req.body)){
        next()
    }
    else{
          
        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `Invalid format, payload should be in JSON format`}, true )  
    }
}


middleware.decodeToken = (req, res, next)=>{
    const token = req.headers.authorization.split(' ')[1]
    req.decodedToken = utilities.jwt('verify', token).decodedToken
    next()
}

middleware.isMainAdmin = (req, res, next)=>{
    const decodedToken = req.decodedToken

    if(decodedToken.tokenFor == "mainAdmin"){
        next()
    }
    else{
        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `User is not authorised to access this function`}, true )
    }

}

middleware.isAdmin = (req, res, next)=>{
    const decodedToken = req.decodedToken

    if(decodedToken.tokenFor == "mainAdmin" || decodedToken.tokenFor == "admin"){
        next()
    }
    else{
        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `User is not authorised to access this function`}, true )
    }

}

middleware.isUserValid = async (req, res, next)=>{
    
    decodedToken = req.decodedToken
    try {
        if(decodedToken.tokenFor == "admin"){
            const userObj = await database.findOne({_id: new ObjectId(decodedToken.userID)}, database.collection.admins, ["_id"], 1)
            if(userObj) next()
            else{
                utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `invalid user`}, true )
                return
            }
        }
        else if(decodedToken.tokenFor == "mainAdmin"){
            const userObj = await database.findOne({_id: new ObjectId(decodedToken.userID)}, database.collection.mainAdmins, ["_id"], 1)

            if(userObj) next()
            else{
                utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `invalid user`}, true )
                return
            }
        }
        else{
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `invalid user`}, true )
            return
        }

        
    } 
    catch (error) {
        console.log(error)
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: 'Something went wrong with server'}, true )
        return
        
    }

}


module.exports = middleware