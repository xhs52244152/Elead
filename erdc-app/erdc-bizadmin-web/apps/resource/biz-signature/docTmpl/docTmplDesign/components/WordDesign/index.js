define([
    'text!' + ELMP.resource('biz-signature/docTmpl/docTmplDesign/components/WordDesign/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    ELMP.resource('biz-signature/docTmpl/docTmplDesign/components/mixin.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], function (template, CONST, mixin) {
    const FamKit = require('fam:kit');
    function defaultInsFactory() {
        return {
            code: '',
            contentType: CONST.contentTypes.text,
            defaultValue: '',
            validateMsg: {}
        };
    }
    return {
        name: 'SignatureDocTmplDesignForWord',
        template: template,
        mixins: [mixin],
        props: {
            disabled: Boolean,
            points: {
                type: [Array, String],
                default: () => {
                    return [];
                }
            }
        },
        watch: {
            points: {
                handler: function (val) {
                    if (_.isString(val)) {
                        this.innerPoints = val.split(',').map((i) => {
                            return Object.assign(defaultInsFactory(), {
                                code: i
                            });
                        });
                    } else if (_.isArray(val)) {
                        let points = JSON.parse(JSON.stringify(val));
                        points.forEach((i) => {
                            i.validateMsg = {};
                        });
                        this.innerPoints = points;
                    }
                },
                immediate: true
            }
        },
        components: {
            FamDynamicFormItem: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamDynamicForm/FamDynamicFormItem.js')
            ),
            ErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        computed: {
            columns: function () {
                let cols = [];
                if (this.disabled) {
                    cols = [
                        {
                            title: this.i18nMappingObj.signaturePositionName,
                            prop: 'code'
                        },
                        {
                            title: this.i18nMappingObj.type,
                            prop: 'contentType'
                        },
                        {
                            title: this.i18nMappingObj.defaultValue,
                            prop: 'defaultValue'
                        }
                    ];
                } else {
                    cols = [
                        {
                            title: this.i18nMappingObj.signaturePositionName,
                            prop: 'code',
                            editRender: {},
                            className: 'editIcon'
                        },
                        {
                            title: this.i18nMappingObj.type,
                            prop: 'contentType',
                            editRender: {},
                            className: 'editIcon'
                        },
                        {
                            title: this.i18nMappingObj.defaultValue,
                            prop: 'defaultValue',
                            editRender: {},
                            className: 'editIcon'
                        },
                        { title: this.i18nMappingObj.operate, width: 80, prop: 'oper' }
                    ];
                }
                return cols;
            },
            validRules() {
                const { i18nMappingObj } = this;
                return {
                    code: [
                        { required: true, message: `${i18nMappingObj.请输入}${i18nMappingObj.signaturePositionName}` }
                    ]
                };
            }
        },
        data: function () {
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys([
                    'signatureBasicInfo',
                    'signatureTmplDesign',
                    'confirm',
                    'cancel',
                    'add',
                    'deleteBtn',
                    'signaturePositionName',
                    'type',
                    'defaultValue',
                    'operate',
                    'signaturePictureOnly',
                    'deleteConfirm',
                    'signatureUpload',
                    '请输入',
                    'addText'
                ]),
                CONST: CONST,
                contentTypeOptions: CONST.contentTypeOptions,
                contentTypes: CONST.contentTypes,
                // 系统签章可选项 --- 通过混入了
                // systemSignatureOptions: [],
                // 内部用的位置数据，避免直接修改外部的对象
                innerPoints: []
            };
        },
        methods: {
            validatorFn(data, validRules) {
                let flag = true;
                data.forEach((item) => {
                    _.keys(validRules).forEach((key, index) => {
                        if (!item[key]) {
                            if (flag) {
                                this.$refs.erdTable.$refs.xTable.setEditCell(item, key);
                            }
                            flag = false;
                            item[`validerror-${item.id}-${key}`] = true;
                            item[`editIcon-${item.id}-${key}`] = true;
                        }
                    });
                });
                return flag;
            },
            getContentName(id) {
                return this.contentTypeOptions.find((item) => item.id === id)?.name;
            },
            handleSignatureAdd(data) {
                this.innerPoints.unshift(defaultInsFactory());
            },
            handleContentTypeChange(id, row) {
                if (id === this.contentTypes.signature_system) {
                    row.defaultValue =
                        this.systemSignatureOptions && this.systemSignatureOptions.length > 0
                            ? this.systemSignatureOptions[0].code
                            : '';
                } else {
                    row.defaultValue = '';
                }
            },
            handleDocSignatureDelete(index) {
                var self = this;
                this.$confirm(`${this.i18nMappingObj.deleteConfirm}?`, this.i18nMappingObj.deleteBtn, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    self.innerPoints.splice(index, 1);
                });
            },
            submit() {
                let self = this;
                return new Promise((resolve, reject) => {
                    let valid = true;
                    valid = self.validatorFn(self.innerPoints, self.validRules);
                    const numbers = self.innerPoints.map((item) => item.code);
                    const numberResult = numbers.filter(
                        (item, index) =>
                            numbers.indexOf(item) !== numbers.lastIndexOf(item) && numbers.indexOf(item) === index
                    );
                    if (numberResult.length && valid) {
                        self.$message({
                            type: 'error',
                            message: `存在相同签名位置名称${numberResult.join('、')}`
                        });
                        valid = false;
                    }
                    if (valid) {
                        resolve({
                            valid: valid,
                            data: {
                                points: this.innerPoints
                            }
                        });
                    } else {
                        reject({
                            valid: valid
                        });
                    }
                });
            }
        },
        mounted() {}
    };
});
