/* eslint-disable @typescript-eslint/brace-style */
import { BaseRule } from "./baseRule";
import { Utilities } from "../../utils/utilities";

export class RuleFloorValue extends BaseRule {
    constructor() {
        super();
    }

    public apply(value: number): number {
        return Utilities.floorValue(value);
    }
}