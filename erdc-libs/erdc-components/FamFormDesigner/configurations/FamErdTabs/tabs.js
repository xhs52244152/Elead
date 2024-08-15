define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                label-width="0"
            >
                <table class="table options-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>{{ i18nMappingObj.active }}</th>
                            <th>{{ i18nMappingObj.name }}</th>
                            <th v-if="!readonly" style="width: 20px;" >{{ i18nMappingObj.operation }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(tab, index) in schema.tabs" :key="tab.name">
                            <td>
                                <el-radio-group
                                    v-model="schema.props.activeTab"
                                    :name="componentName"
                                    @change="onActiveTabChange(tab)"
                                    :disabled="readonly"
                                >
                                    <el-radio
                                        v-model="tab.activated"
                                        :label="tab.name"
                                    >&nbsp;</el-radio>
                                </el-radio-group>
                            </td>
                            <td>
                                <FamI18nbasics
                                    v-if="!readonly"
                                    v-model="tab.label"
                                    type='basics'
                                    i18nName='标题名称'
                                    @input="onLabelChange">
                                </FamI18nbasics>
                                <FamI18nStaticText 
                                    v-else 
                                    v-model="tab.label">
                                </FamI18nStaticText>
                            </td>
                            <td v-if="!readonly">
                                <erd-button type="icon" icon="erd-iconfont erd-icon-delete" @click="removeTab(index)"></erd-button>
                            </td>
                        </tr>
                        <tr v-if="!readonly">
                            <td colspan="3">
                                <erd-button style="width: 100%" icon="el-icon-plus" @click="addTab">{{i18nMappingObj.addTabs}}</erd-button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                editingRow: null,
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                componentName: this.generateId(),
                i18nMappingObj: {
                    name: this.getI18nByKey('名称'),
                    active: this.getI18nByKey('激活'),
                    addTabs: this.getI18nByKey('新增标签页'),
                    operation: this.getI18nByKey('操作')
                }
            };
        },
        watch: {
            'schema.tabs': {
                immediate: true,
                handler(tabs) {
                    _.each(tabs, (tab) => {
                        tab.activated = this.schema.props.activeTab === tab.name;
                        tab.label = _.isObject(tab.label) ? tab.label : { value: {value: tab.label} }
                    });
                    this.syncWidgetList(tabs);
                }
            }
        },
        methods: {
            addTab() {
                const tab = {
                    label: {
                        value: {
                            value: '标签' + (this.schema.tabs.length + 1)
                        }
                    },
                    name: this.generateId(),
                    activated: false
                };
                this.schema.tabs.push(tab);
            },
            removeTab(index) {
                const tab = this.schema.tabs.splice(index, 1);
                const widgetList = this.widget.widgetList;
                const widgetIndex = widgetList.findIndex((widget) => widget?.schema?.props.name === tab[0].name);
                widgetList.splice(widgetIndex, 1);
                this.setWidgetValue('widgetList', widgetList);
            },
            generateId() {
                return (Math.random() * 100000 + Math.random() * 20000 + Math.random() * 5000)
                    .toString(36)
                    .split('.')[1];
            },
            onActiveTabChange() {
                this.$nextTick(() => {
                    this.syncWidgetList(this.schema.tabs);
                });
            },
            onLabelChange() {
                this.syncWidgetList(this.schema.tabs);
            },
            syncWidgetList(tabs) {
                const widgetList = [];
                _.each(tabs, (tab) => {
                    const widget = _.find(this.widget.widgetList, { key: 'FamErdTabPane' + tab.name }) || {
                        key: 'FamErdTabPane' + tab.name,
                        container: true,
                        block: true,
                        name: '标签页面板',
                        category: 'high-order',
                        id: this.generateId(),
                        schema: {
                            col: 24,
                            component: 'FamErdTabPane',
                            props: {
                                ...tab
                            }
                        },
                        parentWidget: this.widget.id,
                        widgetList: []
                    };
                    widget.schema.props = { ...tab };
                    widgetList.push(widget);
                });
                this.setWidgetValue('widgetList', widgetList);
            }
        }
    };
});
