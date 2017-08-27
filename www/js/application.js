angular.module('jmt.application', [])
  .controller('ApplicationListController', function ($scope, moment, $state) {
    $scope.openApplicationDetail = function (id) {
      console.info(id);
      $state.go("app.application.detail", {applicationId: id});
    };
  })
  .controller('ApplicationDetailController', function ($scope, $rootScope, $stateParams) {
    $scope.applicationId = parseInt($stateParams.applicationId) || 1;
    $scope.item = {};

    if (!isEmpty($rootScope.applicationList)) {
      $scope.item = _.findWhere($rootScope.applicationList, {"id": $scope.applicationId});
    }

    $scope.getStatusIcon = function (status) {
      switch (status) {
        case 'waiting':
          return 'ion-android-time dark';
        case 'reviewing':
          return 'ion-more positive';
        case 'on_hold':
          return 'ion-minus-circled energized';
        case 'approved':
          return 'ion-checkmark-circled balanced';
        case 'rejected':
          return 'ion-close-circled assertive';
        default:
          return 'ion-help-circled dark';
      }
    };
  })
  .controller('ApplicationCreateStep1Controller', function ($scope, $rootScope, $state, $ionicPopup, Api, localStorageService, ApiConfig) {
    var date_selects = {};
    for (var i = 1; i <= 31; i++) {
      date_selects[(i - 1)] = {id: i, value: i};
    }
    $rootScope.date_selects = date_selects;

    $rootScope.month_selects = [
      {id: 1, value: 'มกราคม'},
      {id: 2, value: 'กุมภาพันธ์'},
      {id: 3, value: 'มีนาคม'},
      {id: 4, value: 'เมษายน'},
      {id: 5, value: 'พฤษภาคม'},
      {id: 6, value: 'มิถุนายน'},
      {id: 7, value: 'กรกฎาคม'},
      {id: 8, value: 'สิงหาคม'},
      {id: 9, value: 'กันยายน '},
      {id: 10, value: 'ตุลาคม'},
      {id: 11, value: 'พฤศจิกายน'},
      {id: 12, value: 'ธันวาคม'}
    ];

    var year_selects = {};
    $scope.today = new Date();
    var year_now = new Date().getFullYear();

    $scope.timeDiff = null;
    $scope.diffTime = function () {
        var a = moment(new Date());
        var b = moment($scope.application.bday_year + "-" + $scope.application.bday_month + "-" + $scope.application.bday_date);
        $scope.timeDiff = a.diff(b, 'years');
    };
      $scope.diffTime();

    var year_select_for_birth_date = [];
    for (var y1 = year_now; y1 > year_now-100; y1--) {
      year_select_for_birth_date.push({id: y1, value: (y1 + 543)});
    }
    $rootScope.year_select_for_birth_date = year_select_for_birth_date;

    var year_select_for_expired_date = [];
    for (var y2 = year_now; y2 < year_now+10; y2++) {
      year_select_for_expired_date.push({id: y2, value: (y2 + 543)});
    }
    $rootScope.year_select_for_expired_date = year_select_for_expired_date;

    //$rootScope.application = { //set data default
  //  prefix: 'mr',
  //    marital_status: 'single',
  //    contact_time_range: '08.00-12.00',
  //    document_address: '1',
  //    residence_type: 'house',
  //    bday_date: 1,
  //    bday_month: 1,
  //    bday_year: (year_now - 17),
  //    business_type: 'sole',
  //    work_type: 'law',
  //    id_no_array: [],
  //    id_card_no: "",
  //    address_postcode: {0: 0},
  //  office_address_postcode: {0: 0},
  //  loan_receive_bank_account_number: {0: 0},
  //  document_trans_location: 1
  //};

    $scope.next = function (event) {
      if($scope.formS1.$invalid){
        return false;
      }
       //console.log('application',$rootScope.application);
      //$state.go("app.application.create.step6");
      $rootScope.endpoint_code =localStorageService.get('endpoint_code');
      console.info("$rootScope.application", $rootScope.application);
      Api.post('jmt/doc_app', {
        endpoint_code: $rootScope.endpoint_code,
        application: $rootScope.application
      }, 'POST', null, "application/json").then(
        function (res) {
          if (res && res.success) {
            $state.go("app.application.create.step6");
          } else {
            var message_alert = '';
            if (res.error_message) {
              for (var key in res.error_message) {
                message_alert += res.error_message[key] + '<br>';
              }
            } else {
              message_alert = 'ไม่สามารถเชื่อมต่อเซิฟเวอร์ได้';
            }
            $ionicPopup.alert({
              title: 'ระบบขัดข้อง',
              template: message_alert
            });
            console.error(res);
          }
        },
        function (err) {
          console.error(err);
        }
      );
    };
  })
  .controller('ApplicationCreateStep2Controller', function ($scope, $rootScope, $state) {
    $scope.next = function () {
      console.log('application', $rootScope.application);
      $state.go("app.application.create.step3");
    };
  })
  .controller('ApplicationCreateStep3Controller', function ($scope, $rootScope, $state) {
    $scope.next = function () {
      console.log('application', $rootScope.application);
      $state.go("app.application.create.step4");
    };
  })
  .controller('ApplicationCreateStep4Controller', function ($scope, $rootScope, $state) {
    $scope.next = function () {
      console.log('application', $rootScope.application);
      $state.go("app.application.create.step5");
    };
  })
  .controller('ApplicationCreateStep5Controller', function ($scope, $rootScope, $state, Api, $ionicPopup, localStorageService) {
    $scope.next = function () {
      $rootScope.endpoint_code =localStorageService.get('endpoint_code');
      console.info("$rootScope.application", $rootScope.application);
      Api.post('jmt/doc_app', {
        endpoint_code: $rootScope.endpoint_code,
        application: $rootScope.application
      }, 'POST', null, "application/json").then(
        function (res) {
          if (res && res.success) {
            $state.go("app.application.create.step6");
          } else {
            var message_alert = '';
            if (res.error_message) {
              for (var key in res.error_message) {
                message_alert += res.error_message[key] + '<br>';
              }
            } else {
              message_alert = 'ไม่สามารถเชื่อมต่อเซิฟเวอร์ได้';
            }
            $ionicPopup.alert({
              title: 'ระบบขัดข้อง',
              template: message_alert
            });
            console.error(res);
          }
        },
        function (err) {
          console.error(err);
        }
      );
    };
  })
  .controller('ApplicationCreateStep6Controller', function ($scope, $rootScope, $state, localStorageService, $cordovaInAppBrowser, ApiConfig) {
    $scope.edit = function () {
      // $state.go("app.application.create.step5");
      $state.go("app.application.create.step1");
    };

    $scope.export = function () {
      console.log('$rootScope.application', $rootScope.application);

      if(!$rootScope.endpoint_code){
        $rootScope.endpoint_code = localStorageService.get('endpoint_code');
      }

      var options = {
        location: 'yes',
        clearcache: 'yes',
        toolbar: 'no'
      };
      var link = ApiConfig.api_endpoint + "pdf/" + $rootScope.endpoint_code;
      if (window.cordova) {
        document.addEventListener("deviceready", function () {
          $cordovaInAppBrowser.open(link, '_system', options)
            .then(function (event) {
              // success
              console.info("$cordovaInAppBrowser success");
            })
            .catch(function (event) {
              // error
              console.warn("$cordovaInAppBrowser error");
            });


          // $cordovaInAppBrowser.close();

        }, false);
      } else {
        window.open(link, '_system');
      }
    };
  })
  .controller('ApplicationCreateExportPdfController', function ($scope, $rootScope) {

  });
