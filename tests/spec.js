/**
 * This tests could be run only for UTc +3
 */

var assert = function(data) {
	expect(data).toBeTruthy();
};
var m = Delivery.moment;

describe('.makeFromDate', function() {
	it ('set `date` property in standard format', function() {
		var date = m([2016, 6, 15]);
		date.utcOffset(6);
		date.hours();
		var method = Delivery.Method.makeFromDate(date, -5);
		assert(method.date.utcOffset() == -5 * 60);
	});
});

describe('#getShipDate', function() {
	it ('for a workdate it is the same', function() {
		var workDate = Delivery.moment([2016, 6, 14]);
		var method = Delivery.Method.makeFromDate(workDate);
		var shipDate = method.getShipDate(workDate);
		assert(workDate.isSame(shipDate));
	});
});

describe('static #isShipDate', function() {
	it('a business date is a ship date', function() {
		var workDate = Delivery.moment([2016, 6, 14]);
		var method = Delivery.Method.makeFromDate(workDate);
		assert(method.isShipDate());
	});
	it ('a holiday is not ship date', function() {
		var sunday = Delivery.moment([2016, 6, 17]);
		var method = Delivery.Method.makeFromDate(sunday);
		assert(!method.isShipDate());
	});
	it('Friday after 1 pm is not a ship date' ,function() {
		var friday = Delivery.moment([2016, 6, 15, 8]);
		friday.utcOffset(-5);
		friday.hours(14);
		var method = Delivery.Method.makeFromDate(friday);
		assert(!method.isShipDate());
	});
});

describe('#formatDate', function() {
	it ('return date in delivery timezone', function() {
		var startDate = new Date(2016, 6, 14, 18);
		var method = new Delivery.Method();
		method.options = {timezone: -5, date: startDate};
		method.setDate();
		assert(method.date.hours() == 10);
	});
});

describe('static #firstBusinessDay', function() {
	it ('if entry date is a business date, return it', function() {
		var date = m([2016, 6, 12]);
		var method = Delivery.Method.makeFromDate(date);
		method.firstBusinessDate(date);
		assert(isEqualsDate(date, m([2016, 6, 12])));
	});

	it('if entry date is a holiday, find first business date', function() {
		var date = m([2016, 6, 16]);
		var method = Delivery.Method.makeFromDate(date);
		method.firstBusinessDate(date);
		assert(isEqualsDate(date, m([2016, 6, 18])));
	});
});

describe('Method #getDeliveryDate', function() {
	function makeIt(dateOptions, days, expectedDate) {
		var method = new Delivery.Method();
		var date = Delivery.moment();
		date.utcOffset(dateOptions.tz || -5);
		date.set({
			year: dateOptions.y,
			month: dateOptions.m,
			date: dateOptions.d,
			hour: dateOptions.h || 0});
		method.options = {days: days, date: date};
		expectedDate = Delivery.moment(expectedDate).toDate();
		method.setDate();
		assert(isEqualsDate(method.getDeliveryDate(), expectedDate));
	}
	it('if entry date is a business date and before 1pm just add needed days', function() {
		makeIt({y: 2016, m: 6, d: 21, h:10}, 1, [2016, 6, 22]);
		makeIt({y: 2016, m: 6, d: 18, h:10}, 4, [2016, 6, 22]);
	});
	it('if entry date is after 1pm add one more day', function() {
		makeIt({y: 2016, m: 6, d: 20, h:14}, 1, [2016, 6, 22]);
	});
	it('if entry date is a Friday and after 1pm start to add from Monday', function() {
		makeIt({y: 2016, m: 6, d: 8, h:14}, 1, [2016, 6, 12]);
	});
	it('if entry date is a holiday, start to add from Monday', function() {
		makeIt({y: 2016, m: 6, d: 9}, 2, [2016, 6, 13]);
	});
	it('delivery date could not be a holiday', function() {
		makeIt({y: 2016, m: 6, d: 14, h: 14}, 1, [2016, 6, 18]);
		makeIt({y: 2016, m: 6, d: 14, h: 12}, 1, [2016, 6, 15]);
	});
});

describe('Method #getDeliveryPrice', function() {
	describe('product price does not fit free shipping', function() {
		beforeEach(function() {
			this.getPrice = function(options) {
				var delivery = new Delivery.Method();
				delivery.setOptions($.extend({
					productPrice: 40,
					freeShippingPrice: 80
				}, options));
				return delivery.getDeliveryPrice();
			};
		});
		it ('get price considering product weight', function() {
			var price = this.getPrice({
				productWeight: 4,
				rate: [{weightTo: 6.99, price: 13.50}, {weightTo: 7.99, price: 17.50}]
			});
			assert(price == 13.50);
		});
	});

	describe('product price fits free shipping', function() {
		beforeEach(function() {
			this.getPrice = function(options) {
				var delivery = new Delivery.Method();
				delivery.setOptions($.extend({
					productPrice: 80,
					freeShippingPrice: 40
				}, options));
				return delivery.getDeliveryPrice();
			};
		});
		it ('get price considering product weight', function() {
			var price = this.getPrice({
				productPrice: 80,
				freeShippingPrice: 40,
				productWeight: 6,
				rate: [{weightTo: 6.99, price: 13.50}, {weightTo: 7.99, price: 17.50}]
			});
			assert(price == 13.5);
		});
		describe('free shipping is only for economy type', function() {
			it('the type is economy', function() {
				var price = this.getPrice({
					productWeight: 6,
					name: 'Economy',
					productPrice: 80,
					freeShippingPrice: 40,
					rate: [{weightTo: 6.99, price: 13.50}, {weightTo: 7.99, price: 17.50}]
				});
				assert(price == 'Free');
			});
			it('the type is not economy', function() {
				var price = this.getPrice({
					productPrice: 80,
					freeShippingPrice: 40,
					productWeight: 6,
					rate: [{weightTo: 6.99, price: 13.50}, {weightTo: 7.99, price: 17.50}]
				});
				assert(price == 13.5);
			});
		});
		
	});
});

function isEqualsDate (date1, date2) {
	// l(date1)
	// l(date2)
	if (date1 instanceof Date) {
		return date1.getYear() == date2.getYear() && 
			date1.getMonth() == date2.getMonth() && 
			date1.getDate() == date2.getDate();
	} else {
		return date1.year() == date2.year() && 
			date1.month() == date2.month() && 
			date1.date() == date2.date();
	}
}


function l (x) {
	console.log(x);
}