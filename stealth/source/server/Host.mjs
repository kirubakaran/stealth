
import { Emitter, isArray, isFunction, isObject, isString } from '../../extern/base.mjs';
import { DNS                                              } from '../protocol/DNS.mjs';
import { IP                                               } from '../parser/IP.mjs';



const payloadify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload.domain    = isString(payload.domain)    ? payload.domain    : null;
		payload.subdomain = isString(payload.subdomain) ? payload.subdomain : null;
		payload.host      = isString(payload.host)      ? payload.host      : null;

		if (isArray(payload.hosts) === true) {
			payload.hosts = payload.hosts.filter((ip) => IP.isIP(ip));
		} else {
			payload.hosts = [];
		}

		return payload;

	}

	return null;

};



const Host = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Host.isHost = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isArray(payload.hosts) === true
	) {

		let check = payload.hosts.filter((ip) => IP.isIP(ip));
		if (check.length === payload.hosts.length) {
			return true;
		}

	}


	return false;

};


Host.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let host     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					host = settings.hosts.find((h) => h.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					host = settings.hosts.find((h) => h.domain === payload.domain) || null;
				}

			} else if (payload.host !== null) {

				host = settings.hosts.find((h) => {

					let check = h.hosts.find((ip) => ip.ip === payload.host) || null;
					if (check !== null) {
						return true;
					}

					return false;

				}) || null;

			}


			if (host !== null) {

				callback({
					headers: {
						service: 'host',
						event:   'read'
					},
					payload: host
				});

			} else if (payload.domain !== null) {

				DNS.resolve(payload, (response) => {

					let host = null;

					if (response.payload !== null) {

						if (payload.subdomain !== null) {
							host = settings.hosts.find((h) => h.domain === payload.subdomain + '.' + payload.domain) || null;
						} else {
							host = settings.hosts.find((h) => h.domain === payload.domain) || null;
						}


						if (host !== null) {

							host.hosts = response.payload.hosts;

							settings.save();

						} else {

							if (payload.subdomain !== null) {
								payload.domain    = payload.subdomain + '.' + payload.domain;
								payload.subdomain = null;
							}

							host = {
								domain: payload.domain,
								hosts:  response.payload.hosts
							};

							settings.hosts.push(host);
							settings.save();

						}

					}


					callback({
						headers: {
							service: 'host',
							event:   'read'
						},
						payload: host
					});

				});

			} else {

				callback({
					headers: {
						service: 'host',
						event:   'read'
					},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'read'
				},
				payload: null
			});

		}

	},

	refresh: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				DNS.resolve(payload, (response) => {

					let host = null;

					if (response.payload !== null) {

						if (payload.subdomain !== null) {
							host = settings.hosts.find((h) => h.domain === payload.subdomain + '.' + payload.domain) || null;
						} else {
							host = settings.hosts.find((h) => h.domain === payload.domain) || null;
						}


						if (host !== null) {

							host.hosts = response.payload.hosts;

							settings.save();

						} else {

							if (payload.subdomain !== null) {
								payload.domain    = payload.subdomain + '.' + payload.domain;
								payload.subdomain = null;
							}

							host = {
								domain: payload.domain,
								hosts:  response.payload.hosts
							};

							settings.hosts.push(host);
							settings.save();

						}


					}


					callback({
						headers: {
							service: 'host',
							event:   'refresh'
						},
						payload: host
					});

				});

			} else {

				callback({
					headers: {
						service: 'host',
						event:   'refresh'
					},
					payload: null
				});

			}

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'refresh'
				},
				payload: null
			});

		}

	},

	remove: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let host     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					host = settings.hosts.find((h) => h.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					host = settings.hosts.find((h) => h.domain === payload.domain) || null;
				}

			}


			if (host !== null) {

				let index = settings.hosts.indexOf(host);
				if (index !== -1) {
					settings.hosts.splice(index, 1);
				}

				settings.save();

			}


			callback({
				headers: {
					service: 'host',
					event:   'remove'
				},
				payload: true
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'remove'
				},
				payload: false
			});

		}

	},

	save: function(payload, callback) {

		payload  = isObject(payload)    ? payloadify(payload) : null;
		callback = isFunction(callback) ? callback            : null;


		if (payload !== null && callback !== null) {

			let host     = null;
			let settings = this.stealth.settings;

			if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					host = settings.hosts.find((h) => h.domain === payload.subdomain + '.' + payload.domain) || null;
				} else{
					host = settings.hosts.find((h) => h.domain === payload.domain) || null;
				}

			}


			if (host !== null) {

				host.hosts = payload.hosts;

				settings.save();

			} else if (payload.domain !== null) {

				if (payload.subdomain !== null) {
					payload.domain    = payload.subdomain + '.' + payload.domain;
					payload.subdomain = null;
				}


				host = {
					domain: payload.domain,
					hosts:  payload.hosts
				};

				settings.hosts.push(host);
				settings.save();

			}



			callback({
				headers: {
					service: 'host',
					event:   'save'
				},
				payload: (host !== null)
			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'host',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Host };

