define(['erdcloud.kit', ELMP.resource('ppm-store/index.js')], function (ErdcKit, ppmStore) {
    return {
        template: `
            <fam-participant-select
                ref="famMemberSelect"
                v-model="dataValue"
                :default-value="defaultValue"
                v-bind="$attrs"
                search-scop="container"
                :params="params"
                :query-params="queryParams"
                :showType="['USER']"
                queryScope="teamRole"
                @change="onChange"
            ></fam-participant-select>
        `,
        components: {
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            value: String,
            formData: Object
        },
        data() {
            return {
                params: {},
                queryParams: {
                    url: '/ppm/team/getUsersByContainer',
                    method: 'GET',
                    data: {
                        containerOid: ppmStore.state?.projectInfo?.containerRefOid || '',
                        roleCode: 'PM',
                        isQueryByPath: false,
                        getAllUser: true
                    }
                },
                defaultValue: [],
                dataValue: [],
                num: 1 // 初始值，用于判断formData.resAssignments是否进行搜索查询，默认第一次进来不需要
            };
        },
        watch: {
            'formData.responsiblePerson': {
                handler(newVal) {
                    if (_.isArray(newVal)) {
                        this.dataValue = newVal.map((item) => item.oid);
                        this.defaultValue = newVal;
                    } else if (_.isObject(newVal)) {
                        this.dataValue = newVal.oid;
                        this.defaultValue = newVal;
                    } else if (_.isEmpty(newVal)) {
                        this.defaultValue = [];

                        this.dataValue = '';
                    }
                },
                immediate: true
            },
            'formData.resAssignments': {
                handler(newVal) {
                    let that = this;
                    _.debounce(function () {
                        that.params = {
                            roleCode: newVal || ''
                        };
                        that.queryParams.data.roleCode = newVal;
                        that.queryParams.data.containerOid = ppmStore.state.projectInfo.containerRefOid;
                        // 切换资源角色要刷新责任人可选数据
                        if (that.num > 3) that.$refs?.famMemberSelect?.searchInput('', 'search');
                    }, 300)();
                },
                immediate: true
            }
        },
        methods: {
            onChange(val, data) {
                this.num++;
                this.$emit('input', val, data);
                this.$emit('change', val, data);
                this.$emit('update:value', val, data);
            }
        }
    };
});
