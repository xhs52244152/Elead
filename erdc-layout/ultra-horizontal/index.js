define([], function () {
    return {
        init: function () {
            return new Promise(function (resolve) {
                require(['/erdc-layout/ultra-horizontal/route.js', 'TreeUtil'], function (routes, TreeUtil) {
                    TreeUtil.doPreorderTraversal(routes, {
                        every: function (node) {
                            node.meta = node.meta || {};
                            node.meta._layoutPath = true;
                        }
                    });
                    resolve(routes);
                });
            });
        }
    };
});
