require(['/erdc-libs/erdc-app/index.js', '/erdc-app/erdc-library-web/config/init-sdk.js'], function (
    startApp,
    pdmLibraryInit
) {
    startApp({
        appName: 'erdc-library-web',
        appVersion: '__VERSION__',
        beforeCreate() {
            return pdmLibraryInit.beforeCreate();
        },
        beforeMount() {
            return pdmLibraryInit.beforeMount();
        },
        mounted() {
            return pdmLibraryInit.mounted();
        },
        layout: {
            space: {
                listPage: '/library-list/list',
                resources: function (secondaryResources, spaceContext, spaceDetail, parentMenu) {
                    const libraryTemplateSpaceResources = [
                        'library:detail',
                        'libraryPart',
                        'libraryDocument',
                        'libraryBaseline',
                        'library:folder',
                        'library:team',
                        'library:access'
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

                                    // 模板空间二级菜单过滤
                                    if (spaceDetail['templateInfo.tmplTemplated']) {
                                        data = data.filter((item) =>
                                            libraryTemplateSpaceResources.includes(item.identifierNo)
                                        );
                                    }
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
