/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
export class ConstMod {
    public static readonly MOD_NAME: string = "PlinioJRM Experience";
    public static readonly MOD_MSG: string = this.MOD_NAME + ": ";
    public static readonly MOD_LOADED = this.MOD_MSG + " - Difficulty: ";
    public static readonly NO_PLAYER_DATA = "No player data! ignoring PlinioJRM-Experience player's settings";
    public static readonly LOG_FILE_CREATED = this.MOD_MSG + "Log system is enabled. Log file for this session: ";
}

export class ConstInjectionName {
    public static readonly MOD_CORE = "PlinioCore";
    public static readonly BOT_HANDLE = "PlinioBotHandler";
    public static readonly INRAID_NEW_HELPER = "PlinioInRaidNewHelper";
    public static readonly LOG_SYSTEM = "PlinioLogSystem";
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
    public static readonly DIR_PATH = "../../logs/";
    public static readonly FILENAME = "log-";
    public static readonly EXTENSION = ".log";
}