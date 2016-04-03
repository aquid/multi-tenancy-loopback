module.exports = function(OrgUser) {
	
	OrgUser.observe('before save',function (ctx,next){
		// check if the hook is being called.
		console.log("before save hook instance of orgUser");
		// console.log(ctx.Model.app.datasources.mongoDs.connector.getDefaultIdType());

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
};
