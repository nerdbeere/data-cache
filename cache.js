var asap = require('asap');
var util = require('util');
var inflect = require('i')();
var Subscription = require('./subscription');
var models = require('./models');
var Collection = require('./collection')


function Cache() {
	/**
	 * Contains collections
	 * @type {Object}
	 * @private
	 */
	this._cache = {};
	/**
	 * Contains subscriptions
	 * @type {Array}
	 * @private
	 */
	this._subscriptions = [];
	/**
	 * Contains model constructors
	 * @type {Object}
	 * @private
	 */
	this._modelRegistry = {};
}

Cache.prototype = {
	/**
	 * Subscribe to retrieve updates about a specific model or whole collection
	 * @param {String} collectionName
	 * @param {Number} [id]
	 * @returns {Subscription}
	 */
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
	/**
	 * Fill the cache with some data
	 * @param {Array|Object} dataArr
	 * @param {Function} cb - Callback
	 */
	fill: function(dataArr, cb) {
		var models = [];
		if(!Array.isArray(dataArr)) dataArr = [dataArr];
		dataArr.forEach(function(data) {
			var collectionName = inflect.pluralize(data.type);
			var existingModel = this.getModelById(collectionName, data.id);
			if(existingModel) {
				models.push(existingModel);
				return existingModel.setData(data);
			}
			var model = this._createModel(data);
			if(!this.getCollection(collectionName)) {
				this._cache[collectionName] = new Collection();
			}
			this.getCollection(collectionName).push(model);
			models.push(model);
		}, this);
		this._callSubscribers(models);
		if(cb) {
			asap(cb);
		}
	},
	/**
	 * Get a collection by its name
	 * @param {String} collectionName
	 * @returns {Collection}
	 */
	getCollection: function(collectionName) {
		if(!this._cache[collectionName]) return null;
		return this._cache[collectionName];
	},
	/**
	 * Get the length of a collection
	 * @param {String} collectionName
	 * @returns {Number}
	 */
	getCollectionLength: function(collectionName) {
		if(!this.getCollection(collectionName)) return 0;
		return this.getCollection(collectionName).getLength();
	},
	/**
	 *
	 * @param {String} collectionName
	 * @param {Number} modelId
	 * @returns {AppModel}
	 */
	getModelById: function(collectionName, modelId) {
		if(!this.getCollection(collectionName)) return null;
		return this.getCollection(collectionName).getModelById(modelId);
	},
	/**
	 * Calls subscribers
	 * @param {Array} models
	 * @private
	 */
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
	/**
	 * Calls subscribers of a collection
	 * @param {String} collectionName
	 * @private
	 */
	_callCollectionSubscribers: function(collectionName) {
		this._subscriptions.forEach(function(subscription) {
			if (!subscription || subscription.id) return;
				if(subscription.collectionName === collectionName) {
					subscription.emit('data', this._cache[collectionName])
				}
		}, this);
	},
	/**
	 * Register a model that will automatically used
	 * when data matches to the model name
	 * @param {String} modelName
	 * @param {Function} constructor
	 */
	registerModel: function(modelName, constructor) {
		if(this._modelRegistry[modelName]) {
			throw 'model already exists';
		}
		util.inherits(constructor, models.AppModel);
		this._modelRegistry[modelName] = constructor;
	},
	/**
	 * Unregisters a model
	 * @param {String} modelName
	 */
	unregisterModel: function(modelName) {
		if(this._modelRegistry[modelName]) {
			this._modelRegistry[modelName] = null;
		}
	},
	/**
	 * Creates a model
	 * @param {Object} data
	 * @returns {BasicModel} - Returns either BasicModel or the user defined model
	 * @private
	 */
	_createModel: function(data) {
		if(this._modelRegistry[data.type]) {
			var newInstance = new this._modelRegistry[data.type]();
			models.AppModel.call(newInstance, data);
			return newInstance;
		}
		var newInstance = new models.BasicModel();
		models.AppModel.call(newInstance, data);
		return newInstance;
	}
};

module.exports = Cache;