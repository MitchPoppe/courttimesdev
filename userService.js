app.factory('userService', ['$http', '$q', function($http, $q) {
    var key = '';
    var login = '';
    var gymKey = '';
    return {
        saveLogin: function(newLogin) {
            login = newLogin;
        },

        saveKey: function(newKey) {
            key = newKey;
        },

        getLogin: function() {
            return login;
        },

        getKey: function() {
            return key;
        },

        setGymKey: function(key) {
            gymKey = key;
        },

        getGymKey: function() {
            return gymKey;
        },

        confirmUserUnique: function(userName, callback) {
            try {
                return $http({
                        method: 'GET',
                        url: '/api/users?user_name=' + userName
                    })
                    .then(function(response) {
                        if (typeof response.data === 'string') {
                            callback(response.data);
                        } else {
                            // invalid response
                            return $q.reject(response.data);
                        }

                    }, function(response) {
                        // something went wrong
                        return $q.reject(response.data);
                    });
            } catch (e) {
                console.log('Error:');
                console.log(e);
            }
        },

        login: function(userName, pwd, callback) {
            return $http({
                    method: 'GET',
                    url: '/api/users?user_name=' + userName,
                    headers: { 'pwd': pwd } // put the password in the header for security reasons
                })
                .then(function(response) {
                    if (response) {
                        // returns the user ID / key if successful
                        if (typeof response.data === 'string' || typeof response.data === 'object')
                            callback(response.data);
                    } else {
                        // invalid response
                        return $q.reject(response.data);
                    }

                }, function(response) {
                    // something went wrong
                    return $q.reject(response.data);
                });
        },

        createAccount: function(userName, userPwd, key, callback) {
            console.log('in user create: ' + userName);
            var data = JSON.stringify({
                'userName': userName,
                'pwd': userPwd,
                'key': key
            });
            return $http({
                    method: 'POST',
                    url: '/api/users',
                    data: data
                })
                .then(function(response) {
                    if (typeof response.data != undefined) {
                        //createCategories (keySave);
                        callback(response.data);
                    } else {
                        // invalid response
                        return $q.reject(response.data);
                    }

                }, function(response) {
                    // something went wrong
                    return $q.reject(response.data);
                });
        },

        updateAccount: function(userName, userPwd, newPwd, callback) {
            console.log('in user update: ' + userName);
            var data = JSON.stringify({
                'userName': userName,
                'pwd': userPwd,
                'newPwd': newPwd
            });
            return $http({
                    method: 'PUT',
                    url: '/api/users',
                    data: data
                })
                .then(function(response) {
                    if (typeof response.data != undefined) {
                        callback(response.data);
                    } else {
                        // invalid response
                        return $q.reject(response.data);
                    }

                }, function(response) {
                    // something went wrong
                    return $q.reject(response.data);
                });
        }

    };
}]);