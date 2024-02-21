/* eslint-disable @typescript-eslint/brace-style */
import { injectable } from "tsyringe";

import { IConfig, Difficulty, IBotConfig, IPlayerConfig, ISystem } from "../common/IConfig";
import { ConstDifficulty } from "../common/constants";

@injectable()
export class ModCore {
    private config: IConfig = require("../config/configuration.json");

    constructor( ) {}

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
            case Difficulty.CAKE: {
                return 0.2;
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
                return ConstDifficulty.NONE;
            }
            case Difficulty.CAKE: {
                return ConstDifficulty.CAKE;
            }
            case Difficulty.EASY: {
                return ConstDifficulty.EASY;
            }
            case Difficulty.NORMAL: {
                return ConstDifficulty.NORMAL;
            }
            case Difficulty.HARD: {
                return ConstDifficulty.HARD;
            }
            case Difficulty.IMPOSSIBLE: {
                return ConstDifficulty.IMPOSSIBLE;
            }
        }
    }

    public isDifficultyNone(): boolean {
        return (this.difficulty() == 0);
    }

    public applyDifficulty(value: number): number {
        return value * this.difficulty();
    }
}