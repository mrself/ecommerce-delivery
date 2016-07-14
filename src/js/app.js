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
	isShipDate: function(date) {
		var mdate = this.moment(date);
		var shipDate = mdate.clone();
		Method.prototype.firstBusinessDate.call(Method.prototype, mdate);
		return mdate.hours() < 13 && shipDate.isSame(mdate);
	}
});


module.exports = Delivery;