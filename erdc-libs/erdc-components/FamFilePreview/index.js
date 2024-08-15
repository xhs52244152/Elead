/**
 * 引入组件
 * <FamFilePreview  ref="filePreview" @done="handleUpdate">
 *         <template #footer="scope">
 *             <erd-button v-if="scope.mode === 'view'" type="text" @click="switchToEdit">编辑</erd-button>
 *         </template>
 *          <template #title>
 *             自定义头
 *         </template>
 * </FamFilePreview>
 * 预览
 *      this.$refs.filePreview.preview({
 *                     fileName: 文件名字,
 *                     oid: 相关对象oid,
 *                     contentId: 附件id,
 *                     fileId: 文件id，可以不传，文件id和附件id的区别：附件是当前对象和文件的关联值，当前对象通过附件id找到对应的文件id,
 *                 })
 *编辑
 * this.$refs.filePreview.edit({
 *                     fileName: row.name,
 *                     oid: this.oid,
 *                     fileId: row.storeId,
 *                     contentId: row.id,
 *                 })
 *编辑结果查询
 *      - onlyOffice 监听done事件
 *      - script     this.$refs.filePreview?.monacoEditor.getValue();
 *
 * 插槽传递出去的参数
 * {
 *     isScript: this.isScript,
 *     isPdf: this.isPdf,
 *     isOnlyOffice: this.isOnlyOffice,
 *     isEditMode: this.isEditMode,
 *     isViewMode: this.isViewMode,
 *     mode: this.mode,
 *     type: this.type
 * }
 */
