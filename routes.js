var	multer  = require('multer'),
	consolidate = require('consolidate');

module.exports = function(app, domain, fs, logger) {

	app.engine('html', consolidate.swig);
	app.set('view engine', "html");
	app.set('views', __dirname + "/views");

	domain.on('error', function(err) {
	// To avoid repetition, while exception occurs in response write
	if (!replied) {
		replied = true;
		res.writeHead(500);
		res.end(err.message);
		logger.info('Domain error handling');
		logger.info(err);
	} else {
		logger.info('Domain error handling');
		logger.info(err);
	}
	});

	logger.debug(domain);

	app.use('*', function(req, res, next) {
		logger.debug('middleware invoked');
		next();
	});
	var paths = [], path = "";
	fs.readdir('./uploads/', function(err, files) {
		paths = files;
	});

	app.use(multer({ dest: './uploads/',
	  rename: function (fieldname, filename) {
		return filename;
	  },
		onFileUploadStart: function (file) {
		logger.debug(file.originalname + ' is starting ...')
	   },
		onFileUploadComplete: function (file) {
		logger.debug(file.fieldname + ' uploaded to  ' + file.path)
		path = file.originalname;
		done=true;
		}
	}));

	app.get('/', function(req, res) {
		res.sendfile("index.html");
	});
		
	app.get('/download',function(req,res){
	  if (paths.length == 0) {
			res.render('No files were found');
	  } else {
		res.render('download', {'paths': paths});
	  }	
	});

	app.post('/upload',function(req,res){
	  if(done==true){
		res.send('Uploaded successfully');
		paths.push(path);
	  }
	});

	app.get('/:file(*)', function(req, res, next){
	  var file = req.params.file
		, path = file;

	  res.download(path);
	});
	
	app.get('*', function(req, res) {
		res.send("Page not available", 404);
	});
};

