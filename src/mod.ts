/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/brace-style */
import { DependencyContainer, registry } from "tsyringe";

import { BotHandler } from "./handlers/botHandler";
import { ModCore } from "./core/modCore";
import { InRaidNewHelper } from "./helpers/inRaidNewHelper";

import type { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import type { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import type { DynamicRouterModService } from "@spt-aki/services/mod/dynamicRouter/DynamicRouterModService";
import type { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { InRaidHelper } from "@spt-aki/helpers/InRaidHelper";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { ISaveProgressRequestData } from "@spt-aki/models/eft/inRaid/ISaveProgressRequestData";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

class Mod implements IPreAkiLoadMod 
{
    public preAkiLoad(container: DependencyContainer): void 
    {
        container.register<ModCore>("PlinioCore", ModCore);
        container.register<BotHandler>("PlinioBotHandler", BotHandler);
        container.register<InRaidNewHelper>("PlinioInRaidNewHelper", InRaidNewHelper);
        
        const logger = container.resolve<ILogger>("WinstonLogger");
        const botHandler: BotHandler = container.resolve<BotHandler>("PlinioBotHandler");
        const core: ModCore = container.resolve<ModCore>("PlinioCore");
        logger.logWithColor("PlinioJRM Experience - Difficulty: "+core.difficultyName(), LogTextColor.GREEN);

        const dynamicRouterModService = container.resolve<DynamicRouterModService>("DynamicRouterModService");
        const staticRouterModService = container.resolve<StaticRouterModService>("StaticRouterModService");

        // dynamic route
        /*dynamicRouterModService.registerDynamicRouter(
            "DynamicRoutePeekingAki",
            [
                {
                    url: "/client/menu/locale/",
                    action: (url, info, sessionId, output) => 
                    {
                        //logger.info("/client/menu/locale/ data was: " + JSON.stringify(output))
                        return output;
                    }
                }
            ],
            "aki"
        );*/
        
        // static route
        staticRouterModService.registerStaticRouter(
            //"StaticRoutePeekingAki",
            "StaticRoutePeekingPlinioJRM",
            [
                {
                    url: "/client/game/bot/generate",
                    action: (url, info, sessionId, output) => {
                        return botHandler.handle(output);
                    }
                },
                {
                    url: "/raid/profile/save",
                    action: (url, info, sessionId, output) => {
                        //logger.info("data: " + JSON.stringify(profile));
                        return output;
                    }
                }
            ],
            "PlinioJRM"
            //"aki"
        );

        const inRaidNewHelper: InRaidNewHelper = container.resolve<InRaidNewHelper>("PlinioInRaidNewHelper");
        container.afterResolution("InRaidHelper", (_t, result: InRaidHelper) => {
            result.updateProfileBaseStats = (
                profileData: IPmcData,
                saveProgressRequest: ISaveProgressRequestData,
                sessionID: string
            ) => {
                inRaidNewHelper.updateProfileBaseStats(profileData, saveProgressRequest, sessionID);
            }
        }, {frequency: "Always"});
    }
}

module.exports = {mod: new Mod()}