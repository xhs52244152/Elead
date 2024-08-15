define([
    'text!' + ELMP.resource('platform-mfe/views/application/groupManage/index.html'),
    'vuedraggable',
    ELMP.resource('platform-mfe/api.js'),
    'css!' + ELMP.resource('platform-mfe/index.css')
], function (tmpl, draggable, api) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template: tmpl,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            draggable,
            FamDynamicFormItem: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamDynamicForm/FamDynamicFormItem.js')
            )
        },
        props: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-mfe/locale'),
                visible: false,
                formData: {
                    groupList: []
                },
                name: '',
            };
        },
        methods: {
            show() {
                this.formData.groupList = [];
                this.formConfigs = [];
                api.getGroupData().then((resp) => {
                    if (resp.data.length > 0) {
                        for (let i = 0; i < resp.data.length; i++) {
                            const obj = {
                                name: {
                                    attrName: 'name',
                                    value: resp.data[i].nameI18nJson
                                },
                                id: resp.data[i].id
                            };
                            this.formData.groupList.push(obj);
                        }
                    } else {
                        this.addItem();
                    }
                });
                this.visible = true;
            },
            submit() {
                let temp = this.formData.groupList.filter((item) => {
                    return (
                        Object.keys(item.name).length === 0 ||
                        (item.name && item.name.value && item.name.value.value === '')
                    );
                });
                if (temp.length > 0) {
                    this.$message({
                        message: this.i18nMappingObj.groupTips,
                        type: 'error'
                    });
                } else {
                    let result = [];
                    for (let i = 0; i < this.formData.groupList.length; i++) {
                        const temp = this.formData.groupList[i];
                        let obj = {};
                        if (temp.id) {
                            obj = {
                                nameI18nJson: temp.name.value,
                                id: temp.id,
                                sortNum: i
                            };
                        } else {
                            obj = {
                                nameI18nJson: temp.name.value,
                                sortNum: i
                            };
                        }
                        result.push(obj);
                    }
                    this.$refs.groupForm.validate((valid) => {
                        if (valid) {
                            api.saveGroup(result).then((resp) => {
                                if (resp.success) {
                                    this.$message({
                                        type: 'success',
                                        message: '保存成功',
                                        showClose: true
                                    });
                                    this.$emit('done');
                                    this.visible = false;
                                }
                            });
                        }
                    });
                }
            },
            cancel() {
                this.$refs.groupForm.clearValidate();
                this.visible = false;
            },
            addItem() {
                this.formData.groupList.push({
                    name: {}
                });
            },
            deleteItem(item, index) {
                this.$confirm('确认删除该分组？', '删除', {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    if (item.id) {
                        api.deleteGroup(item.id).then((resp) => {
                            if (resp.success) {
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj.deleteSuccess,
                                    showClose: true
                                });
                                this.formData.groupList.splice(index, 1);
                            }
                        });
                    } else {
                        this.formData.groupList.splice(index, 1);
                    }
                });
            }
        }
    };
});
