define([
    'vue',
    'erdc-kit',
    'erdcloud.router',
    'erdcloud.store',
    'erdcloud.http',
    ELMP.resource('erdc-cbb-components/ImportAndExport/components/Notify/index.js')
], function (Vue, ErdcKit, router, store, ErdcHttp, Notify) {
    // 常用的挂载弹窗的方法
    function mountDialog(vueOption = {}) {
        if (_.isEmpty(vueOption)) {
            return;
        }
        let { instance } = utils.useFreeComponent({
            ...vueOption,
            methods: {
                close() {
                    instance.$destroy();
                    if (this.$el.parentNode) {
                        this.$el.parentNode.removeChild(this.$el);
                    }
                },
                ...(vueOption.methods || {})
            }
        });
        document.body.appendChild(instance.$el);
    }
    // isNative 是-原始数据 否-深拷贝数据
    function coverDataFromAttrRowList(row, key = 'attrRawList', isNative = false, resolve) {
        let res = isNative ? row : JSON.parse(JSON.stringify(row));
        (res?.[key] || []).forEach((item) => {
            resolve ? resolve(item, commonAttrObjectFormat) : commonAttrObjectFormat(item);
        });
        function commonAttrObjectFormat(attrObject = {}) {
            let { value, displayName, attrName } = attrObject;
            if ((value || displayName) && attrName) {
                if (attrName?.includes('#')) {
                    res[attrName.split('#')[1]] = displayName || value;
                }
                res[attrName] = displayName || value;
            }
        }
        return res;
    }
    // 通用操作渲染弹窗相关处理
    let utils = {
        // 根据vue options渲染组件
        useFreeComponent(vueOptions) {
            let instance = new Vue({
                store: store,
                router: router,
                ...vueOptions
            });

            instance.$mount();

            let destroy = function () {
                instance.$destroy();
            };

            return {
                instance,
                destroy
            };
        },
        // 渲染弹窗
        renderImportAndExportDialog(props, success, cancel) {
            let { instance, destroy } = utils.useFreeComponent({
                template: `
                    <ImportAndExport
                        v-if="params.visible"
                        :visible.sync="params.visible"
                        v-bind="params"
                        @success="success"
                        @cancel="cancel"
                    ></ImportAndExport>
                `,
                components: {
                    ImportAndExport: ErdcKit.asyncComponent(
                        ELMP.resource('erdc-cbb-components/ImportAndExport/index.js')
                    )
                },
                data() {
                    return {
                        params: {}
                    };
                },
                created() {
                    this.params = props;
                },
                methods: {
                    success() {
                        this.params.visible = false;
                        _.isFunction(success) && success({ instance, destroy });
                    },
                    cancel() {
                        this.params.visible = false;
                        _.isFunction(cancel) && cancel({ instance, destroy });
                    }
                }
            });
        },
        // 渲染确认提示弹窗
        renderConfirmDialog(params, callback) {
            let { destroy } = utils.useFreeComponent({
                template:
                    '<confirm-dialog v-bind="props" :urlConfig="urlConfig" @success="success" @close="close"></confirm-dialog>',
                components: {
                    ConfirmDialog: ErdcKit.asyncComponent(ELMP.resource('erdc-pdm-components/ConfirmDialog/index.js'))
                },
                data() {
                    return {
                        ...params
                    };
                },
                methods: {
                    success(resData) {
                        callback && callback(resData);
                    },
                    close() {
                        destroy();
                    }
                }
            });
        },
        mountDialog,
        // 挂载复杂页面弹窗
        mountHandleDialog(DialogHandler, { props, successCallback, urlConfig, success, close }) {
            // 默认配置
            urlConfig = _.isFunction(urlConfig)
                ? urlConfig()
                : urlConfig || {
                      rename: '/fam/common/rename',
                      saveAs: '/fam/saveAs',
                      ownerBy: '/fam/common/batchUpdateOwnerBy',
                      move: '/fam/folder/batchMoveObject',
                      setState: '/fam/common/batchResetState'
                  };
            successCallback = successCallback || (() => '');
            props = props || {};
            if (urlConfig) {
                props.urlConfig = urlConfig;
            }

            let methods = {
                success: success || successCallback
            };
            if (close) {
                methods.close = close;
            }
            mountDialog({
                store,
                router,
                template: `
                            <DialogHandler
                                v-bind="props"
                                @success="success"
                                @close="close"
                            ></DialogHandler>
                        `,
                components: {
                    DialogHandler
                },
                data() {
                    return {
                        props,
                        urlConfig
                    };
                },
                methods
            });
        },

        // 将单个对象处理成数组
        toRows(row) {
            return row ? (_.isArray(row) ? row : [row]) : [];
        },

        // 生成一个promise和回调
        generatePromisCallback() {
            let resolve,
                reject,
                promise = new Promise((ok, fail) => {
                    resolve = ok;
                    reject = fail;
                });
            return { resolve, reject, promise };
        },
        // 顺序执行promise
        runPromiseArrSort(promiseArr = [], initValue) {
            return promiseArr.reduce((prev, current) => prev.then(current), Promise.resolve(initValue));
        },
        //
        commonFormatObject(object, className = '') {
            let transObject = {},
                attrRawList = (object.rawData || []).map((attrRawObject) => {
                    transObject[attrRawObject?.attrName || ''] = attrRawObject?.displayName || '';
                    transObject[`${className}#${attrRawObject?.attrName || ''}`] = attrRawObject?.displayName || '';
                    return ErdcKit.deepClone(attrRawObject);
                });

            return {
                ...object,
                ...transObject,
                attrRawList
            };
        },
        coverDataFromAttrRowList,
        // 导入导出后的回调通知
        Notify,
        // 获取模板数据
        getTemplateData(businessName) {
            return ErdcHttp({
                url: '/fam/export/template/listByBusinessName',
                appName: 'PDM',
                params: {
                    businessName,
                    addDefaultViewExport: false
                }
            })
        }
    };
    return utils;
});
