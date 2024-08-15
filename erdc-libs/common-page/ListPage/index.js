define(['vue'], function () {
    const ErdcKit = require('erdcloud.kit');

    return {
        /*html*/
        template: `
            <div 
                id="fam_common_page_list" 
                class="grow-1"
            > 
                <PageList
                    ref="pageList" 
                    :className="className"
                    :routeQueryParams="routeQueryParams" 
                    :classNameKey="classNameKey"
                ></PageList>
            </div>
        `,
        components: {
            PageList: ErdcKit.asyncComponent(ELMP.resource('common-page/components/PageList/index.js'))
        },
        data() {
            return {};
        },
        computed: {
            className() {
                return this.routeQueryParams.className;
            },
            routeQueryParams() {
                return this.$route?.query || {};
            },
            classNameKey() {
                return this.className?.split('.')?.at(-1) || '';
            }
        },
        actived() {
            this.$refs.pageList?.refreshTable();
        }
    };
});
