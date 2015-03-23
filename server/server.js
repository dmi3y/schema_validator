'use strict';
var
	http = require('http'),
	fs = require('fs'),
	url = require('url'),
	tv4 = require('tv4'),
	formats = require(__dirname + '/schemaFormats_tv4.js'),
	config = require(__dirname + '/../schema_validator.rc.js'),
	ip = config.ip,
	port = config.port,
	schemas = {};

tv4.addFormat(formats);

function parseData(str) {
    var
        out;

    try {

        out = JSON.parse(str);
    } catch(e) {

        out = '';
    }

    return out;
}

function proceedResponse(reqData, schema, res) {
	var
		out,
		headers = {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json;charset=UTF-8'
		},
		isValid,
		result,
		json = reqData.json,
		options = reqData.options,
		chkRec = options.checkRecursive? true: false,
		bnUnk = options.banUnknownProperties? true: false;

	if ( json ) {

		if ( schema ) {

			res.writeHead(200, headers);
			result = tv4.validateMultiple(json, schema, chkRec, bnUnk);
			isValid = result.valid;
			out = '{"isValid":' + isValid;

			if ( !isValid ) {

				out +=',"details":' + JSON.stringify(result.errors);
			}

			out +=  '}';
		} else {

			res.writeHead(404, headers);
			out = '{"err":"Schema not found."}';
		}
	} else {

		res.writeHead(400, headers);
		out = '{"err":"JSON not provided or not valid."}';
	}

	res.end(out);
}

function proceedAssets(fname, res) {
	var
		stream,
		asset = __dirname + '/../client_build' + fname,
		ext = fname.split('.').pop(),
		ctype = ext === 'js'? 'application/javascript': 'text/css';

	fs.exists(asset, function( here ) {

		if ( here ) {

			res.writeHead(200, {
				'Content-Type': ctype
			});
			stream = fs.createReadStream(asset);
			stream.pipe(res);
		} else {

			res.writeHead(404, {
				'Content-Type': 'text/html'
			});
			res.end('Asset not found');
		}
	});
}

function proceedCustomForm (schema, reqUrl, res) {
	var
		out,
		_reqUrl = reqUrl.replace('/', ''),
		headers = {
			'Content-Type': 'text/html'
		};

	if ( (schema && _reqUrl) || (!schema && !_reqUrl) ) {

		fs.readFile(__dirname + '/../client_build/customForm.html', function(err, cont) {

			if ( !err ) {

				res.writeHead(200, headers);
				out = cont.toString();
				out = out.replace(/{{name}}/gm, reqUrl);
				out = out.replace('{{schema}}', JSON.stringify(schema, null, '\t'));
			} else {

				res.writeHead(404, headers);
				out = 'Form template not found';
			}

			res.end(out);
		});
	} else {

		res.writeHead(404, headers);
		res.end('Schema not found');
	}
}

function getSchema(reqUrl, callback) {

	if ( typeof schemas[reqUrl] !== 'undefined' ) {

			callback(schemas[reqUrl], reqUrl);
	} else {

		fs.readFile(__dirname + '/../schemas' + reqUrl.toLowerCase(), function(err, schema) {
  			if ( err ) {

	  			schema = '';
  			} else {

  				schema = parseData(schema.toString());
  			}

  			schemas[reqUrl] = schema;
  			callback(schema, reqUrl);
		});
	}
}

function startServer() {

	http.createServer(function (req, res) {
		var
			reqUrl = url.parse(req.url).pathname,
			reqData = '',
			ext;

		if ( reqUrl !== '/favicon.ico' ) {

			if ( req.method === 'POST' ) {

	            req.on('data', function (data) {
	                reqData += data;
	            });
	            req.on('end', function () {

	            	reqData = parseData(reqData);
	            	if ( reqData ) {

		                getSchema(reqUrl, (function(reqData, res) {
		                	return function (schema) {

			                	proceedResponse(reqData, schema, res);
		                	};
		                }(reqData, res)));
	            	} else {

						proceedResponse('', '', res);
	            	}
	            });
			} else if ( reqUrl ) {

				ext = reqUrl.split('.').pop();
				if ( ['js','css'].indexOf(ext) >= 0 ) {

					proceedAssets(reqUrl, res);
				} else {
					getSchema(reqUrl, (function(res) {
	                	return function (schema, reqUrl) {

							proceedCustomForm(schema, reqUrl, res);
	                	};
	                }(res)));
				}
			} else {

				proceedResponse('', '', res);
			}
		}

	}).listen(port, ip);

	console.log('Server started');
}

fs.readdir(__dirname + '/../schemas', function(err, flist) {

	if ( !err ) {
		if ( flist.length ) {

			startServer();
		} else {

			console.log('Server not started: schemas are empty');
		}
	} else {

		console.log('Server not started: schemas are not readable');
	}
});
