app.factory('itemService', ['$http', function($http, $q) {

    var deleteReservation = {};

    return {
        // call to get all gym detail items
        get: function() {
            return $http.get("http://glacial-meadow-15699.herokuapp.com/api/items") // PROD, do a common URL string for all of these. 
                .then(function(response) {
                    if (typeof response.data === 'object') {
                        return response.data;
                    } else {
                        return $q.reject(response.data);
                    }

                }, function(response) {
                    return $q.reject(response.data);
                });
        },

        getSchedule: function(current_id, startDate) {
            return $http.get("http://glacial-meadow-15699.herokuapp.com/api/reservations?id=" + current_id + "&date=" + startDate)
                .then(function(response) {
                    return response.data;
                });
        },

        getAdminSchedule: function(current_id, startDate) {
            return $http.get("http://glacial-meadow-15699.herokuapp.com/api/adminreservations?id=" + current_id + "&date=" + startDate)

            .then(function(response) {
                return response.data;
            });
        },

        getContent: function() {
            return $http.get("http://glacial-meadow-15699.herokuapp.com/api/pageContent") // PROD
                .then(function(response) {
                    if (typeof response.data === 'object') {
                        return response.data;
                    } else {
                        return $q.reject(response.data);
                    }

                }, function(response) {
                    return $q.reject(response.data);
                });
        },


        // these will work when more API routes are defined on the Node side of things
        // call to POST and create a new item
        create: function(itemData) {
            console.log('in create');
            var data = JSON.stringify({ name: itemData });
            return $http.post('/api/items', data);
        },

        reserve: function(reservationData) {
            console.log('in create reservation:');
            var data = JSON.stringify(reservationData);
            console.log(reservationData);
            return $http.post('/api/reserve', data)
                .then(function(data) {
                    return data;
                });
        },

        notify: function(data) {

            $http.post('/api/notify', JSON.stringify(data));
        },

        deleteReservation: function(id, reservation) {
            deleteReservation = reservation;
            console.log(' in service delete reservation');
            return $http.delete('/api/reservations/&id=' + id)
                .then(function(response) {
                    if (response.data === '/ DELETE OK') {
                        $http.post('/api/notifydelete', JSON.stringify(deleteReservation));
                    };
                });
        },

        // call to UPDATE an item
        update: function(id, data) {
            console.log(' in service update:');
            delete data['_id'];
            delete data['__v'];
            delete data['$$hashKey'];
            console.log(data);
            return $http({
                url: '/api/items/&id=' + id,
                method: "PUT",
                data: {
                    'data': data
                },
                headers: { 'Content-Type': 'application/json' }
            }).success(function(data, status, headers, config) {
                console.log(data);
            }).error(function(data, status, headers, config) {
                console.log('Update failed');
            });
        },

        // call to DELETE an item
        delete: function(id, email) {
            console.log(' in service delete');
            return $http.delete('/api/items/&id=' + id);
        },

        // call to email the manager of a gym
        emailMgr: function(id, email) {
            console.log(' in email mgr');
            $http.post('/api/emailmgr', JSON.stringify({ id: id, email: email }));
        }
    }

}]);