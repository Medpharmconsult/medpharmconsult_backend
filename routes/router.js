const express = require('express')
const router = express.Router()


const mainAdminAuth = require("../controllers/mainAdminController/mainAdminAuth")

const {bodyParser, isJwtValid, decodeToken, isJSON} = require('../lib/middleware')



//MAIN ADMIN
router.get("/mainadmin/login", bodyParser, isJSON, mainAdminAuth.login)
router.put("/mainadmin/update-password", bodyParser, isJwtValid, decodeToken, isJSON, mainAdminAuth.updatePassword)
router.put("/mainadmin/verify-update-otp", bodyParser, isJwtValid, decodeToken, isJSON, mainAdminAuth.verifyUpdateOtp)
router.put('/mainadmin/update-email', bodyParser, isJwtValid, decodeToken, isJSON, mainAdminAuth.updateEmail)
router.put('/mainadmin/update-username', bodyParser, isJwtValid, decodeToken, isJSON, mainAdminAuth.updateUsername)

module.exports = router