define(['erdcloud.kit'], function(ErdcKit) {
    function broadcast(componentName, eventName, params) {
        this.$children.forEach(child => {
            var name = child.$options.componentName;

            if (name === componentName) {
                child.$emit.apply(child, [eventName].concat(params));
            } else {
                broadcast.apply(child, [componentName, eventName].concat([params]));
            }
        });
    }

    return {
        methods: {
            dispatch(componentName, eventName, params) {
                let parent = this.$parent || this.$root;
                let name = parent.$options.componentName;

                while (parent && (!name || !ErdcKit.isSameComponentName(name, componentName))) {
                    parent = parent.$parent;

                    if (parent) {
                        name = parent.$options.componentName;
                    }
                }
                if (parent) {
                    parent.$emit.apply(parent, [eventName].concat(params));
                }
            },
            broadcast(componentName, eventName, params) {
                broadcast.call(this, componentName, eventName, params);
            }
        }
    };
});
