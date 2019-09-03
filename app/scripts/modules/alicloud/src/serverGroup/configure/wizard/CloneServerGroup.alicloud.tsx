import * as React from 'react';
import { get } from 'lodash';
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'

import {
  Application,
  FirewallLabels,
  IModalComponentProps,
  IStage,
  ReactInjector,
  ReactModal,
  TaskMonitor,
  WizardModal,
  API,
  WizardPage,
  noop,
} from '@spinnaker/core';

import { alicloudServerGroupConfigurationService } from '../serverGroupConfiguration.service';

export class CloneServerGroupAlicloud extends React.Component<> {
  // public static defaultProps: Partial<IAmazonCloneServerGroupModalProps> = {
  //   closeModal: noop,
  //   dismissModal: noop,
  // };
  //
  // private _isUnmounted = false;
  // private refreshUnsubscribe: () => void;
  //
  public static show(props: any) {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(CloneServerGroupAlicloud, props, modalProps);
  }
  //
  constructor(props: any) {
    super(props);

    const requiresTemplateSelection = get(props, 'command.viewState.requiresTemplateSelection', false);
    if (!requiresTemplateSelection) {
      this.configureCommand();
    }

    this.state = {
      firewallsLabel: FirewallLabels.get('Firewalls'),
      loaded: false,
      requiresTemplateSelection,
      taskMonitor: new TaskMonitor({
        application: props.application,
        title: 'Creating your server group',
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
        onTaskComplete: this.onTaskComplete,
      }),
    };
  }

  private templateSelected = () => {
    this.setState({ requiresTemplateSelection: false });
    this.configureCommand();
  };

  private onTaskComplete = () => {
    this.props.application.serverGroups.refresh();
    this.props.application.serverGroups.onNextRefresh(null, this.onApplicationRefresh);
  };

  // protected onApplicationRefresh = (): void => {
  //   if (this._isUnmounted) {
  //     return;
  //   }
  //
  //   const { command } = this.props;
  //   const { taskMonitor } = this.state;
  //   const cloneStage = taskMonitor.task.execution.stages.find((stage: IStage) => stage.type === 'cloneServerGroup');
  //   if (cloneStage && cloneStage.context['deploy.server.groups']) {
  //     const newServerGroupName = cloneStage.context['deploy.server.groups'][command.region];
  //     if (newServerGroupName) {
  //       const newStateParams = {
  //         serverGroup: newServerGroupName,
  //         accountId: command.credentials,
  //         region: command.region,
  //         provider: 'alicloud',
  //       };
  //       let transitionTo = '^.^.^.clusters.serverGroup';
  //       if (ReactInjector.$state.includes('**.clusters.serverGroup')) {
  //         // clone via details, all view
  //         transitionTo = '^.serverGroup';
  //       }
  //       if (ReactInjector.$state.includes('**.clusters.cluster.serverGroup')) {
  //         // clone or create with details open
  //         transitionTo = '^.^.serverGroup';
  //       }
  //       if (ReactInjector.$state.includes('**.clusters')) {
  //         // create new, no details open
  //         transitionTo = '.serverGroup';
  //       }
  //       ReactInjector.$state.go(transitionTo, newStateParams);
  //     }
  //   }
  // };
  //
  // private initializeCommand = () => {
  //   const { command } = this.props;
  //
  //   command.credentialsChanged(command);
  //   command.regionChanged(command);
  //   AwsReactInjector.awsServerGroupConfigurationService.configureSubnetPurposes(command);
  // };
  //
  // private configureCommand = () => {
  //   const { application, command } = this.props;
  //   AwsReactInjector.awsServerGroupConfigurationService.configureCommand(application, command).then(() => {
  //     this.initializeCommand();
  //     this.setState({ loaded: true, requiresTemplateSelection: false });
  //   });
  // };
  private configureCommand = () => {
    let { application, command } = this.props;
    let serverGroupCommand: any = command;
    alicloudServerGroupConfigurationService.configureCommand(application, serverGroupCommand).then(function() {
      const mode = serverGroupCommand.viewState.mode;
      if (mode === 'clone' || mode === 'create') {
        serverGroupCommand.viewState.useAllImageSelection = true;
      }
      if (mode === 'createPipline') {
        API.one('images/find')
          .get({ provider: 'alicloud' }).then(( imageLoader: any ) => {
          command.imgeId = imageLoader;
        })
      }
      if (command.viewState.mode !== 'create') {
        if (command.scalingConfigurations.tags === '') {
          command.scalingConfigurations.tags = {}
        } else {
          command.scalingConfigurations.tags = JSON.stringify(command.scalingConfigurations.tags);
        }
        this.setState({ loaded: true,});
        this.initializeWizardState();
        this.initializeSelectOptions();
        this.initializeWatches();
      }
      if (mode === 'editPipeline') {
        serverGroupCommand.vSwitchId = serverGroupCommand.scalingGroup.vswitchId;
        command = serverGroupCommand;
        command.viewState.loadBalancersConfigured = true;
        command.viewState.securityGroupsConfigured = true;
        command.backingData.filtered.regions = this.regions
        this.vnets.map(( (item: any) => {
          if (item.vswitchId === serverGroupCommand.vSwitchId) {
            serverGroupCommand.masterZoneId = item.zoneId;
            command = serverGroupCommand;
            command.vSwitchName = item.vswitchName;
            command.vpcId = item.vpcId;
            command.viewState.loadBalancersConfigured = true;
            command.viewState.sresourceecurityGroupsConfigured = true;
            command.backingData.filtered.regions = this.regions
            this.setState({ loaded: true,});
            this.state.requiresTemplateSelection = false;
            this.initializeWizardState();
            this.initializeSelectOptions();
            this.initializeWatches();
          }
        }))
      } else {
        this.setState({ loaded: true,});
        this.initializeWizardState();
        this.initializeSelectOptions();
        this.initializeWatches();
      }
    });
  }

