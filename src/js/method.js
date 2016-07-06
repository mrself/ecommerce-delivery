var moment = require('moment');
var BusinessDate = require('usa-holidays');

function Method () {
	
}

$.extend(Method.prototype, {
	init: function(options) {
		this.setOptions(options);
		this.setDate();
	},
	setDate: function() {
		var date = this.options.date;
		var utc = this.options.timezone * 3600000;
		var time = date.getTime() + date.getTimezoneOffset() * 60000 + utc;
		this.options.date = moment(time)
			.year(date.getFullYear())
			.month(date.getMonth())
			.date(date.getDate())
			.hours(date.getHours());
	},
	setOptions: function(options) {
		this.options = $.extend({}, options);
	},
	getDeliveryDate: function() {
		var days = this.options.days - 1;
		var date = this.options.date.clone();
		if (date.hours() > 13 && !this.isHoliday(date)) days++;
		var count = 0;
		while((days || this.isHoliday(date)) && ++count < 100) {
			if (!this.isHoliday(date)) {
				days--;
			}
			date.add(1, 'd');
		}
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
	},

	isHoliday: function(date) {
		return !BusinessDate.make(date.toDate()).isBusinessDay();
	},
});

$.extend(Method, {
	make: function(options) {
		var inst = new this;
		inst.init(options);
		return inst;
	},
});

function l (x) {
	console.log(x);
}
module.exports = Method;