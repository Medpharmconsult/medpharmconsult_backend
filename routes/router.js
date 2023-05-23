const express = require('express')
const router = express.Router()


const mainAdminAuth = require("../controllers/mainAdminController/mainAdminAuth")

const {bodyParser, isJwtValid, decodeToken, isJSON} = require('../lib/middleware')

router.get("/mainadmin/login", bodyParser, isJSON, mainAdminAuth.login)


module.exports = router