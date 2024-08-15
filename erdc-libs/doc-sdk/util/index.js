define([
    ELMP.resource('util/attachFileOptions.js', 'doc-sdk'),
    ELMP.resource('util/siteOptions.js', 'doc-sdk'),
], function (getAttachFileOptions, getSiteOptions) {
    'use strict';

    function getOptions(options = {}) {
        const defaultOptions = {
            key: '', // uploader实例的key, 只有在全局上传组件中是必传的。

            transValidate: '', // 预上传
            transUpload: '', // 上传文件分块
            transFinish: '', // 上传完成请求
            formUpload: '', // 不分片直接上传地址
            accept: '',
            callback: function () {},
            finish: function () {}, // 上传完毕后执行

            // 下面的默认参数是vue-simple-uploader所需要的
            testMethod: 'GET',
            uploadMethod: 'POST',
            chunkSize: 10 * 1024 * 1024, //分块大小, 默认10MB
            fileParameterName: 'file', //上传文件时文件的参数名，默认file
            maxChunkRetries: 3, //最大自动失败重试上传次数
            simultaneousUploads: 3, // 并发上传数
            allowDuplicateUploads: true, // 如果文件上传过了，是否允许再次上传
            headers: {}, //在header中添加的验证，请根据实际业务来
            successStatuses: [200, 201, 202],
            permanentErrors: [400, 401, 404, 405, 413, 415, 500, 501, 503, 504],
            // 格式化剩余时间
            parseTimeRemaining: function (timeRemaining, parsedTimeRemaining) {
                return parsedTimeRemaining
                    .replace(/\syears?/, '年')
                    .replace(/\days?/, '天')
                    .replace(/\shours?/, '小时')
                    .replace(/\sminutes?/, '分钟')
                    .replace(/\sseconds?/, '秒');
            }
        };

        let specOptions = {};
        switch (options.type) {
            case 'attach':
                specOptions = getAttachFileOptions();
                break;
            case 'site':
                specOptions = getSiteOptions()
                break;
            default:
                break;
        }

        return $.extend({}, defaultOptions, specOptions, options);
    }

    return {
        getOptions,
    };
});
