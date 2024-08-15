define(['erdcloud.kit', 'erdcloud.store', ELMP.resource('common-page/store.js')], function (
    ErdcKit,
    store,
    commonPageStore
) {
    const getObjectTitle = function (prefix) {
        const object = store?.state?.commonPageStore?.object || {};
        const nameI18nJson = object.rawData?.nameI18nJson?.value || {
            zh_cn: object?.rawData?.displayName?.value || object?.rawData?.name?.value || '',
            en_us: object?.rawData?.displayName?.value || object?.rawData?.name?.value || ''
        };

        return (
            ErdcKit.getParam('title') ||
            Object.keys(nameI18nJson).reduce((prev, key) => {
                prev[key] = [prefix, nameI18nJson[key]].filter(Boolean).join(' - ');
                return prev;
            }, {})
        );
    };

    store.registerModule('commonPageStore', commonPageStore);

    return [
        {
            path: 'list',
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/ListPage/index.js')),
            meta: {
                noAuth: true,
                keepAlive: false
            }
        },
        {
            path: 'info',
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            meta: {
                noAuth: true,
                keepAlive: false,
                title() {
                    return getObjectTitle('详情 - ');
                }
            }
        }
    ];
});
