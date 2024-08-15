define([
    'text!' + ELMP.func('erdc-change/components/AffectedObjects/index.html'),
    'css!' + ELMP.func('erdc-change/components/AffectedObjects/style.css')
], function (template) {
    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapState } = createNamespacedHelpers('Change');

    return {
        name: 'ChangeAffectedObjects',
        template,
        components: {
            AffectedObjectList: ErdcKit.asyncComponent(
                ELMP.func('erdc-change/components/AffectedObjectList/index.js')
            ),
            ImpactAnalysis: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/ImpactAnalysis/index.js')),
            ProductObject: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/TaskObject/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js')
            };
        },
        computed: {
            oid() {
                return this.$route.query.oid || '';
            },
            isFolded() {
                if (this.$route.name.includes('changePrDetail')) {
                    return false;
                }
            },
            title() {
                if (this.$route.name.includes('changeEcrDetail')) {
                    return this.i18n['受影响的对象列表'];
                } else {
                    return this.i18n['受影响的对象'];
                }
            },
            //是否显示影响分析的组件
            isShowAnalysis() {
                return this.$route.name.includes('changeEcrDetail') ? true : false;
            },
            //是否显示产生的对象
            isShowGenerated() {
                return this.$route.name.includes('changeEcaDetail') ? true : false;
            },
            //影响分析需要上下文字段
            ...mapState(['containerRef'])
        }
    };
});
