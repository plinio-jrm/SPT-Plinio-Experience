/* eslint-disable @typescript-eslint/brace-style */
import { BaseRule } from "./baseRule";

export class RuleApplyDifficulty extends BaseRule {
    constructor() {
        super();
    }

    public apply(value: number): number {
        return this.core.applyDifficulty(value);
    }
}