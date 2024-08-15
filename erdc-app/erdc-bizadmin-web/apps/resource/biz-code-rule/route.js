define(['erdcloud.kit'], function (ErdcloudKit) {
    return {
        path: '',
        name: 'bizCodeRule',
        component: ErdcloudKit.asyncComponent(ELMP.resource('biz-code-rule/index.js'))
    };
});
