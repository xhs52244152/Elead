define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'application',
            name: 'application',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-mfe/views/application/index.js'))
        },
        {
            path: 'resource',
            name: 'resource',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-mfe/views/resource/index.js'))
        },
        {
            path: 'layoutAndTheme',
            name: 'layoutAndTheme',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-mfe/views/layoutAndTheme/index.js'))
        },
        {
            path: 'thirdParty',
            name: 'thirdParty',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-mfe/views/thirdParty/index.js'))
        },
        {
            path: 'help',
            name: 'help',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-mfe/views/help/index.js'))
        },
        {
            path: 'publicResource',
            name: 'publicResource',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-mfe/views/publicResource/index.js'))
        }
    ];
});
