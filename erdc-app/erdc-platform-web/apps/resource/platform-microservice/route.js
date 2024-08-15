define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'microServices/applicationManagement',
            name: 'applicationManagement',
            component: ErdcKit.asyncComponent(
                ELMP.resource('platform-microservice/views/ApplicationManagement/index.js')
            )
        },
        {
            path: 'microServices/serviceManagement',
            name: 'serviceManagement',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-microservice/views/ServiceManagement/index.js'))
        }
    ];
});
