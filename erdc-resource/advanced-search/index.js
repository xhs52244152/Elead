define([ELMP.resource('advanced-search/advancedSearchMixin.js')], (advancedSearchMixin) => {
    const erdcloudKit = require('erdcloud.kit');

    return {
        name: 'AdvancedSearch',
        mixins: [advancedSearchMixin],

        /*html*/
        template: `
            <erd-tooltip
                v-if="globalSearchIconVisible"
                class="layout-component__plain-button"
                :content="i18n.globalSearch"
            >
                <erd-popover
                    trigger="click"
                    :visible-arrow="false"
                    placement="top"
                    ref="searchPopover"
                    @show="openSearchPopover(true)"
                    @hide="openSearchPopover(false)"
                > 
                    <global-search-conditions class="global-popover-conditions"></global-search-conditions>
                    <erd-button
                        v-show="globalSearchIconVisible"
                        slot="reference"
                        type="text"
                        icon="erd-iconfont erd-icon-search"
                        class="flex align-items-center text-white"
                    >
                    </erd-button>
                </erd-popover>
            </erd-tooltip>
        `,
        components: {
            GlobalSearchConditions: erdcloudKit.asyncComponent(
                ELMP.resource('advanced-search/views/GlobalSearchConditions/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('advanced-search/locale/index.js'),
                i18nMappingObj: {}
            };
        },
        mounted() {
            document.addEventListener('click', this.setVisible);
        },
        destroyed() {
            document.removeEventListener('click', this.setVisible);
        },
        methods: {
            setVisible(e) {
                const globalPopoverConditions = document.querySelector('.global-popover-conditions');
                const globalSearchMessageBox = document.querySelector('.global-search-message-box');
                const advancedGroupConfirmBox = document.querySelector('.advanced-group-confirm-box');
                const isContainsTarget = [
                    globalPopoverConditions,
                    globalSearchMessageBox,
                    advancedGroupConfirmBox
                ].some((item) => item?.contains(e.target));
                if (!isContainsTarget) {
                    this.storeCommit('globalSearchVisible', false);
                }
            },
            openSearchPopover(flag) {
                this.storeCommit('globalSearchVisible', flag);
            }
        }
    };
});
