'use strict';

const angular = require('angular');

export const ALICLOUD_SERVERGROUP_TRANSFORMER = 'spinnaker.alicloud.serverGroup.transformer';
angular.module(ALICLOUD_SERVERGROUP_TRANSFORMER, []).factory('alicloudServerGroupTransformer', function() {
  function normalizeServerGroup(serverGroup: any) {
    return serverGroup;
  }
  function parseCustomScriptsSettings(command: any, configuration: any) {
    /*
        At the first time this wizard pops up, the type of command.customScriptsSettings.fileUris is String. As for the following
        occurrences of its pop up with this field unchanged, its type becomes an array. So here differentiate the two scenarios
        to assign the correct value to model.
      */
    if (Array.isArray(command.customScriptsSettings.fileUris)) {
      configuration.customScriptsSettings.fileUris = command.customScriptsSettings.fileUris;
    } else {
      const fileUrisTemp: any = command.customScriptsSettings.fileUris;
      if (fileUrisTemp.includes(',')) {
        configuration.customScriptsSettings.fileUris = fileUrisTemp.split(',');
      } else if (fileUrisTemp.includes(';')) {
        configuration.customScriptsSettings.fileUris = fileUrisTemp.split(';');
      } else {
        configuration.customScriptsSettings.fileUris = [fileUrisTemp];
      }

      configuration.customScriptsSettings.fileUris.forEach(function(v: any, index: number) {
        configuration.customScriptsSettings.fileUris[index] = v.trim();
      });
    }
  }

  function convertServerGroupCommandToDeployConfiguration(command: any) {
    let tags: string = angular.toJson(command.scalingConfigurations.tags);
    if (Object.keys(command.scalingConfigurations.tags).length === 0) {
      tags = '';
    }
    const configuration: any = {
      interestingHealthProviderNames: ['Alibabacloud'],
      backingData: command.backingData,
      InstanceName: command.application,
      instancetype: command.instancetype,
      instancetypes: command.instancetypes,
      masterZoneId: command.masterZoneId,
      securityGroupId: command.securityGroupId,
      vSwitchId: command.vSwitchId,
      vSwitchName: command.vSwitchName,
      name: command.application,
      scalingGroupName: command.application,
      cloudProvider: command.selectedProvider,
      application: command.application,
      instanceTags: {},
      strategy: command.strategy,
      capacity: {
        min: command.minSize,
        max: command.maxSize,
        desired: command.minSize,
      },
      stack: command.stack,
      detail: command.freeFormDetails,
      freeFormDetails: command.freeFormDetails,
      maxSize: command.maxSize,
      minSize: command.minSize,
      defaultCooldown: command.defaultCooldown,
      loadBalancerIds: command.newloadBalancerIds,
      scalingPolicy: 'recycle',
      scalingConfigurations: [
        {
          imageId: command.scalingConfigurations.imageId,
          instanceType: command.scalingConfigurations.instanceType,
          instanceTypes: command.scalingConfigurations.instanceTypes,
          internetMaxBandwidthOut: command.scalingConfigurations.internetMaxBandwidthOut,
          ramRoleName: command.scalingConfigurations.ramRoleName || null,
          spotStrategy: command.scalingConfigurations.spotStrategy,
          multiAZPolicy: command.scalingConfigurations.multiAZPolicy,
          spotPriceLimit: command.scalingConfigurations.spotPriceLimit,
          systemDiskCategory: command.systemDiskCategory,
          systemDiskSize: command.systemDiskSize,
          tags: tags,
          spotPriceLimits: command.scalingConfigurations.spotPriceLimits || [],
          loadBalancerWeight: command.scalingConfigurations.loadBalancerWeight,
          password: command.scalingConfigurations.password,
          securityGroupId: command.scalingConfigurations.securityGroupId,
          internetChargeType: 'PayByTraffic',
          keyPairName: command.scalingConfigurations.keyPairName,
          dataDisks: [
            {
              category: command.systemDiskCategory,
              size: command.systemDiskSize,
            },
          ],
        },
      ],
      account: command.credentials,
      selectedProvider: 'alicloud',
      credentials: command.credentials,
      region: command.region,
      loadBalancerName: command.loadBalancerName,
      user: '[anonymous]',
      action: 'CreateScalingGroup',
      type: 'createServerGroup',
    };

    if (typeof command.stack !== 'undefined') {
      configuration.name = configuration.name + '-' + command.stack;
      configuration.scalingGroupName = configuration.scalingGroupName + '-' + command.stack;
    }
    if (typeof command.freeFormDetails !== 'undefined') {
      configuration.name = configuration.name + '-' + command.freeFormDetails;
      configuration.scalingGroupName = configuration.scalingGroupName + '-' + command.freeFormDetails;
    }

    // Default to an empty list of health provider names for now.
    configuration.interestingHealthProviderNames = [];
    return configuration;
  }

  return {
    convertServerGroupCommandToDeployConfiguration: convertServerGroupCommandToDeployConfiguration,
    normalizeServerGroup: normalizeServerGroup,
    parseCustomScriptsSettings: parseCustomScriptsSettings,
  };
});
