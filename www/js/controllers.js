angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('ParkCtrl', function ($scope) {

    var currentLat = -36.8435957;
    var currentLng = 174.7647295;

    var destinationLat;
    var destinationLng;

    var navigateFrom = [];
    var navigateTo = [];

    navigator.geolocation.getCurrentPosition(function (currentLocation) {
        currentLat = currentLocation.coords.latitude;
        currentLng = currentLocation.coords.longitude;

        destinationLat = $("#parking-details").data("lat");
        destinationLng = $("#parking-details").data("lng");

        navigateFrom.push(currentLat);
        navigateFrom.push(currentLng);

        navigateTo.push(destinationLat);
        navigateTo.push(destinationLng);

        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;

        var position = new google.maps.LatLng(-36.8435957, 174.7647295);
        var mapOptions = {
            center: position,
            zoom: 13
        };

        var map = new google.maps.Map(document.getElementById("parkSearchMap"),
            mapOptions);

        window.ParkingMap = map;

        directionsDisplay.setMap(map);



        directionsService.route({
            origin: new google.maps.LatLng(currentLat, currentLng),
            destination: new google.maps.LatLng(destinationLat, destinationLng),
            travelMode: google.maps.TravelMode.DRIVING
        }, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    });

    $("#btnConfirmNavigate").click(function () {

        //enable background service
        cordova.plugins.backgroundMode.enable();
        window.isParking = true;
        window.ParkingStart = new Date();

        var position = new google.maps.LatLng(-36.8435957, 174.7647295);
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var destinationLat = $("#parking-details").data("lat");
        var destinationLng = $("#parking-details").data("lng");

        window.ParkingWatch = setInterval(function () {
            navigator.geolocation.getCurrentPosition(function (currentLocation) {
                currentLat = currentLocation.coords.latitude;
                currentLng = currentLocation.coords.longitude;
                directionsDisplay.setMap(window.ParkingMap);

                directionsService.route({
                    origin: new google.maps.LatLng(currentLat, currentLng),
                    destination: new google.maps.LatLng(destinationLat, destinationLng),
                    travelMode: google.maps.TravelMode.DRIVING
                }, function (response, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        //directionsDisplay.setDirections(response);
                        var distanceInMeters = response.routes[0].legs[0].distance.value;
                        var speed = currentLocation.coords.speed;
                        if (!window.Parked && distanceInMeters < 150) {
                            cordova.plugins.notification.local.schedule({
                                id: 1,
                                title: 'Congratulations! You found the it!',
                                text: 'Parking meter started.',
                                sound: null,
                                every: 'minute',
                                autoClear: false,
                                at: new Date(new Date().getTime() + 5 * 1000)
                            });
                            $("#parking-message").html("Parking session started.");
                        }
                        if (window.Parked && distanceInMeters > 250 && speed > 11) {
                            clearInterval(window.ParkingWatch);
                            cordova.plugins.backgroundMode.disable();
                            cordova.plugins.notification.local.schedule({
                                id: 2,
                                title: 'I see you left the parking',
                                text: 'Parking meter ended. Thank you.',
                                sound: null,
                                every: 'minute',
                                autoClear: false,
                                at: new Date(new Date().getTime() + 5 * 1000)
                            });
                            $("#parking-message").html("Parking session ended.");                            
                        }
                    } else {
                        window.alert('Directions request failed due to ' + status);
                    }
                });             

            });
        }, 5000);

        //var count = 0;
        //window.parkingTimer = $.timer(function () {
        //    $('#counter').html(++count);
        //});
        //window.parkingTimer.set({ time: 1000, autostart: true })

        //Launch device navigatoe
        launchnavigator.navigate(
          navigateFrom,
          navigateTo,
          function () {
              //alert("Plugin success");
          },
          function (error) {
              alert("Plugin error: " + error);
          });
    });
})

.controller('ParkingCtrl', function ($scope) {

})

