define(['fam:http', ELMP.resource('ppm-store/index.js')], function (famHttp, ppmStore) {
    let budgetAmountOp = {
        className: 'erd.cloud.ppm.budget.entity.BudgetAmount', // 预算金额className
        attrRawList: ({ amountValue, description, budgetOid, subjectOid, stageOid, taskOid }) => {
            return [
                { attrName: 'value', value: amountValue }, // 金额
                { attrName: 'description', value: description }, // 金额描述
                { attrName: 'contextRef', value: budgetOid }, // 所属预算
                { attrName: 'holderRef', value: subjectOid }, // 所属科目
                { attrName: 'stageRef', value: stageOid }, // 所属阶段
                { attrName: 'objectRef', value: taskOid } // 所属业务对象（项目具体任务oid）
            ];
        }
    };
    let utils = {
        // 获取金额的类型oid（预算、支出）
        findAmountType: async () => {
            let refObj = ppmStore.state?.projectInfo?.containerRef || {};
            let res = await famHttp({
                url: '/fam/type/typeDefinition/findAccessTypes',
                params: {
                    typeName: 'erd.cloud.ppm.budget.entity.BudgetAmount',
                    containerRef: `OR:${refObj.key}:${refObj.id}`,
                    subTypeEnum: 'LEAF_NODE',
                    accessControl: false
                },
                appName: 'PPM'
            });
            if (!res.success) {
                return [];
            }
            return res.data || [];
        },

        // 创建or修改 预算的金额对象
        saveOrUpdateBudgetAmount: async (params = []) => {
            let res = await famHttp({
                url: '/ppm/saveOrUpdate',
                method: 'POST',
                className: budgetAmountOp.className,
                data: {
                    className: budgetAmountOp.className,
                    rawDataVoList: (params || []).map((r) => {
                        return {
                            className: budgetAmountOp.className,
                            typeReference: r.typeReference, // 修改时可不传
                            containerRef: r.containerRef, // 修改时可不传
                            oid: r.oid, // 预算金额对象的oid，空值时=创建，有值时=修改
                            attrRawList: budgetAmountOp.attrRawList({
                                amountValue: r.amountValue,
                                description: r.description,
                                budgetOid: r.budgetOid,
                                subjectOid: r.subjectOid,
                                stageOid: r.stageOid,
                                taskOid: r.taskOid
                            })
                        };
                    })
                }
            });
            if (!res.success) {
                return false;
            }
            return res.data;
        },
        // 创建预算金额
        createBudgetAmount: async ({
            amountValue,
            description,
            typeReference,
            containerRef,
            budgetOid,
            subjectOid,
            stageOid,
            taskOid
        }) => {
            let res = await famHttp({
                url: '/ppm/create',
                method: 'POST',
                data: {
                    className: budgetAmountOp.className,
                    typeReference,
                    containerRef,
                    attrRawList: budgetAmountOp.attrRawList({
                        amountValue,
                        description,
                        budgetOid,
                        subjectOid,
                        stageOid,
                        taskOid
                    })
                }
            });
            if (!res.success) {
                return false;
            }
            return res.data;
        },
        // 修改预算金额
        updateBudgetAmount: async ({
            amountOid,
            amountValue,
            description,
            budgetOid,
            subjectOid,
            stageOid,
            taskOid
        }) => {
            let res = await famHttp({
                url: '/ppm/update',
                method: 'POST',
                data: {
                    className: budgetAmountOp.className,
                    oid: amountOid,
                    attrRawList: budgetAmountOp.attrRawList({
                        amountValue,
                        description,
                        budgetOid,
                        subjectOid,
                        stageOid,
                        taskOid
                    })
                }
            });
            if (!res.success) {
                return false;
            }
            return res.data;
        },
        // 获取某个时间段的所有月份（start, end都为dayjs时间对象）
        getAllMonths(start, end) {
            let current = start.startOf('month');
            const months = [];

            while (current.isBefore(end) || current.isSame(end, 'month')) {
                months.push(current.clone());
                current = current.add(1, 'month');
            }

            return months;
        },
        // 格式化金额的单位
        formatAmountUnit(value, unitLabel) {
            if (!value) {
                return value;
            }
            return String(value || '') + String(unitLabel || '');
        }
    };

    return utils;
});
