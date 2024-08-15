define([
    ELMP.resource('biz-bpm/editor/XmlMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/template.html'),
    'css!' + ELMP.resource('biz-bpm/editor/style.css'),
    'erdcloud.kit',
    'underscore'
], function (XmlMixin, template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'BpmProcessEditor',
        mixins: [XmlMixin],
        template,
        components: {
            BpmProcessDesigner: ErdcKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmProcessDesigner/index.js')
            ),
            PropertiesPanel: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/PropertiesPanel/index.js')),
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        },
        provide() {
            return {
                activeElement: this.activeElement
            };
        },
        props: {
            visible: Boolean,
            templateVid: String,
            templateOid: String,
            processDefinitionId: String,
            categoryRef: String,
            appName: String,
            readonly: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'processDesign',
                    'save',
                    'cancel',
                    'openPropertiesPanel',
                    'collapsePropertiesPanel',
                    'processInitiator',
                    'checkin',
                    'saveDescribe',
                    'checkinDescribe',
                    'saveConfirm',
                    'confirm',
                    'saveSuccess',
                    'validateSuccess',
                    'validateError'
                ]),
                loading: false,
                template: {},
                // 后端返回的xml
                originXml: null,
                collapsed: false,
                activeElement: null,
                bpmnModeler: null,
                destroy: null,
                saveDialog: {
                    visible: false,
                    loading: false,
                    checkIn: 'true'
                },
                serialnumber: 0
            };
        },
        computed: {
            innerTemplateVId: {
                get() {
                    return this.templateVid;
                },
                set(templateVId) {
                    this.$emit('update:templateVId', templateVId);
                }
            },
            xml: {
                get() {
                    return this.template.xmlData;
                },
                set(xml) {
                    this.$set(this.template, 'xmlData', xml);
                }
            },
            validators() {
                return [
                    {
                        validator: this.validateProcessBaseInfo
                    },
                    {
                        validator: this.validateProcessNodeInfo
                    }
                ];
            },
            contentPropertiesPanel() {
                return this.collapsed
                    ? this.i18nMappingObj.openPropertiesPanel
                    : this.i18nMappingObj.collapsePropertiesPanel;
            }
        },
        watch: {
            innerTemplateVId(innerTemplateVId) {
                if (!innerTemplateVId) {
                    this.template = {};
                } else {
                    this.fetchTemplateByVid(innerTemplateVId).then(() => {
                        // do nothing
                    });
                }
            },
            collapsed() {
                this.processReZoom();
            },
            template(val) {
                this.$emit('template-change', val);
            }
        },
        beforeCreate() {
            this._ = _;
            this.ErdcKit = ErdcKit;
        },
        mounted() {
            this.fetchTemplateByVid(this.innerTemplateVId).then(() => {
                // do nothing
            });
        },
        beforeDestroy() {
            this.template = null;
            this._ = null;
            this.activeElement = null;
            this.ErdcKit = null;
            if (this.destroy) {
                this.destroy(this.bpmnModeler);
            }
            this.bpmnModeler = null;
            this.destroy = null;
        },

        methods: {
            useBpmnModeler(moduleKey) {
                return this.$refs.designer.useBpmnModeler()?.get(moduleKey);
            },
            fetchTemplateByVid(templateVId) {
                if (this.loading) {
                    return Promise.resolve();
                }
                return new Promise((resolve, reject) => {
                    this.loading = true;
                    this.$famHttp
                        .get('/bpm/processDef/lastIteration', {
                            data: {
                                branchOId: templateVId,
                                className: this.$store.getters.className('processDefinition')
                            }
                        })
                        .then(({ data }) => {
                            this.loading = false;
                            this.$nextTick(() => {
                                // 对数据进行处理 方便回显
                                this._.each(data.userRoleMap, (value, key) => {
                                    value.id = value.id || key;
                                    value.oid = value.oid || key;
                                    value.name = value.name || value.value;
                                    value.displayName = value.displayName || value.value;
                                });
                                this.template = data;
                                this.originXml = data.xmlData;
                            });
                        })
                        .catch(({ data }) => {
                            reject(data);
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                });
            },
            validateXml(xml) {
                this.$famHttp({
                    url: `/bpm/processDef/validate`,
                    method: 'POST',
                    data: {
                        jsonXml: xml
                    }
                }).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18nMappingObj.validateSuccess);
                    } else {
                        this.$message.error(resp?.message || this.i18nMappingObj.validateError);
                    }
                });
            },
            onInitFinished(bpmnModeler, destroy) {
                this.bpmnModeler = bpmnModeler;
                this.destroy = destroy;
            },
            onShapeAdded(element) {
                let serialnumber = this.getExtensionValue(element, 'serialnumber');
                if (serialnumber === null || serialnumber === undefined) {
                    if (
                        element &&
                        element.type &&
                        [/ServiceTask$/, /UserTask$/].some((item) => item.test(element.type))
                    ) {
                        serialnumber = ++this.serialnumber;
                        this.$nextTick(() => {
                            this.saveExtensionValues(element, 'serialnumber', '' + serialnumber);
                            this.setActiveElement(element);
                        });
                    }
                }
                this.serialnumber = serialnumber ? +serialnumber : this.serialnumber;
            },
            onElementChanged(element) {
                this.syncUpdateInfo(element);
            },
            onSelectionChange: _.throttle(
                function (element, { newSelection }) {
                    this.setActiveElement(newSelection[0]);
                },
                300,
                { trailing: false, leading: false }
            ),
            setActiveElement(element) {
                let currentActiveElement = element;
                if (element?.type === 'label' && element.labelTarget) {
                    currentActiveElement = element.labelTarget;
                }
                const elementRegistry = this.useBpmnModeler('elementRegistry');
                if (!currentActiveElement && elementRegistry) {
                    currentActiveElement =
                        elementRegistry.find((el) => el.type === 'bpmn:Process') ??
                        elementRegistry.find((el) => el.type === 'bpmn:Collaboration');
                }
                if (this.activeElement !== currentActiveElement) {
                    this.activeElement = currentActiveElement;
                }
            },
            onImportDone() {
                this.setActiveElement();
                this.$nextTick(() => {
                    this.processReZoom();
                });
            },
            syncUpdateInfo(element) {
                const businessObject = element?.businessObject;
                if (/Process/i.test(element.type)) {
                    this.$set(this.template, 'engineModelKey', businessObject.id);
                    this.$set(this.template, 'name', businessObject.name);
                    this.$set(this.template, 'metaInfo', (businessObject.documentation || [])[0]?.text || '');
                } else if (/(UserTask|StartEvent|EndEvent)$/i.test(element.type)) {
                    let processActInstDefList = this.template.processActInstDefList || [];
                    let targetNode = {};
                    if (/(UserTask)$/i.test(element.type)) {
                        targetNode = processActInstDefList.find((node) => node.nodeKey === businessObject.id) || {
                            localPrincipalConfig: [
                                {
                                    nodeKey: element.id,
                                    memberType: 'OPERATOR',
                                    participantRef: '-1',
                                    participantRefList: [
                                        {
                                            displayName: this.i18nMappingObj.processInitiator,
                                            oid: '-1'
                                        }
                                    ],
                                    isRequired: true,
                                    processType: '',
                                    percentage: '',
                                    participantFrom: ''
                                }
                            ]
                        };
                    } else {
                        targetNode = processActInstDefList.find((node) => node.nodeKey === businessObject.id) || {};
                    }
                    this.$set(targetNode, 'nodeKey', businessObject.id);
                    this.$set(targetNode, 'nodeType', (businessObject.$type || '').replace(/^bpmn:/, ''));
                    this.$set(targetNode, 'name', businessObject.name);
                    this.$set(targetNode, 'description', (businessObject.documentation || [])[0]?.text || '');
                    processActInstDefList = processActInstDefList.filter((item) => item.nodeKey !== businessObject.id);
                    processActInstDefList.push(targetNode);
                    this.$set(this.template, 'processActInstDefList', processActInstDefList);
                }
            },
            onPropertiesPanelMounted() {
                this.processReZoom();
            },
            processReZoom() {
                setTimeout(() => {
                    this.$refs.designer && this.$refs.designer.processReZoom();
                }, 100);
            },
            saveProcess() {
                this.$nextTick(() => {
                    this.assembleProcess()
                        .then((data) => {
                            this.saveDialog.loading = true;
                            if (this.innerTemplateVId) {
                                this.updateProcess(data)
                                    .then((resp) => {
                                        if (resp.success) {
                                            this.$emit('update-success', resp.data);
                                            this.$message.success({
                                                message: this.i18nMappingObj.saveSuccess,
                                                onClose: () => {
                                                    this.cancelProcess();
                                                }
                                            });
                                            this.saveDialog.visible = false;
                                        } else {
                                            this.$message.error(resp.message);
                                        }
                                    })
                                    .finally(() => {
                                        this.saveDialog.loading = false;
                                    });
                            } else {
                                this.createProcess(data)
                                    .then((resp) => {
                                        if (resp.success) {
                                            this.$emit('create-success', resp.data);
                                            this.$message.success({
                                                message: this.i18nMappingObj.saveSuccess,
                                                onClose: () => {
                                                    this.cancelProcess();
                                                }
                                            });
                                            this.saveDialog.visible = false;
                                        } else {
                                            this.$message.error(resp.message);
                                        }
                                    })
                                    .finally(() => {
                                        this.saveDialog.loading = false;
                                    });
                            }
                        })
                        .catch((e) => {
                            this.$message.error(e.message);
                            this.saveDialog.loading = false;
                        });
                });
            },
            createProcess(data) {
                return this.$famHttp.post('/bpm/create', data);
            },
            updateProcess(data) {
                return this.$famHttp.post('/bpm/update', data);
            },
            async checkIfCheckinNeeded() {
                try {
                    await this.assembleProcess();
                    this.saveDialog.visible = true;
                } catch (error) {
                    this.$message.error(error.message);
                }
            },
            async assembleProcess() {
                let data = {};
                data = await this.assembleFilteredTreatment(this.ErdcKit.deepClone(this.template));
                const results = await this.validate(data);
                const failed = this._.filter(results, (item) => !item.valid);
                if (failed.length) {
                    const message = this._.chain(failed).map('message').flatten().value();
                    throw new Error(message);
                }
                data = await this.assembleEndProduct(data);
                return data;
            },
            async assembleFilteredTreatment(template) {
                // 流程事件配置过滤处理
                template.processEventConfig = this._.map(template.processEventConfig, (processEvent) => {
                    const { handleType, eventType, interfaceMasterRef, eventHierarchy, metaInfo } = processEvent || {};
                    return handleType === 'INTERFACE'
                        ? {
                              eventType,
                              handleType,
                              interfaceMasterRef,
                              eventHierarchy: this._.isArray(eventHierarchy) ? eventHierarchy.join() : eventHierarchy
                          }
                        : {
                              eventType,
                              handleType,
                              metaInfo
                          };
                });

                // 从 xml 过滤流程节点
                const processNodes = this.elementRegistry.getAll().filter((node) => /(Event|Task)/i.test(node.type));
                template.processActInstDefList = template.processActInstDefList?.filter((node) =>
                    processNodes.some(({ id }) => id === node.nodeKey)
                );

                this._.each(template.processActInstDefList, (node) => {
                    // 参与者数据过滤处理
                    if (node.localPrincipalConfig && node.localPrincipalConfig.length) {
                        node.localPrincipalConfig = this._.map(node.localPrincipalConfig, (principal) => ({
                            nodeKey: node.nodeKey,
                            memberType: principal.memberType,
                            participantRef: principal.participantRef,
                            isRequired: principal.isRequired,
                            processType: principal.processType,
                            percentage: principal.percentage,
                            participantFrom: principal.participantFrom
                        }));
                    }

                    // 消息通知数据过滤处理
                    if (node.dueDateConfig?.length) {
                        node.dueDateConfig = this._.map(node.dueDateConfig, (notify) => ({
                            ...notify,
                            nodeKey: node.nodeKey
                        }));
                    }

                    // 事件配置数据过滤处理
                    if (node.processEventConfig && node.processEventConfig.length) {
                        node.processEventConfig = this._.map(node.processEventConfig, (processEvent) => {
                            return processEvent.handleType === 'INTERFACE'
                                ? {
                                      nodeKey: node.nodeKey,
                                      eventType: processEvent.eventType,
                                      handleType: processEvent.handleType,
                                      interfaceMasterRef: processEvent.interfaceMasterRef,
                                      eventHierarchy: this._.isArray(processEvent.eventHierarchy)
                                          ? processEvent.eventHierarchy.join()
                                          : processEvent.eventHierarchy
                                  }
                                : {
                                      nodeKey: node.nodeKey,
                                      eventType: processEvent.eventType,
                                      handleType: processEvent.handleType,
                                      metaInfo: processEvent.metaInfo
                                  };
                        });
                    }
                });

                return template;
            },
            async assembleEndProduct(template) {
                const serialize = function (object) {
                    return Object.keys(object).map((key) => {
                        let value = object[key];
                        return {
                            attrName: key,
                            value: value
                        };
                    });
                };
                this.xml = await this.$refs.designer.getXML();
                let attrRawList = serialize(template) || [];
                // 检入规则
                attrRawList = attrRawList.filter((attr) => attr.attrName !== 'isCheckIn');
                attrRawList.push({
                    attrName: 'isCheckIn',
                    value: this.saveDialog.checkIn
                });

                // 当前检入的分支
                if (template.master?.oid) {
                    attrRawList = attrRawList.filter((attr) => attr.attrName !== 'branchOId');
                    attrRawList.push({
                        attrName: 'branchOId',
                        value: this.innerTemplateVId
                    });
                }

                return {
                    oid: template.master?.oid,
                    attrRawList: serialize({
                        appName: this.appName,
                        name: template.name,
                        description: template.metaInfo
                    }),
                    relationList: [
                        {
                            oid: template.oid,
                            attrRawList,
                            className: this.$store.getters.className('processDefinition')
                        }
                    ],
                    associationField: 'masterRef',
                    className: this.$store.getters.className('processDefMaster')
                };
            },
            validate(data) {
                return Promise.all([
                    this.$refs.panel.validate(),
                    ...this.validators.map((item) => item.validator(data))
                ]);
            },
            /**
             * 校验流程基本信息
             */
            validateProcessBaseInfo(data) {
                const validate = {
                    valid: true,
                    message: []
                };
                if (!data.name) {
                    validate.valid = false;
                    validate.message.push('请输入流程名称');
                }
                if (!data.engineModelKey) {
                    validate.valid = false;
                    validate.message.push('请输入流程Key');
                }
                if (data.engineModelKey && !/^[a-zA-Z$_][0-9a-zA-Z$_-]*$/.test(data.engineModelKey)) {
                    validate.valid = false;
                    validate.message.push('流程 Key 以字母、$或_开头，可包含字母、数字和特殊字符$_-');
                }
                if (!data.codeRuleRef) {
                    validate.valid = false;
                    validate.message.push('请选择流程编码规则');
                }
                const definitions = this.modeler.getDefinitions();
                const signals = this._.filter(definitions?.rootElements, (item) => item.$type === 'bpmn:Signal');
                let signalId,
                    signalValidId,
                    signalName = 0;
                this._.each(signals, (signal) => {
                    if (!signal.id && !signalId) {
                        signalId = 1;
                        validate.valid = false;
                        validate.message.push('请输入信号定义标识');
                    }
                    if (signal.id && !/^[a-zA-Z$_][0-9a-zA-Z$_-]*$/.test(signal.id) && !signalValidId) {
                        signalValidId = 1;
                        validate.valid = false;
                        validate.message.push(this.i18n.signalIdTips);
                    }
                    if (!signal.name && !signalName) {
                        signalName = 1;
                        validate.valid = false;
                        validate.message.push('请输入信号定义名称');
                    }
                });
                if (new Set(signals.map((i) => i.id)).size !== signals.length) {
                    validate.valid = false;
                    validate.message.push(this.i18n.repeatSignal);
                }
                return validate;
            },
            /**
             * 校验流程节点信息
             */
            validateProcessNodeInfo(data) {
                const _this = this;
                const processActInstDefList = data.processActInstDefList || [];
                const results = processActInstDefList.reduce((prev, node, index) => {
                    const element = _this.elementRegistry?._elements?.[node.nodeKey]?.element;
                    const nodeName = node.name || node.nodeKey || `节点-${++index}`;
                    !node.nodeKey && prev.push({ message: `请输入 [${nodeName}] 的Key值` });
                    if (/StartEvent|UserTask|EndEvent/.test(element?.type)) {
                        !node.name && prev.push({ message: `请输入 [${nodeName}] 的名称` });
                    }
                    if (/UserTask/.test(element?.type)) {
                        const routes = this._.find(element?.businessObject?.extensionElements?.values, (ele) =>
                            /FormProperty/.test(ele?.$type)
                        )?.values;
                        if (routes?.length) {
                            if (this._.some(routes, (route) => route.id === '')) {
                                prev.push({ message: `请输入 [${nodeName}] 的路由标识` });
                            }
                            if (this._.some(routes, (route) => route.name === '')) {
                                prev.push({ message: `请输入 [${nodeName}] 的路由名称` });
                            }
                            if (this._.some(routes, (route) => route.name === '')) {
                                prev.push({ message: `请输入 [${nodeName}] 的路由排序` });
                            }
                        }
                        !node.localPrincipalConfig?.length &&
                            prev.push({ message: `请输入 [${nodeName}] 的参与者配置` });
                        this._.some(node.localPrincipalConfig, (item) => !item.participantRef) &&
                            prev.push({ message: `请输入 [${nodeName}] 的参与者` });
                        this._.some(node.localPrincipalConfig, (item) => !_.isBoolean(item.isRequired)) &&
                            prev.push({ message: `请输入 [${nodeName}] 的参与者是否必须` });
                        this._.some(
                            node.localPrincipalConfig,
                            (item) => this._.includes(['ORG', 'GROUP', 'ROLE'], item.memberType) && !item.processType
                        ) && prev.push({ message: `请输入 [${nodeName}] 的参与者处理方式` });
                        this._.some(
                            node.localPrincipalConfig,
                            (item) => item.memberType === 'ROLE' && !item.participantFrom
                        ) && prev.push({ message: `请输入 [${nodeName}] 的参与者数据来源` });
                        this._.some(
                            node.skipSignConfig,
                            (item) => item.skipFlag === 'true' && !item.skipActivityList?.length
                        ) && prev.push({ message: `请输入 [${nodeName}] 的跃签节点选择` });
                    }
                    if (/IntermediateCatchEvent|BoundaryEvent/.test(element?.type)) {
                        const signalEvent = this._.find(element?.businessObject?.eventDefinitions, (item) =>
                            /SignalEventDefinition/.test(item.$type)
                        );
                        signalEvent &&
                            !signalEvent.signalRef &&
                            prev.push({ message: `请输入 [${nodeName}] 的信号事件` });
                        const timerEvent = this._.find(element?.businessObject?.eventDefinitions, (item) =>
                            /TimerEventDefinition/.test(item.$type)
                        );
                        timerEvent &&
                            !timerEvent.values &&
                            !timerEvent.timeCycle &&
                            !timerEvent.timeDate &&
                            !timerEvent.timeDuration &&
                            prev.push({ message: `请输入 [${nodeName}] 的定时事件` });
                        // 匹配ISO 8601时间周期的正则表达式
                        timerEvent?.values?.timeCycle &&
                            !/^R(\d+\/)?P(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/.test(
                                timerEvent.values.timeCycle
                            ) &&
                            prev.push({ message: `请输入 [${nodeName}] 正确的时间周期` });
                        // 匹配ISO 8601日期时间的正则表达式
                        timerEvent?.values?.timeDate &&
                            !/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(
                                timerEvent.values.timeDate
                            ) &&
                            prev.push({ message: `请输入 [${nodeName}] 正确的日期时间` });
                        // 匹配ISO 8601持续时间的正则表达式
                        timerEvent?.values?.timeDuration &&
                            !/^P(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/.test(
                                timerEvent.values.timeDuration
                            ) &&
                            prev.push({ message: `请输入 [${nodeName}] 正确的持续时间` });
                    }
                    return prev;
                }, []);
                return {
                    valid: !results.length,
                    message: this._.map(results, 'message')
                };
            }
        }
    };
});
