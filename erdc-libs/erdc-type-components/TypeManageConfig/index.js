/*
    类型基本信息配置
    先引用 kit组件
    TypeManageConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeManageConfig/index.js')), // 编辑子类型

    <type-manage-config
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    :title="attrName"
    :oid="typeOid"
    :openType="openType"
    @onsubmit="onSubmit"></type-manage-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-type-components/TypeManageConfig/template.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'erdc-kit',
    'underscore'
], function (template, fieldTypeMapping, utils) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        template,
        mixins: [fieldTypeMapping],
        components: {
            CodeRuleForm: ErdcKit.asyncComponent(ELMP.resource('biz-code-rule/components/CodeRuleForm/index.js'))
        },
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // oid
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // openType
            openType: {
                type: String,
                default: () => {
                    return '';
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeManageConfig/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    internalName: this.getI18nByKey('内部名称'),
                    displayName: this.getI18nByKey('显示名称'),
                    icon: this.getI18nByKey('图标'),
                    selectIcon: this.getI18nByKey('选择图标'),
                    enter: this.getI18nByKey('请输入'),
                    internalNameError: this.getI18nByKey('请填写内部名称'),
                    internalNameError1: this.getI18nByKey('内部名称格式错误：如果有“.”，请将其放到中间'),
                    internalNameError2: this.getI18nByKey('内部名称格式错误：请输入字母、数字或“.”'),
                    discardTypeCreate: this.getI18nByKey('是否放弃子类型的创建？'),
                    discardCreate: this.getI18nByKey('放弃创建'),
                    discardEdit: this.getI18nByKey('放弃编辑'),
                    discardServerEdit: this.getI18nByKey('是否放弃服务的编辑'),
                    discardTypeEdit: this.getI18nByKey('是否放弃当前类型的编辑？'),
                    update: this.getI18nByKey('更新成功'),
                    create: this.getI18nByKey('创建成功'),

                    enterNumber: this.getI18nByKey('请输入数字'),
                    integer: this.getI18nByKey('请输入不小于0的正整数'),
                    minValue: this.getI18nByKey('最小值不能大于最大值'),
                    maxValue: this.getI18nByKey('最大值不能小于最小值'),
                    tableNameError: this.getI18nByKey('tableNameError'),
                    tableNameTips: this.getI18nByKey('tableNameTips')
                },
                primaryOid: '',
                constraintOid: '',
                unfold: true,
                typeOid: null,
                appName: 'plat',
                className: null,
                disabled: false,
                defaultList: undefined,
                isChanged: false,
                dynamicConfig: [],
                defaultName: 'erd.cloud.',
                formData: {
                    typeName: 'erd.cloud.', // 内部名称
                    displayName: {
                        // 显示名称
                        attr: 'nameI18nJson',
                        attrName: '显示名称',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    },
                    icon: 'erd-iconfont erd-icon-triangle-left', // 图标
                    description: {
                        attr: 'nameI18nJson',
                        attrName: '说明',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    },
                    lifecycleTemplateName: '', // 生命周期管理
                    codeDefCode: '', // 编号规则
                    teamTemplateName: '', // 团队模板
                    defaultFolderName: '', // 默认文件夹
                    enableCategoryManagement: '1', // 启用分类管理
                    subtypeable: true, // 可有子类型
                    instantiable: true, // 可实例化
                    changeMgmtCanceledStates: '', // 取消状态
                    changeMgmtCompletedStates: '', // 完成状态
                    protected: '', // 受保护的
                    maxAllowedColumns: '', // 允许的列上限
                    enableColumnSpan: '', // 启用列扩展
                    tooltip: '', // 工具提示
                    sort_order: '', // 排列顺序
                    securty: '', // 密级
                    classifyEnable: false, // 启用分类属性
                    classifyRef: null // 分类
                },
                parentFormData: {},
                parentData: {},
                personFormData: {},
                typeLevel: false,
                TypeData: {},
                iconBtn: false,
                loading: false,
                visible2: false,
                isShowCodeDefCodeComponent: true
            };
        },
        watch: {
            formData: {
                handler(newV) {
                    if (newV) {
                        if (this.defaultList === undefined || this.defaultList === null) {
                            this.defaultList = newV;
                            this._unwatchDefaultList = this.$watch('defaultList', {
                                deep: true,
                                handler: function () {
                                    this.isChanged = true;
                                    this.disabled = false;
                                }
                            });
                        }
                    }
                },
                deep: true
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            formConfig: {
                get() {
                    let _this = this;
                    let defaultConfig = [
                        {
                            field: 'typeName',
                            component: 'erd-input',
                            label: this.i18nMappingObj['internalName'],
                            labelLangKey: this.i18nMappingObj['internalName'],
                            readonly: this.openType !== 'create',
                            hidden: false,
                            required: this.openType !== 'edit',
                            validators:
                                this.openType === 'edit'
                                    ? []
                                    : [
                                          {
                                              validator: function (rule, value, callback) {
                                                  const reg = /^[a-zA-Z0-9]+(\.?[a-zA-Z0-9]+)*$/g;
                                                  if (value.trim() === '') {
                                                      // callback(new Error('请填写内部名称'))
                                                      callback(new Error(_this.i18nMappingObj['internalNameError']));
                                                  } else if (!reg.test(value)) {
                                                      if (value.match(/[^a-zA-Z0-9.]/gi)) {
                                                          // callback(new Error('内部名称格式错误：请输入字母、数字或“.”'))
                                                          callback(
                                                              new Error(_this.i18nMappingObj['internalNameError2'])
                                                          );
                                                      } else {
                                                          if (value.match(/[.]$/g)) {
                                                              // callback(new Error('内部名称格式错误：如果有“.”，请将其放到中间'))
                                                              callback(
                                                                  new Error(_this.i18nMappingObj['internalNameError1'])
                                                              );
                                                          } else {
                                                              // callback(new Error('内部名称格式错误：请输入字母、数字或“.”'))
                                                              callback(
                                                                  new Error(_this.i18nMappingObj['internalNameError2'])
                                                              );
                                                          }
                                                      }
                                                  } else {
                                                      callback();
                                                  }
                                              },
                                              trigger: ['blur', 'change']
                                          }
                                      ],
                            props: {
                                clearable: false,
                                placeholder: this.i18nMappingObj['enter'],
                                placeholderLangKey: this.i18nMappingObj['enter']
                            },
                            listeners: {
                                input: (data) => {
                                    this.formData['typeName'] =
                                        data.indexOf(this.defaultName) === 0 || data === this.defaultName
                                            ? data
                                            : this.defaultName;
                                }
                            },
                            col: this.openType === 'create' ? 24 : 12
                        }
                    ];
                    return [...defaultConfig, ...this.dynamicConfig];
                }
            }
        },
        mounted() {
            this.getTypeDefById();
        },
        beforeDestroy() {
            this._unwatchDefaultList && this._unwatchDefaultList();
        },
        methods: {
            getTypeDefById() {
                this.$famHttp({
                    url: '/fam/type/typeDefinition/getTypeDefById',
                    data: { oid: this.oid },
                    method: 'get'
                }).then((resp) => {
                    const _this = this;
                    // 获取父节点数据
                    if (resp.data.parentRef && +resp.data.parentId !== 0) {
                        this.$famHttp({
                            url: '/fam/type/typeDefinition/getTypeDefById',
                            data: { oid: resp.data.parentRef },
                            method: 'get'
                        }).then((res) => {
                            this.parentData = res.data;
                            let parentMap = res.data.propertyMap;
                            Object.values(parentMap).forEach((val) => {
                                let renderValue = val.propertyValue;
                                if (val.name === 'description' || val.name === 'displayName') {
                                    this.parentFormData[val.name] = {
                                        attr: 'nameI18nJson',
                                        attrName: val.name,
                                        value: renderValue.languageJson || {}
                                    };
                                } else if (val.name === 'icon') {
                                    this.parentFormData[val.name] =
                                        renderValue.value || 'erd-iconfont erd-icon-triangle-left';
                                } else {
                                    this.parentFormData[val.name] = renderValue.i18nValue || renderValue.value || '';
                                }

                                if (this.openType === 'create' && val.name !== 'displayName')
                                    this.checkChange(true, val.name);
                            });
                        });
                    }
                    this.disabled = true;
                    if (resp.data) {
                        this.TypeData = resp.data;
                        const formData = resp.data || [];
                        this.typeOid = formData.oid;
                        this.appName = resp.data?.appName;
                        this.className = formData.idKey;
                        this.dynamicConfig = [];
                        let obj = {};
                        let propertyMap = formData.propertyMap || {};

                        if (formData.idKey === 'erd.cloud.foundation.tenant.entity.ServiceInfo') {
                            this.typeLevel = true;
                            this.formData['typeName'] = formData.typeName;
                            obj = {
                                field: 'displayName',
                                component: 'FamI18nbasics',
                                label: _this.i18nMappingObj['displayName'],
                                labelLangKey: _this.i18nMappingObj['displayName'],
                                disabled: false,
                                required: true,
                                validators: [],
                                props: {
                                    clearable: true,
                                    placeholder: _this.i18nMappingObj['enter'],
                                    placeholderLangKey: _this.i18nMappingObj['enter'],
                                    i18nName: _this.i18nMappingObj['displayName']
                                },
                                col: 12
                            };
                            this.dynamicConfig.push(obj);
                            this.formData['displayName'] = {
                                attr: 'nameI18nJson',
                                attrName: formData.displayName,
                                value: formData.nameI18nJson || {}
                            };
                        } else {
                            let objs = [
                                {
                                    field: 'serviceInfoRef',
                                    component: 'custom-select',
                                    label: '服务',
                                    disabled: false,
                                    readonly: true,
                                    validators: [],
                                    props: {
                                        row: {
                                            componentName: 'virtual-select',
                                            requestConfig: {
                                                url: 'platform/service/list',
                                                viewProperty: 'displayName',
                                                valueProperty: 'oid'
                                            }
                                        }
                                    },
                                    col: 12
                                },
                                {
                                    field: 'tableName',
                                    component: 'erd-input',
                                    label: _this.i18n.tableName,
                                    // tooltip: _this.i18nMappingObj.tableNameTips, // 自定义表名功能暂时未实现, 先注释
                                    disabled: true, // 自定义表名功能暂时未实现, 先禁止编辑
                                    hidden: !formData.isSubType,
                                    readonly: this.openType !== 'create',
                                    validators: [
                                        {
                                            validator: function (rule, value, callback) {
                                                if (/[^a-zA-Z_]/gi.test(value)) {
                                                    callback(new Error(_this.i18nMappingObj['tableNameError']));
                                                } else {
                                                    callback();
                                                }
                                            },
                                            trigger: ['blur', 'change']
                                        }
                                    ],
                                    col: 12
                                }
                            ];
                            this.dynamicConfig = [...this.dynamicConfig, ...objs];
                            this.$set(this.formData, 'serviceInfoRef', formData.serviceInfoRef);
                            this.$set(this.formData, 'tableName', formData.tableName);
                            let personMap = resp.data.propertyMap || {};
                            // 存当前类型formData数据
                            Object.values(personMap).forEach((val) => {
                                let renderValue = val.propertyValue;
                                if (val.name === 'description' || val.name === 'displayName') {
                                    this.personFormData[val.name] = {
                                        attr: 'nameI18nJson',
                                        attrName: val.name,
                                        value: renderValue.languageJson || {}
                                    };
                                } else if (val.name === 'icon') {
                                    this.personFormData[val.name] =
                                        renderValue.value || 'erd-iconfont erd-icon-triangle-left';
                                } else {
                                    this.personFormData[val.name] = renderValue.i18nValue || renderValue.value || '';
                                }
                            });
                            if (this.openType === 'edit') {
                                this.typeLevel = false;
                                this.formData['name'] = formData.innerName;
                                this.formData['typeName'] = formData.typeName;
                                Object.values(propertyMap).forEach((val) => {
                                    let componentAttr = val.constraintDefinitionDto || {};
                                    let renderValue = val.propertyValue;
                                    // 组件配置
                                    let compName = componentAttr.componentName || '';
                                    let componentConf = this.fnComponentHandle(compName, true);
                                    let enumData = new FormData();
                                    enumData.append('realType', componentAttr?.dataKey);

                                    if (val.name === 'description' || val.name === 'displayName') {
                                        obj = {
                                            field: val.name,
                                            component: 'FamI18nbasics',
                                            label: val.displayName,
                                            labelLangKey: val.displayName,
                                            disabled: false,
                                            hidden: componentAttr.isHidden || false,
                                            readonly: componentAttr.isReadonly || false,
                                            required: componentAttr.isRequired || false,
                                            validators: [
                                                {
                                                    trigger: ['blur', 'change'],
                                                    validator: (rule, value, callback) => {
                                                        const currentLang = this.$store.state.i18n?.lang || 'zh_cn';
                                                        if (
                                                            !value ||
                                                            _.isEmpty(value) ||
                                                            _.isEmpty(value.value) ||
                                                            (_.isEmpty(value.value.value?.trim()) &&
                                                                _.isEmpty(value.value[currentLang]?.trim()))
                                                        ) {
                                                            callback(
                                                                new Error(
                                                                    `${this.i18nMappingObj['enter']} ${val.displayName}`
                                                                )
                                                            );
                                                        } else {
                                                            callback();
                                                        }
                                                    }
                                                }
                                            ],
                                            props: {
                                                clearable: true,
                                                placeholder: _this.i18nMappingObj['enter'],
                                                placeholderLangKey: _this.i18nMappingObj['enter'],
                                                type: val.name === 'description' ? 'textarea' : 'basics',
                                                i18nName: val.displayName
                                            },
                                            checkbox: val.name === 'description' ? val.isExtends : false,
                                            checkboxModel: renderValue.isExtends,
                                            checkboxListeners: {
                                                checkboxChange: (event) => {
                                                    _this.checkChange(event, val.name);
                                                }
                                            },
                                            col: val.name === 'description' ? 24 : 12
                                        };
                                        this.formData[val.name] = {
                                            attr: 'nameI18nJson',
                                            attrName: val.name,
                                            value: renderValue.languageJson || {}
                                        };
                                    } else if (val.name === 'icon') {
                                        obj = {
                                            field: 'icon',
                                            component: 'FamIconSelect',
                                            label: _this.i18nMappingObj['icon'],
                                            labelLangKey: _this.i18nMappingObj['icon'],
                                            type: 'icon',
                                            disabled: false,
                                            hidden: componentAttr.isHidden || false,
                                            readonly: componentAttr.isReadonly || false,
                                            required: componentAttr.isRequired || false,
                                            validators: [],
                                            props: {
                                                visibleBtn: !renderValue.isExtends,
                                                btnName: _this.i18nMappingObj['selectIcon']
                                            },
                                            checkbox: val.isExtends,
                                            checkboxModel: renderValue.isExtends,
                                            checkboxListeners: {
                                                checkboxChange: (event) => {
                                                    _this.checkChange(event, val.name);
                                                }
                                            },
                                            col: 12
                                        };
                                        this.formData[val.name] =
                                            renderValue.value || 'erd-iconfont erd-icon-triangle-left';
                                    } else {
                                        const config = this.getConfigTemp(
                                            componentAttr,
                                            enumData,
                                            componentConf.componentConfigs
                                        );

                                        // 如果是获取生命周期状态接口,则增加targetClass入参 过滤状态列表
                                        if (componentAttr?.dataKey?.includes('LifecycleState')) {
                                            config.data.targetClass = formData.modelClass;
                                        }

                                        // 生命周期模板, valueProperty修改为 vid
                                        if (val.name === 'lifecycleTemplateName') {
                                            config.valueProperty = 'key';
                                            config.data.appName = this.appName;
                                        }

                                        // 编码规则, 修改header
                                        if (val.name === 'codeDefCode') {
                                            config.data.appName = this.appName;
                                        }
                                        obj = {
                                            field: val.name,
                                            component: componentConf.showComponent,
                                            label: val.displayName,
                                            labelLangKey: val.displayName,
                                            disabled: false,
                                            hidden: componentAttr.isHidden || false,
                                            readonly: componentAttr.isReadonly || false,
                                            required: compName.includes('input')
                                                ? componentAttr.isRequired || false
                                                : false,
                                            validators: [],
                                            props: {
                                                clearable: true,
                                                placeholder: _this.i18nMappingObj['enter'],
                                                placeholderLangKey: _this.i18nMappingObj['enter'],
                                                row: {
                                                    componentName: ErdcKit.hyphenate(compName), // 接口查询（组件名带virtual，如果特殊组件名要处理的，到混入文件里面处理，比如custom-virtual-role-select是角色下拉框，有固定配置）
                                                    requestConfig: config,
                                                    clearNoData: true // value未匹配到option中数据时，清除数据项
                                                }
                                            },
                                            checkbox: val.isExtends,
                                            checkboxModel: renderValue.isExtends,
                                            checkboxListeners: {
                                                checkboxChange: (event) => {
                                                    _this.checkChange(event, val.name);
                                                }
                                            },
                                            col: 12
                                        };
                                        this.$set(
                                            this.formData,
                                            val.name,
                                            renderValue.i18nValue || renderValue.value || ''
                                        );
                                        // 特殊处理Boolean类型
                                        if (ErdcKit.isSameComponentName(compName, 'FamBoolean')) {
                                            // obj['slots'] = {
                                            //     component: 'radioComponent'
                                            // }
                                            obj['props'] = {
                                                type: 'basic',
                                                disabled: val.name + '_checked'
                                            };
                                            this.$set(this.formData, renderValue.value);
                                        }
                                        // 特殊处理图标
                                        if (ErdcKit.isSameComponentName(compName, 'FamIconSelect')) {
                                            obj['props'] = {
                                                visibleBtn: !renderValue.isExtends,
                                                btnName: _this.i18nMappingObj['selectIcon']
                                            };
                                            this.$set(
                                                this.formData,
                                                val.name,
                                                renderValue.value || 'erd-iconfont erd-icon-triangle-left'
                                            );
                                            // this.formData[val.name] = renderValue.value || "erd-iconfont erd-icon-triangle-left";
                                        }
                                        if (val.name === 'sort_order') {
                                            obj['validators'] = [
                                                {
                                                    trigger: ['blur', 'change'],
                                                    validator: function (rule, value, callback) {
                                                        if (isNaN(Number(value)) || !value.trim()) {
                                                            callback(new Error(_this.i18nMappingObj['enterNumber']));
                                                        } else if (!Number.isInteger(Number(value)) || value < 0) {
                                                            callback(new Error(_this.i18nMappingObj['integer']));
                                                        } else {
                                                            callback();
                                                        }
                                                    }
                                                }
                                            ];
                                            obj['props'].maxlength = componentAttr.maxLength || 20;
                                            obj['limits'] = /[^0-9]/gi;
                                        }
                                    }
                                    if (val.name === 'codeDefCode') {
                                        obj.slots = {
                                            component: 'codeDefCodeComponent'
                                        };
                                        if (obj.props?.row?.requestConfig?.data) {
                                            obj.props.row.requestConfig.data.typeId = this.oid.split(':')[2];
                                        }
                                        obj.props.filterable = true;
                                        this.isShowCodeDefCodeComponent = true;
                                    }
                                    // 是否勾选可继承
                                    if (val.name === 'displayName') {
                                        this.formData[val.name + '_checked'] = false;
                                    } else {
                                        // this.formData[val.name + '_checked'] = renderValue.isExtends;
                                        this.$set(this.formData, val.name + '_checked', renderValue.isExtends);
                                        if (renderValue.isExtends === true) {
                                            obj['disabled'] = renderValue.isExtends;
                                        }
                                    }
                                    if (val.name === 'classifyRef') {
                                        obj.props = this.getClassifyRefConfig(obj, compName);

                                        // 处理堆栈溢出问题
                                        this.$set(this.formData, val.name, renderValue.value || '');
                                    }
                                    if (val.name === 'teamTemplateName') {
                                        obj.props.appName = 'ALL';
                                    }

                                    // 如果是第一层级类型, 不显示继承复选框
                                    if (resp.data.parentId === '0') {
                                        obj.checkbox = false;
                                    }
                                    this.dynamicConfig.push(obj);
                                });
                            } else {
                                this.typeLevel = false;
                                Object.values(propertyMap).forEach((val) => {
                                    let componentAttr = val.constraintDefinitionDto || {};
                                    let renderValue = val.propertyValue;
                                    // 组件配置
                                    let compName = componentAttr.componentName;
                                    let componentConf = this.fnComponentHandle(compName, true);
                                    let enumData = new FormData();
                                    enumData.append('realType', componentAttr?.dataKey);
                                    if (val.name === 'description' || val.name === 'displayName') {
                                        obj = {
                                            field: val.name,
                                            component: 'FamI18nbasics',
                                            label: val.displayName,
                                            labelLangKey: val.displayName,
                                            disabled: false,
                                            hidden: componentAttr.isHidden || false,
                                            readonly: componentAttr.isReadonly || false,
                                            required: componentAttr.isRequired || false,
                                            validators: [
                                                {
                                                    trigger: ['blur', 'change'],
                                                    validator: (rule, value, callback) => {
                                                        const currentLang = this.$store.state.i18n?.lang || 'zh_cn';
                                                        if (
                                                            !value ||
                                                            _.isEmpty(value) ||
                                                            _.isEmpty(value.value) ||
                                                            (_.isEmpty(value.value.value?.trim()) &&
                                                                _.isEmpty(value.value[currentLang]?.trim()))
                                                        ) {
                                                            callback(
                                                                new Error(
                                                                    `${this.i18nMappingObj['enter']} ${val.displayName}`
                                                                )
                                                            );
                                                        } else {
                                                            callback();
                                                        }
                                                    }
                                                }
                                            ],
                                            props: {
                                                clearable: true,
                                                placeholder: _this.i18nMappingObj['enter'],
                                                placeholderLangKey: _this.i18nMappingObj['enter'],
                                                type: val.name === 'description' ? 'textarea' : 'basics',
                                                i18nName: val.displayName
                                            },
                                            checkbox: val.name === 'description' ? val.isExtends : false,
                                            checkboxModel: renderValue.isExtends,
                                            checkboxListeners: {
                                                checkboxChange: (event) => {
                                                    _this.checkChange(event, val.name);
                                                    // obj['checkboxModel'] = !obj['checkboxModel'];
                                                }
                                            },
                                            col: val.name === 'description' ? 24 : 12
                                        };
                                        this.formData[val.name] = {
                                            attr: 'nameI18nJson',
                                            attrName: val.name,
                                            value: val.name === 'description' ? renderValue.languageJson : {}
                                        };
                                    } else if (val.name === 'icon') {
                                        obj = {
                                            field: 'icon',
                                            component: 'FamIconSelect',
                                            type: 'icon',
                                            label: _this.i18nMappingObj['icon'],
                                            labelLangKey: _this.i18nMappingObj['icon'],
                                            disabled: false,
                                            hidden: componentAttr.isHidden || false,
                                            required: componentAttr.isRequired || false,
                                            validators: [],
                                            props: {
                                                visibleBtn: !val.isExtends,
                                                btnName: _this.i18nMappingObj['selectIcon']
                                            },
                                            checkbox: val.isExtends,
                                            checkboxModel: renderValue.isExtends,
                                            checkboxListeners: {
                                                checkboxChange: (event) => {
                                                    _this.checkChange(event, val.name);
                                                }
                                            },
                                            col: 12
                                        };
                                        this.formData[val.name] = renderValue.i18nValue || renderValue.value || '';
                                    } else {
                                        // 判断如果下拉框请求配置为空，则赋值默认的请求参数
                                        const config = this.getConfigTemp(
                                            componentAttr,
                                            enumData,
                                            componentConf.componentConfigs
                                        );

                                        // 生命周期模板, valueProperty修改为 vid
                                        if (val.name === 'lifecycleTemplateName') {
                                            config.valueProperty = 'key';
                                            config.data.appName = this.appName;
                                        }

                                        // 编码规则, 修改header
                                        if (val.name === 'codeDefCode') {
                                            config.data.appName = this.appName;
                                            config.data.typeId = this.oid.split(':')[2];
                                        }
                                        obj = {
                                            field: val.name,
                                            component: componentConf.showComponent,
                                            label: val.displayName,
                                            labelLangKey: val.displayName,
                                            disabled: true, // 创建时默认为继承
                                            hidden: componentAttr.isHidden || false,
                                            required: componentAttr.isRequired || false,
                                            validators: [],
                                            props: {
                                                clearable: true,
                                                placeholder: _this.i18nMappingObj['enter'],
                                                placeholderLangKey: _this.i18nMappingObj['enter'],
                                                row: {
                                                    componentName: ErdcKit.hyphenate(compName), // 接口查询（组件名带virtual，如果特殊组件名要处理的，到混入文件里面处理，比如custom-virtual-role-select是角色下拉框，有固定配置）
                                                    requestConfig: config,
                                                    clearNoData: true // value未匹配到option中数据时，清除数据项
                                                }
                                            },
                                            checkbox: true, // 创建默认继承，需要显示勾选框
                                            checkboxModel: true, // 创建默认继承，需要显示勾选框，需要勾选上
                                            checkboxListeners: {
                                                checkboxChange: (event) => {
                                                    _this.checkChange(event, val.name);
                                                }
                                            },
                                            col: 12
                                        };
                                        this.$set(
                                            this.formData,
                                            val.name,
                                            renderValue.i18nValue || renderValue.value || ''
                                        );

                                        // 特殊处理Boolean类型
                                        if (ErdcKit.isSameComponentName(compName, 'FamBoolean')) {
                                            // obj['slots'] = {
                                            //     component: 'radioComponent'
                                            // }
                                            obj['props'] = {
                                                type: 'basic',
                                                disabled: val.name + '_checked'
                                            };
                                            this.$set(this.formData, val.name, renderValue.value ?? false);
                                        }
                                        // 特殊处理图标
                                        if (ErdcKit.isSameComponentName(compName, 'FamIconSelect')) {
                                            obj['props'] = {
                                                visibleBtn: !renderValue.isExtends,
                                                btnName: _this.i18nMappingObj['selectIcon']
                                            };
                                            // this.formData[val.name] = renderValue.value || "erd-iconfont erd-icon-triangle-left";
                                            this.$set(
                                                this.formData,
                                                val.name,
                                                renderValue.value || 'erd-iconfont erd-icon-triangle-left'
                                            );
                                        }
                                        if (val.name === 'sort_order') {
                                            obj['validators'] = [
                                                {
                                                    trigger: ['blur', 'change'],
                                                    validator: function (rule, value, callback) {
                                                        if (isNaN(Number(value)) || !value.trim()) {
                                                            callback(new Error(_this.i18nMappingObj['enterNumber']));
                                                        } else if (!Number.isInteger(Number(value)) || value < 0) {
                                                            callback(new Error(_this.i18nMappingObj['integer']));
                                                        } else {
                                                            callback();
                                                        }
                                                    }
                                                }
                                            ];
                                            obj['props'].maxlength = componentAttr.maxLength || 20;
                                            obj['limits'] = /[^0-9]/gi;
                                        }
                                        if (val.name === 'classifyRef') {
                                            obj.props = this.getClassifyRefConfig(obj, compName);

                                            // 处理堆栈溢出问题
                                            this.$set(this.formData, val.name, renderValue.value || '');
                                        }
                                    }
                                    // 是否勾选可继承
                                    if (val.name === 'displayName') {
                                        this.formData[val.name + '_checked'] = false;
                                    } else {
                                        this.$set(this.formData, val.name + '_checked', true);
                                        // this.formData[val.name + '_checked'] = true;
                                        if (renderValue.isExtends === true) {
                                            obj['disabled'] = renderValue.isExtends;
                                        }
                                    }
                                    if (['classifyRef', 'codeDefCode'].includes(val.name)) {
                                        obj.props.filterable = true;
                                        if (val.name === 'classifyRef') {
                                            obj.props.row.requestConfig.transformResponse = [
                                                (data) => {
                                                    const jsonData = JSON.parse(data);
                                                    const recursiveFn = (i = []) => {
                                                        i.forEach((item) => {
                                                            const isApplication =
                                                                item.idKey ===
                                                                'erd.cloud.foundation.tenant.entity.Application';
                                                            item.disabled = isApplication || !item.instantiable;
                                                            if (item.children?.length) {
                                                                recursiveFn(item.children);
                                                            }
                                                        });
                                                    };

                                                    // 树组件下拉框 置灰逻辑
                                                    recursiveFn(jsonData.data);
                                                    return jsonData;
                                                }
                                            ];
                                        }
                                    }
                                    this.dynamicConfig.push(obj);
                                });
                            }
                        }
                    }
                });
            },
            getConfigTemp(attr, enumData, originConfig) {
                let baseConfig = {};
                let baseMap = {
                    viewProperty: 'value',
                    valueProperty: 'name'
                };
                const isEmptyConfig = _.isEmpty(originConfig);
                if (isEmptyConfig) {
                    baseConfig = {
                        url: '/fam/listByKey',
                        data: {
                            className: attr.dataKey
                        },
                        viewProperty: 'displayName',
                        valueProperty: 'oid'
                    };
                } else {
                    baseConfig = {
                        ...originConfig,
                        data: enumData,
                        ...baseMap
                    };
                }
                return baseConfig;
            },

            // 获取分类的配置项
            getClassifyRefConfig(obj, compName) {
                return {
                    ...obj.props,
                    filterable: true,
                    treeSelect: true,
                    treeProps: {
                        label: 'displayName',
                        children: 'children',
                        value: 'oid'
                    },
                    row: {
                        componentName: ErdcKit.hyphenate(compName),
                        requestConfig: {
                            url: '/fam/classify/tree',
                            transformResponse: [
                                (data) => {
                                    const jsonData = JSON.parse(data);
                                    const recursiveFn = (i = []) => {
                                        i.forEach((item) => {
                                            const isApplication =
                                                item.idKey === 'erd.cloud.foundation.tenant.entity.Application';
                                            item.disabled = isApplication || !item.instantiable;
                                            if (item.children?.length) {
                                                recursiveFn(item.children);
                                            }
                                        });
                                    };
                                    recursiveFn(jsonData.data);
                                    return jsonData;
                                }
                            ]
                        }
                    }
                };
            },
            checkChange(isChecked, name) {
                _.each(this.formConfig, (item) => {
                    let fieldTerms = item.field !== 'displayName' && item.field !== 'typeName';
                    let nameTerms =
                        item.field === name && (item.component === 'bool' || item.component === 'FamBoolean');
                    if (this.openType === 'create') {
                        if (item.field === name && fieldTerms) {
                            if (isChecked === true) {
                                this.formData[name] = this.personFormData[name];
                                item.disabled = true;
                            } else {
                                item.disabled = false;
                            }
                            if (nameTerms) {
                                this.$set(this.formData, name, JSON.parse(this.personFormData[item.field] || 'false'));
                            }
                        }
                    } else {
                        // || this.formData[name] == this.parentFormData[name]
                        // 编辑时继承父类
                        if (item.field === name && fieldTerms) {
                            if (isChecked === true) {
                                this.formData[name] = this.parentFormData[name];
                                item.disabled = true;
                            } else {
                                item.disabled = false;
                            }
                            if (nameTerms) {
                                this.$set(this.formData, name, JSON.parse(this.parentFormData[item.field] || 'false'));
                            }
                        }
                    }
                    // 继承时隐藏选择图标
                    if (item.field === name && item.field.includes('icon')) {
                        item.props.visibleBtn = !isChecked;
                    }
                });
            },
            saveSubmit() {
                this.submit();
            },
            onCancel() {
                this.toggleShow();
                // return;
                // if (this.openType === 'create') {
                //     tips = this.i18nMappingObj['discardTypeCreate'];
                //     title = this.i18nMappingObj['discardCreate'];
                // } else {
                //     title = this.i18nMappingObj['discardEdit'];
                //     tips = this.TypeData.number
                //         ? this.i18nMappingObj['discardServerEdit']
                //         : this.i18nMappingObj['discardTypeEdit'];
                // }
                // if (this.isChanged) {
                //     this.$confirm(tips, title, {
                //         confirmButtonText: this.i18nMappingObj['confirm'],
                //         cancelButtonText: this.i18nMappingObj['cancel'],
                //         type: 'warning'
                //     })
                //         .then(() => {
                //             this.toggleShow();
                //         })
                //         .catch(() => {});
                // } else {
                //     this.toggleShow();
                // }
            },
            submitEditForm() {
                let result = this.$refs.editForm.formData;
                let url = '';
                let obj = {};
                const { editForm } = this.$refs;
                this.loading = true;
                return new Promise((resolve, reject) => {
                    editForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                if (this.openType === 'edit') {
                                    url = '/fam/type/typeDefinition/update';
                                    if (this.typeLevel) {
                                        url = '/platform/service';
                                        // 一级服务更新
                                        obj = {
                                            nameI18nJson: result.displayName.value,
                                            id: this.typeOid.split(':')[2]
                                        };
                                    } else {
                                        const attrKey = Object.keys(this.formData);
                                        let propertyMap = this.TypeData.propertyMap || {};
                                        let property = {};
                                        let typePropertyValueVoList = [];
                                        utils.trimI18nJson(this.formData.displayName.value);
                                        Object.values(propertyMap).forEach((item) => {
                                            let propertyValue = item.propertyValue;
                                            let nameData = this.formData[item.name];
                                            if (attrKey.includes(item.name)) {
                                                property = {
                                                    name: item.name,
                                                    value:
                                                        nameData instanceof Object
                                                            ? nameData.value
                                                                ? nameData.value.value
                                                                : undefined
                                                            : nameData,
                                                    typePropertyDef: propertyValue.propertyRef,
                                                    languageJson:
                                                        nameData instanceof Object ? nameData.value : undefined,
                                                    isExtends: result[item.name + '_checked']
                                                };
                                            }
                                            typePropertyValueVoList.push(property);
                                        });
                                        // 类型编辑
                                        obj = {
                                            oid: this.TypeData.oid,
                                            parentId: this.TypeData.parentId,
                                            typeName: this.TypeData.typeName,
                                            typePropertyValueVoList: typePropertyValueVoList
                                        };
                                    }
                                } else {
                                    const attrKey = Object.keys(this.formData);
                                    let propertyMap = this.TypeData.propertyMap || {};
                                    let formData = result;
                                    let property = {};
                                    let typePropertyValueVoList = [];
                                    utils.trimI18nJson(formData?.displayName?.value);
                                    Object.values(propertyMap).forEach((item) => {
                                        let propertyValue = item.propertyValue;

                                        let nameData = formData[item.name];
                                        if (attrKey.includes(item.name)) {
                                            property = {
                                                name: item.name,
                                                typePropertyDef: propertyValue.propertyRef,
                                                value:
                                                    nameData instanceof Object
                                                        ? nameData.value
                                                            ? nameData.value.value
                                                            : undefined
                                                        : nameData,
                                                languageJson: nameData instanceof Object ? nameData.value : undefined,
                                                isExtends: formData[item.name + '_checked']
                                            };
                                        }
                                        typePropertyValueVoList.push(property);
                                    });

                                    // 新增子类型
                                    obj = {
                                        parentId: this.TypeData.oid,
                                        typeName: formData['typeName'],
                                        tableName: formData['tableName'],
                                        typePropertyValueVoList: typePropertyValueVoList
                                    };

                                    url = '/fam/type/typeDefinition/add';
                                }
                                this.$famHttp({
                                    url,
                                    data: obj,
                                    method: this.typeLevel ? 'put' : 'post',
                                    headers: {
                                        'App-Name': this.TypeData.appName
                                    }
                                })
                                    .then((res) => {
                                        resolve(res);

                                        if (res.code === '200') {
                                            this.innerVisible = false;
                                            this.$message({
                                                message:
                                                    this.openType === 'edit'
                                                        ? this.i18nMappingObj['update']
                                                        : this.i18nMappingObj['create'],
                                                type: 'success',
                                                showClose: true
                                            });
                                            this.$emit('onsubmit', this.typeOid);
                                        }
                                    })
                                    .finally(() => {
                                        this.loading = false;
                                    });
                            } else {
                                this.loading = false;
                                reject();
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                });
            },
            toggleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            formChange(changed) {
                this.disabled = !changed;
                this.isChanged = changed;
            },
            createCodeRule() {
                this.visible2 = true;
            },
            codeRuleSubmit() {
                const { codeRuleForm } = this.$refs;
                codeRuleForm.submit().then((attrRawList) => {
                    let data = {
                        className: this.$store.getters.className('codeRule'),
                        typeReference: 'OR:erd.cloud.foundation.type.entity.TypeDefinition:1562274619145490434',
                        attrRawList
                    };
                    this.$famHttp({
                        url: '/fam/create',
                        data,
                        method: 'POST'
                    }).then((resp) => {
                        this.formData.codeDefCode = resp?.data || '';
                        this.isShowCodeDefCodeComponent = false;
                        this.$nextTick(() => {
                            this.isShowCodeDefCodeComponent = true;
                        });
                        this.$message({
                            type: 'success',
                            message: '创建编码规则成功',
                            showClose: true
                        });
                        this.visible2 = false;
                    });
                });
            }
        }
    };
});
