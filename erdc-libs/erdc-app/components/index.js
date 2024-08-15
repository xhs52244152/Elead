define([
    'erdcloud.i18n',
    'fam:ccc',
    ELMP.resource('erdc-components/FamFormDesigner/widgets/index.js'),
    'erdcloud.store',
    'fam:kit',
    'underscore'
], function ({ translate, currentLanguage }, CCC, { basicWidgets, highOrderWidgets }) {
    const _ = require('underscore');
    const FamKit = require('fam:kit');

    /**
     * Fam出厂自带组件
     * @type Array<import('../ccc/index').Component>
     */
    const FAM_STATIC_COMPONENTS = [
        {
            definition: {
                resourceUrl: ELMP.resource(`erdc-components/FamDynamicForm/accessory/FamDynamicFormSlot/index.js`),
                name: 'FamDynamicFormSlot',
                sync: false
            }
        },
        {
            definition: {
                resourceUrl: ELMP.resource(
                    `erdc-components/FamDynamicForm/accessory/FamDynamicFormPlaceholder/index.js`
                ),
                name: 'FamDynamicFormPlaceholder',
                sync: false
            }
        },
        'FamDynamicForm',
        {
            definition: 'FamOrganizationSelect',
            readonly: 'FamOrganizationStaticText'
        },
        {
            definition: 'FamMemberSelect',
            readonly: 'FamMemberSelectStaticText',
            requiredValidator: {
                type: 'FamMemberSelectRequiredValidator',
                required: true,
                trigger: ['blur', 'change'],
                validator(rule, value, callback) {
                    const { _formConfig, _utils } = rule;
                    if (!value || _.isEmpty(value)) {
                        callback(new Error(`${translate('pleaseSelect')}${_utils.translateFormLabel(_formConfig)}`));
                    } else {
                        callback();
                    }
                }
            },
            properties: [
                {
                    name: 'FamMemberSelect/searchScop',
                    col: 12
                },
                {
                    name: 'multiple',
                    col: 12
                }
            ]
        },
        {
            definition: 'FamI18nbasics',
            readonly: 'FamI18nStaticText',
            requiredValidator: {
                type: 'FamI18nbasicsRequired',
                required: true,
                trigger: ['blur', 'change'],
                validator(rule, value, callback) {
                    const { _formConfig, _utils } = rule;
                    const { trimValidator } = _formConfig.props || false;
                    const currentLang = currentLanguage();
                    if (
                        !value ||
                        _.isEmpty(value) ||
                        _.isEmpty(value.value) ||
                        (trimValidator
                            ? _.isEmpty(value.value.value.trim()) && _.isEmpty(value.value[currentLang].trim())
                            : _.isEmpty(value.value.value) && _.isEmpty(value.value[currentLang]))
                    ) {
                        callback(new Error(`${translate('pleaseEnterTips')}${_utils.translateFormLabel(_formConfig)}`));
                    } else {
                        callback();
                    }
                }
            }
        },
        {
            definition: {
                registerDirectory: 'FamAdvancedTable/FamFieldComponents/CustomSelect',
                name: 'CustomSelect'
            },
            readonly: 'FamCustomSelectStaticText',
            properties: [
                {
                    name: 'custom-select/options',
                    col: 24
                }
            ]
        },
        {
            definition: {
                registerDirectory: 'FamAdvancedTable/FamFieldComponents/CustomSelect',
                name: 'CustomVirtualEnumSelect'
            },
            readonly: 'FamCustomSelectStaticText'
        },
        {
            definition: {
                registerDirectory: 'FamAdvancedTable/FamFieldComponents/CustomSelect',
                name: 'CustomVirtualSelect'
            },
            readonly: 'FamCustomSelectStaticText',
            properties: [
                {
                    name: 'custom-select/url',
                    col: 12
                },
                {
                    name: 'custom-select/method',
                    col: 12
                },
                {
                    name: 'custom-select/valueProperty',
                    col: 12
                },
                {
                    name: 'custom-select/viewProperty',
                    col: 12
                },
                {
                    name: 'props.treeSelect',
                    col: 12
                },
                {
                    name: 'props.treeProps.children',
                    col: 12
                },
                {
                    name: 'custom-select/data',
                    col: 24
                }
            ]
        },
        {
            definition: {
                registerDirectory: 'FamAdvancedTable/FamFieldComponents/CustomDateTime',
                name: 'CustomDateTime'
            },
            readonly: 'FamCustomDateTimeStaticText'
        },
        {
            definition: {
                registerDirectory: 'ErdDatePicker',
                name: 'ErdDatePicker'
            },
            readonly: 'FamCustomDateTimeStaticText'
        },
        {
            definition: 'FamIconSelect',
            readonly: 'FamIconSelect'
        },
        {
            definition: 'FamBoolean',
            translation({ value }) {
                let list = [
                    {
                        label: '是',
                        value: true
                    },
                    {
                        label: '否',
                        value: false
                    }
                ];
                let arr = list.filter((item) => item.value === value);
                arr.length && (value = arr[0].label);
                return value;
            },
            readonly: 'FamBoolean'
        },
        {
            definition: 'FamRadio',
            readonly: 'FamOptionsStaticText',
            properties: [
                {
                    name: 'radioOrCheckbox/button',
                    col: 12
                },
                {
                    name: 'radioOrCheckbox/border',
                    col: 12
                },
                {
                    name: 'radioOrCheckbox/options',
                    col: 24
                }
            ]
        },
        {
            definition: 'FamCheckbox',
            readonly: 'FamOptionsStaticText',
            properties: [
                {
                    name: 'radioOrCheckbox/button',
                    col: 12
                },
                {
                    name: 'radioOrCheckbox/border',
                    col: 12
                },
                {
                    name: 'radioOrCheckbox/options',
                    col: 24
                }
            ]
        },
        'FamAutographUpload',
        {
            definition: 'FamDict',
            readonly: 'FamDict'
        },
        {
            definition: {
                registerDirectory: 'FamDynamicForm/readonly-components/FamBooleanStaticText',
                name: 'FamBooleanStaticText'
            }
        },
        {
            definition: 'FamControlLabel',
            readonly: 'FamControlLabelStaticText'
        },
        {
            definition: 'FamQuillEditor',
            readonly: 'FamQuillEditor'
        },
        {
            definition: {
                registerDirectory: 'FamAdvancedTable/FamAdvancedConditions',
                name: 'FamAdvancedConditions'
            }
        },
        {
            definition: {
                registerDirectory: 'FamAdvancedGroup',
                name: 'FamAdvancedGroup'
            }
        },
        {
            definition: 'FamUpload',
            readonly: 'FamUpload'
        },
        'FamDictItemSelect',
        'FamCodeGenerator',
        {
            definition: {
                registerDirectory: 'FamFormDesigner/containers/FamClassificationTitle',
                name: 'FamClassificationTitle'
            }
        },
        {
            definition: 'FamViewTable',
            readonly: 'FamViewTable'
        },
        {
            definition: 'FamUnitNumber',
            readonly: 'FamUnitNumber',
            properties: [
                {
                    name: 'FamUnitNumber/isPrepend',
                    col: 12
                }
            ]
        },
        {
            definition: 'FamImage',
            readonly: 'FamImage',
            properties: [
                {
                    name: 'FamImage/accept',
                    col: 12
                },
                {
                    name: 'FamImage/limit',
                    col: 12
                },
                {
                    name: 'FamImage/limitSize',
                    col: 12
                },
                {
                    name: 'FamImage/preview',
                    col: 12
                },
                {
                    name: 'FamImage/tips',
                    col: 12
                },
                {
                    name: 'FamImage/thumbnail',
                    col: 12
                }
            ]
        },
        {
            definition: 'FamParticipantSelect',
            readonly: 'FamParticipantSelectText',
            requiredValidator: {
                type: 'FamParticipantSelectRequiredValidator',
                required: true,
                trigger: ['blur', 'change'],
                validator(rule, value, callback) {
                    const { _formConfig, _utils } = rule;
                    if (!value || _.isEmpty(value) || (value.type && _.isEmpty(value.value))) {
                        callback(new Error(`${translate('pleaseSelect')}${_utils.translateFormLabel(_formConfig)}`));
                    } else {
                        callback();
                    }
                }
            },
            properties: [
                {
                    name: 'FamParticipantSelect/type',
                    col: 12
                },
                {
                    name: 'FamParticipantSelect/queryScope',
                    col: 12
                },
                {
                    name: 'FamParticipantSelect/queryMode',
                    col: 12
                },
                {
                    name: 'FamParticipantSelect/defaultMode',
                    col: 12
                },
                {
                    name: 'FamParticipantSelect/teamOrignType',
                    col: 12,
                    isHidden({ widget }) {
                        return !(
                            (widget.props?.type === 'USER' || widget.props?.type === 'ROLE') &&
                            (widget.props?.queryScope === 'team' || widget.props?.queryScope === 'teamRole')
                        );
                    }
                },
                {
                    name: 'FamParticipantSelect/multiple',
                    col: 12
                }
            ]
        },
        {
            definition: 'FamLink',
            readonly: 'FamLink'
        }
    ];

    /**
     * 生成一个规范化的组件
     * @returns {function(string|Component): {Component}}
     */
    function generateComponent(fileName = '/index.js') {
        return (component) => {
            let result = {};
            if (_.isString(component)) {
                result = {
                    definition: {
                        resourceUrl: ELMP.resource(`erdc-components/${component}/index.js`),
                        name: component,
                        sync: false
                    }
                };
            } else {
                const resourceName = component?.definition?.resourceName || 'erdc-components';
                result = {
                    ...component,
                    definition: _.isString(component.definition)
                        ? {
                              resourceUrl: ELMP.resource(`erdc-components/${component.definition}/index.js`),
                              name: component.definition,
                              sync: false
                          }
                        : {
                              // 如果传了目录路径，取目录路径，否则取组件名作为目录，解决深层次目录组件注册只取组件时候没有注册成功问题
                              resourceUrl: ELMP.resource(
                                  `${resourceName}/${
                                      component?.definition?.registerDirectory || component?.definition?.name
                                  }${fileName}`.replace(/\/\//g, '/')
                              ),
                              sync: false,
                              name: FamKit.pascalize(component?.definition?.name),
                              ...component.definition
                          },
                    readonly: _.isString(component.readonly)
                        ? {
                              resourceUrl: ELMP.resource(
                                  `erdc-components/FamDynamicForm/readonly-components/${component.readonly}/index.js`
                              ),
                              name: component.readonly,
                              sync: false
                          }
                        : component.readonly
                };
            }
            if (result.properties && result.properties.length) {
                result.properties = _.map(result.properties, (property) => {
                    return {
                        ...property,
                        name: `fam-form-widget-${property.name.replace(/\//g, '-')}`
                    };
                });
            }
            return result;
        };
    }

    function registerBasicComponents(callback) {
        // 注册表单布局中配置的组件
        CCC.registerWidgets(basicWidgets);
        CCC.registerWidgets(highOrderWidgets);

        CCC.registerComponent(_.map(FAM_STATIC_COMPONENTS, generateComponent('/index.js'))).then(() => {
            callback && callback();
        });
    }

    return function useComponents(callback) {
        registerBasicComponents(callback);
    };
});
