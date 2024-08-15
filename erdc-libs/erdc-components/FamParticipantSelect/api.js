define([], function () {
    const url = {
        roleTree: '/fam/role/type', // 全租户角色树
        role: '/fam/role/list', // 全租户角色
        getTeamRoleByContainer: '/fam/team/getTeamRoleByContainer', // 上下文角色树
        getTeamMembers: '/fam/team/getTeamMembers', // 上下文取用户
        org: '/fam/listAllTree', // 部门
        group: '/fam/group/listAllTree', // 群组
        user: '/fam/user/list', // 全租户人员
        saveVisiteds: '/fam/saveVisiteds', // 最近使用保存
        getFavoritesLis: '/common/favorites/getFavoritesList', // 最近使用获取
        userAll: '/fam/user/list/all' // 模糊搜索全局
    };

    const api = {
        roleTreeApi(data) {
            return {
                url: url.roleTree,
                data,
                method: 'GET'
            };
        },
        roleApi(data) {
            return {
                url: url.role,
                data,
                method: 'GET'
            };
        },
        getTeamRoleByContainerApi(data) {
            return {
                url: url.getTeamRoleByContainer,
                data,
                method: 'GET'
            };
        },
        getTeamMembersApi(data) {
            return {
                url: url.getTeamMembers,
                data,
                method: 'GET'
            };
        },
        orgApi(data) {
            return {
                url: url.org,
                data,
                method: 'GET'
            };
        },
        groupApi(data) {
            return {
                url: url.group,
                data,
                method: 'GET'
            };
        },
        userApi(data) {
            return {
                url: url.user,
                data,
                method: 'POST'
            };
        },
        saveVisitedsApi(data) {
            return {
                url: url.saveVisiteds,
                data,
                method: 'GET'
            };
        },
        getFavoritesLisApi(data) {
            return {
                url: url.getFavoritesLis,
                data,
                method: 'POST'
            };
        },
        userAllApi(data) {
            return {
                url: url.userAll,
                data,
                method: 'POST'
            };
        }
    };

    return {
        api,
        url
    };
});
