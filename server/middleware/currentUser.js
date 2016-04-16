'use strict';
var loopback = require('loopback');

module.exports = function(){
	return function currentUser(req,res,next){
		// console.log('in the middleware'); // check if the middleware is working
		var loopbackContext = loopback.getCurrentContext();
		if(loopbackContext) {
			// console.log(req.app);
			if(!req.accessToken){
				return next();
			}
			else {
				// console.log(typeof req.accessToken.userId); check the id of the user is of type BSON object
				loopbackContext.set('accessToken', req.accessToken);
				// find the user from the token include its roles and organisation
				req.app.models.orgUser.findById(req.accessToken.userId,{include:[
					{
						relation:'roles',
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
						// console.log(user);
						// console.log(user.organisation);
						/*
						* Get the current user data with fetch its roles and organisation.
						* set current user to context.
						* set user roles to constext. 
						* set user organisation to context.
						*/
						loopbackContext.set('currentUser', user);
						user.roles(function(err,roles){
							if(err){
								return next(new Error('User does not have any roles to perform action.'));
							}
							else {
								loopbackContext.set('userRoles', roles);
								user.organisation(function(err,org){
									if(err){
										return next(new Error('User does not have any roles to perform action.'));
									}
									else {
										loopbackContext.set('organisation', org);
										next();
									}
								});
							}
						});
					}
				})
				.catch(function(err){
					next(err);
				});
			}
		}
		else{
			next();
		}
	};
};