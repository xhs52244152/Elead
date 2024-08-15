/**
 * 业务对象信息标题
 */
define(['css!' + ELMP.resource('erdc-components/FamInfo/style.css')], function () {
    const FamKit = require('fam:kit');
    return {
        /*html*/
        template: `
            <div class="fam-base-info-title">
                <div v-if="icon" class="mr-8">
                    <fam-icon :value="icon"></fam-icon>
                </div>
                <span 
                    class="fam-base-info-title__title truncate text-xl color-normal letter-spacing-0" 
                    :title="innerTitle"
                >
                    {{innerTitle}}
                </span>
                <span 
                    v-if="status && locker"
                    class="fam-base-info-title__status color-error text-sm ml-normal ptb-sm rounded"
                >
                    {{statusText}}
                </span>
            </div>
        `,
        props: {
            title: String,
            icon: String,
            oid: String,
            status: String,
            locker: Object,
            staticTitle: Boolean
        },
        components: {
            FamIcon: FamKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamInfo/locale/index.js'),
                i18nMappingObj: {
                    you: this.getI18nByKey('you')
                }
            };
        },
        computed: {
            statusText() {
                return `${this.status ? this.status + ', ' : ''}${this.$t('isEditingBy', { user: this.lockerName })}`;
            },
            lockerName() {
                return this.locker?.oid === this.$store.state.app?.user?.oid
                    ? this.i18nMappingObj.you
                    : this.locker?.displayName || '';
            },
            resourceTitle() {
                let targetMenu = this.$store.getters['route/matchResource'](this.$route) || {};
                let nameI18nJson = targetMenu?.nameI18nJson;
                return nameI18nJson ? FamKit.translateI18n(nameI18nJson) : targetMenu?.displayName;
            },
            innerTitle() {
                return this.staticTitle ? this.title : this.resourceTitle || this.title;
            }
        }
    };
});
