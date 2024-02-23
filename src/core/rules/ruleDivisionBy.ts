/* eslint-disable @typescript-eslint/brace-style */
import { BaseRule } from "./baseRule";

export class RuleDivisionBy extends BaseRule {
    constructor (private divideBy: number) {
        super();
    }

    public apply(value: number): number {
        return value / this.divideBy;
    }
}