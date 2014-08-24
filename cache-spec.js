var Cache = require('./cache');

describe('Cache', function() {

	var cache, spaceship;

	beforeEach(function() {
		cache = new Cache();

		cache.registerModel('spaceship', function(data) {

		});

		spaceship = {
			type: 'spaceship',
			id: 1,
			name: 'hornet',
			data: {}
		}
	});

	it('should be possible to subscribe and the callback shouldnt be called when theres no data', function() {
		var callback = sinon.spy();
		cache.subscribe('spaceships', 1).on('data', callback);
		expect(callback).not.toHaveBeenCalled();
	});

	it('should be possible to fill the cache with data', function() {
		cache.fill([spaceship]);
	});

	it('should call subscribers when being filled', function() {
		var callback = sinon.spy();
		cache.subscribe('spaceships').on('data', callback);
		expect(callback).not.toHaveBeenCalled();

		cache._callSubscribers([spaceship]);
		expect(callback).toHaveBeenCalled();

		var callback2 = sinon.spy();
		cache.subscribe('spaceships', 1).on('data', callback2);
		cache._callSubscribers([spaceship]);
		expect(callback2).toHaveBeenCalled();
	});

	it('should call subscribers when its already some matching data there', function(done) {
		cache.fill([spaceship]);

		var callback = sinon.spy();
		cache.subscribe('spaceships', 1).on('data', function() {
			callback();
		});

		var callback2 = sinon.spy();
		cache.subscribe('spaceships').on('data', function() {
			callback2();

		}).on('subscribersNotified', function() {
			try {
				expect(callback).toHaveBeenCalledOnce();
				expect(callback2).toHaveBeenCalledOnce();
				done();
			} catch(e) {
				done(e);
			}
		});
	});

	it('should be possible to get a model from the cache by its id', function() {
		cache.fill([spaceship]);
		var model = cache.getModelById('spaceships', 1);
		expect(model).not.toBeNull();
		expect(model.id).toBe(1);
	});

	it('should only call _new_ subscriber when already some matching data is there', function(done) {
		var callback = sinon.spy();
		cache.fill([spaceship]);
		cache.subscribe('spaceships').on('data', function() {
			callback();
		});

		var modelSubscriberCallback = sinon.spy();
		var subscriber = cache.subscribe('spaceships', 1);
		subscriber.on('data', modelSubscriberCallback);
		subscriber.on('subscribersNotified', function() {
			try {
				expect(callback).toHaveBeenCalled();
				expect(modelSubscriberCallback).toHaveBeenCalledOnce();
				done();
			} catch(e) {
				done(e);
			}
		});
	});

	it('should be possible to add a single model to the cache', function() {
		cache.fill(spaceship);
	});

	it('should be possible to unregister a model', function() {
		cache.unregisterModel('spaceship');
	});

	it('should be possible to add data without having a model', function() {
		var planet = {
			type: 'planet',
			id: 1,
			pos: {x: 0, y: 0}
		};
		cache.fill(planet);
	});

	it('should be optional to have registered models', function() {
		cache.unregisterModel();
		cache.fill(spaceship);
		var model = cache.getModelById('spaceships', spaceship.id);
		expect(model).not.toBeNull();
		expect(model.id).toBe(1);
	});

	it('should update models when they already exist', function() {
		cache.fill(spaceship);
		spaceship.name = 'andromeda';
		expect(cache.getModelById('spaceships', 1).name).toBe('hornet');
		expect(cache.getModelById('spaceships', 1).name).not.toBe('andromeda');

		cache.fill(spaceship);
		expect(cache.getCollectionLength('spaceships')).toBe(1);
		expect(cache.getModelById('spaceships', 1).name).toBe('andromeda');
	});

	it('should have a method to retrieve a collection', function() {
		cache.fill(spaceship);
		cache.getCollection('spaceships');
	});

	describe('Collection', function() {
		it('should be a class instead of an array', function() {
			cache.fill(spaceship);
			refute.hasPrototype(cache.getCollection('spaceships'), Array.prototype);
		});
		it('should have a method to retrieve a model', function() {
			cache.fill(spaceship);
			expect(cache.getCollection('spaceships').getModelById(1).name).toBe('hornet');
		});
	});
});