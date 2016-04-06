'use strict'
var loopback = require('loopback');

module.exports = function(){
	return function currentUser(req,res,next){
		// console.log("in the middleware"); // check if the middleware is working
		var loopbackContext = loopback.getCurrentContext();
		if(loopbackContext) {
			// console.log(req);
			if(!req.accessToken){
				return next();
			}
			else {
				// console.log(typeof req.accessToken.userId); check the id of the user is of type BSON object
				loopbackContext.set('accessToken', req.accessToken);
				// find the user from the token include its roles and organisation
				req.app.models.orgUser.findById(req.accessToken.userId,{include:[
					{
						relation:'orgRoles',
						scope : {
							fields: ['name'] // only include the role name and id
						}
					}, 
					{
						relation: 'organisation',
						scope : {
							fields: ['name'] // only inclue the organisation name and ids
						}
					}
				]})
				.then(function(user){
					if(!user){
						return next(new Error('No user with this access token was found.'));
					}
					else{
						/*
						* Get the current user data with fetch its roles and organisation.
						* set current user to context.
						* set user roles to constext. 
						* set user organisation to context.
						*/
						loopbackContext.set('currentUser', user);
			          	loopbackContext.set('userRoles', user.orgRoles);
			          	loopbackContext.set('organisation', user.ororganisationgRoles);
			          	next();
					}
				})
				.catch(function(err){
					next(err);
				})
			}
		}
		else{
			next();
		}
	}
}