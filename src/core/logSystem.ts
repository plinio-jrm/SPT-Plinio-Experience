/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import { inject, injectable } from "tsyringe";
import { writeFileSync } from "fs";
import { join } from "path";

import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

import { ConstLogSystem, ConstInjectionName, ConstMod } from "../common/constants";
import { ModCore } from "../core/modCore";
import { ISystem } from "../common/IConfig";

@injectable()
export class LogSystem {
    private filename: string;

    constructor (
        @inject("WinstonLogger") protected logger: ILogger,
        @inject(ConstInjectionName.MOD_CORE) protected core: ModCore,
        private config: ISystem
    ) {
        config = core.getSystemConfig();
        if (!config.CreateLogFile)
            return;
        
        this.log("");
        logger.logWithColor(ConstMod.LOG_FILE_CREATED + this.filename, LogTextColor.GREEN);
    }

    public logFn(data: () => string, color: LogTextColor | undefined = undefined): void {
        this.log(data(), color);
    }

    public log(data: string, color: LogTextColor | undefined = undefined): void {
        this.serverLog(data, color);
        this.fileLog(data);
    }

    private serverLog(message: string, color: LogTextColor | undefined = undefined): void {
        if (this.config.Debug == false)
            return;

        if (color === undefined) {
            this.logger.info(message);
        } else
            this.logger.logWithColor(message, color);
    }

    private fileLog(data: string): void {
        if (this.filename === "")
            this.filename = ConstLogSystem.FILENAME + this.getDate() + ConstLogSystem.EXTENSION;

        const path: string = join(__dirname, ConstLogSystem.DIR_PATH + this.filename);
        const prefix: string = "["+this.getHour()+"]:";

        writeFileSync(path, prefix + data, { flag: "a+" });
    }

    private getDate(): string {
        const today: Date = new Date();
        const day: string = today.getDate().toString().padStart(2, "0");
        const month: string = (today.getMonth() + 1).toString().padStart(2, "0");
        const year: string = today.getFullYear().toString();
        return `${day}-${month}-${year}`;
    }

    private getHour(): string {
        const today: Date = new Date();
        const hour: string = today.getHours().toString().padStart(2, "0");
        const minutes: string = today.getMinutes().toString().padStart(2, "0");
        const seconds: string = today.getSeconds().toString().padStart(2, "0");
        return `${hour}:${minutes}:${seconds}`;
    }
}