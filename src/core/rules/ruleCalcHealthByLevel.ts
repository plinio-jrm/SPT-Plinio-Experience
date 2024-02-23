/* eslint-disable @typescript-eslint/brace-style */
import { BaseRule } from "./baseRule";

export class RuleCalcHealthByLevel extends BaseRule {
    constructor (private level: number) {
        super();
    }

    public apply(value: any = undefined): number {
        super.apply(value);
        return this.level * this.core.getBotConfig().StatPerLevel;
    }
}