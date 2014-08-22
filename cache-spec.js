var Cache = require('./cache');

describe('Cache', function() {

	var cache, spaceship;

	beforeEach(function() {
		cache = new Cache();

		cache.registerModel('spaceship', function(data) {
			this.type = data.type;
			this.id = data.id;
			this.data = data.data || {};
		});

		spaceship = {
			type: 'spaceship',
			id: 1,
			data: {}
		}
	});

	it('should be possible to subscribe and the callback shouldnt be called when theres no data', function() {
		var callback = sinon.spy();
		cache.subscribe('spaceships', 1).onData(callback);
		expect(callback).not.toHaveBeenCalled();
	});

	it('should be possible to fill the cache with data', function() {
		cache.fill([spaceship]);
	});

	it('should call subscribers when being filled', function() {
		var callback = sinon.spy();
		cache.subscribe('spaceships').onData(callback);
		expect(callback).not.toHaveBeenCalled();

		cache._callSubscribers([spaceship]);
		expect(callback).toHaveBeenCalled();

		var callback2 = sinon.spy();
		cache.subscribe('spaceships', 1).onData(callback2);
		cache._callSubscribers([spaceship]);
		expect(callback2).toHaveBeenCalled();
	});

	it('should call subscribers when its already some matching data there', function(done) {
		cache.fill([spaceship]);

		var callback = sinon.spy();
		cache.subscribe('spaceships', 1).onData(function() {
			callback();
			expect(callback).toHaveBeenCalled();
			done();
		});
	});

	it('should only call _new_ subscriber when already some matching data is there', function(done) {

	});
});