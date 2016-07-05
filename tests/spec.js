var assert = function(data) {
	expect(data).toBeTruthy();
};

describe('Economy method at 10 am', function() {
	
	function makeDate (y, m, d, h) {
		var timezone = -5;
		var utc = timezone * 3600000;
		var date = new Date();
		var time = date.getTime() + date.getTimezoneOffset() * 60000 + utc;
		date = new Date(time);
		date.setFullYear(y);
		date.setMonth(m);
		date.setDate(d);
		date.setHours(h);
		return date;
	}
	function makeIt (startDate, expectedDate, deliveryMethod) {
		var deliveryDate = Delivery.Method.make({
			date: startDate,
			days: 8,
			timezone: -5
		}).getDeliveryDate();
		assert(isEqualsDate(expectedDate, deliveryDate));
	}

	it ('The estimated delivery date for Economy is the 13th', function() {
		makeIt(makeDate(2016, 5, 2, 10), new Date(2016, 5, 13), 'Economy');
	});

	it('should consider weekends', function() {
		makeIt(new Date(2016, 6, 23, 10), new Date(2016, 7, 3), 'Economy');
	});

	it('should consider federal holidays', function() {
		makeIt(makeDate(2016, 1, 15, 10), new Date(2016, 1, 25), 'Economy');
	});

	it('should consider federal holidays and weekends (the 4th of July is Independence Day', function() {
		makeIt(new Date(2016, 6, 2, 10), new Date(2016, 6, 14), 'Economy');
	});
});

describe('Method #getDeliveryDate', function() {
	function makeIt (date, daysQty, expectedDate) {
		var deliveryDate = Delivery.Method.make({
			date: date,
			days: daysQty,
			timezone: -5
		}).getDeliveryDate();
		assert(isEqualsDate(deliveryDate, expectedDate));
	}
	it('consider all business day in delivery days', function() {
		makeIt(new Date(2016, 5, 21), 3, new Date(2016, 5, 23));
		makeIt(new Date(2016, 5, 6), 4, new Date(2016, 5, 9));
	});
	it('do not consider weekends in delivery days', function() {
		makeIt(new Date(2016, 5, 3), 2, new Date(2016, 5, 6));
		makeIt(new Date(2016, 5, 11), 2, new Date(2016, 5, 14));
	});

	it('add one more day if it is after 1 pm and if it is a business day', function() {
		makeIt(new Date(2016, 5, 13, 14), 2, new Date(2016, 5, 15));
	});

	it('do not add one more day if it is after 1 pm and if it is a holiday', function() {
		makeIt(new Date(2016, 5, 13, 14), 2, new Date(2016, 5, 15));
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
				productWeight: 6,
				rate: [{weightTo: 6.99, price: 13.50}, {weightTo: 7.99, price: 17.50}]
			});
			assert(price == 'Free');
		});
	});
});

function isEqualsDate (date1, date2) {
	return date1.getYear() == date2.getYear() && 
		date1.getMonth() == date2.getMonth() && 
		date1.getDate() == date2.getDate();
}


function l (x) {
	console.log(x);
}