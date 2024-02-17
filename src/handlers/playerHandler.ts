/* eslint-disable @typescript-eslint/brace-style */
import { inject, injectable } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IBotBase, Health, CurrentMax, IBaseSkill, BodyPartsHealth } from "@spt-aki/models/eft/common/tables/IBotBase";

import { IPlayerConfig } from "../common/IConfig";
import { ModCore } from "../core/modCore";
import { BaseCharacterHandler } from "./baseCharacterHandler";

@injectable()
export class PlayerHandler extends BaseCharacterHandler {
    private data: IBotBase;
    private config: IPlayerConfig;
    
    constructor (
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("PlinioCore") protected core: ModCore
    ) { 
        super(logger, core, false);
        this.config = core.getPlayerConfig();
    }

    public handle(player: IBotBase): void {
        this.data = player;
        this.process();
    }

    protected process(): void {
        super.process();
        if (this.hasError)
            return;
        if (this.data === null || this.data === undefined) {
            this.logger.info("No player data! ignoring PlinioJRM-Experience player's settings");
            return;
        }

        this.processPlayer();
    }

    private processPlayer(): void {
        this.changeHealth(this.data.Health, this.data.Info.Level, this.config);
        this.applyMetabolism(this.data, this.config);
    }
}