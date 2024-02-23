/* eslint-disable @typescript-eslint/brace-style */
import { inject, injectable } from "tsyringe";

import { ConstInjectionName, ConstHealth, ConstMod, ConstSkillName } from "../common/constants";
import { LogSystem } from "../core/logSystem";
import { RuleSystem } from "./ruleSystem";
import { BaseRule } from "./rules/baseRule";
import { ModCore } from "../core/modCore";
import { Utilities, Converter } from "../utils/utilities";

import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { IBotType, Health as HealthType } from "@spt-aki/models/eft/common/tables/IBotType";
import { Health as HealthBase } from "@spt-aki/models/eft/common/tables/IBotBase";
import { IQueue } from "src/utils/queue";

@injectable()
export class HealthRuleSystem extends RuleSystem {
    private botTypes: Record<string, HealthType>;
    private defaultHealth: HealthType;
    private healthForRules: HealthBase;

    constructor(
        @inject(ConstInjectionName.MOD_CORE) protected core: ModCore,
        @inject("DatabaseServer") protected database: DatabaseServer,
        @inject(ConstInjectionName.LOG_SYSTEM) protected logSystem: LogSystem
    ) {
        super(core, logSystem);
        this.botTypes = {};
        this.initRules();
        this.setDefaultHealth();
        this.getBotTypes();
    }

    private initRules(): void {
        this.ruleContainer.addCategory(ConstSkillName.HEALTH);
        this.ruleContainer.addCategory(ConstSkillName.METABOLISM);
        this.ruleContainer.addCategory(ConstSkillName.VITALITY);
    }

    // run this method to define the default health for the bot type that spawned
    public setHealthOfBotType(botType: string): void {
        const keys: string[] = Object.keys(this.botTypes);
        for (const index in keys) {
            const botTypeName: string = keys[index];
            if (botTypeName.toLowerCase() === botType.toLowerCase())
                this.healthForRules = Converter.HealthTypeToBase(this.botTypes[botTypeName]);
        }

        this.healthForRules = Converter.HealthTypeToBase(this.defaultHealth);
    }

    public applyRules<Health>(): Health {
        super.applyRules();
        this.applyHealthRules();
        this.applyMetabolismRules();
        return this.healthForRules as Health;
    }

    private applyHealthRules(): void {
        let newHealth: number = 0;
        newHealth = this.getValueFromRules(ConstSkillName.HEALTH, newHealth, true);
        newHealth = this.getValueFromRules(ConstSkillName.VITALITY, newHealth);

        Utilities.addCurrentMax(this.healthForRules.BodyParts.Head.Health, newHealth);
        Utilities.addCurrentMax(this.healthForRules.BodyParts.Chest.Health, newHealth);
        Utilities.addCurrentMax(this.healthForRules.BodyParts.Stomach.Health, newHealth);
        Utilities.addCurrentMax(this.healthForRules.BodyParts.LeftArm.Health, newHealth);
        Utilities.addCurrentMax(this.healthForRules.BodyParts.LeftLeg.Health, newHealth);
        Utilities.addCurrentMax(this.healthForRules.BodyParts.RightArm.Health, newHealth);
        Utilities.addCurrentMax(this.healthForRules.BodyParts.RightLeg.Health, newHealth);
    }

    private applyMetabolismRules(): void {
        let newMetabolism: number = 0;
        newMetabolism = this.getValueFromRules(ConstSkillName.METABOLISM, newMetabolism);

        Utilities.addCurrentMax(this.healthForRules.Energy, newMetabolism);
        Utilities.addCurrentMax(this.healthForRules.Hydration, newMetabolism);
    }

    private getValueFromRules(skillName: string, value: number, canConditions: boolean = false): number {
        if (canConditions && this.checkConditions(skillName) == false)
            return value;

        const rules: IQueue<BaseRule> = this.ruleContainer.getByCategory(skillName);

        let newValue: number = value;
        while (rules.size() > 0) {
            const rule: BaseRule = rules.dequeue();
            newValue = rule.apply(newValue);
        }

        return newValue;
    }

    private setDefaultHealth(): void {
        const tables: IDatabaseTables = this.database.getTables();
        if (tables.bots === undefined)
            return;

        const tableBotTypes: any = tables.bots.types;
        for (const keyIndex in Object.keys(tableBotTypes)) {
            const botName: string = Object.keys(tableBotTypes)[keyIndex];
            if (botName !== ConstHealth.DEFAULT_BOT_TYPE)
                continue;

            const bot: IBotType = tableBotTypes[botName];
            if (bot.health === undefined) {
                this.logSystem.error(ConstMod.DB_ASSAULT_BOTTYPE_NO_HEALTH);
                return;
            }
            this.defaultHealth = bot.health;
        }
    }

    private getBotTypes(): void {
        const tables: IDatabaseTables = this.database.getTables();
        if (tables.bots === undefined)
            return;

        const tableBotTypes: any = tables.bots.types;
        for (const keyIndex in Object.keys(tableBotTypes)) {
            let botName: string = Object.keys(tableBotTypes)[keyIndex];
            const bot: IBotType = tableBotTypes[botName];
            const healthExist: boolean = (bot.health !== undefined);

            if (botName === "usec" || botName === "bear") botName = "spt" + botName;
            botName = botName.toLowerCase();

            this.botTypes[botName] = (healthExist == false) ? this.defaultHealth : bot.health;
        }
    }
}