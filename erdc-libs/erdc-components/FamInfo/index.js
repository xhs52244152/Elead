define([
    'text!' + ELMP.resource('erdc-components/FamInfo/template.html'),
    'css!' + ELMP.resource('erdc-components/FamInfo/style.css'),
    'fam:kit',
    'fam:http',
    'underscore'
], function (template) {
    const FamKit = require('fam:kit');
    const _ = require('underscore');

    return {
        template,
        components: {
            FamInfoTitle: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamInfo/FamInfoTitle.js`))
        },
        props: {
            oid: String,
            // 获取基础信息时额外附带的参数
            ajaxData: {
                type: Object,
                default() {
                    return {};
                }
            },
            displayTabs: [Array, String],
            tabs: Array,
            isRefresh: {
                type: Boolean,
                default: false
            },
            // 业务对象信息
            baseInfo: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                currentTab: null,
                i18nLocalePath: ELMP.resource('erdc-components/FamInfo/locale/index.js'),
                i18nMappingObj: {
                    attributes: this.getI18nByKey('attribute')
                }
            };
        },
        computed: {
            // 当前显示出来的Tab页
            filteredTabs() {
                const displayTabsStr = this.displayTabs + '';
                return _.chain(displayTabsStr.split(','))
                    .map((name) => _.find(this.tabs, { name }))
                    .compact()
                    .value();
            },
            activeTab: {
                get() {
                    return this.currentTab || this.filteredTabs[0]?.name;
                },
                set(tabName) {
                    this.currentTab = tabName;
                }
            },
            title() {
                // const typeReference = this.baseInfo.rawData?.typeReference?.displayName;
                return _.compact([
                    // typeReference,
                    this.baseInfo.caption
                ]).join('-');
            },
            typeReferenceOid() {
                return this.baseInfo.rawData?.typeReference?.oid;
            },
            icon() {
                return this.baseInfo?.rawData?.icon?.value;
            }
        },
        methods: {}
    };
});
