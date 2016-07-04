var moment = require('moment');
var BusinessDate = require('usa-holidays');

function Method () {
	
}

$.extend(Method.prototype, {
	init: function(options) {
		this.setOptions(options);
		this.setDate();
		// this.days = days;
		// this.tz = tz;
	},
	setDate: function() {
		var date = this.options.date;
		var utc = this.options.timezone * 3600000;
		var time = date.getTime() + date.getTimezoneOffset() * 60000 + utc;
		this.options.date = moment(time)
			.year(date.getFullYear())
			.month(date.getMonth())
			.date(date.getDate())
			.hours(date.getHours())
		// l(this.date)
	},
	setOptions: function(options) {
		this.options = $.extend({}, options);
	},
	getDeliveryDate: function() {
		var days = this.options.days - 1;
		var date = this.options.date.clone();
		// l(this.date.toDate() )
		if (date.hours() > 13 && !this.isHoliday(date)) days++;
		var count = 0;
		// l(days)
		while((days || this.isHoliday(date)) && ++count < 100) {
			if (!this.isHoliday(date)) {
				days--;
			}
			date.add(1, 'd');
			// l(days)
			// if (!BusinessDate.make(date.toDate()).isBusinessDay() && !days) days++;
			// l(date.toDate())
		}
		return date.toDate();
	},

	getDeliveryPrice: function() {
		var productPrice = this.options.productPrice;
		var weight = this.options.productWeight;
		var price;
		this.options.rate.forEach(function(rateItem) {
			if (rateItem.weightTo >= weight) price = rateItem.price;
		});
		return price;
	},

	isHoliday: function(date) {
		return !BusinessDate.make(date.toDate()).isBusinessDay()
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