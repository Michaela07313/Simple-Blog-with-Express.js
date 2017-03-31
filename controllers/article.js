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
    },
    editGet: (req, res) => {
        let id = req.params.id

        if (!req.isAuthenticated()) {
            let returnUrl = `/article/edit/${id}`
            req.session.returnUrl = returnUrl

            res.redirect('/user/login')
            return
        }

        Article.findById(id)
        .then(article => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(article)) {
                    res.redirect('/')
                    return
                }

                res.render('article/edit', article)
            })
        })
    },
    editPost: (req, res) => {
        let articleArgs = req.body
        let id = req.params.id
        let errorMsg = ''

        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged in to edit the article!'
        } else if (!articleArgs.title) {
            errorMsg = 'Invalid title'
        } else if (!articleArgs.content) {
            errorMsg = 'Invalid content'
        }

        if (errorMsg) {
            res.render('article/edit', {error: errorMsg})
        } else {
          Article.findByIdAndUpdate(id, {
          $set: {
            title: articleArgs.title,
            content: articleArgs.content
          },
          new: true
        })
        .exec()
        .then(articleArgs => {
          res.redirect(`/article/details/${id}`)
        })
      }
    },
    deleteGet: (req, res) => {
        let id = req.params.id

        if (!req.isAuthenticated()) {
            let returnUrl = `/article/delete/${id}`
            req.session.returnUrl = returnUrl

            res.redirect('/user/login')
            return
        }
        
        Article.findById(id)
        .then(article => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(article)) {
                    res.redirect('/')
                    return
                }

                res.render('article/delete', article)
            })
        })
    },
    deletePost: (req, res) => {
        let id = req.params.id

        Article.findOneAndRemove({_id: id})
        .populate('author')
        .then(article => {
            let author = article.author
            let index = author.articles.indexOf(article.id)

            if (index < 0) {
                let errorMsg = 'Article was not found for that author'
                res.render('article/delete', {error: errorMsg})
            } else {
                let count = 1
                author.articles.splice(index, count)
                author.save().then((user) => {
                    res.redirect('/')
                })
            }
        })
    }
}