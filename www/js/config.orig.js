angular.module("jmt.config", [])
.constant("AppEnv", "production")
.constant("AppDebug", false)
.constant("ApiConfig", {"api_endpoint":"https://jmt-loan-api.jfintech.co.th/api/","backup":"https://jmt-loan-api-uat.play2pay.me/api/"});
