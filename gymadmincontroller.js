var app = angular
    .module('courttimesadmin', ['ui.date', 'ngRoute'])
    .directive('customDatepicker', function($compile) {
        return {
            replace: true,
            templateUrl: 'custom-datepicker.html',
            scope: {
                ngModel: '=',
                dateOptions: '='
            },
            link: function($scope, $element, $attrs, $controller) {
                var $button = $element.find('button');
                var $input = $element.find('input');
                $button.on('click', function() {
                    if ($input.is(':focus')) {
                        $input.trigger('blur');
                    } else {
                        $input.trigger('focus');
                    }
                });
            }
        };
    })
    .controller('GymAdminController', function($scope, $sce, $route, $location, $window, $timeout, itemService, userService) {
        $scope.gyminfo = {};
        $scope.reservations = [];
        $scope.agree = true;
        $scope.loading = false;
        $scope.gymKey = '';
        var timeBlockNames = [
            '8am to 9am',
            '9am to 10am',
            '10am to 11am',
            '11am to 12pm',
            '12pm to 1pm',
            '1pm to 2pm',
            '2pm to 3pm',
            '3pm to 4pm',
            '4pm to 5pm',
            '5pm to 6pm',
            '6pm to 7pm',
            '7pm to 8pm'
        ];


        var creationKey = $location.search()['id'];
        if (creationKey) {
            $scope.gymKey = creationKey;
        } else {
            $scope.gymKey = $window.localStorage.getItem('mal'); //userService.getGymKey();
        }
        console.log('Logged in key: ' + $scope.gymKey);

        function load(key, date) {
            itemService.getAdminSchedule(key, date)
                .then(function(data) {
                    var selectedReservations = [];
                    angular.forEach(data, function(reservation) {
                        console.log(reservation.date);
                        if (reservation.date && reservation.date.substr(0, 10) == $scope.saveDate) {
                            reservation.sortOrder = parseInt(reservation.timeblock);
                            reservation.timeblock = timeBlockNames[reservation.timeblock];
                            selectedReservations.push(reservation);
                        }
                    });
                    $scope.reservations = selectedReservations.sort(function(a, b) {
                        return a.sortOrder - b.sortOrder;
                    });
                });
        }

        $scope.logout = function() {
            var loc = $window.location.href.lastIndexOf('/');
            var newPath = $window.location.href.substr(0, loc) + '/login.html';
            $window.location.href = newPath;
        }

        $scope.createAccount = function() {
            if (!$scope.agree) { alert('You must agree to the terms before logging in.'); return; } // Must agree to terms before creating an account

            $scope.lengthError = false;
            $scope.duplicateError = false;
            $scope.userName =
                $scope.userPwd =
                $scope.userPwdConfirm = '';
            $('#myModal').foundation('reveal', 'open');
        }

        $scope.updateAccount = function() {
            if (!$scope.agree) { alert('You must agree to the terms before updating your account.'); return; } // Must agree to terms before creating an account

            $scope.lengthError = false;
            $scope.newPwd = $scope.newPwdConfirm = '';
            $scope.userName =
                $scope.userPwd =
                $scope.userPwdConfirm = '';
            $('#pwd-update-modal').foundation('reveal', 'open');
        }



        $scope.attemptlogin = function(userName, pwd) {
            if (!$scope.agree) { alert('You must agree to the terms before logging in.'); return; } // Must agree to terms before loggin in
            $scope.loading = true;
            console.log('logging in as: ' + userName);
            $scope.login = userName;
            userService.login(userName, pwd, function(response) {
                if (typeof response === 'string' && response == 'false') {
                    alert("Unable to login, check your user name and password again.");
                    $scope.loading = false;
                } else {
                    // login was successful, response from the service is the key for this user
                    userService.saveKey(response);
                    userService.saveLogin($scope.login);
                    $window.localStorage.setItem('mal', response);
                    var loc = $window.location.href.lastIndexOf('/');
                    var newPath = $window.location.href.substr(0, loc) + '/gym-admin.html';
                    $window.location.href = newPath;
                }
            });

        }


        $scope.submitKeyInfo = function() {
            console.log('Submit key info');
            $scope.gyminfo.key = $scope.gymKey;
            console.log($scope.gyminfo);
            $scope.saveDate = $scope.gyminfo.startDate;
            $scope.lastkey = $scope.gyminfo.key;
            $scope.lastdate = $scope.gyminfo.startDate;
            load($scope.gyminfo.key, $scope.gyminfo.startDate);
        };

        $scope.deleteReservation = function(index, deleteName, time, email) {
            $scope.deleteName = deleteName;
            $scope.deleteId = $scope.reservations[index]._id;
            $scope.deletingReservation = $scope.reservations[index];
            $scope.showDeleteConfirm = true;
            $scope.deleteTime = time;
            $scope.deleteEmail = email;
        };

        $scope.reservationCancelConfirm = function(proceed) {
            $scope.showDeleteConfirm = false;
            if (proceed) {
                console.log(' Yes indeed, do cancel.');
                $scope.reservations = [];
                itemService.deleteReservation($scope.deleteId, $scope.deletingReservation);
                $timeout(function() {
                    load($scope.lastkey, $scope.lastdate);
                }, 1500);

            }
        }


    });


