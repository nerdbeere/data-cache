function AppModel(data) {
	this.setData(data);
}

AppModel.prototype = {
	setData: function(data) {
		for(var key in data) {
			this[key] = data[key];
		}
	}
};

function BasicModel() {}

module.exports.AppModel = AppModel;
module.exports.BasicModel = BasicModel;