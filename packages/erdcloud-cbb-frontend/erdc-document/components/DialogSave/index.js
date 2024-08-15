define([
    'text!' + ELMP.func('erdc-document/components/DialogSave/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');
    // 检入状态
    const CHECKED_IN_TYPE = 'CHECKED_IN';

    return {
        name: 'DialogSave',
        template,
        components: {
            MainContentSource: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/MainContentSource/index.js')
            )
        },
        props: {
            visible: Boolean,
            inTable: Boolean,
            title: String,
            className: String,
            type: String,
            disabled: {
                type: Boolean,
                default: false
            },
            rowList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            width: {
                type: String,
                default: () => {
                    return '800px';
                }
            },
            urlConfig: {
                type: Object,
                default: function () {
                    return {
                        save: '/document/common/checkin',
                        source: '/document/content/attachment/replace'
                    };
                }
            },
            // 自定义提交方法
            customSubmit: Function,
            vm: Object
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-document/locale/index.js'),
                note: '',
                radio: '3',
                loading: false
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            oid() {
                return this.rowList.map((item) => item.oid)?.[0] || '';
            }
        },
        mounted() { },
        methods: {
            // 移动emit
            batchSubmit(data, echoData) {
                this.moveData = data;
                this.tableData.forEach((item) => {
                    item.afterContext = echoData.contextName;
                    item.afterFolder = echoData.folderName;
                });
            },
            // 检出
            handleCheckout(oid) {
                return this.$famHttp('/fam/common/checkout', {
                    method: 'GET',
                    params: {
                        oid
                    },
                    className: this.className
                });
            },
            // 检入
            handleCheckIn(url, params, inTable) {
                this.$famHttp({
                    url,
                    params,
                    className: this.className,
                    method: 'PUT'
                })
                    .then((res) => {
                        this.$message.success('操作成功');
                        this.$emit('success', res.data);
                        this.$emit('onsubmit', false);
                        // if (inTable) {
                        //     this.$emit('success', res.data);
                        //     this.$emit('onsubmit', false);
                        // } else {
                        //     const router = require('erdcloud.router');
                        //     const { $router, $route } = router.app;
                        //     this.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                        //         $router.push({
                        //             name: `${$route?.meta?.parentPath}/documentDetail`,
                        //             params: {
                        //                 oid: res.data
                        //             },
                        //             query: {
                        //                 title: '查看文档',
                        //                 className: 'erd.cloud.cbb.doc.entity.EtDocument'
                        //             }
                        //         });
                        //     });
                        // }
                        this.toggleShow();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            onSubmit() {
                if (this.customSubmit && _.isFunction(this.customSubmit)) {
                    this.customSubmit(this);
                } else {
                    this.submit(this.type);
                }
            },
            submit(type) {
                const { urlConfig, className } = this;
                let url = '';
                let data = null;
                this.loading = true;
                let oid = this.rowList.map((item) => item.oid)?.[0] || '';
                if (type === 'save') {
                    // 保存
                    url = urlConfig.save;
                    data = {
                        note: this.note,
                        oid: oid
                    };
                    this.handleCheckIn(url, data);
                } else if (type === 'sourceContent') {
                    // 替换主要内容源 需要 先检出后检入 升级小版本
                    url = urlConfig.source;

                    this.$refs.sourceContent.submit(true).then(async (data) => {
                        if (data?.valid) {
                            let infoData = data.data;
                            if (_.isEmpty(infoData)) {
                                infoData = await this.getFileData();
                            } else {
                                infoData.actionFlag = infoData.actionFlag || 4;
                            }

                            let iterationInfoState = ''
                            if (this.inTable) {
                                const [row] = this.rowList || [];
                                const iterationInfo = _.find(row?.attrRawList, (item) => new RegExp('iterationInfo.state$').test(item?.attrName)) || {};
                                iterationInfoState = iterationInfo?.value || '';
                            }
                            else {
                                iterationInfoState = this.vm?.sourceData?.['iterationInfo.state']?.value;
                            }

                            if (iterationInfoState === CHECKED_IN_TYPE) {
                                const resp = await this.handleCheckout(oid);
                                if (resp) {
                                    const rawData = resp?.data?.rawData;
                                    oid = rawData?.oid?.value || oid || '';
                                }
                            }

                            this.$famHttp({
                                url,
                                className,
                                data: {
                                    attachmentDataAddInfoList: _.isEmpty(infoData) ? [] : [infoData],
                                    objectReference: oid
                                },
                                method: 'POST'
                            })
                                .then((res) => {
                                    // 保存
                                    url = urlConfig.save;
                                    data = {
                                        note: this.note,
                                        oid: oid
                                    };
                                    this.handleCheckIn(url, data, this.inTable);
                                })
                                .finally(() => {
                                    this.loading = false;
                                });
                        } else {
                            return (this.loading = false);
                        }
                    });
                }
            },
            toggleShow() {
                this.innerVisible = !this.innerVisible;
                // this.$emit('toggle-show');
                this.$emit('close');
            },
            close() {
                this.innerVisible = false;
                this.$emit('close');
            },
            getFileData() {
                return this.$famHttp({
                    url: '/fam/content/attachment/list',
                    method: 'GET',
                    params: {
                        objectOid: this.rowList.map((item) => item.oid)?.[0] || '',
                        roleType: 'PRIMARY'
                    },
                    className: this.className
                }).then((res) => {
                    const {
                        success,
                        data: { attachmentDataVoList = [] }
                    } = res || {};
                    if (success && _.isArray(attachmentDataVoList) && attachmentDataVoList.length) {
                        const [form = {}] = attachmentDataVoList || [];
                        form.actionFlag = 3;
                        return form;
                    }
                });
            }
        }
    };
});
