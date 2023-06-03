const express = require('express')
const router = express.Router()


const mainAdminAuth = require("../controllers/mainAdminController/mainAdminAuth")
const mainAdminController = require("../controllers/mainAdminController/mainAdminController")
const adminAuth = require("../controllers/adminController/adminAuth")

const {bodyParser, isJwtValid, decodeToken, isMainAdmin, isAdmin, isJSON} = require('../lib/middleware')



//MAIN ADMIN AUTH
router.get("/mainadmin/login", bodyParser, isJSON, mainAdminAuth.login)

//MAIN ADMIN CONTROLLER
router.post('/mainadmin/add-admin', bodyParser, isJwtValid, decodeToken, isMainAdmin, isJSON, mainAdminController.addAdmin)

//ADMIN AUTH
router.get("/admin/login", bodyParser, isJSON, adminAuth.login)
router.put("/admin/update-password", bodyParser, isJwtValid, decodeToken, isJSON, adminAuth.updatePassword)
router.put("/admin/verify-update-otp", bodyParser, isJwtValid, decodeToken, isJSON, adminAuth.verifyUpdateOtp)
router.put('/admin/update-email', bodyParser, isJwtValid, decodeToken, isJSON, adminAuth.updateEmail)
router.put('/admin/update-username', bodyParser, isJwtValid, decodeToken, isJSON, adminAuth.updateUsername)

module.exports = router