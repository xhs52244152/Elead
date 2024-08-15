define([ELMP.resource('erdc-guideline/help/useHelp.js')], function (useHelp) {
    return function () {
        return {
            setup(props, { emit }) {
                const { ref, computed, onMounted } = require('vue');
                const showHelp = ref(false);
                const help = ref(null);
                const isShowHelp = computed(() => showHelp.value && !props.hidden);

                onMounted(() => {
                    useHelp()
                        .then((_help) => {
                            help.value = _help;
                            showHelp.value = true;
                        })
                        .catch(() => {
                            showHelp.value = false;
                        });
                });

                const handleShowHelp = () => {
                    if (help.value) {
                        emit('show-help', help.value);
                    }
                };

                return {
                    isShowHelp,
                    help,
                    handleShowHelp
                };
            },
            props: {
                hidden: Boolean,
                disabled: Boolean
            },
            template: `
                <erd-tooltip
                    v-if="isShowHelp"
                    placement="top"
                    :content="i18n.helpGuide"
                >
                    <slot :help="help" :disabled="disabled" :handleShowHelp="handleShowHelp">
                        <erd-button
                            type="icon"
                            :disabled="disabled"
                            icon="erd-iconfont erd-icon-help"
                            @click="handleShowHelp"
                        ></erd-button>
                    </slot>
                </erd-tooltip>
        `
        };
    };
});
