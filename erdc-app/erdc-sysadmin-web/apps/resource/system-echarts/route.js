define(['erdcloud.kit'], function (ErdcKit) {
    return [
        // Echarts
        {
            path: 'echarts',
            component: ErdcKit.asyncComponent(ELMP.resource('system-echarts/views/VisualProcess/index.js')),
            name: 'Echarts'
        }
    ];
});
