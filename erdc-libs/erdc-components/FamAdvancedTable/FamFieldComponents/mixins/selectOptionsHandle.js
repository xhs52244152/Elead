define([], function () {
    const axios = require('fam:http');
    const FamKit = require('fam:kit');
    return {
        props: {
            appName: String
        },
        data() {
            return {
                optionList: [],
                sourceOptions: [],
                loading: {},
                specialComponents: [
                    'virtual-role-select',
                    'virtual-group-select',
                    'virtual-enum-select',
                    'virtual-context-select',
                    'custom-virtual-select',
                    'custom-virtual-tree-select'
                ] // 特殊处理组件
            };
        },
        watch: {
            row: {
                immediate: true,
                deep: true,
                handler(row, oldRow) {
                    // constant-select constant-cascader（固定值）
                    // virtual-select virtual-cascader （接口请求）
                    if (row) {
                        let componentName = FamKit.hyphenate(row?.componentName || '');
                        if (
                            !componentName ||
                            componentName?.includes('constant') ||
                            FamKit.isSameComponentName(componentName, 'custom-select')
                        ) {
                            // 普通下拉
                            this.optionList = _.map(row?.referenceList, (item) => {
                                return {
                                    ...item,
                                    [this.labelKey]: FamKit.translateI18n(FamKit.translateI18n(item[this.labelKey]))
                                };
                            });
                            this.sourceOptions = this.optionList.map((item) => item);
                        } else if (componentName?.includes('virtual') || !_.isEmpty(row?.requestConfig)) {
                            componentName = componentName || 'custom-virtual-select';
                            let request = row?.requestConfig || {};
                            let oldRequest = oldRow?.requestConfig || {};

                            // 隐藏的下拉选择框, 不调接口
                            if (request.isHidden) return;

                            // 特殊组件处理，如果特殊组件未在外面传参进来，则自动去store取默认参数
                            if (this.specialComponents.find((comp) => componentName?.includes(comp))) {
                                let defaultConfig = this.fnComponentHandle(componentName, true)?.componentConfigs || {};
                                request = { ...defaultConfig, ...request };
                                if (!(request.data instanceof FormData)) {
                                    request = {
                                        ...request,
                                        data: {
                                            ...defaultConfig.data,
                                            ...request.data
                                        }
                                    };
                                }
                            }

                            if (!request) return;
                            if (this.loading[request.url] === undefined) {
                                this.loading[request.url] = false;
                            }
                            // 接口pendding状态, 不重复调接口
                            if (this.loading[request.url] || this.$attrs.preventLoading) return;

                            const newApiEntry = { ...request.data, ...request.params };
                            const oldApiEntry = { ...oldRequest.data, ...oldRequest.params };
                            // 如果是选择值引起的change 且入参不变 则不再执行接口
                            if (this.isSelected && _.isEqual(newApiEntry, oldApiEntry)) return;
                            this.fnGetOptions(request)
                                .then((resp) => {
                                    if (this.valueKey === 'nameI18nJsonDefine') {
                                        let resData = resp?.data?.records || [];
                                        let newArr = [];
                                        for (let i = 0; i < resData.length; i++) {
                                            let o = {};
                                            for (let t = 0; t < resData[i].attrRawList.length; t++) {
                                                if (resData[i].attrRawList[t].attrName === 'nameI18nJson') {
                                                    o[this.labelKey] = resData[i].attrRawList[t].displayName;
                                                }
                                                if (resData[i].attrRawList[t].attrName === 'number') {
                                                    o[this.valueKey] = resData[i].oid;
                                                    o.number = resData[i].attrRawList[t].value;
                                                }
                                            }
                                            if (o && o.value) newArr.push(o);
                                        }
                                        this.optionList = newArr;
                                        this.sourceOptions = newArr;
                                    } else {
                                        if (!Array.isArray(resp?.data) && resp?.data?.records) {
                                            let result = resp.data.records;
                                            result = result.map((item) => {
                                                return {
                                                    ...item,
                                                    ...FamKit.deserializeArray(
                                                        (item.attrRawList || [])?.filter(Boolean),
                                                        {
                                                            valueKey: 'displayName',
                                                            isI18n: true
                                                        }
                                                    )
                                                };
                                            });
                                            this.optionList = result.map((item) => item);
                                        } else {
                                            this.optionList = (resp?.data || []).map((item) => item);
                                        }
                                        this.sourceOptions = this.optionList.map((item) => item);
                                    }
                                    this.$emit('data-loaded', resp, this.optionList);
                                })
                                .catch((error) => {
                                    console.error(error);
                                })
                                .finally(() => {
                                    this.loading[request.url] = false;
                                });
                        }
                    }
                }
            }
        },
        computed: {
            labelKey() {
                if (this.viewProperty) {
                    return this.viewProperty;
                }

                let componentName = FamKit.hyphenate(this.row?.componentName || '');

                if (componentName.includes('virtual')) {
                    componentName = componentName || 'custom-virtual-select';
                    let request = this.row?.requestConfig || '';
                    if (request?.viewProperty) {
                        if (componentName.includes('enum-select')) {
                            return request?.valueProperty || 'displayName';
                        }
                        return request?.viewProperty || 'displayName';
                    }
                } else if (
                    !componentName ||
                    componentName?.includes('constant') ||
                    FamKit.isSameComponentName(componentName, 'custom-select')
                ) {
                    return 'name';
                }
                let defaultConfig = this.fnComponentHandle(componentName, true)?.componentConfigs || {};

                return defaultConfig?.viewProperty || 'displayName';
            },
            valueKey() {
                if (this.valueProperty) {
                    return this.valueProperty;
                }

                let componentName = FamKit.hyphenate(this.row?.componentName || '');
                if (componentName.includes('virtual')) {
                    componentName = componentName || 'custom-virtual-select';
                    let request = this.row?.requestConfig || '';
                    if (request?.valueProperty) {
                        if (componentName.includes('enum-select')) {
                            return request?.viewProperty || 'displayName';
                        }
                        return request?.valueProperty || 'displayName';
                    }
                } else if (
                    !componentName ||
                    componentName?.includes('constant') ||
                    FamKit.isSameComponentName(componentName, 'custom-select')
                ) {
                    return 'value';
                }
                let defaultConfig = this.fnComponentHandle(componentName, true)?.componentConfigs || {};

                return defaultConfig?.valueProperty || 'displayName';
            }
        },
        methods: {
            // 获取列表数据
            fnGetOptions(requestConfig) {
                // 无URL时，return
                if (!requestConfig.url) {
                    console.warn(new Error(`Empty request`));
                    return Promise.resolve({});
                }
                this.loading[requestConfig.url] = true;

                if (!requestConfig?.headers) {
                    requestConfig.headers = {};
                }
                requestConfig.headers['App-Name'] =
                    requestConfig?.data?.appName ||
                    this.appName ||
                    this.$store.getters.appNameByClassName(requestConfig?.data?.className);
                let reqConf = { ...{ method: 'get' }, ...requestConfig };
                return axios(reqConf);
            }
        }
    };
});
