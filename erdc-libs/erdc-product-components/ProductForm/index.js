define([
    'text!' + ELMP.resource('erdc-product-components/ProductForm/index.html'),
    ELMP.resource('erdc-app/api/common.js'),
    'underscore',
    'fam:http',
    'fam:kit'
], function (template, commonApi) {
    const FamKit = require('fam:kit');
    const _ = require('underscore');

    return {
        template,
        components: {
            FamAdvancedForm: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        },
        props: {
            // oid
            oid: String,
            rawData: Object,
            // openType
            openType: {
                type: String,
                default: () => {
                    return '';
                }
            },
            formType: {
                type: String,
                default: () => {
                    return '';
                }
            },
            typeName: {
                type: String,
                default: ''
            },
            needSelectType: {
                type: Boolean,
                default: true
            },
            containerRef: String,
            queryLayoutParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            editableAttr: {
                type: Array,
                default: () => []
            },
            appName: String,
            typeReference: String,
            noMessage: Boolean
        },
        data() {
            return {
                className: this.rawData?.typeName?.value || this.$store.getters.className('productDemo'),
                formData: {},
                createFormData: {
                    typeReference: this.typeReference
                },
                innerRawData: {},
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    enter: this.getI18nByKey('请输入'),
                    internalNameError: this.getI18nByKey('请填写内部名称'),
                    discardCreate: this.getI18nByKey('放弃创建'),
                    discardEdit: this.getI18nByKey('放弃编辑'),
                    disabledCreate: this.getI18nByKey('是否放弃创建'),
                    disabledEdit: this.getI18nByKey('是否放弃编辑'),
                    noLayoutTips: this.getI18nByKey('noLayoutTips'),
                    type: this.getI18nByKey('类型'),
                    showName: this.getI18nByKey('名称'),
                    template: this.getI18nByKey('模板'),
                    description: this.getI18nByKey('说明'),
                    startTime: this.getI18nByKey('开始时间'),
                    endTime: this.getI18nByKey('结束时间')
                },
                formOid: '',
                typeObj: {},
                hasGetCreateLayout: false,
                extraParams: {},
                customField: {
                    displayName: '分类信息'
                },
                typeReferenceInfo: {},
                spaceDetail: this.$store.state.space?.object || {}
            };
        },
        computed: {
            defaultClass() {
                return this.$store.getters.className('productDemo') || '';
            },
            formId() {
                if (this.formType) {
                    return this.formType;
                }
                if (this.openType === 'edit') {
                    return 'UPDATE';
                }
                if (this.openType === 'create') {
                    return 'CREATE';
                }
                return 'DETAIL';
            },
            isCreate() {
                return this.openType === 'create';
            },
            // 类型下拉框row配置
            typeReferenceRow() {
                return {
                    componentName: 'virtual-select',
                    clearNoData: true,
                    requestConfig: {
                        url: '/fam/type/typeDefinition/findAccessTypes',
                        data: {
                            typeName: this.defaultClass,
                            containerRef: this.containerRef || this.$store?.state?.app?.container?.oid || ''
                        },
                        viewProperty: 'displayName',
                        valueProperty: 'typeOid'
                    }
                };
            },
            modelMapper() {
                const _this = this;
                return {
                    typeReference(rawData, { oid }) {
                        _this.innerRawData = rawData;
                        return oid;
                    },
                    classifyReference(rawData, { oid }) {
                        return oid;
                    }
                };
            },
            createFormConfigs() {
                return [
                    {
                        field: 'typeReference',
                        component: 'custom-select',
                        label: '类型',
                        labelLangKey: 'component',
                        required: true,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            filterable: true,
                            placeholder: '请选择类型',
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findAccessTypes',
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeOid',
                                    params: {
                                        typeName: this.defaultClass,
                                        containerRef: this.containerRef || this.$store?.state?.app?.container?.oid || ''
                                    }
                                }
                            }
                        },
                        listeners: {
                            callback: (data) => {
                                this.setTypeValue(data.selected);
                            }
                        },
                        col: 24
                    }
                ];
            },
            layoutParams() {
                return { ...this.queryLayoutParams, ...this.extraParams };
            },
            contextRef() {
                return this.formData?.classifyReference || null;
            },
            typeOid() {
                return this.spaceDetail?.typeReference?.oid;
            },
            createFormShows() {
                return this.isCreate && !this.hasGetCreateLayout && this.innerNeedSelectType;
            },
            innerNeedSelectType() {
                return (!this.typeReference && this.typeReference !== undefined) || this.needSelectType;
            }
        },
        watch: {
            oid: {
                immediate: true,
                handler(oid) {
                    this.formOid = oid;
                }
            },
            className: {
                immediate: true,
                handler(className) {
                    this.$emit('class-name', className || this.defaultClass);
                }
            },
            typeName: {
                immediate: true,
                handler(typeName) {
                    if (typeName) {
                        this.className = typeName;
                    }
                }
            }
        },
        created() {
            if (!this.isCreate) {
                this.hasGetCreateLayout = true;
            }
        },
        mounted() {
            this.$emit('refresh');
        },
        methods: {
            fetchProductDetail(oid, typeOid) {
                this.$refs?.editForm?.fetchFormDataByOid(oid, typeOid);
            },
            rawData2Form(rawData) {
                let extractData = FamKit.deserializeAttr(rawData, {
                    valueMap: {
                        typeReference({ oid }) {
                            return oid;
                        },
                        classifyReference({ oid }) {
                            return oid;
                        },
                        templateReference(e, data) {
                            const templateReference = data['templateInfo.templateReference'] || {};
                            return templateReference.oid === 'null' ? null : templateReference.oid;
                        },
                        'templateInfo.templateReference': function (e, data) {
                            const templateReference = data['templateInfo.templateReference'] || {};
                            return templateReference.oid === 'null' ? null : templateReference.oid;
                        }
                    }
                });
                this.innerRawData = rawData;
                this.formData = { ...extractData };
            },
            fetchProductByOid(oid) {
                return commonApi.fetchObjectAttr(oid);
            },
            // 时间转换
            dateTransfer(time) {
                if (!time) {
                    return '';
                }
                const date = new Date(time);
                const year = date.getFullYear();
                let month = date.getMonth() + 1;
                month = month < 10 ? '0' + month : month;
                let day = date.getDate();
                day = day < 10 ? '0' + day : day;
                if (typeof time === 'string' && time.indexOf(' ') !== -1) {
                    let hour = date.getHours();
                    hour = hour < 10 ? '0' + hour : hour;
                    let minute = date.getMinutes();
                    minute = minute < 10 ? '0' + minute : minute;
                    let second = date.getSeconds();
                    second = second < 10 ? '0' + second : second;
                    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
                } else {
                    return year + '-' + month + '-' + day;
                }
            },
            submitEditForm() {
                let url = '';
                const { editForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    editForm
                        ?.submit()
                        .then(({ valid }) => {
                            if (valid) {
                                let attrRawList = editForm.serializeEditableAttr();
                                let typeReference = '';
                                if (this.formData.typeReference) {
                                    typeReference = this.formData.typeReference;
                                }
                                _.each(attrRawList, (item) => {
                                    if (item.attrName === 'typeReference') {
                                        typeReference = item.value;
                                    }
                                    if (item.attrName === 'actualStart' || item.attrName === 'actualEnd') {
                                        item.value = this.dateTransfer(item.value || '');
                                    }
                                });

                                const tmpl = attrRawList.find((item) => {
                                    return item.attrName === 'template';
                                });
                                if (tmpl && tmpl.value) {
                                    tmpl.attrName = 'templateInfo.templateReference';
                                }
                                // 创建
                                let obj = {
                                    attrRawList,
                                    className: this.className,
                                    typeReference // 类型oid
                                };
                                if (this.contextRef) {
                                    obj.classifyReference = this.contextRef;
                                }
                                if (this.openType === 'edit') {
                                    url = '/fam/update';
                                    obj.oid = this.oid;
                                    obj.containerRef = this.containerRef;
                                } else {
                                    url = '/fam/create';
                                    if (this.innerNeedSelectType) {
                                        obj.className = this.typeObj.typeName;
                                    }
                                }

                                this.$famHttp({
                                    url,
                                    data: obj,
                                    method: 'post',
                                    headers: {
                                        'App-Name': this.appName
                                    }
                                })
                                    .then((res) => {
                                        resolve(res);
                                        if (!this.noMessage) {
                                            this.$message({
                                                message:
                                                    this.openType === 'edit'
                                                        ? this.i18n['updateSuccess']
                                                        : this.i18n['createSuccess'],
                                                type: 'success',
                                                showClose: true
                                            });
                                        }
                                        this.$emit('onsubmit', this.oid);
                                    })
                                    .catch((err) => {
                                        reject(err);
                                    });
                            } else {
                                reject();
                            }
                        })
                        .catch(reject);
                });
            },
            onTypeReferenceChange(value, selectedType) {
                if (selectedType?.typeName) {
                    this.className = selectedType.typeName;
                }
                this.typeReferenceInfo.appName = selectedType.appName;
                this.typeReferenceInfo.rootType = selectedType.classifyCode;
            },
            resolveWidget(widget) {
                if (widget && widget.schema && widget.schema.props && widget.schema.props.name === 'type-reference') {
                    widget.schema.field = 'typeReference';
                }
                return widget;
            },
            baseFormData(data) {
                this.$emit('base-form-data', data);
            },
            setTypeValue(data) {
                this.typeObj = data;
                if (data.typeName) {
                    this.className = data.typeName;
                }
                this.typeReferenceInfo.appName = data.appName;
                this.typeReferenceInfo.rootType = data.classifyCode;
                this.getLayoutByType(data);
            },
            getLayoutByType: _.debounce(function (data) {
                let params = {
                    layoutType: this.formId,
                    className: data.typeName || this.defaultClass
                };

                // 创建产品时需要加传
                if (this.className.includes('example.entity.Product')) {
                    params.typeReference = this.typeObj.value;
                }
                this.$famHttp({
                    url: '/fam/type/layout/getLayoutByType',
                    data: params,
                    method: 'POST'
                })
                    .then((res) => {
                        if (res?.data?.layoutAttrList?.length) {
                            this.extraParams = {
                                attrRawList: [],
                                typeReference: params.typeReference
                            };
                            this.hasGetCreateLayout = true;
                            this.$set(this.formData, 'typeReference', this.typeObj.typeOid);
                        } else {
                            this.$message.error(this.i18nMappingObj['noLayoutTips']);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }, 50),
            getFormRef() {
                return this.createFormShows ? this.$refs.createForm : this.$refs.editForm;
            }
        }
    };
});
