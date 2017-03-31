const mongoose = require('mongoose')

function initializeRole(roleName) {
    let roleData = {name: roleName}

    Role.findOne(roleData)
    .then(role => {
        if (!role) {
            Role.create(roleData)
        }
    })
}

let roleSchema = mongoose.Schema ({
    name: {type: String, required: true, unique: true},
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
})

const Role = mongoose.model('Role', roleSchema)

module.exports = Role

module.exports.initialize = () => {
    initializeRole('User')
    initializeRole('Admin')
}