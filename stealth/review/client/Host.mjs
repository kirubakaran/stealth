
import { isFunction                                                   } from '../../../base/index.mjs';
import { after, before, describe, finish, EXAMPLE                     } from '../../../covert/index.mjs';
import { IP                                                           } from '../../../stealth/source/parser/IP.mjs';
import { Host                                                         } from '../../../stealth/source/client/Host.mjs';
import { connect as connect_stealth, disconnect as disconnect_stealth } from '../Stealth.mjs';
import { connect as connect_client, disconnect as disconnect_client   } from '../Client.mjs';



before(connect_stealth);
before(connect_client);

describe('new Host()', function(assert) {

	assert(this.client.services.host instanceof Host, true);

});

describe('Host.prototype.save()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.save), true);

	this.client.services.host.save({
		domain: 'example.com',
		hosts:  [
			IP.parse('127.0.0.1'),
			IP.parse('::1')
		]
	}, (response) => {
		assert(response, true);
	});

});

describe('Host.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.read), true);

	this.client.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response.domain, 'example.com');
		assert(response.hosts[0], IP.parse('127.0.0.1'));
		assert(response.hosts[1], IP.parse('::1'));

	});

});

describe('Host.prototype.refresh()', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.refresh), true);

	this.client.services.host.refresh({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response.domain, 'example.com');
		assert(response.hosts.length > 0);

		let check4 = response.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, EXAMPLE.ipv4);
		assert(check6, EXAMPLE.ipv6);

	});

});

describe('Host.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.read), true);

	this.client.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response.domain, 'example.com');
		assert(response.hosts.length > 0);

		let check4 = response.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, EXAMPLE.ipv4);
		assert(check6, EXAMPLE.ipv6);

	});

});

describe('Host.prototype.remove()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.remove), true);

	this.client.services.host.remove({
		domain: 'example.com'
	}, (response) => {
		assert(response, true);
	});

});

describe('Host.prototype.read()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.read), true);

	this.client.services.host.read({
		domain: 'example.com'
	}, (response) => {

		assert(response !== null);
		assert(response.domain, 'example.com');
		assert(response.hosts.length > 0);

		let check4 = response.hosts.find((ip) => ip.type === 'v4') || null;
		let check6 = response.hosts.find((ip) => ip.type === 'v6') || null;

		assert(check4, EXAMPLE.ipv4);
		assert(check6, EXAMPLE.ipv6);

	});

});

describe('Host.prototype.remove()/success', function(assert) {

	assert(this.client !== null);
	assert(isFunction(this.client.services.host.remove), true);

	this.client.services.host.remove({
		domain: 'example.com'
	}, (response) => {
		assert(response, true);
	});

});

after(disconnect_client);
after(disconnect_stealth);


export default finish('stealth/client/Host', {
	internet: true
});

