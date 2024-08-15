define(['css!' + ELMP.resource('biz-bpm/process-history/index.css')], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        name: 'processHistory',

        /*html*/
        template: `
            <div
                id="bpm-history-process-content"
                class="bpm-history-process-content h_100p"
                v-cloak
            >
                <history-table></history-table>
            </div>
        `,
        components: {
            historyTable: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/process-history/components/historyProcessTable/index.js')
            )
        },
        data: function () {
            return {};
        }
    };
});
