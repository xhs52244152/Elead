define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/NodeProcessConfiguration/template.html'),
    'erdcloud.kit'
], function (PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'NodeProcessConfiguration',
        template,
        mixins: [PropertiesPanelMixin],
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            EditableTable: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/EditableTable/index.js'))
        },
        props: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/components/NodeProcessConfiguration/locale/index.js'),
                expanded: true,
                tableData: []
            };
        },
        computed: {
            formConfigs() {
                return [
                    {
                        field: 'serialnumber',
                        label: this.i18n.serialNumber,
                        component: 'erd-input-number',
                        props: {
                            placeholder: this.i18n.pleaseFillIn,
                            style: {
                                width: '120px'
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'ismail',
                        label: this.i18n.isMail,
                        component: 'erd-checkbox',
                        col: 24
                    },
                    {
                        field: 'routes',
                        label: this.i18n.routes,
                        component: 'div',
                        col: 24
                    }
                ];
            },
            column() {
                return [
                    {
                        prop: 'id',
                        title: this.i18n.routeFlag,
                        tips: this.i18n.routeFlagTips,
                        editRender: {
                            props: {
                                maxlength: 8
                            }
                        },
                        slots: {
                            edit: 'erd-input-number'
                        }
                    },
                    {
                        prop: 'name',
                        title: this.i18n.routeName,
                        editRender: {
                            props: {
                                maxlength: 8
                            }
                        },
                        slots: {
                            edit: 'erd-input'
                        }
                    },
                    {
                        prop: 'sort',
                        title: this.i18n.sort,
                        editRender: {
                            props: {
                                maxlength: 2
                            }
                        },
                        slots: {
                            edit: 'erd-input-number'
                        }
                    },
                    this.readonly
                        ? null
                        : {
                              prop: 'oper',
                              title: this.i18n.operation,
                              width: '80',
                              fixed: 'right',
                              slots: {
                                  default: 'oper-remove'
                              }
                          }
                ].filter((i) => i);
            },
            rules() {
                const that = this;
                return {
                    id: [
                        { required: true, message: that.i18n.pleaseFillIn },
                        {
                            message: this.i18n.repeatedRoute,
                            validator(rule, value, callback) {
                                if (that.tableData.filter((i) => i.id === value).length > 1) {
                                    callback(new Error(that.i18n.repeatedRoute));
                                } else {
                                    callback();
                                }
                            }
                        }
                    ],
                    name: [{ required: true, message: that.i18n.pleaseFillIn }]
                };
            }
        },
        watch: {
            tableData: {
                deep: true,
                handler(newValue, oldValue) {
                    this.onFieldChange({ field: 'routes' }, newValue);
                }
            },
            activeElement: {
                handler(value) {
                    if (value) {
                        this.extractBaseInfo();
                    }
                }
            }
        },
        mounted() {
            this.extractBaseInfo();
        },
        methods: {
            extractBaseInfo() {
                this.tableData = this.getExtensionRouteValue(this.activeElement);
                return {
                    serialnumber: +this.getExtensionValue(this.activeElement, 'serialnumber') || 0,
                    ismail: this.getExtensionValue(this.activeElement, 'ismail')
                };
            },
            onFieldChange({ field }, value) {
                this.updateBaseInfo(field, value);
            },
            updateBaseInfo(field, value) {
                if (field === 'routes') {
                    this.saveExtensionValues(this.activeElement, 'formProperty', {
                        id: 'route_flag',
                        name: '路由选择',
                        type: 'enum',
                        values: value.reduce((prev, el) => {
                            return [
                                ...prev,
                                this.moddle.create(`activiti:Value`, el),
                                this.moddle.create(`activiti:Value`, {
                                    id: el.id + '_sort',
                                    name: el.sort
                                })
                            ];
                        }, [])
                    });
                } else {
                    this.saveExtensionValues(this.activeElement, field, value);
                }
            },
            addRow() {
                this.expanded = true;
                this.$nextTick(() => {
                    this.$refs.table.addRow({
                        _id: Date.now().toString(36),
                        id: null,
                        name: null,
                        sort: (this.tableData.at(-1)?.sort || 0) + 1
                    });
                });
            }
        }
    };
});
