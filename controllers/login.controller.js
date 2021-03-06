/* The express login controller defines routes 
 * for displaying the login view and authenticating 
 * user credentials.
 * 
 * On successful authentication the jwt token returned 
 * from the api is stored in the user session so it 
 * can be made available to the angular application 
 * when it loads (via the '/token' route defined 
 * in the express app controller).
*/

var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
	// log user out
	delete req.session.token;
	
	// move success message into local variable so it only appears once (single read)
	var viewData = { success: req.session.success };
	delete req.session.success;
	
	res.render('login', viewData);
});

router.post('/', function (req, res) {
	// authenticate using api to maintain clean separation between layers
	request.post({
		url: config.apiUrl + '/users/authenticate',
		form: req.body,
		json: true
	}, function (error, response, body) {
		if(error) {
			return res.render('login', { 
				error: 'Во время входа произошла ошибка. Повторите попытку позже' 
			});
		}
		
		if (!body.token) {
			return res.render('login', { 
				error: 'Некорректное имя или пароль пользователя', 
				username: req.body.username 
			});
		}
		
		// save JWT token in the session to make it available to the angular app
		req.session.token = body.token;
		
		// redirect to returnUrl
		var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
		res.redirect(returnUrl);
		});
});

module.exports = router;