/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/indent */
import { inject, injectable } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IBotBase, Health, CurrentMax, IBaseSkill, BodyPartsHealth } from "@spt-aki/models/eft/common/tables/IBotBase";

import { IBaseCharacterConfig } from "../common/IConfig";
import { ModCore } from "../core/modCore";
import { ConstHealth, ConstSkillName } from "../common/constants";

@injectable()
export class BaseCharacterHandler {
    constructor (
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("PlinioCore") protected core: ModCore,
        protected hasError: boolean
    ) { 
        hasError = false;
    }

    protected process(): void {
        if (this.core.isDifficultyNone())
            this.hasError = true;
    }

    protected changeHealth(health: Health, level: number, config: IBaseCharacterConfig): void {
        if (level == 1)
           return;
  
        let statToIncrease: number = level * config.StatPerLevel;
        statToIncrease = statToIncrease / 7;
        statToIncrease = this.core.applyDifficulty(statToIncrease);
        statToIncrease = this.floorValue(statToIncrease);
        
        this.addCurrentMax(health.BodyParts.Head.Health, statToIncrease);
        this.addCurrentMax(health.BodyParts.Chest.Health, statToIncrease);
        this.addCurrentMax(health.BodyParts.Stomach.Health, statToIncrease);
        this.addCurrentMax(health.BodyParts.RightArm.Health, statToIncrease);
        this.addCurrentMax(health.BodyParts.LeftArm.Health, statToIncrease);
        this.addCurrentMax(health.BodyParts.RightLeg.Health, statToIncrease);
        this.addCurrentMax(health.BodyParts.LeftLeg.Health, statToIncrease);
    }

    protected applyMetabolism(bot: IBotBase, config: IBaseCharacterConfig): void {
        const skill: IBaseSkill = this.findSkill(bot.Skills.Common, ConstSkillName.METABOLISM);
        if (skill === undefined)
           return;

        let statToIncrease: number = this.getSkillLevel(skill.Progress) * config.StatPerSkill.Metabolism;
        statToIncrease = this.core.applyDifficulty(statToIncrease);
        statToIncrease = this.floorValue(statToIncrease);
  
        this.changeCurrentMax(bot.Health.Energy, ConstHealth.FOOD_WATER + statToIncrease);
        this.changeCurrentMax(bot.Health.Hydration, ConstHealth.FOOD_WATER + statToIncrease);
    }

    protected applyVitalityHealth(bot: IBotBase, config: IBaseCharacterConfig): void {
        const healthSkill = this.findSkill(bot.Skills.Common, ConstSkillName.HEALTH);
        let healthStats: number = config.StatPerSkill.Health;
        if (healthSkill !== undefined)
           healthStats *= this.getSkillLevel(healthSkill.Progress);
  
        const vitalitySkill = this.findSkill(bot.Skills.Common, ConstSkillName.VITALITY);
        let vitalityStats = config.StatPerSkill.Vitality;
        if (vitalitySkill !== undefined)
           vitalityStats *= this.getSkillLevel(vitalitySkill.Progress);
  
        let statToIncrease = (healthStats + vitalityStats) / 7;
        statToIncrease = this.core.applyDifficulty(statToIncrease);
        statToIncrease = this.floorValue(statToIncrease);
  
        this.addCurrentMax(bot.Health.BodyParts.Head.Health, statToIncrease);
        this.addCurrentMax(bot.Health.BodyParts.Chest.Health, statToIncrease);
        this.addCurrentMax(bot.Health.BodyParts.Stomach.Health, statToIncrease);
        this.addCurrentMax(bot.Health.BodyParts.RightArm.Health, statToIncrease);
        this.addCurrentMax(bot.Health.BodyParts.LeftArm.Health, statToIncrease);
        this.addCurrentMax(bot.Health.BodyParts.RightLeg.Health, statToIncrease);
        this.addCurrentMax(bot.Health.BodyParts.LeftLeg.Health, statToIncrease);
    }

    private findSkill(skills: any, name: string): IBaseSkill {
        if (skills === undefined || skills.length == 0)
           return undefined;
  
        for (const index in skills) {
           const skill: IBaseSkill = skills[index];
           if (skill.Id === name)
              return skill;
        }
  
        return undefined;
    }

    private changeCurrentMax(hp: CurrentMax, value: number): void {
        hp.Current = value;
        hp.Maximum = value;
    }

    private addCurrentMax(hp: CurrentMax, value: number): void {
        hp.Current += value;
        hp.Maximum += value;
    }

    private getSkillLevel(exp: number): number {
        return Math.floor(exp / 100);
    }

    private floorValue(value: number): number {
        return Math.floor(value);
    }
}