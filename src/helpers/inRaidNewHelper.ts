/* eslint-disable @typescript-eslint/brace-style */
import { inject, injectable } from "tsyringe";

import { LogSystem } from "../core/logSystem";
import { PlayerHandler } from "../handlers/playerHandler";
import { ConstInjectionName } from "../common/constants";

import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { IPostRaidPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { IBotBase, IEftStats } from "@spt-aki/models/eft/common/tables/IBotBase";
import { SaveServer } from "@spt-aki/servers/SaveServer";
import { ISaveProgressRequestData } from "@spt-aki/models/eft/inRaid/ISaveProgressRequestData";

@injectable()
export class InRaidNewHelper {
    constructor(
        @inject("SaveServer") protected saveServer: SaveServer,
        @inject(ConstInjectionName.LOG_SYSTEM) protected logSystem: LogSystem,
        @inject(ConstInjectionName.PLAYER_HANDLE) private playerHandle: PlayerHandler
    ) {}

    public updateProfileBaseStats(
        profileData: IPmcData,
        saveProgressRequest: ISaveProgressRequestData,
        sessionID: string
    ): void {
        this.resetSkillPointsEarnedDuringRaid(saveProgressRequest.profile);

        const eftStats: IEftStats = saveProgressRequest.profile.EftStats;
        saveProgressRequest.profile = this.playerHandle.handle(saveProgressRequest.profile as IBotBase) as IPostRaidPmcData;
        saveProgressRequest.profile.EftStats = eftStats;
        // Set profile data
        profileData.Health = saveProgressRequest.profile.Health;
        profileData.Info.Level = saveProgressRequest.profile.Info.Level;
        profileData.Skills = saveProgressRequest.profile.Skills;
        profileData.Stats.Eft = saveProgressRequest.profile.Stats.Eft;
        profileData.Encyclopedia = saveProgressRequest.profile.Encyclopedia;
        profileData.ConditionCounters = saveProgressRequest.profile.ConditionCounters;

        this.validateBackendCounters(saveProgressRequest, profileData);

        profileData.SurvivorClass = saveProgressRequest.profile.SurvivorClass;

        // Add experience points
        profileData.Info.Experience += profileData.Stats.Eft.TotalSessionExperience;
        profileData.Stats.Eft.TotalSessionExperience = 0;

        this.saveServer.getProfile(sessionID).inraid.location = "none";
    }

    private resetSkillPointsEarnedDuringRaid(profile: IPmcData): void {
        for (const skill of profile.Skills.Common)
            skill.PointsEarnedDuringSession = 0.0;
    }

    private validateBackendCounters(saveProgressRequest: ISaveProgressRequestData, profileData: IPmcData): void {
        for (const backendCounterKey in saveProgressRequest.profile.BackendCounters) {
            // Skip counters with no id
            if (!saveProgressRequest.profile.BackendCounters[backendCounterKey].id)
                continue;

            const postRaidValue = saveProgressRequest.profile.BackendCounters[backendCounterKey]?.value;
            if (typeof postRaidValue === "undefined")
                continue;

            const matchingPreRaidCounter = profileData.BackendCounters[backendCounterKey];
            if (!matchingPreRaidCounter) {
                this.logSystem.error(`Backendcounter: ${backendCounterKey} cannot be found in pre-raid data`);
                continue;
            }

            if (matchingPreRaidCounter.value !== postRaidValue)
                this.logSystem.error(
                    `Backendcounter: ${backendCounterKey} value is different post raid, old: ${matchingPreRaidCounter.value} new: ${postRaidValue}`
                );
        }
    }
}