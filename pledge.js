function $Promise() {
	this.state = 'pending';
	this.handlerGroups = [];
	this.updateCbs = [];
	this.value;
}

$Promise.prototype.then = function(successCB, errorCB, updateCB) {
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
		errorCb: errorCB,
		forwarder: new Deferral()
	});
	if (typeof updateCB === 'function') this.updateCbs.push(updateCB);

	return this.handlerGroups[this.handlerGroups.length-1].forwarder.$promise;
};

$Promise.prototype.callHandlers = function() {
	var hGroup;
 	while( this.handlerGroups.length ) {
    	hGroup = this.handlerGroups.shift();
    	if (this.state === 'resolved') {
      		if (hGroup.successCb) {
      			try {
      				var output = hGroup.successCb(this.value);
      				if (output instanceof $Promise) {
      					output.then(function(data) {
      						hGroup.forwarder.resolve(data);
      					} , function(reason) {
      						hGroup.forwarder.reject(reason);
      					});
      				} else {
      					hGroup.forwarder.resolve(output);
      				}
      			} catch (err) {
      				hGroup.forwarder.reject(err);
      			}
      		}
      		else hGroup.forwarder.resolve(this.value);
    	} else if (this.state === 'rejected' ) {
      		if (hGroup.errorCb) {
      			try {
      				output = hGroup.errorCb(this.value);
      				if (output instanceof $Promise) {
      					output.then(function(data) {
      						hGroup.forwarder.resolve(data);
      					} , function(reason) {
      						hGroup.forwarder.reject(reason);
      					});
      				} else {
      					hGroup.forwarder.resolve(output);
      				}
      			} catch (err) {
      				hGroup.forwarder.reject(err);
      			}
      		
      		}
      		else hGroup.forwarder.reject(this.value);
    	}
  	}
}

$Promise.prototype.catch = function(fn) {
	return this.then(null,fn);
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