var asap = require('asap');
var inflect = require('i')();
var Subscription = require('./subscription');

function Cache() {
	this._cache = {};
	this._subscriptions = [];
	this._modelRegistry = {};
}

Cache.prototype = {
	subscribe: function(collectionName, id) {
		var s = new Subscription(collectionName, id);
		var that = this;
		this._subscriptions.push(s);
		if(id) {
			var model = this.getModelById(collectionName, id);
			if(model) {
				asap(function() {
					s.emit('data', model);
				});
			}
		} else {
			if(this.getCollectionLength(collectionName) > 0) {
				asap(function() {
					s.emit('data', that.getCollection(collectionName));
				});
			}
		}
		asap(function() {
			s.emit('subscribersNotified');
		});
		return s;
	},
	fill: function(dataArr) {
		var models = [];
		dataArr.forEach(function(data) {
			var model = this._createModel(data);
			var collectionName = inflect.pluralize(model.type);
			if(!model) return;
			if(!this._cache[collectionName]) {
				this._cache[collectionName] = [];
			}
			this._cache[collectionName].push(model);
			models.push(model);
		}, this);
		this._callSubscribers(models);
	},
	getCollection: function(collectionName) {
		if(!this._cache[collectionName]) return null;
		return this._cache[collectionName];
	},
	getCollectionLength: function(collectionName) {
		if(!this._cache[collectionName]) return 0;
		return this._cache[collectionName].length;
	},
	registerModel: function(modelName, constructor) {
		if(this._modelRegistry[modelName]) {
			throw 'model already exists';
		}
		this._modelRegistry[modelName] = constructor;
	},
	getModelById: function(collectionName, modelId) {
		if(!this._cache[collectionName]) return null;
		var models = this._cache[collectionName];
		for(var i = 0; i < models.length; i++) {
			if(modelId === models[i].id) {
				return models[i];
			}
		}
		return null;
	},
	_callSubscribers: function(models) {
		var collectionNames = {};
		this._subscriptions.forEach(function(subscription) {
			if(!subscription) return;
			for(var i = 0; i < models.length; i++) {
				var modelCollectionName = inflect.pluralize(models[i].type);
				if(subscription.collectionName === modelCollectionName) {
					if(!collectionNames[modelCollectionName]) {
						collectionNames[modelCollectionName] = [];
					}
					if(!subscription.id) {
						collectionNames[modelCollectionName].push(subscription);
						break;
					}
					if(subscription.id === models[i].id) {
						subscription.emit('data', models[i]);
						break;
					}
				}
			}
		});
		for(var collectionName in collectionNames) {
			var collection = collectionNames[collectionName];
			collection.forEach(function(subscription) {
				subscription.emit('data', this._cache[collectionName])
			}, this);
		}
	},
	_callCollectionSubscribers: function(collectionName) {
		this._subscriptions.forEach(function(subscription) {
			if (!subscription || subscription.id) return;
				if(subscription.collectionName === collectionName) {
					subscription.emit('data', this._cache[collectionName])
				}
		}, this);
	},
	_createModel: function(data) {
		if(this._modelRegistry[data.type]) {
			return new this._modelRegistry[data.type](data);
		}
		return null;
	}
};

module.exports = Cache;