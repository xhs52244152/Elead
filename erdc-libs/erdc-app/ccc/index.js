/**
 * @module Center of Component Control
 * @type {import('./index.d.ts').Component}
 * @author qiuzhanyue
 * @description 组件管控中心，通常用来注册表单、表单设计器、视图的受控组件
 * @export { (component: Component|Array<Component>)=>void } registerComponent - 注册组件
 */
define([
    ELMP.resource('erdc-app/ccc/store.js'),
    ELMP.resource('erdc-components/FamFormDesigner/widgets/wcd.js'),
    'fam:store'
], function (CCCStore, WCD) {
    const _ = require('underscore');
    const FamStore = require('fam:store');

    const registered = [];

    const util = {
        /**
         * 注册组件
         * @param {Component|Array<Component>} component
         */
        registerComponent(component) {
            const components = _.isArray(component) ? component : _.compact([component]);
            return FamStore.dispatch('component/registerComponents', components);
        },
        /**
         * 注册widget组件
         */
        registerWidgets(widgets) {
            return FamStore.dispatch('component/registerWidgets', widgets);
        },
        useWidgetConfigs(
            configs,
            {
                resourceUrl = (name) => ELMP.resource(`erdc-components/FamFormDesigner/configurations/${name}.js`),
                generateConfiguration,
                customize = (name, i) => i
            } = {}
        ) {
            const arr = _.isArray(configs) ? configs : _.compact([configs]);
            const nameArray = _.chain(arr)
                .map((item) => {
                    if (item && typeof item === 'object') {
                        return item.name;
                    }
                    return item;
                })
                .filter((i) => !!i)
                .value();

            return _.map(nameArray, (name) => {
                const desc = WCD[name];
                let component = null;
                if (desc && typeof desc === 'object' && generateConfiguration) {
                    component = generateConfiguration(desc);
                }
                let temp = {
                    name: name.replace(/\//g, '-'),
                    resourceUrl: component ? null : resourceUrl(name),
                    component,
                    props: {},
                    hidden: false
                };
                registered.push(name);

                return customize(name, temp);
            });
        }
    };

    FamStore.registerModule('component', CCCStore);

    return {
        registered,
        registerComponent: util.registerComponent,
        registerWidgets: util.registerWidgets,
        useWidgetConfigs: util.useWidgetConfigs,
        state: FamStore.state.component
    };
});
