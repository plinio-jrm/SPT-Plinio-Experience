/* eslint-disable @typescript-eslint/brace-style */
import { BaseRule } from "./baseRule";
import { Utilities } from "../../utils/utilities";
import { IBaseSkill, Common } from "@spt-aki/models/eft/common/tables/IBotBase";

export class RuleCalcHealthBySkill extends BaseRule {
    constructor(
        private commonSkills: Common[],
        private skillName: string,
        private healthPerSkill: number
    ) {
        super();
    }

    public apply(value: number): number {
        let health: number = this.healthPerSkill;
        const healthSkill: IBaseSkill = Utilities.findSkill(this.commonSkills, this.skillName);
        if (healthSkill !== undefined)
            health *= Utilities.getSkillLevel(healthSkill.Progress);

        return value + health;
    }
}