const express = require('express');
const path = require('path');
const log = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  prestito: {
    nome: String,
    cognome: String,
  }
});

const Book = mongoose.model('Book', bookSchema);

const commentSchema = mongoose.Schema({
	comment: { type: String, required: true },
	bookId: {type: String, required:true}
});

const Comment = mongoose.model('Comment', commentSchema);

const app = express();

mongoose.connect(
  'mongodb://127.0.0.1:27017/books',
  function (err) {
    if (err) {
      console.log(err);
      return;
    }

    app.listen(3006);
  }
);

app.use( log('dev') );

app.set( 'views', path.resolve(__dirname, 'views') );
app.set( 'view engine', 'ejs' );

app.use( '/css', express.static( path.resolve(__dirname, 'css') ) );
app.use( '/js', express.static( path.resolve(__dirname, 'js') ) );

app.use( bodyParser.urlencoded( { extended : false } ) );

app.get( '/', function (req, res) {
  Book.find().exec( function (err, result) {
    res.render('index-cliente', {
      books: result
    });
  });
});


app.get( '/books/:id', function (req, res) {
  Book.find( { _id: req.params.id } ).exec( function (err, books) {
	  Comment.find( { bookId: req.params.id } ).exec( function (err, comments) {
	    res.render('book-cliente', {
               book: books[0],
               comments: comments, //lo stesso ma con comment
	    });
  	  });
  });
});

app.post('/prenota', function (req, res) {
  console.log(req.body);
  Book.update({
    _id: req.body.id,
  }, {
    "prestito.nome": req.body.nome,
    "prestito.cognome": req.body.cognome
  }, function (err) {
    res.redirect('/');
  });
});


app.post('/comment', function (req, res) {
  console.log(req.body);	
	const comment = new Comment({
    comment: req.body.comment,
	bookId: req.body.id
	});
console.log(comment);
  	comment.save().then( function (err) {
console.log(err);
    	res.redirect('/');
	});
});


app.get('/search', function (req, res) {
  res.render('search-cliente');
});

app.get('/search-title/:title', function (req, res) {
  const title =  req.params.title;
  Book.find({
    title: {
      $regex: title,
      $options: 'i'
    }
  }).exec( function (err, result) {
    res.json(result);
  });
});

app.use( function (req, res) {
  res.status(404);
  res.end('page not found');
});
