/*
    全局属性
    先引用 kit组件
    TypeAttrGlobalConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeAttrGlobalConfig/index.js')),

    <type-attr-global-config
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    :title="title"
    :oid="typeOid"
    :openType="openType"
    @onsubmit="onSubmit"></type-attr-global-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-type-components/TypeAttrGlobalConfig/template.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'erdc-kit',
    'sortablejs',
    'underscore',
    'css!' + ELMP.resource('erdc-type-components/TypeAttrGlobalConfig/style.css')
], function (template, fieldTypeMapping, utils, Sortable) {
    const famHttp = require('fam:http');
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    const store = require('fam:store');

    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },

            // oid
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // openType
            openType: {
                type: String,
                default: () => {
                    return '';
                }
            },
            rowData: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeAttrGlobalConfig/locale/index.js'),
                i18nMappingObj: {
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    edit: this.getI18nByKey('编辑'),
                    add: this.getI18nByKey('增加'),
                    delete: this.getI18nByKey('删除'),
                    remove: this.getI18nByKey('移除'),
                    save: this.getI18nByKey('保存'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),

                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseSelect: this.getI18nByKey('请选择'),

                    confirmRemove: this.getI18nByKey('确认移除'),
                    removeSuccessfully: this.getI18nByKey('移除成功'),
                    removeFailure: this.getI18nByKey('移除失败'),
                    updateSuccessfully: this.getI18nByKey('更新成功'),
                    addSuccess: this.getI18nByKey('新增成功')
                },
                currentOid: '', // 当前属性组oid
                constraintOid: '',
                typeOid: null,
                className: null,
                formData: {
                    attrName: '', // 内部名称
                    displayName: {
                        // 显示名称
                        attr: 'nameI18nJson',
                        attrName: 'nameI18nJson',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    },
                    description: {
                        // 描述
                        attr: 'nameI18nJson',
                        attrName: 'descriptionI18nJson',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    }
                },
                TypeData: {},
                unfold: true,
                showInfo: true,
                categoryData: '',
                addNewLine: false,
                disabled: true,
                isChanged: false,
                showLabelKey: 'oid',
                attrTitle: '新增属性',
                attrVisible: false,
                loading: false
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            }
        },
        components: {
            openGlobalAttributes: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/openGlobalAttributes/index.js')
            )
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {},
            // 删除
            onDelete(data) {
                const { row } = data;
                this.$confirm(this.i18nMappingObj?.['confirmRemove'], this.i18nMappingObj?.['confirmRemove'], {
                    confirmButtonText: this.i18nMappingObj?.['confirm'],
                    cancelButtonText: this.i18nMappingObj?.['cancel'],
                    type: 'warning'
                }).then(() => {
                    const param = {
                        oid: row.linkOid
                    };
                    this.$famHttp({
                        url: '/fam/delete',
                        params: param,
                        method: 'delete'
                    }).then((resp) => {
                        this.$message({
                            message: this.i18nMappingObj?.['removeSuccessfully'],
                            type: 'success',
                            showClose: true
                        });
                        this.getRelationData();
                    });
                });
            },
            // 保存
            onSave(data) {
                const { $rowIndex, row } = data;
                let url = '/fam/create';
                // 调用保存接口
                if (row.linkOid) {
                    url = '/fam/update';
                }

                const className = row.linkOid?.split(':')[1] || 'erd.cloud.foundation.type.entity.TypeGroupMember';
                const newData = [
                    {
                        attrName: 'roleAObjectRef',
                        value: this.currentOid
                    },
                    {
                        attrName: 'roleBObjectRef',
                        value: row.attrOid
                    },
                    {
                        attrName: 'sortOrder',
                        value: row.sortOrder
                    }
                ];
                let paramData = {
                    className: className,
                    oid: row.linkOid || '',
                    attrRawList: newData
                };
                if (!row.linkOid) {
                    delete paramData.oid;
                }
                this.$famHttp({
                    url: url,
                    data: paramData,
                    method: 'post'
                }).then((resp) => {
                    this.$message({
                        message: row.linkOid
                            ? this.i18nMappingObj?.['updateSuccessfully']
                            : this.i18nMappingObj?.['addSuccess'],
                        type: 'success',
                        showClose: true
                    });
                    this.listData[$rowIndex].editFlag = 0;
                    this.addNewLine = false;
                    this.getRelationData();
                });
            },
            // 取消
            onCancel(data) {
                const { $rowIndex, row, column } = data;
                this.listData[$rowIndex].editFlag = 0;
                if (this.addNewLine) {
                    this.listData.splice(this.listData.length - 1, 1);
                    this.addNewLine = false;
                }
            },
            toggleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            submitForm() {
                let data = this.$refs?.globalProperty?.$refs?.GlobalAttributesDetail[0]?.selectRadio;

                this.loading = true;
                this.$famHttp({
                    url: '/fam/type/attribute/getGlobalAttribute',
                    data: {
                        attrId: data.oid
                    },
                    post: 'get'
                })
                    .then((res) => {
                        if (res.code === '200' && res.data) {
                            this.$emit('onsubmit', res.data);
                            this.toggleShow();
                            this.$store.state.app.typeAttrGlobal = false;
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // 取消表单提交
            onCancelForm() {
                this.$store.state.app.typeAttrGlobal = false;
                let tips = '';
                let title = '';
                if (this.openType === 'create') {
                    tips = this.i18nMappingObj['discardGroupCreate'];
                    title = this.i18nMappingObj['discardCreate'];
                } else {
                    tips = this.i18nMappingObj['discardGroupEdit'];
                    title = this.i18nMappingObj['discardEdit'];
                }
                if (this.isChanged) {
                    this.$confirm(tips, title, {
                        confirmButtonText: this.i18nMappingObj['confirm'],
                        cancelButtonText: this.i18nMappingObj['cancel'],
                        type: 'warning'
                    }).then(() => {
                        this.toggleShow();
                    });
                } else {
                    this.toggleShow();
                }
            },
            setBtnDisabled(data) {
                this.disabled = !data;
            }
        }
    };
});
