
// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1079544955481974', // your App ID
        'clientSecret'  : 'ff01fca2fde21f39ddc721c8c120edba', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'lyvHGhVhl4BeKgcPnnFp70tEM',
        'consumerSecret'    : 'wK7883X7JAZYqwSI4X3F0Ib1PFj4t136J2jv5pSXu3furUIJd7',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '874888543519-a8afvjr34eefjvilogc14qs06b99jjip.apps.googleusercontent.com',
        'clientSecret'  : 'cIzip__4Gtqio5vEqRvgiPth',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

}
