define([], function () {
    const FamKit = require('fam:kit');

    return {
        name: 'codeRule',
        /* html */
        template: `
            <div id="codeRule" class="h-100p flex flex-column">
                <code-rule-table
                    v-show="type === 'codeRuleTable'"
                    class="grow-1"
                    @goto="gotoFn"
                ></code-rule-table>
                <signature-table
                    v-if="type === 'signatureTable'"
                    class="p-normal grow-1"
                    :data="data"
                    @goto="gotoFn"
                ></signature-table>
            </div>
        `,
        components: {
            CodeRuleTable: FamKit.asyncComponent(ELMP.resource('biz-code-rule/components/CodeRuleTable/index.js')),
            SignatureTable: FamKit.asyncComponent(ELMP.resource('biz-code-rule/components/SignatureTable/index.js'))
        },
        data() {
            return {
                type: 'codeRuleTable',
                data: null
            };
        },
        methods: {
            gotoFn(type, data) {
                this.type = type;
                this.data = data;
            }
        }
    };
});
