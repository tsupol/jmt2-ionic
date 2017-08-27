angular.module('jmt.settings', []).controller('SettingsController', function ($scope, $rootScope, $state, $ionicPopup, $ionicPlatform) {
  $scope.settingsList = {
    "General Settings": [
      {
        "title": "Show Current Time",
        "description": "App will show current time at bottom left of screen",
        "severity": "low",
        "value": false
      },
      {
        "title": "Setting B",
        "severity": "medium",
        "value": false
      },
      {
        "title": "Setting C",
        "severity": "high",
        "value": false
      }
    ],
    "Other": [
      {
        "title": "Setting X",
        "value": false
      },
      {
        "title": "Setting Y",
        "value": false
      },
      {
        "title": "Setting Z",
        "value": false
      }
    ]
  };

  $scope.appVersion = "0.0.0";
  $ionicPlatform.ready(function () {
    if(window.cordova){
      if(AppVersion){
        console.info("AppVersion.version", AppVersion.version);
        $scope.appVersion = AppVersion.version;
      }
    }
  });


  $scope.getToggleClass = function (item) {
    var toggleClass = "toggle-calm";

    switch (item.severity) {
      case 'low':
        return 'toggle-balanced';
      case 'medium':
        return 'toggle-energized';
      case 'high':
        return 'toggle-assertive';
      default:
        return toggleClass;
    }
  };

  $scope.logout = function ($event) {
    $ionicPopup.confirm({
      title: 'ยืนยัน',
      template: 'ท่านต้องการที่จะออกจากระบบ ใช่หรือไม่?'
    }).then(function (res) {
      if (res) {
        $event.preventDefault();
        $rootScope.endpoint_token = "";
        $rootScope.endpoint_id = 0;
        $rootScope.customer_id = 0;
        $scope.show_notification = false;
        $state.go("app.pincode");
      }
    });
  };
})

  .factory('Setting', function (Api) {
    return {
      notification: function (params) {
        return Api.post('jmt/setting/notification', params);
      }
    };
  })
  .controller('NotificationController', function ($scope, $rootScope, localStorageService, Setting) {
    //localStorageService.bind($rootScope, 'show_notification', true);
    //if ($rootScope.show_notification === undefined || $rootScope.show_notification === "undefined") {
    //  $rootScope.show_notification = false;
    //} else if ($rootScope.show_notification === "true") {
    //  $rootScope.show_notification = true;
    //} else if ($rootScope.show_notification === "false") {
    //  $rootScope.show_notification = false;
    //} else {
    //  $rootScope.show_notification = !!($rootScope.show_notification);
    //}
    $scope.show_notification = true;
    if ($rootScope.profile && $rootScope.profile.endpoint && $rootScope.profile.endpoint.enable) {
      $scope.show_notification = $rootScope.profile.endpoint.enable;
    }

    $scope.ChangeNotification = function () {
      Setting.notification({
        enable: $rootScope.profile.endpoint.enable,
        code: localStorageService.get('endpoint_code')
      });
    };

  });

