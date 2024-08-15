/*
新建/编辑 日历
DialogCreateCalendar: FamKit.asyncComponent(ELMP.resource('system-calendar/components/DialogCreateCalendar/index.js')),

<create-or-update-calendar
    v-if="dialogCreateVisible"
    :visible.sync="dialogCreateVisible"
    :title="title"
    @submit="onSubmit"
></create-or-update-calendar>
*/
define([
    'text!' + ELMP.resource('system-calendar/components/DialogCreateCalendar/template.html'),
    'css!' + ELMP.resource('system-calendar/components/DialogCreateCalendar/style.css')
], function (template) {
    const FamKit = require('fam:kit');
    const cldTypeReference = 'OR:erd.cloud.foundation.type.entity.TypeDefinition:1663848337839349761';

    return {
        template,
        components: {
            FamDictItemSelect: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDictItemSelect/index.js'))
        },
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: false
            },
            // 标题
            title: {
                type: String,
                default: ''
            },
            oid: {
                type: String,
                default: ''
            },
            cldList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            getAttrRawList: Function
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-calendar/components/DialogCreateCalendar/locale/index.js'),
                i18nMappingObj: {
                    type: this.getI18nByKey('创建类别'),
                    name: this.getI18nByKey('名称'),
                    reuseCalendar: this.getI18nByKey('复用日历'),
                    confirm: this.getI18nByKey('确定'),
                    save: this.getI18nByKey('保存并配置'),
                    cancel: this.getI18nByKey('取消'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    custom: this.getI18nByKey('自定义'),
                    createSuccess: this.getI18nByKey('创建成功'),
                    reuse: this.getI18nByKey('复用')
                },
                readonly: false,
                loading: false,
                disabled: false,
                typeList: [],
                formData: {
                    type: '',
                    calendarId: undefined,
                    name: {},
                    calendarType: '0'
                }
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
            },
            formConfig() {
                return [
                    {
                        field: 'type',
                        component: 'custom-select',
                        label: this.i18nMappingObj.type,
                        required: !this.readonly,
                        disabled: false,
                        readonly: !!this.readonly,
                        props: {
                            clearable: true,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'displayName', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.typeList
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'calendarId',
                        component: 'erd-tree-select',
                        label: this.i18nMappingObj.reuseCalendar,
                        labelLangKey: 'reuseCalendar',
                        required: true,
                        hidden: this.formData.type !== '1',
                        readonly: this.readonly,
                        props: {
                            'clearable': true,
                            'placeholder': this.i18nMappingObj.reuseCalendar,
                            'placeholderLangKey': this.i18nMappingObj.pleaseEnter,
                            'i18nName': this.i18nMappingObj.reuseCalendar,
                            'filterable': true,
                            'popper-class': 'fam-calendar-select',
                            'node-key': 'id',
                            'data': this.cldList,
                            'default-expand-all': true,
                            'props': {
                                children: 'children',
                                disabled: 'disabled',
                                label: 'displayName',
                                value: 'id'
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'name',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.name,
                        labelLangKey: this.i18nMappingObj.name,
                        required: !this.readonly,
                        readonly: this.readonly || false,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.pleaseEnter,
                            max: 100
                        },
                        col: 24
                    }
                ];
            }
        },
        mounted() {
            this.typeList = [
                {
                    displayName: this.i18nMappingObj['custom'],
                    value: '0'
                },
                {
                    displayName: this.i18nMappingObj['reuse'],
                    value: '1'
                }
            ];
        },
        methods: {
            toggleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            formChange(changed) {
                this.disabled = !changed;
                this.isChanged = changed;
            },
            submitEditForm: _.debounce(function (type = null) {
                let result = this.$refs.dynamicForm.formData;
                if (result.type == '0') delete result.calendarId;
                this.$emit('onsubmit', result);
                const { dynamicForm } = this.$refs;
                this.loading = true;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                let attrRawList = dynamicForm.serialize();
                                if (_.isFunction(this.getAttrRawList)) attrRawList = this.getAttrRawList(attrRawList);
                                let className = this.$store.getters.className('calendar');
                                let obj = {
                                    attrRawList,
                                    className,
                                    typeReference: cldTypeReference
                                };
                                this.$famHttp({
                                    url: '/fam/create',
                                    data: obj,
                                    method: 'post'
                                })
                                    .then((res) => {
                                        this.$message({
                                            message: this.i18nMappingObj['createSuccess'],
                                            type: 'success',
                                            showClose: true
                                        });
                                        this.$emit('updatelist', res.data);
                                        this.toggleShow();
                                        if (type == 'config') this.$emit('openconfig', res.data?.oid);
                                        resolve(res);
                                    })
                                    .catch((err) => {
                                        reject(err);
                                    })
                                    .finally(() => {
                                        this.loading = false;
                                    });
                            } else {
                                this.loading = false;
                                reject();
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                });
            }, 150),
            // 保存并设置
            onSave() {
                this.submitEditForm('config');
            },
            // 取消
            onCancel() {
                this.toggleShow();
            }
        }
    };
});
