define([
    'text!' + ELMP.func('erdc-baseline/views/merge/components/next/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');
    const Vuex = require('vuex');
    const { mapGetters } = Vuex.createNamespacedHelpers('CbbBaseline');

    return {
        name: 'BaselineMergeNext',
        template,
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js')),
            BaselineForm: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/BaselineForm/index.js')),
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                mode: '2',
                panelUnfoldObject: true,
                formDetail: {}
            };
        },
        computed: {
            ...mapGetters(['getMergeInfo']),
            formattedMergedList() {
                return this.getMergeInfo.mergedList.map((item) =>
                    ErdcKit.deserializeAttr(item, { valueKey: 'displayName', isI18n: true })
                );
            },
            isCreateBaselineMode() {
                return this.mode === '2';
            },
            pid() {
                return this.$route.query.pid || '';
            },
            containerRef() {
                return this.$store.state?.space?.context?.oid;
            },
            columns() {
                return [
                    {
                        type: 'seq',
                        width: 48,
                        align: 'center',
                        fixed: 'left',
                        title: ' '
                    },
                    {
                        title: this.i18n.code,
                        prop: 'identifierNo'
                    },
                    {
                        prop: 'name',
                        title: this.i18n.name
                    },
                    {
                        prop: 'version',
                        title: this.i18n.version
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n.lifecycleStatus
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18n.context
                    }
                ];
            }
        },
        methods: {
            submit() {
                // eslint-disable-next-line no-async-promise-executor
                return new Promise(async (resolve) => {
                    if (this.getMergeInfo.mergedList.length === 0) {
                        this.$message.error(this.i18n.baselineObjectValidateTip);
                        resolve();
                    }
                    if (this.isCreateBaselineMode) {
                        try {
                            const formSubmitResult = await this.$refs.baselineFormRef.submit();
                            if (formSubmitResult.validate) {
                                resolve({
                                    ...formSubmitResult.data,
                                    ...ErdcKit.deserializeAttr(formSubmitResult.data.attrRawList),
                                    saveAs: this.isCreateBaselineMode
                                });
                            }
                            resolve();
                        } catch (e) {
                            resolve();
                        }
                    } else {
                        resolve({
                            ...this.formDetail,
                            typeReference: this.formDetail.typeReference.oid,
                            containerRef: this.formDetail.containerRef.oid,
                            folderRef: this.formDetail.folderRef.value ?? '',
                            domainRef: `OR:${this.formDetail.domainRef.key}:${this.formDetail.domainRef.id}`,
                            saveAs: this.isCreateBaselineMode
                        });
                    }
                });
            },
            handleFormChange(formData) {
                this.formDetail = formData;
            }
        }
    };
});
