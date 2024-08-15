define([ELMP.resource('biz-signature/CONST.js')], function (CONST) {
    const FamKit = require('fam:kit');
    return {
        data: function () {
            return {
                systemSignatureOptions: []
            };
        },
        methods: {
            loadSystemSignatures: function () {
                this.$famHttp({
                    url: '/fam/search',
                    method: 'post',
                    data: {
                        className: CONST.className.signature,
                        orderBy: 'createTime',
                        sortBy: 'desc',
                        pageIndex: 1,
                        pageSize: 99999,
                        conditionDtoList: [
                            {
                                attrName: `${CONST.className.signature}#signType`,
                                oper: 'EQ',
                                value1: CONST.contentTypes.signature_system
                            },
                            {
                                attrName: `${CONST.className.signature}#effective`,
                                oper: 'EQ',
                                value1: '1'
                            }
                        ]
                    }
                }).then((resp) => {
                    if (resp.success) {
                        this.systemSignatureOptions = resp.data.records.map((i) => {
                            let attrRawData = FamKit.deserializeArray(i.attrRawList, {
                                valueKey: 'displayName',
                                isI18n: true
                            });
                            return Object.assign(
                                {
                                    oid: i.oid
                                },
                                attrRawData
                            );
                        });
                    }
                });
            }
        }
    };
});
