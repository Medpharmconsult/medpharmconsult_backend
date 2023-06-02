const database = require('../lib/database')

class PendingAdmin{
    constructor(props){
        this.props = props;
    }
    save = ()=>{
        
        this.props.createdAt = new Date()

        return database.insertOne(this.props, database.collection.pendingAdmins)
    }
}

module.exports = PendingAdmin