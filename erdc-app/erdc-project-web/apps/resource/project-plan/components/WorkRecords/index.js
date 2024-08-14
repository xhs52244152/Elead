define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-plan/components/WorkRecords/index.html'),
    'css!' + ELMP.resource('project-plan/components/WorkRecords/index.css')
], function (ErdcKit, template) {
    let workRecords = {
        name: 'plan_work_records',
        template: template,
        data() {
            return {
                panelUnfoldA: true,
                panelUnfold: true,
                memberValue: '',
                showFlag: false,
                menverDefaultVal: [],
                typeList: [
                    {
                        id: 10001,
                        name: 'Test1',
                        sex: 'Man',
                        value: 28,
                        address: 'test abc'
                    },
                    {
                        id: 10002,
                        name: 'Test2 Test2',
                        sex: 'Women',
                        value: 22,
                        address: 'Guangzhou'
                    },
                    {
                        id: 10003,
                        name: 'Test3',
                        sex: 'Man',
                        value: 32,
                        address: 'Shanghai'
                    },
                    { id: 10004, name: 'Test4', sex: 'Women', value: 24, address: 'Shanghai' }
                ]
            };
        },
        methods: {
            onChagneMember() {},
            typeChange() {
                console.log('zheshiihhih');
                this.showFlag = true;
            },
            updateWorkVisible(val) {
                this.showFlag = val;
            }
        },
        components: {
            Registered_working: ErdcKit.asyncComponent(
                ELMP.resource('project-plan/components/WorkRecords/component/RegisteredWorkingHours/index.js')
            )
        }
    };
    return workRecords;
});
