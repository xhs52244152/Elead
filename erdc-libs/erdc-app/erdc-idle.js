define(['erdcloud.router'], function (router) {
    class ErdcIdle {
        constructor() {
            this.idleTasks = [];
            this._ready = false;
        }

        registerIdleTasks(tasks, timer = 500, timeout = 10000) {
            tasks.forEach((task) => {
                this.registerIdleTask(task, timer, timeout);
            });
        }

        registerIdleTask(task, timer = 500, timeout = 10000) {
            const taskDes = {
                task,
                timer,
                timeout
            };
            if (this._ready) {
                this.runIdleTask(taskDes).then(() => {
                    // do nothing
                });
            } else {
                this.idleTasks.push(taskDes);
            }
        }

        runIdleTasks() {
            let i = 0;
            while (i < this.idleTasks.length) {
                this.runIdleTask(this.idleTasks[i]).then(() => {
                    this.idleTasks.splice(i, 1);
                });
                i++;
            }
            this.idleTasks = [];
        }

        runIdleTask(taskDec) {
            const { task, timer, timeout } = taskDec;
            return new Promise((resolve) => {
                const run = () => {
                    task();
                    resolve();
                };
                if (window.requestIdleCallback) {
                    window.requestIdleCallback(run, { timeout: timeout });
                } else {
                    setTimeout(run, timer);
                }
            });
        }
    }

    const globalIdle = new ErdcIdle();

    router.onReady(() => {
        const run = () => {
            globalIdle.runIdleTasks();
            globalIdle._ready = true;
        };
        setTimeout(() => {
            if (window.requestIdleCallback) {
                window.requestIdleCallback(run, { timeout: 2400 });
            } else {
                setTimeout(run, 800);
            }
        }, 800);
    });

    return {
        runIdleTasks: globalIdle.runIdleTasks.bind(globalIdle),
        registerIdleTasks: globalIdle.registerIdleTasks.bind(globalIdle),
        registerIdleTask: globalIdle.registerIdleTask.bind(globalIdle)
    };
});
