define(['erdcloud.kit'], function (ErdcKit) {
    const FamKit = require('fam:kit');
    const TreeUtil = FamKit.TreeUtil;
    return {
        template: `
            <div>
                <erd-ex-dialog
                    :visible.sync="dialogVisible"
                    :title="$t('addMembers')"
                    size="large"
                >
                    <div style="margin-bottom: var(--largeSpace);display: flex;justify-content: space-between;">
                        <div class="add-role-left">
                            <erd-input
                                style="width: 220px"
                                v-model.trim="searchValue"
                                class="fam-team-tree__search mr-normal"
                                suffix-icon="erd-iconfont erd-icon-search"
                                :placeholder="$t('pleaseEnterKeywords')"
                                clearable
                                autofocus
                            >
                            </erd-input>
                        </div>
                    </div>
                    <team-table
                        ref="teamTable"
                        :table-data="tableData"
                        :readonly="true"
                    ></team-table>
                    <template #footer>
                        <erd-button
                            type="primary"
                            @click="handleConfirm"
                            >{{ i18n.confirm }}</erd-button
                        >
                        <erd-button @click="handleCancel">{{ i18n.cancel }}</erd-button>
                    </template>
                </erd-ex-dialog>
            </div>
        `,
        props: {
            visible: Boolean,
            containerTeamRef: String
        },
        components: {
            Team: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js')),
            TeamTable: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-project-change/components/TeamInfo/components/TeamTable/index.js')
            ),
            OpenCreateTeam: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/OpenCreateTeam/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-ppm-project-change/locale/index.js'),
                searchValue: '',
                createTeamOid: '',
                teamDialogVisible: false,
                tableData: [],
                showParticipantType: ['USER', 'GROUP', 'ROLE'],
                roleRef: '',
                currentRow: {},
                currentRole: {}
            };
        },
        computed: {
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            dialogTitle() {
                return this.i18n.role;
            },
            pathToCurrentRole() {
                return this.currentRole
                    ? TreeUtil.findPath(this.tableData, {
                          target: this.currentRole
                      }).concat(this.currentRole)
                    : [];
            }
        },
        watch: {
            searchValue(keyword) {
                this.debouncedSearch(keyword);
            }
        },
        created() {
            this.fnGetRoleList();
            this.debouncedSearch = _.debounce((keyword) => {
                this.search(keyword);
            }, 300);
        },
        methods: {
            search(keyword) {
                this.$refs.teamTable.searchTable(keyword);
            },
            handleConfirm() {
                let result;
                let { xTable } = this.$refs.teamTable.$refs.famErdTable.$refs;
                const selectedData = xTable.getCheckboxRecords();
                const tableData = xTable.tableData;
                if (tableData.length === selectedData.length) result = selectedData;
                else result = [...new Set([...(this.getData(tableData, selectedData) || []), ...selectedData])];
                this.$emit('confirm', result);
                this.dialogVisible = false;
            },
            getData(tableData, selectData, result = []) {
                for (let i = 0; i < tableData.length; i++) {
                    let item = tableData[i];
                    if (
                        selectData.filter((res) => res.parentId === item.id).length &&
                        !result.filter((res) => res.id === item.id).length
                    ) {
                        result.push(item);
                        return this.getData(tableData, [item], result);
                    }
                }
                return result;
            },
            handleCancel() {
                this.dialogVisible = false;
            },
            fnGetRoleList() {
                this.$famHttp({
                    url: `/fam/team/selectById`,
                    params: {
                        teamOid: this.containerTeamRef
                    },
                    method: 'get'
                })
                    .then((res) => {
                        this.currentTeam = res?.data || {}; // 团队对象
                        this.createTeamOid = res?.data?.oid || ''; // 团队oid
                        this.teamBaseInfo = res?.data || {};
                        // 处理角色和参与者的树显示数据源
                        let roleList = res?.data?.teamRoleLinkDtos || []; // 角色列表
                        let rolePrincipalLinks = []; // 把角色中所有的参与者解析出来
                        let roleChildren = []; // 子角色
                        // 特殊处理 组织默认团队 不可添加子角色
                        if (this.currentTeam?.number === 'T20200425005') {
                            this.showParticipantType = ['USER', 'GROUP'];
                        } else {
                            this.showParticipantType = ['USER', 'GROUP', 'ROLE'];
                        }
                        // 取出所有children，
                        const callbackChildren = (array) => {
                            array.forEach((item) => {
                                // 后端没有返回id时，截取oid最后一个值作为id
                                if (!item?.id) item.id = item?.oid?.split(':')?.[2];

                                if (item?.rolePrincipalLinks?.length) {
                                    rolePrincipalLinks.push(
                                        ...(item.rolePrincipalLinks || []).map((ite) => {
                                            ite.parentId = item.id;
                                            return ite;
                                        })
                                    );
                                }
                                if (item?.children?.length) {
                                    roleChildren.push(
                                        ...(item.children || []).map((ite) => {
                                            ite.parentId = item.id;
                                            ite.principalName = ite.roleName;
                                            ite.principalTarget = 'ROLE';
                                            return ite;
                                        })
                                    );
                                    callbackChildren(item.children);
                                }
                            });
                        };
                        roleList.forEach((item) => {
                            // 角色增加标识
                            item.principalTarget = 'ROLE';
                            item.parentId = '-1'; // 防止vxe-table由于没找到parentId而导致的表格数据显示不出来
                            item['principalName'] = item.roleName;
                            if (!item.id) {
                                item.id = item.oid;
                            }
                            // 把每个角色下的参与者数据增加一个parentId，并且解析数据放到一个数组中
                            rolePrincipalLinks.push(
                                ...(item.rolePrincipalLinks || []).map((ite) => {
                                    ite.parentId = item.id;
                                    return ite;
                                })
                            );
                            // children字段存储子角色
                            if (item.children?.length) {
                                roleChildren.push(
                                    ...(item.children || []).map((ite) => {
                                        ite.parentId = item.id;
                                        ite.principalName = ite.roleName;
                                        ite.principalTarget = 'ROLE';
                                        return ite;
                                    })
                                );
                                callbackChildren(item.children);
                            }
                        });
                        this.tableData = [...roleList, ...rolePrincipalLinks, ...roleChildren]; // 解析角色和参与者，放一起到表格数据源显示 + 子角色
                        // 表格是树形，但是数据之前全部抛出为一层，这里将数据转换排序方式，
                        this.tableData = [
                            ...this.tableData.filter((item) => item.principalTarget === 'ROLE'),
                            ...this.tableData.filter((item) => item.principalTarget === 'GROUP'),
                            ...this.tableData.filter((item) => item.principalTarget === 'USER')
                        ];
                        if (this.tableData.length > 0) {
                            this.tableData = this.tableData?.map((item) => {
                                return {
                                    ...item,
                                    code: item?.code || '--',
                                    userCode: item?.userCode || '--',
                                    mobile: item?.mobile || '--',
                                    email: item?.email || '--',
                                    department: item?.department || '--'
                                };
                            });
                        }
                        this.$nextTick(() => {
                            const $table = this.$refs['ProRoleTable']?.$table;
                            $table?.updateData();
                            $table?.setAllTreeExpand(true);
                        });
                    })
                    .catch((err) => {})
                    .finally(() => {
                        this.loading = false;
                    });
            }
        }
    };
});
