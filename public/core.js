var app = angular.module('todoApp', ['ui.router']);

app.config(function ($stateProvider, $locationProvider) {
  // An array of state definitions
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/todo-list.html'
    })
    .state('login', {
      url: '/login',
      templateUrl: '/login.html'
    });

  $locationProvider.html5Mode(true).hashPrefix('*');
});

app.service('Auth', function ($location, $http) {
  var self = this;

  self.register = function (scope) {
    $http.post('/register', scope.formLoginData)
      .success((data) => {
        sessionStorage.setItem('token', data.token);

        scope.errorMessage = '';
        scope.successMessage = `User ${scope.formLoginData.username} created!`;
        scope.formLoginData = {};
        $location.path('/home');
      })
      .error((data, status) => {
        scope.successMessage = '';
        switch (status) {
          case 409:
            scope.errorMessage = `User ${scope.formLoginData.username} already exists!`;
            break;

          default:
            if (scope.formLoginData.username) {
              scope.errorMessage = `Error creating user ${scope.formLoginData.username}!`;
            } else {
              scope.errorMessage = `Error creating user!`;
            }
            break;
        }
        scope.formLoginData = {};
      });
  };

  self.login = function (scope) {
    $http.post('/login', scope.formLoginData)
      .success((data) => {
        if (!data.token) {
          $location.path('/login');
          return;
        }

        sessionStorage.setItem('token', data.token);
        scope.errorMessage = '';
        $location.path('/home');
      })
      .error(() => {
        scope.successMessage = '';
        scope.errorMessage = `User or password incorrect!`;
        scope.formLoginData = {};
        $location.path('/login');
      });
  };

  self.logout = function () {
    sessionStorage.clear();
    $location.path('/login');
  };
});

app.controller('homeController', function ($scope, $http, $location, Auth) {
  $scope.formData = {};
  var token = sessionStorage.getItem('token');

  // when landing on the page, get all todos and show them
  $http.get(`/api/todos`, { headers: { 'x-access-token': token } })
    .success(data => updateTodosList(data))
    .error(err => handleError(err));

  // when submitting the add form, send the text to the node API
  $scope.createTodo = () => {
    if (!$scope.formData.text) {
      $scope.formData.errorMessage = 'Please type a name!';
      return;
    };

    let req = {
      method: 'POST',
      url: `/api/todos/`,
      headers: {
        'x-access-token': token
      },
      data: $scope.formData
    };

    $http(req)
      .success(data => updateTodosList(data))
      .error(err => handleError(err));
  };

  // delete a todo after checking it
  $scope.deleteTodo = (id) => {
    if (!id) {
      $scope.formData.errorMessage = 'Please select a Todo!';
      return;
    }

    let req = {
      method: 'DELETE',
      url: `/api/todos/${id}`,
      headers: {
        'x-access-token': token
      }
    };

    $http(req)
      .success(data => updateTodosList(data))
      .error(err => handleError(err));
  };

  $scope.updateTodo = (id) => {
    if (!id) {
      $scope.formData.errorMessage = 'Please select a Todo!';
      return;
    };

    let req = {
      method: 'PUT',
      url: `/api/todos/${id}`,
      headers: {
        'x-access-token': token
      },
      data: $scope.formData
    };

    $http(req)
      .success(data => updateTodosList(data))
      .error(err => handleError(err));
  };

  $scope.selectTodo = (id, text) => {
    if (!$scope.formData.id) {
      $scope.formData = { id, text };
    } else {
      $scope.formData = {};
    }
  };

  $scope.logout = Auth.logout;

  function updateTodosList (data) {
    console.log('updateTodosList', data);
    $scope.formData = {}; // clear the form so our user is ready to enter another
    if (data.todos) {
      $scope.todos = data.todos;
    }
    $scope.user = data.username;
    $scope.userGreeting = data.username ? `Hey, ${data.username}!` : `Hey!`;
  }

  function handleError (err) {
    console.log('Error: ' + err);
    $location.path('/login');
  }
});

app.controller('loginController', function ($scope, Auth) {
  $scope.formLoginData = {
    username: '',
    password: ''
  };

  $scope.errorMessage = '';
  $scope.successMessage = '';

  $scope.register = () => Auth.register($scope);

  $scope.login = () => Auth.login($scope);

  $scope.logout = Auth.logout;
});

app.controller('mainController', function ($location) {
  $location.path('/login');
});
