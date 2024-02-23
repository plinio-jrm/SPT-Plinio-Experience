/* eslint-disable @typescript-eslint/brace-style */
import { injectable, inject } from "tsyringe";

import { BaseRule } from "./rules/baseRule";
import { IQueue, Queue } from "../utils/queue";
import { ModCore } from "../core/modCore";
import { ConstInjectionName, ConstCodes, ConstMod } from "../common/constants";
import { LogSystem } from "../core/logSystem";
import { BaseCondition } from "./conditions/baseCondition";

@injectable()
export class RuleSystem implements IRuleSystem {
    protected conditions: [string, IQueue<BaseCondition>];
    protected ruleContainer: RuleContainer;
    protected conditionContainer: ConditionContainer;

    constructor( 
        @inject(ConstInjectionName.MOD_CORE) protected core: ModCore,
        @inject(ConstInjectionName.LOG_SYSTEM) protected logSystem: LogSystem
    ) {
        this.ruleContainer = new RuleContainer(logSystem);
        this.conditionContainer = new ConditionContainer(logSystem);
    }

    public addCondition(category: string, condition: BaseCondition): IRuleSystem { 
        this.conditionContainer.add(category, condition.setCore(this.core));
        return this;
    }

    public addRule(category: string, rule: BaseRule): IRuleSystem {
        this.ruleContainer.add(category, rule.setCore(this.core));
        return this;
    }

    public applyRules<T>(): T {
        return undefined;
    }

    protected checkConditions(category: string): boolean {
        const conditions: IQueue<BaseCondition> =  this.conditionContainer.getByCategory(category);
        while (conditions.size() > 0) {
            const condition: BaseCondition = conditions.dequeue();
            if (condition.check() == false)
                return false;
        }
        return true;
    }
}

export interface IRuleSystem {
    addCondition(owner: string, condition: BaseCondition): IRuleSystem;
    addRule(owner: string, rule: BaseRule): IRuleSystem;
    applyRules<T>(): T;
}

export class BaseContainer<T> implements IBaseContainer<T> {
    protected container: Record<string, IQueue<T>>;

    constructor (
        protected logSystem: LogSystem
    ) {
        this.container = {};
    }

    public add(category: string, item: T): void {
        if (this.containsCategory(category) == false)
            this.addCategory(category);

        const innerContainer: IQueue<T> = this.container[category];
        if (innerContainer === undefined) {
            this.logSystem.logCode(ConstCodes.RULE_SYSTEM_001, ConstMod.RULE_CANT_ADD_RULE);
            return;
        }

        innerContainer.enqueue(item);
    }

    public addCategory(category: string): void {
        const queue: IQueue<T> = new Queue<T>();
        this.container[category] = queue;
    }

    public getByCategory(category: string): IQueue<T> | undefined {
        if (Object.keys(this.container).length == 0)
            return undefined;
        return this.container[category];
    }

    private containsCategory(category: string): boolean {
        if (Object.keys(this.container).length == 0)
            return false;

        const categories: string[] = Object.keys(this.container);
        for (const containerCategory in categories) {
            if (containerCategory.toLowerCase() === category.toLowerCase())
                return true;
        }

        return false;
    }
}

export interface IBaseContainer<T> {
    add(category: string, item: T): void;
    addCategory(category: string): void;
    getByCategory(category: string): IQueue<T> | undefined
}

export class RuleContainer extends BaseContainer<BaseRule> { }
export class ConditionContainer extends BaseContainer<BaseCondition> { }