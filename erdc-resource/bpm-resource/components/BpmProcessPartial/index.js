define(['text!' + ELMP.resource('bpm-resource/components/BpmProcessPartial/index.html'), 'underscore'], function (
    template
) {
    const _ = require('underscore');
    let asyncTaskList = [];

    return {
        name: 'BpmProcessPartial',
        template,
        props: {
            partialUrl: String,
            activityId: String,
            customFormJson: String,
            processInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            taskInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            draftInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            processStep: String,
            basicInfos: {
                type: Object,
                default() {
                    return {};
                }
            },
            pboData: {
                type: Object,
                default() {
                    return {};
                }
            },
            readonly: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmProcessPartial/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['业务对象不合法', '业务对象解析失败']),
                component: null
            };
        },
        computed: {
            customFormData() {
                let customFormData = {};
                try {
                    customFormData = JSON.parse(this.customFormJson);
                } catch (e) {
                    // do nothing
                }
                return customFormData;
            },
            innerBaseInfo: {
                get() {
                    return this.basicInfos;
                },
                set(value) {
                    this.$emit('update:basicInfos', value);
                }
            }
        },
        watch: {
            partialUrl: {
                immediate: true,
                handler(partialUrl) {
                    if (partialUrl) {
                        this.loadComponent(partialUrl);
                    }
                }
            }
        },
        deactivated() {
            asyncTaskList = [];
        },
        methods: {
            loadComponent(url) {
                const asyncTask = new Promise((resolve, reject) => {
                    require([ELMP.resource(url)], (component) => {
                        if (typeof component === 'function') {
                            component({
                                render(component) {
                                    resolve(component);
                                }
                            });
                        } else {
                            resolve(component);
                        }
                    }, (error) => {
                        this.$message.error(this.i18nMappingObj['业务对象解析失败']);
                        reject(error);
                    });
                });

                asyncTaskList.push(asyncTask);

                Promise.all(asyncTaskList).then((asyncTaskList) => {
                    [this.component] = asyncTaskList.reverse();
                });
            },
            validate() {
                return new Promise((resolve) => {
                    if (this.partialUrl) {
                        this.submit('validate')
                            .then((resp) => {
                                let { valid, data = '{}', message } = resp || {};

                                resolve({ valid, data, message: message || this.i18nMappingObj['业务对象不合法'] });
                            })
                            .catch((error) => {
                                resolve({ valid: false, data: '{}', message: error.message });
                            });
                    }
                });
            },
            getData() {
                return this.submit('getData');
            },
            submit(funcName) {
                let { businessObject = {} } = this.$refs || {};
                if (typeof businessObject[funcName] === 'function') {
                    return businessObject[funcName]();
                }
                if (funcName === 'validate') {
                    return Promise.resolve({
                        valid: true,
                        data: '{}'
                    });
                }
                if (funcName === 'getData') {
                    return Promise.resolve('{}');
                }
                return Promise.resolve({});
            },
            async beforeSubmit(payload) {
                let resultData = payload.data;
                let { businessObject = {} } = this.$refs || {};
                if (typeof businessObject.beforeProcessSubmit === 'function') {
                    resultData = await businessObject.beforeProcessSubmit(payload);
                }
                return resultData;
            },
            async afterSubmitted(...args) {
                let { businessObject = {} } = this.$refs || {};
                if (typeof businessObject.afterProcessSubmitted === 'function') {
                    await businessObject.afterProcessSubmitted(...args);
                }
            },
            getPartialSecurity(security) {
                this.$emit('partial-security', security);
            }
        }
    };
});
