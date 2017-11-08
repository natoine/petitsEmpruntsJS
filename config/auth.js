
// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'sessionsecret' : process.env.sessionsecretPetitsEmprunts, //passport needs this for sessions
    'facebookAuth' : {
        'clientID'      : process.env.clientIDFBPetitsEmprunts, // your App ID
        'clientSecret'  : process.env.clientSecretFBPetitsEmprunts, // your App Secret
        'callbackURL'   : process.env.callbackURLFBPetitsEmprunts
    },
    'googleAuth' : {
        'clientID'      : process.env.clientIDGGPetitsEmprunts,
        'clientSecret'  : process.env.clientSecretGGPetitsEmprunts,
        'callbackURL'   : process.env.callbackURLGGPetitsEmprunts
    }

}