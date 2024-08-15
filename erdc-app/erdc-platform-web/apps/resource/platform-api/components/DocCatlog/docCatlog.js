define([
    'text!' + ELMP.resource('platform-api/components/DocCatlog/docCatlog.html'),
    'css!' + ELMP.resource('platform-api/components/DocCatlog/docCatlog.css')
], function (template) {
    return {
        template,
        props: {
            catelog: {
                type: Array,
                default: function () {
                    return [];
                }
            }
        },
        data() {
            return {
                selected: ''
            };
        },
        watch: {
            'catelog.length': {
                handler(newVal) {
                    if (newVal) {
                        const first = this.catelog[0];
                        this.selected = first.id;
                    }
                }
            }
        },
        methods: {
            handleClick(catelogItem) {
                this.selected = catelogItem.id;
                this.$emit('menuClick', catelogItem);
            }
        }
    };
});
