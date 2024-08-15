define([
    ELMP.func('erdc-document/config/operateAction.js'),
    ELMP.func('erdc-document/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-document/locale/index.js')
], function (operateAction, viewCfg, cbbUtils, locale) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const ErdcHttp = require('erdcloud.http');
    const ErdcRouter = require('erdcloud.router');
    const { $route } = ErdcRouter.app;
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);

    // 参考文档创建文档
    async function addRelationObj(data, responseData, vm) {
        const { currentOid, currentClassName, originPath = 'document/detail', relationObjActive, isOid = true } = data;
        /**
         * TODO 需要有一个公共的方法，去组装参数。
         * 默认 isRoleB值为false，isOid值为true。这里省略了isRoleB变量。
         */
        const roleBId = isOid ? responseData : await getMasterOid(responseData, viewCfg.docViewTableMap.className);
        let params = {
            className: currentClassName,
            attrRawList: [
                {
                    attrName: 'roleAObjectRef',
                    value: currentOid
                },
                {
                    attrName: 'roleBObjectRef',
                    value: roleBId
                }
            ]
        };
        ErdcHttp({
            url: 'fam/create',
            className: currentClassName,
            data: params,
            method: 'POST'
        }).then(() => {
            if (originPath === 'part/detail') {
                //创建成功关闭当前页面
                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                    const { prefixRoute, resourceKey } = vm.$route?.meta || {};
                    vm.$router.replace({
                        path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
                        query: {
                            ..._.pick(vm.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            //原来的oid
                            oid: currentOid,
                            // 跳转详情后要进到那个tab页
                            activeName: 'relationObj',
                            relationObjActive,
                            componentRefresh: true
                        }
                    });
                });
            } else {
                //创建成功关闭当前页面
                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                    vm.$router.replace({
                        path: originPath,
                        query: {
                            ..._.pick(vm.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid: currentOid,
                            // 跳转详情后要进到那个tab页
                            activeName: 'relationObj',
                            relationObjActive,
                            componentRefresh: true
                        }
                    });
                });
            }
        });
    }

    function getMasterOid(oid, className) {
        return ErdcHttp({
            url: '/fam/attr',
            method: 'GET',
            className,
            data: {
                oid: oid
            }
        }).then((res) => {
            if (res.success) {
                const rawData = res.data.rawData;
                return rawData.masterRef.value;
            }
        });
    }

    // 保存时是否需要检入
    let handleCheckIn = null;
    function getCheckIn(note) {
        return function (oid) {
            return ErdcHttp({
                url: '/fam/common/checkin',
                params: {
                    note: note,
                    oid: oid
                },
                className: viewCfg.docViewTableMap.className,
                method: 'PUT'
            });
        };
    }
    // 结构跳转
    function structureJump(jumpOid) {
        this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
            const { prefixRoute, resourceKey } = this.$route?.meta || {};
            this.$router.push({
                path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/detail`,
                query: {
                    ..._.pick(this.$route.query, (value, key) => {
                        return ['pid', 'typeOid'].includes(key) && value;
                    }),
                    oid: jumpOid,
                    // 跳转详情后要进到那个tab页
                    activeName: 'structure',
                    componentRefresh: true,
                    title: i18n.viewDoc,
                    className: 'erd.cloud.cbb.doc.entity.EtDocument'
                }
            });
        });
    }

    return (customConfig) => {
        return {
            [viewCfg.docViewTableMap.className]: () => {
                let isShowDraftBtn = $route?.query?.isNotNeedDraf ? false : true;
                const defaultCreateConfig = {
                    title: i18n.createDoc,
                    layoutName: 'CREATE',
                    showDraftBtn: isShowDraftBtn,
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-document/components/BaseInfo/index.js')),
                        formSlots: {
                            'main-source': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/MainContentSource/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            'custom-event': {
                                'templateInfo.templateReference': async (obj, newVal, { vm }) => {
                                    if (newVal) {
                                        vm.getObjectAttrsByOid(newVal);
                                        if (vm?.$refs?.detail?.[0]?.$refs?.['main-source']?.length)
                                            vm?.$refs?.detail?.[0]?.$refs?.['main-source']?.[0]?.getFileData(
                                                newVal,
                                                viewCfg.docViewTableMap.className
                                            );
                                        if (vm?.$refs?.detail?.[0]?.$refs?.['files'].length)
                                            vm?.$refs?.detail?.[0]?.$refs?.['files']?.[0]?.getFileData({
                                                objectOid: newVal,
                                                actionFlag: 1
                                            });
                                    }
                                }
                            }
                        },
                        formSlotsProps() {
                            return {
                                'main-source': {
                                    className: viewCfg.docViewTableMap.className
                                },
                                'files': {
                                    className: viewCfg.docViewTableMap.className
                                }
                            };
                        },
                        formProps: {
                            schemaMapper: {
                                'templateInfo.tmplTemplated': (props) => {
                                    props.hidden = !ErdcRouter.currentRoute.query?.isTemplate || false;
                                }
                            }
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
                            // 文件夹
                            let folderRef =
                                _.find(formData.attrRawList, (item) => item.attrName === 'folderRef')?.value || '';
                            let contentSet = [];

                            // 主要内容源
                            let main = await vm?.$refs?.detail?.[0]?.$refs?.['main-source']?.[0]?.submit(!isSaveDraft);
                            if (!main.valid) return;
                            let mainSourceData = main?.data || {};

                            // 附件
                            let attachmentList =
                                await vm?.$refs?.detail?.[0]?.$refs?.['files']?.[0]?.submit(isSaveDraft);
                            if (!attachmentList.status) return;
                            _.each(attachmentList.data, (item) => {
                                if (item.role !== 'PRIMARY') contentSet.push(item);
                            });
                            if (mainSourceData && Object.keys(mainSourceData).length)
                                contentSet.unshift(mainSourceData);
                            // 有选择摸板的时候,把编码置为空,否则后端报编码重复
                            let filterAttrName = [];
                            let isHavetemplate = formData.attrRawList.find(
                                (item) => item.attrName == 'templateInfo.templateReference'
                            )?.value;
                            _.isEmpty(isHavetemplate) ? '' : filterAttrName.push('identifierNo');

                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) =>
                                    !['folderRef', 'typeReference', 'main-source', 'files']
                                        .concat(filterAttrName)
                                        .includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                folderRef,
                                typeReference,
                                contentSet
                            };
                            delete formData.oid;
                            // 保存草稿
                            if (isSaveDraft) formData.isDraft = true;
                            let createSuccessTip = (name) => {
                                return ErdcI18n.translate('isCreatedSuccess', { name }, i18n);
                            };
                            let tip = isSaveDraft ? createSuccessTip(i18n.draft) : createSuccessTip(i18n.doc);

                            // 应后端要求，创建对象增加appName参数
                            formData.appName = cbbUtils.getAppNameByResource();
                            next(formData, tip);
                        },
                        afterSubmit({ responseData, vm }) {
                            if (vm.$route.query.parentOid) {
                                let data = {
                                    brotherMasterOid: vm.$route.query.brotherMasterOid,
                                    childOidList: [responseData],
                                    filterVo: {},
                                    parentOid: vm.$route.query.parentOid
                                };
                                ErdcHttp({
                                    url: '/fam/struct/batch-create-byIds',
                                    data,
                                    className: responseData.split(':')[1],
                                    method: 'POST'
                                })
                                    .then((res) => {
                                        let { success } = res || {};
                                        if (success) {
                                            // 跳转到详情页(如果是根节点,那就拿插入后的oid去跳转)
                                            let jumpOid = '';
                                            // 如果是根节点的话,就拿到更新后的oid
                                            if (vm.$route.query.isRoot == 'true') {
                                                jumpOid = res?.data?.rawData?.oid?.value;
                                            }
                                            // 如果不是的话,就拿根节点跳转就好咯
                                            else {
                                                jumpOid = vm.$route.query.rootOid;
                                            }
                                            structureJump.call(vm, jumpOid);
                                        }
                                    })
                                    .catch(() => {
                                        structureJump.call(vm, vm.$route.query.rootOid);
                                    });
                            } else if (vm.$route.query.currentOid) {
                                let isOid = vm.$route.query.isOid === 'true' || vm.$route.query.isOid === true;
                                addRelationObj({ ...vm.$route.query, isOid }, responseData, vm);
                            } else if (vm.$route.query.origin === 'folder') {
                                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                    vm.$router.push({
                                        ...vm?.from,
                                        query: _.pick(vm.$route.query, (value, key) => {
                                            return ['pid', 'typeOid'].includes(key) && value;
                                        }),
                                        params: {
                                            componentRefresh: true
                                        }
                                    });
                                });
                            } else {
                                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                    vm.$router.back();
                                });
                            }
                        },
                        // 关闭
                        beforeCancel: function ({ goBack, vm }) {
                            function callback(defaultRouter) {
                                //关闭时-关掉当前页面
                                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                    vm.$router.push({
                                        path: defaultRouter.path,
                                        query: defaultRouter.query,
                                        params: defaultRouter.params,
                                        meta: defaultRouter.meta
                                    });
                                });
                            }
                            if (vm.$route.query.parentOid) {
                                structureJump.call(vm, vm.$route.query.rootOid);
                            } else {
                                goBack(callback);
                            }
                        }
                    }
                };
                const defaultEditConfig = {
                    title: i18n.editDoc,
                    editableAttr: ['containerRef', 'typeReference', 'folderRef'],
                    layoutName: 'UPDATE',
                    isNotTabs: true,
                    showDraftBtn: true,
                    slots: {
                        formBefore: ErdcKit.asyncComponent(ELMP.func('erdc-document/components/BaseInfo/index.js')),
                        formSlots: {
                            'main-source': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/MainContentSource/index.js')
                            ),
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/UploadFileList/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            containerRef: ErdcStore?.state?.space?.context?.oid || ''
                        },
                        formSlotsProps(vm) {
                            const state = vm?.formData?.['iterationInfo.state'] || '';
                            let stateValue = typeof state === 'string' ? state : state?.value;
                            return {
                                'main-source': {
                                    className: viewCfg.docViewTableMap.className,
                                    oid: vm?.containerOid
                                },
                                'files': {
                                    className: viewCfg.docViewTableMap.className,
                                    oid: vm?.containerOid,
                                    isCheckout: stateValue === 'WORKING'
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
                        'folderRef': (data, { value }) => {
                            return value || '';
                        },
                        'classifyReference': (data, { oid }) => {
                            return oid || '';
                        },
                        'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'iterationInfo.state': (data, e) => {
                            return e || '';
                        },
                        'templateInfo.templateReference': (data, { oid }) => {
                            return oid || '';
                        },
                        'title': (data, { value }) => {
                            return value || '';
                        },
                        // 'organizationRef': (data, { oid, displayName }) => {
                        //     return {
                        //         oid,
                        //         name: displayName
                        //     };
                        // }
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
                        //             'folderRef': ({ value }) => {
                        //                 return value || '';
                        //             },
                        //             'classifyReference': ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             'lifecycleStatus.lifecycleTemplateRef': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'iterationInfo.state': (e) => {
                        //                 return e || '';
                        //             },
                        //             'templateInfo.templateReference': ({ oid }) => {
                        //                 return oid || '';
                        //             },
                        //             'title': ({ value }) => {
                        //                 return value || '';
                        //             },
                        //             'organizationRef': ({ value, displayName }) => {
                        //                 return {
                        //                     oid: value,
                        //                     name: displayName
                        //                 };
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
                            // 文件夹
                            let folderRef =
                                _.find(formData.attrRawList, (item) => item.attrName === 'folderRef')?.value || '';
                            let contentSet = [];

                            // 主要内容源
                            let main = await vm?.$refs?.detail?.[0]?.$refs?.['main-source']?.[0]?.submit(true);
                            if (!main.valid) return;
                            let mainSourceData = main?.data || {};

                            // 附件
                            let attachmentList =
                                await vm?.$refs?.detail?.[0]?.$refs?.['files']?.[0]?.submit(isSaveDraft);
                            if (!attachmentList.status) return;
                            _.each(attachmentList.data, (item) => {
                                if (item.role !== 'PRIMARY') contentSet.push(item);
                            });
                            if (mainSourceData && Object.keys(mainSourceData).length)
                                contentSet.unshift(mainSourceData);
                            formData.attrRawList = _.filter(
                                formData.attrRawList,
                                (item) =>
                                    !['folderRef', 'typeReference', 'main-source', 'files'].includes(item.attrName)
                            );
                            formData = {
                                ...formData,
                                folderRef,
                                typeReference,
                                contentSet
                            };
                            // 保存草稿
                            if (isSaveDraft) {
                                formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                                formData.isDraft = true;
                            }

                            // 草稿移除编码参数
                            if (sourceData?.['lifecycleStatus.status']?.value === 'DRAFT') {
                                formData.attrRawList = formData.attrRawList.filter((item) => {
                                    return !['identifierNo'].includes(item.attrName);
                                });
                            }

                            let tip = '文档编辑成功';
                            // 草稿状态的对象编辑保存不需要调用检入接口
                            if (!isSaveDraft && sourceData?.['lifecycleStatus.status']?.value !== 'DRAFT') {
                                const props = {
                                    visible: true,
                                    type: 'save',
                                    className: viewCfg.docViewTableMap.className,
                                    title: '保存',
                                    customSubmit: (vm) => {
                                        if (vm.radio === '3') {
                                            vm.$emit('success');
                                            handleCheckIn = getCheckIn(vm.note);
                                        }
                                        vm.toggleShow();
                                        next(formData);
                                    }
                                };
                                operateAction.mountDialogSave(props);
                            } else {
                                next(formData, tip);
                            }
                        },
                        // 关闭
                        beforeCancel: function ({ formData, vm }) {
                            vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                const { prefixRoute, resourceKey } = vm.$route?.meta || {};
                                if (formData['lifecycleStatus.status'] === 'DRAFT') {
                                    vm.$router.push({
                                        path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/list`,
                                        query: _.pick(vm.$route.query, (value, key) => {
                                            return ['pid', 'typeOid'].includes(key) && value;
                                        })
                                    });
                                } else {
                                    vm.$router.push({
                                        path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/detail`,
                                        query: {
                                            ..._.pick(vm.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid: vm.$route.query?.oid,
                                            routeRefresh: true,
                                            routeKey: vm?.containerOid
                                        }
                                    });
                                }
                            });
                        },
                        async afterSubmit({ responseData, vm, isSaveDraft }) {
                            const { prefixRoute, resourceKey } = vm.$route?.meta || {};
                            let path = isSaveDraft
                                ? `${prefixRoute.split(resourceKey)[0]}erdc-document/document/list`
                                : `${prefixRoute.split(resourceKey)[0]}erdc-document/document/detail`;
                            let newData = null;
                            if (handleCheckIn) {
                                newData = await handleCheckIn(responseData);
                                if (!newData?.success) {
                                    return;
                                }
                                responseData = newData?.data;
                                handleCheckIn = null;
                            }
                            vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                vm.$router.push({
                                    path,
                                    query: {
                                        ..._.pick(vm.$route.query, (value, key) => {
                                            return ['pid', 'typeOid'].includes(key) && value;
                                        }),
                                        oid: responseData,
                                        title: i18n.viewDoc,
                                        className: 'erd.cloud.cbb.doc.entity.EtDocument'
                                    }
                                });
                            });
                        }
                    }
                };
                const defaultDetailConfig = {
                    title: function (formData, caption) {
                        return caption;
                    },
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
                        customBtn: {
                            template: `
                            <erd-button 
                                v-if="!isLatest"
                                class="mr-normal" 
                                @click="latestVersion" 
                            >${i18n.toLatestVersion}</erd-button>
                            `,
                            props: {
                                formData: {
                                    type: Object,
                                    default: () => {
                                        return {};
                                    }
                                },
                                vm: Object
                            },
                            data() {
                                return {
                                    isLatest: true
                                };
                            },
                            computed: {
                                oid() {
                                    return this?.vm?.containerOid;
                                }
                            },
                            watch: {
                                oid: {
                                    handler(val) {
                                        if (!val) return;
                                        this.getCurrentVersionStatus(val);
                                    },
                                    immediate: true
                                }
                            },
                            methods: {
                                getCurrentVersionStatus(oid) {
                                    let className = oid.split(':')?.[1];
                                    return this.$famHttp({
                                        url: '/document/common/is/latest/version',
                                        className,
                                        params: {
                                            oid
                                        },
                                        method: 'get'
                                    }).then((resp) => {
                                        if (resp.success) {
                                            this.isLatest = resp.data;
                                        }
                                    });
                                },
                                latestVersion() {
                                    let className = this.oid.split(':')?.[1];
                                    this.$famHttp({
                                        url: '/document/common/to/latest',
                                        className,
                                        params: {
                                            oid: this.oid
                                        },
                                        method: 'GET'
                                    }).then((res) => {
                                        let data = res.data.rawData;
                                        const oid = data['oid'].value || '';
                                        oid && this.handleDetail(oid);
                                    });
                                },
                                // 转至最新要定位到tab详情页
                                handleDetail(oid) {
                                    const { prefixRoute, resourceKey } = this.$route?.meta || {};
                                    this.$router.push({
                                        path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/detail`,
                                        query: {
                                            ..._.pick(this.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid,
                                            activeName: 'detail',
                                            componentRefresh: true,
                                            className: viewCfg.docViewTableMap.className,
                                            title: i18n.viewDoc
                                        }
                                    });
                                }
                            }
                        },
                        titleAfter: {
                            template: `
                                <div class="flex align-items-center">
                                    <erd-tag type="danger" v-if="locker">{{ $t('editBy', { name: locker }) }}</erd-tag>
                                    <erd-tag size="mini" v-else>{{status}}</erd-tag>
                                </div>
                            `,
                            props: {
                                formData: {
                                    type: Object,
                                    default: () => {
                                        return {};
                                    }
                                }
                            },
                            data() {
                                return {
                                    i18nPath: ELMP.func('erdc-document/locale/index.js')
                                };
                            },
                            computed: {
                                // 生命周期状态
                                status() {
                                    const value = this.formData?.['lifecycleStatus.status'];
                                    return value;
                                },
                                // 检出者
                                locker() {
                                    // 当前用户信息
                                    const userInfo = ErdcStore?.state?.user || {};
                                    // 检出者
                                    const lockerObj = this.formData?.['lock.locker'];
                                    const bool = userInfo && userInfo.id === lockerObj?.value?.id;
                                    const value = bool ? i18n.you : lockerObj?.displayName;
                                    return value;
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
                            'main-source': ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/MainContentSource/components/MainContent/index.js')
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
                            name: i18n.structure,
                            activeName: 'structure',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-document/components/PdmObjectConstruction/index.js')
                            )
                        },
                        {
                            name: i18n.team,
                            activeName: 'team',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-document/components/DocumentTeam/index.js')
                            )
                        },
                        {
                            name: i18n.change,
                            activeName: 'change',
                            basicProps: {
                                className: viewCfg.docViewTableMap.className
                            },
                            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/Change/index.js'))
                        },
                        {
                            name: i18n.relationObj,
                            activeName: 'relationObj',
                            component: ErdcKit.asyncComponent(
                                ELMP.func('erdc-document/components/DocumentRelationObject/index.js')
                            )
                        },
                        {
                            name: i18n.history,
                            activeName: 'historyRecord',
                            basicProps: {
                                className: viewCfg.docViewTableMap.className,
                                toolActionConfig: viewCfg.docHistoryOperate || {}
                            },
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/HistoryRecord/index.js')
                            )
                        },
                        {
                            name: i18n.processInfo,
                            activeName: 'processInformation',
                            basicProps: {
                                className: viewCfg.docViewTableMap.className
                            },
                            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/ProcessInfo/index.js'))
                        },
                        {
                            name: i18n.used,
                            activeName: 'used',
                            basicProps: {
                                className: viewCfg.docViewTableMap.className
                            },
                            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/InUse/index.js'))
                        }
                    ],
                    actionKey: viewCfg.docViewTableMap.rowActionName,
                    layoutName: 'DETAIL',
                    actionParams: {
                        inTable: false,
                        isBatch: false
                    },
                    props: {
                        commonPageTitleProps(vm) {
                            return {
                                showBackButton: !!vm?.$route?.query?.backButton
                            };
                        },
                        formSlotsProps(vm) {
                            const state = vm?.formData?.['iterationInfo.state'] || '';
                            let stateValue = typeof state === 'string' ? state : state?.value;
                            return {
                                'main-source': {
                                    className: viewCfg.docViewTableMap.className,
                                    oid: vm?.containerOid,
                                    readonly: true
                                },
                                'files': {
                                    className: viewCfg.docViewTableMap.className,
                                    oid: vm?.containerOid,
                                    isCheckout: stateValue === 'WORKING'
                                }
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
                        'templateInfo.templateReference': (data, { displayName }) => {
                            return displayName || '';
                        },
                        'typeReference': (data, { displayName }) => {
                            return displayName || '';
                        },

                        'organizationRef': (data, { displayName }) => {
                            return displayName || '';
                        }
                    },
                    hooks: {
                        goBack: function ({ goBack, vm }) {
                            if (vm?.$route?.query?.fromAppName) {
                                // 从别的浏览器页签跳过来的
                                window.open('', vm?.$route?.query?.fromAppName);
                                return;
                            }
                            if (!!vm?.$route?.query?.backButton && vm?.from?.path?.indexOf('workflow') >= 0) {
                                return vm.$store.dispatch('route/delVisitedRoute', vm.$route).then((visitedRoutes) => {
                                    vm.$router.push(
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
                        //             'templateInfo.templateReference': ({ displayName }) => {
                        //                 return displayName || '';
                        //             },
                        //             'typeReference': ({ displayName }) => {
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
                        //             }
                        //         }
                        //     });
                        //     data.files = String(Date.now());
                        //     data['main-source'] = String(Date.now());

                        //     next(data);
                        // }
                    }
                };
                if (customConfig) {
                    return customConfig(viewCfg.docViewTableMap.className, {
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
