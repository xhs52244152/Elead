define(['erdcloud.kit'], function () {
    const FamKit = require('erdcloud.kit');

    return {
        /*html*/
        template: `
            <div class="h-100p position-relative">
                <resizable-container>
                    <template slot="left">
                        <dict-tree 
                        @onclick="onTreeList">
                        </dict-tree>
                    </template>
                    <template slot="right">
                        <dict-list
                        :data="dictData"
                        :oid="oid">
                        </dict-list>
                    </template>
                </resizable-container>
            </div>`,
        components: {
            ResizableContainer: FamKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            DictTree: FamKit.asyncComponent(ELMP.resource('biz-dict/components/DictTree/index.js')),
            DictList: FamKit.asyncComponent(ELMP.resource('biz-dict/components/DictList/index.js'))
        },
        data() {
            return {
                dictData: {},
                oid: ''
            };
        },
        methods: {
            onTreeList(data) {
                this.dictData = data;
                this.oid = data.oid;
            }
        }
    };
});
