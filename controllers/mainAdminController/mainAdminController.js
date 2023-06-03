const {ObjectId}  = require('mongodb')
const database = require("../../lib/database")
const PendingAdmin = require("../../models/pendingAdmin")
const email = require('../../lib/email')

const utilities = require("../../lib/utilities")


const mainAdminController = {}

mainAdminController.addAdmin = ('/add-admin', async (req, res)=>{
    //extract payload
    let payload = JSON.parse(req.body)

    try{
        //check if data is valid
        if(utilities.adminSignupValidator(payload, ["username", "email", "password"]).isValid){
            //remove white spaces
            payload = utilities.trimmer(payload)

            //Check if the username or email exists
            let adminObj = await database.findOne({$or: [{username: payload.username}, {email: payload.email}]}, database.collection.pendingAdmins)
           

            if(!adminObj){

                adminObj = await database.findOne({$or: [{username: payload.username}, {email: payload.email}]}, database.collection.admins)
                if(!adminObj){
                    //hash the password
                    payload.password = utilities.dataHasher(payload.password)

                    //make otp and add to payload
                    payload.otp = utilities.otpMaker()

                    //Add payload to pendingAdmins collection
                    await new PendingAdmin(payload).save()

                    //send email to pending admin
                    await email.sendAdminInvitation("medpharmconsult7@gmail.com", payload.email, "Admin Invitation", email.adminInvitationMessage(payload.username, payload.otp))

                    //Send response 
                    utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, msg: "Admin added successfully"}, true )
                    return
                }
                else{
                    if(payload.username == adminObj.username){
                        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: "This username already exists"}, true )
                        return
                    }
    
                    utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: "This email already exists"}, true )
                    return

                }
               
            }
            else{
                if(payload.username == adminObj.username){
                    utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: "This username already exists"}, true )
                    return
                }

                utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: "This email already exists"}, true )
                return
            }
            
        }
        else{
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: utilities.adminLoginVlidator(payload, ["username", "password"]).msg}, true )
            return
        }

    }
    catch(err){
        console.log(err)
        utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: 'Something went wrong with server'}, true )
        return

    }
})

module.exports = mainAdminController