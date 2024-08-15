/*
    类型属性配置
    先引用 kit组件
    Object: FamKit.asyncComponent(ELMP.resource('erdc-product-components/Object/index.js')), // 编辑子类型

    

 */
    define([
        'text!' + ELMP.resource('erdc-product-components/Object/index.html'),
        'css!' + ELMP.resource('erdc-product-components/Object/style.css'),
    ], function (template) {
    
        return {
            template,
            props: {
    
            },
            data() {
                return {
                    // 国际化locale文件地址
                    i18nLocalePath : ELMP.resource('erdc-product-components/locale/index.js'),
                    // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                    i18nMappingObj : {
                        'new' : this.getI18nByKey('转至最新'),
                        'action' : this.getI18nByKey('更多操作'),
                        'edit' : this.getI18nByKey('编辑'),
                        'add' : this.getI18nByKey('增加'),
                        'save' : this.getI18nByKey('保存'),
                        'delete' : this.getI18nByKey('删除'),
                        'attr' : this.getI18nByKey('属性'),
                        'obj' : this.getI18nByKey('相关对象'),
                        'team' : this.getI18nByKey('团队'),
                    },
                }
            },
            mounted() {
                
            },
            components: {
                
            },
            watch: {
                
            },
            computed: {
                
            },
            methods: {

            }
        };
    });
