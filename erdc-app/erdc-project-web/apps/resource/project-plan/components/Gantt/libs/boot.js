// __CreateJSPath = function (js) {
//     var scripts = document.getElementsByTagName('script');
//     var path = '';
//     for (var i = 0, l = scripts.length; i < l; i++) {
//         var src = scripts[i].src;
//         if (src.indexOf(js) != -1) {
//             var ss = src.split(js);
//             path = ss[0];
//             break;
//         }
//     }
//     var href = location.href;
//     href = href.split('#')[0];
//     href = href.split('?')[0];
//     var ss = href.split('/');
//     ss.length = ss.length - 1;
//     href = ss.join('/');

//     if (path.indexOf('http:') == -1 && path.indexOf('file:') == -1) {
//         path = href + '/' + path;
//     }
//     return path;
// };

// var bootPATH = __CreateJSPath("boot.js");
// const bootPATH = '/apps/resource/project-plan/components/Gantt/libs/';

let runScript = function (url, callback) {
    let extName = url?.split('.')?.slice(-1);
    if (extName?.[0] === 'js') {
        let $script = document.createElement('script');
        $script.setAttribute('type', 'text/javascript');
        $script.setAttribute('src', url + '?ver=__VERSION__');
        if ($script.readyState) {
            if ($script.readyState === 'complete' || $script.readyState === 'loaded') {
                callback && callback();
            }
        } else {
            $script.onload = function () {
                callback && callback();
            };
        }
        document.body.appendChild($script);
    } else if (extName?.[0] === 'css') {
        let $link = document.createElement('link');
        $link.setAttribute('type', 'text/css');
        $link.setAttribute('rel', 'stylesheet');
        $link.setAttribute('href', url + '?ver=__VERSION__');
        document.body.appendChild($link);
        callback && callback();
    } else {
        // Empty
    }
};

// 获取当前语言环境
let langMap = {
    EN: `${ELMP.resource('project-plan/components/Gantt/libs/miniui/locale/en_US.js')}`,
    CN: `${ELMP.resource('project-plan/components/Gantt/libs/miniui/locale/zh_CN.js')}`
};
let languageFilePath = langMap[window.currentLang] || langMap['CN'];

let urls = [
    `${ELMP.resource('project-plan/components/Gantt/libs/jquery-1.11.2.js')}`,
    `${ELMP.resource('project-plan/components/Gantt/libs/miniui/miniui.js')}`,
    languageFilePath,
    `${ELMP.resource('project-plan/components/Gantt/libs/miniui/themes/icons.css')}`,
    `${ELMP.resource('project-plan/components/Gantt/libs/miniui/themes/default/miniui.css')}`,

    // `/${ELMP.resource('project-plan/components/Gantt/libs/plusproject/App.css')}`,
    // `/${ELMP.resource('project-plan/components/Gantt/libs/plusproject/ProjectApi.js')}`,
    // `/${ELMP.resource('project-plan/components/Gantt/libs/plusproject/ProjectServices.js')}`,
    // `/${ELMP.resource('project-plan/components/Gantt/libs/plusproject/ProjectApp.js')}`,

    // `/${ELMP.resource('project-plan/components/Gantt/libs/plusproject/column/StatusColumn.js')}`,
    // `/${ELMP.resource('project-plan/components/Gantt/libs/plusproject/menu/TableMenu.js')}`,
    // `/${ELMP.resource('project-plan/components/Gantt/libs/plusproject/window/ProjectWindow.js')}`,
    // `/${ELMP.resource('project-plan/components/Gantt/libs/plusproject/window/TaskWindow.js')}`,
    // `/${ELMP.resource('project-plan/components/Gantt/libs/plusproject/window/ResourcesWindow.js')}`,
    // `/${ELMP.resource('project-plan/components/Gantt/libs/plusproject/window/ProjectListWindow.js')}`,
    `${ELMP.resource('project-plan/components/Gantt/libs/plusproject/plugins/ProgressLine.js')}`
    // `/${ELMP.resource('project-plan/components/Gantt/libs/plusproject/plugins/dom-to-image.js')}`,
];

let runner = _.reduceRight(
    urls,
    function (prev, current) {
        return function () {
            runScript(current, prev);
        };
    },
    runScript
);
runner();

//miniui
// document.write('<script src="' + bootPATH + 'jquery-1.11.2.js" type="text/javascript"></script>');
// document.write('<script src="' + bootPATH + 'miniui/miniui.js" type="text/javascript"></script>');
// document.write('<script src="' + bootPATH + 'miniui/locale/zh_CN.js" type="text/javascript"></script>');
// document.write('<link href="' + bootPATH + 'miniui/themes/icons.css" rel="stylesheet" type="text/css" />');
// document.write('<link href="' + bootPATH + 'miniui/themes/default/miniui.css" rel="stylesheet" type="text/css" />');
// //document.write('<link href="' + bootPATH + 'miniui/themes/blue/skin.css" rel="stylesheet" type="text/css" />');

// //project
// document.write('<link href="' + bootPATH + 'plusproject/App.css" rel="stylesheet" type="text/css" />');
// document.write('<script src="' + bootPATH + 'plusproject/ProjectApi.js" type="text/javascript"></script>');
// document.write('<script src="' + bootPATH + 'plusproject/ProjectServices.js" type="text/javascript"></script>');
// document.write('<script src="' + bootPATH + 'plusproject/ProjectApp.js" type="text/javascript"></script>');

// document.write('<script src="' + bootPATH + 'plusproject/column/StatusColumn.js" type="text/javascript"></script>');
// document.write('<script src="' + bootPATH + 'plusproject/menu/TableMenu.js" type="text/javascript"></script>');
// document.write('<script src="' + bootPATH + 'plusproject/window/ProjectWindow.js" type="text/javascript"></script>');
// document.write('<script src="' + bootPATH + 'plusproject/window/TaskWindow.js" type="text/javascript"></script>');
// document.write('<script src="' + bootPATH + 'plusproject/window/ResourcesWindow.js" type="text/javascript"></script>');
// document.write('<script src="' + bootPATH + 'plusproject/window/ProjectListWindow.js" type="text/javascript"></script>');
// document.write('<script src="' + bootPATH + 'plusproject/plugins/ProgressLine.js" type="text/javascript"></script>');
// document.write('<script src="' + bootPATH + 'plusproject/plugins/dom-to-image.js" type="text/javascript"></script>');
