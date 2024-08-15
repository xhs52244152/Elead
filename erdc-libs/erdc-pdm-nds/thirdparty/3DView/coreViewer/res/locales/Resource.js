/**
 * Created by YUE.Zhilin on 2016/6/6.
 */

// "IDS_Multitle": "配置/族表",
// "IDS_Multitle": "Configuration/family table",
// 
// "IDS_sure":"确定",
// "IDS_cancle":"取消",
// "IDS_sure":"Sure",
// "IDS_cancle":"Cancle",
// "IDS_wei_smaterial":"选择材料",
// "IDS_wei_sentity":"指定实体重量",
// "IDS_wei_total":"总重量",
// "IDS_wei_commonMaterials":"常用材料",
// "IDS_wei_CustomMaterials":"自定义材料",
// "IDS_wei_materialCategory":"材料类型:",
// "IDS_wei_materialName":"材料名称：",
// "IDS_wei_materialDensity":"请输入材料密度（g/cm³):",
// "IDS_SelectBody":"选择实体",

// "IDS_wei_commonMaterials":"Common Materials",
// "IDS_wei_CustomMaterials":"Custom Materials",
// "IDS_wei_materialCategory":"Material category:",
// "IDS_wei_materialName":"Material Name:",
// "IDS_wei_materialDensity":"Material Density（g/cm³):",

//"IDS_custom_PROPERTY": "自定义属性",
//"IDS_routine_PROPERTY": "常规属性",

//"IDS_custom_PROPERTY": "Custom Property",
//"IDS_routine_PROPERTY": "Routine Property",

// "IDS_RMB_SHOWOutstand": "突出显示",
// "IDS_RMB_SHOWTransparent": "透明显示",
// "IDS_RMB_SHOWAlone": "单独显示",

