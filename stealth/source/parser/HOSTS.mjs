
import { isArray, isObject, isString } from '../../extern/base.mjs';
import { IP                          } from './IP.mjs';
import { URL                         } from './URL.mjs';



const parse_payload = function(payload) {

	let hosts = [];

	let buffer = payload.split('\n');
	if (buffer.length > 0) {

		let lines = [];

		for (let b = 0, bl = buffer.length; b < bl; b++) {

			let chunk = buffer[b].trim();
			if (chunk.length > 0 && chunk[0] !== '#' && chunk[0] !== '!') {

				let index = chunk.indexOf('#');
				if (index !== -1) {
					chunk = chunk.substr(0, index).trim();
				}

				lines.push(chunk);

			}

		}

		if (lines.length > 0) {

			let map = {};

			for (let l = 0, ll = lines.length; l < ll; l++) {

				let domains = [];
				let ip      = null;

				let line = lines[l];
				if (line.includes('\t')) {

					let tmp = line.split('\t');
					for (let t = 0, tl = tmp.length; t < tl; t++) {

						let chunk = tmp[t].trim();
						if (chunk !== '' && t === 0) {

							ip = chunk;

						} else if (
							chunk !== ''
							&& chunk !== 'localhost'
							&& chunk !== 'localhost.localdomain'
							&& chunk !== 'ipv6-localhost'
							&& chunk !== 'ipv6-localhost.localdomain'
						) {

							domains.push(chunk);

						}

					}

				} else {

					let tmp = line.split(' ');
					if (tmp.length > 1) {

						for (let t = 0, tl = tmp.length; t < tl; t++) {

							let chunk = tmp[t].trim();
							if (chunk !== '' && t === 0) {

								ip = chunk;

							} else if (
								chunk !== ''
								&& chunk !== 'localhost'
								&& chunk !== 'localhost.localdomain'
								&& chunk !== 'ipv6-localhost'
								&& chunk !== 'ipv6-localhost.localdomain'
							) {

								domains.push(chunk);

							}

						}

					} else {

						let chunk = tmp[0];
						if (chunk.includes('.')) {

							// Allow third-party domain lists that
							// are not in /etc/hosts format
							ip = '0.0.0.0';
							domains.push(tmp[0]);

						}

					}

				}


				if (ip !== null && domains.length > 0) {

					// RFC1122
					if (ip === '0.0.0.0') {
						ip = '127.0.0.1';
					}

					for (let d = 0, dl = domains.length; d < dl; d++) {

						let domain = domains[d];

						let entry = map[domain] || null;
						if (entry === null) {
							entry = map[domain] = [];
						}

						if (entry.includes(ip) === false) {
							entry.push(ip);
						}

					}

				}

			}

			for (let fqdn in map) {

				let ips = map[fqdn].map((v) => IP.parse(v)).filter((ip) => ip.type !== null);
				if (ips.length > 0) {

					let ref = URL.parse(fqdn);
					if (ref.domain !== null) {

						if (ref.subdomain !== null) {
							hosts.push({
								domain: ref.subdomain + '.' + ref.domain,
								hosts:  ips
							});
						} else {
							hosts.push({
								domain: ref.domain,
								hosts:  ips
							});
						}

					}

				}

			}

		}

	}

	return hosts;

};



const HOSTS = {

	isHost: function(ref) {

		ref = isObject(ref) ? ref : null;


		if (ref !== null) {

			if (isString(ref.domain) === true) {

				let tmp = URL.parse(ref.domain);
				if (tmp.domain !== null) {

					if (tmp.subdomain !== null) {

						if (ref.domain === tmp.subdomain + '.' + tmp.domain) {

							let check = ref.hosts.map((ip) => IP.isIP(ip));
							if (check.includes(false) === false) {
								return true;
							}

						}

					} else {

						if (ref.domain === tmp.domain) {

							let check = ref.hosts.map((ip) => IP.isIP(ip));
							if (check.includes(false) === false) {
								return true;
							}

						}

					}

				}

			}

		}


		return false;

	},

	isHosts: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			let check = array.map((host) => HOSTS.isHost(host));
			if (check.includes(false) === false) {
				return true;
			}

		}


		return false;

	},

	parse: function(hosts) {

		hosts = isString(hosts) ? hosts : null;


		if (hosts !== null) {
			return parse_payload(hosts);
		}


		return null;

	},

	render: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			let lines = [];

			array.forEach((entry) => {

				let domain = entry.domain || null;
				let hosts  = entry.hosts  || null;

				if (isString(domain) && isArray(hosts)) {

					if (hosts.length > 0) {
						hosts.forEach((ip) => {

							let chunk = IP.render(ip);
							if (chunk !== null) {
								lines.push(chunk + '\t' + domain);
							}

						});
					}

				}

			});

			if (lines.length > 0) {
				return lines.join('\n');
			}

		}


		return null;

	},

	sort: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			return array.filter((host) => HOSTS.isHost(host)).sort((a, b) => {

				let ref_a = URL.parse(a.domain);
				let ref_b = URL.parse(b.domain);

				if (ref_a.domain !== null && ref_b.domain !== null) {

					if (ref_a.domain < ref_b.domain) return -1;
					if (ref_b.domain < ref_a.domain) return  1;

					if (ref_a.subdomain !== null && ref_b.subdomain !== null) {

						if (ref_a.subdomain < ref_b.subdomain) return -1;
						if (ref_b.subdomain < ref_a.subdomain) return  1;

					} else {

						if (ref_a.subdomain !== null) return  1;
						if (ref_b.subdomain !== null) return -1;

					}

				} else {

					if (ref_a.domain !== null) return -1;
					if (ref_b.domain !== null) return  1;

				}


				let a_private = a.hosts.filter((ip) => ip.scope === 'private');
				let b_private = b.hosts.filter((ip) => ip.scope === 'private');

				if (a_private.length > 0 && b_private.length === 0) return -1;
				if (b_private.length > 0 && a_private.length === 0) return  1;

				if (a_private.length > 0 && b_private.length > 0) {

					let a_v4 = a.hosts.filter((ip) => ip.type === 'v4');
					let b_v4 = b.hosts.filter((ip) => ip.type === 'v4');

					if (a_v4.length > 0 && b_v4.length === 0) return -1;
					if (b_v4.length > 0 && a_v4.length === 0) return  1;

					let a_ip = IP.sort(a_v4)[0];
					let b_ip = IP.sort(b_v4)[0];

					if (a_ip.ip < b_ip.ip) return -1;
					if (b_ip.ip < a_ip.ip) return  1;

				}


				let a_public = a.hosts.filter((ip) => ip.scope === 'public');
				let b_public = b.hosts.filter((ip) => ip.scope === 'public');

				if (a_public.length > 0 && b_public.length > 0) {

					let a_v4 = a.hosts.filter((ip) => ip.type === 'v4');
					let b_v4 = b.hosts.filter((ip) => ip.type === 'v4');

					if (a_v4.length > 0 && b_v4.length === 0) return -1;
					if (b_v4.length > 0 && a_v4.length === 0) return  1;

					let a_ip = IP.sort(a_v4)[0];
					let b_ip = IP.sort(b_v4)[0];

					if (a_ip.ip < b_ip.ip) return -1;
					if (b_ip.ip < a_ip.ip) return  1;

				}


				return 0;

			});

		}


		return [];

	}

};


export { HOSTS };

