define([ELMP.resource('DocSdk.js', 'doc-sdk')], function (DocSdk) {
    const defaultConfig = {
        prefix: '',
        uploadUrl: '/doc/v1/storage/upload/batch',
        downloadUrl: '/doc/v1/storage/{0}/download',
        downloadPkgUrl: '/doc/v1/storage/zip/download',
        preDownloadUrl: '/doc/v1/storage/pre/auth',
        noAuthUrl: '/doc/v1/storage/noauth/download',
        server: '',
    };

    /**
     * 创建一个DocSdk实例
     */
    function createInstance(defaultConfig) {
        const context = new DocSdk(defaultConfig);

        context.create = function create(instanceConfig) {
            return createInstance(Object.assign({}, defaultConfig, instanceConfig));
        };

        return context;
    }

    const docSdk = createInstance(defaultConfig);

    return docSdk;
});
