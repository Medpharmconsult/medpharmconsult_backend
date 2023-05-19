const express = require('express')

//const router = require('./routes/router')

//const utilities = require('./lib/utilities')
const database = require('./lib/database')

const app = express()

const port = process.env.PORT || 5000

app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization')
    //module.exports = res
    next()
})

//app.use(router)


database.connect(()=>{
    app.listen(port)
    console.log('connected to server')
})
