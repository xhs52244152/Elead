define([
    'text!' + ELMP.resource('project-plan/components/WorkRecords/component/RegisteredWorkingHours/index.html'),
    'css!' + ELMP.resource('project-plan/components/WorkRecords/component/RegisteredWorkingHours/index.css')
], function (template) {
    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            }
        },
        data() {
            return {
                title: '登记工时',
                nextFlag: '',
                primaryId: '',
                innerData: {
                    startTime: '',
                    register_hours: '',
                    left_hours: '',
                    describtion: ''
                }
            };
        },
        methods: {
            saveSubmit() {
                this.$emit('updateWorkVisible', false);
            },
            onCancel() {
                this.$emit('updateWorkVisible', false);
            }
        }
    };
});
