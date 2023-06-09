const database = require('../lib/database')

class Admin{
    constructor(props){
        this.props = props;
    }
    save = ()=>{
        this.props.createdAt = new Date().toLocaleString()

        return database.insertOne(this.props, database.collection.admins)
    }
    getPropsOne = (query, projection=null, operation=null)=>{
        if(projection && operation){
            return  database.findOne(query, database.collection.admins, projection, operation)
        }
        return database.findOne(query, database.collection.admins)

    }
    updateOne = (query, data)=>{
        return database.updateOne(query, database.collection.admins, data)
    }
    deleteOne = (query)=>{
        return database.deleteOne(query, database.collection.admins)
    }
}

module.exports = Admin