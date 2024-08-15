define(['fam:http', ELMP.resource('util/index.js', 'doc-sdk')], function (famHttp, util) {
    'use strict';

    class DocSdk {
        constructor(instanceConfig) {
            /**
             * {
             *   prefix: ''，请求的Url前缀
             * }
             */
            this.config = instanceConfig;
        }

        buildFullPath(url) {
            return this.config.server + this.config.prefix + url;
        }

        /**
         * 多文件上传
         *
         * @param option - {files: '上传文件数组', dto: '文件信息', callback: '回调方法', url: '自定义上传路径'}
         */
        upload(option) {
            const paramData = new FormData();
            Array.isArray(option.files) &&
                option.files.forEach((val) => {
                    paramData.append('files', val);
                });
            paramData.append('dto', JSON.stringify(option.dto || {}));

            const url = this.buildFullPath(option.url || this.config.uploadUrl);

            famHttp({
                url: url,
                data: paramData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((resp) => {
                    if (resp.success) {
                        if (option.callback && _.isFunction(option.callback)) {
                            option.callback.call(this, true, resp);
                        }
                    } else {
                        if (option.callback && _.isFunction(option.callback)) {
                            option.callback.call(this, false, resp);
                        }
                    }
                })
                .catch((resp) => {
                    if (option.callback && _.isFunction(option.callback)) {
                        option.callback.call(this, false, resp);
                    }
                });
        }

        /**
         * 下载文件
         * @param url - 下载接口Url
         * @param customFileName - 自定义下载文件名
         */
        downloadFun(url, customFileName) {
            customFileName = customFileName || 'download'; //自定义文件名

            url = this.buildFullPath(url);

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';

            var headers = window.ELCONF.getDefaultAjaxHeaders();
            if (!_.isEmpty(headers)) {
                $.each(headers, function (key, val) {
                    xhr.setRequestHeader(key, val);
                });
            }
            const tenantId = window.encodeURIComponent(JSON.parse(localStorage.getItem('tenantId')) || '');
            if (tenantId) {
                xhr.setRequestHeader('Tenant-Id', tenantId);
            }

            xhr.setRequestHeader(
                'Accept',
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
            );

            xhr.onloadend = function () {
                let response = this.response;

                const reader = new FileReader();
                //读取blob中的内容转成Text，尝试parse成JSON，如果能parse成JSON则是没有正确返回文件
                reader.addEventListener('loadend', function (e) {
                    try {
                        const data = e.srcElement.result;
                        const resJSON = JSON.stringify(JSON.parse(data), null, 4);
                        response = new Blob([resJSON], { type: 'Application/json' });
                        download();
                    } catch (error) {
                        download();
                    }
                });
                reader.readAsText(response);

                function download() {
                    var contentType = xhr.getResponseHeader('content-type');
                    var fileName = '';

                    try {
                        var regMatch = xhr
                            .getResponseHeader('Content-Disposition')
                            .match(/(filename=(.*))(?=;)|(filename=(.*))$/);
                        fileName = regMatch[2] || regMatch[4] || 'download.' + contentType; //文件名乱码
                    } catch (e) {
                        fileName = xhr.getResponseHeader('fileName') || '';
                    }

                    fileName = fileName.replace(/"/g, '');
                    const name = decodeURI(fileName) || customFileName;

                    if (name && window.URL && window.URL.createObjectURL) {
                        const link = document.createElement('a');
                        link.style.display = 'none';
                        link.download = name.trim();
                        link.href = URL.createObjectURL(response);
                        link.click();
                    }
                }
            };
            xhr.onerror = function () {};
            xhr.send(null);
        }

        /**
         * 下载
         *
         * @param id - 文件Id
         * @param url - 下载接口地址
         */
        download(id, url) {
            url = this.buildFullPath(url || this.config.downloadUrl);
            (url = url), id;
            this.downloadFun(url, null);
        }

        /**
         * 打包下载
         *
         * @param ids - 文件Id数组
         * @param url - 下载接口地址
         */
        downloadPackage(ids, url) {
            url = this.buildFullPath(url || this.config.downloadPkgUrl);
            url = url + '?ids=' + ids;
            this.downloadFun(url, null);
        }

        /**
         * 批量删除
         * @param option - { ids: '文件Id数组', callback: '回调' }
         */
        delete(option) {
            const url = this.buildFullPath(option.url);
            famHttp({
                url: url,
                method: 'DELETE',
                data: JSON.stringify(option.ids),
                headers: {
                    contentType: 'application/json;charset=utf-8'
                }
            })
                .then((resp) => {
                    if (resp.success) {
                        if (option.callback && _.isFunction(option.callback)) {
                            option.callback.call(this, true, resp);
                        }
                    } else {
                        if (option.callback && _.isFunction(option.callback)) {
                            option.callback.call(this, false, resp);
                        }
                    }
                })
                .catch((resp) => {
                    if (option.callback && _.isFunction(option.callback)) {
                        option.callback.call(this, false, resp);
                    }
                });
        }

        /**
         * 上传UI组件
         *
         * @param options - { params: '参数方法', callback: '上传回调事件',
         * simultaneousUploads: '上传进程数', fileParameterName: '文件传参名称', chunkSize: '分块大小，也是表单上传和断点续传方式的边界值' }
         */
        startUpload(options) {
            if (options.type) {
                options = util.getOptions(options);
            }

            const tempOptions = {
                transValidate: this.buildFullPath(options.transValidate),
                transUpload: this.buildFullPath(options.transUpload),
                formUpload: this.buildFullPath(options.formUpload),
                transFinish: this.buildFullPath(options.transFinish)
            };

            options = Object.assign({}, options, tempOptions);

            require([ELMP.resource('uploader.js', 'doc-sdk')], function (module) {
                module.upload(options);
            });
        }

        preDownload(id, cb, url) {
            const self = this;

            url = this.buildFullPath(url || this.config.preDownloadUrl);
            famHttp({
                url: url,
                method: 'POST',
                data: {
                    id: id
                },
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            }).then((resp) => {
                if (resp.success && _.isFunction(cb)) {
                    cb.call(self, resp.res.data);
                }
            });
        }

        downloadNoAuth(id, url) {
            this.preDownload(id, function (token) {
                if (window.URL && window.URL.createObjectURL) {
                    var link = document.createElement('a');

                    url = this.buildFullPath(url || this.config.noAuthUrl);
                    link.href = window.location.protocol
                        .concat('//')
                        .concat(window.location.host)
                        .concat(ELMP.url(url))
                        .concat('?token=')
                        .concat(encodeURIComponent(token));
                    //Dispatching click event.
                    var event = document.createEvent('MouseEvents');
                    event.initMouseEvent(
                        'click',
                        true,
                        false,
                        window,
                        0,
                        0,
                        0,
                        0,
                        0,
                        false,
                        false,
                        false,
                        false,
                        0,
                        null
                    );
                    link.dispatchEvent(event);
                }
            });
        }
    }

    return DocSdk;
});
