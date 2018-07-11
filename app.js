
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , bodyPaser = require('body-parser');
var mysql= require('mysql');
var app = express();
var client = mysql.createConnection({
	hostname:"127.0.0.1:3306", 
	user : "root",
	password:"1522653as",
	database:"darack"
});
var session=require('express-session');
var MySQLStore = require('express-mysql-session')(session);


client.connect(function(err){
	console.log('MysqlCONNection');
	if(err){console.error(err);
		throw err;
	}
});

var sessionStore = new MySQLStore({
   hostname:"localhost",
   port:"3306",
   user:"root",
   password:"1522653as",
   database:"darack"
});

app.use(session({
	   resave: false,
	   saveUninitialized: true,
	//  key: 'sid', // 세션키
	  secret: 'secret', // 비밀키
	  store: sessionStore
	  /*
	  cookie: {
	     id: 'sej',
	    maxAge: 1000 * 60 * 60 // 쿠키 유효기간 1시간
	  }*/
	}));



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
app.set('views', path.join(__dirname, 'views'));

app.set("view engine", 'html');


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

app.get('/write', function(req, res){
	var uid=req.session.sessionId;

	 if(req.session.sessionId){
		 client.query('SELECT * from USER where user_id=?',[uid], function(ERR, profile){
			res.render('write.ejs',{
				writer:req.session.sessionId,
				uid:req.session.sessionId,
				uname:profile[0].user_name,
				ubirth:profile[0].user_birth
			});
		 });
  }
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
	    	 req.session.sessionId = uid,
	    	
	         res.redirect('/servermain');
	      }else{
	         res.json({result:'fail'});
	         res.send('<script> alert("id or passwd is wrong"); history.back();</script>');
	      }
	});
});



app.get('/logout', function(req, res){
	delete req.session.sessionId;
	res.redirect('/');
});

var uname;
app.post('/signcheck', function(req,res){
	var nid=req.body.nid;
	var uid=req.body.id;
	var upw=req.body.pw;
	var upn=req.body.pn;
	var uemail = req.body.email;
	var ubirth=req.body.birth;
	uname = req.body.name;
	
	var connection = client.query('INSERT into USER (user_id, user_email, user_pw, user_phonenumber, user_birth, user_name) values(?,?,?,?,?,?)',[uid,uemail,upw,upn,ubirth,uname],function(err, rows){
		
		console.log(rows);
		
		if(err){
				console.error('err',err);
				throw err;
		}
			console.log(connection);
			
		});
	
	res.redirect('/');
});

app.post('/writecheck', function(req,res){

	var title=req.body.title;
	var writer=req.session.sessionId;
	var contents=req.body.contents;
	 req.session.sessionId = writer;
	 console.log(title);
     client.query('INSERT into board (b_title,b_writer, b_contents) values(?,?,?)',[title,writer, contents]);
     res.redirect('/servermain');
		  
		  
     /* if(err){
			console.error('err',err);
			}
		
		 var cnt = rows[0].cnt;
	      
	      if( cnt === 1 ){
	    	
	      }else{
	         res.json({result:'fail'});
	         res.send('<script> alert("내용 다 안채워짐"); history.back();</script>');
	      }
     
 	
	});
	*/
});
app.get('/servermain:number', function(req, res){
	var uid=req.session.sessionId;

	 if(req.session.sessionId){
		 client.query('SELECT * from USER where user_id=?',[uid], function(ERR, profile){
	    	client.query('SELECT count(*) cnt from board', function(err, rows){
	    		var cnt=rows;
	    		client.query('SELECT b_id, b_title, b_writer, b_contents, date_format(board.b_date, "%Y-%m-%d") as b_date , b_count from board order by b_id desc limit ?,10',[10*(req.params.number-1)], function(err, rows){
		    		
		    		if(err){
		    			console.error('err',err);
		    			}
		    		
					res.render('servermain.ejs', {
						uid:req.session.sessionId,
						uname:profile[0].user_name,
						ubirth:profile[0].user_birth,
						rows:rows,
						cnt:cnt
					});
			    });
	    	});
		 });
}
});

app.get('/servermain', function(req, res){
	var uid=req.session.sessionId;
	  if(req.session.sessionId){
		  client.query('SELECT * from USER where user_id=?',[uid], function(ERR, profile){
			
	    	client.query('SELECT count(*) cnt from board', function(ERR, rows){
	    		var cnt=rows;
	    		client.query('SELECT b_id, b_title, b_writer, b_contents, date_format(board.b_date, "%Y-%m-%d") as b_date , b_count from board order by b_id desc limit 0,10',function(err, rows){
		    		
		    		if(err){
		    			console.error('err',err);
		    			}
		    		
					res.render('servermain.ejs', {
						uid:req.session.sessionId,
						uname:profile[0].user_name,
						ubirth:profile[0].user_birth,
						rows:rows,
						cnt:cnt
					});
			    });
	    	});
		  
		});
	  

}

		else
			res.redirect('/');
	  
});
app.get('/look:number', function(req, res){
	var uid=req.session.sessionId;

	 if(req.session.sessionId){
		 client.query('UPDATE board SET b_count=b_count+1 where b_id=?',[req.params.number*1]);
		 client.query('SELECT * from USER where user_id=?',[uid], function(ERR, profile){
				
	    	client.query('SELECT * from board where b_id=?',[req.params.number*1], function(err,rows){
					
						res.render('look.ejs', {
						uid:req.session.sessionId,
						uname:profile[0].user_name,
						ubirth:profile[0].user_birth,
						rows:rows[0]
						
					});
	    	});
		 });
	 }
});

app.get('/mypage', function(req, res){
	var uid=req.session.sessionId;
	
	 if(req.session.sessionId){
		 client.query('SELECT * from USER where user_id=?',[uid], function(ERR, profile){
			 	res.render('mypage.ejs',{
					uid:req.session.sessionId,
					uname:profile[0].user_name,
					ubirth:profile[0].user_birth
				});
		 });
	 }
});

app.post('/delete',function(req,res){
	var postnum = req.params.number;
	   client.query('DELETE FROM board where b_id=?',[req.body.b_id], function(err,rows){
	         if(err) console.error('err', err);
	         console.log("delete success");
	         res.redirect('/servermain1');
	   });
	});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});




