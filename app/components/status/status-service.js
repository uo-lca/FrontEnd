/**
 * Service to display status in all app views
 */
angular.module('lcaApp.status.service', ['angularSpinner', 'ui.bootstrap.alert'])
    .constant("SPINNER_KEY", "spinner-lca")
    .factory('StatusService', [ 'usSpinnerService', 'SPINNER_KEY', '$rootScope',
        function (usSpinnerService, SPINNER_KEY, $rootScope) {
            var svc = { };

            svc.startWaiting = function () {
                $rootScope.alert = null;
                usSpinnerService.spin(SPINNER_KEY);
            };

            svc.stopWaiting = function () {
                usSpinnerService.stop(SPINNER_KEY);
            };

            /**
             * Stop waiting and display error.
             * @param {string | {}} err     httpResponse for failed request or error message
             */
            svc.handleFailure = function (err) {
                var errMsg = "";
                svc.stopWaiting();
                if (typeof(err) === "string") {
                    errMsg = err;
                } else {
                    if (err.hasOwnProperty("status")) {
                        if (err["status"] == 409) {
                            errMsg = "Web API request conflicts with another request that is in progress.\n";
                        }
                    }
                    if (err.hasOwnProperty("data")) {
                        errMsg += err["data"]
                    }
                }
                $rootScope.alert = { type: "danger", msg: errMsg };
            };

            svc.handleSuccess = function (infoMsg) {
                    svc.stopWaiting();
                    $rootScope.alert = null;
                    if (infoMsg) {
                        $rootScope.alert = { type: "success", msg: infoMsg };
                    }
            };

            return svc;
    }]);