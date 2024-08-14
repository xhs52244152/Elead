define([
    'text!' + ELMP.resource('ppm-component/ppm-components/InfoList/index.html'),
    'css!' + ELMP.resource('ppm-component/ppm-components/InfoList/style.css')
], function (template) {
    let InfoList = {
        name: 'info_list',
        template: template,
        props: {
            infoData: {
                type: Array,
                default: () => [
                    {
                        value: '',
                        title: '负责人'
                    },
                    {
                        value: '',
                        title: '状态'
                    },
                    {
                        value: '',
                        title: '预计开始日期'
                    },
                    {
                        value: '',
                        title: '预计结束日期'
                    }
                ]
            }
        },
        data() {
            return {
                imgArr: [
                    ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png'),
                    ELMP.resource('ppm-component/ppm-components/InfoList/images/info_o.png'),
                    ELMP.resource('ppm-component/ppm-components/InfoList/images/info_s.png'),
                    ELMP.resource('ppm-component/ppm-components/InfoList/images/info_t.png')
                ]
            };
        }
    };
    return InfoList;
});
