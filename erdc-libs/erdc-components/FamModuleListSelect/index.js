/**
 * # 二级菜单
    vue组件components引入
    # 组件声明
    components: {
            FamSecondMenu: FamKit.asyncComponent(ELMP.resource('erdc-components/FamSecondMenu/index.js'))

    },
    # 页面调用 绑定value数据类型 1-单选为字符串oid 2-多选为数组[oid]
    <fam-second-menu
    v-model="value"
    :default-value="defaultValue"
    ref="FamModuleListSelect"
    @change="onChange"
    ></fam-second-menu>
    # 获取组件实例
    this.$refs.FamModuleListSelect
 * 
**/

define([
    'text!' + ELMP.resource('erdc-components/FamModuleListSelect/index.html'), // template
    'EventBus',
    'css!' + ELMP.resource('erdc-components/FamModuleListSelect/style.css'), // css
    'erdc-kit'
], function (template, EventBus) {
    const FamUtils = require(ELMP.resource('fam-utils/index.js'));

    return {
        template,
        props: {
            // 跳转按钮名称
            jumpName: {
                type: String,
                default: '查看所有项目'
            },
            optionsList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            defaultProduct: {
                type: String,
                default: ''
            },
            labelKey: {
                type: String,
                default: () => {
                    return '';
                }
            },
            valueKey: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // 动态国际化 必须在data里面设置
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamModuleListSelect/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    enter: this.getI18nByKey('请输入'),
                    recently: this.getI18nByKey('最近打开项目'),
                    collect: this.getI18nByKey('收藏项目')
                },
                searchValue: '',
                selectModule: '',
                selectList: [
                    {
                        label: '最近打开项目',
                        children: [
                            {
                                label: '平台需求池',
                                value: 'require'
                            },
                            {
                                label: '前端组件库项目',
                                value: 'componentProject'
                            },
                            {
                                label: '具体项目名称',
                                value: 'projectName1'
                            },
                            {
                                label: '具体项目名称',
                                value: 'projectName2'
                            },
                            {
                                label: '具体项目名称',
                                value: 'projectName3'
                            }
                        ]
                    },
                    {
                        label: '收藏项目',
                        children: [
                            {
                                label: '平台需求池',
                                value: 'require'
                            },
                            {
                                label: '前端组件库项目',
                                value: 'componentProject'
                            },
                            {
                                label: '具体项目名称',
                                value: 'projectName1'
                            },
                            {
                                label: '具体项目名称',
                                value: 'projectName2'
                            },
                            {
                                label: '具体项目名称',
                                value: 'projectName3'
                            }
                        ]
                    }
                ],
                viewData: []
            };
        },
        mounted() {
            this.viewData = this.optionsList;
        },
        watch: {
            defaultProduct: {
                immediate: true,
                handler(n, o) {
                    this.selectModule = n;
                }
            },
            selectModule(n, o) {
                //
                EventBus.emit('jump:productList', {
                    key: 'Product',
                    oid: n
                });
            }
        },
        methods: {
            toProduct(data) {
                _.each(this.viewData[0].children, (item) => {
                    if (data === item.oid) {
                        this.getContainerInfo(item.containerRef);
                    }
                });
            },
            // 获取容器详细信息
            getContainerInfo(oid) {
                this.$famHttp({
                    url: '/fam/container/getCurrentContainerInfo',
                    data: { oid },
                    method: 'get'
                }).then((res) => {
                    this.$store.state.app.product = res?.data;
                });
            },
            toJump() {
                EventBus.emit('jump:productList', {
                    key: 'productList'
                });
            },
            // 搜索
            search(val) {
                FamUtils.debounceFn(() => {
                    let [...arr] = this.optionsList;

                    this.filterColumns(val, arr);
                }, 300);
            },
            // 过滤数据
            filterColumns(val, data) {
                if (!val) {
                    this.viewData = this.optionsList;
                    return true;
                }
                const searchData = [];
                const res = val.replace(/\s/gi, '');
                let searchArr = data;
                searchArr.forEach((val) => {
                    val.children.forEach((e) => {
                        let { name } = e;
                        if (name.includes(res)) {
                            let obj = {
                                label: val.label,
                                children: []
                            };
                            if (searchData.indexOf(e) == '-1') {
                                obj['children'].push(e);
                                searchData.push(obj);
                            }
                        }
                    });
                });
                //

                this.viewData = searchData;
            }
        }
    };
});
