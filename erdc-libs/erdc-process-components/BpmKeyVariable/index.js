define([
    'css!' + ELMP.resource('erdc-process-components/BpmKeyVariable/style.css'),
    'erdcloud.kit'
], function () {
    const ErdcKit = require('erdcloud.kit');

    return {
        template: `
            <div class="bpm-key-variable" :key="variable.field">
                <div class="bpm-key-variable__left">
                    <span class="bpm-key-variable__icon"><img :src="variableIcon(variable.icon)"></span>
                </div>
                <div class="bpm-key-variable__right">
                    <slot :variable="variable">
                        <div class="bpm-key-variable__value">
                            <slot
                                name="valueText"
                                :variable="variable"
                                :value-text="valueText"
                                :value-color="valueColor"
                            >
                                <bpm-avatar
                                    v-if="variable.type === 'user'"
                                    :users="valueText"
                                    show-btn
                                >
                                    <template slot="showBtn" slot-scope="slotProps">
                                        <slot name="showBtn" :user="slotProps.user"></slot>
                                    </template>
                                </bpm-avatar>
                                <span
                                    v-else
                                    :style="{ color: valueColor }"
                                >{{valueText}}</span>
                            </slot>
                        </div>
                    </slot>
                    <span class="bpm-key-variable__name">{{variable.name}}</span>
                </div>
            </div>
        `,
        components: {
            BpmAvatar: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmAvatar/index.js'))
        },
        props: {
            variable: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            valueText() {
                return typeof this.variable.value === 'function' ? this.variable.value() : this.variable.value;
            },
            valueColor() {
                return typeof this.variable.color === 'function' ? this.variable.color() : this.variable.color;
            }
        },
        methods: {
            variableIcon(url) {
                return `${ELMP.resource('erdc-process-components/BpmKeyVariable/svg')}/${url}.svg`
            }
        }
    };
});
