define([ELMP.resource('erdc-pdm-app/store/index.js'), 'erdc-kit', 'underscore'], function (store) {
    const ErdcKit = require('erdc-kit');
    const ErdcRouter = require('erdcloud.router');
    const FamHttp = require('erdcloud.http');
    const ErdcStore = require('erdcloud.store');

    // 容器className映射
    const ContainerPathMapping = store.state.containerPathMapping;

    // 应用名称映射
    const AppNameMapping = store.state.appNameMapping;

    // 详情路由名称映射
    const DetailRouteNameMapping = store.state.detailRouteNameMapping;

    function handleGoToDetail() {
        // 尝试获取客制方法
        let customFunc = ErdcStore.getters['cbbStore/getCustomUtils']('goToDetail');
        if (_.isFunction(customFunc)) return customFunc(...arguments, goToDetail);
        else return goToDetail(...arguments);
    }

    /**
     * 通用查看对象详情
     * @param {Object} row
     * @param {Object} customRoute 自定义路由参数
     * @param {String} oidKey 对象oid数据key
     * @param {String} containerRefKey 对象上下文数据key
     * @param {Boolean} isReleationObj 是否为link数据（例如相关对象），是的话，会自动取roleAObjectRef、relationOid等数据
     */
    async function goToDetail(row, customRoute, oidKey, containerRefKey, isReleationObj) {
        // 默认跳转方式
        let skipMode = 'push';
        // 默认值处理
        customRoute = customRoute || {};
        customRoute?.skipMode && (skipMode = customRoute.skipMode);

        oidKey = oidKey || 'oid';
        containerRefKey = containerRefKey || 'containerRef';
        isReleationObj = isReleationObj ?? false;

        // 取对象oid
        let oid = typeof row[oidKey] === 'string' ? row?.[oidKey] : row?.[oidKey]?.value || '';
        if (isReleationObj) {
            // 流程入口取roleAObjectRef，产品、工作台入口取relationOid
            oid = row?.versionOid || row?.roleAObjectRef || row?.relationOid || row?.oid || '';
        }

        const className = oid.split(':')[1] || '';

        // 获取上下文对象pid
        const fetchContainer = () => {
            let defaultContainer = row?.[containerRefKey]?.oid || row?.[containerRefKey];
            const containerRef = row?.attrRawList
                ? ErdcKit.getObjectAttr(row, containerRefKey)?.oid || defaultContainer
                : defaultContainer;

            return new Promise((resolve) => {
                let pid = '';
                fetchContainerApi
                    .call(this, containerRef)
                    .then(async (resp) => {
                        let typeName = '';
                        if (resp.success) {
                            pid = resp?.data?.rawData?.holderRef?.oid || '';
                            let containerInfo = await fetchContainerApi(pid);
                            typeName = containerInfo?.data?.rawData?.typeName?.value || '';
                        }
                        resolve({
                            pid,
                            typeName
                        });
                    })
                    .catch(() => {
                        resolve({ pid });
                    });
            });
        };

        const { pid, typeName } = ErdcRouter.currentRoute?.query?.pid ? await fetchContainer() : {};
        // 取容器className
        const containerClassName = pid ? pid.split(':')[1] : '';
        // 根据容器className，判断跳产品空间还是标准库空间
        const prePath = ContainerPathMapping[typeName] || ContainerPathMapping[containerClassName] || '/portal';

        let targetPath = `${prePath}${DetailRouteNameMapping[className]}`;
        let query = {
            activeName: 'detail',
            pid,
            oid,
            className,
            ...(customRoute?.query || {})
        };

        // 去除路由上空的pid和typeOid
        query = _.omit(query, (value, key) => {
            return ['pid', 'typeOid'].includes(key) && !value;
        });

        // 不同应用需要window.open，同应用直接push
        let appName = AppNameMapping[prePath] || window.__currentAppName__ || '';
        if (window.__currentAppName__ === appName) {
            ErdcRouter[skipMode]({
                path: targetPath,
                query
            });
        } else {
            // path组装query参数
            query.fromAppName = window.__currentAppName__;
            let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
            window.open(url, appName);
        }
    }

    // 获取对象所属容器
    function fetchContainerApi(oid = '') {
        return FamHttp({
            url: '/fam/attr',
            methods: 'get',
            className: oid?.split(':')?.[1],
            params: {
                oid
            }
        });
    }

    return {
        goToDetail: handleGoToDetail
    };
});
