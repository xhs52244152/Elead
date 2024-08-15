define(['underscore', ELMP.resource('erdc-app/ccc/index.js')], function (_, CCC) {
    // Fam出厂自带的容器
    const CONTAINERS = ['FamErdTabs', 'FamClassificationTitle'];

    // 是否已注册
    let registered = false;

    function init() {
        if (registered) {
            return;
        }
        CCC.registerComponent(
            _.map(CONTAINERS, (name) => {
                return {
                    definition: {
                        name,
                        resourceUrl: ELMP.resource(`erdc-components/FamFormDesigner/containers/${name}/index.js`),
                        sync: false
                    }
                };
            })
        );
        registered = true;
    }

    return {
        init: init
    };
});
