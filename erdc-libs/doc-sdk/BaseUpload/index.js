define([
    'vue',
    'vue-simple-uploader',
    ELMP.resource('util/index.js', 'doc-sdk'),
    ELMP.resource('spark-md5.min.js', 'doc-sdk'),
    'text!' + ELMP.resource('BaseUpload/index.html', 'doc-sdk'),
    'css!' + ELMP.resource('BaseUpload/index.css', 'doc-sdk')
], function (Vue, uploader, util, SparkMD5, template) {
    Vue.use(uploader);

    return {
        template,
        props: {
            server: {
                type: String,
                default: ''
            },
            prefix: {
                type: String,
                default: ''
            },
            options: {
                type: Object,
                default() {
                    return {};
                }
            },
            progressBar: {
                type: Object,
                default() {
                    return {
                        show: true,
                        showText: false
                    };
                }
            },
            fileList: Array
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('locale/index.js', 'doc-sdk'),
                i18nMappingObj: {
                    clickUpload: this.getI18nByKey('clickUpload')
                },

                uploader: '',
                attrs: {},
                uploaderOptions: {},
                echoFileList: []
            };
        },
        watch: {
            fileList: {
                deep: true,
                handler(newVal) {
                    if (newVal.length) {
                        this.setEchoFileList(newVal);
                    }
                }
            }
        },
        created() {
            this.getUploaderOptions();
        },
        mounted() {
            this.uploader = this.$refs.fileUploader.uploader;
        },
        methods: {
            setEchoFileList(fileList) {
                this.echoFileList = fileList.filter((file) => {
                    return !file.uploader;
                });
            },
            buildFullPath(url) {
                return this.server + this.prefix + url;
            },
            getUploaderOptions() {
                const { options } = this;

                let uploaderOptions = {};
                if (options.type) {
                    uploaderOptions = util.getOptions(options);
                }
                const tempOptions = {
                    transValidate: this.buildFullPath(uploaderOptions.transValidate),
                    transUpload: this.buildFullPath(uploaderOptions.transUpload),
                    formUpload: this.buildFullPath(uploaderOptions.formUpload),
                    transFinish: this.buildFullPath(uploaderOptions.transFinish)
                };

                uploaderOptions = Object.assign({}, uploaderOptions, tempOptions);
                this.uploaderOptions = uploaderOptions;
            },
            percentage(progress) {
                return Math.floor(progress * 100);
            },
            remove(file) {
                file.cancel();
            },
            computeMD5(file) {
                var fileReader = new FileReader();
                var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
                var currentChunk = 0;
                var chunkSize = 10 * 1024 * 1000;
                var chunks = Math.ceil(file.size / chunkSize);
                var spark = new SparkMD5.ArrayBuffer();
                file.pause();
                loadNext();
                fileReader.onload = (e) => {
                    spark.append(e.target.result);
                    if (currentChunk < chunks) {
                        currentChunk++;
                        loadNext();
                    } else {
                        file.md5 = spark.end();
                        file.resume();
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
            },
            onFileRemove(file) {
                this.$emit('on-remove', file, this.getFileList());
            },
            async onFileSuccess(rootFile, file, response) {
                const options = file.uploader.opts;
                let resp = JSON.parse(response);

                if (resp.success) {
                    if (rootFile.uploadId) {
                        try {
                            // 分块上传合并文件
                            resp = await options.finish(options, file);
                            resp = JSON.parse(response);
                            if (resp.success) {
                                file.fileId = resp.data;
                            }
                        } catch (err) {
                            file.cancel();
                            return;
                        }
                    } else {
                        file.fileId = resp.data;
                    }
                    this.$emit('on-success', file, this.getFileList());
                }
            },
            onFileError(rootFile, file, response, chunk) {
                try {
                    const resp = response ? JSON.parse(response) : response;
                    this.$emit('on-error', resp);
                } catch (error) {}
            },

            /**
             * 计算中使用$refs不是响应式的，因此只能在这里获取全部的fileList
             */
            getFileList() {
                return [].concat(this.echoFileList).concat(this.$refs.fileUploader.fileList);
            },
            echoRemove(file, index) {
                this.echoFileList.splice(index, 1);
                this.onFileRemove(file);
            }
        }
    };
});
