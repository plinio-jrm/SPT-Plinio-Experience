/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/indent */
import { inject, injectable } from "tsyringe";

import { IGetBodyResponseData } from "@spt-aki/models/eft/httpResponse/IGetBodyResponseData";
import { IBotBase, Health } from "@spt-aki/models/eft/common/tables/IBotBase";

import { IBotConfig } from "../common/IConfig";
import { ConstInjectionName, ConstSkillName } from "../common/constants";
import { ModCore } from "../core/modCore";
import { LogSystem } from "../core/logSystem";
import { BaseCharacterHandler } from "./baseCharacterHandler";
import { HealthRuleSystem } from "../core/healthRuleSystem";

import { RuleDivisionBy } from "../core/rules/ruleDivisionBy";
import { RuleFloorValue } from "../core/rules/ruleFloorValue";
import { RuleCalcHealthBySkill } from "../core/rules/ruleCalcHealthBySkill";
import { RuleApplyDifficulty } from "../core/rules/ruleApplyDifficulty";

@injectable()
export class BotHandler extends BaseCharacterHandler{
   private responseData: IGetBodyResponseData<IBotBase>;
   private config: IBotConfig;

   constructor(
      @inject(ConstInjectionName.LOG_SYSTEM) protected logSystem: LogSystem,
      @inject(ConstInjectionName.MOD_CORE) protected core: ModCore,
      @inject(ConstInjectionName.HEALTH_RULE_SYSTEM) protected ruleSystem: HealthRuleSystem
   ) { 
      super(logSystem, core, ruleSystem, false);
      this.config = core.getBotConfig();
   }

   public handle(output: string): string {
      this.responseData = JSON.parse(output);
      this.process();
      return JSON.stringify(this.responseData);
   }

   protected process(): void {
      super.process(() => {}, () => {
         if (this.hasError)
            return;
         
         if (this.responseData.data === null) {
            this.logSystem.log("No bot generated! ignoring PlinioJRM-Experience bot's settings");
            return;
         }
         if (this.responseData.data.length == 0)
            return;

         for (const botIndex in this.responseData.data) {
            const bot: IBotBase = this.responseData.data[botIndex];
            this.processBot(bot);
         }
      });
   }

   private processBot(bot: IBotBase): void {
      this.ruleSystem.setHealthOfBotType(bot.Info.Settings.Role.toLowerCase());
      this.defineRules(bot);
      const health: Health = this.ruleSystem.applyRules();
      health.UpdateTime = bot.Health.UpdateTime;
      bot.Health = health;

      /*
      this.changeHealth(bot.Health.BodyParts, bot.Info.Level, this.config);
      this.applyMetabolism(bot, this.config);
      this.applyVitalityHealth(bot, this.config);
      */
      this.toString(bot);
   }

   private defineRules(bot: IBotBase): void {
      this.ruleSystem
         .addRule(ConstSkillName.HEALTH, new RuleDivisionBy(7))
         .addRule(ConstSkillName.HEALTH, new RuleApplyDifficulty())
         .addRule(ConstSkillName.HEALTH, new RuleFloorValue());

      this.ruleSystem
         .addRule(ConstSkillName.VITALITY, 
            new RuleCalcHealthBySkill(bot.Skills.Common, ConstSkillName.HEALTH, this.config.StatPerSkill.Health)
         )
         .addRule(ConstSkillName.VITALITY, 
            new RuleCalcHealthBySkill(bot.Skills.Common, ConstSkillName.VITALITY, this.config.StatPerSkill.Vitality)
         );

      this.ruleSystem
         .addRule(
            ConstSkillName.METABOLISM, 
            new RuleCalcHealthBySkill(bot.Skills.Common, ConstSkillName.METABOLISM, this.config.StatPerSkill.Metabolism)
         )
         .addRule(ConstSkillName.METABOLISM, new RuleApplyDifficulty())
         .addRule(ConstSkillName.METABOLISM, new RuleFloorValue());
   }
}