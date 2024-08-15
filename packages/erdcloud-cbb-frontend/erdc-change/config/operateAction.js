define([
    ELMP.func('erdc-change/components/DialogConfirm/index.js'),
    ELMP.func('erdc-change/components/DialogCollectObjects/index.js'),
    ELMP.func('erdc-change/components/RefuseTips/index.js'),
    ELMP.resource('erdc-pdm-common-actions/index.js'),
    ELMP.func('erdc-change/config/viewConfig.js'),
    ELMP.func('erdc-change/api.js'),
    ELMP.func('erdc-change/locale/index.js'),
    ELMP.func('erdc-change/utils.js'),
    'css!' + ELMP.func('erdc-change/config/style.css')
], function (
    DialogConfirm,
    DialogCollectObjects,
    RefuseTips,
    commonActions,
    viewConfig,
    Api,
    locale,
    utils
) {
    const Vue = require('vue');
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const ErdcHttp = require('erdcloud.http');
    const ErdcRouter = require('erdcloud.router');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);
    const routeMap = {
        PR: {
            create: 'change/prCreate',
            update: 'change/prEdit'
        },
        ECR: {
            create: 'change/ecrCreate',
            update: 'change/ecrEdit'
        },
        ECN: {
            create: 'change/ecnCreate',
            update: 'change/ecnEdit'
        },
        ECA: {
            update: 'change/ecaEdit'
        }
    };

    // eslint-disable-next-line no-unused-vars
    function getSuccessCallBack(vm, row, inTable) {
        return function handleSuccess() {
            if (inTable) {
                // 获取通用页面注册的回调函数
                const $commonPageVm = vm?.$store?.getters?.['commonPageStore/getCommonPageObject'] || {};
                const callback = $commonPageVm?.[`${row?.oid}_detail`];

                // 执行列表刷新
                vm.refresh();

                // 执行通用页面刷新
                _.isFunction(callback) &&
                    callback((vm) => {
                        _.isFunction(vm?.componentRefresh) && vm.componentRefresh();
                    });
            } else if (!Array.isArray(row)) {
                vm.refresh(row.oid);
            }
        };
    }
    // 修订
    function mountConfirmDialog(props, successCallback) {
        return commonActions.mountHandleDialog(DialogConfirm, {
            props,
            successCallback,
            urlConfig: {
                batchDelete: Api.batchDelete,
                batchRevision: Api.batchRevision
            }
        });
    }
    // 收集相关对象
    function mountCollectObjects(props, successCallback) {
        return commonActions.mountHandleDialog(DialogCollectObjects, { props, successCallback, urlConfig: {} });
    }

    function mountRefuseTip() {
        const Dialog = new Vue(RefuseTips);
        const dialogIns = Dialog.$mount();
        document.body.appendChild(dialogIns.$el);
        return dialogIns;
    }

    // 创建
    function handleCreate(row, inTable, type) {
        if (type === 'ECN') {
            ErdcStore.state.Change.changeTaskList = [];
            //清空之前的关联的变更对象数据
            ErdcStore.state.Change.relatedChangeObject = [];
        }
        const route = ErdcRouter?.app?.$route;
        ErdcRouter.push({
            path: `${route?.meta?.prefixRoute}/${routeMap[type].create}`,
            query: _.pick(route.query, (value, key) => {
                return ['pid', 'typeOid'].includes(key) && value;
            })
        });
    }

    function handleSaveEnterRoute(route) {
        return {
            fullPath: route.fullPath,
            path: route.path,
            query: route.query,
            name: route.name,
            meta: route.meta,
            // matched:route.matched,
            params: route.params
        };
    }

    // 编辑
    function handleEdit(row, inTable, type) {
        const route = ErdcRouter?.app?.$route;
        //变更通告存储进入时的路由信息，给变更通告关闭时使用
        if (type == 'ECN') {
            let enterRoute = handleSaveEnterRoute(route);
            this?.$store.commit('Change/backRouteInfo', JSON.stringify(enterRoute));
        }
        if (inTable) {
            ErdcRouter.push({
                path: `${route?.meta?.prefixRoute}/${routeMap[type].update}`,
                query: {
                    ..._.pick(this.$route.query, (value, key) => {
                        return ['pid', 'typeOid'].includes(key) && value;
                    }),
                    oid: row.oid
                }
            });
        } else {
            this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                ErdcRouter.push({
                    path: `${route?.meta?.prefixRoute}/${routeMap[type].update}`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        oid: row.oid
                    }
                });
            });
        }
    }
    // 列表中创建变更
    // eslint-disable-next-line no-unused-vars
    function handleCreateOther(row, inTable, type, config) {
        const typeMap = {
            PR: 'ECR',
            ECR: 'ECN'
        };
        let typeName = typeMap[type];
        let containerRef = '',
            rowContainer = '';
        const selectData = Array.isArray(row) ? row : [row];
        if (!Array.isArray(row)) {
            containerRef = row?.attrRawList?.find((item) => item.attrName === 'containerRef');
            rowContainer = _.isString(row?.containerRef) ? row?.containerRef : row?.containerRef.oid;
        }
        //清空其他模块创建时带入的数据
        localStorage.removeItem('saveAsChangeData');
        localStorage.setItem('saveOtherData', JSON.stringify(selectData));
        const route = ErdcRouter?.app?.$route;
        ErdcRouter.push({
            path: `${route?.meta?.prefixRoute}/${routeMap[typeName].create}`,
            query: {
                ..._.pick(route.query, (value, key) => {
                    return ['pid', 'typeOid'].includes(key) && value;
                }),
                type: 'create',
                containerRef: containerRef?.oid || rowContainer
            }
        });
    }

    // 删除
    function handleDelete(row, inTable) {
        let listRoutePath = `${this.$route?.meta?.prefixRoute}/change/list`;
        commonActions.normalDelete(this, row, { inTable, listRoutePath });
    }

    // 重命名
    function handleRename(row, inTable, type, config) {
        if (!inTable) {
            row = {
                ...this.objectSourceData,
                attrRawList: _.map(this.objectSourceData?.rawData, (value) => {
                    return { ...value };
                }),
                ..._.reduce(
                    this.objectSourceData?.rawData,
                    (prev, next) => {
                        return {
                            ...prev,
                            [next.attrName]: next.displayName,
                            [`${this.className}#${next.attrName}`]: next.displayName
                        };
                    },
                    {}
                )
            };
        }
        if (Array.isArray(row) && row.length === 0) {
            return this.$message.warning(i18n.pleaseSelectData);
        }

        commonActions.rename(row, config.className, getSuccessCallBack(this, row, inTable, true), {
            showCollect: false
        });
    }

    // 设置状态
    function handleSetState(row, inTable, type, config) {
        if (Array.isArray(row) && row.length === 0) {
            return this.$message.warning(i18n.pleaseSelectData);
        }

        commonActions.setState(row, config.className, getSuccessCallBack(this, row, inTable, false), {
            showCollect: false
        });
    }

    // 修订
    function handleReversion(row) {
        const data = Array.isArray(row) ? row : [row];
        if (!data.length) {
            return this.$message({
                type: 'warning',
                message: '请选择数据'
            });
        }
        const oIds = data.map((i) => i.oid);
        ErdcHttp({
            url: Api.toReversion,
            className: viewConfig.ecaChangeTableView.className,
            data: oIds,
            method: 'POST'
        }).then((res) => {
            const props = {
                visible: true,
                inTable: true,
                type: 'reversion',
                width: '800px',
                className: viewConfig.ecaChangeTableView.className,
                title: i18n.reversionConfirm,
                confirmTitle: i18n.reversionTip,
                tips: i18n.selectReversionTip,
                reversionData: res?.data || [],
                appName: 'PDM',
                columns: [
                    {
                        prop: 'seq',
                        type: 'seq',
                        title: ' ',
                        width: '48',
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'name', // 属性key
                        title: i18n['name']
                    },
                    {
                        prop: 'identifierNo', // 属性key
                        title: i18n['number'], // 属性名称
                        width: '180'
                    },
                    {
                        prop: 'version', // 属性key
                        title: i18n['version'], // 属性名称
                        width: '100'
                    },
                    {
                        prop: 'toVersion', // 属性key
                        title: i18n['revisedVersion'], // 属性名称
                        width: '160'
                    }
                ]
            };

            mountConfirmDialog(props, (data) => {
                ErdcHttp({
                    url: '/change/search/by/oid',
                    data: {
                        oidList: data
                    },
                    method: 'POST'
                }).then((res) => {
                    let data = (res?.data?.records || []).map((row) => {
                        utils.coverDataFromAttrRowList(row, 'attrRawList', true);
                        row.selected = true;
                        return row;
                    });
                    this?.vm?.$emit('setReversionData', data);
                    this.reversionData = data;
                    //修订成功清空受影响的对象选中的数据
                    this?.vm?.$emit('clearAffectedListSelectData', data);
                });
            });
        });
    }

    // 更改所有者
    function handleModifyOwner(row, inTable, type, config) {
        if (Array.isArray(row) && row.length === 0) {
            this.$message.warning(i18n.pleaseSelectData);
        } else {
            let ownedByRef = Array.isArray(row.ownedByRef) ? row.ownedByRef : this.sourceData?.ownedByRef?.users;
            if (ownedByRef) {
                row.ownedByRef = ownedByRef?.[0]?.displayName || '';
            }

            commonActions.changeOwner(row, config.className, getSuccessCallBack(this, row, inTable), {
                inTable,
                oid: Array.isArray(row) ? null : row.oid,
                showCollect: false,
                joinClassName: false
            })
        }
    }

    // 移动
    function handleMove(row, inTable, type, config) {
        if (!inTable) {
            row = {
                ...this.objectSourceData,
                attrRawList: _.map(this.objectSourceData?.rawData, (value) => {
                    return { ...value };
                }),
                ..._.reduce(
                    this.objectSourceData?.rawData,
                    (prev, next) => {
                        return {
                            ...prev,
                            [next.attrName]: next.displayName,
                            [`${this.className}#${next.attrName}`]: next.displayName
                        };
                    },
                    {}
                )
            };
        }
        if (Array.isArray(row) && row.length === 0) {
            this.$message.warning(i18n.pleaseSelectData);
        } else {
            //单条数据编辑时，修改的是同一个对象，containerRef会被替换成oid,导致列表上下文会显示oid,拷贝独立的对象修改
            let copyRow = ErdcKit.deepClone(row);

            commonActions.move(copyRow, config.className, getSuccessCallBack(this, copyRow, inTable), {
                oid: Array.isArray(row) ? null : row.oid,
                inTable,
                joinClassName: false
            });
        }
    }

    // 收集相关对象
    // eslint-disable-next-line no-unused-vars
    function handleCollector(row) {
        const { getProp } = require(ELMP.func('erdc-change/utils.js'));
        if (!row.length) {
            return this.$message.info(i18n.collectObjData);
        }
        const props = {
            visible: true,
            width: '800px',
            innerTable: row,
            className: viewConfig.ecaChangeTableView.className,
            title: i18n.collectObject
        };
        mountCollectObjects(props, (data) => {
            const filterData = data
                .filter((row) => row.relationOid)
                .map((row) => {
                    let hasIcon = false;
                    utils.coverDataFromAttrRowList(row, 'attrRawList', true, (attrObject, format) => {
                        if (attrObject.attrName === 'icon') {
                            hasIcon = true;
                            try {
                                return (row.icon = attrObject.value);
                            } catch (error) {
                                return format(attrObject);
                            }
                        }
                        return format(attrObject);
                    });
                    if (hasIcon) {
                        row.attrRawList = (row?.attrRawList || []).filter(
                            (attrObject) => !attrObject?.attrName.includes('icon') || attrObject?.attrName === 'icon'
                        );
                    }
                    row.selected = true;
                    row.includesData = [row?.relationOid, row?.versionOid];
                    row.oid = row?.versionOid;
                    return row;
                });
            if (filterData.length) {
                getProp(
                    this,
                    // 创建变更任务
                    '$refs.object-list.0.handlerCreateRelation',
                    getProp(
                        this,
                        // 流程内创建变更任务
                        '$refs.object-list.handlerCreateRelation',
                        // 编辑变更任务
                        getProp(this, '$refs.detail.0.$refs.object-list.0.handlerCreateRelation', () => void 0, true)
                    )
                )(filterData);
            }
        });
    }

    // 变更任务操作中的移除
    // eslint-disable-next-line no-unused-vars
    function handleRemove(row, inTable, type, config) {
        if (Array.isArray(row) && row.length === 0) {
            return this.$message.warning(i18n.pleaseSelectData);
        }
        let oidList = Array.isArray(row) ? row : [row];
        let tableData = [];
        let currentRef = {};
        let oid = null;
        let className = '';
        // 受影响的对象
        if (type === 'ECA_ACTIVITY') {
            currentRef = this.$refs?.detail?.[0]?.$refs?.['object-list']?.[0] || this.$refs?.['object-list'];
            oid = [currentRef?.oid];
            className = viewConfig.otherClassNameMap.affectedActivityData;
        }
        // 产生的对象
        if (type === 'ECA_PRODUCE') {
            currentRef = this.$refs?.detail?.[0]?.$refs?.['product-object']?.[0] || this.$refs[`product-object`];
            oid = currentRef?.oid;
            className = viewConfig.otherClassNameMap.changeRecord;
        }
        // 已绑定的数据
        const deleteIds = oidList
            .filter((item) => !item.selected)
            .map(
                (item) =>
                    utils.getProp(
                        utils.getAttrFromAttrRowList(item?.attrRawList || [], `${className}#oid`),
                        'value',
                        '',
                        true
                    ) ||
                    item.linkOid ||
                    item.oid
            );
        // 新增数据
        const filterData = oidList.filter((item) => item.selected).map((item) => item.oid);
        tableData = currentRef?.tableData || [];
        this.$confirm(i18n.deleteBatchTip, i18n.deleteTip, {
            type: 'warning',
            confirmButtonText: i18n.confirm,
            cancelButtonText: i18n.cancel
        }).then(() => {
            if (filterData.length) {
                const indicesToRemove = function (array) {
                    return array.reduce((acc, obj, index) => {
                        if (filterData.find((bObj) => bObj === obj.oid)) {
                            acc.push(index);
                        }
                        return acc;
                    }, []);
                };

                // 从a数组中移除与b数组中共享的对象
                indicesToRemove(tableData)
                    .sort((a, b) => b - a)
                    .forEach((index) => tableData.splice(index, 1));
                this.$message({
                    type: 'success',
                    message: i18n.deleteSuccess,
                    showClose: true
                });
                //清空勾选的数据
                oidList = [];
            }
            if (deleteIds.length) {
                ErdcHttp({
                    url: '/fam/deleteByIds',
                    method: 'delete',
                    params: {},
                    data: {
                        oidList: deleteIds,
                        className
                    }
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: i18n.deleteSuccess,
                        showClose: true
                    });
                    if (type === 'ECA_ACTIVITY') currentRef?.getTableList(oid);
                    if (type === 'ECA_PRODUCE') currentRef?.getProductTable(oid);
                    //清空勾选的数据
                    oidList = [];
                });
            }
        });
    }

    // 批量编辑属性
    function handleBatchUpdateAttr(row) {
        !_.isArray(row) && (row = [row]);
        // 已绑定的数据
        const selectKeys = row
            .filter((item) => !item.selected)
            ?.map((item) => item?.relationOid || item?.oid)
            ?.map((item) => item?.split?.(':')?.[1]);
        // 新增数据
        const filterData = row.filter((item) => item.selected).map((item) => item.idKey);
        const isKeys = [...new Set([...selectKeys, ...filterData])];
        // 不可选择不同类型的数据
        if (Array.isArray(isKeys) && isKeys.length > 1) {
            return this.$message.warning(i18n.notType);
        }
        if (!_.isArray(row) || (_.isArray(row) && !row.length)) {
            return this.$message.warning(i18n.pleaseSelectData);
        }
        commonActions.batchEdit(row, {
            validator: [],
            className: isKeys[0]
        });
    }

    return {
        handleCreate,
        handleEdit,
        handleDelete,
        handleRename,
        handleSetState,
        handleReversion,
        handleModifyOwner,
        handleMove,
        mountRefuseTip,
        handleCollector,
        handleCreateOther,
        handleRemove,
        handleBatchUpdateAttr
    };
});
