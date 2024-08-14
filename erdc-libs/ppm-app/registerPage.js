define([ELMP.resource('ppm-store/index.js')], function (ppmStore) {
    const ErdcStore = require('erdcloud.store');
    const ErdcKit = require('erdcloud.kit');
    const getData = () => {
        return ppmStore.state.projectInfo || {};
    };
    // 注册问题相关配置
    require([ELMP.func('erdc-ppm-issue/index.js')], (issueInit) => {
        issueInit.init();
    });
    // 注册风险相关配置
    require([ELMP.func('erdc-ppm-risk/index.js')], (riskInit) => {
        riskInit.init();
    });
    // 注册督办任务相关配置
    require([ELMP.resource('project-handle-task/index.js')], (handleTaskInit) => {
        handleTaskInit.init();
    });
    // 注册流程相关配置
    require([ELMP.resource('ppm-workflow-resource/app/registerWorkflow.js')], (registerWorkflow) => {
        registerWorkflow.init();
    });
    // 注册需求相关配置
    require([ELMP.resource('requirement-list/index.js')], (requireInit) => {
        requireInit.init();
    });
    // 注册评审相关配置
    require([ELMP.resource('erdc-ppm-review-management/index.js')], (requireInit) => {
        requireInit.init();
    });
    // 注册基线相关配置
    require([ELMP.resource('erdc-cbb-components/InfoCompare/store.js'), ELMP.func('erdc-baseline/index.js')], (
        InfoCompareStore,
        baselineInit
    ) => {
        // 基线比较
        ErdcStore.registerModule('infoCompare', InfoCompareStore);
        baselineInit.init();
        baselineInit.initStore();
    });
    require(['fam:store'], (store) => {
        // 特殊组件映射转换
        store.dispatch('setComponentMapping', {
            PMCurrentUserSelect: 'fam-participant-select',
            ResponsibleCurrentUserSelect: 'fam-participant-select',
            MemberCurrentUserSelect: 'fam-participant-select',
            ProposerCurrentUserSelect: 'fam-participant-select',
            VerifierCurrentUserSelect: 'fam-participant-select',
            ChangeContentSelect: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/ChangeContentSelect/index.js')
            )
        });
        // 特殊条件注册（例如 为空，不为空）
        store.dispatch('setConditionsNeedHideComponent', [
            'PM_CURRENT_USER',
            'BELONG_ADMIN',
            'RESPONSIBLE_CURRENT_USER',
            'MEMBER_CURRENT_USER',
            'PROPOSER_CURRENT_USER',
            'VERIFIER_CURRENT_USER'
        ]);
        // 表格基础筛选条件映射
        store.dispatch('setBasicFilterOperMap', {
            ResponsibleCurrentUserSelect: 'RESPONSIBLE_EQ',
            VerifierCurrentUserSelect: 'VERIFIER_EQ',
            ProposerCurrentUserSelect: 'PROPOSER_EQ',
            ChangeContentSelect: 'CHANGE_CONTENT_CONTAIN'
        });
    });
    let pageRegister = function () {
        // 注册模板列表页面
        ErdcStore.dispatch('registerTemplateAssets', {
            contentComponent: ErdcKit.asyncComponent(ELMP.resource('erdc-ppm-template/views/list/index.js')),
            className: ppmStore.state.classNameMapping.project || ''
        });
        // 注册模板列表事件
        new Promise((resolve) => {
            require([ELMP.resource('/erdc-ppm-template/config/menu-actions.js')], (actionsAsync) => {
                actionsAsync.then((actions) => {
                    ErdcStore.dispatch('registerActionMethods', actions).then(() => {
                        resolve();
                    });
                });
            });
        });
        // 注册选择对象界面的列配置(例：项目-信息-相关项目-增加)
        new Promise((resolve) => {
            require([
                ELMP.resource('erdc-components/FamObjectSelectDialog/store.js'),
                ELMP.resource('ppm-app/config/object_select_config.js')
            ], (store, configs) => {
                configs.forEach((item) => {
                    store.dispatch('FamObjectSelect/setConfig', item);
                });
                resolve();
            });
        });
    };

    return pageRegister;
});
