/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/brace-style */
export interface IConfig {
    Difficulty: Difficulty;
    Bot: IBotConfig;
    Player: IPlayerConfig;
    Debug: boolean;
}

export const enum Difficulty {
    NONE = 0,
    EASY = 1,
    NORMAL = 2,
    HARD = 3,
    IMPOSSIBLE = 4
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