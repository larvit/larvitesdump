'use strict';

/*
const	reformatBody	= require('./reformatBody.js'),
	reqOptions	= {},
	request	= require('requestretry'),
	childs	= [],
	spawn	= require('child_process').spawn,
	argv	= require('minimist')(process.argv.slice(2));

let	dumpFinnished	= false,
	indexName	= argv._[0] || false,
	typeName	= argv._[1] || false,
	esProt	= argv.protocoll	|| 'http',
	esHost	= argv.h || '127.0.0.1',
	esPort	= argv.P || '9200',
	esUrl	= esProt + '://' + esHost + ':' + esPort + '/';

function runChild(scrollId) {
	const	child	= spawn('node', [__dirname + '/processEsCall.js', scrollId, esUrl]);

	childs.push(child);

	child.output	= '';

	child.stdout.on('data', function (data) {
		if (data.length === 7) {
			if (dumpFinnished !== true) {
				runChild(scrollId);
			}
		} else {
			child.output += data;
		}
	});

	child.on('exit', function () {
		child.completed	= true;

		// Push all completed childrens output to stdout and remove them
		// from the array until we find one that is not completed yet
		for (let i = 0; childs[i] !== undefined; i ++) {
			const	child	= childs[i];

			if (child.completed !== true) break;

			if (child.output === '') {
				dumpFinnished	= true;
			}

			process.stdout.write(child.output);	// Output childs outpt to stdout
			childs.splice(0, 1);	// Remove this child from the childs array
			i --;	// Rewind the iterator so we actually get the next element
		}
	});
}

reqOptions.method	= 'POST';
reqOptions.headers	= {'content-type': 'application/json'};
reqOptions.url	= esUrl + indexName + '/' + typeName + '/_search?scroll=5m';
reqOptions.body	= '{"size":10000,"query":{"match_all":{}}}';

request(reqOptions, function (err, response, body) {
	let	scrollId;

	if (err) throw err;

	scrollId	= body.substring(15);
	scrollId	= scrollId.substring(0, scrollId.indexOf('"'));

	if (body.endsWith('"hits":[]}}')) {
		return;
	}

	runChild(scrollId);
	process.stdout.write(reformatBody(body));
});
*/