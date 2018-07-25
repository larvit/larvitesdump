'use strict';

const	reformatBody	= require('./reformatBody.js'),
	reqOptions	= {},
	scrollId	= process.argv[2],
	request	= require('requestretry'),
	esUrl	= process.argv[3];

reqOptions.method	= 'POST';
reqOptions.headers	= {'content-type': 'application/json'};

reqOptions.url = esUrl + '_search/scroll';
reqOptions.body	= '{"scroll":"5m","scroll_id":"' + scrollId + '"}';
console.log('wuff');
//request(reqOptions, function (err, response, body) {
//	if (err) throw err;
//
//	process.stdout.write('started');
//
//	if (body.endsWith('"hits":[]}}')) {
//		return;
//	}
//
//	process.stdout.write(reformatBody(body));
//});