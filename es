#!/usr/bin/env node
'use strict';

const	request	= require('requestretry'),
	argv	= require('minimist')(process.argv.slice(2));

let	indexName	= argv._[0] || false,
	typeName	= argv._[1] || false,
	esProt	= argv.protocoll	|| 'http',
	esHost	= argv.h || '127.0.0.1',
	esPort	= argv.P || '9200',
	esUrl	= esProt + '://' + esHost + ':' + esPort + '/';

function sendToEs() {
	const	reqOptions	= {};

	let	reqObj;

	reqOptions.url	= esUrl + indexName + '/' + typeName;
	reqOptions.method	= 'POST';
	reqOptions.headers	= {'content-type': 'application/json'};

	reqObj	= request(reqOptions);

	reqObj.on('error', function (err) {
		throw err;
	});

	process.stdin.pipe(reqObj).pipe(process.stdout);
}

sendToEs();