define([], function () {
    return function useConfig(next) {
        // 创建、编辑表单配置，操作菜单事件处理配置注册
        require([
            'fam:store',
            ELMP.func('erdc-ppm-work-hour/app/config/menu-actions.js')
        ], (store, menuActions) => {
            // 菜单处理注册
            store.dispatch('registerActionMethods', menuActions);

            next && next();
        });
    };
});
