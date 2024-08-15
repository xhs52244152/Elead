define(['fam:http'], function (famHttp) {
    'use strict';

    return function () {
        return {
            method: 'multipart',
            context: 'site',
            transValidate: '/file/file/site/storage/v1/trans/validate',
            transUpload: '/file/file/site/storage/v1/trans/upload',
            formUpload: '/file/file/site/storage/v1/upload',
            transFinish: '/file/file/site/storage/v1/trans/${uploadId}/finish',
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
                    options.testChunks = false;
                    target = options.formUpload;
                }

                return target;
            },
            processParams: function (params, file, chunk) {
                const uploader = file.uploader;
                const options = uploader.opts;

                // #1  当文件大于分片大小，进行分片上传
                if (file.size > options.chunkSize) {
                    if (!file.uploadId) {
                        // vm.uploader.opts.target = options.transValidate;
                        return {
                            md5: file.md5 ?? '',
                            partSize: options.chunkSize ?? '',
                            partTotal: file.chunks.length ?? '',
                            appName: options.appName ?? '',
                            bucket: options.bucket ?? '',
                            context: options.context ?? '',
                            contextPath: options.contextPath ?? '',
                            storageType: options.storageType ?? ''
                        };
                    } else {
                        // vm.uploader.opts.target = options.transUpload;
                        // vm.uploader.opts.uploadMethod = 'POST';
                        return {
                            partNum: params.chunkNumber ?? '',
                            uploadId: file.uploadId ?? '',
                            appName: options.appName ?? '',
                            context: options.context ?? '',
                            contextPath: options.contextPath ?? ''
                        };
                    }
                } else {
                    // #2  当文件小于分片大小，直接上传，不进行分片
                    // vm.uploader.opts.target = options.formUpload;
                    return {
                        appName: options.appName ?? '',
                        bizCode: options.bizCode ?? '',
                        bucket: options.bucket ?? '',
                        context: options.context ?? '',
                        contextPath: options.contextPath ?? '',
                        storageType: options.storageType ?? ''
                    };
                }
            },
            finish: function (options, file) {
                const data = {
                    name: file.name,
                    size: file.size,
                    uploadId: file.uploadId,
                    appName: options.appName,
                    bizCode: options.bizCode,
                    context: options.context,
                    contextPath: options.contextPath
                };

                return famHttp({
                    url: `/doc/doc/site/storage/v1/trans/${file.uploadId}/finish`,
                    method: 'PUT',
                    data: data
                });
            },
            checkChunkUploadedByResponse: function (chunk, resp) {
                var data = JSON.parse(resp).data;
                if (!data || !_.isObject(data)) {
                    return true;
                }

                const file = chunk.file;
                if (data.partNums) {
                    file.partNums = data.partNums;
                }
                if (data.uploadId) {
                    file.uploadId = data.uploadId;
                }

                return data.skip || file.partNums.indexOf(chunk.offset + 1) > -1;
            }
        };
    };
});
