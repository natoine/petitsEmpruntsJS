// app/models/loan.js
// load the things we need
const mongoose = require('mongoose')

const moment = require('moment')
moment().format()

// define the schema for our loan model
const loanSchema = mongoose.Schema({
	creator		: {type : mongoose.Schema.Types.ObjectId, ref : 'User'}, 
	loaner		: String, //idealy mail 
	borrower	: String, //idealy mail 
	what	: String,
	when	: String,
	lastreminder : String

})

// methods ======================
loanSchema.methods.getDelay = function() 
{
	moment.locale('fr')
	delay = moment(this.when, "D MMM YYYY").fromNow() 
	hours = moment.duration(moment(moment(),"D MMM YYYY").diff(moment(this.when, "D MMM YYYY"))).asHours()
	if(hours > 24) return delay
		else return "moins d'un jour"
}
// create the model for loans and expose it to our app
const configDB = require('../../config/database.js')
const db = mongoose.createConnection(configDB.url)
module.exports = db.model('Loan', loanSchema)