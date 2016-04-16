'use strict';
var _ = require('underscore');

module.exports = function(app){
	var Role = app.models.Role;
	Role.registerResolver('adminForOrg', function(role, context, cb) {
		function reject(err) {
			if(err) {
				return cb(err);
			}
			cb(null, false);
		}
		if(context.modelName !== 'organisation'){
			return reject();
		}
		var currentOrg = context.modelId;

		var loobackCotext = app.loopback.getCurrentContext();
		var currentUserOrg = loobackCotext.get('organisation').id;
		var currentUserRoles = loobackCotext.get('userRoles');
		
		var isAdmin = _.findWhere(currentUserRoles,{name: 'orgAdmin'});

		if(!_.isEqual(currentOrg,currentUserOrg) || !isAdmin){
			reject();
		}
		else {
			cb(null,true);
		}
	});
};