.controller('HomeCtrl', function ($scope) {

    var currentLat = -36.8435957;
    var currentLng = 174.7647295;

    navigator.geolocation.getCurrentPosition(function (currentLocation) {
        currentLat = currentLocation.coords.latitude;
        currentLng = currentLocation.coords.longitude;

        var position = new google.maps.LatLng(currentLat, currentLng);
        var mapOptions = {
            //center: { lat: $(item).data("lat"), lng: $(item).data("long") },
            center: position,
            zoom: 12
        };
        var map = new google.maps.Map(document.getElementById("homeSearchMap"),
            mapOptions);

  
        // workaround ionic not able to tap into auto complete
        $scope.disableTap = function(){
            container = document.getElementsByClassName('pac-container');
            // disable ionic data tab
            angular.element(container).attr('data-tap-disabled', 'true');
            // leave input field if google-address-entry is selected
            angular.element(container).on("click", function(){
                document.getElementById('txtSearch').blur();
            });
        };

        //Autocomplete
        var input = (document.getElementById('txtSearch'));
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        autocomplete.addListener('place_changed', function () {
            var place = autocomplete.getPlace();
            var searchLat = place.geometry.location.lat();
            var searchLng = place.geometry.location.lng();
            map.setCenter(new google.maps.LatLng(searchLat, searchLng));
        });


        window.CurrentLocationMarker = new google.maps.Marker({
            position: new google.maps.LatLng(currentLat, currentLng),
            icon: 'img/car.png',
            map: map
        });

        window.ParkingWatchCurrentPosition = setInterval(function () {
            navigator.geolocation.getCurrentPosition(function (cLocation) {
                var cLat = cLocation.coords.latitude;
                var cLng = cLocation.coords.longitude;
                var clatlng = new google.maps.LatLng(cLat, cLng);
                window.CurrentLocationMarker.setPosition(clatlng);
            });
        }, 3000);

        var parkings = [
            { lat: -36.8435957, lng: 174.7647295, Price: "1" },
            { lat: -36.8843628, lng: 174.7262833, Price: "2" },
            { lat: -36.8438733, lng: 174.7608271, Price: "3" },
            { lat: -36.906428, lng: 174.9265463, Price: "3" },
            { lat: -36.8556001, lng: 174.824247, Price: "3" },
        ];



        var markers = [];
        $.each(parkings, function (index, item) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(item.lat, item.lng),
                //label: item.Price,
                map: map,
                title: item.Price
            });
            markers.push(marker);

            marker.addListener('click', function () {
                $(".map-canvas").css("height", "200px");
                $("#parking-desc").html("<p><b>$2/hr</b></p>");
                $("#parking-details").slideDown("slow");

                $("#parking-details").data("lat", this.position.lat());
                $("#parking-details").data("lng", this.position.lng());

                $.each(markers, function (mIndex, mItem) {
                    mItem.setIcon("");
                });
                marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');

                $("#btnMapCollapse").slideDown("slow");
                var directionsService = new google.maps.DirectionsService;

                directionsService.route({
                    origin: new google.maps.LatLng(currentLat, currentLng),
                    destination: new google.maps.LatLng(this.position.lat(), this.position.lng()),
                    travelMode: google.maps.TravelMode.DRIVING
                }, function (response, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        //directionsDisplay.setDirections(response);
                        $("#parking-distance").html("<p>" + response.routes[0].legs[0].distance.text + " from your current location.</p>");
                    } else {
                        window.alert('Directions request failed due to ' + status);
                    }
                });
            });
        }); // each

    });

    $("#btnMapCollapse").click(function () {
        if ($("#btnMapCollapse").hasClass("ion-chevron-down")) {
            $("#parking-details").slideUp("slow");
            $(".map-canvas").css("height", "300px");
            $("#btnMapCollapse").slideUp("slow");
        }
    });

    $("#btnPark").click(function () {
        document.location.href = "#/app/park";
    });
})


.controller('PlaylistCtrl', function($scope, $stateParams) {
});
