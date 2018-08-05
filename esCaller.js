'use strict';

const	request	= require('requestretry'),
	argv	= JSON.parse(process.argv[2]),
	ipc	= require('node-ipc');

let	nextProcNr,
	ipcNextProc,
	ipcEsdump;

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
			sendToEsdump(err.message);
			sendToEsdump('EOF_ERROR');
			throw err;
		}

		if (scrollId === '0') {
			scrollId	= body.substring(15);
			scrollId	= scrollId.substring(0, scrollId.indexOf('"'));
		}

		if (body.endsWith('"hits":[]}}')) {
			sendToNextProc('EOF');
			sendToEsdump('EOF');
			return;
		}

		sendToNextProc(scrollId);
		sendToEsdump(reformatBody(body));
	});
}

function reformatBody(body) {
	const	parsedBody	= JSON.parse(body);

	let	result	= '';

	for (let i = 0; parsedBody.hits.hits[i] !== undefined; i ++) {
		const	hit	= parsedBody.hits.hits[i];

		result += '{"index":{"_id":"' + hit._id + '"}}\n';
		result += JSON.stringify(hit._source) + '\n';
	}

	return result;
}

function sendToEsdump(msg) {
	if ( ! ipcEsdump) {
		return setTimeout(function () {
			sendToEsdump(msg);
		}, 10);
	}

	ipcEsdump.emit('esdump', 'esCaller_' + String(argv.esCallerProcNr).padStart(10, '0') + ':' + msg);
}

function sendToNextProc(msg) {
	if ( ! ipcNextProc) {
		return setTimeout(function () {
			sendToNextProc(msg);
		}, 10);
	}
	ipcNextProc.emit('esCaller', msg);
}

// Start IPC sever on this worker
ipc.config.id	= argv['ipc.config.id'] + '_' + argv['esCallerProcNr'];
ipc.config.retry	= 1500;
ipc.config.silent	= true;
ipc.serve(function () {
	ipc.server.on('esCaller', function (msg) {
		if (msg === 'EOF') {
			sendToNextProc('EOF');
			setTimeout(function () {
				process.exit();
			}, 200);
		} else {
			callEs(msg);
		}
	});
});
ipc.server.start();

// Connect to server
ipc.connectTo(argv['ipc.config.id'], function () {
	ipc.of[argv['ipc.config.id']].on('connect', function () {
		ipcEsdump	= ipc.of[argv['ipc.config.id']];
	});
});

// Connect to next process in queue
if (argv.esCallerProcNr === argv.esCallerProcAmount - 1) {
	nextProcNr	= 0;
} else {
	nextProcNr	= argv.esCallerProcNr + 1;
}
ipc.connectTo(argv['ipc.config.id'] + '_' + nextProcNr, function () {
	ipc.of[argv['ipc.config.id'] + '_' + nextProcNr].on('connect', function () {
		ipcNextProc	= ipc.of[argv['ipc.config.id'] + '_' + nextProcNr];
	});
});