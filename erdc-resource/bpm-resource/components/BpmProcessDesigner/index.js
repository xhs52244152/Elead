define([
    'text!' + ELMP.resource('bpm-resource/components/BpmProcessDesigner/template.html'),
    '/erdc-thirdparty/platform/@erdcloud/bpmn-designer/lib/bpmn-designer.umd.js',
    'css!' + ELMP.resource('bpm-resource/components/BpmProcessDesigner/style.css'),
    'css!' + '/erdc-thirdparty/platform/@erdcloud/bpmn-designer/lib/style.css',
    'vue',
    'fam:store'
], function (template, BpmnDesigner) {
    const Vue = require('vue');
    const store = require('fam:store');

    Vue.use(BpmnDesigner, {
        locale: store.state.i18n.lang
    });

    return {
        name: 'BpmProcessDesigner',
        template,
        props: {
            value: String,
            readonly: Boolean
        },
        data() {
            return {
                controlForm: {
                    simulation: true,
                    labelEditing: false,
                    labelVisible: false,
                    keyboard: false,
                    prefix: 'activiti',
                    headerButtonSize: 'mini'
                    // additionalModel: []
                }
            };
        },
        computed: {
            xml: {
                get() {
                    return this.value;
                },
                set(xml) {
                    this.$emit('input', xml);
                }
            }
        },
        methods: {
            useBpmnModeler() {
                return this.$refs.bpmnDesigner.bpmnModeler;
            },
            processReZoom() {
                this.$refs.bpmnDesigner.processReZoom();
            },
            getXML() {
                return this.$refs.bpmnDesigner.getXML();
            }
        }
    };
});
