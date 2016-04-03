module.exports = function(Items) {
	Items.observe('before save',function (ctx,next){
		// check if the hook is being called.
		console.log("before save hook instance");
		// console.log(ctx.Model.app.datasources.mongoDs.connector.getDefaultIdType());

		var ObjectID = ctx.Model.app.datasources.mongoDs.connector.getDefaultIdType();
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
};
