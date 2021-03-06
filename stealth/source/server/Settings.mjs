
import { Emitter, isArray, isBoolean, isFunction, isObject } from '../../extern/base.mjs';
import { Host                                              } from './Host.mjs';
import { Mode                                              } from './Mode.mjs';
import { Peer                                              } from './Peer.mjs';



const readify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		if (Object.keys(payload).length > 0) {

			payload = Object.assign({}, raw);

			payload.internet  = isBoolean(payload.internet)  ? payload.internet  : false;
			payload.blockers  = false; // cannot be read
			payload.hosts     = isBoolean(payload.hosts)     ? payload.hosts     : false;
			payload.modes     = isBoolean(payload.modes)     ? payload.modes     : false;
			payload.peers     = isBoolean(payload.peers)     ? payload.peers     : false;
			payload.redirects = isBoolean(payload.redirects) ? payload.redirects : false;
			payload.sessions  = isBoolean(payload.sessions)  ? payload.sessions  : false;

			return payload;

		}

	}

	return null;

};

const saveify = function(raw) {

	let payload = raw;
	if (isObject(payload) === true) {

		payload = Object.assign({}, raw);

		payload.internet  = isObject(payload.internet) ? payload.internet : {};
		payload.blockers  = []; // cannot be saved
		payload.hosts     = isArray(payload.hosts)     ? payload.hosts    : [];
		payload.modes     = isArray(payload.modes)     ? payload.modes    : [];
		payload.peers     = isArray(payload.peers)     ? payload.peers    : [];
		payload.redirects = []; // cannot be saved
		payload.sessions  = []; // cannot be saved

		if (isArray(payload.hosts) === true) {
			payload.hosts = payload.hosts.filter((h) => Host.isHost(h));
		}

		if (isArray(payload.modes) === true) {
			payload.modes = payload.modes.filter((m) => Mode.isMode(m));
		}

		if (isArray(payload.peers) === true) {
			payload.peers = payload.peers.filter((p) => Peer.isPeer(p));
		}

		return payload;

	}

	return null;

};



const Settings = function(stealth) {

	this.stealth = stealth;
	Emitter.call(this);

};


Settings.prototype = Object.assign({}, Emitter.prototype, {

	read: function(payload, callback) {

		payload  = isObject(payload)    ? readify(payload) : null;
		callback = isFunction(callback) ? callback         : null;


		if (payload !== null) {

			this.stealth.settings.read(false, (result) => {

				if (callback !== null) {

					if (result === true) {

						let blob = this.stealth.settings.toJSON();
						let data = {
							internet:  null,
							blockers:  null,
							hosts:     null,
							modes:     null,
							peers:     null,
							redirects: null,
							sessions:  null
						};


						Object.keys(payload).forEach((key) => {

							if (payload[key] === true) {
								data[key] = blob.data[key] || null;
							}

						});


						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: data
						});

					} else {

						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: null
						});

					}

				}

			});

		} else {

			this.stealth.settings.read(false, (result) => {

				if (callback !== null) {

					if (result === true) {

						let blob = this.stealth.settings.toJSON();
						let data = blob.data;

						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: data
						});

					} else {

						callback({
							headers: {
								service: 'settings',
								event:   'read'
							},
							payload: null
						});

					}

				}

			});

		}

	},

	save: function(payload, callback) {

		payload  = isObject(payload)    ? saveify(payload) : null;
		callback = isFunction(callback) ? callback         : null;


		if (payload !== null && callback !== null) {

			let settings = this.stealth.settings;

			Object.keys(payload.internet).forEach((key) => {

				if (settings.internet[key] !== undefined) {
					settings.internet[key] = payload.internet[key];
				}

			});

			payload.hosts.forEach((host) => {

				let other = settings.hosts.find((h) => h.domain === host.domain) || null;
				if (other !== null) {

					let index = settings.hosts.indexOf(other);
					if (index !== -1) {
						settings.hosts.splice(index, 1);
					}

				}

				settings.hosts.push(host);

			});

			payload.modes.forEach((mode) => {

				let other = settings.modes.find((m) => m.domain === mode.domain) || null;
				if (other !== null) {

					let index = settings.modes.indexOf(other);
					if (index !== -1) {
						settings.modes.splice(index, 1);
					}

				}

				settings.modes.push(mode);

			});

			payload.peers.forEach((peer) => {

				let other = settings.peers.find((p) => p.domain === peer.domain) || null;
				if (other !== null) {

					let index = settings.peers.indexOf(other);
					if (index !== -1) {
						settings.peers.splice(index, 1);
					}

				}

				settings.peers.push(peer);

			});


			settings.save(false, (result) => {

				callback({
					headers: {
						service: 'settings',
						event:   'save'
					},
					payload: result
				});

			});

		} else if (callback !== null) {

			callback({
				headers: {
					service: 'settings',
					event:   'save'
				},
				payload: false
			});

		}

	}

});


export { Settings };

