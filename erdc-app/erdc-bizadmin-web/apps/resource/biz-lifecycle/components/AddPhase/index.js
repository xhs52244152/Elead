/*

 */
define([
    'text!' + ELMP.resource('biz-lifecycle/components/AddPhase/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('biz-lifecycle/components/AddPhase/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            // 已选阶段
            selectPhase: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-lifecycle/components/AddPhase/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    addStatus: this.getI18nByKey('添加状态'),
                    noYouWant: this.getI18nByKey('没有你想要的'),
                    state: this.getI18nByKey('状态'),
                    addStatusTip: this.getI18nByKey('addStatusTip')
                },
                formData: {},
                phaseRow: {
                    componentName: 'virtual-select', // 固定
                    viewProperty: 'displayName', // 显示的label的key
                    valueProperty: 'oid', // 显示value的key
                    requestConfig: {
                        url: '/fam/lifecycle/state/all'
                    }
                },
                phase: {},
                phaseList: []
            };
        },
        watch: {},
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            data() {
                return [
                    {
                        field: 'state',
                        component: 'custom-select',
                        label: this.i18nMappingObj['state'],
                        labelLangKey: '状态',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {},
                        col: 24,
                        slots: {
                            component: 'stateComponent'
                        }
                    }
                ];
            }
        },
        mounted() {
            this.getPhaseSelectList();
        },
        methods: {
            getPhaseSelectList() {
                this.$famHttp({
                    url: '/fam/lifecycle/state/all',
                    method: 'GET'
                })
                    .then((resp) => {
                        const { data } = resp || [];
                        this.phaseList = data;
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            /**
             *
             * @param {*} val
             */
            phaseCallback(val) {
                this.phase = _.isArray(val?.selected) ? val?.selected : [val?.selected];
                // 临时 roleARef roleBRef
                this.phase.forEach((item) => {
                    const oid = item?.oid || '';
                    item.roleARef = oid;
                    item.roleBRef = oid;
                });
            },
            // 创建状态
            createState() {
                const data = this.$router.resolve({
                    path: this.$route.path,
                    query: {
                        type: 'createState'
                    }
                });
                window.open(data.href, '_blank');
            },
            addPhase() {
                let flag = true;
                let displayName = [];
                this.phase.forEach((item) => {
                    if (this.selectPhase.includes(item.oid)) {
                        flag = false;
                        displayName.push(item.displayName);
                    }
                });
                if (!flag) {
                    this.$message({
                        type: 'warning',
                        message: `当前阶段【${displayName.join('、')}】已添加`
                    });
                    return;
                }
                this.$emit('onsubmit', this.phase);
                this.toogleShow();
            },
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            }
        }
    };
});
