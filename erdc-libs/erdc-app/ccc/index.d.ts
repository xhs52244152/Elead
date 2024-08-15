import { Component as VueComponent } from 'vue';

/**
 * 组件定义
 */
export interface ComponentDefinition {
    /**
     * 组件标签，也可以是一个合法的VueComponent（<component :is="component" />合法）
     */
    component: string | VueComponent
    /**
     * 唯一名称
     */
    name: string,
    /**
     * 远程资源地址
     */
    resourceUrl?: string,
    /**
     * 是否同步。同步组件在注册时加载。
     */
    sync?: boolean
}

export interface ValidatorRule {
    /**
     * 校验错误信息
     */
    message?: string,
    /**
     * 是否必填
     */
    required?: boolean,
    /**
     * 触发时机
     */
    trigger: ['input', 'blur'],
    /**
     * 校验类型
     */
    type: string,
    /**
     * 校验方法
     * @param rule - 校验规则
     * @param value - 校验值
     * @param message - 提示信息
     * @return {Promise<boolean>}  返回一个带校验是否通过的Promise
     */
    validator: (rule: Object, value: any, message: string) => Promise<boolean | Error>
}

/**
 * 组件
 */
export interface Component {
    /**
     * 组件的定义；全局注册的组件可以是个字符串。
     */
    definition: string | ComponentDefinition,
    /**
     * 组件在不同操作参数下的参数处理
     */
    operations?: Object,
    /**
     * 组件的配置项及展示方式。
     */
    properties?: Array<string | ComponentDefinition>,
    /**
     * 只读模式下的展示方式
     */
    readonly?: string | ComponentDefinition,
    /**
     * 组件必填校验
     * @param rule - 校验规则
     * @param value - 当前值
     * @param message - 必填信息
     */
    requiredValidator?: ValidatorRule
}

export interface Widget {
    /** 是否块级组件 **/
    block: boolean,
    /** 所属分类 **/
    category: 'basic' | 'high-order' | 'custom',
    /** 组件信息配置面板 **/
    configurations: Array<string>,
    /** 是否容器组件 **/
    container: boolean,
    /** 唯一标识 **/
    key: string,
    /** 部件名称 **/
    name: string,
    /** 是否不显示label **/
    nolabel: boolean,
    /** FamDynamicFormItemProps **/
    schema: Object
}