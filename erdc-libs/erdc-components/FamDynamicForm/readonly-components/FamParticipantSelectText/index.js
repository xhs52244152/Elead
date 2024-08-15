/**
 * readonly component for Boolean Type
 */
define([], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        /*html*/
        template: `
            <fam-user
                v-if="type === 'USER'"
                :users="defaultValue"
            ></fam-user>
            <div
                v-else
                class="flex align-items-center"
            >
                <erd-show-tooltip
                    class="w-100p"
                    placement="top"
                    padding-width="12"
                    :content="staticText || '--'"
                    :enterable="false"
                    :flex="false"
                    :open-delay="100"
                >
                    <template v-slot:show-tooltip-title>
                        <span class="title_text"> {{staticText || '--'}} </span>
                    </template>
                </erd-show-tooltip>
            </div>
        `,
        components: {
            FamUser: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUser/index.js'))
        },
        props: {
            value: '',
            defaultValue: [Array, Object],
            type: String
        },
        data() {
            return {};
        },
        computed: {
            staticText() {
                let label = this.selectedParticipants.map((item) => item.displayName).filter(Boolean);
                return _.isEmpty(label) ? '' : label.join('; ');
            },
            selectedParticipants() {
                const selectedParticipant = _.isArray(this.value?.selectedParticipant)
                    ? this.value?.selectedParticipant
                    : [this.value?.selectedParticipant].filter(Boolean);
                if (!_.isEmpty(selectedParticipant)) {
                    return selectedParticipant;
                }
                const defaultValue = _.isArray(this.defaultValue)
                    ? this.defaultValue
                    : [this.defaultValue].filter(Boolean);
                if (!_.isEmpty(defaultValue)) {
                    return defaultValue;
                }
                return [];
            }
        }
    };
});
