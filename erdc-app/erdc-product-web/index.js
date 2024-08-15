require(['/erdc-libs/erdc-app/index.js', '/erdc-app/erdc-product-web/config/init-sdk.js'], function (
    startApp,
    pdmProductInit
) {
    startApp({
        appName: 'erdc-product-web',
        appVersion: '__VERSION__',
        beforeCreate() {
            return pdmProductInit.beforeCreate();
        },
        beforeMount() {
            return pdmProductInit.beforeMount();
        },
        mounted: function () {
            return pdmProductInit.mounted();
        },
        layout: {
            space: {
                listPage: '/product-list/list',
                resources: function (secondaryResources, spaceContext, spaceDetail, parentMenu) {
                    const productTemplateSpaceResources = [
                        'pdm:product:detail',
                        'ProductPart',
                        'ProductDocument',
                        'pdm:product:baseline',
                        'pdm:product:folder',
                        'pdm:product:team',
                        'pdm:product:access'
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
                                            productTemplateSpaceResources.includes(item.identifierNo)
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
