define([
    'text!' + ELMP.resource('advanced-search/components/AdvancedFilters/index.html'),
    ELMP.resource('advanced-search/advancedSearchMixin.js'),
    'css!' + ELMP.func('advanced-search/styles/style.css')
], function (template, advancedSearchMixin) {
    const erdcloudKit = require('erdcloud.kit');

    return {
        mixins: [advancedSearchMixin],
        template,
        components: {
            FamRuleEngine: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamRuleEngine/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('advanced-search/locale/index.js'),
                i18nMappingObj: {},
                className: 'erd.cloud.foundation.type.entity.ConstantDefinition',
                showRuleEngine: true
            };
        },
        computed: {
            originConditionDtos() {
                try {
                    if (this.currentHistoryObj.configValue) {
                        return JSON.parse(this.currentHistoryObj.configValue);
                    } else {
                        return this.originConditionsList;
                    }
                } catch (error) {
                    return [];
                }
            }
        },
        watch: {
            originConditionDtos(val, oval) {
                if (JSON.stringify(val) === JSON.stringify(oval)) {
                    return;
                }
                this.showRuleEngine = false;
                setTimeout(() => {
                    this.showRuleEngine = true;
                }, 200);
            }
        },
        methods: {}
    };
});
``;
