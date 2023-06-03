// const {ObjectId}  = require('mongodb')
// const fs = require('fs')
const utilities = require('./utilities')
// const database = require('./database')
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
        
        // Extract token
        const token = req.headers.authorization?.split(' ')[1]

        // Check if the token is valid
        if(utilities.jwt('verify', token).isVerified){
            //check if token is blacklisted
            next()
              
        }
        else{
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: `Unauthorized`}, true )
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


module.exports = middleware