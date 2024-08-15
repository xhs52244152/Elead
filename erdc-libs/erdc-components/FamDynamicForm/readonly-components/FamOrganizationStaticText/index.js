define(['underscore', 'fam:kit'], function () {
    const _ = require('underscore');
    const FamKit = require('fam:kit');

    return {
        components: {
            FamShowTooltip: FamKit.asyncComponent(ELMP.resource('erdc-components/FamShowTooltip/index.js'))
        },
        template: `
            <erd-show-tooltip 
                placement="top" 
                :content="staticText || '--'"
                flex
            >
            </erd-show-tooltip>
        `,
        // template: `
        //     <erd-tooltip
        //         placement="top"
        //         :content="staticText || '--'"
        //         popper-class="fam-tooltip-max-width"
        //     >
        //     <span
        //         v-fam-clamp="{ truncationStyle: 'inline' }"
        //     >
        //             {{ staticText || '--'}}
        //         </span>
        //     </erd-tooltip>
        // `,
        props: {
            value: [String, Array, Object]
        },
        computed: {
            staticText() {
                return this.resolveStaticText(this.value);
            }
        },
        methods: {
            resolveStaticText(value) {
                if (typeof value === 'string') {
                    // TODO 考虑支持按ID自动获取部门的场景，或者由外部提供
                } else if (_.isArray(value)) {
                    return _.chain(value).map(this.resolveStaticText).compact().join(',');
                } else if (value && value.name) {
                    return value.name;
                }
                return value || '';
            }
        }
    };
});
