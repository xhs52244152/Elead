define([
    'text!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/components/CompareAttr/index.html'),
    'erdc-kit'
], function (template, ErdcKit) {
    return {
        props: {
            oid: String,

            defaultIcon: String,

            needVisualization: Boolean,

            attrLoading: Boolean,

            className: String,

            fileIsDifference: Boolean,

            attrData: {
                type: Object,
                default() {
                    return {
                        caption: '',
                        icon: '',
                        attrRawList: []
                    };
                }
            },

            headers: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        template,
        components: {
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js')),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            Visualization: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/Visualization/index.js')),
            MainContent: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/MainContentSource/components/MainContent/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ObjectConstruction/locale/index.js'),
                fields: [],
                showAttrs: [],
                activeName: '',
                isEmpty: false,
                emptyImgSrc: ELMP.resource('erdc-app/images/empty.svg')
            };
        },
        computed: {
            attrs() {
                let { fields } = this;
                return fields.map((item) => ({
                    attrName: item.attrName,
                    displayName: item.displayName,
                    locked: item.locked
                }));
            },
            tabsData() {
                let { i18n, needVisualization } = this;
                let tabs = [
                    {
                        name: 'attribute',
                        label: i18n['attr']
                    }
                ];
                if (needVisualization) {
                    tabs.push({
                        name: 'visualization',
                        label: i18n['可视化']
                    });
                }
                return tabs;
            },
            fromConfig() {
                let { showAttrs, isEmpty } = this;
                return isEmpty
                    ? []
                    : showAttrs.map((item) => {
                          return {
                              field: item.attrName,
                              component: 'slot',
                              label: item.displayName,
                              col: 12,
                              props: {
                                  name: 'normal-text'
                              }
                          };
                      });
            },
            sourceData() {
                let { attrData } = this;
                let result = {};

                attrData.attrRawList.forEach((item) => {
                    result[item.attrName] = item;
                });

                return result;
            },
            differentFields() {
                let { attrData } = this;

                let result = [];
                attrData.attrRawList.forEach((item) => {
                    if (!item.simple) result.push(item.attrName);
                });

                return result;
            },
            caption() {
                let { attrData, isEmpty } = this;
                if (isEmpty) return '';
                else return attrData['caption'];
            },
            icon() {
                let { attrData, isEmpty, defaultIcon } = this;
                if (isEmpty) return defaultIcon;
                else return attrData['icon'];
            },
            formData: {
                get() {
                    let { sourceData, showAttrs } = this;
                    let result = {};
                    showAttrs.forEach((item) => {
                        let key = item.attrName;
                        let data = sourceData[key];
                        result[key] = data?.displayName || data?.value;
                    });

                    return result;
                },
                set() {}
            }
        },
        watch: {
            oid: {
                immediate: true,
                handler(val) {
                    // 空数据处理
                    this.isEmpty = _.isEmpty(val) || val.search('EMPTY') > -1;
                    if (this.isEmpty) this.$emit('file-update', '');
                }
            },
            attrs: {
                immediate: true,
                handler(val) {
                    this.showAttrs = val.map((item) => item);
                }
            },
            headers: {
                immediate: true,
                handler(val) {
                    this.fields = val?.map((head) => ({
                        displayName: head.label,
                        attrName: head.attrName.split('#')[1],
                        locked: head.locked
                    }));
                }
            }
        },
        created() {
            this.initActiveName();
            this.vm = this;
        },
        methods: {
            setShowAttrs(attrs) {
                this.showAttrs = attrs;
            },
            getShowAttrs() {
                return this.showAttrs;
            },
            getAttrs() {
                return this.attrs;
            },
            isDiffenence(field) {
                let { differentFields } = this;
                return differentFields.includes(field);
            },
            onFileUpdate(file) {
                this.$emit('file-update', file);
            },
            initActiveName() {
                this.activeName = this.tabsData[0]?.name || '';
            }
        }
    };
});
