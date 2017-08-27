angular.module('jmt.api', ['jmt.config'])
	.service("Api", function ($http, $rootScope, ApiConfig, $ionicLoading, $ionicPopup, $q) {
		var CallAPI = function (method, url, data, bypass_token , content_type) {
      var defer = $q.defer();

			if (!bypass_token) {
				bypass_token = false;
			}

      var headerOptions = {};
      if(content_type) {
        headerOptions = {
          'Content-Type': content_type
        };
      }else{
        headerOptions = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };
      }

			if (!bypass_token) {
				headerOptions['X-JMT-EndPoint-Id'] = $rootScope.endpoint_id || '';
				headerOptions['X-JMT-EndPoint-Token'] = $rootScope.endpoint_token || '';
			}

			var httpObj = {
        method: method,
        url: ApiConfig.api_endpoint + url,
        headers: headerOptions
      };
			if(typeof data != 'undefined'){
        data._method = method;
        if(content_type) {
          httpObj['data'] = data;
        }else{
          httpObj['data'] = $.param(data);
        }
      }

      $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="spinner-light"></ion-spinner>',
        duration: 15 * 1000
      }).then(function(){
        $http(httpObj).then(function (response) {
          $ionicLoading.hide();
          if(response && response.data){
            defer.resolve(response.data);
          }else{
            defer.resolve(response);
          }
        }, function(error){
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'JFintech',
            template: 'เกิดข้อผิดพลาดระหว่างการส่งข้อมูลไปยังเซิฟเวอร์ กรุณาติดต่อ admin@jfintech.co.th code: <pre style="width: 1000px; overflow: scroll;">'+ JSON.stringify(error) + '</pre>'
          });
          defer.reject(error);
        }, function(httpError){
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'JFintech',
            template: 'เกิดข้อผิดพลาดระหว่างการส่งข้อมูลไปยังเซิฟเวอร์ กรุณาติดต่อ admin@jfintech.co.th code: <pre style="width: 1000px; overflow: scroll;">'+ JSON.stringify(httpError) + '</pre>'
          });
          defer.reject(httpError);
        });
      });

			return defer.promise;
		};

		return {
			convertDateTime: function (datetime) {
				return moment(datetime, "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm:00");
			},
			list: function (url, tableParams) {
				var headerOptions = generateHeader(bypass_token);
				if (typeof tableParams === 'undefined' || tableParams == null) {
					return CallAPI('GET', url);
				}

				if (!tableParams.url) {
					return CallAPI('GET', url + "?" + $.param(tableParams))
				}

				return CallAPI('GET', url + "?" + $.param(tableParams.url()))
			},
			get: function (url) {
				return CallAPI('GET', url)
			},
			delete: function (url) {
				return CallAPI('DELETE', url)
			},
			post: function (url, data, method, bypass_token ,content_type) {
				return CallAPI('POST', url, data, bypass_token ,content_type)
			}
		}
	})
