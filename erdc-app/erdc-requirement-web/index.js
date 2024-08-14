require(['/erdc-libs/erdc-app/index.js'], function (startApp) {
    startApp({
        appName: 'erdc-requirement-web',
        appVersion: window.location.hostname === 'localhost' ? '__LOCAL__' : '__VERSION__',
        beforeCreate() {},
        mounted: function () {
            document.querySelector('#global-loading').style.display = 'none';
        },
        layout: {
            space: {
                listPage: '/requirement-list/require/list',
                resources: function (secondaryResources, spaceContext, spaceDetail, parentMenu) {
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
                                    resolve(data);
                                })
                                .catch(reject);
                        });
                    });
                }
            }
        }
    });
});
