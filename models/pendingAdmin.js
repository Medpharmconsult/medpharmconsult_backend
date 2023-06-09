const database = require('../lib/database')

class PendingAdmin{
    constructor(props){
        this.props = props;
    }
    save = ()=>{
        
        this.props.createdAt = new Date()

        return database.insertOne(this.props, database.collection.pendingAdmins)
    }
    getPropsOne = (query, projection=null, operation=null)=>{
        if(projection && operation){
            return  database.findOne(query, database.collection.pendingAdmins, projection, operation)
        }
        return database.findOne(query, database.collection.pendingAdmins)

    }
    deleteOne = (query)=>{
        return database.deleteOne(query, database.collection.pendingAdmins)
    }
}

module.exports = PendingAdmin