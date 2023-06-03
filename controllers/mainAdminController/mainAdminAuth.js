const database = require("../../lib/database")

const utilities = require("../../lib/utilities")


const mainAdminAuth = {}

mainAdminAuth.login = ('/login', async (req, res)=>{
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
      const mainAdminObj = await database.findOne({username: payload.username}, database.collection.mainAdmins)
            
      if(mainAdminObj){
        //check if the password from the client matches the password from the database
        if(payload.password === mainAdminObj.password){
          //send response
          const token = utilities.jwt('sign', {userID: mainAdminObj._id, tokenFor: "mainAdmin"})
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


module.exports = mainAdminAuth