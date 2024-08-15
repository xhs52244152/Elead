define(['erdcloud.store', 'erdcloud.kit', 'erdcloud.mfe'], function (erdcloudStore, erdcloudKit) {
    let ELMP = {
        /**
         * 传入文件名和资源包key，返回映射后的资源文件路径
         * @param fileName 文件名(包含路径)
         * @param resourceKey 资源包key
         * @returns {string|*}
         */
        resource: function (fileName, resourceKey, params) {
            if (arguments.length === 1) {
                resourceKey = fileName.replace(/\/?(\S+?)\/(\S+)/, '$1');
                fileName = fileName.replace(/\/?(\S+?)\/(\S+)/, '$2');
            }
            let resourceCustomMapping = erdcloudStore.state.mfe.resourceCustomMapping;
            let resourceMapping = erdcloudStore.state.mfe.resourceMapping;
            if (resourceCustomMapping[resourceKey]) {
                resourceKey = resourceCustomMapping[resourceKey];
            }
            let newPath;

            if (resourceMapping && resourceMapping[resourceKey]) {
                var prefix = resourceMapping[resourceKey];
                if (prefix.lastIndexOf('/') !== prefix.length - 1) {
                    prefix = prefix + '/';
                }
                newPath = prefix + resourceKey + '/' + fileName;
            } else {
                newPath = '/erdc-libs/' + resourceKey + '/' + fileName;
            }
            return erdcloudKit.joinUrl(newPath, params);
        },
        func(filePath) {
            return `/erdc-resource/${filePath}`.replace(/\/\//g, '/');
        }
    };
    window.ELMP = ELMP;
    return ELMP;
});
