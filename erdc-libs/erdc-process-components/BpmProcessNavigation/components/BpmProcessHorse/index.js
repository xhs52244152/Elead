define([
    'text!' + ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessHorse/template.html'),
    'css!' + ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessHorse/index.css'),
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    const ICON_TYPE_DEFAULT = 'DEFAULT';
    const ICON_TYPE_FINISHED = 'FINISHED';
    const ICON_TYPE_CURRENT = 'CURRENT';
    const ICON_TYPE_ABNORMAL = 'ABNORMAL';
    const ICON_TYPE_SUSPENDED = 'SUSPENDED';

    return {
        name: 'BpmProcessHorse',
        template,
        components: {
            BpmProcessIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessIcon/index.js')),
            BpmProcessTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessTitle/index.js'))
        },
        props: {
            activities: {
                type: Array,
                required: true
            },
            users: {
                type: Array,
                default() {
                    return [];
                }
            },
            currentActivityId: {
                type: [String, Array]
            },
            viewActivityId: String,
            vertical: Boolean,
            height: {
                type: [String, Number],
                default: ''
            }
        },
        computed: {
            wrapStyle() {
                let wrapStyle = {};
                if (this.vertical) {
                    wrapStyle['overflow-x'] = 'hidden';
                }
                else {
                    wrapStyle['overflow-y'] = 'hidden';
                    wrapStyle['min-height'] = '93px';
                }
                return wrapStyle;
            },
            nodes() {
                const activities = _.chain(this.activities)
                    .filter(activity => activity.properties.type === 'userTask')
                    .sortBy(activity => +activity.properties.serialnumber)
                    .value();
                const startEvent = _.find(this.activities, activity => activity.properties.type === 'startEvent');
                const endEvent = _.find(this.activities, activity => activity.properties.type === 'endEvent');
                return _.compact([
                    startEvent,
                    ...activities,
                    endEvent
                ]);
            },
            nodeList() {
                const currentlyActiveIndex = _.findIndex(this.nodes, activity => _.some(this.currentlyActives, { activityId: activity.activityId }), false);
                const resolvedNodes = _.map(this.nodes, (node, index) => {
                    return _.extend({}, node, {
                        candidateUsers: this.getActivityCandidateUsers(node),
                        thumbnailType: this.getThumbnailType(node, index, currentlyActiveIndex)
                    });
                });
                return _.reduce(resolvedNodes, (prev, activity) => {
                    const group = _.find(prev, item => _.some(item, r => +r.properties.serialnumber === +activity.properties.serialnumber));
                    if (group) {
                        group.push(activity);
                    } else {
                        prev.push([activity]);
                    }
                    // [ [], [] ]
                    return prev;
                }, []);
            },
            active() {
                let idx = _.findIndex(this.nodeList, activities => {
                    const currentActivityId = _.isString(this.currentActivityId) ? [this.currentActivityId] : this.currentActivityId;
                    return _.some(activities, activity => _.includes(currentActivityId, activity.activityId));
                }, false);
                // let idx = _.findLastIndex(this.nodeList, activities => { return _.some(activities, activity => activity.activityStatus === 'LIFECYCLE_RUNNING' || activity.activityStatus === 'LIFECYCLE_EXCEPTION' || activity.activityStatus === 'LIFECYCLE_SUSPENDED') });
                return (idx === -1 ? this.nodeList && this.nodeList.length : idx);
            },
            currentlyActives() {
                return _.reduce(this.nodes, (prev, activity) => {
                    const currentActivityId = _.isString(this.currentActivityId) ? [this.currentActivityId] : this.currentActivityId;
                    if (_.includes(currentActivityId, activity.activityId)) {
                        prev.push(activity);
                    }
                    return prev;
                }, []);
            }
        },
        methods: {
            getActivityCandidateUsers(activity) {
                const candidateUsers = activity.candidateUsers || '';
                return _.chain(candidateUsers.split(',')).uniq().map(id => _.find(this.users, { id })).compact().value();
            },
            getThumbnailType(node, index, currentlyActiveIndex) {
                const ICON_TYPE = {
                    LIFECYCLE_RUNNING: ICON_TYPE_CURRENT,
                    LIFECYCLE_SUSPENDED: ICON_TYPE_SUSPENDED,
                    LIFECYCLE_EXCEPTION: ICON_TYPE_ABNORMAL,
                    LIFECYCLE_COMPLETED: ICON_TYPE_FINISHED,
                    LIFECYCLE_UNFINISHED: ICON_TYPE_DEFAULT,
                };
                const { activityStatus } = node || {};
                let status;
                if (node.properties.type === 'startEvent') {
                    status = ICON_TYPE[activityStatus] || ICON_TYPE_FINISHED;
                }
                else if (node.properties.type === 'endEvent') {
                    if (index && currentlyActiveIndex === -1) {
                        status = ICON_TYPE[activityStatus] || ICON_TYPE_FINISHED;
                    }
                }
                else {
                    status = ICON_TYPE[activityStatus] || ICON_TYPE_DEFAULT;
                }
                //
                // const activeIndex = ICON_TYPE_CURRENT;
                // if (_.some(this.currentlyActives, { activityId: node.activityId })) {
                //     return ICON_TYPE_CURRENT;
                // } else if (index < currentlyActiveIndex) {
                //     return ICON_TYPE_FINISHED;
                // }
                // TODO 如何识别任务是异常状态
                return status;
            }
        }
    };
});
