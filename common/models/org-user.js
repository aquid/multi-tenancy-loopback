'use strict';
var loopback =  require('loopback');
var utils = require('loopback-datasource-juggler/lib/utils');
var _ = require('underscore');
var secretKey = 'd6F3Efeq'; // TODO: Include it from a file with encrytion and decryption

module.exports = function(OrgUser) {
	OrgUser.on('dataSourceAttached',function(obj){
		var override = OrgUser.create;
		/*
		* Override the create mehtod and check for the user role and orgID of current user
		* If no accessToken is present check for secretAccessKey
		* Allow organisation admins to create user
		*/
		OrgUser.create = function(credentials,include,cb){
			var self = this;

			if (typeof include === 'function') {
				cb = include;
				include = undefined;
			}
			cb = cb || utils.createPromiseCallback();
			// Get the mongodb _id object.
			var error;
 			var ObjectID = OrgUser.app.datasources.mongoDs.connector.getDefaultIdType();
			var currentContext = loopback.getCurrentContext(); // get current context
			var accessToken = currentContext.get('accessToken');
			var roles = currentContext.get('userRoles'); // get user roles
			var organisation = currentContext.get('organisation'); // get current user org id
			if(!accessToken){
				if(credentials.secretAccessKey  === secretKey){ 
					// if secretAccessKey matches then create is invoked from organistion
					delete credentials.secretAccessKey;
				}
				else{
					error = new Error('Access Denied');
					error.status =401;
					cb(error);
				}
			}
			else{
				/*
				* Check if the user is having admin permisions for the given
				* organisation and the oraganisation id is the same as payload
				*/
				var isAdmin = _.findWhere(roles,{name: 'orgAdmin'});
				if(isAdmin){ // allow if admin
					if(_.isEqual(new ObjectID(credentials.orgId),organisation.id)){
						// console.log('Orgs are equal');
					}
					else{
						error = new Error('Incorrect organisation data');
						error.status = 404;
						cb(error);
					}
				}
				else{
					error = new Error('Access Denied');
					error.status =403;
					cb(error);
				}
			}
			Promise.resolve().then(function(){
				override.call(self, credentials, include, cb);
			})
			.catch(cb);
			return cb.$promise;
		};
	});

	
	OrgUser.observe('before save',function (ctx,next){
		// check if the hook is being called.
		// console.log('before save hook instance of orgUser');

		var ObjectID = ctx.Model.app.datasources.mongoDs.connector.getDefaultIdType();
		if (ctx.instance && ctx.isNewInstance) {
			if(ctx.instance.orgId) {
				ctx.instance.orgId = new ObjectID(ctx.instance.orgId);
			}
			ctx.instance.createdAt = new Date();
			ctx.instance.modifiedAt =  new Date();
		} else {
			ctx.instance.modifiedAt = new Date();
		}
		next();
	});

	OrgUser.observe('after save',function(ctx,next){
		var ObjectID = ctx.Model.app.datasources.mongoDs.connector.getDefaultIdType();
		if(ctx.instance && ctx.isNewInstance){
			
			// find or create a role named storeAdmin 
			ctx.Model.app.models.orgRole.findOrCreate(
				{where: {name: 'storeAdmin'}}, // find
      			{name : 'storeAdmin',description:'admin of the store belonging to a organisation'} // or create
			)
			.then(function(role){ // Get the orgRole
				var roleMapper = {
					orgRoleId : role[0].id,
					orgUserId : ctx.instance.id
				};
				// Create the mapping between orgUser and orgRole
				return ctx.Model.app.models.orgRoleMapping.create(roleMapper);
			})
			.then(function(mapping){ 
				next();
			})
			.catch(function(error){
				next(error);
			});
		}
	});

	OrgUser.disableRemoteMethod('createChangeStream', true);
	OrgUser.disableRemoteMethod('findChangeStream', true);
	OrgUser.disableRemoteMethod('updateAll', true);
	OrgUser.disableRemoteMethod('confirm', true);
	OrgUser.disableRemoteMethod('count', true);
	OrgUser.disableRemoteMethod('find', true);
	OrgUser.disableRemoteMethod('findOne', true);
	OrgUser.disableRemoteMethod('upsert', true);
	OrgUser.disableRemoteMethod('reset', true);

	OrgUser.disableRemoteMethod('__count__accessTokens', false);
	OrgUser.disableRemoteMethod('__create__accessTokens', false);
	OrgUser.disableRemoteMethod('__delete__accessTokens', false);
	OrgUser.disableRemoteMethod('__destroyById__accessTokens', false);
	OrgUser.disableRemoteMethod('__findById__accessTokens', false);
	OrgUser.disableRemoteMethod('__get__accessTokens', false);
	OrgUser.disableRemoteMethod('__updateById__accessTokens', false);

	OrgUser.disableRemoteMethod('__count__orgRoles', false);
	OrgUser.disableRemoteMethod('__create__orgRoles', false);
	OrgUser.disableRemoteMethod('__delete__orgRoles', false);
	OrgUser.disableRemoteMethod('__destroyById__orgRoles', false);
	OrgUser.disableRemoteMethod('__findById__orgRoles', false);
	OrgUser.disableRemoteMethod('__get__orgRoles', false);
	OrgUser.disableRemoteMethod('__updateById__orgRoles', false);
	OrgUser.disableRemoteMethod('__link__orgRoles', false);
	OrgUser.disableRemoteMethod('__unlink__orgRoles', false);

	OrgUser.disableRemoteMethod('__count__orgRoleMappings', false);
	OrgUser.disableRemoteMethod('__create__orgRoleMappings', false);
	OrgUser.disableRemoteMethod('__delete__orgRoleMappings', false);
	OrgUser.disableRemoteMethod('__destroyById__orgRoleMappings', false);
	OrgUser.disableRemoteMethod('__findById__orgRoleMappings', false);
	OrgUser.disableRemoteMethod('__get__orgRoleMappings', false);
	OrgUser.disableRemoteMethod('__updateById__orgRoleMappings', false);
};
