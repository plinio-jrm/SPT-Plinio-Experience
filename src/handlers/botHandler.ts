/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/indent */
import { inject, injectable } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";

import { IGetBodyResponseData } from "@spt-aki/models/eft/httpResponse/IGetBodyResponseData";
import { IBotBase } from "@spt-aki/models/eft/common/tables/IBotBase";

import { IBotConfig } from "../common/IConfig";
import { ModCore } from "../core/modCore";
import { BaseCharacterHandler } from "./baseCharacterHandler";

@injectable()
export class BotHandler extends BaseCharacterHandler{
   private responseData: IGetBodyResponseData<IBotBase>;
   private config: IBotConfig;

   constructor(
      @inject("WinstonLogger") protected logger: ILogger,
      @inject("PlinioCore") protected core: ModCore
   ) { 
      super(logger, core, false);
      this.config = core.getBotConfig();
   }

   public handle(output: string): string {
      this.responseData = JSON.parse(output);
      this.process();
      return JSON.stringify(this.responseData);
   }

   protected process(): void {
      super.process();
      if (this.hasError)
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
      this.changeHealth(bot.Health.BodyParts, bot.Info.Level, this.config);
      this.applyMetabolism(bot, this.config);
      this.applyVitalityHealth(bot, this.config);

      this.toString(bot, this.config.DisplayBotNewHealthOnServer);
   }
}