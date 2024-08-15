define([
    'fam:store',
    ELMP.resource('erdc-app/api/type.js'),
    'erdcloud.kit',
    'css!' + ELMP.resource('erdc-type-components/TypeLayoutForm/style.css')
], function (store, api) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    const defaultFormConfig = {
        type: 'CREATE',
        name: null,
        nameI18nJson: null,
        createUser: store.state.app.user,
        updateUser: null
    };

    return {
        components: {
            FamFormDesigner: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFormDesigner/index.js')),
            FamFormSetting: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamFormDesigner/components/FormSetting.js')
            )
        },
        template: `
            <erd-ex-dialog
                :visible.sync="dialogVisible"
                custom-class="fam-type-layout-designer" 
                fullscreen
                destroy-on-close
                :show-close="false"
                :show-fullscreen="false"
                @opened="onDialogOpened"
            >
                <template #title>
                    <div class="fam-type-layout-designer__title">
                        <div class="fam-type-layout-designer__title-text">
                            {{ isReadonly ? i18nMappingObj.layoutDetail : isEdit ? i18nMappingObj.updateLayout : i18nMappingObj.createLayout }}
                        </div>
                        <div class="flex align-items-center">
                            <erd-button
                                v-if="!isReadonly"
                                :loading="submitLoading"
                                type="primary"
                                @click="onSubmit"
                            >
                                {{i18nMappingObj.confirm}}
                            </erd-button>
                            <erd-button
                                v-if="isReadonly && typeOid === layout?.contextRef"
                                type="primary"
                                @click="isReadonly = false"
                            >
                                {{i18nMappingObj.edit}}
                            </erd-button>
                            <erd-button @click="saveAs">
                                {{i18nMappingObj.saveAs}}
                            </erd-button>
                            <erd-button @click="cancel">
                                {{i18nMappingObj.cancel}}
                            </erd-button>
                        </div>
                    </div>
                </template>
                
                <fam-form-designer
                    v-if="dialogVisible"
                    ref="designer"
                    class="h-100p"
                    :attribute-list="attributeList"
                    :attribute-categories="attributeCategories"
                    :component-definitions="componentDefinitions"
                    :get-default-widget-list="getDefaultWidgetList"
                    :readonly="isReadonly"
                    :type-oid="typeOid"
                    :type-name="typeName"
                    :is-edit="isEdit"
                    :is-designer-form="true"
                ></fam-form-designer>
              
              <erd-ex-dialog
                  :visible.sync="saveAsDialog"
                  size="small"
                  :title="i18nMappingObj.saveAs"
              >
                  <FamFormSetting
                      ref="formInfo"
                      :form-config.sync="formConfig"
                      label-width="110px"
                      :hide-error-message="!saveAsDialog"
                      destroy-on-close
                  ></FamFormSetting>
                  
                  <template #footer>
                      <div>
                          <erd-button 
                              type="primary"
                              :loading="saveAsLoading"
                              @click="saveAsForm"
                          >{{i18nMappingObj.confirm}}</erd-button>
                          <erd-button
                              @click="saveAsDialog = false"
                          >{{i18nMappingObj.cancel}}</erd-button>
                      </div>
                  </template>
              </erd-ex-dialog>
            </erd-ex-dialog>
        `,
        props: {
            visible: Boolean,
            layoutId: String,
            typeOid: {
                type: String,
                required: true
            },
            typeName: {
                type: String,
                default: ''
            },
            readonly: Boolean,
            useForm: {
                type: String,
                default: 'type'
            }
        },
        data() {
            return {
                submitLoading: false,
                saveAsDialog: false,
                layout: null,
                attributeList: [],
                attributeCategories: [],
                componentDefinitions: [],
                formConfig: {
                    ...defaultFormConfig
                },
                saveAsLoading: false,
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeLayoutForm/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    saveAs: this.getI18nByKey('另存为'),
                    validateFail: this.getI18nByKey('数据校验未通过'),
                    edit: this.getI18nByKey('编辑'),
                    cancel: this.getI18nByKey('取消'),
                    createLayout: this.getI18nByKey('创建布局'),
                    updateLayout: this.getI18nByKey('编辑布局'),
                    createSuccess: this.getI18nByKey('创建成功'),
                    updateSuccess: this.getI18nByKey('更新成功'),
                    layoutDetail: this.getI18nByKey('布局详情')
                }
            };
        },
        computed: {
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(visible) {
                    this.$emit('update:visible', visible);
                }
            },
            isEdit() {
                return !!this.layoutId;
            },
            isReadonly: {
                get() {
                    return this.readonly;
                },
                set(readonly) {
                    this.$emit('update:readonly', readonly);
                }
            }
        },
        watch: {
            typeOid: {
                immediate: true,
                handler(typeOid) {
                    if (typeOid) {
                        api.fetchAttributes(typeOid).then(({ data }) => {
                            this.attributeList = data;
                        });
                    }
                }
            }
        },
        mounted() {
            api.fetchAttributeCategories().then(({ data }) => {
                this.attributeCategories = data;
            });
            api.fetchComponentDefinitions().then(({ data }) => {
                this.componentDefinitions = data;
            });
        },
        methods: {
            onDialogOpened() {
                if (this.layoutId) {
                    api.fetchLayoutById(this.layoutId).then(({ data }) => {
                        this.layout = data;
                        this.backfill();
                    });
                } else if (this.$refs.designer) {
                    this.layout = null;
                }
            },
            cancel() {
                this.dialogVisible = false;
            },
            onSubmit() {
                this.submit().then(() => {
                    // do nothing.
                });
            },
            submit() {
                return new Promise((resolve, reject) => {
                    this.submitLoading = true;
                    this.assemble()
                        .then((payload) => {
                            api[this.isEdit ? 'updateLayout' : 'createLayout'](payload)
                                .then(({ data }) => {
                                    const successMessage = !this.isEdit
                                        ? this.i18nMappingObj.createSuccess
                                        : this.i18nMappingObj.updateSuccess;
                                    const eventName = !this.isEdit ? 'create-success' : 'update-success';
                                    // 更新表单回显
                                    this.layoutId &&
                                        api.fetchLayoutById(this.layoutId).then(({ data }) => {
                                            this.backfill(typeof data === 'string' ? null : data);
                                        });
                                    this.$message.success(successMessage);
                                    this.dialogVisible = false;
                                    resolve();
                                    this.$emit(eventName, {
                                        payload,
                                        oid: data
                                    });
                                })
                                .catch(({ data }) => {
                                    reject(new Error(data?.message), data);
                                })
                                .finally(() => {
                                    this.submitLoading = false;
                                });
                        })
                        .catch((e) => {
                            reject(e);
                            this.submitLoading = false;
                        });
                });
            },
            backfill(layout) {
                this.$refs.designer?.deserialize(layout || this.layout);
            },
            saveAs() {
                this.formConfig = { ...defaultFormConfig };
                this.saveAsDialog = true;
            },
            saveAsForm() {
                return new Promise((resolve, reject) => {
                    const $form = this.$refs.formInfo;
                    if (!$form) {
                        reject(new Error('未打开另存为弹窗'));
                        return;
                    }
                    this.saveAsLoading = true;
                    Promise.all([$form.validate(), this.$refs.designer.$refs.settingPanel.validateWidgetsField()])
                        .then(() => {
                            const formConfig = this.formConfig;
                            this.$refs.designer
                                .getData(formConfig)
                                .then((data) => {
                                    const payload = this.assemblePayload(data, null);
                                    api.createLayout(payload)
                                        .then(() => {
                                            this.saveAsLoading = false;
                                            this.$message.success(this.i18nMappingObj.createSuccess);
                                            this.saveAsDialog = false;
                                            this.$emit('create-success', {
                                                payload,
                                                oid: data
                                            });
                                        })
                                        .catch(({ data }) => {
                                            reject(new Error(data?.message), data);
                                        })
                                        .finally(() => {
                                            this.saveAsLoading = false;
                                        });
                                })
                                .catch((e) => {
                                    this.saveAsLoading = false;
                                    reject(e);
                                });
                        })
                        .catch((e) => {
                            this.saveAsLoading = false;
                            reject(e);
                        });
                });
            },
            assemble() {
                return new Promise((resolve, reject) => {
                    this.$refs.designer
                        .assemble()
                        .then((data) => {
                            const payload = this.assemblePayload(data, this.layout?.oid);
                            resolve(payload);
                        })
                        .catch(reject);
                });
            },
            assemblePayload(data, oid) {
                const attrRawList = data.attrRawList;
                attrRawList.push({
                    attrName: 'contextRef',
                    value: this.typeOid
                });
                const widgetList = data.widgetList;

                return {
                    oid: oid,
                    attrRawList,
                    className: this.$store.getters.className('layoutDefinition'),
                    associationField: 'layoutRef',
                    relationList: _.map(widgetList, (widget) => {
                        return {
                            attrRawList: widget.attrRawList,
                            className: this.$store.getters.className('layoutAttrDefinition')
                        };
                    })
                };
            },
            getDefaultWidgetList(designer, widgets) {
                if (this.useForm === 'classify' && !this.isEdit) {
                    const FamClassificationTitle = widgets.find((widget) => {
                        return ErdcKit.isSameComponentName(widget.key, 'FamClassificationTitle');
                    });
                    if (FamClassificationTitle) {
                        return [designer.copyNewFieldWidget(FamClassificationTitle)];
                    }
                }
                return [];
            }
        }
    };
});
