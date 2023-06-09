const database = require('../lib/database')

class PendingUserUpdate{
    constructor(props){
        this.props = props;
    }
    save = ()=>{
        
        this.props.createdAt = new Date()

        return database.insertOne(this.props, database.collection.pendingUsersUpdates)
    }
    getPropsOne = (query, projection=null, operation=null)=>{
        if(projection && operation){
            return  database.findOne(query, database.collection.pendingUsersUpdates, projection, operation)
        }
        return database.findOne(query, database.collection.pendingUsersUpdates)

    }
    
    deleteOne = (query)=>{
        return database.deleteOne(query, database.collection.pendingUsersUpdates)
    }
}

module.exports = PendingUserUpdate