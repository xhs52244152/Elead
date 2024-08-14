define([
    ELMP.resource('ppm-store/index.js'),
    'erdcloud.kit',
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('knowledge-library-list/locale/index.js'),
    'erdcloud.store',
    ELMP.resource('project-space/views/project-info/locale/index.js')
], function (ppmStore, ErdcKit, commonHttp, globalUtils, { i18n }, ErdcStore, infoI18n) {
    const router = require('erdcloud.router');
    const i18nMappingObj = globalUtils.languageTransfer(i18n);
    const i18nMappingObjInfo = globalUtils.languageTransfer(infoI18n.i18n);
    let containerRef;
    const documentClassName = ppmStore.state.classNameMapping.document;
    const subClassName = ErdcStore.getters.className('subFolder');
    const utils = {
        async getContainerRef() {
            return new Promise((resolve) => {
                const { $route } = router.app;
                // 如果是【我的文档】就用路由上的containerRef
                if ($route.meta.documentType === 'myDocument') {
                    return resolve($route.query.containerRef);
                }
                // 在项目里就传项目的容器id
                if (utils.isProject()) {
                    const famStore = require('fam:store');
                    const { id, key } = ppmStore.state.projectInfo?.containerRef || {};
                    containerRef = famStore.state?.space?.object?.containerRef || `OR:${key}:${id}` || '';
                    return resolve(containerRef);
                }
                // 在知识库就用知识库的容器id
                containerRef = ppmStore.state.knowledgeInfo.containerRef;
                resolve(containerRef);
            });
        },
        getConfigs() {
            return [
                {
                    field: 'folderRef',
                    component: 'custom-select',
                    label: i18nMappingObj.folder, // 文件夹
                    labelLangKey: 'component',
                    disabled: false,
                    required: false,
                    validators: [],
                    slots: {
                        component: 'folderRef'
                    },
                    col: 12
                },
                {
                    field: 'securityLabel',
                    component: 'custom-select',
                    label: i18nMappingObj.classification, // 密级
                    labelLangKey: 'component',
                    disabled: false,
                    required: true,
                    validators: [],
                    props: {
                        placeholder: i18nMappingObj.pleaseSelect,
                        placeholderLangKey: 'pleaseSelect',
                        defaultSelectFirst: true,
                        row: {
                            componentName: 'virtual-select',
                            clearNoData: true,
                            requestConfig: {
                                url: '/fam/type/component/enumDataList',
                                viewProperty: 'value',
                                valueProperty: 'name',
                                data: {
                                    realType: 'erd.cloud.core.enums.SecurityLabel'
                                },
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                },
                                method: 'POST'
                            }
                        }
                    },
                    col: 12
                },
                {
                    field: 'securityDate',
                    component: 'erd-date-picker',
                    label: i18nMappingObj.securityDate, // 密级日期
                    labelLangKey: 'component',
                    disabled: false,
                    required: false,
                    validators: [],
                    col: 12
                },
                {
                    field: 'mainContent',
                    component: '',
                    label: i18nMappingObj.mainContent, // 主内容
                    labelLangKey: '',
                    disabled: false,
                    hidden: false,
                    required: true,
                    slots: {
                        component: 'mainContent'
                    },
                    col: 24
                }
            ];
        },
        getCustomFormConfig(vm, formConfigs) {
            const config = formConfigs.filter((item) => {
                if (item.field === 'identifierNo') {
                    return false;
                }
                if (item.field === 'name') {
                    item.col = 12;
                }
                return true;
            });
            return utils.isProject()
                ? []
                : [
                      ...config,
                      {
                          field: 'folderRef',
                          component: 'custom-select',
                          label: i18nMappingObj.parentFolder, // 文件夹
                          labelLangKey: 'component',
                          disabled: false,
                          required: true,
                          validators: [],
                          slots: {
                              component: 'folderRef'
                          },
                          col: 12
                      }
                  ];
        },
        // 是否在项目空间下,文档和文件夹会在【项目】【文档】和【知识库】用到
        isProject() {
            return window.__currentAppName__ === 'erdc-project-web';
        },
        registerGotoDetail() {
            ErdcStore.dispatch('cbbStore/setCustomUtils', {
                name: 'goToDetail',
                customFunc: (row) => {
                    const router = require('erdcloud.router');
                    const { $router, $route } = router.app;
                    let path = '/knowledge-library-list/document/detail';
                    let query = {
                        oid: row.oid,
                        title: row.name
                    };
                    if (window.__currentAppName__ === 'erdc-project-web') {
                        path = '/space/project-folder/document/detail';
                        query.pid = $route.query.pid;
                    }
                    $router.push({
                        path,
                        query
                    });
                }
            });
        },
        isDisabled() {
            const router = require('erdcloud.router');
            const { $route } = router.app;
            // 项目空间下，左侧树结构创建文件夹需要禁用
            return utils.isProject() && $route.query.disabled === 'true';
        }
    };
    return {
        [documentClassName]: {
            create: {
                title: i18nMappingObj.createDocument,
                layoutName: () => {
                    return utils.isProject() ? 'PPM_PROJECT_CREATE' : 'PPM_KNOWLEDGE_CREATE';
                },
                slots: {
                    formBefore: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/BasicInfo/index.js')
                    ),
                    formSlots: {
                        files: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                        )
                    }
                },
                props: {
                    formBefore: {
                        getContainerRef: utils.getContainerRef,
                        isSubTypeEnum: false,
                        customFormConfig: (vm, formConfigs) => {
                            formConfigs.some((item) => {
                                if (item.field === 'name') {
                                    item.col = 12;
                                    item.props.maxlength = 30;
                                    return;
                                }
                            });
                            let configs = utils.getConfigs(vm, 'create');
                            return [...formConfigs, ...configs];
                        },
                        formSlots: {
                            mainContent: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/CommonUpload/index.js')
                            ),
                            folderRef: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/FolderComponents/index.js')
                            )
                        },
                        formSlotsProps: {
                            folderRef: {
                                getContainerRef: utils.getContainerRef,
                                defaultFirst: () => {
                                    const { $route } = router.app;
                                    return $route.meta.documentType === 'myKnowledge';
                                }
                            }
                        }
                    }
                },
                hooks: {
                    beforeSubmit: async function ({ formData, next, vm }) {
                        if (!containerRef) await utils.getContainerRef();
                        delete formData.containerRef;
                        delete formData.oid;
                        formData.attrRawList.push({
                            attrName: 'containerRef',
                            value: containerRef
                        });
                        formData.folderRef =
                            formData.attrRawList.find((item) => item.attrName === 'folderRef')?.value || '';
                        let primaryObj = formData.attrRawList.find((item) => item.attrName === 'mainContent')?.value;
                        formData.contentSet = [
                            {
                                actionFlag: 1,
                                id: primaryObj.id,
                                location: 'REMOTE',
                                name: primaryObj.fileName,
                                role: 'PRIMARY',
                                source: 0
                            }
                        ];
                        let files = _.find(formData.attrRawList, { attrName: 'files' })?.value || [];
                        if (files && files.length) {
                            _.each(files, (id) => {
                                formData.contentSet.push({
                                    id,
                                    actionFlag: 1,
                                    source: 0,
                                    role: 'SECONDARY'
                                });
                            });
                        }
                        const keys = ['files', 'mainContent', 'identifierNo', 'typeReference'];
                        formData.attrRawList = formData.attrRawList.filter((item) => !keys.includes(item.attrName));
                        next(formData, i18nMappingObj.createdSuccessfully, { headers: { 'App-Name': 'PPM' } });
                    },
                    afterSubmit: function ({ vm, responseData, cancel }) {
                        let title = vm.$refs.detail?.[0]?.$refs.beforeForm.formData.name;
                        let documentType = vm.$route.meta.documentType;
                        vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                            const pathMap = {
                                myKnowledge: '/my-knowledge/document/detail',
                                knowledgeList: '/knowledge-library-list/document/detail',
                                projectDocument: '/space/project-folder/document/detail'
                            };
                            let query = {
                                oid: responseData,
                                title
                            };
                            if (documentType === 'projectDocument') {
                                query.pid = vm.$route.query.pid;
                            }
                            vm.$router.push({
                                path: pathMap[documentType],
                                query
                            });
                        });
                    }
                }
            },
            edit: {
                title: i18nMappingObj.editDocument,
                tabs: [
                    {
                        name: i18nMappingObj.infoDetail,
                        activeName: 'detail'
                    },
                    {
                        name: i18nMappingObj.history,
                        activeName: 'historyRecord',
                        basicProps: {
                            className: documentClassName
                        },
                        component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/HistoryRecord/index.js'))
                    },
                    {
                        name: i18nMappingObj.processRecords,
                        activeName: 'processRecords',
                        component: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/ProcessRecords/index.js')
                        )
                    }
                ],
                layoutName: () => {
                    const { $route } = router.app;
                    const layoutNameMap = {
                        myKnowledge: 'PPM_KNOWLEDGE_UPDATE',
                        knowledgeList: 'PPM_KNOWLEDGE_UPDATE',
                        projectDocument: 'PPM_PROJECT_UPDATE',
                        myDocument: 'PPM_PROJECT_UPDATE'
                    };
                    return layoutNameMap[$route.meta.documentType];
                },
                slots: {
                    formBefore: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/BasicInfo/index.js')
                    ),
                    formSlots: {
                        files: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                        )
                    }
                },
                modelMapper: {},
                props: {
                    formBefore: {
                        getContainerRef: () => {
                            const { $route } = router.app;
                            if ($route.meta.documentType === 'myDocument') {
                                return Promise.resolve($route.query.containerRef);
                            }
                            return utils.getContainerRef;
                        },
                        isSubTypeEnum: false,
                        customFormConfig: (vm, formConfigs) => {
                            formConfigs.some((item) => {
                                if (item.field === 'name') {
                                    item.col = 12;
                                    return;
                                }
                            });
                            let configs = utils.getConfigs(vm, 'edit');
                            return [...formConfigs, ...configs];
                        },
                        formSlots: {
                            mainContent: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/CommonUpload/index.js')
                            ),
                            folderRef: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/FolderComponents/index.js')
                            )
                        },
                        formSlotsProps: {
                            folderRef: {
                                getContainerRef: utils.getContainerRef
                            }
                        },
                        beforeCreated: () => {
                            // 因为不知道CBBStore什么时候注册完，所以放到基础信息里注册
                            utils.registerGotoDetail();
                        }
                    },
                    formSlotsProps() {
                        return {
                            files: {
                                operationConfigName: 'DOC_ATTACH_PER_FULL_OP_MENU'
                            }
                        };
                    }
                },
                hooks: {
                    beforeSubmit: async function ({ formData, next, vm }) {
                        delete formData.containerRef;
                        const dayjs = require('dayjs');
                        formData.typeReference =
                            formData.attrRawList.find((item) => item.attrName === 'typeReference')?.value || '';
                        let primaryObj = formData.attrRawList.find((item) => item.attrName === 'mainContent')?.value;
                        formData.contentSet = [
                            {
                                actionFlag: 1,
                                id: primaryObj.id,
                                location: 'REMOTE',
                                name: primaryObj.fileName || primaryObj.name,
                                role: 'PRIMARY',
                                source: 0
                            }
                        ];
                        formData.attrRawList.find((item) => item.attrName === 'securityDate').value =
                            dayjs().format('YYYY-MM-DD');
                        const keys = ['files', 'mainContent', 'identifierNo', 'typeReference'];
                        formData.attrRawList = formData.attrRawList.filter((item) => !keys.includes(item.attrName));
                        next(formData, i18nMappingObj.saveSuccessfully, { headers: { 'App-Name': 'PPM' } });
                    },
                    afterSubmit: function ({ vm, responseData, cancel }) {
                        vm.$famHttp({
                            url: '/document/common/checkin',
                            method: 'PUT',
                            className: documentClassName,
                            params: {
                                oid: responseData,
                                note: ''
                            }
                        }).then(() => {
                            let title = vm.$refs.detail[0].formData.name;
                            const { $route } = router.app;
                            const pathMap = {
                                myKnowledge: '/my-knowledge/document/detail',
                                knowledgeList: '/knowledge-library-list/document/detail',
                                projectDocument: '/space/project-folder/document/detail',
                                myDocument: '/project-my-document/document/detail'
                            };
                            vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                let query = {
                                    oid: responseData,
                                    title
                                };
                                if (utils.isProject()) {
                                    query.pid = vm.$route.query.pid;
                                }
                                vm.$router.push({
                                    path: pathMap[$route.meta.documentType],
                                    query
                                });
                            });
                        });
                    }
                }
            },
            detail: {
                title: function (formData) {
                    // 由于详情页面没有提供在页面渲染时的外部方法，所以把CBBStor放在这里注册
                    utils.registerGotoDetail();
                    if (!formData.name) return '';
                    return formData.name + '; ' + formData.identifierNo;
                },
                layoutName: () => {
                    const { $route } = router.app;
                    const layoutNameMap = {
                        myKnowledge: 'PPM_PROJECT_DETAIL',
                        knowledgeList: 'PPM_PROJECT_DETAIL',
                        projectDocument: 'PPM_PROJECT_DETAIL',
                        myDocument: 'PPM_PROJECT_DETAIL'
                    };
                    return layoutNameMap[$route.meta.documentType];
                },
                slots: {
                    formSlots: {
                        'files': ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                        ),
                        'main-content': ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/CommonUpload/index.js')
                        )
                    }
                },
                modelMapper: {
                    'folderRef': (data) => {
                        return data.folderRef?.displayName;
                    },
                    'createBy': (data) => {
                        return data.createBy?.users;
                    },
                    'updateBy': (data) => {
                        return data.updateBy?.users;
                    },
                    'lifecycleStatus.status': (data) => {
                        return data['lifecycleStatus.status']?.displayName;
                    },
                    'containerRef': (data) => {
                        return data.containerRef?.oid || '';
                    }
                },
                props: {
                    formSlotsProps() {
                        return {
                            files: {
                                operationConfigName: 'DOC_ATTACH_DETAIL_FULL_OP_MENU'
                            }
                        };
                    }
                },
                actionKey: () => {
                    const { $route } = router.app;
                    const actionKeyMap = {
                        myKnowledge: 'KNOWLEDGE_DOCUMENT_OPERATE_MENU',
                        knowledgeList: 'KNOWLEDGE_DOCUMENT_OPERATE_MENU',
                        projectDocument: 'PROJECT_DOCUMENT_OPERATE_MENU',
                        myDocument: 'WORKBENCH_PROJECT_DOC_OPERATE'
                    };
                    return actionKeyMap[$route.meta.documentType];
                },
                showSpecialAttr: true,
                keyAttrs: function (formData) {
                    const infoListData = [
                        {
                            name: formData.createBy?.[0]?.displayName || '',
                            label: i18nMappingObj.creator,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        },
                        {
                            name: formData.createTime,
                            label: i18nMappingObj.createTime,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        },
                        {
                            name: formData['lifecycleStatus.status'] || '',
                            label: i18nMappingObj.state,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        },
                        {
                            name: ppmStore.state.projectInfo.name,
                            label: i18nMappingObj.project,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        }
                    ];
                    const { $route } = router.app;
                    return ['projectDocument'].includes($route.meta.documentType) ? infoListData : [];
                },
                tabs: [
                    {
                        name: i18nMappingObj.infoDetail,
                        activeName: 'detail'
                    },
                    {
                        name: i18nMappingObj.history,
                        activeName: 'historyRecord',
                        basicProps: {
                            className: documentClassName
                        },
                        component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/HistoryRecord/index.js'))
                    },
                    {
                        name: i18nMappingObj.processRecords,
                        activeName: 'processRecords',
                        component: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/ProcessRecords/index.js')
                        )
                    }
                ],
                hooks: {}
            }
        },
        [subClassName]: {
            create: {
                title: i18nMappingObj.createFolder,
                slots: {
                    formBefore: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/BasicInfo/index.js')
                    ),
                    formSlots: {
                        'project-ref': ErdcKit.asyncComponent(
                            ELMP.resource('project-folder/components/ProjectRef/index.js')
                        ),
                        'folder-ref': ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/FolderComponents/index.js')
                        )
                    }
                },
                layoutName: () => {
                    return utils.isProject() ? 'PPM_PROJECT_CREATE' : 'PPM_CREATE';
                },
                props: {
                    formBefore: () => {
                        return utils.isProject()
                            ? {
                                  customFormConfig: () => [],
                                  basicCreated: (vm) => {
                                      vm.renderLayoutForm(subClassName);
                                  }
                              }
                            : {
                                  getContainerRef: utils.getContainerRef,
                                  isSubTypeEnum: false,
                                  customFormConfig: utils.getCustomFormConfig,
                                  formSlots: {
                                      folderRef: ErdcKit.asyncComponent(
                                          ELMP.resource('ppm-component/ppm-components/FolderComponents/index.js')
                                      )
                                  },
                                  formSlotsProps: {
                                      folderRef: {
                                          getContainerRef: utils.getContainerRef,
                                          isDisabled: utils.isProject()
                                      }
                                  },
                                  customRenderLayoutForm: (data, renderLayoutForm) => {
                                      let { typeOid } = data;
                                      renderLayoutForm(typeOid);
                                  }
                              };
                    },
                    formSlotsProps() {
                        return utils.isProject()
                            ? {
                                  'folder-ref': {
                                      getContainerRef: utils.getContainerRef,
                                      folderChange: (vm, oid) => {
                                          vm.formData.folderRef = oid;
                                      },
                                      isDisabled: utils.isDisabled()
                                  },
                                  'project-ref': {
                                      projectRefValue: `[${i18nMappingObjInfo.project}]${ppmStore.state.projectInfo?.name}`
                                  }
                              }
                            : {};
                    },
                    formProps(vm) {
                        return {};
                    }
                },
                hooks: {
                    beforeSubmit: async function ({ formData, next, vm }) {
                        Reflect.deleteProperty(formData, 'oid');
                        // 知识库创建文件夹需要传这个参数给后端
                        !utils.isProject() &&
                            formData.attrRawList.push({
                                attrName: 'isAddDomain',
                                value: true
                            });
                        const containerRef = await utils.getContainerRef();
                        formData.containerRef = containerRef;
                        next(formData, i18nMappingObjInfo.createSuccess, { headers: { 'App-Name': 'PPM' } });
                    },
                    afterSubmit: function ({ cancel }) {
                        cancel();
                    }
                }
            },
            edit: {
                title: i18nMappingObj.updateFolder,
                slots: {
                    formBefore: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/BasicInfo/index.js')
                    ),
                    formSlots: {
                        'project-ref': ErdcKit.asyncComponent(
                            ELMP.resource('project-folder/components/ProjectRef/index.js')
                        ),
                        'folder-ref': ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/FolderComponents/index.js')
                        )
                    }
                },
                layoutName: () => {
                    return utils.isProject() ? 'PPM_PROJECT_UPDATE' : 'PPM_UPDATE';
                },
                props: {
                    formBefore: () => {
                        return utils.isProject()
                            ? { customFormConfig: () => [] }
                            : {
                                  getContainerRef: utils.getContainerRef,
                                  isSubTypeEnum: false,
                                  customFormConfig: utils.getCustomFormConfig,
                                  formSlots: {
                                      folderRef: ErdcKit.asyncComponent(
                                          ELMP.resource('ppm-component/ppm-components/FolderComponents/index.js')
                                      )
                                  },
                                  formSlotsProps: {
                                      folderRef: {
                                          getContainerRef: utils.getContainerRef,
                                          readonly: true
                                      }
                                  }
                              };
                    },
                    formSlotsProps() {
                        return utils.isProject()
                            ? {
                                  'folder-ref': {
                                      getContainerRef: utils.getContainerRef,
                                      folderChange: (vm, oid) => {
                                          vm.formData.folderRef = oid;
                                      },
                                      isDisabled: true
                                  },
                                  'project-ref': {
                                      projectRefValue: `[${i18nMappingObjInfo.project}]${ppmStore.state.projectInfo?.name}`
                                  }
                              }
                            : {};
                    },
                    formProps() {
                        return {};
                    }
                },
                hooks: {
                    beforeSubmit: async function ({ formData, next }) {
                        const containerRef = await utils.getContainerRef();
                        formData.containerRef = containerRef;
                        const tip = utils.isProject() ? i18nMappingObj.update : i18nMappingObj.updateSuccessfully;
                        next(formData, tip, { headers: { 'App-Name': 'PPM' } });
                    },
                    afterSubmit: function ({ cancel }) {
                        cancel();
                    }
                }
            }
        }
    };
});
