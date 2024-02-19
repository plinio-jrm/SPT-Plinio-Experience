/* eslint-disable @typescript-eslint/brace-style */
import { injectable, inject } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IConfig, Difficulty, IBotConfig, IPlayerConfig, ISystem } from "../common/IConfig";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

@injectable()
export class ModCore {
    private config: IConfig = require("../config/configuration.json");

    constructor(
        @inject("WinstonLogger") private logger: ILogger
    ) {}

    public getBotConfig(): IBotConfig {
        return this.config.Bot;
    }

    public getPlayerConfig(): IPlayerConfig {
        return this.config.Player;
    }

    public getSystemConfig(): ISystem {
        return this.config;
    }

    public difficulty(): number {
        const difficulty: Difficulty = this.config.Difficulty;
        switch (difficulty) {
            case Difficulty.NONE: {
                return 0;
            }
            case Difficulty.EASY: {
                return 0.5;
            }
            case Difficulty.NORMAL: {
                return 1;
            }
            case Difficulty.HARD: {
                return 1.5;
            }
            case Difficulty.IMPOSSIBLE: {
                return 2;
            }
        }
    }

    public difficultyName(): string {
        const difficulty: Difficulty = this.config.Difficulty;
        switch (difficulty) {
            case Difficulty.NONE: {
                return "None (Not applied)";
            }
            case Difficulty.EASY: {
                return "Easy (Almost like default)";
            }
            case Difficulty.NORMAL: {
                return "Normal (Aim right to kill)";
            }
            case Difficulty.HARD: {
                return "Hard (You will struggle to kill)";
            }
            case Difficulty.IMPOSSIBLE: {
                return "Impossible (Don't blame me if you rage quit)";
            }
        }
    }

    public isDifficultyNone(): boolean {
        return (this.difficulty() == 0);
    }

    public applyDifficulty(value: number): number {
        return value * this.difficulty();
    }

    public debug(message: string): void {
        if (this.config.Debug)
            this.logger.logWithColor("| " + message, LogTextColor.YELLOW);
    }
}