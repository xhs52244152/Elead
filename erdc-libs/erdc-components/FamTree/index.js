define([
    'text!' + ELMP.resource('erdc-components/FamTree/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamTree/style.css')
], function (template, ErdcKit) {
    return {
        template,
        props: {
            title: {
                type: String,
                default: ''
            },
            placeholder: {
                type: String
            },
            data: {
                type: Array,
                default() {
                    return [];
                }
            },
            props: {
                type: Object,
                default() {
                    return {
                        children: 'children',
                        label: 'displayName',
                        linkCount: 'linkCount'
                    };
                }
            },
            nodeKey: {
                type: String,
                default: 'oid'
            },
            highlightCurrent: {
                type: Boolean,
                default: true
            },
            showSearch: {
                type: Boolean,
                default: true
            },
            showLinkCount: Boolean,
            showOperation: Boolean
        },
        data() {
            return {
                searchValue: ''
            };
        },
        computed: {
            placeholderTips() {
                return this.placeholder || this.i18n.pleaseEnterTips;
            }
        },
        watch: {
            searchValue(val) {
                this.$refs.tree.filter(val);
            },
            data: {
                immediate: true,
                handler(value) {
                    if (value) {
                        this.initIcons(value);
                    }
                }
            }
        },
        methods: {
            filterSearch(value, data) {
                if (this.$attrs?.['filter-node-method']) {
                    return this.$attrs?.['filter-node-method'](value, data);
                }
                if (!value) {
                    return true;
                }
                return data[this.props.label] && data[this.props.label].indexOf(value) !== -1;
            },
            clearSearch() {
                this.searchValue = '';
            },
            searchFn() {
                this.$refs.tree.filter(this.searchValue);
            },
            initIcons(applications) {
                if (applications) {
                    applications.forEach((app) => {
                        app.icon && (app.icon = ErdcKit.imgUrlCreator(app.icon));
                    });
                }
            },
            isApplication(data) {
                return data.idKey === this.$store.getters.className('Application');
            },
            getNode(data) {
                return this.$refs.tree.getNode(data);
            }
        }
    };
});
