define([
    'text!' + ELMP.resource('biz-signature/signatureManage/signatureHistory/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], function (template, CONST) {
    const FamKit = require('fam:kit');
    const ErdcloudKit = require('erdcloud.kit');
    return {
        template: template,
        computed: {
            code: function () {
                return this.$route.params?.code;
            }
        },
        components: {
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            SignatureHistoryItem: FamKit.asyncComponent(
                ELMP.resource('biz-signature/signatureManage/signatureHistory/HistoryItem/index.js')
            )
        },
        data: function () {
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys(['history', 'stateDeprecated', 'stateInUse']),
                histories: [],
                loading: false,
                containerHeight: $(document).height() - 40 - 24 - 32 - 28 - 12 + 'px'
            };
        },
        created: function () {
            if (this.$route.params.code) {
                this.loadHistories(this.$route.params.code);
            }
        },
        methods: {
            goBack: function () {
                this.$router.replace({
                    path: this.$route.query.fromUrl || '/signatureManage'
                });
            },

            loadHistories: function (code) {
                let self = this;
                this.loading = true;
                this.$famHttp({
                    url: '/fam/search',
                    method: 'POST',
                    data: {
                        className: CONST.className.signature,
                        orderBy: 'createTime',
                        sortBy: 'desc',
                        pageIndex: 1,
                        pageSize: 200,
                        conditionDtoList: [
                            {
                                attrName: `${CONST.className.signature}#code`,
                                oper: 'EQ',
                                value1: code
                            }
                        ]
                    }
                })
                    .then((resp) => {
                        let histories = resp.data.records.map((imgData) => {
                            var attrRawData = FamKit.deserializeArray(imgData.attrRawList, {
                                valueMap: {
                                    createBy: function (val) {
                                        return val;
                                    },
                                    updateBy: function (val) {
                                        return val;
                                    }
                                }
                            });
                            return Object.assign(
                                {
                                    oid: imgData.oid,
                                    url: `/file/file/site/storage/v1/img/${attrRawData.fileId}/download`
                                },
                                {
                                    createBy: attrRawData.createBy,
                                    createTime: attrRawData.createTime,
                                    updateBy: attrRawData.updateBy,
                                    updateTime: attrRawData.updateTime,
                                    effective: attrRawData.effective
                                }
                            );
                        });
                        let remainder = histories.length % 3;
                        if (remainder !== 0) {
                            for (let i = 0, len = 3 - remainder; i < len; i++) {
                                histories.push({
                                    oid: ErdcloudKit.uuid()
                                });
                            }
                        }
                        self.histories = histories;
                    })
                    .catch((error) => {
                        this.$message({
                            type: 'error',
                            message: error?.data?.message
                        });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        }
    };
});
