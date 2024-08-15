define(['erdcloud.kit', 'underscore'], function () {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        /*html*/
        template: `
            <div class="fam-type-tree__btns">
                <span class="fam-type-tree__typeName">{{typeName}}</span>
                <div>
                    <template v-for="item in buttons">
                        <erd-button v-if="!item.hide" :icon="item.icon" @click="item.handleClick(item)">
                            {{item.displayName}}
                        </erd-button>
                    </template>
                </div>
            </div>
        `,
        props: {
            buttons: {
                type: Array,
                default: []
            },
            typeName: {
                type: String,
                default: ''
            }
        },
        data() {
            return {};
        },
        computed: {},
        watch: {},
        methods: {}
    };
});
