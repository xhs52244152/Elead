define([
    'vue',
    ELMP.resource('erdc-cbb-components/utils/cbb.js'),
    ELMP.resource('erdc-cbb-components/utils/viewDetails.js'),
    ELMP.resource('erdc-cbb-components/utils/file.js'),
    ELMP.resource('erdc-cbb-components/utils/object.js'),
    ELMP.resource('erdc-cbb-components/store/index.js')
], function (Vue, cbbUtils, viewDetailsUtils, fileUtils, objectUtils) {
    const ErdcHttp = require('erdcloud.http');
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const ErdcRouter = require('erdcloud.router');
    let ElementVue = null;

    const CADWSPort = '23000';
    let CADWS = null;

    /**
     * 继承element弹窗等公用组件
     * **/
    const getElementUI = function () {
        if (!ElementVue) {
            ElementVue = new Vue({
                data() {
                    return {};
                }
            });
        }
        return ElementVue;
    };

    let utils = {
        /**
         *图标颜色
         *@param {Array | Object} attrData  属性数据。表格中取到的原始数据是数组，对象中渠道
         */
        getIconClass(attrData, className) {
            var result = {};

            const iterationInfoStateProp = className ? `${className}#iterationInfo.state` : 'iterationInfo.state';
            const lifecycleStatusProp = className ? `${className}#lifecycleStatus.status` : 'lifecycleStatus.status';
            const stateProp = className ? `${className}#lifecycleStatus.status` : 'state';
            const generalStatusProp = className ? `${className}#generalStatus` : 'generalStatus';

            let iconData = attrData;
            if (Array.isArray(attrData)) {
                iconData = {};
                attrData.forEach((item) => {
                    const attrName = className ? item?.attrName : item?.attrName?.split('#')?.reverse()[0];
                    if (
                        attrName === iterationInfoStateProp ||
                        attrName === lifecycleStatusProp ||
                        attrName === generalStatusProp ||
                        attrName === stateProp
                    ) {
                        iconData[attrName] = item.value;
                    }
                });
            }
            // 检出状态
            if (iconData[iterationInfoStateProp] == 'WORKING' || iconData[stateProp] == 'WORKING') {
                result = {
                    color: '#FCB11E'
                };
            }
            // 已检出
            else if (iconData[iterationInfoStateProp] == 'CHECKED_OUT' || iconData[stateProp] == 'CHECKED_OUT') {
                // 原始版本
                result = {
                    color: 'orange'
                };
            }
            // 检入状态
            else if (iconData[iterationInfoStateProp] == 'CHECKED_IN' || iconData[stateProp] == 'CHECKED_IN') {
                result = {
                    color: '#246DE6'
                };
            }
            // 草稿状态
            if (
                iconData[lifecycleStatusProp] === 'DRAFT' ||
                iconData[generalStatusProp] == 'uploadOnly' ||
                iconData[stateProp] == 'DRAFT'
            ) {
                result = {
                    color: '#8B572A'
                };
            }
            return result;
        },
        // 上下文跳转方法
        handleGoToSpace(data, type) {
            /**
             * 获取上下文信息
             */
            ErdcHttp.get('/fam/attr', {
                data: {
                    oid: data?.containerRef?.oid
                }
            }).then((containerResp) => {
                const holderRefOid = containerResp?.data.rawData?.holderRef.oid;
                /**
                 * 获取上下文对象信息
                 * */
                ErdcHttp.get('/fam/attr', {
                    className: holderRefOid.split(':')[1],
                    data: {
                        oid: holderRefOid
                    }
                }).then(async (containerDetailResp) => {
                    /**
                     * 根据typeName识别跳转路由
                     */
                    const rawData = containerDetailResp.data?.rawData || {};
                    const typeName = rawData?.idKey?.value || rawData?.typeName?.value || '';
                    let targetRouteConfig = {};
                    const query = { pid: holderRefOid, typeOid: rawData?.containerRef?.oid || '' };
                    if (type === 'folder' && data.folderRef?.value) {
                        query.folderId = data.folderRef.value;
                        query.displayName = data.folderRef?.displayName || '';
                    }
                    switch (typeName) {
                        case 'erd.cloud.pdm.core.container.entity.PdmProduct':
                            targetRouteConfig = {
                                appName: 'erdc-product-web',
                                routeConfig: {
                                    query,
                                    // name: type === 'folder' ? 'pdmProductFolder' : 'pdmProductSpace',
                                    path:
                                        type === 'folder'
                                            ? '/space/product-space/folder'
                                            : '/space/product-space/detail'
                                }
                            };
                            break;
                        case 'erd.cloud.pdm.core.container.entity.Library':
                            targetRouteConfig = {
                                appName: 'erdc-library-web',
                                routeConfig: {
                                    query,
                                    // name: type === 'folder' ? 'libraryFolder' : 'librarySpace'
                                    path:
                                        type === 'folder'
                                            ? '/space/library-space/folder'
                                            : '/space/library-space/detail'
                                }
                            };
                            break;
                        // 该类型为library子类型，具体处理逻辑在mpm里面处理后返回
                        case 'erd.cloud.MpmLibrary':
                            try {
                                targetRouteConfig = await ErdcStore?.getters[
                                    'mpmResourceStore/getResourceListRouteConfig'
                                ](data, containerResp?.data, containerDetailResp.data);
                            } catch (e) {}
                            break;
                        default:
                            return;
                    }
                    if (targetRouteConfig) {
                        // 不同应用需要window.open，同应用直接push
                        let targetPath = targetRouteConfig.routeConfig.path;
                        let appName = targetRouteConfig.appName || window.__currentAppName__ || '';
                        if (window.__currentAppName__ === appName) {
                            ErdcRouter.push({
                                path: targetPath,
                                query
                            });
                        } else {
                            // path组装query参数
                            let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                            window.open(url, appName);
                        }
                    }
                });
            });
        },
        // 获取默认文件夹对象
        getFolderByRoute(route, folderList, separator) {
            if (_.isEmpty(route)) return;
            separator = separator || '/';
            const routeArr = route.split(separator);
            if (_.isEmpty(routeArr[0]) && routeArr.length > 1) {
                routeArr.shift();
            }
            let currentFolder = '';

            function filterFolder(str, folderList) {
                return folderList?.find((item) => item.name === str);
            }
            for (let i = 0; i < routeArr.length; i++) {
                currentFolder = filterFolder(
                    routeArr[i],
                    i === 0 ? folderList[0]?.childList : currentFolder?.childList
                );
            }
            return currentFolder;
        },
        // 获取产品库、资源库等上下文内对象编辑页面路由
        getEditRoutePath(typeName, contextClassName) {
            const contextPathConfig = {
                'erd.cloud.pdm.core.container.entity.PdmProduct': '/product',
                'erd.cloud.pdm.core.container.entity.Library': '/library'
            };

            let containerRouteName = contextPathConfig[contextClassName] || '';

            let routesPathConfig = {
                'erd.cloud.cbb.doc.entity.EtDocument': `/space${containerRouteName}/erdc-document/document/edit`,
                'erd.cloud.pdm.part.entity.EtPart': `/space${containerRouteName}/erdc-part/part/edit`,
                'erd.cloud.cbb.baseline.entity.Baseline': `/space${containerRouteName}/erdc-baseline/baseline/edit`,
                'erd.cloud.pdm.epm.entity.EpmDocument': `/space${containerRouteName}/erdc-epm-document/epmDocument/edit`,
                'erd.cloud.cbb.change.entity.EtChangeIssue': `/space${containerRouteName}/erdc-change/change/prEdit`,
                'erd.cloud.cbb.change.entity.EtChangeRequest': `/space${containerRouteName}/erdc-change/change/ecrEdit`,
                'erd.cloud.cbb.change.entity.EtChangeOrder': `/space${containerRouteName}/erdc-change/change/ecnEdit`,
                'erd.cloud.cbb.change.entity.EtChangeActivity': `/space${containerRouteName}/erdc-change/change/ecaEdit`
            };

            let path = routesPathConfig[typeName] || '';

            return path;
        },
        // 通过websocket与CAD通信
        handleClientCAD(action, oid, role, privilege) {
            // 参数处理
            let params = {
                owner: 'browser',
                res: {
                    domain: location.origin,
                    accessToken: localStorage.getItem('accessToken'),
                    action: action,
                    userId: ErdcStore.state?.app?.user?.id,
                    data: {
                        oid: oid,
                        role: role,
                        privilege: privilege
                    }
                }
            };

            let webSocketCAD = function (params, port) {
                var opened = false;

                let vm = getElementUI();
                let { $message } = vm;
                if ('WebSocket' in window) {
                    let loading = vm.$loading() || {};
                    // 打开一个 web socket
                    CADWS = new WebSocket('ws://localhost:' + port + '/echo');

                    // 1秒未响应
                    setTimeout(function () {
                        if (!opened) {
                            CADWS = null;
                            $message('本地Client View未准备好');
                            loading.close();
                        }
                    }, 1000);

                    // Web Socket 已连接上，使用 send() 方法发送数据
                    CADWS.onopen = function () {
                        opened = true;
                        CADWS.send(JSON.stringify(params));
                    };

                    CADWS.onmessage = function (evt) {
                        loading.close();
                        var resp;
                        try {
                            resp = JSON.parse(evt.data); // JSON字符串
                        } catch (e) {
                            resp = null;
                        }

                        let { success, message, res, software } = resp || {};
                        let { action, data } = res || {};

                        // 返回message，提示
                        if (message && !success) return $message.error(message);
                        else message && $message(message);

                        // 返回了应用错误标识，提示
                        if (action === 'APPERROR' && data) return $message.error(data.Errmsg);

                        // 软件安装信息
                        let notInstallSF = Object.keys(software || {}).filter((key) => software[key] === false);
                        if (notInstallSF.length > 0) return $message.error('本地未安装：' + notInstallSF.join('，'));
                    };

                    CADWS.onclose = function () {
                        CADWS = null;
                        loading.close();
                    };
                } else {
                    alert('您的浏览器不支持 WebSocket!');
                }
            };

            if (CADWS && CADWS.url.split(':')[2].split('/')[0] === CADWSPort) {
                CADWS.send(JSON.stringify(params));
            } else {
                webSocketCAD(params, CADWSPort);
            }
        },
        // 获取视图表格当前页的数据
        getViewTableData(vm) {
            let tableData = vm.$refs?.famViewTable?.$refs?.FamAdvancedTable?.tableData;
            return tableData;
        },
        // 获取指定className的类型信息
        getTypeByClassName(className) {
            return new Promise((resolve) => {
                ErdcHttp({
                    url: '/fam/type/typeDefinition/findAccessTypes',
                    data: {
                        typeName: className,
                        containerRef: '',
                        subTypeEnum: 'ALL',
                        accessControl: false
                    },
                    method: 'GET'
                }).then((res) => {
                    resolve(res.data?.find((item) => item.typeName === className) || {});
                });
            });
        },
        ...cbbUtils,
        ...viewDetailsUtils,
        ...fileUtils,
        ...objectUtils
    };

    return {
        ...utils,
        handleGoToSpace: function () {
            // 尝试获取客制方法
            let customFunc = ErdcStore.getters['cbbStore/getCustomUtils']('handleGoToSpace');
            if (_.isFunction(customFunc)) return customFunc(...arguments, utils.handleGoToSpace);
            else return utils.handleGoToSpace(...arguments);
        },
        getEditRoutePath: function () {
            // 尝试获取客制方法
            let customFunc = ErdcStore.getters['cbbStore/getCustomUtils']('getEditRoutePath');
            if (_.isFunction(customFunc)) return customFunc(...arguments, utils.getEditRoutePath);
            else return utils.getEditRoutePath(...arguments);
        }
    };
});
