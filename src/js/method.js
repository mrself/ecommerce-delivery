var moment = require('moment');

function Method () {
	
}

$.extend(Method.prototype, {
	init: function(options) {
		this.setOptions(options);
		this.setDate();
	},
	setDate: function() {
		var date = moment(this.options.date);
		this.utcOffset = date.utcOffset();
		date.utcOffset(this.options.timezone);
		this.date = date;
	},
	setOptions: function(options) {
		this.options = $.extend({}, options);
	},
	getDeliveryDate: function() {
		var date = this.date.clone();
		if (date.hours() > 13) {
			if (date.day() == 5) date.add(3, 'd');
			else date.add(1, 'd');
		}
		Method.Delivery.firstBusinessDate(date);
		date.add(this.options.days, 'd');
		Method.Delivery.firstBusinessDate(date);
		date.utcOffset(this.utcOffset);
		return date.toDate();
	},

	getDeliveryPrice: function() {
		var productPrice = this.options.productPrice;
		if (productPrice > this.options.freeShippingPrice && 
			this.isEconomy())
			return 'Free';
		var weight = this.options.productWeight;
		var price;
		this.options.rate.forEach(function(rateItem) {
			if (rateItem.weightTo >= weight && !price) price = rateItem.price;
		});
		return price;
	},

	isEconomy: function() {
		return this.options.name && this.options.name.toLowerCase() == 'economy';
	}
});

$.extend(Method, {
	make: function(options) {
		var inst = new this;
		inst.init(options);
		return inst;
	},

	makeFromDate: function(date) {
		var inst = new this;
		inst.date = date;
		return inst;
	},
});

module.exports = Method;