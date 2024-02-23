/* eslint-disable @typescript-eslint/brace-style */
import { ModCore } from "../modCore";

export class BaseRule implements IBaseRule {
    protected core: ModCore;
    
    public apply(value: any): any {
        return value;
    }
    public setCore(core: ModCore): BaseRule {
        this.core = core;
        return this;
    }
}

export interface IBaseRule {
    apply(value: any): any;
    setCore(core: ModCore): BaseRule;
}