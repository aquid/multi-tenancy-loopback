'use strict';
var _ = require('underscore');

module.exports = function(app){
	var Role = app.models.Role;
	/*
	* Dynamic role resolver for admins (orgAdmin) of a particular organisation
	* Checks for the user roles and only allows orgAdmin to execute
	*/
	Role.registerResolver('adminForOrg', function(role, context, cb) {
		function reject(err) {
			if(err) {
				return cb(err);
			}
			cb(null, false);
		}
		if(context.modelName !== 'organisation'){
			// return error if target model is not organisation
			return reject();
		}
		var currentUserId = context.accessToken.userId;
		var currentOrg = context.modelId;
		if(!currentUserId){
			// Do not allow unauthenticated users to proceed
			return reject();
		}
		if(currentOrg){
			var loobackCotext = app.loopback.getCurrentContext();
			var currentUserOrg = loobackCotext.get('organisation');
			var currentUserRoles = loobackCotext.get('userRoles');

			var isAdmin = _.findWhere(currentUserRoles,{name: 'orgAdmin'});
			// check if current organisation is equal to current users organisation 
			// and current user has role as orgAdmin
			if(!_.isEqual(currentOrg,currentUserOrg.id) || !isAdmin){
				// return if false
				return reject();
			}
			else {
				return cb(null,true);
			}
		}
	});

	/*
	* Dynamic role resolver for members(orgAdmin and storeAdmin) of organisation
	* Checks for the user roles and allows both orgAdmin and storeAdmin to execute
	*/
	Role.registerResolver('memberForOrg', function(role,context,cb){
		function reject(err) {  // return callback with error
			if(err) {
				return cb(err);
			}
			cb(null, false);
		}
		if(context.modelName !== 'organisation'){ 
			// return error if target model is not organisation
			return reject();
		}
		var currentUserId = context.accessToken.userId;
		var currentOrg = context.modelId;
		if(!currentUserId){
			// Do not allow unauthenticated users to proceed
			return reject();
		}
		if(currentOrg){
			var loobackCotext = app.loopback.getCurrentContext();
			var currentUserOrg = loobackCotext.get('organisation');
			var currentUserRoles = loobackCotext.get('userRoles');

			var isAdmin = _.findWhere(currentUserRoles,{name: 'orgAdmin'});
			var isStoreAdmin = _.findWhere(currentUserRoles,{name: 'storeAdmin'});

			// check if current organisation is equal to current users organisation 
			if(!_.isEqual(currentOrg,currentUserOrg.id)){

				reject();
			}
			else {
				 // check if current user has either of orgAdmin or storeAdmin roles 
				if(!isAdmin && !isStoreAdmin){
					// return if user is neither orgAdmin nor storeAdmin
					return reject();
				}
				else{
					// TODO: figure out a better way to attach the observer 
					//       and restrict the include filter for storeAdmins
					// NOTE: Not very sure if the syntax for attaching the observer 
					//       is correct. It works as expected but will have to figure 
					//       out a better way to do this
					var itemModel = app.models.items;
					if(typeof itemModel.observe === 'function'){
						itemModel.observe('access', (ctx, next) => {
							if(ctx.query.include && !isAdmin){
								// storeAdmin shouldn't be able to see the creator data. 
								//it shpuld only be allowed to orgAdmins
								delete ctx.query.include;
								return next();
							}
							else{
								return next();
							}
						});
					}
					return cb(null,true);
				}
			}
		}
	});
};