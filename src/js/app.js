var BusinessDate = require('usa-holidays');
var Method = require('./method');
Delivery.moment = require('moment');

function Delivery () {
	
}
Delivery.Method = Method;

Delivery.prototype = {
	init: function(options) {
		this.setOptions(options);
		this.initMethods();
	},

	initMethods: function() {
		var self = this;
		this.methods = this.options.methods.map(function(methodOptions) {
			return Method.make({
				date: self.options.date,
				days: methodOptions.days,
				name: methodOptions.name,
				rate: methodOptions.rate,
				timezone: Delivery.defaults.timezone,
				productPrice: this.product.getInfo('price'),
				productWeight: this.product.getInfo('weight'),
				freeShippingPrice: 75
			});
		});
	},
	setOptions: function(options) {
		this.options = $.extend({}, Delivery.defaults, options);
		this.options.date = this.options.date || new Date();
		this.product = options.product;
	},
};

$.extend(Delivery, {
	defaults: require('./config'),
	make: function(options) {
		var inst = new this;
		inst.init(options);
		return inst;
	},
	/**
	 * Is a date could be a ship date?
	 * @param  {Date}  date
	 * @return {Boolean}
	 */
	isShipDate: function(date) {
		var shipDate = date.clone();
		this.getShipDate(shipDate);
		return shipDate.isSame(date);
	},

	getShipDate: function(date) {
		if (date.day() == 5 && date.hours() > 13) {
			date.add(3, 'd');
		}
		this.firstBusinessDate(date);
		return date;
	},

	firstBusinessDate: function(date) {
		while (this.isHoliday(date)) {
			date.add(1, 'd');
		}
	},

	isHoliday: function(date) {
		return !BusinessDate.make(date.toDate()).isBusinessDay();
	},
});


module.exports = Delivery;