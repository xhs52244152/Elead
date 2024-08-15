define([
    'text!' + ELMP.resource('biz-bpm/LayoutForm/template.html'),
    ELMP.resource('biz-bpm/LayoutForm/api.js'),
    ELMP.resource('erdc-components/FamAdvancedForm/index.js')
], function (template, api, FamAdvancedForm) {
    const router = require('erdcloud.router');

    return {
        name: 'bpm-layout-form',
        setup(props) {
            const { computed, ref, watch, onBeforeMount, onMounted, nextTick } = require('vue');

            const form = ref({});
            // oid 值来源：当前组件传入的值 > 路由参数传入的值
            const oid = ref(
                props.customFormData.oid ||
                    router.currentRoute.query.bizOid ||
                    router.currentRoute.query.holderRef ||
                    null
            );

            const className = computed(
                () => props.customFormData.className || props.customFormData.typeName || layoutInfo.value?.typeName
            );
            // containerRef 值来源：当前组件传入的值 > 路由参数传入的值
            const containerRef = computed(() =>
                props.customFormData.containerRef
                    ? `OR:${props.customFormData.containerRef.key}:${props.customFormData.containerRef.id}`
                    : router.currentRoute.query.containerRef || null
            );

            const advancedForm = ref(null);
            const layoutRef = computed(
                () => props.taskInfos.localFormData?.layoutRef || props.taskInfos.globalFormData?.layoutRef
            );

            const queryLayoutParams = computed(() => ({
                attrRawList: [{ attrName: 'oid', value: layoutRef.value }]
            }));
            const layoutInfo = ref(null);
            const formType = computed(() => layoutInfo.value?.type);

            const readonly = computed(() => props.readonly || formType.value === 'DETAIL');

            watch(layoutInfo, (_layoutInfo) => {
                renderLayout(_layoutInfo);
            });
            onBeforeMount(() => {
                api.fetchLayoutByOId(layoutRef.value).then((res) => {
                    layoutInfo.value = res.data;
                });
            });
            onMounted(() => {
                if (Object.keys(props.customFormData).length === 0 && oid.value) {
                    api.fetchObjectByOid(oid.value).then((res) => {
                        advancedForm.value.resolveResponseData(res);
                    });
                } else {
                    form.value = props.customFormData;
                }
            });

            const renderLayout = (layout) => {
                nextTick(() => {
                    if (advancedForm.value) {
                        advancedForm.value.renderLayout(layout);
                    }
                });
            };

            /**
             * [外] 获取表单数据
             * @returns {string}
             */
            const getData = () => {
                return JSON.stringify({
                    ...form.value,
                    oid: oid.value,
                    className: className.value,
                    containerRef: containerRef.value
                });
            };
            /**
             * [外] 流程提交前置任务
             * @params {{ key: string, data: Object }} data
             * @returns {Promise<Object>}
             */
            const beforeProcessSubmit = (data) => {
                return Promise.resolve(data.data);
            };
            /**
             * [外] 表单校验
             * @returns {Promise<{ valid: boolean, data: Object }>}
             */
            const validate = async () => {
                const $form = advancedForm.value;
                let valid = true;
                if (formType.value !== 'DETAIL') {
                    valid = (await $form.submit())?.valid;
                }

                return Promise.resolve({
                    valid,
                    data: getData()
                });
            };
            return {
                form,
                oid,
                className,
                advancedForm,
                queryLayoutParams,
                readonly,
                validate,
                beforeProcessSubmit,
                getData
            };
        },
        components: {
            FamAdvancedForm
        },
        props: {
            processStep: String,
            customFormData: {
                type: Object,
                default() {
                    return {};
                }
            },
            processInfos: {
                type: Object,
                default() {
                    return {};
                }
            },
            taskInfos: {
                type: Object,
                default() {
                    return {};
                }
            },
            readonly: Boolean
        },
        template
    };
});
