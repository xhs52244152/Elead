define(['fam:kit'], function () {
    const FamKit = require('fam:kit');

    return {
        /*html*/
        template: `
            <FamUser v-if="users.length" :users="users"></FamUser>
            <span v-else>{{userName || '--'}}</span>
        `,
        components: {
            FamUser: FamKit.asyncComponent(ELMP.resource('erdc-components/FamUser/index.js'))
        },
        props: {
            value: {
                type: [Array, Object, String],
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                users: [],
                userName: ''
            };
        },
        watch: {
            value: {
                immediate: true,
                handler(val) {
                    if (typeof val === 'string') {
                        this.userName = val;
                    } else {
                        this.users = _.isArray(val) ? val : [val].filter(Boolean);
                    }
                }
            }
        }
    };
});
