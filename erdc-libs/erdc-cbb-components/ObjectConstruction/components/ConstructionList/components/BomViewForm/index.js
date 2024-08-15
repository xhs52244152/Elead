/**
 * @description bom视图表单组件
 */
define([
    'text!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionList/components/BomViewForm/index.html'),
    'css!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionList/components/BomViewForm/index.css')
], function (template) {

    return {
        name: 'BomViewForm',
        template,
        props: {
            // 操作类型
            operationType: String,
            // 编辑回显的数据
            editData: {
                type: Object,
                default() {
                    return {};
                }
            },
            className: [String],
            viewList: [Array]
        },
        data() {
            return {
                i18nPath: ELMP.resource(
                    'erdc-cbb-components/ObjectConstruction/components/ConstructionList/components/BomViewForm/locale/index.js'
                ),
                formData: {
                    precise: '',
                    viewOid: ''
                },
                rules: {
                    precise: [{ required: true, message: '请选择精度', trigger: 'change' }],
                    viewOid: [{ required: true, message: '请选择视图', trigger: 'change' }]
                },
                viewOption: [],
                precisionOption: []
            };
        },
        watch: {
            viewList: {
                handler(newVal) {
                    if (!_.isEmpty(newVal)) {
                        this.getAllView(newVal);
                    }
                },
                deep: true,
                immediate: true
            }
        },
        // 获取视图首选项配置
        computed: {
            getPreferenceView() {
                return this.$store.state.ObjectConstruction.preferenceView;
            }
        },
        mounted() {
            this.getAllPrecise();
        },
        methods: {
            // 获取精确度
            getAllPrecise() {
                this.$famHttp({
                    url: `/fam/peferences/preciseOptions`,
                    method: 'GET'
                }).then((res) => {
                    this.precisionOption =
                        JSON.parse(res.data).map((v) => {
                            return {
                                ...v,
                                label: v?.name
                            };
                        }) || [];
                    // 后端通过首选项配置设置默认值的,约定取数据的第0个就是默认值
                    this.formData.precise = this.precisionOption.find((item) => {
                        return item.default;
                    })?.value;
                });
            },

            // 获取视图
            getAllView(list) {
                this.viewOption = list;
                // 后端通过首选项配置设置默认值的
                this.formData.viewOid = list.find((item) => {
                    return item.name == this.getPreferenceView;
                })?.value;
            },
            getFormData() {
                return this.formData;
            },
            // 让外部自定义提交把
            handleSubmitForm(callback) {
                this.$refs['ruleForm'].validate((valid) => {
                    if (valid) {
                        callback && callback();
                    } else {
                        return false;
                    }
                });
            }
        }
    };
});
