define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/AdvancedLayoutConfigure/template.html'),
    'css!' + ELMP.resource('biz-bpm/editor/components/AdvancedLayoutConfigure/style.css'),
    'erdcloud.kit',
    'underscore'
], function (PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'AdvancedLayoutConfigure',
        mixins: [PropertiesPanelMixin],
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            TypeSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeSelect/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                expanded: true,
                formLayoutList: [],
                interfaceList: [],
                mfeLoading: false
            };
        },
        computed: {
            formData: {
                get() {
                    return this.formatEchoData();
                }
            },
            isProcess() {
                return /Process/.test(this.activeElement.type);
            },
            globalRelatedTypeDtos() {
                const globalFormData = this.template?.globalFormData?.[0] || {};
                return globalFormData?.relatedTypeDtos || [];
            },
            relatedTypeDtos() {
                return this.formData.relatedTypeDtos || this.globalRelatedTypeDtos;
            },
            layoutTypeTree() {
                const typeValueArray = this.relatedTypeDtos;
                return [
                    {
                        oid: 1,
                        displayName: this.i18n.resourcePackage
                    },
                    {
                        oid: 2,
                        displayName: this.i18n.formLayout,
                        children: typeValueArray.length
                            ? typeValueArray
                            : [{ displayName: this.i18n.none, disabled: true }],
                        disabled: true
                    }
                ];
            }
        },
        created() {
            this.getInterfaceList(true);
        },
        mounted() {
            let selectedType = this.relatedTypeDtos?.find((item) => !!item.selected);
            const layoutRef = this.formData.layoutRef;
            if (selectedType || /LayoutDefinition/.test(layoutRef)) {
                selectedType = selectedType || this.relatedTypeDtos[0];
                this.handleLayoutTypeInput(selectedType.oid);
            } else {
                this.handleLayoutTypeInput(1);
                this.remoteMethod();
            }
        },
        methods: {
            formatEchoData() {
                const formData = ErdcKit.deepClone(
                    this.isGlobalConfiguration
                        ? this.template?.globalFormData?.[0] || {}
                        : this.nodeInfo?.localFormData?.[0] || {}
                );

                if (!formData.relatedTypeDtos) {
                    formData.relatedTypeDtos = ErdcKit.deepClone(this.globalRelatedTypeDtos);
                }
                let selectedType = formData.relatedTypeDtos?.find((item) => !!item.selected);
                const layoutRef = formData.layoutRef;
                if (selectedType || +formData.type === 2 || /LayoutDefinition/.test(layoutRef)) {
                    selectedType = selectedType || formData.relatedTypeDtos[0];
                    formData.type = selectedType?.oid;
                }

                if (!formData.type) {
                    formData.type = 1;
                }

                return formData;
            },
            fetchMfeResources({ query = '' } = {}) {
                this.mfeLoading = true;
                this.$famHttp
                    .get('/platform/mfe/apps/page', {
                        params: {
                            pkgType: 'erdc-resource',
                            searchKey: query,
                            online: true
                        }
                    })
                    .then((resp) => {
                        this.formLayoutList = resp?.data?.records || [];
                    })
                    .finally(() => {
                        this.mfeLoading = false;
                    });
            },
            getInterfaceList(visible) {
                if (visible) {
                    this.$famHttp({
                        url: '/bpm/search',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify({
                            className: this.$store.getters.className('businessInterface'),
                            conditionDtoList: [
                                {
                                    attrName: `${this.$store.getters.className('businessInterface')}#interfaceType`,
                                    oper: 'EQ',
                                    value1: 'REST'
                                },
                                {
                                    attrName: 'appName',
                                    oper: 'EQ',
                                    value1: this.template.appName
                                }
                            ]
                        })
                    }).then((resp) => {
                        let interfacesData = resp?.data?.records || [];
                        _.each(interfacesData, (item) => {
                            item.formatAttrRawList = this.formatAttrRawList(item.attrRawList);
                        });
                        this.interfaceList = interfacesData;
                    });
                }
            },
            saveLayoutConfigure() {
                const formData = { ...this.formData };
                let formType = this.formData.type;
                formData.relatedTypeDtos = formData.relatedTypeDtos.map((item) => ({
                    ...item,
                    selected: item.oid === formType
                }));
                formType = +formData.type === 1 ? 1 : 2;
                this.updateTemplate('globalFormData', 'localFormData', [
                    {
                        ...formData,
                        type: formType
                    }
                ]);
            },
            remoteMethod(query) {
                this.fetchMfeResources({ query });
            },
            getLayoutPackageLabel(pkg) {
                const pkgName = [
                    !pkg.parentCode || pkg.parentCode === '-1' ? '' : pkg.parentCode + '/',
                    `${pkg.code}@${pkg.pkgVersion}`,
                    `(${pkg.displayName})`
                ];
                return pkgName.join('');
            },
            handleTypeChange() {
                if (this.formData && this.formData.type !== 1) {
                    this.formData.layoutRef = null;
                    this.formData.type = 1;
                }
            },
            handleLayoutTypeInput(value) {
                const oldType = this.formData.type;
                this.formData.type = value;
                this.$nextTick(() => {
                    if (oldType !== this.formData.type) {
                        this.formData.layoutRef = null;
                    }
                });
                if (+value === 1) {
                    this.fetchMfeResources();
                } else {
                    this.fetchLayoutList(value);
                    this.saveLayoutConfigure();
                }
            },
            fetchLayoutList(typeOid) {
                return this.$famHttp({
                    url: '/fam/type/layout/list',
                    data: {
                        contextRef: typeOid
                    },
                    className: 'erd.cloud.foundation.layout.entity.LayoutDefinition'
                }).then((resp) => {
                    this.formLayoutList = (resp.data?.records || []).filter(
                        (item) => item.typeName === this.relatedTypeDtos.find((i) => i.oid === typeOid).typeName
                    );
                });
            }
        }
    };
});
