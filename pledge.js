function $Promise() {
	this.state = 'pending';
	this.handlerGroups = [];
	this.updateCbs = [];
	this.value;
	this.then = function(successCB, errorCB, updateCB) {
		if (this.state === 'resolved') {
			successCB(this.value);
			return;
		};
		if (typeof successCB !== 'function') successCB = false;
		if (typeof successCB !== 'function') errorCB = false;
		this.handlerGroups.push({
			successCb: successCB,
			errorCb: errorCB
		});
		if (typeof updateCB === 'function') this.updateCbs.push(updateCB);

		// if (this.state === 'resolved') successCB(this.value);
	};
};

$Promise.prototype.callHandlers = function() {
	if (this.state === 'resolved') {
		var self = this;
		this.handlerGroups.forEach( function(cbs) {
			//console.log(this.value);
			cbs.successCb(self.value);
		});
		return;
	} 

	if (this.state === 'rejected') {
		var self = this;
		this.handlerGroups.forEach( function(cbs) {
			cbs.errorCB(self.value);
		});
		return;
	} 


}

function Deferral() {
	this.$promise = new $Promise();
	this.resolve = function(data) {
		if (this.$promise.state == 'rejected') return;
		if (this.$promise.state == 'pending') {
			this.$promise.value = data;
			console.log(this.$promise.value);
			this.$promise.state = 'resolved';
			this.$promise.callHandlers();
		}
		
	};

	this.reject = function(reason) {
		if (this.$promise.state == 'resolved') return;
		if (this.$promise.state == 'pending') {
			this.$promise.value = reason;
		}
		this.$promise.state = 'rejected';
		this.$promise.callHandlers();

	}

};

function defer() {
	return new Deferral();
};