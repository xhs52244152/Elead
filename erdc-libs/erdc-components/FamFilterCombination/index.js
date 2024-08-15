define([
    'text!' + ELMP.resource('erdc-components/FamFilterCombination/index.html'),
    'css!' + ELMP.resource('erdc-components/FamFilterCombination/style.css'),
    'fam:kit'
], function (template, css1, FamKit) {
    return {
        template,
        props: {
            mainModelType: String,
            initFilter: String
        },
        components: {
            FamBasicFilter: FamKit.asyncComponent(ELMP.resource('erdc-components/FamBasicFilter/index.js'))
        },
        data() {
            return {
                currentFilter: '',
                switchText: '切到高级筛选'
            }
        },
        created() {
            this.currentFilter = this.initFilter || 'basicFilter'
        },
        methods: {
            changeCurrentFilter(currentFilter) {
                this.currentFilter = currentFilter === 'basicFilter'? 'advancedFilter': 'basicFilter'
                this.switchText = currentFilter === 'basicFilter'? '切到基础筛选': '切到高级筛选'
            },
            // 基础筛选条件变更
            onBasicFilterChange(conditions) {
                this.$emit('condition-change', conditions)
            },
            // 高级筛选提交
            onAdvancedFilterSubmit(conditions) {
                this.$emit('condition-change', conditions)
            },
            // 高级筛选面板高度变更
            onAdvancedHeightChange(height) {
                this.$emit('height-change', height)
            },
        }
    }
})
