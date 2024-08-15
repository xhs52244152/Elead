define([], function () {
    'use strict';

    /**
     * TODO: 因为分片上传的代码最初是用在企业网盘中的，因此默认值以及默认处理流程都是根据企业网盘的接口
     * 处理流程来的。为了保持兼容性，因此这里保持了当初的处理流程。原代码保存在./tempUpload.js
     */
    function getErdCloudOptions() {
        return {
            transValidate: '/doc/v1/storage/trans/validate',
            transUpload: '/doc/v1/storage/trans/upload',
            transFinish: '/doc/v1/storage/trans/${uploadId}/finish',
            formUpload: '/doc/v1/storage/upload',
            target: function (file) {
                const options = file.uploader.opts;

                let target = '';
                // #1  当文件大于分片大小，进行分片上传
                if (file.size > options.chunkSize) {
                    if (!file.uploadId) {
                        target = options.transValidate;
                    } else {
                        target = options.transUpload;
                    }
                } else {
                    target = options.formUpload;
                }

                return target;
            },
            processParams: function (params, file, chunk) {
                const uploader = file.uploader;
                const options = uploader.opts;

                var dto = {};
                // #1  当文件大于分片大小，进行分片上传
                if (file.size > options.chunkSize) {
                    if (!file.uploadId) {
                        return {
                            md5: file.md5,
                            partSize: options.chunkSize,
                            partTotal: file.chunks.length
                        };
                    } else {
                        return {
                            partNum: params.chunkNumber,
                            uploadId: file.uploadId
                        };
                    }
                } else {
                    // #2  当文件小于分片大小，直接上传，不进行分片
                    // uploader.opts.target = options.formUpload;
                    if (_.isFunction(options.params)) {
                        dto = options.params();
                    }
                    return {
                        dto: JSON.stringify(dto)
                    };
                }
            },
            finish: function (options, file) {
                const data = file.params;
                data.name = file.name;
                data.size = file.size;
                data.contentType = file.fileType;
                return $.el.put({
                    url: ErdcKit.template(options.transFinish, { uploadId: file.uploadId }),
                    data: data
                });
            },
            checkChunkUploadedByResponse: function (chunk, resp) {
                var data = JSON.parse(resp).res.data;
                if (!data || !_.isObject(data) || JSON.stringify(data) === '{}') {
                    return true;
                }
                chunk.file.uploadId = data.uploadId;
                return data.skip || data.partNums.indexOf(chunk.offset + 1) > -1;
            }
        };
    }

    function getOptions(options) {
        const defaultOptions = {
            key: '', // uploader实例的key

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
            chunkSize: 10 * 1024 * 1024, //分块大小
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

        const erdCloudOptions = getErdCloudOptions();

        return $.extend({}, defaultOptions, erdCloudOptions, options);
    }

    return {
        getOptions
    };
});
