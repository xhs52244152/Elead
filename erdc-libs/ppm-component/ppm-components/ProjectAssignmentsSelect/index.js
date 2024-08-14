define([
    'text!' + ELMP.resource('ppm-component/ppm-components/ProjectAssignmentsSelect/index.html'),
    ELMP.resource('ppm-store/index.js')
], function (template, store) {
    return {
        props: {
            value: String,
            onAssignmentsChange: Function,
            resAssignmentsValue: String,
            projectOid: String,
            props: Object
        },
        template,
        data() {
            return {
                dataValue: ''
            };
        },
        computed: {
            curProjectOid() {
                return this.projectOid || this.$route.query.pid;
            },
            selectProps() {
                let roleCompName = 'custom-virtual-role-select';
                let roleComponentConf = this.fnComponentHandle(roleCompName, true, {});
                // 接口配置
                if (this.curProjectOid) {
                    roleComponentConf.componentConfigs = {
                        url: '/ppm/plan/v1/get/containerTeamRole',
                        method: 'get',
                        className: store.state.classNameMapping.project,
                        params: {
                            projectId: this.curProjectOid.split(':')?.[2] || ''
                        },
                        viewProperty: 'roleName',
                        valueProperty: 'roleCode'
                    };
                } else {
                    roleComponentConf.componentConfigs = {
                        url: '/fam/role/list',
                        method: 'get',
                        params: {
                            appName: 'PPM',
                            isGetVirtualRole: false
                        },
                        viewProperty: 'displayName',
                        valueProperty: 'identifierNo'
                    };
                }

                return Object.assign({
                    multiple: false,
                    clearable: true,
                    filterable: true,
                    treeSelect: true, // 树选择器
                    showNodeContext: false, // 是否将节点路径显示在选择器上
                    treeProps: {
                        value: 'roleCode'
                    },
                    row: {
                        componentName: roleCompName,
                        requestConfig: roleComponentConf.componentConfigs || ''
                    },
                    placeholder: '请选择团队角色'
                }, this.props || {});
            }
        },
        watch: {
            value: {
                handler(val) {
                    this.dataValue = val || this.resAssignmentsValue;
                },
                immediate: true
            },
            dataValue(val) {
                this.$emit('input', val);
                this.$emit('change', val);
            }
        },
        mounted() {},
        methods: {
            handleChange(val, option) {
                this.$emit('valueChange', {value: val, option});
                if (_.isFunction(this.onAssignmentsChange)) {
                    this.onAssignmentsChange(val);
                }
            }
        }
    };
});
