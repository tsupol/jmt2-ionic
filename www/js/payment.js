angular.module('jmt.payment', [])
  .controller('PaymentListController', function ($scope, $rootScope) {

    $scope.displayAmount = function (num) {
      try {
        var parts = num.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (parts.length == 1) {
          return parts.join(".")+'.00';
        }

        return parts.join(".");
      } catch (e) {
        return 0.00;
      }
    }

    $scope.toggleGroup = function(obj) {
      obj.show = !obj.show;
    };
    $scope.isGroupShown = function(obj) {
      return obj.show;
    };
  })
  .controller('PaymentDetailController', function ($scope, $rootScope, $state, $stateParams) {
    $scope.paymentId = parseInt($stateParams.paymentId);
    $scope.item = {};

    if($state.includes('app.loan')){
      $scope.loanId = parseInt($stateParams.loanId);

      if(!isEmpty($rootScope.profile.loans)){
        var loan = _.findWhere($rootScope.profile.loans, {"id": $scope.loanId});
        console.info("loan", loan);
        if(!isEmpty(loan)){
          console.info("loan.payment_list", loan.payment_list);
          $scope.item = _.findWhere(loan.payment_list, {"id": $scope.paymentId});
          console.info("$scope.item", $scope.item);
        }
      }
    }else if($state.includes('app.payment')){
      $scope.item = _.findWhere($rootScope.paymentList, {"id": $scope.paymentId});
    }
  })
  .controller('PaymentCreateController', function ($scope, moment) {
    $scope.payment_type = "MOBILE_APP";
    $scope.maxLength = 255;

    $scope.createPaymentNote = function () {

    };
  })
