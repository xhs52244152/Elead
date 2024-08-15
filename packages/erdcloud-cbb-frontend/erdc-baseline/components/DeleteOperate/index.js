define([
    'text!' + ELMP.func('erdc-baseline/components/DeleteOperate/index.html'),
    ELMP.func('erdc-baseline/const.js')
], function (template, Constants) {
    return {
        name: 'BaselineDeleteOperate',
        template,
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                visible: false,
                deleteType: 1,
                list: []
            };
        },
        computed: {
            deleteTypes() {
                return [
                    {
                        value: 1,
                        label: this.i18n.deleteMinVersionOfMaxVersion
                    },
                    {
                        value: 2,
                        label: this.i18n.deleteMaxVersion
                    },
                    {
                        value: 3,
                        label: this.i18n.deleteObject
                    }
                ];
            }
        },
        methods: {
            open(data) {
                this.visible = true;
                this.list = data;
            },
            handleDelete() {
                const { list, deleteType } = this;
                let propName = '';
                switch (deleteType) {
                    case 1:
                        propName = 'oid';
                        break;
                    case 2:
                        propName = ['branchVid', 'vid'];
                        break;
                    case 3:
                        propName = 'masterRef';
                        break;
                    default:
                        break;
                }
                const oidList = list
                    .map((item) => {
                        if (_.isArray(propName)) {
                            return _.reduce(
                                propName,
                                (prev, next) => {
                                    item[next] && !prev && (prev = item[next]);
                                    return prev;
                                },
                                ''
                            );
                        }
                        return item[propName] || '';
                    })
                    .filter((item) => !!item);
                this.$famHttp({
                    url: '/fam/deleteByIds',
                    method: 'DELETE',
                    data: {
                        oidList,
                        className: deleteType === 3 ? Constants.masterClassName : Constants.className,
                        category: 'DELETE'
                    }
                }).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18n.deleteSuccessTip);
                        this.visible = false;
                        this.$emit('success');
                    }
                });
            }
        }
    };
});
