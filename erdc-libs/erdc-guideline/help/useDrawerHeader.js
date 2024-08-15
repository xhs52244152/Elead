define([], function () {
    return function () {
        return {
            name: 'erd-drawer-header',
            props: {
                title: String,
                fullscreen: Boolean,
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
                }
            },
            template: `
                <div class="w-100p flex justify-between align-items-center erdc-help-drawer__header">
                    <div class="grow-1">
                        <span class="erd-ex-dialog__title">{{ title }}</span>
                    </div>
                    <div class="flex align-items-center">
                        <div class="mr-normal">
                            <slot name="header-right"></slot>
                        </div>
                        <span v-if="$slots['header-right']" class="mlr-normal erdc-help-drawer__header-split"></span>
                        
                        <erd-button
                            type="icon"
                            class="erdc-help-drawer__header-button"
                            icon="erd-iconfont erd-icon-zoom-out"
                            style="transform: scale(.88);"
                            @click.stop="minimize"
                        >
                        </erd-button>
                        
                        <!--暂时不考虑全屏功能-->
                        <erd-button
                            v-if="false"
                            type="icon"
                            class="erdc-help-drawer__header-button"
                            :icon="fullscreen? 'erd-iconfont erd-icon-zoom-out' : 'erd-iconfont erd-icon-zoom-in'"
                            style="transform: scale(.88);"
                            @click.stop="toggleFullScreen"
                        ></erd-button>

                        <erd-button
                            type="icon"
                            class="erdc-help-drawer__header-button"
                            icon="el-icon-close"
                            @click.stop="hide"
                        ></erd-button>
                    </div>
                </div>
            `
        };
    };
});
