var BusinessDate = require('usa-holidays');
var Method = require('./method');

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
	}
});


module.exports = Delivery;