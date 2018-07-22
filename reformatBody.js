'use strict';

function reformatBody(body) {
	const	parsedBody	= JSON.parse(body);

	let	stdoutStr	= '';

	for (let i = 0; parsedBody.hits.hits[i] !== undefined; i ++) {
		const	hit	= parsedBody.hits.hits[i];

		stdoutStr += '{"index":{"_id":"' + hit._id + '"}}\n';
		stdoutStr += JSON.stringify(hit._source) + '\n';
	}

	return stdoutStr;
}

exports = module.exports = reformatBody;