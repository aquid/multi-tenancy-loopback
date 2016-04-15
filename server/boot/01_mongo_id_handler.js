module.exports = function(app){
	var mongoDs = app.datasources.mongoDs;
 	var ObjectID = mongoDs.connector.getDefaultIdType();
 	var RoleMapping = app.models.RoleMapping;

 	RoleMapping.defineProperty('principalId', {
 		type: ObjectID,
 	});
};