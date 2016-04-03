// module.exports = function(app){
// 	var User = app.models.user;
// 	var organisation = app.models.organisation;
// 	var ds = app.dataSources.mongoDs;

// 	User.belongsTo(organisation, {foreignKey: 'orgId'});

// 	// Because of this: https://github.com/strongloop/loopback-connector-mongodb/issues/128
// 	User.defineProperty('orgId', {
// 		type: ds.ObjectID,
// 	});
	
// 	console.log(ds.ObjectID);
// }