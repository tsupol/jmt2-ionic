angular.module('jmt.services', [])
  .service("Modal", function ($uibModal, ApiConfig) {
    var html_prefix = ApiConfig.html_prefix;

    var openModal = function (obj) {
      return $uibModal.open(obj).result;
    };

    this.confirm = function (obj) {
      var message = '';
      if (obj && obj.message) {
        message = obj.message;
      }

      var title = 'Please confirm.';
      if (obj && obj.title) {
        title = obj.title;
      }

      var size = 'md';
      if (obj && obj.size){
        size = obj.size;
      }

      var settings = {
        animation: true,
        templateUrl: '/modules/_base/modal.confirm.html',
        controller: 'ConfirmModalController',
        size: size,
        backdrop: 'static',
        resolve : {
          message: function () {
            return message;
          },
          title: function () {
            return title;
          }
        }
      };

      return openModal(settings);
    }
  })
  .controller("ConfirmModalController", function ($scope, $uibModalInstance, message, title) {

    $scope.message = message;
    $scope.title = title;

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.confirm = function () {
      $uibModalInstance.close("confirm");
    }
  })
