angular.module('jmt.store', [])
  .controller('StoreMapController', function ($scope, $rootScope, $state, $cordovaGeolocation, $filter, $timeout, $ionicPlatform, $ionicPopup, $ionicLoading, Api) {
    $scope.reloadStoreList = false;
    $scope.nearestDistance = 100000000;
    $scope.zoomLevel = 15;
    $scope.loadStoreList = function () {
      Api.get('jmt/store').then(function (response) {
        if (response.success && response.list) {
          $rootScope.storeList = response.list;
          angular.forEach($rootScope.storeList, function (item, id) {
            var distance = calculateDistance($rootScope.currentLocation, {
              latitude: item.geo_lat,
              longitude: item.geo_long
            });

            if (distance <= $scope.nearestDistance) {
              $scope.nearestDistance = distance;
            }

            if ($scope.nearestDistance >= 10000) {
              $scope.zoomLevel = 10;
            } else if ($scope.nearestDistance >= 5000) {
              $scope.zoomLevel = 11;
            } else if ($scope.nearestDistance >= 2000) {
              $scope.zoomLevel = 12;
            } else {
              $scope.zoomLevel = 13;
            }

            $rootScope.storeList[id].distance = distance;
          });
        } else if (response.message) {
          $rootScope.storeList = [];
          console.warn(response.message);
        } else {
          $rootScope.storeList = [];
          console.warn("An error occur while processing your request.");
        }
        $scope.reloadStoreList = false;
      }, function (error) {
        console.warn("$http error", error);
        $rootScope.storeList = [];
        $scope.reloadStoreList = true;
      });
    };

    $ionicPlatform.on('resume', function (event) {
      console.info("$ionicPlatform.on('resume')", event);
      if ($scope.reloadStoreList) {
        $scope.reloadStoreList = false;
        $rootScope.currentLocation = {
          latitude: 0,
          longitude: 0
        };
        if (cordova && cordova.plugins && cordova.plugins.diagnostic) {
          cordova.plugins.diagnostic.isLocationAvailable(function (available) {
            if (available) {
              console.info("$ionicPlatform.on('resume') >>> $scope.loadStoreList()");
              $cordovaGeolocation.getCurrentPosition({
                timeout: 3000,
                maximumAge: 30 * 60 * 1000,
                enableHighAccuracy: false
              }).then(function (res) {
                if (res && res.coords) {
                  $rootScope.currentLocation = {
                    latitude: res.coords.latitude,
                    longitude: res.coords.longitude,
                    altitude: res.coords.altitude,
                    accuracy: res.coords.accuracy,
                    altitudeAccuracy: res.coords.altitudeAccuracy,
                  };

                  $timeout(function () {
                    $scope.loadStoreList();
                  }, 100);
                } else {
                  $rootScope.currentLocation = {
                    latitude: 0,
                    longitude: 0
                  };
                  $rootScope.storeList = [];
                  $state.go("app.home");
                }
              }, function (err) {
                $rootScope.currentLocation = {
                  latitude: 0,
                  longitude: 0
                };
                $rootScope.storeList = [];
                $state.go("app.home");
              });
            } else {
              $rootScope.currentLocation = {
                latitude: 0,
                longitude: 0
              };
              $rootScope.storeList = [];
              $state.go("app.home");
            }
          });
        }
      }
    });

    $scope.$on('$stateChangeSuccess',
      function (event, toState, toParams, fromState, fromParams) {
        //console.info("StoreMapController.$on('$stateChangeSuccess')", '[' + fromState.name + '] ==> [' + toState.name + ']');
        if (!isEmpty(fromState.name) && $state.includes("app.store")) {
          //$ionicPlatform.ready(function () {
          //  var onSuccess = function (position) {
          //    console.info('===== onSuccess =====' + '\n' +
          //      'Latitude: ' + position.coords.latitude + '\n' +
          //      'Longitude: ' + position.coords.longitude + '\n' +
          //      'Altitude: ' + position.coords.altitude + '\n' +
          //      'Accuracy: ' + position.coords.accuracy + '\n' +
          //      'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
          //      'Heading: ' + position.coords.heading + '\n' +
          //      'Speed: ' + position.coords.speed + '\n' +
          //      'Timestamp: ' + position.timestamp + '\n');
          //
          //    if(position.coords.latitude===0 && position.coords.longitude===0){
          //      $rootScope.ShowLocationErrorPopup();
          //    }else{
          //      $rootScope.currentLocation = {
          //        latitude: position.coords.latitude,
          //        longitude: position.coords.longitude,
          //        altitude: position.coords.altitude,
          //        accuracy: position.coords.accuracy,
          //        altitudeAccuracy: position.coords.altitudeAccuracy,
          //      };
          //    }
          //  };
          //
          //  function onError(error) {
          //    console.warn('===== onError =====' + '\n' +
          //      'code: ' + error.code + '\n' +
          //      'message: ' + error.message + '\n');
          //
          //    $rootScope.ShowLocationErrorPopup();
          //  }
          //
          //  if (window.navigator && navigator.geolocation) {
          //    navigator.geolocation.getCurrentPosition(onSuccess, onError);
          //  }
          //});

          $ionicPlatform.ready(function () {
            if ($rootScope.locationPermissionStatus == "DENIED" || $rootScope.locationPermissionStatus == "DENIED_ALWAYS") {
              $ionicPlatform.ready(function () {
                $rootScope.checkLocationPermission().then(function () {
                  if (cordova && cordova.plugins && cordova.plugins.diagnostic) {
                    cordova.plugins.diagnostic.isLocationAvailable(function (available) {
                      console.log("Location is " + (available ? "available" : "not available"));
                      if (available) {
                        $rootScope.currentLocation = {
                          latitude: 0,
                          longitude: 0
                        };

                        $ionicLoading.show({
                          template: '<ion-spinner icon="lines" class="spinner-light"></ion-spinner>'
                        }).then(function () {
                          $cordovaGeolocation.getCurrentPosition({
                            timeout: 3000,
                            maximumAge: 30 * 60 * 1000,
                            enableHighAccuracy: false
                          }).then(function (res) {
                            $ionicLoading.hide();
                            console.info("$cordovaGeolocation.getCurrentPosition() res", res);
                            if (res && res.coords) {
                              $scope.reloadStoreList = true;
                              $rootScope.currentLocation = {
                                latitude: res.coords.latitude,
                                longitude: res.coords.longitude,
                                altitude: res.coords.altitude,
                                accuracy: res.coords.accuracy,
                                altitudeAccuracy: res.coords.altitudeAccuracy,
                              };
                              $scope.loadStoreList();
                            } else {
                              $rootScope.currentLocation = {
                                latitude: 0,
                                longitude: 0
                              };
                            }
                          }, function (err) {
                            $ionicLoading.hide();
                            console.warn("$cordovaGeolocation.getCurrentPosition() err", err);
                            $rootScope.currentLocation = {
                              latitude: 0,
                              longitude: 0
                            };
                            $rootScope.ShowLocationErrorPopup($scope);
                            $scope.reloadStoreList = true;
                          });
                        });
                      } else {
                        $rootScope.ShowLocationErrorPopup($scope);
                      }
                    }, function (error) {
                      console.error("The following error occurred: " + error);
                      $rootScope.currentLocation = {
                        latitude: 0,
                        longitude: 0
                      };
                      $rootScope.ShowLocationErrorPopup($scope);
                      $scope.reloadStoreList = true;
                    });
                  }
                }, function () {
                  $ionicPopup.alert({
                    title: "เกิดข้อผิดพลาด",
                    template: "แอปไม่สามารถเข้าถึงการใช้งาน Location ได้"
                  }).then(function () {
                    $state.go("app.home");
                  });
                });
              });
            } else {
              if (window.cordova && cordova.plugins && cordova.plugins.diagnostic) {
                cordova.plugins.diagnostic.isLocationAvailable(function (available) {
                  console.log("Location is " + (available ? "available" : "not available"));
                  if (available) {
                    $rootScope.currentLocation = {
                      latitude: 0,
                      longitude: 0
                    };

                    $ionicLoading.show({
                      template: '<ion-spinner icon="lines" class="spinner-light"></ion-spinner>'
                    }).then(function () {
                      $cordovaGeolocation.getCurrentPosition({
                        timeout: 3000,
                        maximumAge: 30 * 60 * 1000,
                        enableHighAccuracy: false
                      }).then(function (res) {
                        $ionicLoading.hide();
                        console.info("$cordovaGeolocation.getCurrentPosition() res", res);
                        if (res && res.coords) {
                          $scope.reloadStoreList = true;
                          $rootScope.currentLocation = {
                            latitude: res.coords.latitude,
                            longitude: res.coords.longitude,
                            altitude: res.coords.altitude,
                            accuracy: res.coords.accuracy,
                            altitudeAccuracy: res.coords.altitudeAccuracy,
                          };
                          $scope.loadStoreList();
                        } else {
                          $rootScope.currentLocation = {
                            latitude: 0,
                            longitude: 0
                          };
                        }
                      }, function (err) {
                        $ionicLoading.hide();
                        console.warn("$cordovaGeolocation.getCurrentPosition() err", err);
                        $rootScope.currentLocation = {
                          latitude: 0,
                          longitude: 0
                        };
                        $rootScope.ShowLocationErrorPopup($scope);
                        $scope.reloadStoreList = true;
                      });
                    });
                  } else {
                    $rootScope.ShowLocationErrorPopup($scope);
                  }
                }, function (error) {
                  console.error("The following error occurred: " + error);
                  $rootScope.currentLocation = {
                    latitude: 0,
                    longitude: 0
                  };
                  $rootScope.ShowLocationErrorPopup($scope);
                  $scope.reloadStoreList = true;
                });
              } else {
                $ionicLoading.show({
                  template: '<ion-spinner icon="lines" class="spinner-light"></ion-spinner>'
                }).then(function () {
                  $cordovaGeolocation.getCurrentPosition({
                    timeout: 3000,
                    maximumAge: 30 * 60 * 1000,
                    enableHighAccuracy: false
                  }).then(function (res) {
                    $ionicLoading.hide();
                    //console.info("$cordovaGeolocation.getCurrentPosition() res", res);
                    if (res && res.coords) {
                      $scope.reloadStoreList = true;
                      $rootScope.currentLocation = {
                        latitude: res.coords.latitude,
                        longitude: res.coords.longitude,
                        altitude: res.coords.altitude,
                        accuracy: res.coords.accuracy,
                        altitudeAccuracy: res.coords.altitudeAccuracy,
                      };
                      $scope.loadStoreList();
                    } else {
                      $rootScope.currentLocation = {
                        latitude: 0,
                        longitude: 0
                      };
                    }
                  }, function (err) {
                    $ionicLoading.hide();
                    console.warn("$cordovaGeolocation.getCurrentPosition() err", err);
                    $rootScope.currentLocation = {
                      latitude: 0,
                      longitude: 0
                    };
                    $scope.reloadStoreList = true;
                    $ionicPopup.alert({
                      title: "เกิดข้อผิดพลาด",
                      template: "แอปไม่สามารถเข้าถึงการใช้งาน Location ได้"
                    }).then(function () {
                      $state.go("app.home");
                    });
                  });
                });
              }
            }
          });

          if (isEmpty($rootScope.storeList) && $scope.reloadStoreList) {
            console.info("$rootScope.currentLocation", $rootScope.currentLocation);
            $scope.loadStoreList();
          }
        }
      }
    );

    $scope.$on("$ionicView.enter", function (event, data) {
      // handle event
      console.log("State Params: ", data.stateParams);
    });

    $scope.openStoreDetail = function (id) {
      $state.go("app.store.detail", {storeId: id});
    };

    $scope.calculateDistance = function (item) {
      if (!$rootScope.currentLocation) {
        return '-';
      }
      var distance = calculateDistance($rootScope.currentLocation, {
        latitude: item.geo_lat,
        longitude: item.geo_long
      });
      if (typeof distance !== "number") {
        return "N/A";
      }

      if (distance >= 99 * 1000) {
        return ">99";
      }

      return $filter('number')(distance / 1000, 1);
    };

    $scope.showDistance = function (distanceInMeter) {
      if (typeof distanceInMeter !== "number") {
        return "N/A";
      }

      if (distanceInMeter >= 99 * 1000) {
        return ">99";
      }

      return $filter('number')(distanceInMeter / 1000, 1);
    };
  })
  .controller('StoreDetailController', function ($scope, $rootScope, $stateParams, $filter) {
    $scope.storeId = parseInt($stateParams.storeId) || 1;
    $scope.item = {};
    $scope.zoomLevel = 15;

    $scope.$on('$stateChangeSuccess',
      function (event, toState, toParams, fromState, fromParams) {
        //console.info("StoreDetailController.$on('$stateChangeSuccess')", '[' + fromState.name + '] ==> [' + toState.name + ']');
        $scope.storeId = parseInt($stateParams.storeId) || 1;
        if (toState.name == "app.store.detail") {
          if (!isEmpty($rootScope.storeList)) {
            $scope.item = _.findWhere($rootScope.storeList, {"id": $scope.storeId});

            if ($scope.item) {
              if ($scope.item.distance >= 10000) {
                $scope.zoomLevel = 10;
              } else if ($scope.item.distance >= 5000) {
                $scope.zoomLevel = 11;
              } else if ($scope.item.distance >= 2000) {
                $scope.zoomLevel = 12;
              } else {
                $scope.zoomLevel = 13;
              }
            }
          }
        }
      });

    $scope.calculateDistance = function (item) {
      if (!$rootScope.currentLocation) {
        return '-';
      }
      var distance = calculateDistance($rootScope.currentLocation, {
        latitude: item.geo_lat,
        longitude: item.geo_long
      });
      if (typeof distance !== "number") {
        return "N/A";
      }

      if (distance >= 99 * 1000) {
        return ">99";
      }

      return $filter('number')(distance / 1000, 1);
    };

    $scope.showDistance = function (distanceInMeter) {
      if (typeof distanceInMeter !== "number") {
        return "N/A";
      }

      if (distanceInMeter >= 99 * 1000) {
        return ">99";
      }

      return $filter('number')(distanceInMeter / 1000, 1);
    };
  });
