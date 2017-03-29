const Article = require('mongoose').model('Article')
const passport = require('passport');
const LocalPassport = require('passport-local');

module.exports = {
    createGet: (req, res) => {
        res.render('article/create')
    },
    createPost: (req, res) => {
        let articleArgs = req.body
        let errorMsg = ''

        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged in to create articles!'
        } else if (!articleArgs.title) {
            errorMsg = 'Invalid title'
        } else if (!articleArgs.content) {
            errorMsg = 'Invalid content'
        }

        if (errorMsg) {
            res.render('article/create', {error: errorMsg})
            return
        }

        articleArgs.author = req.user.id
        Article.create(articleArgs)
        .then(article => {
            req.user.articles.push(article.id)
            req.user.save(err => {
                if (err) {
                    res.redirect('/', {erro: err.message})
                } else {
                    res.redirect('/')
                }
            })
        })
    },
    details: (req, res) => {
        let id = req.params.id;

        Article.findById(id)
        .populate('auhor')
        .then(article => {
            res.render('article/details', article)
        })
    }
}