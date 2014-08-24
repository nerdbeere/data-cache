function Collection() {
	this._data = [];
}

Collection.prototype = {
	push: function(model) {
		this._data.push(model);
	},
	getModelById: function(id) {
		for(var i = 0; i < this._data.length; i++) {
			if(id === this._data[i].id) {
				return this._data[i];
			}
		}
		return null;
	},
	getLength: function() {
		return this._data.length;
	}
};

module.exports = Collection;