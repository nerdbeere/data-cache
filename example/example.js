var Cache = require('../cache');
var cacheInstance = new Cache();

cacheInstance.registerModel('todo', function(data) {
	this.id = data.id;
	this.type = data.type;
	this.text = data.text;
});

cacheInstance.fill([
	{
		id: 1,
		type: 'todo',
		text: 'eat'
	},{
		id: 2,
		type: 'todo',
		text: 'sleep'
	},{
		id: 3,
		type: 'todo',
		text: 'rave'
	}
]);

var subscription = cacheInstance.subscribe('todos');

subscription.onData(function(collection) {
	console.log(collection);
});

var subscriptionOnModel = cacheInstance.subscribe('todos', 2);
subscriptionOnModel.onData(function(model) {
	console.log(model);
});

