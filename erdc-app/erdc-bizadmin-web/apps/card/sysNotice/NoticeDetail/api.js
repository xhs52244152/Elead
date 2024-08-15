define(['fam:http', 'fam:store', ELMP.resource('erdc-app/api/organization.js')], function (famHttp, store, orgApi) {
    const url = {
        site: {
            pageList: '/file/file/site/console/v1/site/page', // 分页获取站点列表
            list: '/file/file/site/console/v1/site/all', // 获取站点列表，不分页
            health: '/file/file/site/storage/v1/health', // 健康检查
            add: '/file/file/site/console/v1/site', // 新增站点
            active: '/file/file/site/console/v1/site/active', // 站点启用\停用
            files: '/file/file/site/console/v1/file/page', // 分页获取站点文件列表
            syncRecord: '/file/file/site/console/v1/file/sync/one', // 站点同步记录
            link: '/file/file/site/console/v1/site/link', // 获取站点管理信息
            default: '/file/file/site/console/v1/site/me', // 获取用户默认站点
        },
        timingTask: {
            list: '/file/file/site/console/v1/file/sync/listJob',
            disable: '/file/file/site/console/v1/file/sync/disableJob', // 定时任务禁用
            enable: '/file/file/site/console/v1/file/sync/enableJob', // 定时任务启用
            save: '/file/file/site/console/v1/file/sync/saveJob', // 新增/编辑定时任务
            del: '/file/file/site/console/v1/file/sync/deleteJob' // 删除定时任务
        }
    };

    const app = {
        // 查询应用列表
        list() {
            return famHttp({
                url: '/platform/application/list',
                method: 'GET'
            });
        },
        // 保存应用信息
        save(code, config) {
            return famHttp({
                url: `/file/doc/v1/config/${code}/save`,
                data: {
                    config,
                },
                method: 'POST'
            });
        },
        // 根据应用编码查询应用信息
        get(code) {
            return famHttp({
                url: `/file/doc/v1/config/${code}/get`,
                method: 'GET'
            });
        }
    };

    const other = {
        // 查询存储桶类型
        dsList() {
            return famHttp({
                url: '/file/doc/v1/ds/nodes',
                method: 'GET'
            });
        }
    };

    const fileType = {
        // 批量删除文件分类
        del(data) {
            return famHttp({
                url: '/file/doc/v1/type/define/remove',
                method: 'DELETE',
                data
            });
        },
        /**
         * 移动文件分类，对文件分类进行排序
         * @param {*} id  移动文件的id
         * @param {*} direction 移动方向， 0：向上； 1：向下
         */
        sort(id, direction) {
            return famHttp({
                url: `/file/doc/v1/type/define/${id}/move`,
                method: 'PUT',
                data: {
                    direction
                },
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        },
        // 创建文件分类
        create(data) {
            return famHttp({
                url: '/file/doc/v1/type/define/create',
                method: 'POST',
                data,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        },
        edit(id, data) {
            return famHttp({
                url: `/file/doc/v1/type/define/${id}/modify`,
                method: 'PUT',
                data
            });
        },
        getList() {
            return famHttp({
                url: '/file/doc/v1/type/define/list',
                method: 'GET'
            });
        }
    };

    const baseType = {
        // 新增文件类型
        create(data) {
            return famHttp({
                url: '/file/doc/v1/type/link/batch/create',
                method: 'POST',
                data
            });
        },
        delete(data) {
            return famHttp({
                url: '/file/doc/v1/type/link/remove',
                method: 'DELETE',
                data
            });
        }
    };

    const site = {
        list() {
            return famHttp({
                url: url.site.list,
                method: 'GET'
            });
        },
        health(serverAddr) {
            return famHttp({
                url: `${serverAddr}${url.site.health}`,
                method: 'GET'
            });
        },
        add(params) {
            return famHttp({
                url: url.site.add,
                method: 'POST',
                data: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            });
        },
        edit(id, params) {
            return famHttp({
                url: `${url.site.add}/${id}`,
                method: 'PUT',
                data: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            });
        },
        delete(id) {
            return famHttp({
                url: `${url.site.add}/${id}`,
                method: 'DELETE'
            });
        },
        // 站点启用/停用
        active(data) {
            return famHttp({
                url: url.site.active,
                method: 'GET',
                data
            });
        },
        getLinkSites() {
            return famHttp({
                url: url.site.link,
                method: 'GET'
            }).then((res) => {
                // const resData = res.res;

                // const data = {
                //     data: resData.data ?? [],
                //     users: resData.users ?? []
                // };

                return res.data;
            });
        },
        /**
         * 切换默认站点
         * @param {*} id 组织或人的id
         * @param {*} siteCode
         */
        linkSite(id, siteCode) {
            return famHttp({
                url: `${url.site.link}/${id}`,
                data: {
                    siteCode
                },
                method: 'PUT'
            });
        },
        /**
         * 新增和更默认站点
         * @param {*} params
         */
        batchLinkSite(params) {
            return famHttp({
                url: url.site.link,
                data: JSON.stringify(params),
                contentType: 'application/json;charset=utf-8',
                method: 'POST'
            });
        },
        /**
         * 站点解绑
         * @param {*} id 人或部门id
         */
        unLinkSite(id) {
            return famHttp({
                url: `${url.site.link}/${id}`,
                method: 'DELETE'
            });
        },
        getDefaultSite() {
            return famHttp({
                url: url.site.default,
                method: 'GET'
            });
        }
    };

    const timingTask = {
        saveTask(data) {
            return famHttp({
                url: url.timingTask.save,
                method: 'POST',
                data,
            });
        },
        setTaskEnable(jobId) {
            return famHttp({
                url: url.timingTask.enable,
                method: 'POST',
                data: {
                    jobId,
                },
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });   
        },
        setTaskDisable(jobId) {
            return famHttp({
                url: url.timingTask.disable,
                method: 'POST',
                data: {
                    jobId,
                },
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });  
        },
        del(jobId) {
            return famHttp({
                url: url.timingTask.del,
                method: 'DELETE',
                params: {
                    jobId,
                },
            });
        }
    };

    const org = {
        getOrgByParent(parentKey) {
            return orgApi.fetchOrganizationListByParentKey({ parentKey }).then((res) => {
                // 过滤虚拟部门
                const specialOrg = store.getters.specialConstName('specialOrganization') || [];
                let filterData = (res.data || []).filter((item) => !specialOrg.includes(item.number));

                filterData = filterData.map((item) => {
                    return Object.assign(
                        {
                            hasChild: !item.leaf
                        },
                        item
                    );
                });
                return filterData;
            });
        }
    };

    return {
        url,
        app,
        fileType,
        baseType,
        other,
        site,
        org,
        timingTask,
    };
});