StringTable = function (language) {

    var _this = this;

    this.translate = function (strID) {

        return _this.tables[strID] ? this.tables[strID] : "";

    };

    this.tables_cn = {

        "IDS_ORBIT": "旋转",
        "IDS_PAN": "平移",
        "IDS_ZOOM": "缩放",
        "IDS_ZOOM_ALL": "滑动缩放",
        "IDS_ZOOM_WINDOW": "选框放大",
        "IDS_EXPLODE": "爆炸",//爆炸视图
        "IDS_FITTOVIEW": "自适应",
        "IDS_RESETCAMERA": "重置",
        "IDS_FULLSCREEN": "全屏",
        "IDS_EXITFULLSCREEN": "退出",
        "IDS_ANNOTATION": "标注",
        "IDS_LINESTATE": "显示样式",
        "IDS_HIDELINES": "视图",//视图显示
        "IDS_SHOWLINES": "视图",//视图隐藏
        "IDS_SELECT": "选取",
        "IDS_MEASURE": "测量",
        "IDS_MEASURETYPE_COORDINATE": "坐标",
        "IDS_MEASURETYPE_DISTANCE": "距离",
        "IDS_MEASURETYPE_DIST": "点到点",
        "IDS_MEASURETYPE_PointToLine": "点到线",
        "IDS_MEASURETYPE_PointToFace": "点到面",
        "IDS_MEASURETYPE_LineToLine": "线到线",
        "IDS_MEASURETYPE_Lineargauge": "线性测量",
        "IDS_MEASURETYPE_LineToFace": "线到面",
        "IDS_MEASURETYPE_CenterToPoint": "圆心到点",
        "IDS_MEASURETYPE_CenterToLine": "圆心到线",
        "IDS_MEASURETYPE_ANGLE": "角度",
        "IDS_MEASURETYPE_FACE_DIST": "面到面",
        "IDS_MEASURETYPE_FACE_ANGLE": "面夹角",
        "IDS_MEASURETYPE_Line_ANGLE": "线夹角",
        "IDS_MEASURETYPE_LineFACE_ANGLE": "线面夹角",
        "IDS_MEASURETYPE_MEASURE_EDGES": "线测量",
        "IDS_MEASURETYPE_MEASURE_EDGES3": "线段长度",
        "IDS_MEASURETYPE_MEASURE_EDGES2": "连续长度",//Continuous length
        "IDS_MEASURETYPE_MEASURE_Area": "面积",//连续面积//Continuous length
        "IDS_MEASURETYPE_MEASURE_Proportion":"设置比例",
        "IDS_MEASURETYPE_HOLE_DIST": "圆心距",
        "IDS_MEASURETYPE_AxisToPoint": "孔轴到点",
        "IDS_MEASURETYPE_AxisToLine": "孔轴到线",
        "IDS_MEASURETYPE_AxisToFace": "孔轴到面",
        "IDS_MEASURETYPE_MEASURE_radius": "半径",
        "IDS_MEASURETYPE_MEASURE_diameter": "直径",
        "IDS_DRAG": "拖动",
        "IDS_DRAGOP_SELECT": "单个拖动",//选择拖动
        "IDS_DRAGOP_RESTORE": "单个复位",//选择复位
        "IDS_DRAGOP_RESTOREAll": "全部复位",
        "IDS_DRAGOP_HIDE": "隐藏",
        "IDS_DRAGOP_REVERSEVISIBILITY": "显隐交换",
        "IDS_DRAGOP_SHOWALL": "全部显示",
        "IDS_SECTIONVIEW": "剖切",
        "IDS_SECTIONVIEW_base_app":"剖切",
        "IDS_SECTIONVIEW_base": "基础剖切",
        "IDS_SECTIONVIEW_advance": "高级剖切",
        "IDS_ANNOTATIONSETTINGHIDE": "隐藏标注",
        "IDS_ANNOTATIONSETTINGSHOW": "显示标注",
        "IDS_LIGHTEDITOR": "灯光控制",
        "IDS_RMB_ISOLATE": "独立",
        "IDS_RMB_HIDE": "隐藏显示",
        "IDS_RMB_SHOWOutstand": "突出显示",
        "IDS_RMB_SHOWTransparent": "透明显示",
        "IDS_RMB_SHOWAlone": "单独显示",
        "IDS_RMB_SHOWALL": "全部显示",
        "IDS_RMB_PROPERTY": "属性",
        "IDS_RMB_PROPERTY_body": "指定实体",
        "IDS_RMB_PROPERTY_total": "总属性",
        "IDS_custom_PROPERTY": "自定义属性",
        "IDS_routine_PROPERTY": "常规属性",
        "IDS_PreviewPart": "当前标签页打开",
        "IDS_wei_smaterial": "选择材料",
        "IDS_wei_sentity": "指定实体重量",
        "IDS_wei_total": "总重量",
        "IDS_wei_commonMaterials": "常用材料",
        "IDS_wei_CustomMaterials": "自定义材料",
        "IDS_wei_materialCategory": "材料类型：",
        "IDS_wei_materialName": "材料名称：",
        "IDS_wei_materialDensity": "请输入材料密度（g/cm³)：",
        "IDS_MODELBROWSER": "结构树",
        "IDS_SelectBody":"选择实体",
        "IDS_MODELBROWSER_2D": "图层",
        "IDS_PERSPECTIVE": "透视",
        "IDS_Orthographic": "正交",

        "IDS_Multitle": "配置/族表",

        "IDS_ZOOMWINDOW": "局部放大",
        "IDS_DISPSTYLE": "显示样式",
        "IDS_DISPSTYLE_SHADEDEDGES": "边线上色",
        "IDS_DISPSTYLE_SHADED": "上色",
        "IDS_DISPSTYLE_HIDDENREMOVED": "隐线消除",
        "IDS_DISPSTYLE_HIDDENVISIBLE": "隐线可见",
        "IDS_DISPSTYLE_WIREFRAME": "线架图",

        "IDS_PMI": "PMI",
        "IDS_PMI_show": "显示PMI",
        "IDS_PMI_hide": "隐藏PMI",

        "IDS_SLIDE_Plane1": '切割平面1',
        "IDS_SLIDE_Plane2": '切割平面2',
        "IDS_SLIDE_Plane3": '切割平面3',
        "IDS_SLIDE_LOOK": '查看剖面',
        "IDS_SLIDE_REVERSE": '反向剖切',
        "IDS_SLIDE_SHOW": '切面显示',
        "IDS_SLIDE_HIDE": '切面隐藏',
        "IDS_SLIDE_BOX": 'Box剖切',

        "IDS_TAG": "批注",
        "IDS_TAGSHOW": "显示批注",
        "IDS_TAGHIDE": "隐藏批注",
        "IDS_BACKCOLOR": "背景色",

        "IDS_TAG_DRAW": "绘图",
        "IDS_TAG_LINE": "线段",
        "IDS_TAG_LINE_ARROW": "箭头",
        "IDS_TAG_LINE_LINE": "直线",
        "IDS_TAG_AREA": "方形",
        "IDS_TAG_AREA_RECT": "矩形",
        "IDS_TAG_AREA_CIRCLE": "圆形",
        "IDS_TAG_TEXT": "文本",
        "IDS_TAG_TEXT2": "文本",
        "IDS_TAG_SAVE": "保存",
        "IDS_TAG_CANCEL": "取消",

        "IDS_PICTAG": "图片",
        "IDS_Sound": "语音",
        "IDS_Video": "视频",

        "IDS_TAG_COLOR": "颜色",
        "IDS_TAG_SIZE": "粗细",
        "IDS_TAG_FONT": "字体",

        "IDS_TAG_BEGIN": '请绘制图形',
        "IDS_TAG_PICK": '提示：请选择批注位置',

        "IDS_TAG_TIPS": '1、按住鼠标（或屏幕）绘制图形，松开鼠标（或屏幕）完成绘制。<br>2、绘制图形后，可以添加相应的文字信息。<br>3、图形线条的颜色和粗细在绘制图形后的底部工具栏设置，文字的大小可以在输入文本时设置。<br>4、文字和图形的位置可以在保存批注前进行移动。',
        "IDS_TAG_REPEAT": '请勿再次显示此信息',

        "IDS_PIC_TIPS": '1、点击图形区域选择所需要标记的位置。<br>2、在弹出窗口中上传批注的图片和输入相应的文本。',

        "IDS_CONFIG_NAME": '配置名称',
        "IDS_SURFACE_AREA": '表面积',
        "IDS_AREA": '面积',
        "IDS_TOTAL_SURFACE_AREA": '总面积',
        "IDS_CIRCUMFERENCE": '周长',
        "IDS_length": '长度',
        "IDS_BOUNDING_BOX": '包围盒',
        "IDS_BOUNDINGBOX_total": '全部',
        "IDS_VOLUMN": '体积',
        "IDS_TOTAL_VOLUMN": '总体积',
        "IDS_FACET": '指定面',
        "IDS_BODY": '指定实体',
        "IDS_TOTAL_AREA": '总面积',
        "IDS_TOTAL_Weight": '总重量',
        "IDS_Weight": '重量',
        "IDS_ANIMATE": '动画',
        "IDS_ANIMATE_CHANGE": '切换动画',
        "IDS_SPEED": '速度',
        "IDS_PLAY": '播放',
        "IDS_PAUSE": '暂停',

        "IDS_EXIT": '退出',
        "IDS_MODEL_ERROR": '模型加载错误！',

        "IDS_VOICE": '语音',
        "IDS_CAMERA": '拍摄',
        "IDS_PHOTO": "照片",
        "IDS_SELECT_A_FACE": "选择平面或曲面",
        "IDS_sure": "确定",
        "IDS_cancle": "取消",
        "IDS_clear": "清空",
        "IDS_back": "返回",
    };

    this.tables_en = {

        "IDS_ORBIT": "Orbit",
        "IDS_PAN": "Pan",
        "IDS_ZOOM": "Zoom",
        "IDS_ZOOM_ALL": "Slide",
        "IDS_ZOOM_WINDOW": "Select",
        "IDS_EXPLODE": "Explode",
        "IDS_FITTOVIEW": "Fit",
        "IDS_RESETCAMERA": "Reset",
        "IDS_FULLSCREEN": "Screen",
        "IDS_EXITFULLSCREEN": "Exit",
        "IDS_ANNOTATION": "Tag",
        "IDS_LINESTATE": "View Display",
        "IDS_HIDELINES": "View Display",
        "IDS_SHOWLINES": "View Hide",
        "IDS_SELECT": "Select",
        "IDS_MEASURE": "Measure",
        "IDS_MEASURETYPE_COORDINATE": "Coordinate",
        "IDS_MEASURETYPE_DISTANCE": "Distance",
        "IDS_MEASURETYPE_DIST": "Point",
        "IDS_MEASURETYPE_PointToLine": "Point-Line",
        "IDS_MEASURETYPE_PointToFace": "Point-Face",
        "IDS_MEASURETYPE_LineToLine": "Line",
        "IDS_MEASURETYPE_Lineargauge":"Linear",
        "IDS_MEASURETYPE_LineToFace": "Line-Face",
        "IDS_MEASURETYPE_CenterToPoint": "Center-P",
        "IDS_MEASURETYPE_CenterToLine": "Center-L",
        "IDS_MEASURETYPE_ANGLE": "Angle",
        "IDS_MEASURETYPE_FACE_DIST": "Face",
        "IDS_MEASURETYPE_FACE_ANGLE": "Angle",
        "IDS_MEASURETYPE_Line_ANGLE": "Line",
        "IDS_MEASURETYPE_LineFACE_ANGLE": "Line-surface",
        "IDS_MEASURETYPE_MEASURE_EDGES": "Line",
        "IDS_MEASURETYPE_MEASURE_EDGES2": "count-Line",//Continuous-Line
        "IDS_MEASURETYPE_MEASURE_EDGES3": "Line",
        "IDS_MEASURETYPE_MEASURE_Area": "count-Area",//Continuous-Area 连续面积//Continuous length、、proportion
        "IDS_MEASURETYPE_MEASURE_Proportion":"Proportion",
        "IDS_MEASURETYPE_HOLE_DIST": "Center",
        "IDS_MEASURETYPE_AxisToPoint": "Axis-Point",
        "IDS_MEASURETYPE_AxisToLine": "Axis-Line",
        "IDS_MEASURETYPE_AxisToFace": "Axis-Face",
        "IDS_MEASURETYPE_MEASURE_radius": "Radius",
        "IDS_MEASURETYPE_MEASURE_diameter": "Diameter",
        "IDS_DRAG": "Drag",
        "IDS_DRAGOP_SELECT": "Drag",
        "IDS_DRAGOP_RESTORE": "Restore",
        "IDS_DRAGOP_RESTOREAll": "Restore All",
        "IDS_DRAGOP_HIDE": "Hide",
        "IDS_DRAGOP_REVERSEVISIBILITY": "Reverse Visibility",
        "IDS_DRAGOP_SHOWALL": "Show All",
        "IDS_SECTIONVIEW": "Section",
        "IDS_SECTIONVIEW_base_app":"Section",
        "IDS_SECTIONVIEW_base": "Base Section",
        "IDS_SECTIONVIEW_advance": "Senior Section",
        "IDS_ANNOTATIONSETTINGHIDE": "Sign",
        "IDS_ANNOTATIONSETTINGSHOW": "Sign",
        "IDS_LIGHTEDITOR": "Light Editor",
        "IDS_RMB_ISOLATE": "Isolate",
        "IDS_RMB_HIDE": "Hide",
        "IDS_RMB_SHOWOutstand": "Isolate",
        "IDS_RMB_SHOWTransparent": "Transparent",
        "IDS_RMB_SHOWAlone": "Alone",
        "IDS_RMB_SHOWALL": "Show All",
        "IDS_RMB_PROPERTY": "Property",
        "IDS_RMB_PROPERTY_body": "Property-body",
        "IDS_RMB_PROPERTY_total": "Property-total",
        "IDS_custom_PROPERTY": "Custom Property",
        "IDS_routine_PROPERTY": "Routine Property",
        "IDS_PreviewPart": "Preview Part",
        "IDS_wei_smaterial": "Select materials",
        "IDS_wei_sentity": "Body weight",
        "IDS_wei_total": "total weight",
        "IDS_wei_commonMaterials": "Common materials",
        "IDS_wei_CustomMaterials": "Custom materials",
        "IDS_wei_materialCategory": "category:",
        "IDS_wei_materialName": "Name:",
        "IDS_wei_materialDensity": "Material density（g/cm³):",
        "IDS_MODELBROWSER": "Structure",
        "IDS_SelectBody":"Select Body",
        "IDS_MODELBROWSER_2D": "Layer",
        "IDS_PERSPECTIVE": "Persp",
        "IDS_Orthographic": "Orthographic",
        "IDS_Multitle": "Configuration/family table",
        "IDS_PMI": "PMI",
        "IDS_PMI_show": "PMI Show",
        "IDS_PMI_hide": "PMI Hide",

        "IDS_ZOOMWINDOW": "Zoom Window",
        "IDS_DISPSTYLE": "Display Style",
        "IDS_DISPSTYLE_SHADEDEDGES": "Edges",
        "IDS_DISPSTYLE_SHADED": "Shaded",
        "IDS_DISPSTYLE_HIDDENREMOVED": "H-Line",
        "IDS_DISPSTYLE_HIDDENVISIBLE": "S-Line",
        "IDS_DISPSTYLE_WIREFRAME": "Wireframe",

        "IDS_SLIDE_Plane1": 'Cutting plane1',
        "IDS_SLIDE_Plane2": 'Cutting plane2',
        "IDS_SLIDE_Plane3": 'Cutting plane3',
        
        "IDS_SLIDE_LOOK": 'Look Up',
        "IDS_SLIDE_REVERSE": 'Reverse',
        "IDS_SLIDE_SHOW": 'S-Slice',
        "IDS_SLIDE_HIDE": 'H-Slice',
        "IDS_SLIDE_BOX": 'Box ',

        "IDS_TAG": "Tag",
        "IDS_TAGSHOW": "Sign Show",
        "IDS_TAGHIDE": "Sign Hide",
        "IDS_BACKCOLOR": "BKColor",

        "IDS_TAG_DRAW": "Draw",
        "IDS_TAG_LINE": "Segment",
        "IDS_TAG_LINE_ARROW": "Arrow",
        "IDS_TAG_LINE_LINE": "Line",
        "IDS_TAG_AREA": "Square",
        "IDS_TAG_AREA_RECT": "Rectangle",
        "IDS_TAG_AREA_CIRCLE": "Circle",
        "IDS_TAG_TEXT": "Text",
        "IDS_TAG_TEXT2": "Text",
        "IDS_TAG_SAVE": "Save",
        "IDS_TAG_CANCEL": "Cancel",

        "IDS_PICTAG": "Picture",
        "IDS_Sound": "Sound",
        "IDS_Video": "Video",

        "IDS_TAG_COLOR": "Color",
        "IDS_TAG_SIZE": "Line Size",
        "IDS_TAG_FONT": "Font Size",

        "IDS_TAG_BEGIN": 'Tag To Begin Draw',
        "IDS_TAG_PICK": 'Tag To Pick Dot',

        "IDS_TAG_TIPS": '1.Press the left mouse button (or the screen) to drawing graphics. Release the left mouse button (or the screen) to finish drawing.<br>2.You can enter relevant words after finish drawing graphics.<br>3.You can change the color and line thickness of the graphics at the toolbar after finish drawing, and set the text size when typing words.<br>4.You can change the position of the words and the graphics before saving the postil.',
        "IDS_TAG_REPEAT": 'Don\'t show this message again.',

        "IDS_PIC_TIPS": 'Please click the view area to choose the position of the postil.<br>Don\'t show this message again.',

        "IDS_CONFIG_NAME": 'Configuration Name',
        "IDS_SURFACE_AREA": 'surface area',
        "IDS_AREA": 'Area',
        "IDS_TOTAL_SURFACE_AREA": 'Total Surface Area',
        "IDS_CIRCUMFERENCE": 'Circumference',
        "IDS_length": 'Length',
        "IDS_BOUNDING_BOX": 'Bounding Box',
        "IDS_BOUNDINGBOX_total": 'Total',
        "IDS_VOLUMN": 'Volume',
        "IDS_TOTAL_VOLUMN": 'Total Volume',
        "IDS_FACET": 'Facet',
 		"IDS_BODY": 'Body',        "IDS_TOTAL_AREA": 'Surface Area',
        "IDS_TOTAL_Weight": 'Total Weight',
        "IDS_Weight": 'Weight',
        "IDS_ANIMATE": 'animation',
        "IDS_ANIMATE_CHANGE": 'animation select',
        "IDS_SPEED": 'speed',
        "IDS_PLAY": 'play',
        "IDS_PAUSE": 'pause',
        "IDS_EXIT": 'exit',
        "IDS_MODEL_ERROR": 'model load error!',

        "IDS_VOICE": 'Voice',
        "IDS_CAMERA": 'Camera',
        "IDS_PHOTO": "Photo",
        "IDS_SELECT_A_FACE": "Select a face",
        "IDS_sure": "Sure",
        "IDS_cancle": "Cancle",
        "IDS_clear": "Clear",
        "IDS_back": "Back",
    };

    this.setEnTables = function () {

        _this.tables = _this.tables_en

    };

    this.setZhcnTables = function () {

        _this.tables = _this.tables_cn;

    };

    this.setEnCNTables = function () {

        _this.tables = {

            "IDS_ORBIT": "Orbit<br/>旋转",
            "IDS_PAN": "Pan<br/>平移",
            "IDS_ZOOM": "Zoom<br/>缩放",
            "IDS_EXPLODE": "Explode model<br/>分解模型",
            "IDS_FITTOVIEW": "Fit to view<br/>自适应缩放",
            "IDS_RESETCAMERA": "Reset Camera<br/>重置视角",
            "IDS_FULLSCREEN": "Full screen<br/>全屏显示",
            "IDS_EXITFULLSCREEN": "Exit full screen<br/>退出全屏",
            "IDS_ANNOTATION": "Annotation<br/>添加标注",
            "IDS_HIDELINES": "Hide Lines<br/>隐藏边线",
            "IDS_SHOWLINES": "Show Lines<br/>显示边线",
            "IDS_SELECT": "Select<br/>选取",
            "IDS_MEASURE": "Measure<br/>测量",
            "IDS_MEASURETYPE_DIST": "Point To Point<br/>点到点",
            "IDS_MEASURETYPE_ANGLE": "Angle<br/>角度",
            "IDS_MEASURETYPE_FACE_DIST": "Distance Between Faces<br/>面到面",
            "IDS_MEASURETYPE_FACE_ANGLE": "Angle Between Faces<br/>面夹角",
            "IDS_MEASURETYPE_MEASURE_EDGES": "Measure Edges<br/>线测量",
            "IDS_MEASURETYPE_MEASURE_EDGES3": "Measure Edges<br/>线段长度",
            "IDS_DRAG": "Drag<br/>拖动",
            "IDS_DRAGOP_SELECT": "Select & Drag<br/>选择拖动",
            "IDS_DRAGOP_RESTORE": "Select & Restore<br/>选择复位",
            "IDS_DRAGOP_HIDE": "Hide<br/>隐藏",
            "IDS_DRAGOP_REVERSEVISIBILITY": "Reverse Visibility<br/>显隐交换",
            "IDS_DRAGOP_SHOWALL": "Show All<br/>全部显示",
            "IDS_SECTIONVIEW": "Section View<br/>剖切",
            "IDS_ANNOTATIONSETTINGHIDE": "Hide Annotations<br/>隐藏标注",
            "IDS_ANNOTATIONSETTINGSHOW": "Show Annotations<br/>显示标注",
            "IDS_LIGHTEDITOR": "Light Editor<br/>灯光控制",
            "IDS_MODELBROWSER": "Model Browser<br/>模型浏览器",
            "IDS_PERSPECTIVE": "Perspective<br/>透视",
            "IDS_Orthographic": "Orthographic<br/>正交",
            "IDS_PMI": "PMI<br/>PMI",
            "IDS_DISPSTYLE": "Display Style<br/>显示样式",
            "IDS_DISPSTYLE_SHADEDEDGES": "Shaded With Edges<br/>带边线上色",
            "IDS_DISPSTYLE_SHADED": "Shaded<br/>上色",
            "IDS_DISPSTYLE_HIDDENREMOVED": "Hidden Lines Removed<br/>消除隐藏线",
            "IDS_DISPSTYLE_HIDDENVISIBLE": "Hidden Lines Visible<br/>隐藏线可见",
            "IDS_DISPSTYLE_WIREFRAME": "Wireframe<br/>线架图",
            "IDS_PICTAG": "Picture Tag<br/>图片标记",
            "IDS_Sound": "Sound<br/>语音",
            "IDS_Video": "Video<br/>视频"
        };

    };


    if (!language) {
        language = "en";
    }

    var tags = language.split('-');
    language = tags.length > 1 ? tags[0].toLowerCase() + '-' + tags[1].toUpperCase() : tags[0].toLowerCase();

    var supportedTags = ["en", "zh-HANS", "encn"];
    if (supportedTags.indexOf(language) === -1) {
        if (language.indexOf("zh-CN") > -1) language = "zh-HANS";
        else if (language.indexOf("zh-TW") > -1) language = "zh-HANS";
        else if (tags.length > 1 && supportedTags.indexOf(tags[0]) > -1) language = tags[0];
        else language = "en";
    }

    this.tables = {};

    switch (language) {
        case "en":
            this.setEnTables();
            break;
        case "zh-HANS":
            this.setZhcnTables();
            break;
        case "encn":
            this.setEnCNTables();
            break;
    }

};

window.ViewerVersion = 'v6.1.40'
console.log('viewer 版本：', ViewerVersion);