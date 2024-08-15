define([
    ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js'),
    'underscore'
], function(ConfigurationMixin, _) {
    return {
        name: 'FamWidgetConfigurationListeners',
        mixins: [ConfigurationMixin],
        template: `
            <div>
                <div class="fam-setting-panel__header"><div class="fam-setting-panel__header-title">事件信息</div></div>
                <slot></slot>
                <fam-dynamic-form-item
                    v-for="eventDefinition in events"
                    :key="eventDefinition.name"
                    style="margin-bottom: 12px;"
                    :label="eventDefinition.label"
                    :label-width="labelWidth"
                    :formData="formData"
                    :field="'listeners.' + eventDefinition.name"
                    :tooltip="eventDefinition.name"
                >
                    <template #tooltip>
                        <erd-tooltip
                            v-if="eventDefinition.description || (eventDefinition.arguments && eventDefinition.arguments.length)"
                            placement="top"
                        >
                            <erd-icon class="inline-block mr-4 color-primary cursor-pointer font-16" icon="help"></erd-icon>
                            <template #content>
                                <div v-html="getTooltipContent(eventDefinition)"></div>
                            </template>
                        </erd-tooltip>
                    </template>
                    <erd-select 
                        v-if="!readonly"
                        :value="getDeepValue('listeners.' + eventDefinition.name)"
                        v-bind="eventDefinition.props || {}"
                        :disabled="readonly"
                        filterable
                        clearable
                        @change="onEventChange(eventDefinition.name, $event)"
                    >
                        <erd-option
                            v-for="funciton in funcitons"
                            :key="funciton.name"
                            :value="funciton.name"
                            :label="funciton.name"
                        ></erd-option>
                    </erd-select>
                    <span v-else>{{getDeepValue('listeners.' + eventDefinition.name) || '--'}}</span>
                </fam-dynamic-form-item>
            </div>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {}
            };
        },
        computed: {
            events() {
                return (this.widget?.events || []).filter((event) => !event.disabled);
            },
            funcitons() {
                let layoutJson = {};
                try {
                    layoutJson = JSON.parse(this.formConfig?.layoutJson || '{}');
                } catch  (error) {
                    console.error(error)
                }
                return (layoutJson?.functions || []).filter(item => !item.disabled);
            }
        },
        methods: {
            onEventChange(eventName, value) {
                this.setDeepValue(`listeners.${eventName}`, value);
                this.$emit('update-event', eventName, value);
            },
            getTooltipContent(eventDefinition) {
                const args = eventDefinition.arguments || [];
                const templateArr = [
                    '<div>',
                    '    <% if (args && args.length) { %>',
                    '        <div>',
                    '           <% if (description) { %>',
                    '               <%= description %><br />',
                    '           <% } %>',
                    '        参数：<br />',
                    '        <% for (var i = 0; i < args.length; i++) { %>',
                    '            <%= i + 1 %>. <%= args[i].name %>: <code><%= args[i].type %></code> - <%= args[i].description %>',
                    '        </div>',
                    '        <% } %>',
                    '    <% } %>',
                    '</div>'
                ];
                return _.template(templateArr.join('\n'))({
                    ...eventDefinition,
                    args
                });
            }
        }
    };
});
