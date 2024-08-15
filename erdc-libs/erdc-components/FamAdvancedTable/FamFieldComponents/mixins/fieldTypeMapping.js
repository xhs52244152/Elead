define(['fam:store', 'fam:kit'], function () {
    const FamKit = require('fam:kit');
    return {
        data() {
            return {};
        },
        computed: {
            constConfigInfo() {
                return this.$store.getters.componentConf;
            }
        },
        methods: {
            // 处理组件名称，比如 单行文本和多行文本都是用CustomTextInput组件，但是数据配置的时候是text-area的，所以要转换一下，增加识别参数
            fnComponentHandle(componentName, isGetConfig = false, customParams) {
                // customParams 为自定义的参数，比如角色、群组下拉框 需要传入appName的字段
                let res = {
                    showComponent: this.fnGetShowComponent(componentName) // 获取实际显示的注册组件
                };
                if (isGetConfig) {
                    const componentConfig = this.fnGetConfigByType(componentName, customParams); // 获取组件固定配置
                    res['componentConfigs'] = { ...componentConfig }; // 解析结构，实现拷贝，避免引用对象修改了内容导致其他地方取默认出错
                }
                return res;
            },
            fnGetShowComponent(componentName) {
                let showComponent = FamKit.hyphenate(componentName || 'erd-input'); // 如果没有组件名称，默认给单行输入框显示
                // 处理特殊组件名称映射组件
                if (componentName) {
                    showComponent = this.$store.getters.getComponent(showComponent);
                }
                return showComponent;
            },
            // 根据组件名的特定规则，获取对应的下拉框配置
            fnGetConfigByType(componentName = '', customParams) {
                let config = {};
                _.each(this.constConfigInfo, (val, key) => {
                    let temp = customParams
                        ? {
                              ...val,
                              ...customParams
                          }
                        : val;
                    if (typeof temp === 'function') {
                        temp = temp(this.row);
                    }
                    if (FamKit.pascalize(componentName).includes(FamKit.pascalize(key))) {
                        config = temp;
                    }
                });
                return config;
            },
            // 操作，如果是选为空或非空，不需要显示组件，虚拟值也不需要显示组件
            fnOperatorHandle(item) {
                const hideComponent = this.$store.getters.getConditionsNeedHideComponent();
                let flag = !hideComponent.includes(item.operator);
                // 如果是选了为空或者非空，则清空组件选中值
                if (!flag) {
                    item.value = '';
                }
                return flag;
            },
            // 渲染组件额外配置
            generateAdditionalProp(data) {
                let { filter, inputType } = data || {};
                let component = this.fnGetShowComponent(filter?.componentName || '', filter.operVal);
                let prop = this.fnComponentHandle(filter?.componentName || '', true, filter) || {};
                prop = prop.componentConfigs || {};
                if (data.componentJson) {
                    try {
                        const componentJsonProps = JSON.parse(data.componentJson)?.props;
                        if (componentJsonProps.row) {
                            prop.row = {
                                ...prop.row,
                                ...componentJsonProps.row
                            };
                        }
                    } catch (e) {
                        // do nothing
                    }
                }
                if (component === 'erd-input' && inputType === 'Double') {
                    prop['type'] = 'number';
                }
                if (component === 'fam-member-select') {
                    prop['isgetdisable'] = false;
                }
                if (component === 'fam-dict') {
                    prop['itemName'] = data?.dataKey;
                }
                prop.filter = filter;
                return prop;
            }
        }
    };
});
