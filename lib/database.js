const {MongoClient} = require("mongodb");
require('dotenv').config()

class Database{
    constructor(){
        this.name = 'Medpharmconsult';
        this.uri = process.env.DATABASE_URI;
        this.db;
        this.collection = {}

    }
    connect =(cb)=>{
        const client = new MongoClient(this.uri)
        client.connect()
        .then(()=>{
            console.log('connected to database')
            this.db = client.db(this.name)
            cb()
        })
        .catch(err=>{
             
            throw err
        })
    }
}


const database = new Database()

module.exports = database