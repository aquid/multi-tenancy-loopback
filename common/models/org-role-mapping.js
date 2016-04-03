module.exports = function(OrgRoleMapping) {
	OrgRoleMapping.observe('before save',function (ctx,next){
		// check if the hook is being called.
		console.log("before save hook instance");
		// console.log(ctx.Model.app.datasources.mongoDs.connector.getDefaultIdType());

		var ObjectID = ctx.Model.app.datasources.mongoDs.connector.getDefaultIdType();
		if (ctx.instance && ctx.isNewInstance) {
			if(ctx.instance.orgUserId) {
				ctx.instance.orgUserId = new ObjectID(ctx.instance.orgUserId);
			}
			if(ctx.instance.orgRoleId) {
				ctx.instance.orgRoleId = new ObjectID(ctx.instance.orgRoleId);
			}
		}
		next();
	});
};
