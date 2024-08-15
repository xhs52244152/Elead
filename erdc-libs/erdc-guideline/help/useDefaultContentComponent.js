define([ELMP.resource('erdc-guideline/help/useDrawerHeader.js'), 'erdc-kit'], function (useDrawerHeader, ErdcKit) {
    /**
     * 默认帮助内容
     * @param {Object} [options]
     * @param {Array<{ title: string, component: import('vue').ComponentOptions }>} [options.steps=[]] - 帮助步骤
     * @returns {import('vue').ComponentOptions}
     */
    return function (options) {
        const _steps = options.steps || [];

        return {
            setup(props, { emit }) {
                const { ref, computed, onBeforeMount, watch, nextTick } = require('vue');
                const steps = ref(_steps);
                const scrollbar1 = ref(null);
                const scrollbar2 = ref(null);
                const showShadow = ref(false);

                const activeStepKey = ref(steps.value.find((step) => step.active)?.key || steps.value[0]?.key);

                const activeStep = computed(() => {
                    return steps.value.find((step) => step.key === activeStepKey.value);
                });
                const learnMore = computed(() => {
                    let _learnMore = activeStep.value?.learnMore || '';
                    let docsCenterHref = window.ELCONF.docsCenter?.href || '';

                    if (typeof _learnMore === 'string' && !/^(http|https|ftp):\/\//.test(_learnMore)) {
                        _learnMore = docsCenterHref + _learnMore;
                    } else if (typeof _learnMore === 'function') {
                        _learnMore = _learnMore(docsCenterHref);
                    }

                    return _learnMore || props.help?.learnMore || '';
                });

                const setActiveStepKey = (key) => {
                    const step = steps.value.find((s) => s.key === key);
                    if (step) {
                        if (step.href && window.location.pathname !== step.href) {
                            if (typeof step.href === 'function') {
                                step.href = step.href();
                            } else {
                                const appName = /erdc-app\/([^/]+)/.exec(step.href)?.[1];
                                if (appName) {
                                    ErdcKit.open(step.href.split('#')[1], { appName });
                                } else {
                                    window.open(step.href, '_blank');
                                }
                            }
                        } else {
                            steps.value.forEach((s) => {
                                s.active = false;
                            });
                            step.active = true;
                            activeStepKey.value = key;
                        }
                    }
                };

                watch(
                    () => [props.fullscreen, props.size],
                    () => {
                        nextTick(() => {
                            scrollbar1.value?.update();
                            scrollbar2.value?.update();
                        });
                    }
                );

                onBeforeMount(() => {
                    emit('update:fullscreen-size', 'calc(100% - 60px)');
                });

                return {
                    steps,
                    activeStepKey,
                    activeStep,
                    scrollbar1,
                    scrollbar2,
                    learnMore,
                    setActiveStepKey,
                    showShadow,
                    handleComponentMounted() {
                        setTimeout(() => {
                            showShadow.value = true;
                        }, 300);
                    }
                };
            },
            props: {
                title: String,
                fullscreen: Boolean,
                size: String,
                hide: {
                    type: Function,
                    default: () => {
                        return () => {
                            // do nothing
                        };
                    }
                },
                toggleFullScreen: {
                    type: Function,
                    default: () => {
                        return () => {
                            // do nothing
                        };
                    }
                },
                minimize: {
                    type: Function,
                    default: () => {
                        return () => {
                            // do nothing
                        };
                    }
                },
                help: {
                    type: Object,
                    default: () => {
                        return {};
                    }
                }
            },
            components: {
                ErdDrawerHeader: useDrawerHeader()
            },
            template: `
                <div class="erdc-help-default-content flex h-100p">
                    <img
                        v-if="showShadow"
                        class="position-absolute"
                        :alt="title"
                        src="${ELMP.resource('erdc-guideline/images/content-shadow.svg')}"
                    />
                    <div class="erdc-help-default-content__left flex flex-column">
                        <div class="erdc-help-default-content__left-title position-relative">
                            <div class="p-lg text-xl text-right font-bold">{{ title }}</div>
                        </div>
                        <div class="mt-xl grow-1 h-0">
                            <erd-scrollbar ref="scrollbar1" class="h-100p">
                                <ul>
                                    <li
                                        v-for="step in steps"
                                        :key="step.key"
                                        :class="[
                                        'cursor-pointer w-100p',
                                        {
                                            'active': activeStepKey === step.key,
                                            'bg-white': activeStepKey === step.key,
                                            'color-primary': activeStepKey === step.key,
                                        }
                                    ]"
                                        @click="setActiveStepKey(step.key)"
                                    >
                                        <erd-show-tooltip
                                            placement="top"
                                            :content="step.title"
                                        ></erd-show-tooltip>
                                    </li>
                                </ul>
                            </erd-scrollbar>
                        </div>
                    </div>
                    <div class="erdc-help-default-content__right grow-1">
                        <erd-drawer-header
                            :title="activeStep.title"
                            class=""
                            :hide="hide"
                            :toggleFullScreen="toggleFullScreen"
                            :fullscreen="fullscreen"
                            :minimize="minimize"
                            fullsize="calc(100% - 60px)"
                            :size="size"
                        >
                            <template #header-right>
                                <a 
                                    v-if="learnMore" 
                                    :href="learnMore"
                                    class="text-lg"
                                    target="_blank"
                                >
                                  <erd-icon icon="arrow-right"></erd-icon>
                                  {{ i18n.learnMore }}
                                </a>
                            </template>
                        </erd-drawer-header>
                        <erd-scrollbar class="h-100p">
                            <div class="m-lg">
                                <component
                                    :is="activeStep.component"
                                    :size="size"
                                    :fullscreen="fullscreen"
                                    fullsize="calc(100% - 60px)"
                                    :hook:mounted="handleComponentMounted"
                                ></component>
                            </div>
                        </erd-scrollbar>
                    </div>
                </div>`
        };
    };
});
