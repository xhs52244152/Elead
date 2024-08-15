define([
    'text!' + ELMP.resource('erdc-components/FamUpload/index.html'),
    'erdc-kit',
    ELMP.resource('erdc-components/FamUpload/spark-md5.min.js'),
    'css!' + ELMP.resource('erdc-components/FamUpload/style.css')
], function (template, utils, SparkMD5) {
    const cachedData = {};
    // 超出此大小的文件视为大文件，自动采用分片上传
    let BIG_FILE_SIZE = 1024 * 1024 * 100;
    let DEFAULT_CHUNK_SIZE = 1024 * 1024 * 10;
    try {
        BIG_FILE_SIZE = new Function(`return ${window.ELCONF.UPLOADER?.BIG_FILE_SIZE || BIG_FILE_SIZE}`)();
        DEFAULT_CHUNK_SIZE = new Function(
            `return ${window.ELCONF.UPLOADER?.DEFAULT_CHUNK_SIZE || DEFAULT_CHUNK_SIZE}`
        )();
    } catch (e) {
        // do nothing
    }

    let defaultActionClassName = 'erd.cloud.site.console.file.entity.FileInfo';

    return {
        template: template,
        components: {
            FamShowTooltip: utils.asyncComponent(ELMP.resource('erdc-components/FamShowTooltip/index.js'))
        },
        props: {
            value: {
                type: String | Array,
                default() {
                    return '';
                }
            },
            fileList: {
                type: Array,
                default() {
                    return [];
                }
            },
            showFileList: {
                type: Boolean,
                default: true
            },
            requestHeader: {
                type: Object,
                default() {
                    return {
                        Authorization: localStorage.getItem('accessToken'),
                        'Tenant-Id': window.encodeURIComponent(JSON.parse(localStorage.getItem('tenantId')) || '')
                    };
                }
            },
            data: {
                type: Object,
                default() {
                    return {};
                }
            },
            tips: {
                type: String,
                default: ''
            },
            tipsClass: {
                type: String,
                default: ''
            },
            action: String,
            /**
             * 分块上传的配置，包括分块上传接口、文件预上传接口、分块文件上传完成接口
             * @type { uploadChunkUrl: string, preUploadFileUrl: string, finishFileUrl: string }
             */
            multipartUploadActions: Object,
            /**
             * 上传的类型, default (默认) | custom (完全自定义) | none (不做处理, 与 erd-custom)
             * 当上传组件类型为 custom 并且配置了 urlConfig 时, 回调显示的 fileList 需要通过 callback 函数处理好返回
             */
            fileListType: {
                type: String,
                default: 'default',
                validator(fileListType) {
                    return ['default', 'custom', 'none'].indexOf(fileListType) !== -1;
                }
            },
            urlConfig: {
                type: Object,
                default() {
                    return {};
                }
            },
            // custom 类型时, 自定义返回数据
            callback: Function,
            limit: Number,
            autoUpload: {
                type: Boolean,
                default: true
            },

            readonly: Boolean,
            // 上传按钮配置
            btnConfig: {
                type: Object,
                default() {
                    return {
                        type: 'default',
                        size: 'small'
                    };
                }
            },
            tipsClickCallback: Function,
            downloadUrlConfig: {
                type: Object,
                default() {
                    return null;
                }
            },
            // 是否点击名称下载，默认是
            isDownload: {
                type: Boolean,
                default: true
            },
            // 附件回显分为左右栅格布局
            flexFileList: {
                type: Boolean,
                default: false
            },
            appName: String,
            /**
             * 上传组件的请求方法
             */
            httpRequest: {
                type: Function,
                default: null
            },
            /**
             * 分片大小，默认 10M，单位为字节
             * @default { 1024 * 1024 * 10 }
             */
            chunkSize: {
                type: Number,
                default: DEFAULT_CHUNK_SIZE
            },
            /**
             * 超出此大小的文件视为大文件，自动采用分片上传，单位为字节
             * @default { 1024 * 1024 * 100 }
             */
            bigFileSize: {
                type: Number,
                default() {
                    return BIG_FILE_SIZE;
                }
            },
            /**
             * 是否分片上传，默认是
             */
            chunkUpload: {
                type: [String, Boolean],
                default: 'auto'
            },
            className: String,
            authCode: {
                type: Object,
                default() {
                    return {};
                }
            },
            securityLabel: {
                type: String,
                default: ''
            },
            isNeedSecurity: Boolean,
            reference: [Object, String]
        },
        data() {
            return {
                fileId: '',
                uploadFileList: [],
                authMap: {},
                securityPopoverVisible: false,
                localSecurityLabel: '' // 当附件自己的密级不跟着主对象的密级的时候
            };
        },
        computed: {
            _reference() {
                return this.reference ? $(this.reference)[0] : null;
            },
            /**
             * 是否需要开启密级
             * 1、如果传递了isNeedSecurity为true，那么肯定就需要；
             * 2、如果没传，那么就判断外面是否传递了securityLabel值
             * 3、最后，通过找布局里面有没有配置密级这个字段，来决定是否需要开启密级
             * @returns {T|boolean}
             */
            innerIsNeedSecurity: function () {
                if (this.isNeedSecurity) {
                    return true;
                }
                if (this.securityLabel) {
                    return !!this.securityLabel;
                }
                let advancedForm = this.getAdvancedForm();
                if (advancedForm) {
                    return (advancedForm.trueWidgetList || []).find((i) => i.schema.field === 'securityLabel');
                }
                return false;
            },
            // 附件密级是否允许编辑，开启则可以编辑，可以不完全跟随主对象的密级
            contentSecurityEdit: function () {
                return this.innerIsNeedSecurity && !!this.$store.state.app.threeMemberOtherConfig?.contentSecurityEdit;
            },
            // 主对象的密级
            innerDefaultSecurityLabel: function () {
                if (this.securityLabel) {
                    return this.securityLabel;
                }
                let advancedForm = this.getAdvancedForm();
                if (advancedForm) {
                    return advancedForm.form.securityLabel;
                }
                return '';
            },
            securityLabels: function () {
                let result = [];
                if (!this.innerIsNeedSecurity) {
                    return result;
                }
                let currentSecurityLabel = this.innerDefaultSecurityLabel
                    ? this.$store.state.common.securityLabels.find((i) => i.name === this.innerDefaultSecurityLabel)
                    : this.$store.state.common.securityLabels[0];
                currentSecurityLabel = currentSecurityLabel || this.$store.state.common.securityLabels[0];
                let userSecurity = this.$store.state.app.user.securityLabel;
                let userSecurityLabel = userSecurity
                    ? this.$store.state.common.securityLabels.find((i) => i.name === userSecurity)
                    : this.$store.state.common.securityLabels[0];
                userSecurity = userSecurity || this.$store.state.common.securityLabels[0];
                if (currentSecurityLabel && userSecurityLabel) {
                    let minSecurity =
                        currentSecurityLabel.order * 1 < userSecurityLabel.order * 1
                            ? currentSecurityLabel
                            : userSecurityLabel;

                    this.$store.state.common.securityLabels.forEach((i) => {
                        if (i.order <= minSecurity.order) {
                            result.push({
                                label: i.value,
                                value: i.name
                            });
                        }
                    });
                }
                return result;
            },
            innerMultipartUploadActions() {
                if (this.multipartUploadActions) {
                    return this.multipartUploadActions;
                } else {
                    let service = this.$store.state.app.fileSite?.serverAddr || '';
                    return {
                        uploadChunkUrl: `${service}${utils.urlServicePrefix('/file/file/site/storage/v1/trans/upload', defaultActionClassName)}`,
                        preUploadFileUrl: `${service}${utils.urlServicePrefix('/file/file/site/storage/v1/trans/validate', defaultActionClassName)}`,
                        finishFileUrl: `${service}${utils.urlServicePrefix('/file/file/site/storage/v1/trans/{id}/finish', defaultActionClassName)}`
                    };
                }
            },
            innerAction() {
                let service = this.$store.state.app.fileSite?.serverAddr || '';
                let defaultAction = '/file/file/site/storage/v1/upload';
                return this.action || `${service}${utils.urlServicePrefix(defaultAction, defaultActionClassName)}`;
            },
            headers() {
                return {
                    'App-Name':
                        this.appName ||
                        this.$store.getters.appNameByClassName(this.$store.getters.className('subFolder')),
                    ...this.requestHeader
                };
            },
            innerHttpRequest() {
                if (this.httpRequest) {
                    return this.httpRequest;
                }
                return this.defaultHttpRequest;
            },
            innerAuthCode() {
                return {
                    ...this.authMap,
                    ...(this.authCode || {})
                };
            }
        },
        watch: {
            innerDefaultSecurityLabel: function () {
                if (this.uploadFileList && this.uploadFileList.length && this.className && this.showFileList) {
                    let updateFiles = [];
                    this.uploadFileList.forEach((i) => {
                        let target = this.securityLabels.find(
                            (ii) => ii.value === (i.response?.securityLabel || i.securityLabel)
                        );
                        if (!target) {
                            updateFiles.push({
                                contentId: i.response?.contentId || i.id,
                                securityLabel: this.securityLabels[this.securityLabels.length - 1].value
                            });
                        }
                    });
                    this.batchUpdateContentFile(updateFiles);
                }
            },
            value: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        // 布局中返回的值是字符串  "[1673260610564947970]"  的格式，需要转换数据
                        let tempValue = this.value;
                        if (typeof tempValue === 'string' && tempValue.includes('[')) {
                            try {
                                tempValue = JSON.parse(tempValue);
                            } catch (e) {
                                tempValue = tempValue.replace('[', '').replace(']', '');
                                tempValue = tempValue.split(',');
                            }
                        }
                        const fileId = _.compact(Array.isArray(tempValue) ? tempValue : [tempValue]);
                        if (fileId && fileId.length) {
                            this.getFileList(fileId);
                        }
                    }
                }
            },
            fileList: {
                immediate: true,
                handler(nv) {
                    this.uploadFileList = utils.deepClone(nv);
                }
            },
            uploadFileList(uploadFileList) {
                let value = [];
                if (this.className) {
                    value = uploadFileList?.map((item) => item.response?.contentId || item.id);
                } else {
                    value = uploadFileList?.map((item) => item.response?.data || item.fileId);
                }

                if (!_.isEqual(value, this.value)) {
                    this.$emit('input', value);
                }
            }
        },
        methods: {
            getAdvancedForm() {
                let parent = this.$parent || this.$root;
                let name = parent.$options.componentName;

                while (parent && (!name || name !== 'FamAdvancedForm')) {
                    parent = parent.$parent;

                    if (parent) {
                        name = parent.$options.componentName;
                    }
                }
                return parent;
            },
            triggerUploadClick(securityLabel) {
                this.localSecurityLabel = securityLabel;
                if (!this.readonly) {
                    this.$refs.upload.$refs['upload-inner'].$refs.input.value = null;
                    this.$refs.upload.$refs['upload-inner'].$refs.input.click();
                }
            },
            handlePreview(index) {
                const file = this.uploadFileList[index];
                const onPreview = this.$attrs['on-preview'] || this.$attrs.onPreview;
                if (onPreview && typeof onPreview === 'function') {
                    return onPreview(file);
                }
                if (!this.isDownload) {
                    return;
                }
                if ((file.response?.data || file.fileId) && this.innerAuthCode[file.response?.data || file.fileId]) {
                    utils.downloadFile({
                        fileId: file.response?.data || file.fileId,
                        authCode: this.innerAuthCode[file.response?.data || file.fileId],
                        fileName: file.name,
                        securityLabel: file.response?.securityLabel || file.securityLabel
                    });
                } else if (this.className && (file.response?.contentId || file.id)) {
                    utils.downloadContentFile(file.response?.contentId || file.id, this.className);
                }
            },
            getFileList(fileId) {
                if (this._fetchingFileList) return;
                this._fetchingFileList = true;
                const fileIds = Array.isArray(fileId) ? fileId : [fileId];
                if (this.fileListType === 'custom' && !_.isEmpty(this.urlConfig)) {
                    this.fnGetFileById(this.urlConfig)
                        .then((resp) => {
                            const index = this.uploadFileList.findIndex(
                                (item) => (item.response?.data || item.id) === fileId
                            );
                            if (resp.data) {
                                this.uploadFileList.splice(index, 1, resp.data[0]);
                            }
                        })
                        .finally(() => {
                            this._fetchingFileList = false;
                        });
                } else if (this.fileListType !== 'none') {
                    this.fnGetFileById({
                        url: this.className ? '/fam/content/file/batch/info' : '/file/file/site/console/v1/file/infos',
                        method: 'POST',
                        params: this.className
                            ? {
                                  className: this.className
                              }
                            : {
                                  className: defaultActionClassName
                              },
                        data: fileIds
                    })
                        .then((resp) => {
                            const fileIdCacheKey = fileIds?.toSorted((a, b) => b - a)?.join(',') || '';
                            cachedData[fileIdCacheKey] = resp;
                            const { data = [] } = resp;
                            data.forEach((fileItem) => {
                                const index = this.uploadFileList.findIndex((item) => {
                                    if (this.className) {
                                        return item.response?.contentId || item.id === fileItem.id;
                                    } else {
                                        return item.response?.data || item.fileId === fileItem.fileId;
                                    }
                                });
                                const fileInfo = this.uploadFileList[index] || {};
                                this.uploadFileList.splice(index, 1, { ...fileInfo, fileItem });
                            });
                        })
                        .finally(() => {
                            this._fetchingFileList = false;
                        });
                }
            },
            onChange(file, fileList) {
                this.uploadFileList = fileList;
                const onChange = this.$attrs['on-change'] || this.$attrs.onChange;
                onChange && onChange(file, fileList);
            },
            fnGetFileById(config) {
                const fileId = config?.data?.toSorted((a, b) => b - a)?.join(',') || '';
                if (fileId && cachedData[fileId]) {
                    return Promise.resolve(cachedData[fileId]);
                }
                return this.$famHttp({
                    url: config.url,
                    method: config.method,
                    responseType: config.responseType, // 文件
                    ...config
                });
            },
            handlerClickTips() {
                _.isFunction(this.tipsClickCallback) && this.tipsClickCallback();
                this.$emit('handler-click-tips');
            },
            onExceed(files, filesList) {
                // 当前应用场景只允许上传一个文件时，允许自动替换
                if (this.limit === 1) {
                    if (this.autoUpload) {
                        this.uploadFileList = [];
                        this.$nextTick(() => {
                            this.$refs.upload.handleStart(files[0]);
                            this.$nextTick(() => {
                                this.$refs.upload.$refs['upload-inner'].upload(files[0]);
                            });
                        });
                    }
                } else {
                    const onExceed = this.$attrs['on-exceed'] || this.$attrs['onExceed'];
                    onExceed && onExceed(files, filesList);
                }
            },
            onProcess(event, rawFile) {
                const onProcess = this.$attrs['on-process'] || this.$attrs.onProcess;
                onProcess && onProcess(event, rawFile);
            },
            onRemove(file, fileList) {
                const onRemove = this.$attrs['on-remove'] || this.$attrs['onRemove'];
                this.uploadFileList = fileList;
                onRemove && onRemove(file, fileList);
                if (onRemove) {
                    onRemove(file, fileList);
                } else {
                    this.deleteFile(file);
                }
            },
            deleteFile() {
                // do nothing.
            },
            onSuccess(response, file, fileList) {
                const onSuccess = this.$attrs['on-success'] || this.$attrs['onSuccess'];
                const { authCode, data } = response;
                if (authCode && data) {
                    this.authMap[data] = authCode;
                }
                fileList.forEach((file) => {
                    const response = file.response;
                    if (response && !response.success) {
                        this.$message({
                            type: 'error',
                            message: file?.response?.message || file?.response || file,
                            showClose: true
                        });
                    }
                });
                onSuccess && onSuccess(response, file, fileList);
                this.uploadFileList = this.$refs.upload.uploadFiles;
            },
            handleRemove(index) {
                this.$refs.upload.handleRemove(this.$refs.upload.uploadFiles[index]);
            },
            defaultHttpRequest(params) {
                const {
                    file: { size }
                } = params;
                if (this.chunkUpload === true || (this.chunkUpload === 'auto' && size >= this.bigFileSize)) {
                    return this.uploadBigFile(params);
                } else {
                    return this.uploadFile(params);
                }
            },
            // 关联附件
            relateContentFile(file, fileId) {
                let param = {
                    className: this.className,
                    fileId: fileId,
                    name: file.name,
                    size: file.size,
                    contentType: file.type && file.type.split('/')[1]
                };
                if (this.innerIsNeedSecurity) {
                    param.securityLabel =
                        this.localSecurityLabel || this.innerDefaultSecurityLabel || this.securityLabels[0].value;
                }
                return this.$famHttp({
                    url: '/common/content/file/create',
                    method: 'POST',
                    data: param
                }).then((res) => {
                    return res.data;
                });
            },
            // 批量更新附件信息
            batchUpdateContentFile(files) {
                if (files && files.length) {
                    let data = [];
                    files.forEach((i) => {
                        data.push({
                            id: i.contentId,
                            fileId: i.contentId,
                            securityLabel: i.securityLabel
                        });
                    });
                    return this.$famHttp({
                        url: '/common/content/file/update/batch',
                        method: 'POST',
                        data: data
                    }).then((res) => {
                        return res.data;
                    });
                }
            },
            _fileUploadClassName: function (formData, url) {
                // 默认的action的前缀通过这个className去换
                if (_.isEmpty(formData.get('className')) && url.startsWith('/file/file')) {
                    formData.append('className', 'erd.cloud.site.console.file.entity.FileInfo');
                }
            },
            /**
             * 上传文件接口
             * @param {
             *   headers: Object,
             *   withCredentials: Boolean,
             *   file: File,
             *   data: Object,
             *   filename: String,
             *   action: string,
             *   onProgress: Function,
             *   onSuccess: Function,
             *   onError: Function
             * } option
             * @returns { AbortController }
             */
            uploadFile(option) {
                let {
                    action,
                    withCredentials,
                    data = {},
                    headers = {},
                    file,
                    filename,
                    onSuccess,
                    onError,
                    onProgress
                } = option;
                const formData = new FormData();

                if (data) {
                    Object.keys(data).forEach((key) => {
                        formData.append(key, option.data[key]);
                    });
                }
                this._fileUploadClassName(formData, action);
                formData.append(filename, file, file.name);
                const controller = new AbortController();

                this.$famHttp({
                    url: action,
                    withCredentials,
                    method: 'POST',
                    signal: controller.signal,
                    headers,
                    onUploadProgress: (e) => {
                        if (e.total > 0) {
                            e.percent = (e.loaded / e.total) * 100;
                        }
                        onProgress(e);
                    },
                    data: formData
                })
                    .then((response) =>
                        this.className
                            ? this.relateContentFile(file, response.data).then(({ id, authorizeCode }) => {
                                  response.contentId = id;
                                  response.authCode = authorizeCode;
                                  response.authorizeCode = authorizeCode;
                                  response.securityLabel = this.localSecurityLabel || this.innerDefaultSecurityLabel;
                                  this.localSecurityLabel = '';
                                  return Promise.resolve(response);
                              })
                            : Promise.resolve(response)
                    )
                    .then((response) => {
                        onSuccess && onSuccess(response);
                    })
                    .catch((error) => {
                        console.error(error);
                        onError && onError(error);
                    });
                return controller;
            },
            /**
             * 大文件分块上传
             */
            uploadBigFile(option) {
                const controller = new AbortController();
                this.$loading({ lock: true, fullscreen: true, text: this.i18n.uploading });
                let { file, onError } = option;

                this.md5(file)
                    .then(async (md5) => {
                        await this.uploadBigFileObject(
                            {
                                ...option,
                                controller,
                                md5
                            },
                            controller
                        );
                    })
                    .catch((error) => {
                        if (error.code === 'ERR_CANCELED') {
                            file.status = 'pause';
                        } else {
                            onError && onError(error);
                        }
                    })
                    .finally(() => {
                        this.$loading().close();
                    });

                return controller;
            },
            md5(file) {
                const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
                const chunkSize = this.chunkSize;
                const chunks = this.calculateChunkNumber(file);
                let currentChunk = 0;
                const spark = new SparkMD5.ArrayBuffer();
                const fileReader = new FileReader();

                return new Promise((resolve, reject) => {
                    const loadNext = () => {
                        let start = currentChunk * chunkSize;
                        let end = start + chunkSize >= file.size ? file.size : start + chunkSize;
                        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
                    };

                    fileReader.onload = (e) => {
                        spark.append(e.target.result);
                        currentChunk++;
                        if (currentChunk < chunks) {
                            loadNext();
                        } else {
                            const md5 = spark.end();
                            resolve(md5);
                        }
                    };

                    fileReader.onerror = (e) => {
                        reject(e);
                    };

                    loadNext();
                });
            },
            calculateChunkNumber(file) {
                return Math.ceil(file.size / this.chunkSize);
            },
            /**
             * 文件分块
             * @param { File } file
             * @param { string } md5
             * @returns { {chunkNumber, filename: string, chunk: *}[] }
             */
            splitChunks(file, md5) {
                return new Array(this.calculateChunkNumber(file)).fill(null).map((item, index) => {
                    return {
                        chunkNumber: index + 1,
                        chunk: file.slice(index * this.chunkSize, (index + 1) * this.chunkSize),
                        filename: `${file.name}_${index + 1}_${md5.slice(0, 8)}.${file.name.split('.').pop()}`
                    };
                });
            },
            async uploadBigFileObject(option) {
                let {
                    withCredentials,
                    data = {},
                    headers = {},
                    file,
                    filename,
                    onSuccess,
                    md5,
                    onProgress,
                    controller
                } = option;

                const chunks = this.splitChunks(file, md5);
                const {
                    data: { skip, uploadId, partNums }
                } = await this.validateFileChunks(md5, this.chunkSize, chunks.length);
                const fileObject = this.$refs.upload.getFile(file);

                if (fileObject && !skip) {
                    this.$set(fileObject, 'md5', md5);
                    fileObject.option = option;
                    this.$set(fileObject, 'controller', controller);
                    const percentage = {};
                    for (const element of partNums) {
                        percentage[element] = 100;
                    }
                    await this.uploadChunks(chunks, uploadId, {
                        withCredentials,
                        data,
                        headers,
                        filename,
                        controller,
                        onProgress: (e, chunk) => {
                            percentage[chunk.chunkNumber] = chunk.percent;
                            e.percent = Number(
                                (
                                    (Object.values(percentage).reduce((a, b) => a + b) / (chunks.length * 100)) *
                                    100
                                ).toFixed(2)
                            );
                            onProgress(e);
                        },
                        eachSuccess: (resp, chunk) => {
                            percentage[chunk.chunkNumber] = 100;
                            chunk.finished = true;
                        }
                    });
                }
                const response = await this.finishChunkUpload(uploadId, file.name, file.size);
                const fileId = response.data;
                if (this.className) {
                    const { id, authorizeCode } = await this.relateContentFile(file, fileId);
                    response.contentId = id;
                    response.authCode = authorizeCode;
                    response.authorizeCode = authorizeCode;
                }
                onSuccess && onSuccess(response);
            },
            /**
             * 预上传，用于了解哪几部分分片内容已经上传过
             * @param {string} md5 - 文件md5
             * @param {Number} chunkSize
             * @param {Number} chunkCount
             * @returns { Promise<Object> }
             */
            validateFileChunks(md5, chunkSize, chunkCount) {
                return this.$famHttp({
                    url: this.innerMultipartUploadActions.preUploadFileUrl,
                    params: {
                        md5,
                        partSize: chunkSize,
                        partTotal: chunkCount
                    }
                });
            },
            /**
             * 上传分片
             * @param chunks
             * @param uploadId
             * @param options
             * @returns {Promise<Awaited<unknown>[]>}
             */
            uploadChunks(chunks, uploadId, options) {
                return Promise.all(
                    chunks.map((chunk) =>
                        this.uploadChunk(chunk, uploadId, options).then((response) => {
                            if (options.eachSuccess) {
                                options.eachSuccess(response, chunk);
                            }
                        })
                    )
                );
            },
            /**
             * 上传分片
             * @param chunk
             * @param uploadId
             * @param withCredentials
             * @param data
             * @param headers
             * @param onProgress
             * @param controller
             * @returns {Promise<Object>}
             */
            uploadChunk(chunk, uploadId, { withCredentials, data, headers, onProgress, controller }) {
                const formData = new FormData();
                formData.append('file', chunk.chunk);

                if (data) {
                    Object.keys(data).forEach((key) => {
                        formData.append(key, data[key]);
                    });
                }

                return this.$famHttp({
                    url: this.innerMultipartUploadActions.uploadChunkUrl,
                    withCredentials,
                    headers,
                    signal: controller?.signal,
                    method: 'POST',
                    data: formData,
                    params: {
                        partNum: chunk.chunkNumber,
                        uploadId
                    },
                    onUploadProgress: (e) => {
                        chunk.percent = (e.loaded / e.total) * 100;
                        onProgress(e, chunk);
                    }
                });
            },
            /**
             * 完成分片上传，通知后端组装文件
             * @param uploadId
             * @param filename
             * @param size
             * @returns {*}
             */
            finishChunkUpload(uploadId, filename, size) {
                return this.$famHttp({
                    url: this.innerMultipartUploadActions.finishFileUrl.replace('{id}', uploadId),
                    method: 'PUT',
                    data: {
                        uploadId,
                        name: filename,
                        size
                    }
                });
            },
            /**
             * 切换文件暂停状态
             * @param file
             * @returns {Promise<void>}
             */
            async handleFilePause(file) {
                if (file.status === 'uploading') {
                    // 对于上传状态的文件，取消其下所有分片的上传任务
                    file.status = 'pause';
                    if (file.controller) {
                        file.controller.abort();
                    }
                } else {
                    // 对于暂停状态的文件，重启上传任务
                    file.status = 'uploading';
                    await this.uploadBigFileObject({
                        ...file.option,
                        md5: file.md5,
                        controller: new AbortController()
                    });
                }
            }
        }
    };
});
