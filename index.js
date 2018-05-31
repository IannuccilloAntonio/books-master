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
  'mongodb://127.0.0.1:32768/books',
  function (err) {
    if (err) {
      console.log(err);
      return;
    }

    app.listen(3009);
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
    res.render('index', {
      books: result
    });
  });
});



app.get( '/new-book', function (req, res) {
  res.render('new_book');
});


app.post( '/new-book', function (req, res) {
  console.log(req.body);
  //if (!req.body.title) {
  //}
  const book = new Book({
    title: req.body.title,
  });
  book.save().then( function () {
    res.redirect('/new-book');
  });
});

app.post( '/delete-book', function (req, res) {
  Book.remove( { _id: req.body.id }, function (err) {
    res.redirect('/');
  });
});
app.post( '/delete-comment', function (req, res) {
  Comment.remove( { _id: req.body.commentId }, function (err) {
    res.redirect('/books/'+ req.body.bookId);//pagina di quale librooo???
  });
});

app.get( '/books/:id', function (req, res) {
  Book.find( { _id: req.params.id } ).exec( function (err, books) {
	  Comment.find( { bookId: req.params.id } ).exec( function (err, comments) {
	    res.render('book', {
               book: books[0],
               comments: comments, //lo stesso ma con comment
	    });
  	  });
  });
});

app.post( '/book-update', function (req, res) {
  //if (!req.body.title) {
  //}
  
  Book.update({
    _id: req.body.id
  }, {
    title: req.body.title,
  }, function (err) {
    res.redirect('/');
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

app.post( '/delete-prenotazione', function (req, res) {
	Book.update({
	 _id: req.body.id,
	}, {
       prestito: {}
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
  res.render('search');
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
