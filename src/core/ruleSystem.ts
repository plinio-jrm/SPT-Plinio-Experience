/* eslint-disable @typescript-eslint/brace-style */
import { inject, injectable } from "tsyringe";

import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

@injectable()
export class RuleSystem {
    constructor(
        @inject("DatabaseServer") protected database: DatabaseServer
    ) {

    }
}