define([
    'text!' + ELMP.resource('erdc-components/FamFilePreview/index.html'),
    'fam:http',
    'fam:store',
    'erdc-kit'
], function (temp, famHttp, Store, ErdKit) {
    let config = {
        word: ['doc', 'dot', 'docx', 'dotx', 'docm', 'dotm', 'pdf'],
        cell: ['csv', 'xls', 'xlsm', 'xlsx', 'xlt', 'xltm', 'xltx'],
        slide: ['potm', 'potx', 'pps', 'ppsm', 'ppt', 'pptm', 'pptx']
    };
    let fileConfig = null;

    let util = {
        getType: function (suffix) {
            let type = '';
            if (!suffix) {
                return type;
            }
            for (let key in config) {
                if (config[key].indexOf(suffix) > -1) {
                    type = key;
                    break;
                }
            }
            return type;
        },
        mergeCustomization: function (source) {
            let defaultCustom = {
                forcesave: true, // 默认值是false
                compactHeader: true, //默认是false
                compactToolbar: true, // 默认是false
                compatibleFeatures: true, //默认是false
                customer: {
                    address: '上海市长宁区凯旋路1398弄长宁国际大厦T4号21Ｆ',
                    info: 'eRDCloud',
                    // logo: "https://www.e-lead.cn/Images/logo.png",
                    mail: 'ppm@e-lead.cn',
                    name: '易立德',
                    www: 'www.e-lead.cn'
                },
                feedback: {
                    url: 'https://www.e-lead.cn',
                    visible: true
                },
                help: false //默认值是true
            };
            let result = {};
            _.each(defaultCustom, function (val, key) {
                if (_.isObject(val)) {
                    result[key] = _.extend(
                        {},
                        defaultCustom[key],
                        source[key] && _.isObject(source[key]) ? source[key] : {}
                    );
                } else {
                    result[key] = source[key] ? source[key] : val;
                }
                delete source[key];
            });
            _.extend(result, source);
            return result;
        }
    };

    return {
        template: temp,
        props: {
            resultTryTimes: {
                type: Number,
                default: 10
            },
            staticClassName: String,
            appName: String
        },
        watch: {},
        data() {
            return {
                fileName: '',
                visible: false,
                contentId: '',
                oid: '',
                action: '',
                acls: {},
                customization: {},
                events: {},
                fileId: '',
                // 文件下载地址, 会有一个默认生成的逻辑,如果不使用默认，就自己传一个
                downloadUrl: '',
                // onlyoffice 将修改后的文件进行保存的回调接口,会有一个默认生成的逻辑,如果不使用默认，就自己传一个
                callbackUrl: '',
                // onlyoffice 关闭时候的回调用的业务id
                businessId: '',
                // 当前文件预览采用的是什么技术：pdf | onlyoffice | video | script
                type: '',
                monacoEditor: null,
                tryTime: 1,
                calcHeight: '',
                title: '',
                authCode: ''
            };
        },
        computed: {
            containerId: function () {
                return ErdKit.uuid() + '_' + new Date() * 1;
            },
            className: function () {
                return this.staticClassName ?? (this.oid ? this.oid.split(':')[1] : '');
            },
            urlPrefix: function () {
                let prefix = '';
                if (this.$store.getters.getEntityPrefix && this.className) {
                    prefix = this.$store.getters.getEntityPrefix(this.className);
                }
                return prefix || 'file';
            },
            fileSuffix: function () {
                return this.getSuffix(this.fileName);
            },
            mode: function () {
                return this.viewMode ? 'view' : 'edit';
            },
            viewMode: function () {
                return this.action ? this.action === 'PRE_VIEW' : true;
            },
            isViewMode: function () {
                return this.mode === 'view';
            },
            isEditMode: function () {
                return this.mode === 'edit';
            },
            isOnlyOffice: function () {
                return this.type === 'onlyoffice';
            },
            isPdf: function () {
                return this.type === 'pdf';
            },
            isScript: function () {
                return this.type === 'script';
            },
            params: function () {
                return {
                    isScript: this.isScript,
                    isPdf: this.isPdf,
                    isOnlyOffice: this.isOnlyOffice,
                    isEditMode: this.isEditMode,
                    isViewMode: this.isViewMode,
                    mode: this.mode,
                    type: this.type
                };
            }
        },
        methods: {
            _openDialog() {
                this.visible = true;
                this.$nextTick(() => {
                    let footerEle = document.querySelector('.fam-file-preview .el-dialog__footer');
                    let footHeight = footerEle ? footerEle.clientHeight : 0;
                    this.calcHeight = `calc(100vh - ${80 + footHeight}px)`;
                });
            },
            initData(options) {
                this.fileName = options.fileName || '';
                this.contentId = options.contentId || '';
                this.oid = options.oid || '';
                this.acls = options.acls || '';
                this.customization = options.customization || {};
                this.events = options.events || {};
                this.fileId = options.fileId || '';
                this.downloadUrl = options.downloadUrl || '';
                this.callbackUrl = options.callbackUrl || '';
                this.action = options.action || 'PRE_VIEW';
                this.$refs.dialog.$refs.erdDialog.key++;
                this.tryTime = 1;
                this.title = options.title || '';
                this.authCode = options.authCode;
                this.$$options = options;
            },
            preview(options) {
                this.initData(Object.assign({}, options));
                this.doAction();
            },
            edit(options) {
                this.initData(
                    Object.assign({}, options, {
                        action: 'EDIT'
                    })
                );
                this.doAction();
            },
            getSuffix: function (fileName) {
                let suffix = '';
                if (fileName && fileName.indexOf('.') > -1) {
                    suffix = fileName.substring(fileName.lastIndexOf('.') + 1);
                }
                return suffix.toLowerCase();
            },
            isSupported(fileName, action) {
                let suffix = this.getSuffix(fileName);
                return this.loadConfig().then((config) => {
                    for (let key in config) {
                        let val = config[key],
                            support = val.support ? val.support.toLowerCase() : '';
                        support = support.split(',');
                        if (support.indexOf(suffix) > -1 && val[action]) {
                            return true;
                        }
                    }
                    return false;
                });
            },
            isSupportedView(fileName) {
                return this.isSupported(fileName, 'view');
            },
            isSupportedEdit(fileName) {
                return this.isSupported(fileName, 'edit');
            },
            doAction() {
                let self = this;
                if (this.fileName && (this.contentId || this.fileId)) {
                    this.loadConfig().then((config) => {
                        for (let key in config) {
                            let val = config[key],
                                support = val.support ? val.support.toLowerCase() : '';
                            support = support.split(',');
                            if (support.indexOf(this.fileSuffix) > -1 && val[this.mode]) {
                                self.type = key;
                                this[key](val);
                                return;
                            }
                        }
                        self.$message('暂不支持该操作');
                    });
                } else {
                    throw new Error('fileName or contentId or fileId is required');
                }
            },
            script() {
                let self = this;
                this._openDialog();
                this.$nextTick(() => {
                    self.loadFileDetail()
                        .then((data) => self.jointDownloadPath(data))
                        .then((data) => {
                            require(['vs/editor/editor.main', 'axios'], function (monaco, axios) {
                                axios({
                                    url: data.downloadUrl,
                                    responseType: 'text'
                                }).then((resp) => {
                                    self.monacoEditor = monaco.editor.create(
                                        document.getElementById(self.containerId),
                                        {
                                            value: resp.data,
                                            automaticLayout: true,
                                            lineNumbers: 'off',
                                            readOnly: self.viewMode,
                                            scrollbar: {
                                                vertical: 'hidden',
                                                horizontal: 'hidden'
                                            }
                                        }
                                    );
                                });
                            });
                        });
                });
            },
            audio() {
                let self = this;
                this._openDialog();
                this.$nextTick(() => {
                    self.loadFileDetail()
                        .then((data) => self.jointDownloadPath(data))
                        .then((data) => {
                            $(`#${self.containerId}`).replaceWith(
                                `<audio style="width: 100%;height: 100%;" src="${data.downloadUrl}" controls autoplay/>`
                            );
                        });
                });
            },
            video() {
                let self = this;
                this._openDialog();
                this.$nextTick(() => {
                    self.loadFileDetail()
                        .then((data) => self.jointDownloadPath(data))
                        .then((data) => {
                            $(`#${self.containerId}`).replaceWith(
                                `<video class="w-100p h-100p" src="${data.downloadUrl}" controls autoplay/>`
                            );
                        });
                });
            },
            pdf() {
                let self = this;
                this._openDialog();
                this.$nextTick(() => {
                    self.loadFileDetail()
                        .then((data) => {
                            return self.jointDownloadPath(data);
                        })
                        .then((data) => {
                            var baseUrl = '/erdc-thirdparty/platform/pdfjs-3.1.81/web/viewer.html';
                            var url = baseUrl + '?file=' + window.encodeURIComponent(data.downloadUrl);
                            $(`#${self.containerId}`).replaceWith(
                                `<iframe height="100%" width="100%" align="top" frameborder="0" src="${url}">`
                            );
                        });
                });
            },
            image() {
                let self = this;
                self.loadFileDetail()
                    .then((data) => {
                        return self.jointDownloadPath(data);
                    })
                    .then((data) => {
                        ErdKit.previewImg(data.downloadUrl);
                    });
            },
            onlyoffice(config) {
                let self = this;
                this._openDialog();
                this.$nextTick(() => {
                    self.loadFileDetail()
                        .then((data) => {
                            return self.jointDownloadPath(data);
                        })
                        .then((data) => {
                            let downloadUrl = data.downloadUrl;
                            let host = config.host;
                            if (host.endsWith('/')) {
                                host = host.substring(0, host.length - 1);
                            }
                            require([host + '/web-apps/apps/api/documents/api.js'], function () {
                                let DocsAPI = window.DocsAPI;
                                new DocsAPI.DocEditor(self.containerId, {
                                    document: {
                                        fileType: self.fileSuffix,
                                        key: Date.now().toString(),
                                        title: self.fileName,
                                        url: downloadUrl,
                                        permissions: self.acls
                                    },
                                    documentType: util.getType(self.fileSuffix),
                                    editorConfig: {
                                        callbackUrl: data.callbackUrl,
                                        lang: 'zh',
                                        spellcheck: true,
                                        user: {
                                            id: self.$store.state.user.oid,
                                            name: self.$store.state.user.displayName,
                                            group: self.$store.state.user.orgName
                                        },
                                        mode: self.mode,
                                        customization: util.mergeCustomization(self.customization || {}),
                                        region: 'zh-CN'
                                    },
                                    events: _.extend({}, self.events),
                                    height: '100%',
                                    width: '100%'
                                });
                            });
                        });
                });
            },
            handleClosed() {
                let self = this;
                if (this.isOnlyOffice && !this.viewMode) {
                    this.loadEditResult().then((data) => {
                        self.$emit('done', data);
                    });
                }
            },
            beforeClose: function (done) {
                this.monacoEditor && this.monacoEditor.dispose();
                if (_.isFunction(this.$attrs?.['before-close'])) {
                    return this.$attrs['before-close'](done);
                }
                done();
            },
            loadEditResult: function () {
                let self = this;
                return this.$famHttp({
                    url: `${self.urlPrefix}/onlyoffice/callback/result/${self.businessId}`
                }).then((resp) => {
                    if (resp.success && resp.data.isUpdated) {
                        return resp.data;
                    } else if (self.tryTime < self.resultTryTimes) {
                        self.tryTime++;
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(self.loadEditResult());
                            }, 600);
                        });
                    } else {
                        return resp.data;
                    }
                });
            },
            loadFileDetail: function () {
                let self = this;
                if (this.isEditMode || (this.isViewMode && !this.authCode)) {
                    return this.$famHttp({
                        url: `${self.urlPrefix}/onlyOffice/preDownload`,
                        method: 'post',
                        data: {
                            className: self.className,
                            contentId: self.className ? self.contentId : '',
                            objectOid: self.oid,
                            type: self.action,
                            fileId: self.fileId,
                            effectiveMinute: 10
                        }
                    }).then((resp) => {
                        if (resp.success) {
                            self.businessId = resp.data.businessId;
                            return resp.data || {};
                        }
                        return Promise.reject(resp);
                    });
                } else {
                    return Promise.resolve({
                        token: this.authCode,
                        fileId: this.fileId
                    });
                }
            },
            jointDownloadPath: function (data) {
                let downloadUrl = '';
                if (this.downloadUrl) {
                    downloadUrl = this.downloadUrl;
                } else {
                    let prefix = '';
                    if (this.$store.getters.getEntityPrefix) {
                        prefix = this.$store.getters.getEntityPrefix('erd.cloud.site.console.file.entity.FileInfo');
                    }
                    downloadUrl = `/${prefix}/file/site/storage/v1/${data.fileId}/download?authCode=${data.token}`;
                    if (this.isOnlyOffice) {
                        downloadUrl = window.location.protocol
                            .concat('//')
                            .concat(window.location.host)
                            .concat(downloadUrl);
                    }
                }
                let callbackUrl =
                    this.callbackUrl ||
                    window.location.protocol
                        .concat('//')
                        .concat(window.location.host)
                        .concat(`/${this.urlPrefix}/onlyoffice/callback/${data.businessId}`);
                return Promise.resolve(
                    Object.assign({}, data, {
                        downloadUrl: downloadUrl,
                        callbackUrl: callbackUrl
                    })
                );
            },
            loadConfig: function () {
                if (fileConfig) {
                    return Promise.resolve(fileConfig);
                } else {
                    let appName = Store.state.app.site.appName;
                    return this.$famHttp({
                        url: `/file/doc/v1/config/${this.appName || appName}/get`,
                        method: 'GET'
                    }).then((resp) => {
                        if (resp.success) {
                            fileConfig = resp.data?.config?.tool;
                        }
                        return fileConfig;
                    });
                }
            }
        }
    };
});
