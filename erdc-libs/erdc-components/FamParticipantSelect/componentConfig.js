define([
    'fam:store',
    'fam:http',
    ELMP.resource('erdc-components/FamParticipantSelect/api.js'),
    ELMP.resource('erdc-components/FamParticipantSelect/locale/index.js'),
    'erdcloud.i18n'
], function (store, famHttp, api, i18nConfig, i18n) {

    const i18nMap = i18n.wrap(i18nConfig);
    const QUERYMODES = [
        // 部门
        {
            title: i18nMap.selectOrg,
            placeholder: i18nMap.pleaseSelectOrg,
            name: 'ORG',
            type: 'ORG',
            component: 'SimpleSelect',
            displayName: i18nMap.organizationName, // 选部门
            titleDisplayName: i18nMap.byOrg,
            className: store.getters.className('organization'),
            requestConfig: api.api.orgApi(),
            leftRequestConfig: null
        },
        {
            title: i18nMap.selectOrg,
            placeholder: i18nMap.pleaseSelectOrg,
            name: 'RECENTUSE',
            type: 'ORG',
            component: 'RecentUseSelect',
            displayName: i18nMap.recentUse, // 选部门
            titleDisplayName: i18nMap.recentUse,
            className: '',
            requestConfig: api.api.getFavoritesLisApi(),
            leftRequestConfig: null
        },
        // 群组
        {
            title: i18nMap.selectGroup,
            placeholder: i18nMap.pleaseSelectGroup,
            name: 'GROUP',
            type: 'GROUP',
            component: 'SimpleSelect',
            displayName: i18nMap.groupName, // 选群组
            titleDisplayName: i18nMap.byGroup,
            className: store.getters.className('Group'),
            requestConfig: api.api.groupApi(),
            leftRequestConfig: null
        },
        {
            title: i18nMap.selectGroup,
            placeholder: i18nMap.pleaseSelectGroup,
            name: 'RECENTUSE',
            type: 'GROUP',
            component: 'RecentUseSelect',
            displayName: i18nMap.recentUse, // 选群组
            titleDisplayName: i18nMap.recentUse,
            className: '',
            requestConfig: api.api.getFavoritesLisApi(),
            leftRequestConfig: null
        },
        // 角色
        {
            title: i18nMap.selectRoleType,
            selectTitle: i18nMap.selectRole,
            placeholder: i18nMap.pleaseSelectRole,
            leftPlaceholder: i18nMap.pleaseSelectRoleType,
            name: 'ROLE',
            type: 'ROLE',
            queryScope: 'global', // 全局
            component: 'ComplexSelect',
            displayName: i18nMap.roleName, // 选角色
            titleDisplayName: i18nMap.byRole,
            className: store.getters.className('Role'),
            requestConfig: api.api.roleApi(),
            leftRequestConfig: api.api.roleTreeApi(),
            leftClassName: store.getters.className('Role')
        },
        {
            title: i18nMap.selectRoleType,
            selectTitle: i18nMap.selectRole,
            placeholder: i18nMap.pleaseSelectRole,
            leftPlaceholder: i18nMap.pleaseSelectRoleType,
            name: 'ROLE',
            type: 'ROLE',
            queryScope: 'fullTenant', // 全租户
            component: 'ComplexSelect',
            displayName: i18nMap.roleName, // 选角色
            titleDisplayName: i18nMap.byRole,
            className: store.getters.className('Role'),
            requestConfig: api.api.roleApi(),
            leftRequestConfig: api.api.roleTreeApi(),
            leftClassName: store.getters.className('Role')
        },
        {
            title: i18nMap.selectRole,
            placeholder: i18nMap.pleaseSelectRole,
            name: 'ROLE',
            type: 'ROLE',
            queryScope: 'team', // 团队
            component: 'SimpleSelect',
            displayName: i18nMap.roleName, // 选角色
            titleDisplayName: i18nMap.byRole,
            requestConfig: api.api.getTeamRoleByContainerApi(),
            leftRequestConfig: null
        },
        {
            title: i18nMap.selectRoleType,
            selectTitle: i18nMap.selectRole,
            placeholder: i18nMap.pleaseSelectRole,
            leftPlaceholder: i18nMap.pleaseSelectRoleType,
            name: 'ROLE',
            type: 'ROLE',
            queryScope: 'teamRole', // 角色
            component: 'ComplexSelect',
            displayName: i18nMap.roleName, // 选角色
            titleDisplayName: i18nMap.byRole,
            className: store.getters.className('Role'),
            requestConfig: api.api.roleApi(),
            leftRequestConfig: api.api.roleTreeApi(),
            leftClassName: store.getters.className('Role')
        },
        {
            title: i18nMap.selectRole,
            placeholder: i18nMap.pleaseSelectRole,
            name: 'RECENTUSE',
            type: 'ROLE',
            component: 'RecentUseSelect',
            displayName: i18nMap.recentUse, // 选角色
            titleDisplayName: i18nMap.recentUse,
            className: '',
            requestConfig: api.api.getFavoritesLisApi(),
            leftRequestConfig: null
        },
        // 选人
        {
            title: i18nMap.selectOrg,
            selectTitle: i18nMap.selectUser,
            placeholder: i18nMap.pleaseSelectUser,
            leftPlaceholder: i18nMap.pleaseSelectOrg,
            name: 'ORG',
            type: 'USER',
            queryScope: 'fullTenant', // 角色
            component: 'ComplexSelect',
            displayName: i18nMap.organizationName, // 选人
            titleDisplayName: i18nMap.byOrg,
            className: store.getters.className('user'),
            requestConfig: api.api.userApi(),
            leftRequestConfig: api.api.orgApi(),
            leftClassName: store.getters.className('organization')
        },
        {
            title: i18nMap.selectRole,
            selectTitle: i18nMap.selectUser,
            placeholder: i18nMap.pleaseSelectUser,
            leftPlaceholder: i18nMap.pleaseSelectRole,
            name: 'ROLE',
            type: 'USER',
            queryScope: 'team', // 角色
            component: 'ComplexSelect',
            displayName: i18nMap.roleName, // 选人
            titleDisplayName: i18nMap.byRole,
            className: store.getters.className('user'),
            requestConfig: api.api.getTeamMembersApi(),
            leftRequestConfig: api.api.getTeamRoleByContainerApi(),
            leftClassName: store.getters.className('Role')
        },
        {
            title: i18nMap.selectGroup,
            selectTitle: i18nMap.selectUser,
            placeholder: i18nMap.pleaseSelectUser,
            leftPlaceholder: i18nMap.pleaseSelectGroup,
            name: 'GROUP',
            type: 'USER',
            queryScope: 'fullTenant', // 角色
            component: 'ComplexSelect',
            displayName: i18nMap.groupName, // 选人
            titleDisplayName: i18nMap.byGroup,
            className: store.getters.className('user'),
            requestConfig: api.api.userApi(),
            leftRequestConfig: api.api.groupApi(),
            leftClassName: store.getters.className('Group')
        },
        {
            title: i18nMap.selectUser,
            placeholder: i18nMap.pleaseSelectUser,
            name: 'FUZZYSEARCH',
            type: 'USER',
            component: 'FuzzySearchSelect',
            queryScope: 'global', // 全局
            displayName: i18nMap.fuzzySearch, // 选人
            titleDisplayName: i18nMap.fuzzySearch,
            className: '',
            requestConfig: api.api.userAllApi(),
            leftRequestConfig: null
        },
        {
            title: i18nMap.selectUser,
            placeholder: i18nMap.pleaseSelectUser,
            name: 'FUZZYSEARCH',
            type: 'USER',
            component: 'FuzzySearchSelect',
            queryScope: 'fullTenant',
            displayName: i18nMap.fuzzySearch, // 选人
            titleDisplayName: i18nMap.fuzzySearch,
            className: '',
            requestConfig: api.api.userApi(),
            leftRequestConfig: null
        },
        {
            title: i18nMap.selectUser,
            placeholder: i18nMap.pleaseSelectUser,
            name: 'FUZZYSEARCH',
            type: 'USER',
            component: 'FuzzySearchSelect',
            queryScope: 'team',
            displayName: i18nMap.fuzzySearch, // 选人
            titleDisplayName: i18nMap.fuzzySearch,
            className: '',
            requestConfig: api.api.getTeamMembersApi(),
            leftRequestConfig: null
        },
        {
            title: i18nMap.selectUser,
            placeholder: i18nMap.pleaseSelectUser,
            name: 'FUZZYSEARCH',
            type: 'USER',
            component: 'FuzzySearchSelect',
            queryScope: 'teamRole',
            displayName: i18nMap.fuzzySearch, // 选人
            titleDisplayName: i18nMap.fuzzySearch,
            className: '',
            requestConfig: api.api.getTeamMembersApi(),
            leftRequestConfig: null
        },
        {
            title: i18nMap.selectUser,
            placeholder: i18nMap.pleaseSelectUser,
            name: 'RECENTUSE',
            type: 'USER',
            component: 'RecentUseSelect',
            displayName: i18nMap.recentUse, // 选人
            titleDisplayName: i18nMap.recentUse,
            className: '',
            requestConfig: api.api.getFavoritesLisApi(),
            leftRequestConfig: null
        }
    ];
    return {
        QUERYMODES
    };
});
