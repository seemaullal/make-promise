function $Promise() {
	this.state = 'pending';
	this.handlerGroups = [];
	this.updateCbs = [];
	this.value;
	this.then = function(successCB, errorCB, updateCB) {
		if (this.state === 'resolved' && successCB) {
			successCB(this.value);
			return;
		};
		if (this.state === 'rejected' && errorCB) {
			errorCB(this.value);
			return;
		};
		if (typeof successCB !== 'function') successCB = false;
		if (typeof errorCB !== 'function') errorCB = false;
		this.handlerGroups.push({
			successCb: successCB,
			errorCb: errorCB
		});
		if (typeof updateCB === 'function') this.updateCbs.push(updateCB);

		if (this.state === 'resolved') successCB(this.value);
	};
};

$Promise.prototype.callHandlers = function() {
	if (this.state === 'resolved') {
		var self = this;
		this.handlerGroups.forEach( function(cbs) {
			if (cbs.successCb)
				cbs.successCb(self.value);
		});
		this.handlerGroups = [ ];
		return;
	} 

	if (this.state === 'rejected') {
		var self = this;
		this.handlerGroups.forEach( function(cbs) {
			if (cbs.errorCb)
				cbs.errorCb(self.value);
		});
		this.handlerGroups = [ ];
		return;
	} 
}

$Promise.prototype.catch = function(fn) {
	this.then(null,fn);
}

function Deferral() {
	this.$promise = new $Promise();
	this.resolve = function(data) {
		if (this.$promise.state == 'rejected') return;
		if (this.$promise.state == 'pending') {
			this.$promise.value = data;
			this.$promise.state = 'resolved';
			this.$promise.callHandlers();
		}
		
	};

	this.reject = function(reason) {
		if (this.$promise.state == 'resolved') return;
		if (this.$promise.state == 'pending') {
			this.$promise.value = reason;
			this.$promise.state = 'rejected';
			this.$promise.callHandlers();
		}
	}
};

Deferral.prototype.notify = function(num) {
	if (this.$promise.state === 'pending') {
		this.$promise.updateCbs.forEach(function (func) {
			func(num);
		});
	}
	
}

function defer() {
	return new Deferral();
};