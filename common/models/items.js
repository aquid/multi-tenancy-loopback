'use strict';
var loopback =  require('loopback');
var utils = require('loopback-datasource-juggler/lib/utils');
var _ = require('underscore');

module.exports = function(Items) {
	
	Items.on('dataSourceAttached',function(obj){
		var override = Items.create;
		/*
		* Override the create mehtod to check for valid user and org
		* Allow if creatorId is same as current user id
		* Allow if orgId is same as current user organisation
		*/
		Items.create = function(credentials,filters,callback){
			var self = this;

			if (typeof include === 'function') {
				callback = filters;
				filters = undefined;
			}

			callback = callback || utils.createPromiseCallback();
			// Get the mongodb _id object.
			var error;
			var mongoDs = Items.app.datasources.mongoDs;
 			var ObjectID = mongoDs.connector.getDefaultIdType();
 			// get current context
			var currentContext = loopback.getCurrentContext();
			// get current user id 
			var currentUser = currentContext.get('currentUser');
			// get current user org id
			var organisation = currentContext.get('organisation'); 
			/*
			* Check if the user is same as passed in the credentials
			* Check if the current user org is same as the credentials org
			*/
			var equalOrg = _.isEqual(new ObjectID(credentials.orgId),organisation.id);
			var equalUsr = _.isEqual(new ObjectID(credentials.creatorId),currentUser);
			if(equalOrg && equalUsr){
				// callback(null);
			}
			else{
				console.log('error');
				error = new Error('Invalid credentials');
				error.status = 404;
				callback(error);
				return Promise.reject(error);
			}

			Promise.resolve().then(function(){
				override.call(self, credentials, filters, callback);
			})
			.catch(callback);
			return callback.$promise;
		};
	});


	Items.observe('before save',function (ctx,next){
		// check if the hook is being called.
		// console.log('before save hook instance of items');
		var mongoDs = Items.app.datasources.mongoDs;
 		var ObjectID = mongoDs.connector.getDefaultIdType();

		if (ctx.instance && ctx.isNewInstance) {
			if(ctx.instance.orgId) {
				ctx.instance.orgId = new ObjectID(ctx.instance.orgId);
			}
			if(ctx.instance.creatorId) {
				ctx.instance.creatorId = new ObjectID(ctx.instance.creatorId);
			}
			ctx.instance.createdAt = new Date();
			ctx.instance.modified =  new Date();
		} else {
			ctx.data.modified = new Date();
		}
		next();
	});

	Items.validatesPresenceOf('orgId');
	Items.validatesPresenceOf('creatorId');
};
