'use strict';
var loopback =  require('loopback');
var utils = require('loopback-datasource-juggler/lib/utils');
var _ = require('underscore');

module.exports = function(Items) {

	Items.on('dataSourceAttached',function(obj){
		var originalCreate = Items.create;
		/*
		* Override the create mehtod to check for valid user and org
		* Allow if creatorId is same as current user id
		* Allow if orgId is same as current user organisation
		*/
    Items.create = function(){
      var data, callback;
      if (arguments && arguments.length>0) {
        data = arguments[0];
        var possibleCallbackArg = arguments[arguments.length-1]
        if (typeof possibleCallbackArg === 'function') {
          callback = possibleCallbackArg;
        }
      }

      var self = this;

      callback = callback || utils.createPromiseCallback();

      // get current context
      var currentContext = loopback.getCurrentContext();
      if (currentContext)  {
        // get current user id
        var currentUser = currentContext.get('currentUser');
        // get current user org id
        var organisation = currentContext.get('organisation');
        data.orgId = organisation.id; // TODO: probably a related method call will do this for you, so don't need to override?
        data.creatorId = currentUser.id; // TODO: probably a related method call won't do this for you, so override has some merit
        return originalCreate.call(self, arguments);
      }
      else {
        return originalCreate.call(self, arguments);
      }

      return callback.promise;
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
