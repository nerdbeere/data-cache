var util = require('util');

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
util.inherits(BasicModel, AppModel);

module.exports.AppModel = AppModel;
module.exports.BasicModel = BasicModel;