/* eslint-disable @typescript-eslint/brace-style */
import { ModCore } from "../modCore";

export class BaseCondition implements ICondition {
    protected core: ModCore;
    
    public check(): boolean | undefined {
        return undefined;
    }
    public setCore(core: ModCore): BaseCondition {
        this.core = core;
        return this;
    }
}

export interface ICondition {
    check(): boolean | undefined;
}