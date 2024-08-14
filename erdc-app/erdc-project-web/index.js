require(['/erdc-libs/erdc-app/index.js'], function (startApp) {
    startApp({
        appName: 'erdc-project-web',
        appVersion: window.location.hostname === 'localhost' ? '__LOCAL__' : '__VERSION__',
        beforeCreate() {},
        beforeMount() {
            return new Promise((resolve) => {
                require([ELMP.resource('ppm-app/index.js')], function (startPpmApp) {
                    const ErdcStore = require('erdcloud.store');
                    const ErdcKit = require('erdcloud.kit');

                    let ps = [];
                    ps.push(startPpmApp());

                    // 注册通用表单配置
                    // ps.push(
                    //     new Promise((resolve) => {
                    //         require(['./apps/config/common-page-config.js'], (configsAsync) => {
                    //             configsAsync.then((configs) => {
                    //                 let asynchronousQueueList = Object.keys(configs).map((className) => {
                    //                     return ErdcStore.dispatch('infoPage/addClassNameConfig', {
                    //                         className,
                    //                         config: configs[className]
                    //                     });
                    //                 });
                    //                 Promise.all(asynchronousQueueList).then(() => {
                    //                     resolve();
                    //                 });
                    //             });
                    //         });
                    //     })
                    // );

                    // // 注册全局按钮事件
                    // ps.push(
                    //     new Promise((resolve) => {
                    //         require(['./apps/config/menu-actions.js'], (actionsAsync) => {
                    //             actionsAsync.then((actions) => {
                    //                 ErdcStore.dispatch('registerActionMethods', actions).then(() => {
                    //                     resolve();
                    //                 });
                    //             });
                    //         });
                    //     })
                    // );

                    Promise.all(ps).then(() => {
                        resolve();
                    });
                });
            });
        },
        mounted: function () {
            document.querySelector('#global-loading').style.display = 'none';
        },
        layout: {
            space: {
                listPage: '/project-list',
                resources(secondaryResources, spaceContext, spaceDetail, parentMenu) {
                    const projectTemplateSpaceResources = [
                        'projectInfo',
                        'projectTeam',
                        'planList',
                        'projectFolder',
                        'taskList'
                    ];

                    return new Promise((resolve, reject) => {
                        require(['fam:http', 'TreeUtil'], function (axios, TreeUtil) {
                            axios
                                .get('/fam/listByParentKey', {
                                    data: {
                                        className: 'erd.cloud.foundation.core.menu.entity.Resource',
                                        appNames: spaceContext.appName,
                                        containerRef: spaceContext.oid || '',
                                        isGetLinkCount: false,
                                        parentKey: parentMenu.oid
                                    }
                                })
                                .then(({ data }) => {
                                    TreeUtil.doPreorderTraversal(data, {
                                        childrenField: 'childList',
                                        every: function (node) {
                                            node.childList && (node.children = node.childList);
                                        }
                                    });
                                    // 项目模板跳转时进行过滤
                                    if (spaceDetail['templateInfo.tmplTemplated']) {
                                        parentMenu.displayName = '业务管理-项目模板';
                                        parentMenu.name = '业务管理-项目模板';
                                        data = data.filter((item) =>
                                            projectTemplateSpaceResources.includes(item.identifierNo)
                                        );
                                    }
                                    resolve(data);
                                })
                                .catch(reject);
                        });
                        // resolve(secondaryResources);
                    });
                }
            }
        }
    });
});
