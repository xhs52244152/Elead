/**
 * readonly component for FamI18nbasics
 */
define(['fam:kit', 'erdcloud.i18n'], function () {
    const FamKit = require('fam:kit');
    const i18n = require('erdcloud.i18n');

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
                <template v-slot:show-tooltip-title>
                    <span
                        class="title_text whitespace-pre"
                    >{{staticText}}</span>
                </template>
            </erd-show-tooltip>
        `,
        props: {
            value: [String, Object]
        },
        computed: {
            staticText() {
                let result = this.value?.value || '';
                if (typeof result !== 'string') {
                    result = result[this.lang] || result.value || '';
                }
                return result;
            },
            lang() {
                return i18n.currentLanguage() || '';
            }
        }
    };
});
