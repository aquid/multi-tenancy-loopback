module.exports = function(OrgRole) {
	OrgRole.observe('before save',function (ctx,next){
		// check if the hook is being called.
		console.log("before save hook instance of orgRole");
		// console.log(ctx.Model.app.datasources.mongoDs.connector.getDefaultIdType());

		var ObjectID = ctx.Model.app.datasources.mongoDs.connector.getDefaultIdType();
		if (ctx.instance && ctx.isNewInstance) {
			if(ctx.instance.userId) {
				ctx.instance.userId = new ObjectID(ctx.instance.userId);
			}
			ctx.instance.createdAt = new Date();
			ctx.instance.modified =  new Date();
		} else {
			ctx.data.modified = new Date();
		}
		next();
	});

};
