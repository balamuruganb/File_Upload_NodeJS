var https = require('https'), 
	cluster = require('cluster'),
	fs = require('fs'),
	express = require('express'),
	app  = express(),
	winston = require('winston');
	domain  = require('domain').create();
	
var numCPUs = require('os').cpus().length;
winston.emitErrs = true;

// Routes module
//require('./domain')(domain);
var logger = require('./logging');
require('./routes')(app, domain, fs, logger);

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    logger.info('worker ' + worker.process.pid + ' died');
  });
} else {
  
	var privateKey  = fs.readFileSync('sslcert/pri.pem', 'utf8'),
	certificate = fs.readFileSync('sslcert/pub.pem', 'utf8');

	var credentials = {key: privateKey, cert: certificate};

	var httpsServer = https.createServer(credentials, app);
	httpsServer.listen(443);
}