/*global angular */
/*
 jQuery UI Datepicker plugin wrapper

 @note If ≤ IE8 make sure you have a polyfill for Date.toISOString()
 @param [ui-date] {object} Options to pass to $.fn.datepicker() merged onto uiDateConfig
 */

angular.module('ui.date', [])

.constant('uiDateConfig', {})

.directive('uiDate', ['uiDateConfig', '$timeout', function(uiDateConfig, $timeout) {
    'use strict';
    var options;
    options = {};
    angular.extend(options, uiDateConfig);
    return {
        require: '?ngModel',
        link: function(scope, element, attrs, controller) {
            var getOptions = function() {
                return angular.extend({}, uiDateConfig, scope.$eval(attrs.uiDate));
            };
            var initDateWidget = function() {
                var showing = false;
                var opts = getOptions();

                // If we have a controller (i.e. ngModelController) then wire it up
                if (controller) {

                    // Set the view value in a $apply block when users selects
                    // (calling directive user's function too if provided)
                    var _onSelect = opts.onSelect || angular.noop;
                    opts.onSelect = function(value, picker) {
                        scope.$apply(function() {
                            showing = true;
                            controller.$setViewValue(element.datepicker("getDate"));
                            _onSelect(value, picker);
                            element.blur();
                        });
                    };
                    opts.beforeShow = function() {
                        showing = true;
                    };
                    opts.onClose = function(value, picker) {
                        showing = false;
                    };
                    element.on('blur', function() {
                        if (!showing) {
                            scope.$apply(function() {
                                element.datepicker("setDate", element.datepicker("getDate"));
                                controller.$setViewValue(element.datepicker("getDate"));
                            });
                        }
                    });

                    // Update the date picker when the model changes
                    controller.$render = function() {
                        var date = controller.$viewValue;
                        if (angular.isDefined(date) && date !== null && !angular.isDate(date)) {
                            throw new Error('ng-Model value must be a Date object - currently it is a ' + typeof date + ' - use ui-date-format to convert it from a string');
                        }
                        element.datepicker("setDate", date);
                    };
                }
                // If we don't destroy the old one it doesn't update properly when the config changes
                element.datepicker('destroy');
                // Create the new datepicker widget
                element.datepicker(opts);
                if (controller) {
                    // Force a render to override whatever is in the input text box
                    controller.$render();
                }
            };
            // Watch for changes to the directives options
            scope.$watch(getOptions, initDateWidget, true);
        }
    };
}])

.constant('uiDateFormatConfig', '')

.directive('uiDateFormat', ['uiDateFormatConfig', function(uiDateFormatConfig) {
    var directive = {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var dateFormat = attrs.uiDateFormat || uiDateFormatConfig;
            if (dateFormat) {
                // Use the datepicker with the attribute value as the dateFormat string to convert to and from a string
                modelCtrl.$formatters.push(function(value) {
                    if (angular.isString(value)) {
                        return jQuery.datepicker.parseDate(dateFormat, value);
                    }
                    return null;
                });
                modelCtrl.$parsers.push(function(value) {
                    if (value) {
                        return jQuery.datepicker.formatDate(dateFormat, value);
                    }
                    return null;
                });
            } else {
                // Default to ISO formatting
                modelCtrl.$formatters.push(function(value) {
                    if (angular.isString(value)) {
                        return new Date(value);
                    }
                    return null;
                });
                modelCtrl.$parsers.push(function(value) {
                    if (value) {
                        return value.toISOString();
                    }
                    return null;
                });
            }
        }
    };
    return directive;
}]);