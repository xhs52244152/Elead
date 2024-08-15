define([
    ELMP.resource('erdc-pdm-common-actions/components/CommonDialog/index.js'),
    'text!' + ELMP.resource('erdc-pdm-common-actions/components/BatchDownloadDialog/index.html'),
    'erdcloud.i18n',
    ELMP.resource('erdc-pdm-common-actions/components/BatchDownloadDialog/locale/index.js'),
    ELMP.resource('erdc-pdm-common-actions/utils.js')
], function (commonDialog, template, ErdcI18n, locale, utils) {
    const i18n = ErdcI18n.wrap(locale);
    const _ = require('underscore');
    return {
        name: 'BatchDownloadDialog',
        template,
        components: {
            commonDialog
        },
        props: {
            title: {
                type: String,
                default: i18n.batchDownload
            },
            rowList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            className: String,
            successCallback: Function,
            folderId: String
        },
        data() {
            return {
                loading: false,
                i18nMap: i18n,
                // 默认全选
                checkList: [],
                downloadOptions: {}
            };
        },
        mounted() {
            const { getDownLoadOptions } = this;
            getDownLoadOptions();
        },
        methods: {
            // 获取到批量下载的选项(请求的是首选项的配置)
            // 获取精确度
            getDownLoadOptions() {
                this.$famHttp({
                    url: `/fam/peferences/${this.className}/`,
                    method: 'GET'
                }).then((res) => {
                    let { data } = res;
                    let { pageCinfig } = JSON.parse(data);
                    // 获取配置项
                    this.downloadOptions = pageCinfig;
                    // 默认全选
                    this.checkList = Object.keys(pageCinfig);
                });
            },
            //获取下载信息
            getDownLoadInfo() {
                let data = {
                    operationType: this.className,
                    oid: this.rowList.map((item) => item.oid),
                    ...(this.folderId ? { folderId: this.folderId } : {})
                };
                this.$famHttp({
                    url: '/pdm/fileDownload/getPartFileKey',
                    method: 'POST',
                    className: this.className,
                    data
                })
                    .then((res) => {
                        this.loading = false;
                        let { data, message, success } = res;
                        if (success) {
                            // 导出成功
                            this.getSubmitData(data);
                        } else {
                            this.$message.error(message);
                        }
                    })
                    .catch(() => {
                        // 导出失败
                        this.loading = false;
                    });
            },
            getSubmitData(data) {
                let keyCovert = {};
                for (const key in this.downloadOptions) {
                    if (Object.hasOwnProperty.call(this.downloadOptions, key)) {
                        if (this.checkList.includes(key)) {
                            keyCovert[key] = this.downloadOptions[key];
                        }
                    }
                }
                let submitData = {
                    businessName: 'DocBatchExport',
                    useDefaultExport: false,
                    customParams: {
                        ...data,
                        keyCovert
                    }
                };
                this.handleExport(submitData);
            },
            handleExport(data) {
                let vm = this;
                this.$famHttp({
                    url: '/pdm/export',
                    method: 'POST',
                    className: this.className,
                    data
                })
                    .then((resp) => {
                        const { message, success } = resp;
                        this.loading = false;
                        if (success) {
                            // 导出成功
                            utils.Notify.onExportSuccess({ vm });
                            this.$refs.dialog?.close();
                            this.successCallback && this.successCallback();
                        } else {
                            this.$message.error(message);
                        }
                    })
                    .catch(() => {
                        // 导出失败
                        this.loading = false;
                        utils.Notify.onExportError({ vm });
                    });
            },
            handleSubmit() {
                this.loading = true;
                // 下载接口
                if (_.isEmpty(this.checkList)) {
                    this.loading = false;
                    return this.$message.info(i18n.downloadType);
                }
                this.getDownLoadInfo();
            }
        }
    };
});
