var mongoose = require('mongoose'); // mongoose for mongodb

var Schema = mongoose.Schema;

// single Todo
var TodoSchema = Schema({
  text: String
});

// All todos from user
var TodosSchema = Schema({
  username: String,
  password: String,
  todos: [{ type: TodoSchema, default: () => ({}) }]
});

// Todos model
var Todos = mongoose.model('Todos', TodosSchema);

module.exports = {
  Todos: Todos
};
