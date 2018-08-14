var app = angular
    .module('courttimes', ['ui.date', 'ngRoute'])
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
    .controller('MainController', function($scope, $sce, $route, $interval, $window, itemService) {
        $scope.posy = 250;
        $scope.gymCount = 0;
        $scope.total = 0;
        $scope.finalpayment = false;
        $scope.fields_valid = false;

        $scope.timeBlockNames = [
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


        $scope.gyminfo = {
            showingPopup: false,
            startDate: '',
            timeblocks: [
                { start: '8am', end: '9am', available: 'yes', selected: false },
                { start: '9am', end: '10am', available: 'yes', selected: false },
                { start: '10am', end: '11am', available: 'yes', selected: false },
                { start: '11am', end: '12pm', available: 'yes', selected: false },
                { start: '12pm', end: '1pm', available: 'yes', selected: false },
                { start: '1pm', end: '2pm', available: 'yes', selected: false },
                { start: '2pm', end: '3pm', available: 'yes', selected: false },
                { start: '3pm', end: '4pm', available: 'yes', selected: false },
                { start: '4pm', end: '5pm', available: 'yes', selected: false },
                { start: '5pm', end: '6pm', available: 'yes', selected: false },
                { start: '6pm', end: '7pm', available: 'yes', selected: false },
                { start: '7pm', end: '8pm', available: 'yes', selected: false }
            ]
        }
        $scope.reservationinfo = {
            showingPopup: false,
            name: '',
            teamName: '',
            email: '',
            phone: '',
            days: [] // array of objects, object is {date: '', time: ''}
        }
        $scope.posyReservation = 200
        $scope.showConfirmButtons = true
        $scope.reserveDate = '2014-09-23'
        $scope.dateOptions = {
            // options:  http://api.jqueryui.com/datepicker/#option-minDate
            minDate: 1,
            maxDate: "+4M",
            buttonImage: "datepicker.gif",
            showOn: "both"
        };
        var markers = [];

        var locations = [];

        $scope.getAll = function() {
            itemService.get()
                .then(function(data) {
                    if (data) {
                        locations = data;
                        $scope.gymCount = data.length;
                        console.log('data read:');
                        console.log(data);
                        $scope.showOnMap();
                    }
                });

            itemService.getContent()
                .then(function(datac) {
                    if (datac) {
                        $scope.sloganText = datac[0].sloganText;
                        $scope.leftLowerPanelContent = $sce.trustAsHtml(datac[0].leftLowerPanelContent);
                        $scope.footerContent = datac[0].footerContent;
                        console.log('content data read:');
                        console.log(datac);
                    }
                });


        }

        $scope.searchText = '';
        $scope.searchUpdated = function() {
            $scope.searchResults = [];
            $scope.mapping = [];
            angular.forEach(locations, function(val, idx) {
                if (val.name.toLowerCase().indexOf($scope.searchText.toLowerCase()) > -1 ||
                    val.city.toLowerCase().indexOf($scope.searchText.toLowerCase()) > -1) {
                    $scope.searchResults.push(val.name);
                    val.marker.setVisible(true);
                    $scope.mapping.push(idx);
                } else {
                    val.marker.setVisible(false);
                }
            });
            if ($scope.searchResults.length == $scope.gymCount) $scope.searchResults = [];
            //if ($scope.searchResults.length > 16) ; enable scroll bar
        }

        $scope.setCenter = function(index) {
            console.log(index);
            loc = $scope.mapping[index];
            console.log(locations[loc].name);
            locations[loc].marker.setAnimation(google.maps.Animation.BOUNCE);
            $scope.stopAnimation(locations[loc].marker);
            center = new google.maps.LatLng(locations[loc].lat, locations[loc].lng);
            map.setCenter(center);
        }

        $scope.stopAnimation = function(marker) {
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2000);
        }

        $scope.getAll(); // Show items when viewing first time


        var mapOptions = {
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            center: new google.maps.LatLng(33.484467, -111.97536),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('middle'),
            mapOptions);
        var bounds = new google.maps.LatLngBounds();

        $scope.showOnMap = function() {
            for (var i = 0; i < locations.length; i++) {
                var myLatlng = new google.maps.LatLng(locations[i].lat, locations[i].lng);
                bounds.extend(myLatlng);

                marker = createMarker(map, myLatlng, locations[i].name, i);
                markers.push(marker);

                map.fitBounds(bounds);
            };
        }

        function createMarker(map, myLatlng, name, i) {
            var signed = isNaN(parseFloat(locations[i].price)) ? false : true;
            var icon = signed ? 'Basketball Icon.png' : 'Blue Basketball Icon 2.png';
            var current = new google.maps.Marker({
                position: myLatlng,
                // Set icon based on gym status signed or not.
                icon: icon,
                map: map,
                title: locations[i].name,
                email: locations[i].email,
                pic: locations[i].pic,
                desc: locations[i].desc,
                address: locations[i].address,
                city: locations[i].city,
                zip: locations[i].zip,
                phone: locations[i].phone,
                price: locations[i].price,
                signedup: signed,
                lat: locations[i].lat,
                id: locations[i]._id,

                clickable: true
            });
            locations[i].marker = current;
            google.maps.event.addListener(current, 'click', function() {
                map.setCenter(current.getPosition());

                $scope.openGyminfoPopup(current);
                $scope.$apply(); // Necessary to get Angular to see the status change. 
            });
            return current;
        };

        $scope.selectClick = function(checked) {
            if (checked) {
                $scope.total += $scope.currentPrice;
            } else $scope.total -= $scope.currentPrice;
            $scope.checkFormFieldsValid();
        }

        $scope.closeReservationPopup = function() {
            $scope.reservationinfo.showingPopup = false;
        }

        $scope.closeGyminfoPopup = function() {
            $scope.gyminfo.showingPopup = false;
        }

        $scope.openGyminfoPopup = function(gym) {
            $scope.gyminfo.showingPopup = true;
            $scope.finalpayment = false;
            $scope.committed = false;
            $scope.fields_valid = false;
            $scope.showControls = true;
            $scope.gym = gym;
            $scope.current_id = gym.id;
            $scope.current_lat = gym.lat;
            $scope.gym.pic = gym.pic || 'images/basketball-court.jpg';
        }

        $scope.checkFormFieldsValid = function() {
            var slotSelected = false;
            angular.forEach($scope.gyminfo.timeblocks, function(slot) {
                if (slot.available == "yes" && slot.selected) slotSelected = true;
            });
            if ($scope.reservationinfo.name.length > 0 &&
                $scope.reservationinfo.email.length > 0 &&
                $scope.reservationinfo.phone.length > 0 &&
                $scope.reservationinfo.readTerms === true &&
                slotSelected === true)
                $scope.fields_valid = true;
            else $scope.fields_valid = false;

        }


        $scope.gyminfoConfirm = function(val, pricing) {
            $scope.mgrReservation = false;
            if (val) $scope.openReservationPopup(pricing);
            else $scope.closeGyminfoPopup()
        }

        $scope.reservationConfirm = function(val) {
            console.log($scope.gyminfo.startDate);
            console.log($scope.gyminfo.timeblocks);
            console.log($scope.total);
            console.log($scope.current_id);
            console.log($scope.current_lat);
            $scope.confs = [];
            $scope.committed = true;
            console.log($scope.reservationinfo.name);
            console.log($scope.reservationinfo.phone);
            console.log($scope.reservationinfo.teamName);

            $scope.mgrReservation = false;
            if ($scope.reservationinfo.name == 'mgr' &&
                $scope.reservationinfo.phone == $scope.current_lat &&
                $scope.reservationinfo.teamName == $scope.current_id) {
                console.log(" Gym mgr reservation  ");
                $scope.mgrReservation = true;
            }

            if (val) {
                var names = [];
                angular.forEach($scope.gyminfo.timeblocks, function(val, index) {
                    if (val.selected) {
                        names.push($scope.timeBlockNames[index]);
                        itemService.reserve({
                                date: $scope.gyminfo.startDate,
                                gym: $scope.current_id,
                                email: $scope.reservationinfo.email,
                                name: $scope.reservationinfo.name,
                                phone: $scope.reservationinfo.phone,
                                teamName: $scope.reservationinfo.teamName,
                                timeblock: index.toString()

                            })
                            .then(function(data) {
                                console.log('  Returned from reservation:');
                                console.log(data.data);
                                $scope.confs.push(data.data);
                            });
                    }
                });


                window.setTimeout(function() {
                    itemService.notify({
                        gym: $scope.gym.title,
                        gymemail: $scope.gym.email,
                        date: $scope.gyminfo.startDate,
                        total: $scope.total,
                        name: $scope.reservationinfo.name,
                        email: $scope.reservationinfo.email,
                        phone: $scope.reservationinfo.phone,
                        team: $scope.reservationinfo.teamName,
                        times: names,
                        confirmation: $scope.confs
                    });
                    if (!$scope.mgrReservation) {
                        console.log("*****  Show Final payment *****");
                        $scope.finalpayment = true; // This triggers the paypal popup.
                    } else {
                        $scope.showConfirmButtons = false;
                        $scope.finalfinal();
                    }
                    $scope.showConfirmButtons = false;
                }, 7000);

            } else $scope.finalfinal();
        }


        $scope.finalfinal = function($form) {
            $scope.closeReservationPopup();
            $scope.closeGyminfoPopup();
            $scope.finalpayment = false;
            if ($form.$valid) {
                $form.commit();
            }
        }

        $scope.openReservationPopup = function(pricing) {
            $scope.currentTimer = 120; // 120 seconds to do reservation.
            $scope.reservationinfo.readTerms = false;
            $scope.reservationinfo.showingPopup = true;
            $scope.currentPrice = pricing;
            $scope.total = 0;
            $scope.lockedOut = false;

            // Confirm that gym is not locked for another reservation.
            //  If not, set the lock which will auto-expire after 2 minutes
            //  and allow user to make a reservation.
            // If locked, just exit.
            // ItemService.getSchedule will first check for locked.      

            //  Clear all check boxes:
            console.log($scope.current_id);
            console.log($scope.gyminfo.startDate);
            itemService.getSchedule($scope.current_id, $scope.gyminfo.startDate)
                .then(function(data) {
                    if (data.locked === true) {
                        console.log('Reservations locked!');
                        $scope.lockedOut = true;
                        window.setTimeout(function() {
                            $scope.finalfinal();
                        }, 5000);

                        return;
                    }
                    console.log('Gym can take reservations');
                    angular.forEach($scope.gyminfo.timeblocks, function(slot) {
                        slot.selected = false;
                        slot.available = "yes";
                    });
                    angular.forEach(data, function(reservation) {
                        if (reservation.date && reservation.date.substr(0, 10) == $scope.gyminfo.startDate)
                            if (reservation.timeblock) $scope.gyminfo.timeblocks[parseInt(reservation.timeblock)].available = "no";
                    });

                });

            var timer = $interval(function() {
                console.log('o');
                $scope.currentTimer--;

                if ($scope.committed) {
                    $interval.cancel(timer);
                    return;
                }
                if ($scope.currentTimer == 0) {
                    $interval.cancel(timer);
                    $scope.finalfinal();
                }
            }, 1000);
            console.log('Opening reservation popup' + $scope.startDate);
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

.directive("ngFormCommit", [function() {
    return {
        require: "form",
        link: function($scope, $el, $attr, $form) {
            $form.commit = function() {
                $el[0].submit();
            };
        }
    };
}])

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