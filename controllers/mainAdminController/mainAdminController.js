
const database = require("../../lib/database")
const PendingAdmin = require("../../models/pendingAdmin")
const Admin = require("../../models/admin")
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

            //Check if the user username and email already exists in the pending Admins collection
            const pendingAdminObj = new PendingAdmin()
            const pendingAdminProps = await pendingAdminObj.getPropsOne({$and: [
                {username: payload.username}, {email: payload.email}
            ]})

            // const overwritePendingAdmin = await database.db.collection(database.collection.pendingAdmins).findOne({$and: [
            //     {username: payload.username}, {email: payload.email}
            // ]})

            if(pendingAdminProps){
                await pendingAdminObj.deleteOne({_id: pendingAdminProps._id})
                //await database.deleteOne({_id: overwritePendingAdmin._id}, database.collection.pendingAdmins)
            }

            //Check if the username or email exists
            let adminObj = await pendingAdminObj.getPropsOne({$or: [{username: payload.username}, {email: payload.email}]})
            //let adminObj = await database.findOne({$or: [{username: payload.username}, {email: payload.email}]}, database.collection.pendingAdmins)
            
        
            if(!adminObj){
                adminObj = await new Admin().getPropsOne({$or: [{username: payload.username}, {email: payload.email}]})
                //adminObj = await database.findOne({$or: [{username: payload.username}, {email: payload.email}]}, database.collection.admins)
                if(!adminObj){
                    //hash the password
                    payload.password = utilities.dataHasher(payload.password)

                    //make otp and add to payload
                    payload.otp = utilities.otpMaker()

                    //Add payload to pendingAdmins collection
                    await new PendingAdmin(payload).save()

                    //send email to pending admin
                    await email.sendHTML("medpharmconsult7@gmail.com", payload.email, "Admin Invitation", email.adminInvitationMessage(payload.username, payload.otp))

                    //Send response 
                    utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, msg: "An invitation has been sent to the potential Admin"}, true )
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


mainAdminController.deleteAdmin = ('/delete-admin', async (req, res)=>{
    //extract admin username
    let adminUsername = req.query.username

    try{
        //get admin obj
        const adminObj = new Admin() //.getObj({username: adminUsername})

        //get admin properties
        const adminProps = await adminObj.getProps({username: adminUsername})

        if(adminProps){
            //delete admin from database
            await adminObj.delete({username: adminUsername})
            //await database.deleteOne({username: adminUsername}, database.collection.admins)

            //Send email to dismissed admin to notify him/her of his removal
            await email.sendText("medpharmconsult7@gmail.com", adminProps.email, "Letter Of Dismissal", email.adminDismissalMessage(adminUsername))

            utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, msg: "Admin deleted sucessfully"}, true )
            return
        }
        else{
            utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: "This username does not exist"}, true )
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