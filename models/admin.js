const database = require('../lib/database')

class Admin{
    constructor(props){
        this.props = props;
    }
    save = ()=>{
        this.props.createdAt = new Date().toLocaleString()

        return database.insertOne(this.props, database.collection.admins)
    }
}

module.exports = Admin