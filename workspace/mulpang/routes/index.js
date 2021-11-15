var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/today.html');
});
// http://localhost/today.html -> req.params.page = 'today'
router.get('/:page.html', function(req, res, next) {
  res.render(req.params.page);
});

module.exports = router;
