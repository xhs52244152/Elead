define([
    'text!' + ELMP.resource('biz-signature/docTmpl/ReviseOperate/index.html'),
    'erdcloud.kit',
    ELMP.resource('biz-signature/CONST.js')
], function (template, FamKit, CONST) {
    return {
        template,
        components: {
            'erd-table': FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                visible: false,
                rows: [],
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys([
                    'confirm',
                    'cancel',
                    'name',
                    'code',
                    'version',
                    'toVersion',
                    'reviseSuccess',
                    'reviseConfirm',
                    'reviseConfirmDesc',
                    'reviseConfirmTitle'
                ])
            };
        },
        mounted() {},
        computed: {
            column() {
                return [
                    {
                        prop: 'name',
                        title: this.i18nMappingObj.name,
                        props: {
                            'show-overflow': 'title'
                        }
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18nMappingObj.code
                    },
                    {
                        prop: 'version',
                        title: this.i18nMappingObj.version
                    },
                    {
                        prop: 'toVersion',
                        title: this.i18nMappingObj.toVersion
                    }
                ];
            }
        },
        methods: {
            open(rows) {
                if (!rows) return;
                if (!_.isArray(rows)) {
                    rows = [rows];
                }
                var self = this;
                this.loadDetail(rows).then((resp) => {
                    if (resp.success) {
                        self.rows = resp.data || [];
                        this.visible = true;
                    }
                });
            },
            loadDetail(rows) {
                let ids = rows.map((i) => i.oid);
                return this.$famHttp({
                    url: '/doc/common/to/revision',
                    method: 'post',
                    data: ids,
                    params: {
                        className: 'erd.cloud.signature.entity.SignatureTmpl'
                    }
                });
            },
            handleRevise() {
                var self = this;
                this.$famHttp({
                    url: '/doc/common/revision',
                    method: 'post',
                    params: {
                        oid: self.rows[0].oid,
                        className: 'erd.cloud.signature.entity.SignatureTmpl'
                    }
                }).then((resp) => {
                    if (resp.success) {
                        self.$message.success(this.i18nMappingObj.reviseSuccess);
                        self.visible = false;
                        self.$emit('done');
                    }
                });
            }
        }
    };
});
