/** @module delivery/method */

var moment = require('moment');
var BusinessDate = require('usa-holidays');

/**
 * Creates a new delivery method based on options.
 *
 *
 * Vocabulary:
 * 	Standard format is a date with a delivery timezone
 * 	Local format is a date with a client timezone
 *
 * Inner methods work with a date in a Standard format.
 * #getDeliveryDate, #getShipDate return a date in Local format
 * 
 * @class
 */
function Method () {
	
}

$.extend(Method.prototype, {
	init: function(options) {
		this.setOptions(options);
		this.setDate();
	},
	setDate: function(entry) {
		var date = moment(entry || this.options.date);
		this.dateToStandard(date);
		this.date = date;
	},
	setOptions: function(options) {
		this.options = $.extend({}, Method.defaults, options);
	},

	/**
	 * Format a date to a delivery-friendly format
	 * @param  {Moment} date
	 * @return {void}
	 */
	dateToStandard: function(date) {
		this.utcOffset = date.utcOffset();
		date.utcOffset(this.options.timezone);
	},

	/**
	 * Get a delivery date, when an order is delivered to the client
	 * @return {date}
	 */
	getDeliveryDate: function() {
		var date = this.date.clone();
		if (date.hours() > 13) {
			if (date.day() == 5) date.add(3, 'd');
			else date.add(1, 'd');
		}
		this.firstBusinessDate(date);
		date.add(this.options.days, 'd');
		this.firstBusinessDate(date);
		if (this.options.formatDateToLocal)
			this.dateToLocal(date);
		return date.toDate();
	},

	/**
	 * Format a date to local (start) timezone
	 * @param  {Moment} date
	 * @return {void}
	 */
	dateToLocal: function(date) {
		date.utcOffset(this.utcOffset);
	},

	/**
	 * Get date when an order will be shipped
	 * @param  {Moment} date
	 * @return {Moment}
	 */
	getShipDate: function() {
		var date = this.date.clone();
		if (date.day() == 5 && date.hours() > 13) {
			date.add(3, 'd');
		}
		this.firstBusinessDate(date);
		if (this.options.formatDateToLocal)
			this.dateToLocal(date);
		return date;
	},

	/**
	 * Get a delivery price
	 * @return {Float}
	 */
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

	/**
	 * Transform entry date to first business date
	 * @param  {Moment} date
	 * @return {void}
	 */
	firstBusinessDate: function(date) {
		while (this.isHoliday(date)) {
			date.add(1, 'd');
		}
	},

	/**
	 * Is a date could be a ship date?
	 * @param  {Moment}  date
	 * @return {Boolean}
	 */
	isShipDate: function() {
		var shipDate = this.date.clone();
		shipDate = this.getShipDate(shipDate);
		return shipDate.isSame(this.date);
	},

	isHoliday: function(date) {
		return !BusinessDate.make(date.toDate()).isBusinessDay();
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

	makeFromDate: function(date, tz) {
		var inst = new this;
		inst.setOptions({timezone: tz});
		inst.setDate(date);
		return inst;
	},
	defaults: {
		formatDateToLocal: false
	}
});

module.exports = Method;