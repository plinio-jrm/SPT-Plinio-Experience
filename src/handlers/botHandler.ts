/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/indent */
import { inject, injectable } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";

import { IGetBodyResponseData } from "@spt-aki/models/eft/httpResponse/IGetBodyResponseData";
import { IBotBase, Health, CurrentMax, IBaseSkill, BodyPartsHealth } from "@spt-aki/models/eft/common/tables/IBotBase";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

import { IBotConfig } from "../common/IConfig";
import { ConstHealth, ConstSkillName } from "../common/constants";
import { ModCore } from "../core/modCore";

@injectable()
export class BotHandler {
   private responseData: IGetBodyResponseData<IBotBase>;
   private config: IBotConfig;

   constructor(
      @inject("WinstonLogger") private logger: ILogger,
      @inject("PlinioCore") private core: ModCore
   ) { 
      this.config = core.getBotConfig();
   }

   public handle(output: string): string {
      this.responseData = JSON.parse(output);
      this.process();
      return JSON.stringify(this.responseData);
   }

   private process(): void {
      if (this.core.isDifficultyNone())
         return;
      if (this.responseData.data === null) {
         this.logger.info("No bot generated! ignoring PlinioJRM-Experience bot's settings");
         return;
      }
      if (this.responseData.data.length == 0)
         return;

      for (const botIndex in this.responseData.data) {
         const bot: IBotBase = this.responseData.data[botIndex];
         this.processBot(bot);
      }
   }

   private processBot(bot: IBotBase): void {
      this.changeHealth(bot.Health, bot.Info.Level);
      this.applyMetabolism(bot);
      this.applyVitalityHealth(bot);

      this.toString(bot);
   }

   private changeHealth(health: Health, level: number): void {
      if (level == 1)
         return;

      let statToIncrease: number = level * this.config.StatPerLevel;
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

   private applyMetabolism(bot: IBotBase) {
      const skill: IBaseSkill = this.findSkill(bot.Skills.Common, ConstSkillName.METABOLISM);
      if (skill === undefined)
         return;
      let statToIncrease: number = this.getSkillLevel(skill.Progress) * this.config.StatPerSkill.Metabolism;
      statToIncrease = this.core.applyDifficulty(statToIncrease);
      statToIncrease = this.floorValue(statToIncrease);

      this.changeCurrentMax(bot.Health.Energy, ConstHealth.FOOD_WATER + statToIncrease);
      this.changeCurrentMax(bot.Health.Hydration, ConstHealth.FOOD_WATER + statToIncrease);
   }

   private applyVitalityHealth(bot: IBotBase) {
      const healthSkill = this.findSkill(bot.Skills.Common, ConstSkillName.HEALTH);
      let healthStats: number = this.config.StatPerSkill.Health;
      if (healthSkill !== undefined)
         healthStats *= this.getSkillLevel(healthSkill.Progress);

      const vitalitySkill = this.findSkill(bot.Skills.Common, ConstSkillName.VITALITY);
      let vitalityStats = this.config.StatPerSkill.Vitality;
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

   private toString(bot: IBotBase): void {
      if (this.config.DisplayBotNewHealthOnServer == false)
         return;

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

      this.logger.logWithColor("|=> " + message, LogTextColor.MAGENTA);
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