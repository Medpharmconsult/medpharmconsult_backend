const express = require('express')
const router = express.Router()


const mainAdminAuth = require("../controllers/mainAdminController/mainAdminAuth")
const mainAdminController = require("../controllers/mainAdminController/mainAdminController")
const adminAuth = require("../controllers/adminController/adminAuth")
const adminController = require("../controllers/adminController/adminController")

const {bodyParser, isJwtValid, decodeToken, isMainAdmin, isAdmin, isUserValid, isJSON} = require('../lib/middleware')



//MAIN ADMIN AUTH
router.get("/mainadmin/login", bodyParser, isJSON, mainAdminAuth.login)

//MAIN ADMIN CONTROLLER
router.post('/mainadmin/add-admin', bodyParser, isJwtValid, decodeToken, isMainAdmin, isJSON, mainAdminController.addAdmin)
router.delete('/mainadmin/delete-admin', isJwtValid, decodeToken, isMainAdmin, mainAdminController.deleteAdmin)

//ADMIN AUTH
router.get("/admin/login", bodyParser, isJSON, adminAuth.login)
router.put("/admin/update-password", bodyParser, isJwtValid, decodeToken, isUserValid, isJSON, adminAuth.updatePassword)
router.put("/admin/verify-update-otp", bodyParser, isJwtValid, decodeToken, isUserValid, isJSON, adminAuth.verifyUpdateOtp)
router.put('/admin/update-email', bodyParser, isJwtValid, decodeToken, isUserValid, isJSON, adminAuth.updateEmail)
router.put('/admin/update-username', bodyParser, isJwtValid, decodeToken, isUserValid, isJSON, adminAuth.updateUsername)

//ADMIN CONTROLLER
router.post('/admin/accept-invitation', bodyParser, isJSON, adminController.acceptInvitation)

//PROFESSIONAL AUTH

//PROFESSIONAL CONTROLLER
module.exports = router