const express = require('express')
const router = express.Router()


const mainAdminAuth = require("../controllers/mainAdminController/mainAdminAuth")
const mainAdminController = require("../controllers/mainAdminController/mainAdminController")

const {bodyParser, isJwtValid, decodeToken, isMainAdmin, isJSON} = require('../lib/middleware')



//MAIN ADMIN AUTH
router.get("/mainadmin/login", bodyParser, isJSON, mainAdminAuth.login)
router.put("/mainadmin/update-password", bodyParser, isJwtValid, decodeToken, isJSON, mainAdminAuth.updatePassword)
router.put("/mainadmin/verify-update-otp", bodyParser, isJwtValid, decodeToken, isJSON, mainAdminAuth.verifyUpdateOtp)
router.put('/mainadmin/update-email', bodyParser, isJwtValid, decodeToken, isJSON, mainAdminAuth.updateEmail)
router.put('/mainadmin/update-username', bodyParser, isJwtValid, decodeToken, isJSON, mainAdminAuth.updateUsername)

//MAIN ADMIN CONTROLLER
router.post('/mainadmin/add-admin', bodyParser, isJwtValid, decodeToken, isMainAdmin, isJSON, mainAdminController.addAdmin)

module.exports = router