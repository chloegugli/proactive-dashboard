/**
 * INSPINIA - Responsive Admin Theme
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written stat for all view in theme.
 *
 */
function config($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html",
            authenticate: false
        })
        .state('portal', {
            abstract: true,
            url: "/portal",
            templateUrl: "views/common/content.html",
            authenticate: true,
        })
        .state('portal.subview1', {
            url: "/service-automation",
            templateUrl: "views/cloud-automation/main.html",
            //controller is specified in html
            data: {pageTitle: 'Service Automation'},
            authenticate: true,
            css: 'styles/cloud-automation/portal_custom_style.css',
            onEnter : function (SchedulerService, PCACatalogService, PCAProcessService, PCARunningServicesService, PCANodeSourcesService){
                SchedulerService.refreshSchedulerService();
                PCACatalogService.refreshPCACatalogService();
                PCAProcessService.refreshPCAProcessService();
                PCARunningServicesService.refreshPCARunningServicesService();
                // Get existing Node Sources
                PCANodeSourcesService.getNodeSourceList();
            },
            onExit: function($rootScope){
                $rootScope.$broadcast('event:StopRefreshing');
            }
        })
        .state('portal.subview2', {
            url: "/workflow-automation",
            templateUrl: "views/cloud-automation/minor.html",
            data: {pageTitle: 'Workflow Automation'},
            authenticate: true,
            css: 'styles/cloud-automation/portal_custom_style.css',
            onEnter : function (APPSchedulerService, APPCatalog){
               APPSchedulerService.refreshAPPSchedulerService();
               APPCatalog.refreshAPPCatalog();

            },
            onExit: function($rootScope){
              $rootScope.$broadcast('event:StopRefreshing');
            }
        })
        .state('portal.subview3', {
            url: "/workflow-catalog",
            templateUrl: "views/workflow-catalog-portal/workflow_catalog.html",
            css: 'styles/workflow-catalog-portal/wcportal_custom_style.css',
            data: {pageTitle: 'Workflow Catalog'},
            authenticate: true,
            onEnter : function (WorkflowCatalogService){
                WorkflowCatalogService.startRegularWorkflowCatalogServiceQuery();
            },
            onExit: function($rootScope){
                $rootScope.$broadcast('event:StopRefreshing');
            }
        })
        .state('portal.subview4', {
            url: "/notification-portal",
            templateUrl: "views/notification-portal/minor.html",
            data: {pageTitle: 'Notification Portal'},
            authenticate: true
        });
}
angular
    .module('inspinia')
    .config(config)
    .run(function ($rootScope, $state, $interval) {
        $rootScope.$state = $state;
        $rootScope.$interval = $interval;
    });

angular
    .module('inspinia')
    .config(function ($httpProvider) {
        $httpProvider.defaults.headers.common = {};
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};
        $httpProvider.defaults.headers.get = {};
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    });

angular
    .module('inspinia')
    .run(function ($rootScope, $state, $http, $location) {
        $rootScope.$on('$locationChangeStart', function(event) {
            if (localStorage['pcaServiceUrl'] == undefined || angular.isObject(localStorage['schedulerRestUrl']) == false || localStorage['appCatalogWorkflowsUrl']  == undefined || localStorage['appCatalogBucketsUrl']  == undefined)
            {
            getProperties($http, $location);
            }
            var myDataPromise = isSessionValide($http, getSessionId());
            myDataPromise.then(function(result){

            if (!result){
              event.preventDefault();
              $rootScope.$broadcast('event:StopRefreshing');
              return $state.go('login');
            }
            });
            if ($state.current.name == ''){$state.go('portal.subview1');}

          })
    });