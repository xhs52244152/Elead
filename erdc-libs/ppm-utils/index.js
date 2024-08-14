define(['vue', 'erdcloud.kit', 'dayjs', ELMP.resource('ppm-store/index.js')], function (Vue, ErdcKit, dayjs, ppmStore) {
    const axios = require('fam:http');
    const router = require('erdcloud.router');
    var ElementVue = null;

    /**
     * 继承element弹窗等公用组件
     * **/
    const getElementUI = function () {
        if (!ElementVue) {
            ElementVue = new Vue();
        }
        return ElementVue;
    };

    // 校验项目(新增、编辑、复制项目、另存为模板)表单的工时  duration:校验值  tip：提示信息
    const checkHours = function (duration, tip) {
        let reg = /^\d+(\.\d)?$/;
        if (duration && !reg.test(duration)) {
            getElementUI().$message({
                type: 'info',
                message: tip
            });
            return true;
        }
        return false;
    };

    // 查看详情
    let openDetail = function (row, config = {}) {
        let { changeRouteConfig, oidKey, appName } = config;
        const _ = require('underscore');
        const { $router, $route } = router.app;
        let className = row.idKey || row.typeName || '';
        let oid = row.oid || '';
        let projectRef = row.projectRef || '';
        let title = row.name || '';
        if (row.attrRawList) {
            const findValue = (key, keyValue) => {
                return row.attrRawList.find((item) => item.attrName.split('#')[1] === key)?.[keyValue] || '';
            };
            className = findValue('typeName', 'value');
            if (oidKey) oid = findValue(oidKey, 'oid');
            else oid = findValue('roleBObjectRef', 'oid') || findValue('oid', 'value');
            projectRef = findValue('projectRef', 'oid') || $route.query.pid || '';
            title = findValue('name', 'displayName');
        }
        let getRouteConfig = function ({ path = '', query = {} }) {
            let routeConfig = {
                path,
                query: {
                    pid: projectRef,
                    ...query
                }
            };
            return _.isFunction(changeRouteConfig) ? changeRouteConfig(routeConfig) : routeConfig;
        };
        let openWay = (route) => {
            let { path, query } = getRouteConfig(route);
            const ErdcStore = require('erdcloud.store');
            appName = appName || 'erdc-project-web';
            ErdcStore.state.route.resources.identifierNo !== appName
                ? window.open(`/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(path, query)}`, appName)
                : $router.push({
                      path,
                      query
                  });
        };
        let businessName, path, pathMap;
        switch (className) {
            case 'erd.cloud.ppm.project.entity.Project':
                openWay({ path: '/space/project-space/projectInfo', query: { pid: oid, componentRefresh: true } });
                break;
            case 'erd.cloud.ppm.plan.entity.projectTask':
            case 'erd.cloud.ppm.plan.entity.milestone':
            case 'erd.cloud.ppm.plan.entity.Task':
                openWay({
                    path: '/space/project-task/taskDetail',
                    query: { planTitle: title, planOid: oid, componentRefresh: true }
                });
                break;
            case 'erd.cloud.ppm.require.entity.Requirement':
                path = projectRef ? '/space/requirement-list/require/detail' : '/requirement-list/require/detail';
                appName = projectRef ? appName : 'erdc-requirement-web';
                openWay({ path, query: { oid, title, componentRefresh: true } });
                break;
            default:
                businessName = className.split('.')[5].toLowerCase();
                pathMap = {
                    issue: '/space/erdc-ppm-issue/issue/detail',
                    risk: '/space/erdc-ppm-risk/detail'
                };
                openWay({
                    path: pathMap[businessName],
                    query: { title, oid, componentRefresh: true }
                });
        }
    };
    // 督办任务相关path
    const getDiscreteTaskPath = (type, appName) => {
        const ErdcStore = require('erdcloud.store');
        appName = appName || ErdcStore.state.route.resources.identifierNo;
        let path;
        // 工作台
        if (appName === 'erdc-portal-web') {
            switch (type) {
                case 'list':
                    path = '/project-handle-task/handleTask/list';
                    break;
                case 'create':
                    path = '/project-handle-task/handleTask/create';
                    break;
                case 'edit':
                    path = '/project-handle-task/handleTask/edit';
                    break;
                case 'detail':
                    path = '/project-handle-task/handleTask/detail';
                    break;
            }
        } else {
            // 否则明确跳转到项目应用里面
            appName = 'erdc-project-web';
            switch (type) {
                case 'list':
                    path = '/space/project-handle-task/supervisionTask/list';
                    break;
                case 'create':
                    path = '/space/project-handle-task/supervisionTask/create';
                    break;
                case 'edit':
                    path = '/space/project-handle-task/supervisionTask/edit';
                    break;
                case 'detail':
                    path = '/space/project-handle-task/supervisionTask/detail';
                    break;
            }
        }
        return {
            appName,
            path
        };
    };
    // 打开督办任务页面的公共方法，支持打开列表、创建、编辑、详情页面
    const openDiscreteTaskPage = (openType, config = {}, row = {}) => {
        const { $route } = router.app;
        const ErdcStore = require('erdcloud.store');
        const { i18n } = require(ELMP.resource('project-handle-task/locale/index.js'));
        const i18nMappingObj = languageTransfer(i18n);
        const className = ppmStore.state.classNameMapping.DiscreteTask; // 督办任务的className
        let projectRef;
        if (['edit', 'detail'].includes(openType)) {
            row = JSON.parse(JSON.stringify(row));
            Object.keys(row).forEach((key) => {
                row[key.replace(className + '#', '')] = row[key];
            });
            if (row.attrRawList) {
                const findValue = (key, keyValue) => {
                    return row.attrRawList.find((item) => item.attrName.split('#')[1] === key)?.[keyValue] || '';
                };
                // 所属项目
                projectRef = findValue('holderRef', 'oid');
            }
        }
        let configQuery = config?.query || {};
        let appName = config?.appName; // 指定跳转到的应用名称
        let defaultQuery = {};
        if (openType === 'list') {
            defaultQuery = {
                pid: $route.query.pid || '' // 项目oid
            };
        } else if (openType === 'create') {
            defaultQuery = {
                pid: $route.query.pid || '', // 项目oid
                createType: '', // 创建的类型，如：related（代表问题、风险等关联时创建）、portal（代表在工作台的我的督办的创建）
                relatedOid: (configQuery.createType === 'related' && $route.query?.oid) || '', // createType='related'时关联的主对象oid
                // 来源
                source: JSON.stringify({ value: '', readonly: false }), // 创建页面的“来源”字段默认值与只读配置
                backRouteConfig: JSON.stringify({ query: $route.query, path: $route.path }), // 创建页面回退页面时使用
                appName: ErdcStore.state.route.resources.identifierNo // 创建页面回退页面时使用
            };
        } else if (openType === 'edit') {
            defaultQuery = {
                pid: $route.query.pid || '', // 项目oid
                oid: row.oid || '',
                backRouteConfig: JSON.stringify({ query: $route.query, path: $route.path }), // 创建页面回退页面时使用
                appName: ErdcStore.state.route.resources.identifierNo, // 创建页面回退页面时使用
                handleTaskTitle: i18nMappingObj['edit'] + (row?.[`name`] || ''),
                collectId: $route.params.currentPlanSet || $route.query.collectId || ''
            };
        } else if (openType === 'detail') {
            defaultQuery = {
                pid: $route.query.pid || projectRef || '',
                oid: row.oid || '',
                handleTaskTitle: i18nMappingObj['view'] + (row?.[`name`] || '')
                // componentRefresh: true
            };
        }
        let query = Object.assign(defaultQuery, configQuery);
        // 获取督办任务的path
        let pathObj = getDiscreteTaskPath(openType, appName);
        openPage({
            appName: pathObj.appName,
            routeConfig: {
                path: pathObj.path,
                query
            }
        });
    };
    let getContainerRef = () => {
        const famStore = require('fam:store');
        return famStore.state?.space?.object?.containerRef || '';
    };
    // 查询是否有已经再跑的流程
    let getProcess = (oid) => {
        return new Promise((resolve, reject) => {
            axios({
                url: '/bpm/process/running/' + oid,
                method: 'GET'
            })
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };
    const getCurrentLanguage = function () {
        // 特殊处理国际化
        const lanMap = {
            'zh-CN': 'CN',
            'en-US': 'EN',
            'zh_cn': 'CN',
            'en_us': 'EN'
        };

        let lang = localStorage.getItem('lang_current') ?? '';
        lang = lang ? lanMap[lang] ?? lang : 'zh_cn';
        return lang;
    };

    const languageTransfer = function (i18n) {
        const currentLang = getCurrentLanguage();
        let i18nMappingObj = {};
        _.each(i18n, (value, key) => {
            i18nMappingObj[key] = value[currentLang] ?? value?.['CN'];
        });
        return i18nMappingObj;
    };

    const routeView = (routeName) => {
        return {
            name: routeName,
            template: `<KeepAliveRouterView></keepAliveRouterView>`
        };
    };

    // 获取项目信息
    let getProjectData = (oid) => {
        let className = oid.split(':')[1];
        return new Promise((resolve, reject) => {
            axios({
                url: '/ppm/attr',
                className,
                method: 'GET',
                data: {
                    oid
                }
            })
                .then((resp) => {
                    if (resp.code === '200') {
                        let data = resp.data?.rawData || {};
                        let result = ErdcKit.deserializeAttr(data, {
                            valueMap: {
                                'lifecycleStatus.status': (e, data) => {
                                    return data['lifecycleStatus.status']?.displayName;
                                },
                                'templateInfo.templateReference': (e, data) => {
                                    return data['templateInfo.templateReference'].oid;
                                },
                                'typeReference': (e, data) => {
                                    return data['typeReference']?.oid || '';
                                },
                                'typeRef': (e, data) => {
                                    return data['typeReference']?.oid || '';
                                },
                                'projectManager': ({ users }) => {
                                    return users;
                                },
                                'organizationRef': (e, data) => {
                                    return data['organizationRef']?.oid || '';
                                },
                                'productLineRef': (e, data) => {
                                    return data['productLineRef']?.oid || '';
                                },
                                'timeInfo.scheduledStartTime': (e, data) => {
                                    return data['timeInfo.scheduledStartTime'].displayName;
                                },
                                'timeInfo.scheduledEndTime': (e, data) => {
                                    return data['timeInfo.scheduledEndTime'].displayName;
                                },
                                'timeInfo.actualStartTime': (e, data) => {
                                    return data['timeInfo.actualStartTime'].displayName;
                                },
                                'timeInfo.actualEndTime': (e, data) => {
                                    return data['timeInfo.actualEndTime'].displayName;
                                }
                            }
                        });
                        result.containerRefOid = `OR:${result.containerRef.key}:${result.containerRef.id}`;
                        resolve(result || {});
                    } else {
                        reject();
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    const getGroupData = ({ ref, vm, businessNameKey }) => {
        const tableData = vm.$refs?.[ref]?.$refs?.FamAdvancedTable?.tableData || [];
        const groupIds = [
            ...new Set(
                tableData.map((item) => {
                    return item.groupId;
                })
            )
        ];
        let newTableData = [];
        _.each(groupIds, (groupId) => {
            let result = tableData.filter((item) => item.groupId === groupId);
            let data = {};
            if (result.length >= 1) {
                data = result[0];
                for (let i = 1; i < result.length; i++) {
                    data.children = [...data.children, ...result[i].children];
                }
            }
            data[businessNameKey] = groupId.split(':')[1] + `(${data.children.length})`;
            newTableData.push(data);
        });
        vm.$refs[ref] && (vm.$refs[ref].$refs.FamAdvancedTable.tableData = newTableData);
        // 把展开按钮重新设置成不展开
        vm.$refs[ref].$refs.FamAdvancedTable.$refs.erdTable.allExpanded = false;
    };

    // 业务对象新增&编辑 调用接口更新预计计划开始时间、预计计划结束时间、工期字段
    const fieldsChange = (params) => {
        let { field, oid, formData, nVal, changeFields, fieldMapping } = params;
        // 预计计划开始时间、预计计划结束时间、工期字段修改操作
        let { scheduledStartTime, scheduledEndTime, duration, typeOId } = fieldMapping;
        if (changeFields.indexOf(field) > -1 && (nVal || nVal === 0)) {
            let obj = {
                oid: oid || '',
                typeOId: typeOId || '',
                fieldName: field,
                scheduledStartTime: formData[scheduledStartTime]
                    ? dayjs(formData[scheduledStartTime]).format('YYYY-MM-DD')
                    : '',
                scheduledEndTime: formData[scheduledEndTime]
                    ? dayjs(formData[scheduledEndTime]).format('YYYY-MM-DD')
                    : '',
                duration: formData[duration]
            };
            switch (field) {
                // 计划开始时间
                case scheduledStartTime:
                    // 判断当前字段修改的值不为空，且计划结束时间或工期任一有值
                    if (formData[duration] || formData[scheduledEndTime]) {
                        obj['scheduledStartTime'] = dayjs(nVal).format('YYYY-MM-DD');
                        handleFiledChange(obj, formData, fieldMapping);
                    }
                    break;
                // 计划结束时间
                case scheduledEndTime:
                    // 判断当前字段修改的值不为空，且计划开始时间或工期任一有值
                    if (formData[scheduledStartTime] || formData[duration]) {
                        obj['scheduledEndTime'] = dayjs(nVal).format('YYYY-MM-DD');
                        handleFiledChange(obj, formData, fieldMapping);
                    }
                    break;
                // 工期
                case duration:
                    // 判断当前字段修改的值不为空，且计划开始时间或计划结束时间任一有值
                    if (formData[scheduledStartTime] || formData[scheduledEndTime]) {
                        obj['duration'] = nVal;
                        obj.fieldName = 'planInfo.duration';
                        handleFiledChange(obj, formData, fieldMapping);
                    }
                    break;
                default:
                    break;
            }
        }
    };
    // 计划开始时间、计划结束时间、工期任一值修改
    const handleFiledChange = (data, formData, fieldMapping) => {
        let { duration } = fieldMapping;
        axios({
            url: '/ppm/plan/v1/getTimeAndDuration',
            data: data,
            method: 'get',
            className: 'erd.cloud.ppm.project.entity.Project'
        }).then((res) => {
            if (res.code === '200') {
                formData.timeInfo.scheduledStartTime = res.data['timeInfo.scheduledStartTime'];
                formData.timeInfo.scheduledEndTime = res.data['timeInfo.scheduledEndTime'];
                if (duration === 'duration') {
                    formData.duration = res.data['planInfo.duration'];
                } else if (duration === 'planInfo.duration') {
                    formData.planInfo.duration = res.data['planInfo.duration'];
                }
            }
        });
    };
    // 设置菜单高亮
    const setResourceCode = ({ to, detailPath, next }) => {
        // 获取指定path对应的路由信息
        detailPath = detailPath ? `${to.meta.prefixRoute}/${detailPath}` : `${to.meta.prefixRoute}`;
        let detailRoute = router.resolve(detailPath)?.route || {};
        to.meta.resourceCode = detailRoute.meta?.resourceCode;
        next();
    };

    const getTreeArr = (data = []) => {
        let arr = [];
        const treeDataToArr = function (data = [], parentId = '-1', id = '', level = 0, parentRef = '-1') {
            data.forEach((item) => {
                let levelClassName = 'el-table__row--level-';
                let currentId = id;
                currentId += item.id + '/';
                let currentLevel = level;
                item.level = level;
                item.offsetLeft = level * 16;
                item.trClassName = `${levelClassName}${level}`;
                currentLevel += 1;
                item.pbids = currentId?.substring(0, currentId.length - 1) || '';
                item.parentId = parentId;
                item.parentRef = parentRef;
                item.expanded = false;
                item.itemShow = false;
                // 标记树父节点
                item.needExpend = false;
                // 标记是否存在父级
                item.hasChildren = false;
                const childrenLen = (item.children && item.children.length) || 0;
                if (childrenLen) {
                    // 标记树父节点
                    item.needExpend = true;
                    // 标记是否存在父级
                    item.hasChildren = true;
                }
                let obj = {};
                Object.keys(item).forEach((key) => {
                    if (key !== 'children') {
                        obj[key] = item[key];
                    }
                });
                arr.push(obj);
                if (childrenLen) {
                    treeDataToArr(item.children, item.id, currentId, currentLevel, item.oid);
                }
            });
        };
        treeDataToArr(data);
        return arr;
    };
    const openPage = ({ appName, routeConfig }) => {
        let { path, query } = routeConfig;
        const ErdcStore = require('erdcloud.store');
        const router = require('erdcloud.router');
        const { $router } = router.app;
        ErdcStore.state.route.resources.identifierNo !== appName
            ? window.open(`/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(path, query)}`, appName)
            : $router.push({
                  path,
                  query
              });
    };

    const isSameRoute = (source, target, key) => {
        // 如果除了query.activeName外的其它参数以及path都相同，则认为是同一个路由
        let copySourceQuery = _.pick(source.query, 'pid', key === undefined ? 'oid' : key);
        let copyTargetQuery = _.pick(target.query, 'pid', key === undefined ? 'oid' : key);
        return (
            source.path === target.path &&
            _.isEqual(copySourceQuery, copyTargetQuery) &&
            _.isEqual(source.params, target.params)
        );
    };
    // 设置路由缓存key
    function keepAliveRouteKey(route) {
        return `${route.path}/${route.query.planOid || route.query.oid}`;
    }
    // 文档下载
    const downloadFile = (row) => {
        const famKit = require('erdc-kit');
        let className = ppmStore.state.classNameMapping.document;
        axios({
            url: '/document/content/attachment/list',
            method: 'GET',
            className,
            params: {
                objectOid: row.oid
            }
        }).then((res) => {
            let { id, authorizeCode, storeId } = res.data.attachmentDataVoList.find((item) => item.role === 'PRIMARY') || {};
            famKit.downloadFile(storeId || id, authorizeCode);
        });
    };
    const newDeserializeAttr = (rawData, options = {}) => {
        let temp = {};
        if (Array.isArray(rawData)) {
            rawData.forEach((attr) => {
                temp[attr.attrName] = attr;
            });
        } else {
            temp = rawData;
        }

        const { valueMap = {}, valueKey = 'value', isI18n = false, isSwitch = true } = options;
        let res = {};
        Object.keys(temp).forEach((key) => {
            let val = getValue(temp[key], valueKey, isSwitch);
            if (valueMap && valueMap[temp[key]?.attrName]) {
                val = valueMap[temp[key]?.attrName](temp[key], temp);
            } else if (key.includes('I18nJson')) {
                if (isI18n) {
                    val = getValue(temp[key], valueKey, isSwitch);
                } else {
                    val = {
                        attrName: temp[key]?.attrName,
                        value: getValue(temp[key], valueKey, isSwitch)
                    };
                }
            }
            res[key] = val;
        });
        return res;
        function getValue(value, valueKey, isSwitch) {
            // 获取内部值 && 值为对象 && 对象中有oid
            if (isSwitch && valueKey === 'value' && value?.oid) {
                return value.oid;
            } else {
                return value?.[valueKey];
            }
        }
    };
    /**
     * 获取项目内的所有团队角色
     * @param {String} projectId 项目OID
     * @param {Boolean} treeToTable 多层级的角色树结构是否平铺
     */
    const getContainerTeamRoles = async (projectId, treeToTable = true) => {
        let { data } = await axios({
            url: '/ppm/plan/v1/get/containerTeamRole',
            method: 'GET',
            className: ppmStore.state.classNameMapping.project,
            data: {
                projectId
            }
        });
        data = data || [];
        if (!treeToTable) {
            return data;
        }
        return deepFormatResources(data);
        // 格式化资源角色的数据：tree转table
        function deepFormatResources(dataArr, __level = 0) {
            if (!dataArr?.length) {
                return dataArr;
            }
            let newDataArr = [];
            dataArr?.map((r) => {
                let children = r['children'];
                delete r['children'];
                newDataArr.push({
                    __level,
                    ...r
                });
                // 有子节点
                if (children?.length) {
                    newDataArr = newDataArr.concat(deepFormatResources(children, __level + 1));
                }
            });
            return newDataArr;
        }
    };

    // 修改流程customformJson数据的接口
    const syncCustomFormJson = ({ businessData, processInfos, customFormData }) => {
        let newCustomFormData = $.extend(true, {}, customFormData || { formJson: [] });
        // 防止以后customFormData还会扩展其它属性，因此只修改formJson字段的数据
        newCustomFormData.formJson = businessData || [];
        let bfDataJson = JSON.parse(processInfos.businessFormDataJson);
        bfDataJson.currTaskInfo.baseSubmitTaskDto.customformJson = JSON.stringify(newCustomFormData);
        let params = {
            sessionId: 'BIZ_FORM',
            holderRef: processInfos.pboOId,
            jsonData: JSON.stringify(bfDataJson),
            scope: true
        };
        return axios({
            url: '/bpm/formData/updateByPboid',
            method: 'POST',
            data: params
        });
    };
    // 打开流程页面（发起流程之后）
    const openProcessPage = (vm, row, appName) => {
        return axios({
            url: '/bpm/process/history/' + row.oid,
            method: 'GET'
        }).then((res) => {
            let [processInfo] = res?.data?.processInstances || [{}];
            const { activityId, processInfoTasks, oid: processInstanceOId, processDefinitionKey } = processInfo || {};
            const taskOId = processInfoTasks?.find((item) => item.taskKey === activityId)?.oid || '';
            let { query, path } = vm.$route;
            const route = {
                path,
                query
            };
            // 给返回和提交之后成功回调用
            localStorage.setItem(`${processDefinitionKey}:${taskOId}:backRoute`, JSON.stringify(route));
            if (appName) {
                const erdcKit = require('erdc-kit');
                erdcKit.open(`/container/bpm-resource/workflowActivator/${processInstanceOId}`, {
                    appName,
                    query: {
                        taskDefKey: activityId,
                        taskOId,
                        readonly: false
                    }
                });
            } else {
                vm.$router.push({
                    path: `/container/bpm-resource/workflowActivator/${processInstanceOId}`,
                    query: {
                        taskDefKey: activityId,
                        taskOId,
                        readonly: false
                    }
                });
            }
        });
    };
    return {
        checkHours,
        openDetail,
        getContainerRef,
        getProcess,
        languageTransfer,
        routeView,
        getProjectData,
        getGroupData,
        handleFiledChange,
        fieldsChange,
        setResourceCode,
        getTreeArr,
        openPage,
        isSameRoute,
        keepAliveRouteKey,
        getDiscreteTaskPath,
        openDiscreteTaskPage,
        newDeserializeAttr,
        downloadFile,
        getContainerTeamRoles,
        syncCustomFormJson,
        openProcessPage
    };
});
