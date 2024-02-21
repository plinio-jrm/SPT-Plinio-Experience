/* eslint-disable @typescript-eslint/brace-style */
import { inject, injectable } from "tsyringe";

import { ConstInjectionName, ConstHealth, ConstMod } from "../common/constants";
import { LogSystem } from "../core/logSystem";
import { RuleSystem } from "./ruleSystem";
import { IBotNameNHealth } from "../common/ITables";

import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { IBotType, Health } from "@spt-aki/models/eft/common/tables/IBotType";

@injectable()
export class HealthRuleSystem extends RuleSystem {
    private botTypes: Record<string, IBotNameNHealth>;
    private defaultHealth: Health;

    constructor(
        @inject("DatabaseServer") protected database: DatabaseServer,
        @inject(ConstInjectionName.LOG_SYSTEM) protected logSystem: LogSystem
    ) {
        super(database);
        this.botTypes = {};
        this.setDefaultHealth();
        this.getBotTypes();
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

        const tableBotTypes: any = tables.bots.types
        for (const keyIndex in Object.keys(tableBotTypes)) {
            const botName: string = Object.keys(tableBotTypes)[keyIndex];
            const bot: IBotType = tableBotTypes[botName];
            const healthExist: boolean = (bot.health !== undefined);

            const data: IBotNameNHealth = {
                firstName: bot.firstName,
                health: (healthExist == false) ? this.defaultHealth : bot.health
            };

            this.botTypes[botName] = data;
        }

        this.logSystem.debug("entries: "+Object.keys(this.botTypes).length);
    }
}