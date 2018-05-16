
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , bodyPaser = require('body-parser')
var mysql= require('mysql');
var app = express();
var client = mysql.createConnection({
	hostname:"127.0.0.1:3306", 
	user : "root",
	password:"1522653as",
	database:"darack"
});

client.connect(function(err){
	console.log('MysqlCONNection');
	if(err){console.error(err);
	throw err;
}
});
var session=require('express-session');

// all environments
app.set('port', process.env.PORT || 3004);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized:true
}));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
	res.render('index.html');
});
app.get('/signup', function(req, res){
	res.render('SignUp.html');
});

app.post('/logincheck', function(req, res){
	var uid=req.body.id;
	var upw=req.body.pw;
	var connection = client.query('SELECT count(*) cnt from USER where user_id=? and user_pw=?',[uid,upw],function(err, rows){
		if(err){
			console.error('err',err);
			}
		
		 var cnt = rows[0].cnt;
	      
	      if( cnt === 1 ){
	    	//  req.session.user_id=uid;
	         res.send( '<h1>'+uid+'님 환영합니다!</h1>');
	      
	      }else{
	         res.json({result:'fail'});
	         res.send('<script> alert("id or passwd is wrong"); history.back();</script>');
	      }
	});
});

app.post('/signcheck', function(req,res){
	var nid=req.body.nid;
	var uid=req.body.id;
	var upw=req.body.pw;
	var upn=req.body.pn;
	var uemail = req.body.email;
	var ubirth=req.body.birth;
	var uname = req.body.name;
	
	var connection = client.query('INSERT into USER (user_id, user_email, user_pw, user_phonenumber, user_birth, user_name) values(?,?,?,?,?,?)',[uid,uemail,upw,upn,ubirth,uname],function(err, rows){
		
		console.log(rows);
		
		if(err){
				console.error('err',err);
				
				throw err;
				
				}
			
			console.log(connection);
		});
	
	res.send('<h1>success</h1>');
});


app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
