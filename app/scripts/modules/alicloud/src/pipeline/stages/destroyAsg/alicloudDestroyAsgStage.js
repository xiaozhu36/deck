'use strict';

const angular = require('angular');

import { AccountService, Registry, StageConstants } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.alicloud.pipeline.stage.destroyAsgStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'destroyServerGroup',
      cloudProvider: 'alicloud',
      templateUrl: require('./destroyAsgStage.html'),
      executionStepLabelUrl: require('./destroyAsgStepLabel.html'),
      accountExtractor: stage => [stage.context.credentials],
      configAccountExtractor: stage => [stage.credentials],
      validators: [
        {
          type: 'targetImpedance',
          message:
            'This pipeline will attempt to destroy a server group without deploying a new version into the same cluster.',
        },
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    });
  })
  .controller('alicloudDestroyAsgStageCtrl', [
    '$scope',
    function($scope) {
      var ctrl = this;

      let stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('alicloud').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      ctrl.accountUpdated = function() {
        AccountService.getAccountDetails(stage.credentials).then(function(details) {
          stage.regions = [details.org];
        });
      };

      $scope.targets = StageConstants.TARGET_LIST;

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'alicloud';

      stage.interestingHealthProviderNames = []; // bypass the check for now; will change this later to ['alicloudService']

      if (!stage.credentials && $scope.application.defaultCredentials.alicloud) {
        stage.credentials = $scope.application.defaultCredentials.alicloud;
      }

      if (stage.credentials) {
        ctrl.accountUpdated();
      }
      if (!stage.target) {
        stage.target = $scope.targets[0].val;
      }
    },
  ]);
