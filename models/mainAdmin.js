const database = require('../lib/database')

class MainAdmin{
    constructor(props){
        this.props = props;
    }
    getPropsOne = (query, projection=null, operation=null)=>{
        if(projection && operation){
            return  database.findOne(query, database.collection.mainAdmins, projection, operation)
        }
        return database.findOne(query, database.collection.mainAdmins)

    }
    updateOne = (query, data)=>{
        return database.updateOne(query, database.collection.mainAdmins, data)

    }
    deleteOne = (query)=>{
        return database.deleteOne(query, database.collection.mainAdmins)
    }
}

module.exports = MainAdmin