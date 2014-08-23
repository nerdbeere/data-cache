var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Subscription(collectionName, id) {
	EventEmitter.call(this);
	this.collectionName = collectionName;
	this.id = id || null;
}

util.inherits(Subscription, EventEmitter);

module.exports = Subscription;