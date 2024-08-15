define(['erdcloud.router', 'erdcloud.store', 'erdc-kit'], function (router, store, ErdcKit) {
    const unRecordPath = ['/login', '/screenLock'];
    const defaultScreenLockeTime = 30 * 60; // 默认30分钟不操作,就进入锁屏
    let taskId = null;
    // 刷新就清掉时间,否则,我刚刷新进到系统里面，就直接进到锁屏界面了
    window.localStorage.removeItem('screenLockTimestamp');

    // 免密登录 或者 sso单点登录的时候，不需要进入锁屏界面，如果长时间不操作，直接触发401弹框，进入正常的登录界面
    let needScreenLock = !!window.localStorage.getItem('loginType') && !!window.ELCONF.screenLocker.active;

    /**
     * 获取锁屏状态
     */
    function lockingStatus(value) {
        if (needScreenLock) {
            let status = value || window.localStorage.getItem('screenLock');
            return status ? JSON.parse(status) : false;
        }
        return false;
    }

    /**
     * 去锁屏界面
     */
    function toLockScreen() {
        // 当不在锁屏界面,并且accessToken不为空的时候
        if (router.currentRoute.path.indexOf('screenLock') === -1 && store.state.app.accessToken) {
            window.LS.set(`${window.__currentAppName__}_screenLockFrom`, router.currentRoute.fullPath);
            router.push('/screenLock').then(() => {
                window.localStorage.setItem('screenLock', true);
                store.commit('app/PUSH_ACCESS_TOKEN', '');
                window.LS.remove('accessToken');
                window.LS.remove('screenLockTimestamp');
                stopActiveCheck();
            });
        }
    }
    /**
     * 从锁屏界面出来
     */
    function unlockScreen() {
        // 当在锁屏界面,并且accessToken为空的时候
        if (
            router.currentRoute.path.indexOf('screenLock') > -1 &&
            !store.state.app.accessToken &&
            window.localStorage.getItem('accessToken')
        ) {
            // 别的tab页签解锁了
            window.localStorage.removeItem('screenLock');
            let fromPath = window.localStorage.getItem(`${window.__currentAppName__}_screenLockFrom`) || '/';
            window.localStorage.removeItem(`${window.__currentAppName__}_screenLockFrom`);
            store.commit('app/PUSH_ACCESS_TOKEN', window.localStorage.getItem('accessToken'));
            return router.replace(fromPath).then(() => {
                startActiveCheck();
            });
        }
    }

    /**
     * 检查用户是否还在使用,如果没有使用超过设定时间，就进锁屏界面
     */
    function startActiveCheck() {
        taskId = window.setInterval(function () {
            let screenLockerOverTime = window.ELCONF?.screenLocker?.overtime || defaultScreenLockeTime; // 默认30分钟
            var current = new Date().getTime();
            var overTime = screenLockerOverTime * 1000;
            let timestampSystem = parseInt(window.localStorage.getItem('screenLockTimestamp') || current);
            if (current - timestampSystem > overTime && router.currentRoute.path.indexOf('screenLock') === -1) {
                toLockScreen();
            }
        }, 1000 * 3);
    }

    /**
     * 当已经进入锁屏页面了，就取消检查
     */
    function stopActiveCheck() {
        window.clearInterval(taskId);
    }

    if (needScreenLock) {
        window.onstorage = function (storageEvent) {
            if (storageEvent.key === 'screenLock') {
                if (
                    !lockingStatus(storageEvent.oldValue || 'false') &&
                    lockingStatus(storageEvent.newValue || 'false')
                ) {
                    // 从不锁屏进入到锁屏
                    toLockScreen();
                } else if (
                    lockingStatus(storageEvent.oldValue || 'false') &&
                    !lockingStatus(storageEvent.newValue || 'false') &&
                    window.localStorage.getItem('accessToken')
                ) {
                    // 从锁屏退出
                    unlockScreen();
                } else if (
                    lockingStatus(storageEvent.oldValue || 'false') &&
                    !lockingStatus(storageEvent.newValue || 'false') &&
                    !window.localStorage.getItem('accessToken')
                ) {
                    // 进入登陆页
                    ErdcKit.toLogin();
                }
            }
        };
        $('body').on(
            'mousemove',
            _.throttle(function () {
                if (lockingStatus() || unRecordPath.indexOf(router.currentRoute.path) > -1) {
                    return;
                }
                let timestamp = new Date().getTime();
                window.LS.set('screenLockTimestamp', timestamp);
            }, 300)
        );
        startActiveCheck();
    }

    return {
        toLockScreen,
        unlockScreen,
        lockingStatus
    };
});
