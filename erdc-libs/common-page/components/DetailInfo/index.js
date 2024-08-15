define(['text!' + ELMP.resource('common-page/components/DetailInfo/index.html')], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            vm: Object
        },
        components: {
            BasicInfo: FamKit.asyncComponent(ELMP.resource('common-page/components/BasicInfo/index.js')),
            FamAdvancedForm: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamAdvancedForm/index.js`))
        },
        data() {
            return {};
        },
        computed: {
            formData: {
                get() {
                    return this?.vm?.formData;
                },
                set(val) {
                    this.vm.formData = val;
                }
            },
            renderLayoutForm() {
                return this?.vm?.renderLayoutForm;
            },
            slots() {
                return this?.vm?.slots;
            },
            setFormData() {
                return this?.vm?.setFormData;
            },
            formShowType() {
                return this?.vm?.formShowType;
            },
            formBeforeProps() {
                return this?.vm?.formBeforeProps;
            },
            showBasicInfo() {
                return this?.vm?.showBasicInfo;
            },
            layoutType() {
                return this?.vm?.layoutType;
            },
            typeOid() {
                return this?.vm?.typeOid;
            },
            className() {
                return this?.vm?.className;
            },
            setLayoutExtraParams() {
                return this?.vm?.setLayoutExtraParams;
            },
            editableAttrs() {
                return this?.vm?.editableAttrs;
            },
            formProps() {
                return this?.vm?.formProps;
            },
            containerOid() {
                return this?.vm?.containerOid;
            },
            queryLayoutParams() {
                return this?.vm?.queryLayoutParams;
            },
            typeReferenceInfo() {
                return this?.vm?.typeReferenceInfo;
            },
            innerClassName() {
                return this?.vm?.innerClassName;
            },
            modelMapper() {
                return this?.vm?.modelMapper;
            },
            formSlotsProps() {
                return this?.vm?.formSlotsProps;
            },
            beforeEcho() {
                return this.vm?.hooks?.beforeEcho;
            }
        }
    };
});
