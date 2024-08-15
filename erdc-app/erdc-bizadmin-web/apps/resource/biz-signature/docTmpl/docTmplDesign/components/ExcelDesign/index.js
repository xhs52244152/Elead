define([
    'text!' + ELMP.resource('biz-signature/docTmpl/docTmplDesign/components/ExcelDesign/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    ELMP.resource('biz-signature/docTmpl/docTmplDesign/components/mixin.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], function (template, CONST, mixin) {
    const FamKit = require('fam:kit');
    function defaultInsFactory() {
        return {
            id: FamKit.uuid(),
            code: '',
            sheet: '1',
            position: '',
            contentType: CONST.contentTypes.text,
            defaultValue: '',
            validateMsg: {}
        };
    }
    return {
        name: 'SignatureDocTmplDesignForExcel',
        mixins: [mixin],
        template: template,
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
                            let positionStr = i.positionStr;
                            if (positionStr) {
                                let positionStrArr = positionStr.split(':');
                                i.sheet = positionStrArr[0];
                                i.position = positionStrArr[1];
                            }
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
                            title: 'Sheet',
                            prop: 'sheet'
                        },
                        {
                            title: this.i18nMappingObj.position,
                            prop: 'position'
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
                            className: 'editIcon',
                            required: true
                        },
                        {
                            title: 'Sheet',
                            prop: 'sheet',
                            editRender: {},
                            className: 'editIcon'
                        },
                        {
                            title: this.i18nMappingObj.position,
                            prop: 'position',
                            editRender: {},
                            className: 'editIcon',
                            required: true
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
                let self = this;
                return {
                    code: [
                        {
                            validator: function (rule, value, callback) {
                                let firstIndex = self.innerPoints.findIndex((i) => i.code === value);
                                let lastIndex = self.innerPoints.findLastIndex((i) => i.code === value);
                                if (firstIndex !== lastIndex) {
                                    callback(false, new Error(self.i18nMappingObj.repeatCode));
                                } else {
                                    callback(true);
                                }
                            }
                        }
                    ],
                    position: [
                        {
                            validator: function (rule, value, callback) {
                                if (/(^(\$?)[a-zA-Z]+[0-9]*$)|(^\$?[0-9]+$)/.test(value)) {
                                    callback(true);
                                } else {
                                    callback(false, new Error(self.i18nMappingObj.positionError));
                                }
                            }
                        }
                    ]
                };
            }
        },
        data: function () {
            return {
                i18nLocalePath: CONST.i18nPath,
                CONST: CONST,
                contentTypeOptions: CONST.contentTypeOptions,
                contentTypes: CONST.contentTypes,
                // 系统签章可选项 --- 通过混入了
                // systemSignatureOptions: [],
                // 内部用的位置数据，避免直接修改外部的对象
                innerPoints: [],
                sheetOptions: Array(20)
                    .fill(0)
                    .map((item, index) => ({
                        id: `${index + 1}`,
                        name: `${index + 1}`
                    }))
            };
        },
        methods: {
            getContentName(id) {
                return this.contentTypeOptions.find((item) => item.id === id)?.name;
            },
            handleSignatureAdd() {
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
                    self.$refs.erdTable
                        .validTable()
                        .then(() => {
                            resolve({
                                valid: true,
                                data: {
                                    points: this.innerPoints.map((item) => {
                                        var formattedItem = Object.assign({}, item);
                                        var splitPositionStr = (item.positionStr || '').split(':');
                                        formattedItem['sheet'] = splitPositionStr[0] || this.sheetOptions[0].id;
                                        formattedItem['position'] = splitPositionStr[1] || '';
                                        if (!item.contentType) {
                                            formattedItem['contentType'] = self.contentTypes.text;
                                        }
                                        formattedItem.positionStr = `${item.sheet}:${item.position}`;
                                        return formattedItem;
                                    })
                                }
                            });
                        })
                        .catch(() => {
                            reject({
                                valid: false
                            });
                        });
                });
            }
        }
    };
});
