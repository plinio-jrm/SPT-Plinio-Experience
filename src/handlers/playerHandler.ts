/* eslint-disable @typescript-eslint/brace-style */
import { inject, injectable } from "tsyringe";
import { IBotBase } from "@spt-aki/models/eft/common/tables/IBotBase";

import { IPlayerConfig } from "../common/IConfig";
import { ConstInjectionName, ConstMod } from "../common/constants";
import { ModCore } from "../core/modCore";
import { LogSystem } from "../core/logSystem";
import { BaseCharacterHandler } from "./baseCharacterHandler";
import { HealthRuleSystem } from "../core/healthRuleSystem";

@injectable()
export class PlayerHandler extends BaseCharacterHandler {
    private data: IBotBase;
    private config: IPlayerConfig;
    
    constructor (
        @inject(ConstInjectionName.LOG_SYSTEM) protected logSystem: LogSystem,
        @inject(ConstInjectionName.MOD_CORE) protected core: ModCore,
        @inject(ConstInjectionName.HEALTH_RULE_SYSTEM) protected ruleSystem: HealthRuleSystem
    ) { 
        super(logSystem, core, ruleSystem, false);
        this.config = core.getPlayerConfig();
    }

    public handle(player: IBotBase): IBotBase {
        this.data = player;
        this.logSystem.log("1. Data = " + this.data);
        this.process();
        this.logSystem.log("2. Data = " + this.data);
        return this.data;
    }

    protected process(): void {
        super.process();
        if (this.hasError)
            return;
        if (this.data === null || this.data === undefined) {
            this.logSystem.log(ConstMod.NO_PLAYER_DATA);
            return;
        }

        this.processPlayer();
    }

    private processPlayer(): void {
        /*
        this.changeHealth(this.data.Health.BodyParts, this.data.Info.Level, this.config);
        this.applyMetabolism(this.data, this.config);
        this.applyVitalityHealth(this.data, this.config);
        */
        this.toString(this.data);
    }
}