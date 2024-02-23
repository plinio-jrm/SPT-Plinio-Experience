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
import { HealthRuleSystem } from "../core/healthRuleSystem";
import { Utilities } from "../utils/utilities";

@injectable()
export class BaseCharacterHandler {
    constructor (
        @inject(ConstInjectionName.LOG_SYSTEM) protected logSystem: LogSystem,
        @inject(ConstInjectionName.MOD_CORE) protected core: ModCore,
        @inject(ConstInjectionName.HEALTH_RULE_SYSTEM) protected ruleSystem: HealthRuleSystem,
        protected hasError: boolean
    ) { 
        hasError = false;
    }

    protected process(beforeProcess: () => void = undefined, afterProcess: () => void = undefined): void {
        beforeProcess();
        if (this.core.isDifficultyNone())
            this.hasError = true;
        afterProcess();
    }
    /*
    //TODO: obtain the default health for each bot type to be take into account
    protected changeHealth(bodyParts: BodyPartsHealth, level: number, config: IBaseCharacterConfig): void {
        if (level == 1)
           return;
  
        
        this.addToHealth(bodyParts, level * config.StatPerLevel);
    }
    
    //TODO: repurposed as Rule - Remove it!
    protected applyMetabolism(bot: IBotBase, config: IBaseCharacterConfig): void {
        const skill: IBaseSkill = Utilities.findSkill(bot.Skills.Common, ConstSkillName.METABOLISM);
        if (skill === undefined)
           return;

        let statToIncrease: number = Utilities.getSkillLevel(skill.Progress) * config.StatPerSkill.Metabolism;
        statToIncrease = this.core.applyDifficulty(statToIncrease);
        statToIncrease = Utilities.floorValue(statToIncrease);
  
        Utilities.changeCurrentMax(bot.Health.Energy, ConstHealth.FOOD_WATER + statToIncrease);
        Utilities.changeCurrentMax(bot.Health.Hydration, ConstHealth.FOOD_WATER + statToIncrease);
    }

    //TODO: repurposed as Rule - Remove it!
    private addToHealth(bodyParts: BodyPartsHealth, value: number): void {
        let addHealth: number = value / 7;
        addHealth = this.core.applyDifficulty(addHealth);
        addHealth = Utilities.floorValue(addHealth);

        Utilities.addCurrentMax(bodyParts.Head.Health, addHealth);
        Utilities.addCurrentMax(bodyParts.Chest.Health, addHealth);
        Utilities.addCurrentMax(bodyParts.Stomach.Health, addHealth);
        Utilities.addCurrentMax(bodyParts.RightArm.Health, addHealth);
        Utilities.addCurrentMax(bodyParts.LeftArm.Health, addHealth);
        Utilities.addCurrentMax(bodyParts.RightLeg.Health, addHealth);
        Utilities.addCurrentMax(bodyParts.LeftLeg.Health, addHealth);
    }

    //TODO: repurposed as Rule - Remove it!
    protected applyVitalityHealth(bot: IBotBase, config: IBaseCharacterConfig): void {
        const healthSkill = Utilities.findSkill(bot.Skills.Common, ConstSkillName.HEALTH);
        let healthStats: number = config.StatPerSkill.Health;
        if (healthSkill !== undefined)
           healthStats *= Utilities.getSkillLevel(healthSkill.Progress);
  
        const vitalitySkill = Utilities.findSkill(bot.Skills.Common, ConstSkillName.VITALITY);
        let vitalityStats = config.StatPerSkill.Vitality;
        if (vitalitySkill !== undefined)
           vitalityStats *= Utilities.getSkillLevel(vitalitySkill.Progress);
  
        this.addToHealth(bot.Health.BodyParts, healthStats + vitalityStats);
    }
    */

    protected toString(bot: IBotBase): void {
        this.logSystem.logFn(() => {
            const newLine: string = "\n| ";
            let message: string = newLine + "Bot(" + bot.Info.Nickname + ")[" + bot.Info.Side + "]";
            message += newLine + "Level: " + bot.Info.Level;
            message += newLine + "Role: " + bot.Info.Settings.Role;
            const healthAmount: number = this.getHealthAmount(bot.Health.BodyParts);
            message += newLine + "Health: " + healthAmount;
      
            const vSkill: IBaseSkill = Utilities.findSkill(bot.Skills.Common, ConstSkillName.VITALITY);
            const vLevel: number = (vSkill === undefined) ? 0 : Utilities.getSkillLevel(vSkill.Progress);
      
            const hSkill: IBaseSkill = Utilities.findSkill(bot.Skills.Common, ConstSkillName.HEALTH);
            const hLevel: number = (hSkill === undefined) ? 0 : Utilities.getSkillLevel(hSkill.Progress);
      
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