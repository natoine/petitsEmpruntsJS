// app/models/loan.js
// load the things we need
const mongoose = require('mongoose')

// define the schema for our user model
const loanSchema = mongoose.Schema({
	loaner		: String, //idealy mail 
	borrower	: String, //idealy mail 
	what	: String,
	when	: String

})

// methods ======================

// create the model for loans and expose it to our app
const configDB = require('../../config/database.js')
const db = mongoose.createConnection(configDB.url)
module.exports = db.model('Loan', loanSchema)