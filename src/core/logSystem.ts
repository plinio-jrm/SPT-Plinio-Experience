/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import { inject, injectable } from "tsyringe";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

import { ConstLogSystem, ConstInjectionName, ConstMod } from "../common/constants";
import { ModCore } from "../core/modCore";
import { ISystem } from "../common/IConfig";

@injectable()
export class LogSystem {
    private config: ISystem;
    private filename: string = "";
    private filepath: string = "";
    private isFileEnable: boolean;
    private isFileEmpty: boolean;

    constructor (
        @inject("WinstonLogger") protected logger: ILogger,
        @inject(ConstInjectionName.MOD_CORE) protected core: ModCore
    ) {
        this.config = core.getSystemConfig();
        this.isFileEnable = this.config.CreateLogFile
        if (this.isFileEnable == false)
            return;

        this.checkFileIsEmpty();
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
        if (this.isFileEnable == false)
            return;

        let prefix: string = "["+this.getDateTime()+"]: ";
        if (this.isFileEmpty == false)
            prefix = ConstLogSystem.NEWLINE + prefix;

        writeFileSync(this.filepath, prefix + data, { encoding: "utf-8", flag: "a+" });
    }

    private getDateTime(): string {
        return `${this.getDate}-${this.getHour()}`;
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
        return `${hour}-${minutes}-${seconds}`;
    }

    private checkFileIsEmpty(): void {
        if (this.filename == "")
            this.filename = ConstLogSystem.FILENAME + this.getDate() + ConstLogSystem.EXTENSION;
        
        this.filepath = join(__dirname, ConstLogSystem.DIR_PATH + this.filename);
        const buffer = readFileSync(this.filepath, { encoding: "utf-8", flag: "a+" });
        this.logger.logWithColor("buffer: "+buffer, LogTextColor.MAGENTA);
        this.isFileEmpty = buffer === "";
    }
}