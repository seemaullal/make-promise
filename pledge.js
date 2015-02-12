function $Promise() {
	this.state = 'pending';
};

function Deferral() {
	this.$promise = new $Promise();
	this.resolve = function(data) {
		if (this.$promise.state == 'rejected') return;
		if (this.$promise.state == 'pending') {
			this.$promise.value = data;
		}
		this.$promise.state = 'resolved';
	};

	this.reject = function(reason) {
		if (this.$promise.state == 'resolved') return;
		if (this.$promise.state == 'pending') {
			this.$promise.value = reason;
		}
		this.$promise.state = 'rejected';
	}	

};

function defer() {
	return new Deferral();
};