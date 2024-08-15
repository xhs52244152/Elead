define([
    'vue',
    'vue-simple-uploader',
    ELMP.resource('spark-md5.min.js', 'doc-sdk'),
    'text!' + ELMP.resource('upload/upload.html', 'doc-sdk'),
    'css!' + ELMP.resource('upload/upload.css', 'doc-sdk')
], function (Vue, uploader, SparkMD5, template) {
    Vue.use(uploader);

    return {
        template,
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('locale/index.js', 'doc-sdk'),
                i18nMappingObj: {
                    noFiles: this.getI18nByKey('暂无待上传文件'),
                    selectDoc: this.getI18nByKey('选择文件'),
                    close: this.getI18nByKey('关闭'),
                    expand: this.getI18nByKey('展开'),
                    fold: this.getI18nByKey('折叠'),
                    fileTransfer: this.getI18nByKey('文件传输')
                },

                panelShow: true, // 上传面板显示
                collapse: false, // 上传面板折叠

                uploadManager: {},
                attrs: {},

                fileStatusText: {
                    success: '上传成功',
                    error: '上传出错',
                    uploading: '上传中',
                    paused: '已暂停',
                    waiting: '等待中'
                },

                fileList: []
            };
        },
        // mounted() {
        //     this.$emit('mounted');
        // },
        methods: {
            useUploader(options = {}) {
                if (!options.key) {
                    return;
                }

                const { uploadManager } = this;
                if (!uploadManager[options.key]) {
                    this.$set(uploadManager, options.key, {
                        uploaderOptions: options
                    });
                }

                this.panelShow = true;
                this.collapse = false;
                this.$nextTick(function () {
                    let btn = this.$refs[`uploadBtn-${options.key}`];
                    btn = btn && btn[0];
                    if (btn) {
                        // <upload-btn>下Input元素是动态创建的。
                        this.$nextTick(() => {
                            btn.$el.dispatchEvent(new MouseEvent('click'));
                        });
                    }
                });
            },

            computeMD5(file) {
                var fileReader = new FileReader();
                var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
                var currentChunk = 0;
                var chunkSize = 10 * 1024 * 1000;
                var chunks = Math.ceil(file.size / chunkSize);
                var spark = new SparkMD5.ArrayBuffer();
                // 文件状态设为"计算MD5"
                this.statusSet(file.id, 'md5');
                file.pause();
                loadNext();
                fileReader.onload = (e) => {
                    spark.append(e.target.result);
                    if (currentChunk < chunks) {
                        currentChunk++;
                        loadNext();
                        // 实时展示MD5的计算进度
                        this.$nextTick(() => {
                            $(`.myStatus_${file.id}`).text(
                                '文件扫描中 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%'
                            );
                        });
                    } else {
                        file.md5 = spark.end();
                        file.resume();
                        this.statusRemove(file.id);
                    }
                };
                fileReader.onerror = function () {
                    $.msg.tips(`文件${file.name}读取出错，请检查该文件`);
                    file.cancel();
                };
                function loadNext() {
                    let start = currentChunk * chunkSize;
                    let end = start + chunkSize >= file.size ? file.size : start + chunkSize;
                    fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
                }
            },
            /**
             * 新增的自定义的状态: 'md5'
             * @param id
             * @param status
             */
            statusSet(id, status) {
                var statusMap = {
                    md5: {
                        text: '文件扫描中',
                        bgc: '#e2eeff'
                    }
                };
                this.$nextTick(() => {
                    $(`<p class="myStatus_${id}"></p>`)
                        .appendTo(`.file_${id} .uploader-file-status`)
                        .css({
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            right: '0',
                            bottom: '0',
                            zIndex: '1',
                            backgroundColor: statusMap[status].bgc
                        })
                        .text(statusMap[status].text);
                });
            },
            statusRemove(id) {
                this.$nextTick(() => {
                    $(`.myStatus_${id}`).remove();
                });
            },
            callback(options, result, resp, file) {
                if (options.callback && _.isFunction(options.callback)) {
                    options.callback.call(this, result, resp, file);
                }
            },
            onFileAdded(file) {
                const uploader = file.uploader;
                const options = uploader.opts;

                const tenantId = window.encodeURIComponent(JSON.parse(localStorage.getItem('tenantId')) || '');
                uploader.opts.headers = $.extend({}, uploader.opts.headers, window.ELCONF.getDefaultAjaxHeaders(), {
                    'Tenant-Id': tenantId
                });

                if (!uploader.opts.headers.appId) {
                    uploader.opts.headers.appId = window.ELCONF.appId;
                }
                uploader.opts.testChunks = file.size > options.chunkSize;
                this.panelShow = true;
                this.computeMD5(file);
                file.params = {};
                if (_.isFunction(options.params)) {
                    file.params = options.params();
                }

                this.getFileList();
            },
            onFileRemove() {
                this.getFileList();
            },
            onFileProgress(rootFile, file, chunk) {},
            async onFileSuccess(rootFile, file, response, chunk) {
                const options = file.uploader.opts;

                var resp = JSON.parse(response);
                var self = this;

                if (resp.success && resp.code === '200') {
                    if (rootFile.uploadId) {
                        try {
                            // 分块上传合并文件
                            await options.finish(options, file);
                            self.callback(options, true, resp, file);
                        } catch (err) {
                            file.cancel();
                            return self.callback(options, false, err, file);
                        }
                    }
                } else {
                    file.cancel();
                    self.callback(options, false, resp, file);
                }
            },
            onFileError(rootFile, file, response, chunk) {
                const options = file.uploader.opts;

                try {
                    const resp = response ? JSON.parse(response) : response;
                    this.callback(options, false, resp, file);
                } catch (error) {}
            },

            fileListShow() {
                this.collapse = !this.collapse;
            },

            close() {
                var flag = true;
                var $status = $('.uploader-file-status > span:first-child', '.uploader.uploader-app');
                $.each($status, function (index, item) {
                    if (_.contains(['上传中', '已暂停', '等待中'], $(item).text().trim())) {
                        flag = false;
                        return false;
                    }
                });

                if (!flag) {
                    $.msg.confirm('有文件还未完成上传，关闭将取消上传，确认关闭？', () => {
                        this.cancelAllUpload();
                        this.panelShow = false;
                    });
                } else {
                    this.cancelAllUpload();
                    this.panelShow = false;
                }
            },

            cancelAllUpload() {
                this.$refs.uploader?.forEach((item) => {
                    item.uploader.cancel();
                });
            },
            /**
             * 计算中使用$refs不是响应式的，因此只能在这里获取全部的fileList
             */
            getFileList() {
                this.fileList = this.$refs.uploader?.reduce((pre, uploader) => {
                    return pre.concat(uploader.uploader.fileList);
                }, []);
            }
        }
    };
});
