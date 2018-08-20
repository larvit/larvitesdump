'use strict';

const	request	= require('requestretry'),
	http	= require('http'),
	argv	= JSON.parse(process.argv[2]);

let	httpServer;

function callEs(scrollId) {
	const	reqOptions	 = {};

	reqOptions.method	= 'POST';
	reqOptions.headers	= {'content-type': 'application/json'};

	if (scrollId === '0') {
		reqOptions.url	= argv.esUrl + argv.indexName + '/' + argv.typeName + '/_search?scroll=5m';
		reqOptions.body	= '{"size":10000,"query":{"match_all":{}}}';
		reqOptions.maxAttempts	= 1;
		reqOptions.retryDelay	= 10;
	} else {
		reqOptions.url	= argv.esUrl + '_search/scroll';
		reqOptions.body	= '{"scroll":"5m","scroll_id":"' + scrollId + '"}';
	}

	request(reqOptions, function (err, response, body) {
		if (err) {
			sendToEsdump(err.message + '\n');
			sendToEsdump(err.stack + '\n');
			sendToEsdump('EOF_ERROR');
			throw err;
		}

		if (response.statusCode !== 200) {
			sendToEsdump('Non 200 answer from ES: ' + response.statusCode + '\n');
			sendToEsdump('ES body: ' + body + '\n');
			sendToEsdump('EOF_ERROR');
			return;
		}

		if (scrollId === '0') {
			scrollId	= body.substring(15);
			scrollId	= scrollId.substring(0, scrollId.indexOf('"'));
		}

		if (body.endsWith('"hits":[]}}')) {
			sendToEsdump('EOF');
			return;
		}

		sendToNextProc(scrollId, function () {
			reformatBody(body);
		});
	});
}

function reformatBody(body) {
	const	parsedBody	= JSON.parse(body);

	let	result	= '';

	if ( ! parsedBody || ! parsedBody.hits || ! Array.isArray(parsedBody.hits.hits)) {
		const	err	= new Error('Invalid body from ES call');
		sendToEsdump(err.message + ':');
		sendToEsdump(body);
		sendToEsdump('EOF_ERROR');
		throw err;
	}

	for (let i = 0; parsedBody.hits.hits[i] !== undefined; i ++) {
		const	hit	= parsedBody.hits.hits[i];

		result += '{"index":{"_id":"' + hit._id + '"}}\n';
		result += JSON.stringify(hit._source) + '\n';
	}

	sendToEsdump(result);
}

function sendToEsdump(msg, cb) {
	request({
		'url':	'http://127.0.0.1:27000',
		'method':	'POST',
		'body':	msg,
		'maxAttempts':	100,
		'retryDelay':	50
	}, function (err) {
		if (err) {
			console.error('Error when calling sendToEsdump():');
			throw err;
		}
		if (typeof cb === 'function') cb(err);
	});
}

function sendToNextProc(msg, cb) {
	request.post({
		'url':	'http://127.0.0.1:' + argv.nextEsCallerPort,
		'method':	'POST',
		'body':	msg,
		'maxAttempts':	100,
		'retryDelay':	50
	}, function (err) {
		if (err) {
			console.error('Error when calling sendToNextproc():');
			throw err;
		}
		if (typeof cb === 'function') cb(err);
	});
}

// Start http server
httpServer = http.createServer(function (req, res) {
	req.on('data', function (chunk) {
		if (chunk.length === 3 && chunk.toString() === 'EOF') {
			process.exit();
		} else {
			callEs(chunk.toString());
		}
	});

	req.on('end', function () {
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end('ok');
	});
});
httpServer.listen(27000 + Number(argv.esCallerProcNr) + 1);

// Initial call to ES
if (Number(argv.esCallerProcNr) === 0) {
	callEs('0');
}