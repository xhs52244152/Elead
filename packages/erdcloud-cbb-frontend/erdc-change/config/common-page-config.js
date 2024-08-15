define([
    ELMP.func('erdc-change/config/viewConfig.js'),
    ELMP.func('erdc-change/utils.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-change/locale/index.js')
], function (viewCfg, utils, cbbUtils, locale) {
    const ErdcKit = require('erdc-kit');
    const FamStore = require('erdcloud.store');
    const FamHttp = require('erdcloud.http');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);

    // 变更报告中创建变更请求查询attr接口
    const getAttr = function (oid) {
        FamHttp({
            url: '/fam/attr',
            method: 'GET',
            data: {
                oid,
                className: oid.split(':')[1]
            }
        }).then((resp) => {
            let result = resp.data;
            let data = ErdcKit.deserializeAttr(result.rawData, {
                valueMap: {
                    'containerRef': ({ displayName }) => {
                        return displayName || '';
                    },
                    'folderRef': ({ displayName }) => {
                        return displayName || '';
                    },
                    'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        return displayName || '';
                    },
                    'lifecycleStatus.status': ({ displayName }) => {
                        return displayName || '';
                    },
                    'lock.locker': (e) => {
                        return e || '';
                    },
                    'iterationInfo.state': ({ displayName }) => {
                        return displayName || '';
                    },
                    'teamRef': ({ displayName }) => {
                        return displayName || '';
                    },
                    'teamTemplateRef': ({ displayName }) => {
                        return displayName || '';
                    },
                    'typeReference': ({ displayName }) => {
                        return displayName || '';
                    },
                    'cycleTime': ({ displayName }) => {
                        return displayName || '';
                    },
                    'ownedByRef': ({ displayName }) => {
                        return displayName;
                    },
                    'createBy': ({ displayName }) => {
                        return displayName;
                    },
                    'updateBy': ({ displayName }) => {
                        return displayName;
                    },
                    'organizationRef': ({ displayName }) => {
                        return displayName || '';
                    }
                }
            });
            data['isCreated'] = true;
            FamStore.state.Change.changeTaskList.push(data);
        });
    };

    const createOperation = function (router, route, vm) {
        let visible = true;
        let { destroy } = utils.useFreeComponent({
            template: `
                <erd-ex-dialog
                    :visible.sync="visible"
                    :title="i18n.tips"
                    size="mini"
                    :show-close="false"
                    custom-class="success-create-project"
                    >
                    <div class="tip" style="display: flex;">
                        <i style="margin-right: 4px;font-size: 24px;" class="el-notification__icon el-icon-success"></i>
                        <div class="tip-right" >
                            <p style=" font-weight: 700;font-size: 16px;margin-bottom: 8px;">{{i18n.createSuccess}}</p>
                            <span style="font-size: 12px">{{i18n.doSome}}</span>
                        </div>
                    </div>
                    <div class="btn-list" style="text-align: center;margin-top: 20px;">
                        <erd-button style="margin-left: 2px;" @click="handleClick('goFlow')">{{i18n.viewProcess}}</erd-button>
                        <erd-button style="margin-left: 2px;" @click="handleClick('back')">{{i18n.closePage}}</erd-button>
                    </div>
                </erd-ex-dialog>
            `,
            data() {
                return {
                    i18nPath: ELMP.func('erdc-change/locale/index.js'),
                    visible: false
                };
            },
            created() {
                this.visible = visible;
            },
            methods: {
                handleClick(val) {
                    let routeMapping = {
                        back: () => {
                            vm.$store.dispatch('route/delVisitedRoute', route).then(() => {
                                router.push({
                                    path: `${route?.meta?.prefixRoute}/change/list`,
                                    query: _.pick(vm.$route.query, (value, key) => {
                                        return ['pid', 'typeOid'].includes(key) && value;
                                    })
                                });
                            });
                            this.visible = false;
                            return true;
                        },
                        goFlow: () => {
                            vm.$store.dispatch('route/delVisitedRoute', route).then(() => {
                                if (window.__currentAppName__ === 'erdc-portal-web') {
                                    vm.$router.push({
                                        path: '/biz-bpm/process/todos'
                                    });
                                } else {
                                    window.open(
                                        `/erdc-app/erdc-portal-web/index.html#/biz-bpm/process/todos`,
                                        'erdc-portal-web'
                                    );
                                    vm.goBack();
                                }
                            });

                            this.visible = false;
                            return true;
                        }
                    };
                    routeMapping[val] && routeMapping[val]() && destroy();
                }
            }
        });
    };

    const handleFilesColumns = function () {
        return [
            {
                prop: 'seq', // 列数据字段key
                type: 'seq', // 特定类型
                title: ' ',
                width: 48,
                align: 'center' //多选框默认居中显示
            },
            {
                prop: 'icon', // 属性名
                title: i18n['图标'], // 字段名
                width: 60
            },
            {
                prop: 'name',
                title: i18n['名称'],
                minWidth: 200
            },
            {
                prop: 'createTime',
                title: i18n['创建时间'],
                minWidth: 140
            },
            {
                prop: 'size',
                title: i18n['文件大小'],
                minWidth: 100
            },
            {
                prop: 'operation',
                title: i18n['操作'],
                minWidth: 60
            }
        ];
    };

    return (customConfig) => {
        return {
            // 问题报告
            [viewCfg.prChangeTableView.className]: () => {
                const router = require('erdcloud.router');
                const { $router, $route } = router.app;
                // const type = $route?.query?.type || '';
                let defaultCreateConfig = {
                    title: i18n.createECI,
                    editableAttr: ['containerRef'],
                    layoutName: 'CREATE',
                    showDraftBtn: true,
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/BaseInfo/index.js')),
                        formSlots: {
                            'object-list': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/AffectedObjectList/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            changeType: 'PR'
                        },
                        formSlotsProps() {
                            return {
                                files: {
                                    'class-name': viewCfg.prChangeTableView.className,
                                    'isUrlBtn': false,
                                    //变更附件自定义表头
                                    'columns': handleFilesColumns()
                                }
                            };
                        }
                    },
                    hooks: {
                        async beforeSubmit({ formData, next, isSaveDraft, vm }) {
                            //草稿校验名称不能为空
                            if (isSaveDraft) {
                                let nameOptions = formData.attrRawList.find((item) => item.attrName == 'name');
                                //没有触发过名称、触发过名称再清空
                                if (!nameOptions || !nameOptions?.value) {
                                    return vm.$message.warning(i18n['名称不能为空']);
                                }
                            }
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.containerRef = vm.$store?.state?.app?.container?.oid;
                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'organizationRef' && Array.isArray(el.value)) {
                                    el.value = el.value[0].oid || '';
                                }
                                if (el.attrName === 'classifyReference' && el.value) {
                                    el.value = el.value?.oid || '';
                                }
                            });
                            // 类型
                            let typeReference =
                                _.find(formData.attrRawList, (item) => item.attrName === 'typeReference')?.value || '';
                            let contentSet = [];
                            let roleBObjectRef = [];
                            // 受影响的对象
                            let objectData =
                                (await vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.getData()) || [];
                            if (objectData.length) {
                                objectData.forEach((item) => {
                                    roleBObjectRef.push({
                                        action: 'CREATE',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.reportedAgainst
                                    });
                                });
                            } else if (!isSaveDraft) {
                                //保存需要校验影响对象不能为空，草稿无需
                                return vm.$message.warning(i18n['未增加受影响对象']);
                            }
                            let ObjectForm = objectData.length
                                ? {
                                      relationList: roleBObjectRef,
                                      associationField: 'roleAObjectRef'
                                  }
                                : {};
                            // 附件
                            let attachmentList =
                                await vm?.$refs?.detail?.[0]?.$refs?.['files']?.[0]?.submit(isSaveDraft);
                            if (!attachmentList.status) return;
                            _.each(attachmentList.data, (item) => {
                                contentSet.push(item);
                            });
                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) => !['typeReference', 'files'].includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                typeReference,
                                contentSet,
                                ...ObjectForm
                            };
                            delete formData.oid;
                            // 保存草稿
                            if (isSaveDraft) formData.isDraft = true;
                            let tip = isSaveDraft ? '草稿创建成功' : '创建成功';

                            // 应后端要求，创建对象增加appName参数
                            formData.appName = cbbUtils.getAppNameByResource();

                            next(formData, tip);
                        },
                        // eslint-disable-next-line no-unused-vars
                        afterSubmit({ responseData, vm, isSaveDraft }) {
                            if (!isSaveDraft) {
                                createOperation($router, $route, vm);
                            } else {
                                vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                    $router.push({
                                        path: `${$route?.meta?.prefixRoute}/change/list`,
                                        query: _.pick(vm.$route.query, (value, key) => {
                                            return ['pid', 'typeOid'].includes(key) && value;
                                        })
                                    });
                                });
                            }
                        }
                    }
                };

                let defaultEditConfig = {
                    title: i18n.editECI,
                    editableAttr: ['containerRef', 'typeReference'],
                    isNotTabs: true,
                    layoutName: 'UPDATE',
                    showDraftBtn: true,
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/BaseInfo/index.js')),
                        formSlots: {
                            'object-list': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/AffectedObjectList/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            containerRef: FamStore?.state?.space?.context?.oid || '',
                            changeType: 'PR'
                        },
                        formSlotsProps(vm) {
                            return {
                                files: {
                                    className: viewCfg.prChangeTableView.className,
                                    isUrlBtn: false,
                                    oid: vm?.containerOid,
                                    isCheckout: true,
                                    //变更附件自定义表头
                                    columns: handleFilesColumns()
                                }
                            };
                        }
                    },
                    modelMapper: {
                        'containerRef': (data, { oid }) => {
                            return oid || '';
                        },
                        'typeReference': (data, { oid }) => {
                            return oid || '';
                        },
                        'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lifecycleStatus.status': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'iterationInfo.state': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'templateInfo.templateReference': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'title': (data, { value }) => {
                            return value || '';
                        },
                        //基本信息添加文件夹
                        'folderRef': (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        // 关闭
                        // eslint-disable-next-line no-unused-vars
                        // beforeCancel: function ({ formData, goBack, vm }) {
                        //     const router = require('erdcloud.router');
                        //     const { $router, $route } = router.app;
                        //     vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                        //         // 编辑页点击关闭，草稿状态返回列表页、正常对象返回详情页
                        //         if (vm?.sourceData?.['lifecycleStatus.status']?.value === 'DRAFT') {
                        //             $router.push({
                        //                 // name: `${$route?.meta?.parentPath}/changeManageList`
                        //                 path: `${$route?.meta?.prefixRoute}/change/list`
                        //             });
                        //         } else {
                        //             $router.push({
                        //                 // name: `${$route?.meta?.parentPath}/changePrDetail`,
                        //                 path: `${$route?.meta?.prefixRoute}/change/prDetail`,
                        //                 query: {
                        //                     pid: $route.query?.pid,
                        //                     oid: $route.query?.oid,
                        //                     routeRefresh: true,
                        //                     routeKey: vm?.containerOid
                        //                 }
                        //             });
                        //         }
                        //     });
                        // },
                        // beforeEcho: function ({ rawData, next }) {
                        //     let data = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             'containerRef': ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             'typeReference': ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lifecycleStatus.status': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'iterationInfo.state': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'templateInfo.templateReference': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'title': ({ value }) => {
                        //                 return value || '';
                        //             },
                        //             'organizationRef': ({ value, displayName }) => {
                        //                 return {
                        //                     oid: value,
                        //                     name: displayName
                        //                 };
                        //             },
                        //             //基本信息添加文件夹
                        //             'folderRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             }
                        //         }
                        //     });
                        //     next(data);
                        // },
                        async beforeSubmit({ formData, next, isSaveDraft, sourceData, vm }) {
                            //草稿校验名称不能为空
                            if (isSaveDraft) {
                                let nameOptions = formData.attrRawList.find((item) => item.attrName == 'name');
                                //没有触发过名称、触发过名称再清空
                                if (!nameOptions || !nameOptions?.value) {
                                    return vm.$message.warning(i18n['名称不能为空']);
                                }
                            }
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.containerRef = vm.$store?.state?.app?.container?.oid;
                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'organizationRef' && el.value) {
                                    let data = el.value;
                                    if (el.value?.oid) data = 'OR:' + el.value.oid.key + ':' + el.value.oid.id;
                                    el.value = data || '';
                                }
                                if (el.attrName === 'classifyReference' && el.value) {
                                    el.value = el.value?.oid || '';
                                }
                            });
                            // 类型
                            let typeReference =
                                _.find(formData.attrRawList, (item) => item.attrName === 'typeReference')?.value || '';
                            let contentSet = [];
                            let roleBObjectRef = [];
                            // 受影响的对象
                            let objectData =
                                (await vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.getData()) || [];
                            //当编辑草稿数据时,要取受影响的对象所有数据，当保存时校验,草稿无需校验
                            if (sourceData['lifecycleStatus.status']?.value == 'DRAFT' && !isSaveDraft) {
                                objectData =
                                    (await vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.tableData) || [];
                            }
                            if (objectData.length) {
                                objectData.forEach((item) => {
                                    roleBObjectRef.push({
                                        action: 'CREATE',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.reportedAgainst
                                    });
                                });
                            }
                            //取影响对象列表所有数据，包括之前已经关联的数据,保存时校验，草稿无需
                            let objectTabaleData =
                                (await vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.tableData) || [];
                            if (!objectTabaleData.length && !isSaveDraft) {
                                //保存需要校验影响对象不能为空，草稿无需
                                return vm.$message.warning(i18n['未增加受影响对象']);
                            }
                            let ObjectForm = objectData.length
                                ? {
                                      relationList: roleBObjectRef,
                                      associationField: 'roleAObjectRef'
                                  }
                                : {};
                            // 附件
                            let attachmentList =
                                await vm?.$refs?.detail?.[0]?.$refs?.['files']?.[0]?.submit(isSaveDraft);
                            if (!attachmentList.status) return;
                            _.each(attachmentList.data, (item) => {
                                if (item.role !== 'PRIMARY') contentSet.push(item);
                            });
                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) => !['typeReference', 'files'].includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                typeReference,
                                contentSet,
                                ...ObjectForm
                            };
                            // const state = sourceData['lifecycleStatus.status'].value;
                            // 保存草稿
                            if (isSaveDraft) {
                                formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                                formData.isDraft = true;
                            }
                            let tip = '编辑成功';

                            next(formData, tip);
                        },
                        afterSubmit({ responseData, vm, isSaveDraft }) {
                            // const pathName = isSaveDraft ? 'changeManageList' : 'changePrDetail';

                            //判读当前数据是草稿还是正式数据
                            const state = vm.sourceData?.['lifecycleStatus.status'];
                            let stateIsDraft = state?.value === 'DRAFT' ? true : false;
                            //草稿数据 && 是保存，起流程-弹框
                            if (stateIsDraft && !isSaveDraft) {
                                createOperation($router, $route, vm);
                            } else if (stateIsDraft && isSaveDraft) {
                                //草稿数据 && 保存草稿，跳列表
                                $router.push({
                                    path: `${$route?.meta?.prefixRoute}/change/list`,
                                    query: _.pick(vm.$route.query, (value, key) => {
                                        return ['pid', 'typeOid'].includes(key) && value;
                                    })
                                });
                            } else if (!stateIsDraft && !isSaveDraft) {
                                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                    //正式数据&&保存，跳详情
                                    $router.push({
                                        path: `${$route?.meta?.prefixRoute}/change/prDetail`,
                                        query: {
                                            ..._.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid: responseData,
                                            componentRefresh: true, //编辑成功更新组件
                                            title: '查看问题报告',
                                            className: viewCfg.prChangeTableView.className
                                        }
                                    });
                                });
                            }
                        }
                    }
                };

                let defaultDetailConfig = {
                    layoutName: 'DETAIL',
                    slots: {
                        titleBefore: {
                            template: `<fam-icon :value='vm?.formData?.icon' class="text-16 mr-normal"></fam-icon>`,
                            components: {
                                FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
                            },
                            props: {
                                vm: {
                                    type: Object,
                                    default: () => {
                                        return {};
                                    }
                                }
                            }
                        },
                        formSlots: {
                            'container': {
                                template: `
                                    <erd-show-tooltip
                                        class="w-100p"
                                        placement="top"
                                        :content="containerObj.displayName"
                                        :enterable="false"
                                        :flex="false"
                                        :open-delay="100"
                                    >
                                        <template v-slot:show-tooltip-title>
                                            <span class="title_text">
                                                <a href="javascript:;" @click="enterLibrarySpace">
                                                    {{containerObj.displayName}}
                                                </a>
                                            </span>
                                        </template>
                                    </erd-show-tooltip>
                                `,
                                computed: {
                                    containerObj() {
                                        return this?.$attrs.data?.['containerRef'] || {};
                                    }
                                },
                                methods: {
                                    // 进入资源库空间
                                    enterLibrarySpace() {
                                        cbbUtils.handleGoToSpace(this?.$attrs.data);
                                    }
                                }
                            },
                            'folder': {
                                template: `
                                    <erd-show-tooltip
                                        class="w-100p"
                                        placement="top"
                                        :content="folderRef.displayName"
                                        :enterable="false"
                                        :flex="false"
                                        :open-delay="100"
                                    >
                                        <template v-slot:show-tooltip-title>
                                            <span class="title_text">
                                                <a href="javascript:;" @click="goFolder">
                                                    {{folderRef.displayName}}
                                                </a>
                                            </span>
                                        </template>
                                    </erd-show-tooltip>
                                `,
                                computed: {
                                    folderRef() {
                                        return this?.$attrs.data?.['folderRef'] || {};
                                    }
                                },
                                methods: {
                                    // 进入资源库空间
                                    goFolder() {
                                        cbbUtils.handleGoToSpace(this?.$attrs.data, 'folder');
                                    }
                                }
                            },
                            'lifecyle-status': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/LifecyleStep/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    tabs: [
                        {
                            name: i18n.property,
                            activeName: 'detail'
                        },
                        {
                            name: i18n.affectedObjs,
                            activeName: 'PRAffectedObjects',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/AffectedObjects/index.js')
                            )
                        },
                        {
                            name: i18n.changedObjs,
                            activeName: 'changeObject',
                            component: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/ChangeObject/index.js'))
                        },
                        {
                            name: i18n.processInfo,
                            activeName: 'ProcessInformation',
                            basicProps: (vm) => {
                                return {
                                    className: vm.$route.meta?.className || viewCfg.prChangeTableView.className
                                };
                            },
                            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/ProcessInfo/index.js'))
                        },
                        {
                            name: i18n.team,
                            activeName: 'team',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-document/components/DocumentTeam/index.js')
                            ),
                            basicProps: {
                                className: viewCfg.prChangeTableView.className
                            }
                        }
                    ],
                    actionKey: viewCfg.prChangeTableView.rowActionName,
                    actionParams: {
                        inTable: false,
                        isBatch: false
                    },
                    props: {
                        formSlotsProps(vm) {
                            // const state = vm?.formData?.['iterationInfo.state'] || '';
                            // let stateValue = typeof state === 'string' ? state : state?.value;
                            return {
                                files: {
                                    className: viewCfg.prChangeTableView.className,
                                    isUrlBtn: false,
                                    oid: vm?.containerOid,
                                    isCheckout: false,
                                    //变更附件自定义表头
                                    columns: handleFilesColumns()
                                }
                            };
                        },
                        commonPageTitleProps(vm) {
                            return {
                                title: (function () {
                                    return vm?.caption ?? '';
                                })(),
                                showBackButton: !!vm?.$route?.query?.backButton
                            };
                        }
                    },
                    modelMapper: {
                        'containerRef': (data, e) => {
                            return e;
                        },
                        'folderRef': (data, e) => {
                            return e || '';
                        },
                        'issuePriority': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lifecycleStatus.status': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lock.locker': (data, e) => {
                            return e || '';
                        },
                        'iterationInfo.state': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'teamRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'teamTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'typeReference': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'cycleTime': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'needDate': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'resolutionDate': (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        goBack: function ({ goBack, vm }) {
                            if (!!vm?.$route?.query?.backButton && vm?.from?.path?.indexOf('workflow') >= 0) {
                                return vm.$store.dispatch('route/delVisitedRoute', vm.$route).then((visitedRoutes) => {
                                    vm.$router.replace(
                                        visitedRoutes.find((item) => item.path === vm?.from?.path) || vm?.$route
                                    );
                                });
                            }
                            return goBack();
                        }
                        // beforeEcho: function ({ rawData, next }) {
                        //     let data = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             'containerRef': (e) => {
                        //                 return e;
                        //             },
                        //             'folderRef': (e) => {
                        //                 return e || '';
                        //             },
                        //             'issuePriority': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lifecycleStatus.status': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lock.locker': (e) => {
                        //                 return e || '';
                        //             },
                        //             'iterationInfo.state': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'teamRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'teamTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'typeReference': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'cycleTime': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'ownedByRef': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'createBy': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'updateBy': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'organizationRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'needDate': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'resolutionDate': ({ displayName }) => {
                        //                 return displayName || '';
                        //             }
                        //         }
                        //     });

                        //     next(data);
                        // }
                    }
                };

                if (customConfig) {
                    return customConfig(viewCfg.prChangeTableView.className, {
                        create: defaultCreateConfig,
                        edit: defaultEditConfig,
                        detail: defaultDetailConfig
                    });
                }
                return {
                    create: defaultCreateConfig,
                    edit: defaultEditConfig,
                    detail: defaultDetailConfig
                };
            },
            // 变更请求
            [viewCfg.ecrChangeTableView.className]: () => {
                const router = require('erdcloud.router');
                const { $router, $route } = router.app;
                // const type = $route?.query?.type || '';

                let defaultCreateConfig = {
                    title: i18n.createECR,
                    layoutName: 'CREATE',
                    editableAttr: ['containerRef'],
                    showDraftBtn: true,
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/BaseInfo/index.js')),
                        formSlots: {
                            'object-list': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/AffectedObjectList/index.js')
                            ),
                            'related-object': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/RelatedObject/index.js')
                            ),
                            'impact-analysis': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/ImpactAnalysis/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            changeType: 'ECR'
                        },
                        formSlotsProps(vm) {
                            return {
                                'object-list': {
                                    // selectedList: vm?.$refs?.detail?.[0]?.$refs?.['related-object']?.[0]?.tableData || []
                                },
                                'related-object': {
                                    typeName: 'PR'
                                },
                                'impact-analysis': {
                                    title: '影响分析',
                                    type: 'ECR',
                                    containerRef: vm?.$refs?.detail?.[0]?.$refs?.beforeForm?.formData?.containerRef,
                                    folderRef: vm?.$refs?.detail?.[0]?.$refs?.beforeForm?.formData?.folderRef
                                },
                                'files': {
                                    className: viewCfg.ecrChangeTableView.className,
                                    isUrlBtn: false,
                                    //变更附件自定义表头
                                    columns: handleFilesColumns()
                                }
                            };
                        }
                    },
                    hooks: {
                        async beforeSubmit({ formData, next, isSaveDraft, vm }) {
                            //草稿校验名称不能为空
                            if (isSaveDraft) {
                                let nameOptions = formData.attrRawList.find((item) => item.attrName == 'name');
                                //没有触发过名称、触发过名称再清空
                                if (!nameOptions || !nameOptions?.value) {
                                    return vm.$message.warning(i18n['名称不能为空']);
                                }
                            }
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.containerRef = vm.$store?.state?.app?.container?.oid;
                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'organizationRef' && Array.isArray(el.value)) {
                                    el.value = el.value[0].oid || '';
                                }
                                if (el.attrName === 'classifyReference' && el.value) {
                                    el.value = el.value?.oid || '';
                                }
                            });
                            // 类型
                            let typeReference =
                                _.find(formData.attrRawList, (item) => item.attrName === 'typeReference')?.value || '';
                            let contentSet = [];
                            let roleBIssueObjectRef = [];
                            let roleAInfluenceObjectRef = [];
                            let roleAActivityObjectRef = [];
                            // 受影响的对象列表
                            let objectData =
                                (await vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.getData()) || [];
                            // 关联的PR对象
                            let relatedData =
                                (await vm?.$refs?.detail?.[0]?.$refs?.['related-object']?.[0]?.getData()) || [];
                            // 影响分析
                            let analysisData =
                                (await vm?.$refs?.detail?.[0]?.$refs?.['impact-analysis']?.[0]?.getData()) || [];
                            //校验影响分析是否有未保存的数据
                            let analysisIsSave =
                                (await vm?.$refs?.detail?.[0]?.$refs?.['impact-analysis']?.[0]?.isAdd) || '';
                            if (analysisIsSave) {
                                vm.$message.warning(i18n['请确认保存影响分析数据']);
                                return false;
                            }
                            // 数据组装
                            if (relatedData.length) {
                                relatedData.forEach((item) => {
                                    roleBIssueObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleBObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleAObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.changeProcessLink
                                    });
                                });
                            }
                            if (objectData.length) {
                                objectData.forEach((item) => {
                                    roleAInfluenceObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleAObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.relevantRequestData
                                    });
                                });
                            } else if (!isSaveDraft) {
                                //保存需要校验影响对象不能为空，草稿无需
                                return vm.$message.warning(i18n['未增加受影响对象']);
                            }
                            if (analysisData.length) {
                                analysisData.forEach((item) => {
                                    roleAActivityObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleAObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.includeIn
                                    });
                                });
                            }
                            let relationList = [
                                ...roleAInfluenceObjectRef,
                                ...roleBIssueObjectRef,
                                ...roleAActivityObjectRef
                            ];
                            // 附件
                            let attachmentList =
                                await vm?.$refs?.detail?.[0]?.$refs?.['files']?.[0]?.submit(isSaveDraft);
                            if (!attachmentList.status) return;
                            _.each(attachmentList.data, (item) => {
                                contentSet.push(item);
                            });
                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) => !['typeReference', 'files'].includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                typeReference,
                                contentSet,
                                relationList
                            };
                            delete formData.oid;
                            // 保存草稿
                            if (isSaveDraft) formData.isDraft = true;
                            let tip = isSaveDraft ? '草稿创建成功' : '创建成功';

                            // 应后端要求，创建对象增加appName参数
                            formData.appName = cbbUtils.getAppNameByResource();

                            next(formData, tip);
                        },
                        // eslint-disable-next-line no-unused-vars
                        afterSubmit({ responseData, vm, isSaveDraft }) {
                            if (!isSaveDraft) {
                                createOperation($router, $route, vm);
                            } else {
                                vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                    $router.push({
                                        path: `${$route?.meta?.prefixRoute}/change/list`,
                                        query: _.pick(vm.$route.query, (value, key) => {
                                            return ['pid', 'typeOid'].includes(key) && value;
                                        })
                                    });
                                });
                            }
                        }
                    }
                };

                let defaultEditConfig = {
                    title: i18n.editECR,
                    layoutName: 'UPDATE',
                    editableAttr: ['containerRef', 'typeReference'],
                    isNotTabs: true,
                    showDraftBtn: true,
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/BaseInfo/index.js')),
                        formSlots: {
                            'object-list': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/AffectedObjectList/index.js')
                            ),
                            'related-object': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/RelatedObject/index.js')
                            ),
                            'impact-analysis': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/ImpactAnalysis/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            containerRef: FamStore?.state?.space?.context?.oid || '',
                            changeType: 'ECR'
                        },
                        formSlotsProps(vm) {
                            return {
                                'object-list': {
                                    // selectedList: vm?.$refs?.detail?.[0]?.$refs?.['related-object']?.[0]?.tableData || []
                                },
                                'impact-analysis': {
                                    title: '影响分析',
                                    type: 'ECR',
                                    containerRef: vm?.$refs?.detail?.[0]?.$refs?.beforeForm?.formData?.containerRef
                                },
                                'files': {
                                    className: viewCfg.ecrChangeTableView.className,
                                    isUrlBtn: false,
                                    oid: vm?.containerOid,
                                    isCheckout: true,
                                    //变更附件自定义表头
                                    columns: handleFilesColumns()
                                }
                            };
                        }
                    },
                    modelMapper: {
                        'containerRef': (data, { oid }) => {
                            return oid || '';
                        },
                        'typeReference': (data, { oid }) => {
                            return oid || '';
                        },
                        'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lifecycleStatus.status': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'iterationInfo.state': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'templateInfo.templateReference': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'title': (data, { value }) => {
                            return value || '';
                        },
                        //基本信息添加文件夹
                        'folderRef': (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        // 关闭
                        // eslint-disable-next-line no-unused-vars
                        beforeCancel: function ({ formData, goBack, vm }) {
                            const router = require('erdcloud.router');
                            const { $router, $route } = router.app;
                            vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                // 编辑页点击关闭，草稿状态返回列表页、正常对象返回详情页
                                if (vm?.sourceData?.['lifecycleStatus.status']?.value === 'DRAFT') {
                                    $router.push({
                                        path: `${$route?.meta?.prefixRoute}/change/list`,
                                        query: _.pick(vm.$route.query, (value, key) => {
                                            return ['pid', 'typeOid'].includes(key) && value;
                                        })
                                    });
                                } else {
                                    $router.push({
                                        path: `${$route?.meta?.prefixRoute}/change/ecrDetail`,
                                        query: {
                                            ..._.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            pid: $route.query?.pid,
                                            oid: $route.query?.oid,
                                            routeRefresh: true,
                                            routeKey: vm?.containerOid
                                        }
                                    });
                                }
                            });
                        },
                        // beforeEcho: function ({ rawData, next }) {
                        //     let data = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             'containerRef': ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             'typeReference': ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lifecycleStatus.status': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'iterationInfo.state': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'templateInfo.templateReference': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'title': ({ value }) => {
                        //                 return value || '';
                        //             },
                        //             'organizationRef': ({ value, displayName }) => {
                        //                 return {
                        //                     oid: value,
                        //                     name: displayName
                        //                 };
                        //             },
                        //             //基本信息添加文件夹
                        //             'folderRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             }
                        //         }
                        //     });
                        //     next(data);
                        // },
                        async beforeSubmit({ formData, next, isSaveDraft, sourceData, vm }) {
                            //草稿校验名称不能为空
                            if (isSaveDraft) {
                                let nameOptions = formData.attrRawList.find((item) => item.attrName == 'name');
                                //没有触发过名称、触发过名称再清空
                                if (!nameOptions || !nameOptions?.value) {
                                    return vm.$message.warning(i18n['名称不能为空']);
                                }
                            }
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.containerRef = vm.$store?.state?.app?.container?.oid;
                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'organizationRef' && el.value) {
                                    let data = el.value;
                                    if (el.value?.oid) data = 'OR:' + el.value.oid.key + ':' + el.value.oid.id;
                                    el.value = data || '';
                                }
                                if (el.attrName === 'classifyReference' && el.value) {
                                    el.value = el.value?.oid || '';
                                }
                            });
                            // 类型
                            let typeReference =
                                _.find(formData.attrRawList, (item) => item.attrName === 'typeReference')?.value || '';
                            let contentSet = [];
                            let roleBIssueObjectRef = [];
                            let roleAInfluenceObjectRef = [];
                            let roleAActivityObjectRef = [];
                            // 受影响的对象
                            let objectData =
                                (await vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.getData()) || [];
                            //当编辑草稿数据时,要取受影响的对象所有数据，当保存时校验,草稿无需校验
                            if (sourceData['lifecycleStatus.status']?.value == 'DRAFT' && !isSaveDraft) {
                                objectData =
                                    (await vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.tableData) || [];
                            }

                            // 关联的PR对象
                            let relatedData =
                                (await vm?.$refs?.detail?.[0]?.$refs?.['related-object']?.[0]?.getData()) || [];
                            // 影响分析
                            let analysisData =
                                (await vm?.$refs?.detail?.[0]?.$refs?.['impact-analysis']?.[0]?.getData()) || [];
                            // 数据组装
                            if (relatedData.length) {
                                relatedData.forEach((item) => {
                                    roleBIssueObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleBObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleAObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.changeProcessLink
                                    });
                                });
                            }
                            if (objectData.length) {
                                objectData.forEach((item) => {
                                    roleAInfluenceObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleAObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.relevantRequestData
                                    });
                                });
                            }

                            //取影响对象列表所有数据，包括之前已经关联的数据,再次编辑时校验
                            let objectTabaleData =
                                (await vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.tableData) || [];
                            if (!objectTabaleData.length && !isSaveDraft) {
                                //保存需要校验影响对象不能为空，草稿无需
                                return vm.$message.warning(i18n['未增加受影响对象']);
                            }
                            if (analysisData.length) {
                                analysisData.forEach((item) => {
                                    roleAActivityObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleAObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.includeIn
                                    });
                                });
                            }
                            let relationList = [
                                ...roleAInfluenceObjectRef,
                                ...roleBIssueObjectRef,
                                ...roleAActivityObjectRef
                            ];
                            // 附件
                            let attachmentList =
                                await vm?.$refs?.detail?.[0]?.$refs?.['files']?.[0]?.submit(isSaveDraft);
                            if (!attachmentList.status) return;
                            _.each(attachmentList.data, (item) => {
                                if (item.role !== 'PRIMARY') contentSet.push(item);
                            });
                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) => !['typeReference', 'files'].includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                typeReference,
                                contentSet,
                                relationList
                            };
                            // const state = sourceData['lifecycleStatus.status'].value;
                            // 保存草稿
                            if (isSaveDraft) {
                                formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                                formData.isDraft = true;
                            }
                            let tip = '编辑成功';

                            next(formData, tip);
                        },
                        afterSubmit({ responseData, isSaveDraft, vm }) {
                            // 判断当前是否为草稿，是的话保存草稿成功跳到编辑，否则跳到详情
                            const state = vm.sourceData?.['lifecycleStatus.status'];

                            //判读当前数据是草稿还是正式数据
                            let stateIsDraft = state?.value === 'DRAFT' ? true : false;
                            //草稿数据 && 是保存，起流程-弹框
                            if (stateIsDraft && !isSaveDraft) {
                                createOperation($router, $route, vm);
                            } else if (stateIsDraft && isSaveDraft) {
                                //草稿数据 && 保存草稿，跳列表
                                $router.push({
                                    path: `${$route?.meta?.prefixRoute}/change/list`,
                                    query: _.pick(vm.$route.query, (value, key) => {
                                        return ['pid', 'typeOid'].includes(key) && value;
                                    })
                                });
                            } else if (!stateIsDraft && !isSaveDraft) {
                                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                    //正式数据&&保存，跳详情
                                    $router.push({
                                        path: `${$route?.meta?.prefixRoute}/change/ecrDetail`,
                                        query: {
                                            ..._.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid: responseData,
                                            componentRefresh: true, //编辑成功更新组件
                                            title: '查看变更请求'
                                        }
                                    });
                                });
                            }
                        }
                    }
                };

                let defaultDetailConfig = {
                    layoutName: 'DETAIL',
                    slots: {
                        titleBefore: {
                            template: `<fam-icon :value='vm?.formData?.icon' class="text-16 mr-normal"></fam-icon>`,
                            components: {
                                FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
                            },
                            props: {
                                vm: {
                                    type: Object,
                                    default: () => {
                                        return {};
                                    }
                                }
                            }
                        },
                        formSlots: {
                            'container': {
                                template: `
                                    <erd-show-tooltip
                                        class="w-100p"
                                        placement="top"
                                        :content="containerObj.displayName"
                                        :enterable="false"
                                        :flex="false"
                                        :open-delay="100"
                                    >
                                        <template v-slot:show-tooltip-title>
                                            <span class="title_text">
                                                <a href="javascript:;" @click="enterLibrarySpace">
                                                    {{containerObj.displayName}}
                                                </a>
                                            </span>
                                        </template>
                                    </erd-show-tooltip>
                                `,
                                computed: {
                                    containerObj() {
                                        return this?.$attrs.data?.['containerRef'] || {};
                                    }
                                },
                                methods: {
                                    // 进入资源库空间
                                    enterLibrarySpace() {
                                        cbbUtils.handleGoToSpace(this?.$attrs.data);
                                    }
                                }
                            },
                            'folder': {
                                template: `
                                    <erd-show-tooltip
                                        class="w-100p"
                                        placement="top"
                                        :content="folderRef.displayName"
                                        :enterable="false"
                                        :flex="false"
                                        :open-delay="100"
                                    >
                                        <template v-slot:show-tooltip-title>
                                            <span class="title_text">
                                                <a href="javascript:;" @click="goFolder">
                                                    {{folderRef.displayName}}
                                                </a>
                                            </span>
                                        </template>
                                    </erd-show-tooltip>
                                `,
                                computed: {
                                    folderRef() {
                                        return this?.$attrs.data?.['folderRef'] || {};
                                    }
                                },
                                methods: {
                                    // 进入资源库空间
                                    goFolder() {
                                        cbbUtils.handleGoToSpace(this?.$attrs.data, 'folder');
                                    }
                                }
                            },
                            'lifecyle-status': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/LifecyleStep/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    tabs: [
                        {
                            name: i18n.property,
                            activeName: 'detail'
                        },
                        {
                            name: i18n.affectedObjs,
                            activeName: 'ECRAffectedObjects',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/AffectedObjects/index.js')
                            )
                        },
                        {
                            name: i18n.changedObjs,
                            activeName: 'changeObject',
                            component: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/ChangeObject/index.js'))
                        },
                        {
                            name: i18n.processInfo,
                            activeName: 'ProcessInformation',
                            basicProps: (vm) => {
                                return {
                                    className: vm.$route.meta?.className || viewCfg.ecrChangeTableView.className
                                };
                            },
                            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/ProcessInfo/index.js'))
                        },
                        {
                            name: i18n.team,
                            activeName: 'team',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-document/components/DocumentTeam/index.js')
                            ),
                            basicProps: {
                                className: viewCfg.ecrChangeTableView.className
                            }
                        }
                    ],
                    actionKey: viewCfg.ecrChangeTableView.rowActionName,
                    actionParams: {
                        inTable: false,
                        isBatch: false
                    },
                    props: {
                        formSlotsProps(vm) {
                            return {
                                files: {
                                    className: viewCfg.ecrChangeTableView.className,
                                    isUrlBtn: false,
                                    oid: vm?.containerOid,
                                    isCheckout: false,
                                    //变更附件自定义表头
                                    columns: handleFilesColumns()
                                }
                            };
                        },
                        commonPageTitleProps(vm) {
                            return {
                                title: (function () {
                                    return vm?.caption ?? '';
                                })(),
                                showBackButton: !!vm?.$route?.query?.backButton
                            };
                        }
                    },
                    modelMapper: {
                        'containerRef': (data, e) => {
                            return e;
                        },
                        'folderRef': (data, e) => {
                            return e || '';
                        },
                        'requestPriority': (data, { displayName }) => {
                            return displayName || '';
                        },
                        // 'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                        //     return displayName || '';
                        // },
                        'lifecycleStatus.status': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lock.locker': (data, e) => {
                            return e || '';
                        },
                        'iterationInfo.state': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'teamRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'teamTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'typeReference': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'cycleTime': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'needDate': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'resolutionDate': (data, { displayName }) => {
                            return displayName || '';
                        },
                        //转换优先级字段
                        'issuePriority': (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        goBack: function ({ goBack, vm }) {
                            if (!!vm?.$route?.query?.backButton && vm?.from?.path?.indexOf('workflow') >= 0) {
                                return vm.$store.dispatch('route/delVisitedRoute', vm.$route).then((visitedRoutes) => {
                                    vm.$router.replace(
                                        visitedRoutes.find((item) => item.path === vm?.from?.path) || vm?.$route
                                    );
                                });
                            }
                            return goBack();
                        }
                        // beforeEcho: function ({ rawData, next }) {
                        //     let data = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             'containerRef': (e) => {
                        //                 return e;
                        //             },
                        //             'folderRef': (e) => {
                        //                 return e || '';
                        //             },
                        //             'requestPriority': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lifecycleStatus.status': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lock.locker': (e) => {
                        //                 return e || '';
                        //             },
                        //             'iterationInfo.state': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'teamRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'teamTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'typeReference': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'cycleTime': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'ownedByRef': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'createBy': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'updateBy': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'organizationRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'needDate': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'resolutionDate': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             //转换优先级字段
                        //             'issuePriority': ({ displayName }) => {
                        //                 return displayName || '';
                        //             }
                        //         }
                        //     });
                        //     next(data);
                        // }
                    }
                };

                if (customConfig) {
                    return customConfig(viewCfg.ecrChangeTableView.className, {
                        create: defaultCreateConfig,
                        edit: defaultEditConfig,
                        detail: defaultDetailConfig
                    });
                }

                return {
                    create: defaultCreateConfig,
                    edit: defaultEditConfig,
                    detail: defaultDetailConfig
                };
            },
            // 变更通告
            [viewCfg.ecnChangeTableView.className]: () => {
                const router = require('erdcloud.router');
                const { $router, $route } = router.app;
                const type = $route?.query?.type || '';
                // 流程处理页面进入创建变更通告页面
                const Flow_Route = JSON.parse($route?.query?.route || '{}');

                let defaultCreateConfig = {
                    title: i18n.createECN,
                    layoutName: 'CREATE',
                    editableAttr: ['containerRef'],
                    showDraftBtn: type !== 'flow',
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/BaseInfo/index.js')),
                        formSlots: {
                            'change-object': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/RelatedObject/index.js')
                            ),
                            'change-task': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/ChangeTask/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            changeType: 'ECN'
                        },
                        formSlotsProps(vm) {
                            const { query } = vm.$route || {};
                            const probOid = query?.type === 'flow' && query?.probOid ? query?.probOid : '';
                            return {
                                'change-object': {
                                    typeName: 'ECR',
                                    title: '关联的变更对象',
                                    probOid
                                },
                                'change-task': {
                                    isDraft: true,
                                    containerRef: vm?.$refs?.detail?.[0]?.$refs?.beforeForm?.formData?.containerRef
                                },
                                'files': {
                                    className: viewCfg.ecnChangeTableView.className,
                                    isUrlBtn: false,
                                    //变更附件自定义表头
                                    columns: handleFilesColumns()
                                }
                            };
                        }
                    },
                    hooks: {
                        async beforeSubmit({ formData, next, isSaveDraft, vm }) {
                            //草稿校验名称不能为空
                            if (isSaveDraft) {
                                let nameOptions = formData.attrRawList.find((item) => item.attrName == 'name');
                                //没有触发过名称、触发过名称再清空
                                if (!nameOptions || !nameOptions?.value) {
                                    return vm.$message.warning(i18n['名称不能为空']);
                                }
                            }
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.containerRef = vm.$store?.state?.app?.container?.oid;
                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'organizationRef' && Array.isArray(el.value)) {
                                    el.value = el.value[0].oid || '';
                                }
                                if (el.attrName === 'classifyReference' && el.value) {
                                    el.value = el.value?.oid || '';
                                }
                            });
                            // 类型
                            let typeReference =
                                _.find(formData.attrRawList, (item) => item.attrName === 'typeReference')?.value || '';
                            let contentSet = [];
                            let roleAChangeObjectRef = [];
                            let roleBChangeTaskObjectRef = [];
                            // 关联的变更对象
                            let relatedData = await vm?.$refs?.detail?.[0]?.$refs?.['change-object']?.[0]?.getData();
                            // 变更任务
                            let changeTaskData = await vm?.$refs?.detail?.[0]?.$refs?.['change-task']?.[0]?.getData();
                            // 数据组装
                            if (relatedData.length) {
                                relatedData.forEach((item) => {
                                    roleAChangeObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleBObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleAObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.changeProcessLink
                                    });
                                });
                            }
                            if (changeTaskData.length) {
                                changeTaskData.forEach((item) => {
                                    roleBChangeTaskObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleAObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.includeIn
                                    });
                                });
                            }
                            let relationList = [...roleAChangeObjectRef, ...roleBChangeTaskObjectRef];
                            // 附件
                            let attachmentList =
                                await vm?.$refs?.detail?.[0]?.$refs?.['files']?.[0]?.submit(isSaveDraft);
                            if (!attachmentList.status) return;
                            _.each(attachmentList.data, (item) => {
                                contentSet.push(item);
                            });
                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) => !['typeReference', 'files'].includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                typeReference,
                                contentSet,
                                relationList
                            };
                            delete formData.oid;
                            // 保存草稿
                            if (isSaveDraft) formData.isDraft = true;
                            let tip = isSaveDraft ? '草稿创建成功' : '创建成功';

                            FamStore.state.Change.changeTaskList = [];

                            // 应后端要求，创建对象增加appName参数
                            formData.appName = cbbUtils.getAppNameByResource();

                            next(formData, tip);
                        },
                        // 关闭
                        // eslint-disable-next-line no-unused-vars
                        beforeCancel: function ({ formData, goBack, vm }) {
                            if (vm.$route.query?.type === 'flow' && vm?.from?.path?.indexOf('workflow') >= 0) {
                                return vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                    // 不同应用需要window.open，同应用直接push
                                    const route = vm?.from || vm?.$route;
                                    let appName = 'erdc-portal-web';
                                    if (window.__currentAppName__ === appName) {
                                        vm.$router.replace(route);
                                    } else {
                                        // path组装query参数
                                        let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(route.path, route?.query)}`;
                                        window.open(url, appName);
                                    }
                                });
                            }
                            vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                $router.push({
                                    path: `${$route?.meta?.prefixRoute}/change/list`,
                                    query: _.pick(vm.$route.query, (value, key) => {
                                        return ['pid', 'typeOid'].includes(key) && value;
                                    })
                                });
                            });
                        },
                        // eslint-disable-next-line no-unused-vars
                        afterSubmit({ responseData, vm, isSaveDraft }) {
                            if (vm.$route.query?.type === 'flow' && vm?.from?.path?.indexOf('workflow') >= 0) {
                                return vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                    // 不同应用需要window.open，同应用直接push
                                    const route = vm?.from || vm?.$route;
                                    let appName = 'erdc-portal-web';
                                    if (window.__currentAppName__ === appName) {
                                        vm.$router.replace(route);
                                    } else {
                                        // path组装query参数
                                        let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(route.path, { ...route?.query, routeRefresh: new Date().getTime().toString() })}`;
                                        window.open(url, appName);
                                    }
                                });
                            } else if (!isSaveDraft) {
                                createOperation($router, $route, vm);
                            } else {
                                vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                    $router.push({
                                        path: `${$route?.meta?.prefixRoute}/change/list`,
                                        query: _.pick(vm.$route.query, (value, key) => {
                                            return ['pid', 'typeOid'].includes(key) && value;
                                        })
                                    });
                                });
                            }
                        }
                    }
                };

                let defaultEditConfig = {
                    title: i18n.editECN,
                    layoutName: 'UPDATE',
                    editableAttr: ['containerRef', 'typeReference'],
                    isNotTabs: true,
                    showDraftBtn: true,
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/BaseInfo/index.js')),
                        formSlots: {
                            'change-object': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/RelatedObject/index.js')
                            ),
                            'change-task': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/ChangeTask/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            containerRef: FamStore?.state?.space?.context?.oid || '',
                            changeType: 'ECN'
                        },
                        formSlotsProps(vm) {
                            return {
                                'change-object': {
                                    typeName: 'ECR',
                                    title: '关联的变更对象'
                                },
                                'change-task': {
                                    isDraft: true,
                                    containerRef: vm?.$refs?.detail?.[0]?.$refs?.beforeForm?.formData?.containerRef
                                },
                                'files': {
                                    className: viewCfg.ecnChangeTableView.className,
                                    isUrlBtn: false,
                                    oid: vm?.containerOid,
                                    isCheckout: true,
                                    //变更附件自定义表头
                                    columns: handleFilesColumns()
                                }
                            };
                        }
                    },
                    modelMapper: {
                        'containerRef': (data, { oid }) => {
                            return oid || '';
                        },
                        'typeReference': (data, { oid }) => {
                            return oid || '';
                        },
                        'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lifecycleStatus.status': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'iterationInfo.state': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'templateInfo.templateReference': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'title': (data, { value }) => {
                            return value || '';
                        },
                        //基本信息添加文件夹
                        'folderRef': (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        // beforeEcho: function ({ rawData, next }) {
                        //     let data = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             'containerRef': ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             'typeReference': ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lifecycleStatus.status': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'iterationInfo.state': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'templateInfo.templateReference': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'title': ({ value }) => {
                        //                 return value || '';
                        //             },
                        //             'organizationRef': ({ value, displayName }) => {
                        //                 return {
                        //                     oid: value,
                        //                     name: displayName
                        //                 };
                        //             },
                        //             //基本信息添加文件夹
                        //             'folderRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             }
                        //         }
                        //     });
                        //     next(data);
                        // },
                        // eslint-disable-next-line no-unused-vars
                        async beforeSubmit({ formData, next, isSaveDraft, sourceData, vm }) {
                            //草稿校验名称不能为空
                            if (isSaveDraft) {
                                let nameOptions = formData.attrRawList.find((item) => item.attrName == 'name');
                                //没有触发过名称、触发过名称再清空
                                if (!nameOptions || !nameOptions?.value) {
                                    return vm.$message.warning(i18n['名称不能为空']);
                                }
                            }
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.containerRef = vm.$store?.state?.app?.container?.oid;
                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'organizationRef' && el.value) {
                                    let data = el.value;
                                    if (el.value?.oid) data = 'OR:' + el.value.oid.key + ':' + el.value.oid.id;
                                    el.value = data || '';
                                }
                                if (el.attrName === 'classifyReference' && el.value) {
                                    el.value = el.value?.oid || '';
                                }
                            });
                            // 类型
                            let typeReference =
                                _.find(formData.attrRawList, (item) => item.attrName === 'typeReference')?.value || '';
                            let contentSet = [];
                            let roleAChangeObjectRef = [];
                            let roleBChangeTaskObjectRef = [];
                            // 关联的变更对象
                            let relatedData = await vm?.$refs?.detail?.[0]?.$refs?.['change-object']?.[0]?.getData();
                            // 变更任务
                            let changeTaskData = await vm?.$refs?.detail?.[0]?.$refs?.['change-task']?.[0]?.getData();
                            // 数据组装
                            if (relatedData.length) {
                                relatedData.forEach((item) => {
                                    roleAChangeObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleBObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleAObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.changeProcessLink
                                    });
                                });
                            }
                            if (changeTaskData.length) {
                                changeTaskData.forEach((item) => {
                                    roleBChangeTaskObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleAObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.includeIn
                                    });
                                });
                            }
                            let relationList = [...roleAChangeObjectRef, ...roleBChangeTaskObjectRef];
                            // 附件
                            let attachmentList =
                                await vm?.$refs?.detail?.[0]?.$refs?.['files']?.[0]?.submit(isSaveDraft);
                            if (!attachmentList.status) return;
                            _.each(attachmentList.data, (item) => {
                                if (item.role !== 'PRIMARY') contentSet.push(item);
                            });
                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) => !['typeReference', 'files'].includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                typeReference,
                                contentSet,
                                relationList
                            };
                            // const state = sourceData['lifecycleStatus.status'].value;
                            // 保存草稿
                            if (isSaveDraft) {
                                formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                                formData.isDraft = true;
                            }
                            let tip = '编辑成功';

                            FamStore.state.Change.changeTaskList = [];
                            next(formData, tip);
                        },
                        afterSubmit({ responseData, vm, isSaveDraft }) {
                            // 判断当前是否为草稿，是的话保存草稿成功跳到编辑，否则跳到详情
                            const state = vm.sourceData?.['lifecycleStatus.status'];
                            // let pathName = state?.value === 'DRAFT' ? 'changeEcnEdit' : 'changeEcnDetail';

                            //判读当前数据是草稿还是正式数据
                            let stateIsDraft = state?.value === 'DRAFT' ? true : false;
                            //草稿数据 && 是保存，起流程-弹框
                            if (stateIsDraft && !isSaveDraft) {
                                createOperation($router, $route, vm);
                            } else if (stateIsDraft && isSaveDraft) {
                                //草稿数据 && 保存草稿，跳列表
                                $router.push({
                                    // name: `${$route?.meta?.parentPath}/changeManageList`
                                    path: `${$route?.meta?.prefixRoute}/change/list`,
                                    query: _.pick(vm.$route.query, (value, key) => {
                                        return ['pid', 'typeOid'].includes(key) && value;
                                    })
                                });
                            } else if (!stateIsDraft && !isSaveDraft) {
                                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                    //正式数据&&保存，跳详情
                                    $router.push({
                                        path: `${$route?.meta?.prefixRoute}/change/ecnDetail`,
                                        query: {
                                            ..._.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid: responseData,
                                            componentRefresh: true, //编辑成功更新组件
                                            title: '查看变更通告'
                                        }
                                    });
                                });
                            }
                        },
                        // 关闭
                        // eslint-disable-next-line no-unused-vars
                        beforeCancel: function ({ formData, goBack, vm }) {
                            function callback(defaultRouter) {
                                let backRouteInfo = vm.$store?.getters['Change/getBackRouteInfo'];
                                backRouteInfo = _.isString(backRouteInfo) ? JSON.parse(backRouteInfo) : backRouteInfo;
                                if (_.isEmpty(backRouteInfo)) {
                                    backRouteInfo = vm.from;
                                }
                                //如果打开过创建变更任务页面,关闭时就让它回到进入时的路由(变更通告单条编辑、详情编辑)
                                let pathName = defaultRouter?.name?.split('/') || [];
                                let suffixName = pathName[pathName.length - 1] || '';

                                if (['changeEcaCreate', 'changeEcaEdit'].includes(suffixName) || '') {
                                    vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                        $router.push({
                                            path: backRouteInfo.path,
                                            params: backRouteInfo.params,
                                            query: backRouteInfo.query,
                                            mete: backRouteInfo.mete
                                        });
                                    });
                                } else {
                                    //如果是没有打开任务创建页面关闭,走公共配置的关闭路由
                                    vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                        $router.push({
                                            path: defaultRouter.path,
                                            query: _.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid', 'oid'].includes(key) && value;
                                            })
                                        });
                                    });
                                }
                            }

                            goBack(callback);
                        }
                    }
                };

                let defaultDetailConfig = {
                    layoutName: 'DETAIL',
                    slots: {
                        titleBefore: {
                            template: `<fam-icon :value='vm?.formData?.icon' class="text-16 mr-normal"></fam-icon>`,
                            components: {
                                FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
                            },
                            props: {
                                vm: {
                                    type: Object,
                                    default: () => {
                                        return {};
                                    }
                                }
                            }
                        },
                        formSlots: {
                            'container': {
                                template: `
                                    <erd-show-tooltip
                                        class="w-100p"
                                        placement="top"
                                        :content="containerObj.displayName"
                                        :enterable="false"
                                        :flex="false"
                                        :open-delay="100"
                                    >
                                        <template v-slot:show-tooltip-title>
                                            <span class="title_text">
                                                <a href="javascript:;" @click="enterLibrarySpace">
                                                    {{containerObj.displayName}}
                                                </a>
                                            </span>
                                        </template>
                                    </erd-show-tooltip>
                                `,
                                computed: {
                                    containerObj() {
                                        return this?.$attrs.data?.['containerRef'] || {};
                                    }
                                },
                                methods: {
                                    // 进入资源库空间
                                    enterLibrarySpace() {
                                        cbbUtils.handleGoToSpace(this?.$attrs.data);
                                    }
                                }
                            },
                            'folder': {
                                template: `
                                    <erd-show-tooltip
                                        class="w-100p"
                                        placement="top"
                                        :content="folderRef.displayName"
                                        :enterable="false"
                                        :flex="false"
                                        :open-delay="100"
                                    >
                                        <template v-slot:show-tooltip-title>
                                            <span class="title_text">
                                                <a href="javascript:;" @click="goFolder">
                                                    {{folderRef.displayName}}
                                                </a>
                                            </span>
                                        </template>
                                    </erd-show-tooltip>
                                `,
                                computed: {
                                    folderRef() {
                                        return this?.$attrs.data?.['folderRef'] || {};
                                    }
                                },
                                methods: {
                                    // 进入资源库空间
                                    goFolder() {
                                        cbbUtils.handleGoToSpace(this?.$attrs.data, 'folder');
                                    }
                                }
                            },
                            'lifecyle-status': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/LifecyleStep/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    tabs: [
                        {
                            name: i18n.property,
                            activeName: 'detail'
                        },
                        {
                            name: i18n.eca,
                            activeName: 'changeTask',
                            basicProps: (vm) => {
                                return {
                                    containerRef: vm?.sourceData?.containerRef?.oid,
                                    type: 'detail'
                                };
                            },
                            component: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/ChangeTask/index.js'))
                        },
                        {
                            name: i18n.changedObjs,
                            activeName: 'changeObject',
                            component: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/ChangeObject/index.js'))
                        },
                        {
                            name: i18n.processInfo,
                            activeName: 'ProcessInformation',
                            basicProps: (vm) => {
                                return {
                                    className: vm.$route.meta?.className || viewCfg.ecnChangeTableView.className
                                };
                            },
                            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/ProcessInfo/index.js'))
                        },
                        {
                            name: i18n.team,
                            activeName: 'team',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-document/components/DocumentTeam/index.js')
                            ),
                            basicProps: {
                                className: viewCfg.ecnChangeTableView.className
                            }
                        }
                    ],
                    actionKey: viewCfg.ecnChangeTableView.rowActionName,
                    actionParams: {
                        inTable: false,
                        isBatch: false
                    },
                    props: {
                        formSlotsProps(vm) {
                            return {
                                files: {
                                    className: viewCfg.ecnChangeTableView.className,
                                    isUrlBtn: false,
                                    oid: vm?.containerOid,
                                    isCheckout: false,
                                    //变更附件自定义表头
                                    columns: handleFilesColumns()
                                }
                            };
                        },
                        commonPageTitleProps(vm) {
                            return {
                                title: (function () {
                                    return vm?.caption ?? '';
                                })(),
                                showBackButton: !!vm?.$route?.query?.backButton
                            };
                        }
                    },
                    modelMapper: {
                        'containerRef': (data, e) => {
                            return e;
                        },
                        'folderRef': (data, e) => {
                            return e || '';
                        },
                        'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lifecycleStatus.status': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lock.locker': (data, e) => {
                            return e || '';
                        },
                        'iterationInfo.state': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'teamRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'teamTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'typeReference': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'cycleTime': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'needDate': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'resolutionDate': (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        goBack: function ({ goBack, vm }) {
                            if (!!vm?.$route?.query?.backButton && vm?.from?.path?.indexOf('workflow') >= 0) {
                                return vm.$store.dispatch('route/delVisitedRoute', vm.$route).then((visitedRoutes) => {
                                    vm.$router.replace(
                                        visitedRoutes.find((item) => item.path === vm?.from?.path) || vm?.$route
                                    );
                                });
                            }
                            return goBack();
                        }
                        // beforeEcho: function ({ rawData, next }) {
                        //     let data = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             'containerRef': (e) => {
                        //                 return e;
                        //             },
                        //             'folderRef': (e) => {
                        //                 return e || '';
                        //             },
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lifecycleStatus.status': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lock.locker': (e) => {
                        //                 return e || '';
                        //             },
                        //             'iterationInfo.state': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'teamRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'teamTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'typeReference': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'cycleTime': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'ownedByRef': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'createBy': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'updateBy': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'organizationRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'needDate': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'resolutionDate': ({ displayName }) => {
                        //                 return displayName || '';
                        //             }
                        //         }
                        //     });
                        //     next(data);
                        // }
                    }
                };

                if (customConfig) {
                    return customConfig(viewCfg.ecnChangeTableView.className, {
                        create: defaultCreateConfig,
                        edit: defaultEditConfig,
                        detail: defaultDetailConfig
                    });
                }

                return {
                    create: defaultCreateConfig,
                    edit: defaultEditConfig,
                    detail: defaultDetailConfig
                };
            },
            // 变更任务
            [viewCfg.ecaChangeTableView.className]: () => {
                const router = require('erdcloud.router');
                const { $route } = router.app;
                const type = $route?.query?.type || '';

                let defaultCreateConfig = {
                    title: i18n.createECA,
                    layoutName: 'CREATE',
                    editableAttr: ['containerRef'],
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/BaseInfo/index.js')),
                        formSlots: {
                            'object-list': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/TaskObject/index.js')
                            ),
                            'product-object': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/TaskObject/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            changeType: 'ECA'
                        },
                        // eslint-disable-next-line no-unused-vars
                        formSlotsProps(vm) {
                            return {
                                'object-list': {
                                    title: i18n.affectedObjs,
                                    type: 'affected',
                                    actionConfig: {
                                        name: 'CHANGE_ACTIVITY_AFFECTED_OP_MENU'
                                    }
                                },
                                'product-object': {
                                    title: '产生的对象',
                                    type: 'product',
                                    actionConfig: {
                                        name: 'CHANGE_ACTIVITY_PRODUCE_OP_MENU'
                                    }
                                    // objectAppendData: vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.reversionData
                                },
                                'files': {
                                    className: viewCfg.ecaChangeTableView.className,
                                    isUrlBtn: false,
                                    //变更附件自定义表头
                                    columns: handleFilesColumns()
                                }
                            };
                        }
                    },
                    hooks: {
                        async beforeSubmit({ formData, next, isSaveDraft, vm }) {
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'organizationRef' && Array.isArray(el.value)) {
                                    el.value = el.value[0].oid || '';
                                }
                                if (el.attrName === 'classifyReference' && el.value) {
                                    el.value = el.value?.oid || '';
                                }
                            });
                            // 类型
                            let typeReference =
                                _.find(formData.attrRawList, (item) => item.attrName === 'typeReference')?.value || '';
                            let contentSet = [];
                            let roleAAffectedObjectRef = [];
                            let roleARecordObjectRef = [];
                            let roleBOrder = [];
                            // 受影响的对象
                            let affectedObjectData =
                                await vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.getData();
                            // 产生的对象
                            let productData = await vm?.$refs?.detail?.[0]?.$refs?.['product-object']?.[0]?.getData();
                            // 数据组装
                            if (affectedObjectData.length) {
                                affectedObjectData.forEach((item) => {
                                    roleAAffectedObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleAObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.affectedActivityData
                                    });
                                });
                            }
                            if (productData.length) {
                                productData.forEach((item) => {
                                    roleARecordObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleAObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.changeRecord
                                    });
                                });
                            }

                            if (type === 'flow' || type === 'detail') {
                                const oid = $route?.query?.orderOid;
                                roleBOrder = [
                                    {
                                        action: 'CREATE',
                                        relationField: 'roleBObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleAObjectRef',
                                                value: oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.includeIn
                                    }
                                ];
                            }
                            let relationList = [...roleAAffectedObjectRef, ...roleARecordObjectRef, ...roleBOrder];
                            // 附件
                            let attachmentList =
                                await vm?.$refs?.detail?.[0]?.$refs?.['files']?.[0]?.submit(isSaveDraft);
                            if (!attachmentList.status) return;
                            _.each(attachmentList.data, (item) => {
                                contentSet.push(item);
                            });
                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) => !['typeReference', 'files'].includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                typeReference,
                                contentSet,
                                relationList
                            };
                            delete formData.oid;
                            const containerRef = JSON.parse(localStorage.getItem('pdmProcessData'))?.containerRef ?? '';
                            formData.containerRef = ['detail', 'draft'].includes(type)
                                ? ($route?.query?.containerRef ?? '')
                                : type === 'flow' && containerRef
                                  ? containerRef
                                  : '';
                            formData.isDraft = type === 'draft';
                            // 保存草稿
                            // if (isSaveDraft) formData.isDraft = true;
                            let tip = isSaveDraft ? '草稿创建成功' : '创建成功';

                            // 应后端要求，创建对象增加appName参数
                            formData.appName = cbbUtils.getAppNameByResource();

                            next(formData, tip);
                        },
                        afterSubmit({ responseData, vm }) {
                            getAttr(responseData);
                            const { $router, $route } = router.app;
                            vm.$store.dispatch('route/delVisitedRoute', $route).then((visitedRoutes) => {
                                let defaultRouter = vm.from || (visitedRoutes.length && visitedRoutes[0]);
                                let pathName = defaultRouter?.name?.split('/') || [];
                                let suffixName = pathName[pathName.length - 1] || '';
                                //变更通告详情进来时,成功之后要刷新页面数据,
                                if (['changeEcnDetail'].includes(suffixName) || '') {
                                    $router.push({
                                        path: defaultRouter.path,
                                        query: {
                                            ...defaultRouter.query
                                        },
                                        params: defaultRouter.params,
                                        mete: defaultRouter.mete
                                    });
                                } else {
                                    //创建按钮进入直接返回到上一页
                                    $router.back();
                                }
                            });
                        }
                    }
                };

                let defaultEditConfig = {
                    title: i18n.editECA,
                    layoutName: 'UPDATE',
                    isNotTabs: true,
                    editableAttr: ['containerRef', 'typeReference'],
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/BaseInfo/index.js')),
                        formSlots: {
                            'object-list': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/TaskObject/index.js')
                            ),
                            'product-object': ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/TaskObject/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            containerRef: FamStore?.state?.space?.context?.oid || '',
                            changeType: 'ECA'
                        },
                        formSlotsProps(vm) {
                            return {
                                'object-list': {
                                    title: i18n.affectedObjs,
                                    type: 'affected',
                                    actionConfig: {
                                        name: 'CHANGE_ACTIVITY_AFFECTED_OP_MENU'
                                    }
                                },
                                'product-object': {
                                    title: '产生的对象',
                                    type: 'product',
                                    actionConfig: {
                                        name: 'CHANGE_ACTIVITY_PRODUCE_OP_MENU'
                                    }
                                    // objectAppendData: vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.reversionData
                                },
                                'files': {
                                    className: viewCfg.ecaChangeTableView.className,
                                    isUrlBtn: false,
                                    oid: vm?.containerOid,
                                    isCheckout: true,
                                    //变更附件自定义表头
                                    columns: handleFilesColumns()
                                }
                            };
                        }
                    },
                    modelMapper: {
                        'containerRef': (data, { oid }) => {
                            return oid || '';
                        },
                        'typeReference': (data, { oid }) => {
                            return oid || '';
                        },
                        'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lifecycleStatus.status': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'iterationInfo.state': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'templateInfo.templateReference': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'title': (data, { value }) => {
                            return value || '';
                        },
                        //基本信息添加文件夹
                        'folderRef': (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        // 关闭
                        // eslint-disable-next-line no-unused-vars
                        beforeCancel: function ({ formData, goBack, vm }) {
                            const router = require('erdcloud.router');
                            const { $router, $route } = router.app;
                            vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                // 编辑页点击关闭，草稿状态返回列表页、正常对象返回详情页
                                if (vm?.sourceData?.['lifecycleStatus.status']?.value === 'DRAFT') {
                                    $router.push({
                                        path: `${$route?.meta?.prefixRoute}/change/list`,
                                        query: _.pick(vm.$route.query, (value, key) => {
                                            return ['pid', 'typeOid'].includes(key) && value;
                                        })
                                    });
                                } else {
                                    $router.push({
                                        path: `${$route?.meta?.prefixRoute}/change/ecaDetail`,
                                        query: {
                                            ..._.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid: $route.query?.oid,
                                            routeRefresh: true,
                                            routeKey: vm?.containerOid
                                        }
                                    });
                                }
                            });
                        },
                        // beforeEcho: function ({ rawData, next }) {
                        //     let data = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             'containerRef': ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             'typeReference': ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lifecycleStatus.status': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'iterationInfo.state': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'templateInfo.templateReference': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'title': ({ value }) => {
                        //                 return value || '';
                        //             },
                        //             'organizationRef': ({ value, displayName }) => {
                        //                 return {
                        //                     oid: value,
                        //                     name: displayName
                        //                 };
                        //             },
                        //             //基本信息添加文件夹
                        //             'folderRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             //工作负责人
                        //             'roleAssignee': ({ users }) => {
                        //                 return users || '';
                        //             },
                        //             //审阅者
                        //             'roleReviewer': ({ users }) => {
                        //                 return users || '';
                        //             }
                        //         }
                        //     });

                        //     next(data);
                        // },
                        // eslint-disable-next-line no-unused-vars
                        async beforeSubmit({ formData, next, isSaveDraft, sourceData, vm }) {
                            //草稿校验名称不能为空
                            if (isSaveDraft) {
                                let nameOptions = formData.attrRawList.find((item) => item.attrName == 'name');
                                //没有触发过名称、触发过名称再清空
                                if (!nameOptions || !nameOptions?.value) {
                                    return vm.$message.warning(i18n['名称不能为空']);
                                }
                            }
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.containerRef = vm.$store?.state?.app?.container?.oid;
                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'organizationRef' && el.value) {
                                    let data = el.value;
                                    if (el.value?.oid) data = 'OR:' + el.value.oid.key + ':' + el.value.oid.id;
                                    el.value = data || '';
                                }
                                if (el.attrName === 'classifyReference' && el.value) {
                                    el.value = el.value?.oid || '';
                                }
                            });
                            // 类型
                            let typeReference =
                                _.find(formData.attrRawList, (item) => item.attrName === 'typeReference')?.value || '';
                            let contentSet = [];
                            let roleAAffectedObjectRef = [];
                            let roleARecordObjectRef = [];
                            // 受影响的对象
                            let affectedObjectData =
                                await vm?.$refs?.detail?.[0]?.$refs?.['object-list']?.[0]?.getData();
                            // 产生的对象
                            let productData = await vm?.$refs?.detail?.[0]?.$refs?.['product-object']?.[0]?.getData();
                            // 数据组装
                            if (affectedObjectData.length) {
                                affectedObjectData.forEach((item) => {
                                    roleAAffectedObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleAObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.affectedActivityData
                                    });
                                });
                            }
                            if (productData.length) {
                                productData.forEach((item) => {
                                    roleARecordObjectRef.push({
                                        action: 'CREATE',
                                        relationField: 'roleAObjectRef',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item.oid
                                            }
                                        ],
                                        className: viewCfg.otherClassNameMap.changeRecord
                                    });
                                });
                            }
                            let relationList = [...roleAAffectedObjectRef, ...roleARecordObjectRef];
                            // 附件
                            let attachmentList =
                                await vm?.$refs?.detail?.[0]?.$refs?.['files']?.[0]?.submit(isSaveDraft);
                            if (!attachmentList.status) return;
                            _.each(attachmentList.data, (item) => {
                                if (item.role !== 'PRIMARY') contentSet.push(item);
                            });
                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) => !['typeReference', 'files'].includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                typeReference,
                                contentSet,
                                relationList
                            };
                            // const state = sourceData['lifecycleStatus.status'].value;
                            // 保存草稿
                            if (isSaveDraft) {
                                formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                                formData.isDraft = true;
                            }
                            let tip = '编辑成功';

                            next(formData, tip);
                        },
                        // eslint-disable-next-line no-unused-vars
                        afterSubmit({ responseData, vm }) {
                            // 判断当前是否为草稿，是的话保存草稿成功跳到编辑，否则跳到详情
                            // const state = vm.sourceData?.['lifecycleStatus.status'];
                            // let pathName = state?.value === 'DRAFT' ? 'changeEcaEdit' : 'changeEcaDetail';

                            //变更通告编辑-编辑变更任务、详情,编辑成功之后返回到上一次的路由
                            vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                router.back();
                            });
                        }
                    }
                };

                let defaultDetailConfig = {
                    layoutName: 'DETAIL',
                    slots: {
                        titleBefore: {
                            template: `<fam-icon :value='vm?.formData?.icon' class="text-16 mr-normal"></fam-icon>`,
                            components: {
                                FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
                            },
                            props: {
                                vm: {
                                    type: Object,
                                    default: () => {
                                        return {};
                                    }
                                }
                            }
                        },
                        formSlots: {
                            'container': {
                                template: `
                                    <erd-show-tooltip
                                        class="w-100p"
                                        placement="top"
                                        :content="containerObj.displayName"
                                        :enterable="false"
                                        :flex="false"
                                        :open-delay="100"
                                    >
                                        <template v-slot:show-tooltip-title>
                                            <span class="title_text">
                                                <a href="javascript:;" @click="enterLibrarySpace">
                                                    {{containerObj.displayName}}
                                                </a>
                                            </span>
                                        </template>
                                    </erd-show-tooltip>
                                `,
                                computed: {
                                    containerObj() {
                                        return this?.$attrs.data?.['containerRef'] || {};
                                    }
                                },
                                methods: {
                                    // 进入资源库空间
                                    enterLibrarySpace() {
                                        cbbUtils.handleGoToSpace(this?.$attrs.data);
                                    }
                                }
                            },
                            'folder': {
                                template: `
                                    <erd-show-tooltip
                                        class="w-100p"
                                        placement="top"
                                        :content="folderRef.displayName"
                                        :enterable="false"
                                        :flex="false"
                                        :open-delay="100"
                                    >
                                        <template v-slot:show-tooltip-title>
                                            <span class="title_text">
                                                <a href="javascript:;" @click="goFolder">
                                                    {{folderRef.displayName}}
                                                </a>
                                            </span>
                                        </template>
                                    </erd-show-tooltip>
                                `,
                                computed: {
                                    folderRef() {
                                        return this?.$attrs.data?.['folderRef'] || {};
                                    }
                                },
                                methods: {
                                    // 进入资源库空间
                                    goFolder() {
                                        cbbUtils.handleGoToSpace(this?.$attrs.data, 'folder');
                                    }
                                }
                            },
                            'lifecyle-status': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/LifecyleStep/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    tabs: [
                        {
                            name: i18n.property,
                            activeName: 'detail'
                        },
                        {
                            name: i18n.affecteds,
                            activeName: 'ECAAffectedObjects',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-change/components/AffectedObjects/index.js')
                            )
                        },
                        {
                            name: i18n.changedObjs,
                            activeName: 'changeObject',
                            component: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/ChangeObject/index.js'))
                        },
                        {
                            name: i18n.processInfo,
                            activeName: 'ProcessInformation',
                            basicProps: (vm) => {
                                return {
                                    className: vm.$route.meta?.className || viewCfg.ecaChangeTableView.className
                                };
                            },
                            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/ProcessInfo/index.js'))
                        },
                        {
                            name: i18n.team,
                            activeName: 'team',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-document/components/DocumentTeam/index.js')
                            ),
                            basicProps: {
                                className: viewCfg.ecaChangeTableView.className
                            }
                        }
                    ],
                    actionKey: viewCfg.ecaChangeTableView.rowActionName,
                    actionParams: {
                        inTable: false,
                        isBatch: false
                    },
                    props: {
                        formSlotsProps(vm) {
                            return {
                                files: {
                                    className: viewCfg.ecaChangeTableView.className,
                                    isUrlBtn: false,
                                    oid: vm?.containerOid,
                                    isCheckout: false,
                                    //变更附件自定义表头
                                    columns: handleFilesColumns()
                                }
                            };
                        },
                        commonPageTitleProps(vm) {
                            return {
                                title: (function () {
                                    return vm?.caption ?? '';
                                })(),
                                showBackButton: !!vm?.$route?.query?.backButton
                            };
                        }
                    },
                    modelMapper: {
                        'containerRef': (data, e) => {
                            return e;
                        },
                        'folderRef': (data, e) => {
                            return e || '';
                        },
                        'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lifecycleStatus.status': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'lock.locker': (data, e) => {
                            return e || '';
                        },
                        'iterationInfo.state': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'teamRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'teamTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'typeReference': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'cycleTime': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'needDate': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'resolutionDate': (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        goBack: function ({ goBack, vm }) {
                            if (!!vm?.$route?.query?.backButton && vm?.from?.path?.indexOf('workflow') >= 0) {
                                return vm.$store.dispatch('route/delVisitedRoute', vm.$route).then((visitedRoutes) => {
                                    vm.$router.replace(
                                        visitedRoutes.find((item) => item.path === vm?.from?.path) || vm?.$route
                                    );
                                });
                            }
                            return goBack();
                        }
                        // beforeEcho: function ({ rawData, next }) {
                        //     let data = ErdcKit.deserializeAttr(rawData, {
                        //         valueMap: {
                        //             'containerRef': (e) => {
                        //                 return e;
                        //             },
                        //             'folderRef': (e) => {
                        //                 return e || '';
                        //             },
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lifecycleStatus.status': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'lock.locker': (e) => {
                        //                 return e || '';
                        //             },
                        //             'iterationInfo.state': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'teamRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'teamTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'typeReference': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'cycleTime': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'ownedByRef': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'createBy': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'updateBy': ({ users }) => {
                        //                 return users;
                        //             },
                        //             'organizationRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             //工作负责人
                        //             'roleAssignee': ({ users }) => {
                        //                 return users || '';
                        //             },
                        //             //审阅者
                        //             'roleReviewer': ({ users }) => {
                        //                 return users || '';
                        //             },
                        //             'needDate': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'resolutionDate': ({ displayName }) => {
                        //                 return displayName || '';
                        //             }
                        //         }
                        //     });
                        //     next(data);
                        // }
                    }
                };

                if (customConfig) {
                    customConfig(viewCfg.ecaChangeTableView.className, {
                        create: defaultCreateConfig,
                        edit: defaultEditConfig,
                        detail: defaultDetailConfig
                    });
                }

                return {
                    create: defaultCreateConfig,
                    edit: defaultEditConfig,
                    detail: defaultDetailConfig
                };
            }
        };
    };
});
