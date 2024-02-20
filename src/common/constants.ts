/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
export class ConstMod {
    public static readonly MOD_NAME: string = "PlinioJRM Experience";
    public static readonly MOD_MSG: string = this.MOD_NAME + ": ";
    public static readonly MOD_LOADED: string = this.MOD_MSG + "- Difficulty: ";
    public static readonly NO_PLAYER_DATA: string = this.MOD_MSG + "No player data! ignoring PlinioJRM-Experience player's settings";
    public static readonly LOG_FILE_CREATED: string = this.MOD_MSG + "Log system is enabled. On this session, the logs will be in: ";
    public static readonly LOG_FILENAME_IS: string = this.MOD_MSG + "File name is: ";
}

export class ConstInjectionName {
    public static readonly MOD_CORE: string = "PlinioCore";
    public static readonly BOT_HANDLE: string = "PlinioBotHandler";
    public static readonly INRAID_NEW_HELPER: string = "PlinioInRaidNewHelper";
    public static readonly LOG_SYSTEM: string = "PlinioLogSystem";
}

export class ConstHealth {
    public static readonly HEAD: number = 35;
    public static readonly THORAX: number = 85;
    public static readonly STOMACH: number = 70;
    public static readonly RIGHT_ARM: number = 60;
    public static readonly LEFT_ARM: number = 60;
    public static readonly RIGHT_LEG: number = 65;
    public static readonly LEFT_LEG: number = 65;
    public static readonly FOOD_WATER: number = 100;
}

export class ConstSkillName {
    public static readonly HEALTH: string = "Health";
    public static readonly VITALITY: string = "Vitality";
    public static readonly METABOLISM: string = "Metabolism";
}

export class ConstLogSystem {
    public static readonly DIR_PATH: string = "../../logs/";
    public static readonly FILENAME: string = "log-";
    public static readonly EXTENSION: string = ".log";
    public static readonly NEWLINE: string = "\n";
}