  private initializeWizardState = () => {
    const mode = serverGroupCommand.viewState.mode;
    if (mode === 'clone' || mode === 'editPipeline') {
      // ModalWizard.markComplete('basic-settings');
      // ModalWizard.markComplete('load-balancers');
      // ModalWizard.markComplete('network-settings');
      // ModalWizard.markComplete('security-groups');
      // ModalWizard.markComplete('instance-type');
      // ModalWizard.markComplete('tags');
    }
  }

  private initializeWatches = () => {
  }

  private initializeSelectOptions = () => {
    processCommandUpdateResult(command.credentialsChanged(command, true));
    processCommandUpdateResult(command.regionChanged(command, true));
  }
  //
  // private normalizeCommand = ({ tags }: IAmazonServerGroupCommand) => {
  //   if (!tags) {
  //     return;
  //   }
  //   Object.keys(tags).forEach(key => {
  //     if (!key.length && !tags[key].length) {
  //       delete tags[key];
  //     }
  //   });
  // };
  //
  // public componentWillUnmount(): void {
  //   this._isUnmounted = true;
  //   if (this.refreshUnsubscribe) {
  //     this.refreshUnsubscribe();
  //   }
  // }
  //
  // private submit = (command: IAmazonServerGroupCommand): void => {
  //   this.normalizeCommand(command);
  //   const forPipelineConfig = command.viewState.mode === 'editPipeline' || command.viewState.mode === 'createPipeline';
  //   if (forPipelineConfig) {
  //     this.props.closeModal && this.props.closeModal(command);
  //   } else {
  //     this.state.taskMonitor.submit(() =>
  //       ReactInjector.serverGroupWriter.cloneServerGroup(command, this.props.application),
  //     );
  //   }
  // };

  const App = connect(
    mapStateToProps,
    mapDispatchToProps
  )(Counter)
    ReactDOM.render(
    <Provider store={store}>
    <App />
    </Provider>,
      document.getElementById('root')
    )

  public render() {
    const { application, command, dismissModal, title } = this.props;
    // const { loaded, taskMonitor, requiresTemplateSelection } = this.state;
    //
    // if (requiresTemplateSelection) {
    //   return (
    //     <ServerGroupTemplateSelection
    //       app={application}
    //       command={command}
    //       onDismiss={dismissModal}
    //       onTemplateSelected={this.templateSelected}
    //     />
    //   );
    // }

    return (
      <div>
        11111
        <Provider store={store}>
          <App />
        </Provider>,
      </div>
    );
  }
}
