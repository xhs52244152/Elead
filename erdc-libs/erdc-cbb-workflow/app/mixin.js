define(['erdc-kit', 'underscore'], function () {
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    // 容器className映射
    const ContainerPathMapping = {
        'erd.cloud.pdm.core.container.entity.PdmProduct': '/space/product',
        'erd.cloud.foundation.core.container.entity.Library': '/space/library', // 貌似后端类型有改过
        'erd.cloud.pdm.core.container.entity.Library': '/space/library'
    };

    // 应用名称映射
    const AppNameMapping = {
        '/space/library': 'erdc-library-web',
        '/space/product': 'erdc-product-web',
        '/portal': 'erdc-portal-web'
    };

    // 详情路由名称映射
    const DetailRouteNameMapping = {
        'erd.cloud.cbb.doc.entity.EtDocument': '/erdc-document/document/detail',
        'erd.cloud.pdm.part.entity.EtPart': '/erdc-part/part/detail',
        'erd.cloud.pdm.epm.entity.EpmDocument': '/erdc-epm-document/epmDocument/detail',
        'erd.cloud.cbb.change.entity.EtChangeIssue': '/erdc-change/change/prDetail',
        'erd.cloud.cbb.change.entity.EtChangeRequest': '/erdc-change/change/ecrDetail',
        'erd.cloud.cbb.change.entity.EtChangeOrder': '/erdc-change/change/ecnDetail',
        'erd.cloud.cbb.change.entity.EtChangeActivity': '/erdc-change/change/ecaDetail'
    };

    return {
        methods: {
            // 查看对象详情
            async viewDetails(row, customRoute) {
                // 默认跳转方式
                let skipMode = 'push';
                // 默认值处理
                customRoute = customRoute || {};
                customRoute?.skipMode && (skipMode = customRoute.skipMode);

                // 获取上下文对象pid
                const fetchContainer = () => {
                    const [{ oid: containerRef }] = _.filter(row?.attrRawList, (item) => {
                        return item?.attrName?.split('#')?.reverse()[0] === 'containerRef';
                    }) || [{ oid: '' }];

                    return new Promise((resolve) => {
                        let pid = '';
                        this.fetchContainer(containerRef)
                            .then((resp) => {
                                if (resp.success) {
                                    pid = resp?.data?.rawData?.holderRef?.oid || '';
                                }
                                resolve(pid);
                            })
                            .catch(() => {
                                resolve(pid);
                            });
                    });
                };

                const pid = this.$route.query?.pid ? await fetchContainer() : '';

                const oid = row?.oid || '';

                const className = row?.idKey || row?.oid?.split('#')?.reverse()[0] || '';

                const containerClassName = pid ? pid.split(':')[1] : '';
                // 根据容器className，判断跳产品空间还是标准库空间
                const prePath = ContainerPathMapping[containerClassName] || '/portal';

                let targetPath = `${prePath}${DetailRouteNameMapping[className]}`;
                let query = {
                    activeName: 'detail',
                    pid,
                    oid,
                    className,
                    backButton: true
                };

                // 不同应用需要window.open，同应用直接push
                let appName = AppNameMapping[prePath] || window.__currentAppName__ || '';
                if (window.__currentAppName__ === appName) {
                    this.$router[skipMode]({
                        path: targetPath,
                        query,
                        ...(customRoute?.query || {})
                    });
                } else {
                    // path组装query参数
                    let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                    window.open(url, appName);
                }
            },
            // 获取对象所属容器
            fetchContainer(oid = '') {
                let className = oid.split(':')?.[1];
                return this.$famHttp({
                    url: '/fam/attr',
                    methods: 'get',
                    className,
                    params: {
                        oid
                    }
                });
            },
            // 查询并更新评审对象信息-用于tab切换时更新
            updateReviewObject(initData) {
                let processInfos = this.$attrs['process-infos'];
                let taskInfos = this.$attrs['task-infos'];
                const className = this.$store.getters['bpmPartial/getResourceClassName']({
                    processDefinitionKey: processInfos.processDefinitionKey,
                    activityId: taskInfos.taskDefinitionKey
                });

                return new Promise((resolve) => {
                    this.$famHttp({
                        url: `/bpm/workflow/findformdata/bypobandnodekey`,
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        className,
                        data: {
                            actionName: this.$store.getters.className('pbo'),
                            pboOid: processInfos.pboOId,
                            sessionId: taskInfos.taskDefinitionKey,
                            processDefinitionId: processInfos.processDefinitionId,
                            taskId: taskInfos.id,
                            executionId: processInfos.oid
                        }
                    }).then((resp) => {
                        // 匹配更新评审对象
                        let remoteData = resp.data.businessForm.reviewItemDtos;
                        let currentData = ErdcKit.deepClone(initData);
                        currentData.forEach((item) => {
                            let matchData = remoteData.find((it) => it.masterRef.value === item.masterRef);
                            if (matchData) {
                                item.attrRawList = Object.keys(matchData).reduce((attrs, key) => {
                                    item[key] = matchData[key].oid || matchData[key].value;
                                    attrs.push(matchData[key]);
                                    return attrs;
                                }, []);
                            }
                        });

                        resolve(ErdcKit.deepClone(currentData));
                    });
                });
            }
        }
    };
});
