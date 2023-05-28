const express = require('express')
const router = express.Router()


const mainAdminAuth = require("../controllers/mainAdminController/mainAdminAuth")

const {bodyParser, isJwtValid, decodeToken, isJSON} = require('../lib/middleware')



//MAIN ADMIN
router.get("/mainadmin/login", bodyParser, isJSON, mainAdminAuth.login)
router.put("/mainadmin/update-password", bodyParser, isJwtValid, decodeToken, isJSON, mainAdminAuth.updatePassword)


module.exports = router