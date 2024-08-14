define([
    'text!' + ELMP.resource('ppm-component/ppm-components/SetState/index.html'),
    'css!' + ELMP.resource('ppm-component/ppm-components/SetState/index.css')
], function (template) {
    return {
        template,
        props: {
            currentRow: {
                typeof: Object,
                default: () => {
                    return {};
                }
            },
            getStatusList: Function,
            className: String,
            title: String,
            showSetStateDialog: {
                typeof: Boolean,
                default: true
            },
            // 排除的选项集合
            excludeOptions: Array
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/SetState/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    pleaseSetState: this.getI18nByKey('pleaseSetState'),
                    setState: this.getI18nByKey('setState'),
                    currentState: this.getI18nByKey('currentState')
                },
                state: '',
                stateOptions: []
            };
        },
        computed: {
            currentState() {
                this.getLifeStateData();
                return this.currentRow.state;
            }
        },
        methods: {
            confirm() {
                if (!this.state) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseSetState
                    });
                }
                this.$emit('confirm', this.state);
            },
            cancel() {
                this.$emit('cancel', 88);
            },
            async getLifeStateData() {
                let oid = this.currentRow.oid;
                if (!oid) return;
                if (_.isFunction(this.getStatusList)) {
                    let options = await this.getStatusList();
                    this.setStateOptions(options);
                    return;
                }
                this.$famHttp({
                    method: 'POST',
                    url: '/ppm/common/template/states',
                    data: {
                        successionType: 'SET_STATE',
                        branchIdList: [oid],
                        className: this.className
                    }
                })
                    .then((res) => {
                        let options = res.data[oid]
                            .filter((item) => item.name !== 'CROPPED')
                            .map((item) => {
                                return {
                                    label: item.displayName,
                                    value: item.name,
                                    disabled: item.displayName === this.currentState
                                };
                            });
                        this.setStateOptions(options);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            setStateOptions(options) {
                if (this.excludeOptions?.length) {
                    options = options?.filter((row) => !this.excludeOptions.includes(row.value));
                }
                this.stateOptions = options;
            }
        }
    };
});
