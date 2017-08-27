angular.module('jmt.routes', ['ui.router'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('starter', {
        url: '/starter',
        templateUrl: 'templates/starter.html',
      })

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppController'
      })

      .state('app.home', {
        url: '',
        views: {
          'menuContent': {
            templateUrl: 'templates/home.html',
            controller: 'HomeController'
          }
        }
      })

      .state('app.pincode', {
        url: '/pincode',
        views: {
          'menuContent': {
            templateUrl: 'templates/pincode.html'
          }
        }
      })

      .state('app.settings', {
        url: '/settings',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings.html'
          }
        }
      })

      .state('app.settings_notification', {
        url: '/settings_notification',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings.notification.html'
          }
        }
      })

      .state('app.profile', {
        url: '/profile',
        views: {
          'menuContent': {
            templateUrl: 'templates/profile.html'
          }
        }
      })
      .state('app.profile_edit', {
        url: '/edit',
        views: {
          'menuContent': {
            templateUrl: 'templates/profile.edit.html'
          }
        }
      })

      .state('app.change_password', {
        url: '/password',
        views: {
          'menuContent': {
            templateUrl: 'templates/password.change.html'
          }
        }
      })

      .state('app.forgot_password', {
        url: '/forgot_password',
        views: {
          'menuContent': {
            templateUrl: 'templates/password.forgot.html'
          }
        }
      })

      // .state('app.notification', {
      //   url: '/notification',
      //   views: {
      //     'mainContent': {
      //       templateUrl: 'templates/notification.setup.html',
      //       controller: 'NotificationController'
      //     }
      //   }
      // })

      .state('app.loan', {
        url: '/loan',
        abstract: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/primary.html'
          }
        }
      })

      .state('app.loan.list', {
        url: '',
        views: {
          'mainContent': {
            templateUrl: 'templates/loan.list.html'
          }
        }
      })

      .state('app.loan.overview', {
        url: '/overview',
        views: {
          'mainContent': {
            templateUrl: 'templates/loan.overview.html'
          }
        }
      })

      .state('app.loan.detail', {
        url: '/{loanId:int}',
        abstract: true,
        views: {
          'mainContent': {
            templateUrl: 'templates/loan.detail.html'
          }
        }
      })

      .state('app.loan.detail.main', {
        url: '',
        views: {
          'subContent': {
            templateUrl: 'templates/loan.main.html'
          }
        }
      })

      .state('app.loan.detail.payment_list', {
        url: '/payments',
        views: {
          'subContent': {
            templateUrl: 'templates/loan.payment.html'
          }
        }
      })

      .state('app.loan.detail.payment_view', {
        url: '/payment/{paymentId:int}',
        views: {
          'subContent': {
            templateUrl: 'templates/payment.detail.html'
          }
        }
      })

      .state('app.loan.detail.payment_create', {
        url: '/payment/create',
        views: {
          'subContent': {
            templateUrl: 'templates/payment.create.html'
          }
        }
      })

      .state('app.payment', {
        url: '/payment',
        abstract: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/primary.html'
          }
        }
      })

      .state('app.payment.list', {
        url: '',
        views: {
          'mainContent': {
            templateUrl: 'templates/payment.list.html'
          }
        }
      })
      .state('app.payment.detail', {
        url: '/{paymentId:int}',
        views: {
          'mainContent': {
            templateUrl: 'templates/payment.detail.html'
          }
        }
      })

      .state('app.promotion', {
        url: '/promotion',
        abstract: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/primary.html'
          }
        }
      })

      .state('app.promotion.detail', {
        url: '/{promotionId:int}',
        views: {
          'mainContent': {
            templateUrl: 'templates/promotion.detail.html'
          }
        }
      })

      .state('app.store', {
        url: '/store',
        abstract: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/primary.html'
          }
        },
        //onEnter: function($rootScope, Api, $q){
        //  console.info("onEnter app.store", $rootScope.profile);
        //  if (isEmpty($rootScope.storeList) && $rootScope.is_login) {
        //    Api.get('jmt/store').then(function (response) {
        //      if (response.success && response.list) {
        //        $rootScope.storeList = response.list;
        //        angular.forEach($rootScope.storeList, function (item, id) {
        //          $rootScope.storeList[id].distance = calculateDistance($rootScope.currentLocation, {
        //            latitude: item.geo_lat,
        //            longitude: item.geo_long
        //          });
        //        });
        //        return $rootScope.storeList;
        //      } else if (response.message) {
        //        $rootScope.storeList = [];
        //        return $q.reject(response.message);
        //      } else {
        //        $rootScope.storeList = [];
        //        return $q.reject("An error occur while processing your request.");
        //      }
        //    }, function (error) {
        //      console.warn("$http error", error);
        //      $rootScope.storeList = [];
        //    });
        //  }
        //}
      })

      .state('app.store.map', {
        url: '',
        views: {
          'mainContent': {
            templateUrl: 'templates/store.map.html'
          }
        }
      })
      .state('app.store.detail', {
        url: '/{storeId:int}',
        views: {
          'mainContent': {
            templateUrl: 'templates/store.detail.html'
          }
        },
        //resolve: {
        //  item: function($stateParams, $rootScope, Api, $q){
        //    //var deferred = $q.defer();
        //
        //    if (isEmpty($rootScope.storeList) && $rootScope.is_login) {
        //      return Api.get('jmt/store').then(function (response) {
        //        if (response.success && response.list) {
        //          $rootScope.storeList = response.list;
        //          angular.forEach($rootScope.storeList, function (item, id) {
        //            $rootScope.storeList[id].distance = calculateDistance($rootScope.currentLocation, {
        //              latitude: item.geo_lat,
        //              longitude: item.geo_long
        //            });
        //          });
        //
        //          return _.findWhere($rootScope.storeList, {"id": $stateParams.storeId});
        //          return $q.resolve(_.findWhere($rootScope.storeList, {"id": $stateParams.storeId}));
        //        } else {
        //          return null;
        //          $q.resolve(null);
        //        }
        //      }, function () {
        //        return null;
        //        $q.resolve(null);
        //      });
        //    }else{
        //      //console.info('_.findWhere($rootScope.storeList, {"id": $stateParams.storeId})',$stateParams.storeId, _.pluck($rootScope.storeList, 'id'),  _.findWhere($rootScope.storeList, {"id": $stateParams.storeId}));
        //      //return _.findWhere($rootScope.storeList, {"id": $stateParams.storeId});
        //      return $q.resolve(_.findWhere($rootScope.storeList, {"id": $stateParams.storeId}));
        //    }
        //
        //    //return deferred.promise;
        //  }
        //},
        //onEnter: function (item) {
        //  console.info("onEnter app.store.detail", item);
        //}
      })

      .state('app.application', {
        url: '/application',
        abstract: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/primary.html'
          }
        }
      })
      //
      // .state('app.application.list', {
      //   url: '',
      //   views: {
      //     'mainContent': {
      //       templateUrl: 'templates/application.list.html'
      //     }
      //   }
      // })
      .state('app.application.detail', {
        url: '/{applicationId:int}',
        views: {
          'mainContent': {
            templateUrl: 'templates/application.detail.html'
          }
        }
      })

      .state('app.application.create', {
        url: '/add',
        abstract: true,
        views: {
          'mainContent': {
            templateUrl: 'templates/secondary.html'
          }
        }
      })

      .state('app.application.create.step1', {
        url: '/step1',
        views: {
          'subContent': {
            templateUrl: 'templates/application.create.step1.html'
          }
        }
      })

      .state('app.application.create.step2', {
        url: '/step2',
        views: {
          'subContent': {
            templateUrl: 'templates/application.create.step2.html'
          }
        }
      })

      .state('app.application.create.step3', {
        url: '/step3',
        views: {
          'subContent': {
            templateUrl: 'templates/application.create.step3.html'
          }
        }
      })

      .state('app.application.create.step4', {
        url: '/step4',
        views: {
          'subContent': {
            templateUrl: 'templates/application.create.step4.html'
          }
        }
      })

      .state('app.application.create.step5', {
        url: '/step5',
        views: {
          'subContent': {
            templateUrl: 'templates/application.create.step5.html'
          }
        }
      })

      .state('app.application.create.step6', {
        url: '/step6',
        views: {
          'subContent': {
            templateUrl: 'templates/application.create.step6.html'
          }
        }
      })

      .state('app.application.create.export', {
        url: '/export',
        views: {
          'subContent': {
            templateUrl: 'templates/application.create.export.html'
          }
        }
      })

      .state('otp', {
        url: '/otp',
        abstract: true,
        templateUrl: 'templates/otp.html'
      })

      .state('otp.request', {
        url: '/request',
        views: {
          'mainContent': {
            templateUrl: 'templates/otp.request.html'
          }
        }
      })

      .state('otp.verify', {
        url: '/verify',
        views: {
          'mainContent': {
            templateUrl: 'templates/otp.verify.html'
          }
        }
      })

      .state('otp.password_setup', {
        url: '/pwd_setup',
        views: {
          'mainContent': {
            templateUrl: 'templates/password.setup.html'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/pincode');
  });
