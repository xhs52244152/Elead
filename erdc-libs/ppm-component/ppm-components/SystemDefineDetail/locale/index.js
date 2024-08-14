/**
 * i18n国际化文件
 * **/
define([], function () {
    /**
     * 国际化key建议 短文本统一用中文作为key  长文本用英文作key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/

    // 配置国际化key-value
    const languageObj = {
        编辑类型: { CN: '编辑类型', EN: 'Edit Type' },
        编辑: { CN: '编辑', EN: 'Edit' },
        更多操作: { CN: '更多操作', EN: 'More Actions' },
        详情信息: { CN: '定义信息', EN: 'Definition Information' },
        关联团队: { CN: '关联团队', EN: 'relative team' },
        角色成员: { CN: '角色成员', EN: 'Role Members' },
        图标: { CN: '图标', EN: 'Icon' },
        请输入: { CN: '请输入', EN: 'Please Enter' },
        请选择: { CN: '请选择', EN: 'Please Select' },

        评审要素: { CN: '评审要素', EN: 'Review Elements' },
        质量目标: { CN: '质量目标', EN: 'Quality Objectives' },
        交付件清单: { CN: '交付件清单', EN: 'Deliverables' }
    };

    return {
        i18n: languageObj
    };
});
