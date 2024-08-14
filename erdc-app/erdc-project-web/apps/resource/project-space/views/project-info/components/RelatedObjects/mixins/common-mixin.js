define(['erdcloud.kit'], function (ErdcKit) {
    return {
        components: {
            SvgCircle: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SvgCircle/index.js')),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamObjectSelectDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamObjectSelectDialog/index.js')
            )
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-space/views/project-info/locale/index.js'),
                i18nMappingObj: {
                    deleteSuccess: this.getI18nByKey('deleteSuccess')
                }
            };
        },
        methods: {
            getCompletionRate(row, percentSign = '') {
                let percentKey = 'erd.cloud.ppm.project.entity.Project#completionRate';
                let percent = row[percentKey] ? (+row[percentKey]).toFixed(1) : 0;
                return percentSign ? percent + percentSign : percent / 100;
            },
            /**
             * 创建父项目、子项目关系
             * @param {String} parentRef
             * @param {Array[String]} childrenRefs
             */
            createLink(parentRef, childrenRefs = []) {
                const _this = this;
                return new Promise((resolve, reject) => {
                    let rawDataVoList = childrenRefs.map((child) => {
                        return {
                            attrRawList: [
                                {
                                    attrName: 'roleAObjectRef',
                                    value: parentRef
                                },
                                {
                                    attrName: 'roleBObjectRef',
                                    value: child
                                }
                            ]
                        };
                    });

                    _this.$loading();
                    this.$famHttp({
                        url: '/ppm/saveOrUpdate',
                        method: 'POST',
                        data: {
                            className: 'erd.cloud.ppm.project.entity.ProjectLink',
                            rawDataVoList
                        }
                    })
                        .then((resp) => {
                            _this.$message.success('操作成功');
                            resolve(resp);
                        })
                        .catch(() => {
                            reject();
                        })
                        .finally(() => {
                            _this.$loading().close();
                        });
                });
            },
            // 通用删除
            deleteByIds(items) {
                return new Promise((resolve, reject) => {
                    if (!items || items.length < 1) {
                        this.$message.info('未勾选数据');
                        reject();
                        return false;
                    }
                    this.$confirm('是否移除所选数据?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    })
                        .then(() => {
                            // 获取linkOid
                            let oidList = items.map((item) => {
                                return item.oid;
                            });

                            let className = items[0]?.idKey;

                            this.$famHttp({
                                url: '/base/deleteByIds',
                                method: 'DELETE',
                                params: {},
                                data: {
                                    category: 'DELETE',
                                    className,
                                    oidList
                                }
                            })
                                .then((resp) => {
                                    this.$message({
                                        type: 'success',
                                        message: this.i18nMappingObj['deleteSuccess'],
                                        showClose: true
                                    });
                                    resolve(resp);
                                })
                                .catch(() => {
                                    reject();
                                });
                        })
                        .catch(() => {
                            this.$message({
                                type: 'info',
                                message: '已取消移除'
                            });
                        });
                });
            },
            /**
             * 详情跳转
             */
            onDetail(row) {
                this.$router.push({
                    path: 'space/project-space/projectInfo',
                    query: {
                        pid: row['erd.cloud.ppm.project.entity.Project#oid']
                    }
                });
            },
            getSlotsName(slotsField) {
                return slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    ?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            }
        }
    };
});
