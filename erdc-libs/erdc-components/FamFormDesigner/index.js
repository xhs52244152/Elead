define([
    'vue',
    'fam:store',
    'fam:kit',
    ELMP.resource('erdc-components/FamFormDesigner/components/WidgetPanel.js'),
    ELMP.resource('erdc-components/FamFormDesigner/components/FormView.js'),
    ELMP.resource('erdc-components/FamFormDesigner/components/SettingPanel.js'),
    ELMP.resource('erdc-components/FamFormDesigner/designer.js'),
    ELMP.resource('erdc-components/FamFormDesigner/containers/index.js'),
    'css!' + ELMP.resource('erdc-components/FamFormDesigner/style.css')
], function (Vue, store, FamKit, WidgetPanel, FormView, SettingPanel, createDesigner, DynamicFormContainer) {
    Vue.component(
        'fam-dynamic-form-item',
        FamKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/FamDynamicFormItem.js'))
    );
    DynamicFormContainer.init();

    return {
        /*html*/
        template: `
            <erd-container
                class="fam-form-designer"
            >
                <erd-aside
                    class="fam-form-designer__left"
                    width="320px"
                >
                    <WidgetPanel
                        :designer="designer"
                        :readonly="readonly"
                        :is-edit="isEdit"
                        :type-oid="typeOid"
                        :widgets="widgets"
                        :is-designer-form="isDesignerForm"
                    ></WidgetPanel>
                </erd-aside>
    
                <erd-main
                    class="fam-form-designer__center"
                >
                    <FormView
                        v-if="showFormView"
                        :designer="designer"
                        :readonly="readonly"
                        :is-edit="isEdit"
                        :type-oid="typeOid"
                        :customizeConfiguration="customizeConfiguration"
                        :is-designer-form="isDesignerForm"
                    ></FormView>
                </erd-main>
    
                <erd-aside
                    class="fam-form-designer__right"
                    width="320px"
                >
                    <SettingPanel
                        ref="settingPanel"
                        :key="designer.selected?.id"
                        :designer="designer"
                        :form-config="designer.formConfig"
                        :readonly="readonly"
                        :is-edit="isEdit"
                        :type-oid="typeOid"
                        :customizeConfiguration="customizeConfiguration"
                        @switchActiveTab="switchActiveTab"
                    ></SettingPanel>
            </erd-aside>
            </erd-container>
        `,
        components: {
            WidgetPanel,
            FormView,
            SettingPanel
        },
        props: {
            attributeList: {
                type: Array,
                default() {
                    return [];
                }
            },
            attributeCategories: {
                type: Array,
                default() {
                    return [];
                }
            },
            componentDefinitions: {
                type: Array,
                default() {
                    return [];
                }
            },
            readonly: Boolean,
            typeOid: String,
            typeName: String,
            isEdit: Boolean,
            isDesignerForm: Boolean,
            getDefaultWidgetList: Function
        },
        provide() {
            return {
                attributeList: this.attributeList,
                attributeCategories: this.attributeCategories,
                componentDefinitions: this.componentDefinitions,
                isEdit: this.isEdit,
                typeOid: this.typeOid,
                readonly: this.readonly,
                designer: this.designer,
                widgets: this.widgets,
                scopedSlots: {} // 避免FormWidget缺少必要inject
            };
        },
        data() {
            return {
                designer: createDesigner(this),
                showFormView: false,
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    validateFail: this.getI18nByKey('数据校验未通过')
                }
            };
        },
        computed: {
            widgets() {
                const widgets = this.$store.state.component.widgets;
                // 后端存储的组件
                const backendWidgets = _.chain(this.componentDefinitions)
                    .map((componentDefinition) => {
                        const widget = _.find(widgets, (widget) =>
                            this.isSameComponentName(widget.key, componentDefinition.name)
                        ) || _.find(widgets, (widget) =>
                            this.isSameComponentName(widget?.schema?.alias, componentDefinition.name)
                        );
                        const inputWidget = _.find(widgets, (widget) =>
                            this.isSameComponentName(widget.key, 'erd-input')
                        );
                        if (widget) {
                            return _.extend({}, widget, {
                                componentRef: componentDefinition.oid,
                                attrRef: null,
                                flag: 'COMPONENT',
                                name: componentDefinition.displayName
                            });
                        } else {
                            return _.extend({}, FamKit.deepClone(inputWidget), {
                                componentRef: componentDefinition.oid,
                                attrRef: null,
                                flag: 'COMPONENT',
                                name: componentDefinition.displayName
                            });
                        }
                    })
                    .compact()
                    .value();
                // 前端配置固定显示的组件
                const fixedWidgets = _.filter(widgets, (widget) => {
                    return widget.fixed;
                });
                const unionWidgets = (...args) => {
                    return _.reduce(
                        args,
                        (prev, item) => {
                            return _.chain(item)
                                .filter((widget) => !_.some(prev, { key: widget.key }))
                                .union(prev)
                                .value();
                        },
                        []
                    );
                };
                return unionWidgets(backendWidgets, fixedWidgets).sort((a, b) => a.name.localeCompare(b.name));
            },
            customizeConfiguration() {
                let layoutJson = {};
                try {
                    layoutJson = JSON.parse(this.designer.formConfig?.layoutJson || '{}');
                } catch (error) {
                    console.error(error);
                }
                return layoutJson;
            },
            defaultWidgetList() {
                if (this.getDefaultWidgetList) {
                    return this.getDefaultWidgetList(this.designer, this.widgets);
                } else {
                    return [];
                }
            }
        },
        created() {
            this.designer.widgetList = this.defaultWidgetList;
            this.showFormView = true;
        },
        mounted() {
            document.body.classList.add('fam-fix-text-rendering');
        },
        beforeDestroy() {
            document.body.classList.remove('fam-fix-text-rendering');
        },
        methods: {
            validate() {
                return new Promise((resolve, reject) => {
                    const $settingPanel = this.$refs.settingPanel;
                    if ($settingPanel) {
                        $settingPanel
                            .validate()
                            .then((valid) => {
                                if (valid) {
                                    resolve(valid);
                                } else {
                                    reject();
                                }
                            })
                            .catch(reject);
                    } else {
                        resolve(true);
                    }
                });
            },
            assemble() {
                return new Promise((resolve, reject) => {
                    this.validate()
                        .then(() => {
                            this.getData()
                                .then((data) => {
                                    resolve(data);
                                })
                                .catch(reject);
                        })
                        .catch((error) => {
                            const message = typeof error === 'string' ? error : error && error.message;
                            reject(new Error(message || this.i18nMappingObj.validateFail));
                        });
                });
            },
            getData(formInfo) {
                return new Promise((resolve, reject) => {
                    this.designer
                        .serialize(formInfo)
                        .then((data) => {
                            resolve(data);
                        })
                        .catch(reject);
                });
            },
            deserialize(layout) {
                this.designer.deserialize(layout);
            },
            isSameComponentName(componentName1, componentName2) {
                return FamKit.pascalize(componentName1) === FamKit.pascalize(componentName2);
            },
            switchActiveTab() {
                this.designer.setSelected(null);
            }
        },
        store
    };
});
