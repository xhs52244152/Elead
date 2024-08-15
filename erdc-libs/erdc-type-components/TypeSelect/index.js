define([
    'text!' + ELMP.resource('erdc-type-components/TypeSelect/template.html'),
    'css!' + ELMP.resource('erdc-type-components/TypeSelect/style.css')
], function (template) {
    const axios = require('erdcloud.http');
    const TreeUtil = require('erdc-kit').TreeUtil;

    const api = {
        fetchApplicationList() {
            return axios({
                url: '/platform/application/list'
            });
        },
        fetchTypeTree(applicationOid) {
            return axios({
                url: '/fam/type/typeDefinition/getTypeTree',
                className: 'erd.cloud.foundation.type.entity.TypeDefinition',
                params: {
                    applicationOid
                }
            });
        }
    };

    return {
        setup(props, { emit }) {
            const { ref, computed, onBeforeMount, nextTick } = require('vue');

            const appList = ref([]);
            const typeTree = ref([]);

            const value = computed({
                get() {
                    return props.value;
                },
                set(_value) {
                    emit('input', _value);
                }
            });
            const typeValue = computed({
                get() {
                    let _value = Array.isArray(value.value?.typeValue)
                        ? value.value?.typeValue.map((item) => item.typeOid)
                        : value.value?.typeValue?.typeOid;
                    if (!props.multiple && Array.isArray(value.value?.typeValue)) {
                        _value = value.value?.typeValue[0]?.typeOid || null;
                    }
                    return _value;
                },
                set(_value) {
                    emit('input', {
                        ...value.value,
                        typeValue: getTypeInfo(_value)
                    });
                }
            });
            const appValue = computed({
                get() {
                    return value.value?.appValue?.[props.appValueKey] || null;
                },
                set(_value) {
                    emit('input', {
                        ...value.value,
                        appValue: getAppInfo(_value)
                    });
                }
            });

            const typeArray = computed(() =>
                TreeUtil.flattenTree2Array(typeTree.value, {
                    childrenField: 'childList'
                })
            );

            onBeforeMount(() => {
                api.fetchApplicationList().then(({ data }) => {
                    appList.value = data || [];
                    const appOid = appValue.value || appList.value[0]?.[props.appValueKey] || null;
                    const appInfo = getAppInfo(appOid);
                    const platApplication = appList.value.find((item) => item.identifierNo === 'plat') || null;

                    if (appInfo?.oid) {
                        handleApplicationChange(appInfo?.oid, typeValue.value).then(() => {
                            if (props.includePlat && platApplication && appOid !== platApplication[props.appValueKey]) {
                                handleApplicationChange(platApplication.oid, typeValue.value);
                            }
                        });
                    }
                });
            });

            const handleApplicationChange = (appOid, _typeValue = null) => {
                const appInfo = getAppInfo(appOid);
                return api.fetchTypeTree(appOid).then(({ data }) => {
                    appInfo.childList = data;
                    typeTree.value = [...typeTree.value.filter((item) => item.oid !== appOid), appInfo].map((item) => ({
                        ...item,
                        disabled: true
                    }));
                    nextTick(() => {
                        typeValue.value = _typeValue;
                    });
                });
            };

            const handleTypeChange = (_typeValue) => {
                typeValue.value = Array.from(new Set(_typeValue)) || [];
                emit('change', value.value);
            };

            const getTypeInfo = (typeOid) => {
                if (Array.isArray(typeOid)) {
                    return typeOid.map((oid) => typeArray.value.find((item) => item.typeOid === oid));
                }
                return typeOid ? typeArray.value.find((item) => item.typeOid === typeOid) : null;
            };

            const getAppInfo = (appOid) => {
                return appList.value.find((item) => item[props.appValueKey] === appOid || item.oid === appOid) || null;
            };

            return {
                appList,
                appValue,
                typeValue,
                typeTree,
                handleApplicationChange,
                handleTypeChange
            };
        },
        props: {
            value: {
                type: Object,
                default() {
                    return null;
                }
            },
            placeholder: String,
            clearable: {
                type: Boolean,
                default: true
            },
            disabled: Boolean,
            filterable: {
                type: Boolean,
                default: true
            },
            multiple: {
                type: Boolean,
                default: true
            },
            collapseTags: {
                type: Boolean,
                default: true
            },
            checkRelation: {
                type: String,
                validate(value) {
                    return !['irrelevance', 'semiRelevance', 'relevance'].includes(value);
                },
                default: 'irrelevance'
            },
            showApplicationSelect: {
                type: Boolean,
                default: true
            },
            defaultExpandAll: Boolean,
            appValueKey: {
                type: String,
                default: 'oid'
            },
            includePlat: {
                type: Boolean,
                default: true
            }
        },
        template
    };
});
