
const database = require("../../lib/database");
const Admin = require("../../models/admin")
const PendingAdmin = require("../../models/pendingAdmin")
const utilities = require("../../lib/utilities");


const adminController = {}

adminController.acceptInvitation = ('/acccept-invitation', async (req, res)=>{
    //get payload
  let payload = JSON.parse(req.body)
  
  try{
    
    //Check if the data sent is valid
    if(utilities.payloadValidator(payload, ["username", "otp"]).isValid){
  
      //remove all white spaces from user data if any
      payload = utilities.trimmer(payload)
  
      //get pending admin object
      const pendingAdminObj = new PendingAdmin()
      const pendingAdminProps = await pendingAdminObj.getPropsOne({username: payload.username})
      //const pendingAdminObj = await database.findOne({username: payload.username}, database.collection.pendingAdmins)

      if(pendingAdminProps){
        //check if otp from payload matches otp from pendingAdminObj
        if(payload.otp == pendingAdminProps.otp){
          //remove the otp
          delete pendingAdminProps.otp

          //delete pendingAdmin from the collection
          await pendingAdminObj.deleteOne({_id: pendingAdminProps._id})
          //await database.deleteOne({_id: pendingAdminObj._id}, database.collection.pendingAdmins)

          // transfer pendingAdminObj to admin collection
          await new Admin(pendingAdminProps).save()

          //send response
          utilities.setResponseData(res, 200, {'content-type': 'application/json'}, {statusCode: 200, msg: "success"}, true )
          return
        }
        else{
          utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: "OTP does not match"}, true )
          return

        }
      }
      else{
        utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: utilities.payloadValidator(payload, ["username, otp"]).msg}, true )
        return
      }
    }
    else{
      utilities.setResponseData(res, 400, {'content-type': 'application/json'}, {statusCode: 400, msg: utilities.payloadValidator(payload, ["username, otp"]).msg}, true )
      return
    }
  
  }
  catch(err){
    console.log(err)
    utilities.setResponseData(res, 500, {'content-type': 'application/json'}, {statusCode: 500, msg: 'Something went wrong with server'}, true )
    return
  }
})

module.exports = adminController