/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/indent */
import { inject, injectable } from "tsyringe";

import { IBotBase, CurrentMax, IBaseSkill, BodyPartsHealth } from "@spt-aki/models/eft/common/tables/IBotBase";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

import { IBaseCharacterConfig } from "../common/IConfig";
import { ModCore } from "../core/modCore";
import { LogSystem } from "../core/logSystem";
import { ConstHealth, ConstSkillName, ConstInjectionName } from "../common/constants";

@injectable()
export class BaseCharacterHandler {
    constructor (
        @inject(ConstInjectionName.LOG_SYSTEM) protected logSystem: LogSystem,
        @inject(ConstInjectionName.MOD_CORE) protected core: ModCore,
        protected hasError: boolean
    ) { 
        hasError = false;
    }

    protected process(): void {
        if (this.core.isDifficultyNone())
            this.hasError = true;
    }

    //TODO: obtain the default health for each bot type to be take into account
    protected changeHealth(bodyParts: BodyPartsHealth, level: number, config: IBaseCharacterConfig): void {
        if (level == 1)
           return;
  
        this.addToHealth(bodyParts, level * config.StatPerLevel);
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
  
        this.addToHealth(bot.Health.BodyParts, healthStats + vitalityStats);
    }

    private addToHealth(bodyParts: BodyPartsHealth, value: number): void {
        let addHealth: number = value / 7;
        addHealth = this.core.applyDifficulty(addHealth);
        addHealth = this.floorValue(addHealth);

        this.addCurrentMax(bodyParts.Head.Health, addHealth);
        this.addCurrentMax(bodyParts.Chest.Health, addHealth);
        this.addCurrentMax(bodyParts.Stomach.Health, addHealth);
        this.addCurrentMax(bodyParts.RightArm.Health, addHealth);
        this.addCurrentMax(bodyParts.LeftArm.Health, addHealth);
        this.addCurrentMax(bodyParts.RightLeg.Health, addHealth);
        this.addCurrentMax(bodyParts.LeftLeg.Health, addHealth);
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

    protected toString(bot: IBotBase): void {
        this.logSystem.logFn(() => {
            const newLine: string = "\n| ";
            let message: string = newLine + "Bot(" + bot.Info.Nickname + ")[" + bot.Info.Side + "]";
            message += newLine + "Level: " + bot.Info.Level;
            const healthAmount: number = this.getHealthAmount(bot.Health.BodyParts);
            message += newLine + "Health: " + healthAmount;
      
            const vSkill: IBaseSkill = this.findSkill(bot.Skills.Common, ConstSkillName.VITALITY);
            const vLevel: number = (vSkill === undefined) ? 0 : this.getSkillLevel(vSkill.Progress);
      
            const hSkill: IBaseSkill = this.findSkill(bot.Skills.Common, ConstSkillName.HEALTH);
            const hLevel: number = (hSkill === undefined) ? 0 : this.getSkillLevel(hSkill.Progress);
      
            message += newLine + "Skills: Health("+hLevel+"), Vitality("+vLevel+")";
            return "|=> " + message;
        }, LogTextColor.MAGENTA);
    }

    private getHealthAmount(bodyParts: BodyPartsHealth): number {
        return bodyParts.Head.Health.Maximum + 
           bodyParts.Chest.Health.Maximum + 
           bodyParts.Stomach.Health.Maximum + 
           bodyParts.RightArm.Health.Maximum + 
           bodyParts.LeftArm.Health.Maximum + 
           bodyParts.RightLeg.Health.Maximum + 
           bodyParts.LeftLeg.Health.Maximum;
    }
}