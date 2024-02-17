/* eslint-disable @typescript-eslint/brace-style */
import { inject, injectable } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { SaveServer } from "@spt-aki/servers/SaveServer";
import { ISaveProgressRequestData } from "@spt-aki/models/eft/inRaid/ISaveProgressRequestData";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

@injectable()
export class InRaidNewHelper {
    constructor(
        @inject("WinstonLogger") private logger: ILogger,
        @inject("SaveServer") protected saveServer: SaveServer
    ) {}

    public updateProfileBaseStats(
        profileData: IPmcData,
        saveProgressRequest: ISaveProgressRequestData,
        sessionID: string
    ): void {
        this.logger.logWithColor("> executing my personal replacement [InRaidHelper]", LogTextColor.MAGENTA);
        this.resetSkillPointsEarnedDuringRaid(saveProgressRequest.profile);

        // Set profile data
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
                this.logger.error(`Backendcounter: ${backendCounterKey} cannot be found in pre-raid data`);
                continue;
            }

            if (matchingPreRaidCounter.value !== postRaidValue)
                this.logger.error(
                    `Backendcounter: ${backendCounterKey} value is different post raid, old: ${matchingPreRaidCounter.value} new: ${postRaidValue}`
                );
        }
    }
}