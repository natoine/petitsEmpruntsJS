// app/models/friendlist
// load the things we need
const mongoose = require('mongoose')

// define the schema for our friendlist model
const friendlistSchema = mongoose.Schema({
	creator		: {type : mongoose.Schema.Types.ObjectId, ref : 'User'}, 
	friendid	: {type : mongoose.Schema.Types.ObjectId, ref : 'User'},
    friendname : String,
   	friendmail : String
})

// create the model for frienlist and expose it to our app
const configDB = require('../../config/database.js')
const db = mongoose.createConnection(configDB.url)
module.exports = db.model('Friendlist', friendlistSchema)