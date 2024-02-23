/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/brace-style */
import { DependencyContainer, Lifecycle, registry } from "tsyringe";

import { BotHandler } from "./handlers/botHandler";
import { PlayerHandler } from "./handlers/playerHandler";
import { ModCore } from "./core/modCore";
import { LogSystem } from "./core/logSystem";
import { HealthRuleSystem } from "./core/healthRuleSystem";
import { InRaidNewHelper } from "./helpers/inRaidNewHelper";
import { ConstMod, ConstInjectionName } from "./common/constants";

import type { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import type { DynamicRouterModService } from "@spt-aki/services/mod/dynamicRouter/DynamicRouterModService";
import type { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { InRaidHelper } from "@spt-aki/helpers/InRaidHelper";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { ISaveProgressRequestData } from "@spt-aki/models/eft/inRaid/ISaveProgressRequestData";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

class Mod implements IPreAkiLoadMod 
{
    private logSystem: LogSystem;

    public preAkiLoad(container: DependencyContainer): void 
    {
        this.registerModules(container);
        this.init(container);

        this.setupRoutes(container);
        this.setupHelpers(container);
    }

    public postDBLoad(container: DependencyContainer): void {
        this.test(container);
    }

    private registerModules(container: DependencyContainer): void {
        container.register<ModCore>(ConstInjectionName.MOD_CORE, ModCore);
        container.register<LogSystem>(ConstInjectionName.LOG_SYSTEM, LogSystem, { lifecycle: Lifecycle.Singleton });
        container.register<HealthRuleSystem>(ConstInjectionName.HEALTH_RULE_SYSTEM, HealthRuleSystem);
        container.register<BotHandler>(ConstInjectionName.BOT_HANDLE, BotHandler);
        container.register<PlayerHandler>(ConstInjectionName.PLAYER_HANDLE, PlayerHandler);
        container.register<InRaidNewHelper>(ConstInjectionName.INRAID_NEW_HELPER, InRaidNewHelper);
    }

    private init(container: DependencyContainer): void {
        const core: ModCore = container.resolve<ModCore>(ConstInjectionName.MOD_CORE);
        this.logSystem = container.resolve<LogSystem>(ConstInjectionName.LOG_SYSTEM);
        this.logSystem.log(ConstMod.MOD_LOADED + core.difficultyName(), LogTextColor.GREEN);
    }

    private setupRoutes(container: DependencyContainer): void {
        const dynamicRouterModService = container.resolve<DynamicRouterModService>("DynamicRouterModService");
        const staticRouterModService = container.resolve<StaticRouterModService>("StaticRouterModService");

        const botHandler: BotHandler = container.resolve<BotHandler>(ConstInjectionName.BOT_HANDLE);

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
                }
            ],
            "PlinioJRM"
            //"aki"
        );
    }

    private setupHelpers(container: DependencyContainer): void {
        const inRaidNewHelper: InRaidNewHelper = container.resolve<InRaidNewHelper>(ConstInjectionName.INRAID_NEW_HELPER);
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

    private test(container: DependencyContainer): void {
        const hSystem: HealthRuleSystem = container.resolve<HealthRuleSystem>(ConstInjectionName.HEALTH_RULE_SYSTEM);
    }
}

module.exports = {mod: new Mod()}