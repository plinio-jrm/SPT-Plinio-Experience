/* eslint-disable @typescript-eslint/brace-style */
import { BaseCondition } from "./baseCondition";

export class ConditionIsLevelAboveOne extends BaseCondition {
    constructor (
        private level: number
    ) { 
        super();
    }

    public check(): boolean {
        return this.level > 1;
    }
}