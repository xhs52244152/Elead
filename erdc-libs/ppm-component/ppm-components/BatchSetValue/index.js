define([
    'text!' + ELMP.resource('ppm-component/ppm-components/BatchSetValue/index.html'),
    ELMP.resource('ppm-utils/index.js')
], function (template, ppmUtils) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'BatchSetValue',
        template,
        components: {
            SetValue: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/BatchSetValue/components/SetValue/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.resource('ppm-component/ppm-components/BatchSetValue/locale/index.js'),
                loading: false,
                disabledTreeData: ''
            };
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            vm: {
                type: Object,
                default: {}
            },
            tableData: {
                type: Array,
                default: () => {
                    return [];
                },
                required: true
            },
            className: {
                type: String,
                required: true
            },
            containerRef: String
        },
        watch: {
            vm: {
                immediate: true,
                async handler(nv) {
                    const projectId = nv?.projectOid?.split(':')?.[2];
                    const roleOid = nv?.tableSelectData?.map((item) => item?.Assignments?.[0]?.ResourceUID);

                    if (projectId && roleOid.length) {
                        // 检查 roleOid 是否存在
                        try {
                            // 获取项目下所有角色
                            let containerTeamRoles = await ppmUtils.getContainerTeamRoles(this.projectId);
                            if (containerTeamRoles?.length) {
                                // 检查是否存在数据
                                const [firstRoleOid] = roleOid;
                                const filteredData = containerTeamRoles.filter(
                                    (item) => item.roleBObjectRef === firstRoleOid
                                );
                                this.disabledTreeData = filteredData.length > 0 ? filteredData[0].oid : '';
                            }
                        } catch (error) {
                            console.error('Error fetching data:', error);
                        }
                    }
                }
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            innerContainerRef() {
                return this.containerRef || this.$store.state.space?.context?.oid || this.getContainerRef;
            },
            // 选中数据上下文id
            getContainerRef() {
                let oid = '';
                if (_.isArray(this.tableData) && this.tableData.length) {
                    ({ oid } = _.find(this.tableData[0]?.attrRawList, (item) =>
                        new RegExp('containerRef$').test(item.attrName)
                    )) || {};
                }
                return oid;
            }
        },
        methods: {
            // 批量更改属性
            batchChangeAttrClick() {
                let tableData = ErdcKit.deepClone(this.$refs?.setValueRef?.getAttrData() || []);
                if (_.every(tableData, (item) => !item.value)) {
                    return this.$message.warning(this.i18n['fillValueProperty']);
                }
                tableData = _.chain(tableData)
                    .filter((item) => item.value)
                    .map((item) => _.pick(item, 'attrName', 'value'))
                    .value();
                this.batchCheckOut(tableData);
            },
            // 批量检出
            batchCheckOut(tableData) {
                this.loading = true;
                let data = {
                    action: 'UPDATE',
                    className: this.className,
                    // containerRef: this.innerContainerRef,
                    rawDataVoList: []
                };
                data.rawDataVoList = _.map(this.tableData, (item) => {
                    // const classifyReferenceRef =
                    //     _.find(item?.attrRawList, (item) =>
                    //         new RegExp('classifyReference$').test(item?.attrName)
                    //     ) || {};
                    // const typeReferenceRef =
                    //     _.find(item?.attrRawList, (item) =>
                    //         new RegExp('typeReference$').test(item?.attrName)
                    //     ) || {};
                    return {
                        action: 'UPDATE',
                        attrRawList: tableData,
                        className: this.className,
                        oid: item?.['oid']
                        // containerRef: this.innerContainerRef,
                        // classifyReference:
                        //     classifyReferenceRef?.oid ||
                        //     item[`${this.className}#classifyReference`] ||
                        //     item['classifyReference'] ||
                        //     '',
                        // typeReference:
                        //     typeReferenceRef?.oid ||
                        //     item[`${this.className}#typeReference`] ||
                        //     item?.['typeReference'] ||
                        //     ''
                    };
                });
                this.batchChangeAttrApi(data)
                    .then((changeAttrRes) => {
                        if (changeAttrRes.success) {
                            // 这里的res.data是 旧版本->新版本 的映射表 , data是需要更新的key和值
                            this.batchCheckIn();
                        }
                    })
                    .catch(() => {
                        this.loading = false;
                    });
                // this.batchCheckOutApi()
                //     .then((res) => {
                //         if (res.success) {

                //         }
                //     })
                //     .catch(() => {
                //         this.loading = false;
                //     });
            },
            // 批量检出接口
            batchCheckOutApi() {
                return this.$famHttp({
                    url: '/fam/common/batch/checkout',
                    method: 'post',
                    data: _.map(this.tableData, 'oid'),
                    className: this.className
                });
            },
            // 批量检入
            batchCheckIn(oidMap, updateData) {
                this.$message.success('批量更改属性成功');
                this.$emit('set-value-success');
                // let newOids = _.values(oidMap);
                // this.batchCheckInApi(newOids)
                //     .then((res) => {
                //         if (res.success) {

                //         }
                //     })
                //     .finally(() => {
                //         this.loading = false;
                //     });
            },
            // 批量检入接口
            batchCheckInApi(data) {
                return this.$famHttp({
                    url: '/fam/common/batch/checkin',
                    method: 'put',
                    data,
                    className: this.className
                });
            },
            // 批量更改属性接口
            batchChangeAttrApi(data) {
                return this.$famHttp({
                    url: '/fam/saveOrUpdate',
                    method: 'post',
                    data,
                    className: this.className
                });
            }
        }
    };
});
