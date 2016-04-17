module.exports = function(app){
	var mongoDs = app.datasources.mongoDs;
 	var ObjectID = mongoDs.connector.getDefaultIdType();
 	var RoleMapping = app.models.RoleMapping;
 	var orgUser = app.models.orgUser;
 	var Role = app.models.Role;

 	RoleMapping.defineProperty('principalId', {
 		type: ObjectID,
 	});
 	
 	RoleMapping.belongsTo(orgUser);
    orgUser.hasMany(RoleMapping, {foreignKey: 'principalId'});
    orgUser.hasMany(Role, {through: RoleMapping, foreignKey: 'principalId'});
	Role.hasMany(orgUser, {through: RoleMapping, foreignKey: 'roleId'});
};