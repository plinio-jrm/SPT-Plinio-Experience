/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/brace-style */
export interface IConfig extends ISystem{
    Difficulty: Difficulty;
    Bot: IBotConfig;
    Player: IPlayerConfig;
}

export interface ISystem {
    Debug: boolean;
    CreateLogFile: boolean;
}

export const enum Difficulty {
    NONE = 0,
    CAKE = 1,
    EASY = 2,
    NORMAL = 3,
    HARD = 4,
    IMPOSSIBLE = 5
}

export interface IBotConfig extends IBaseCharacterConfig {
    DisplayBotNewHealthOnServer: boolean;
}

export interface IPlayerConfig extends IBaseCharacterConfig {
}

export interface IBaseCharacterConfig {
    StatPerLevel: number;
    StatPerSkill: ISkillConfig;
}

export interface ISkillConfig {
    Metabolism: number;
    Health: number;
    Vitality: number;
}