define([ELMP.resource('erdc-guideline/help/useDrawerHeader.js')], function (useDrawerHeader) {
    const ErdcKit = require('erdcloud.kit');

    return function (options) {
        const _withHeader = !!options.withHeader;
        const _title = options.title || '';
        const _content = options.content || null;
        const _size = options.size || '380px';
        const _overflowVisible = !!options.overflowVisible;
        const _help = options.help || null;

        return {
            setup(_, { emit }) {
                const { ref, watch } = require('vue');
                const content = ref(_content);
                const drawer = ref(null);
                const visible = ref(false);
                const overflowVisible = ref(_overflowVisible);
                const fullscreen = ref(false);
                const titleComponent = useDrawerHeader();
                const contentComponent = ref(null);
                const fullscreenSize = ref('100%');
                const help = ref(_help);
                const showBackdrop = ref(false);
                const props = ref({
                    title: _title,
                    withHeader: _withHeader,
                    size: _size
                });
                let lastSize = props.value.size;

                const render = function (contentComp) {
                    content.value = contentComp;
                    return this;
                };
                const toggleFullScreen = function () {
                    fullscreen.value = !fullscreen.value;
                };
                const handleFullscreenSize = function (value) {
                    fullscreenSize.value = value;
                };

                return {
                    visible,
                    showBackdrop,
                    drawer,
                    overflowVisible,
                    contentComponent,
                    props,
                    content,
                    fullscreenSize,
                    help,
                    render,
                    show() {
                        visible.value = true;
                        return this;
                    },
                    hide() {
                        props.value.size = lastSize;
                        visible.value = false;
                        return this;
                    },
                    toggle() {
                        visible.value = !visible.value;
                        return this;
                    },
                    toggleFullScreen,
                    fullscreen,
                    titleComponent,
                    classnames: ErdcKit.classnames,
                    useContent() {
                        if (contentComponent.value) {
                            return Promise.resolve(contentComponent.value);
                        }
                        return new Promise((resolve) => {
                            watch(
                                contentComponent,
                                () => {
                                    resolve(contentComponent.value);
                                },
                                {
                                    once: true
                                }
                            );
                        });
                    },
                    handleFullscreenSize,
                    handleClosed() {
                        emit('closed');
                    },
                    minimize() {
                        lastSize = props.value.size;
                        props.value.size = '0';
                        showBackdrop.value = false;
                        if (drawer.value) {
                            drawer.value.$el.style.top = '100%';
                            drawer.value.$el.style.height = 0;
                        }
                    },
                    maximize() {
                        if (drawer.value) {
                            drawer.value.$el.style.top = 0;
                            drawer.value.$el.style.height = '100%';
                        }
                        showBackdrop.value = true;
                        props.value.size = lastSize;
                    }
                };
            },
            template: `
                <div class="erdc-help-drawer-container position-relative">
                    <div v-if="props.size === '0' && visible" class="erdc-help-drawer-container__foot position-fixed right-0">
                        <span class="erdc-help-drawer-container__foot-close" @click.stop="hide">
                            <erd-icon icon="el-icon-close"></erd-icon>
                        </span>
                        <span class="erdc-help-drawer-container__foot-btn" @click.stop="maximize">
                            <erd-icon icon="arrow-left"></erd-icon>
                            {{ i18n.helpGuide }}
                        </span>
                    </div>
                    <erd-drawer
                        ref="drawer"
                        :visible.sync="visible"
                        direction="btt"
                        destroy-on-close
                        :custom-class="classnames(['erdc-help-drawer', {
                            'without-header': !props.withHeader,
                            'overflow-visible': props.size !== '0' && overflowVisible,
                            'hide-backdrop': !showBackdrop,
                        }])"
                        :modal="false"
                        :show-close="false"
                        :wrapper-closable="props.size !== '0'"
                        :size="fullscreen ? fullscreenSize : props.size"
                        :with-header="props.withHeader"
                        style="transition: all 0.3s ease-in-out;"
                        @closed="handleClosed"
                    >
                        <template v-if="props.withHeader" #title>
                            <component
                                :is="titleComponent"
                                :title="props.title"
                                :hide="hide"
                                :fullscreen="fullscreen"
                                :toggleFullScreen="toggleFullScreen"
                                :minimize="minimize"
                            ></component>
                        </template>
                        <component
                            ref="contentComponent"
                            :is="content"
                            :title="props.title"
                            :size="props.size"
                            :fullscreen="fullscreen"
                            :toggleFullScreen="toggleFullScreen"
                            :minimize="minimize"
                            :hide="hide"
                            :help="help"
                            @update:fullscreen-size="handleFullscreenSize"
                            :hook:mounted="showBackdrop = true"
                        ></component>
                    </erd-drawer>
                </div>
            `
        };
    };
});
