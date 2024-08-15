define([
    'text!' + ELMP.func('erdc-baseline/components/ReviseOperate/index.html'),
    ELMP.func('erdc-baseline/const.js')
], function (template, CONST) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'BaselineReviseOperate',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                visible: false,
                rows: []
            };
        },
        computed: {
            column() {
                return [
                    {
                        prop: 'name',
                        title: this.i18n.name,
                        props: {
                            'show-overflow': 'title'
                        }
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18n.code
                    },
                    {
                        prop: 'version',
                        title: this.i18n.version
                    },
                    {
                        prop: 'toVersion',
                        title: this.i18n.toVersion
                    }
                ];
            }
        },
        methods: {
            open(rows) {
                if (!_.isArray(rows)) {
                    rows = [rows];
                }
                this.loadDetail(rows).then((resp) => {
                    if (resp.success) {
                        this.rows = resp.data || [];
                        this.visible = true;
                    }
                });
            },
            loadDetail(rows) {
                let ids = rows.map((i) => i.oid);
                return this.$famHttp({
                    url: '/baseline/common/to/revision',
                    method: 'post',
                    className: CONST.className,
                    data: ids
                });
            },
            handleRevise() {
                this.$famHttp({
                    url: '/baseline/common/revision/batch',
                    method: 'post',
                    className: CONST.className,
                    data: this.rows.map((i) => i.oid)
                }).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18n.updateSuccess);
                        this.visible = false;
                        this.$emit('success');
                    }
                });
            }
        }
    };
});
