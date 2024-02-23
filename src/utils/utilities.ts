/* eslint-disable @typescript-eslint/brace-style */
import { CurrentMax, IBaseSkill, Health as HealthBase } from "@spt-aki/models/eft/common/tables/IBotBase";
import { Health as HealthType, BodyPart } from "@spt-aki/models/eft/common/tables/IBotType";

export class Utilities {
    public static floorValue(value: number): number {
        return Math.floor(value);
    }

    public static getSkillLevel(exp: number): number {
        return this.floorValue(exp / 100);
    }

    public static addCurrentMax(hp: CurrentMax, value: number): void {
        hp.Current += value;
        hp.Maximum += value;
    }

    public static changeCurrentMax(hp: CurrentMax, value: number): void {
        hp.Current = value;
        hp.Maximum = value;
    }

    public static findSkill(skills: any, name: string): IBaseSkill {
        if (skills === undefined || skills.length == 0)
            return undefined;
  
        for (const index in skills) {
            const skill: IBaseSkill = skills[index];
            if (skill.Id === name)
                return skill;
        }
  
        return undefined;
    }
}

export class Converter {
    public static HealthTypeToBase(hType: HealthType): HealthBase {
        let health: HealthBase;
        health.Temperature.Current = hType.Temperature.min;
        health.Temperature.Maximum = hType.Temperature.max;

        health.Hydration.Current = hType.Hydration.min;
        health.Hydration.Maximum = hType.Hydration.max;

        health.Energy.Current = hType.Energy.min;
        health.Energy.Maximum = hType.Energy.max;

        for (const index in hType.BodyParts) {
            const bodyparts: BodyPart = hType.BodyParts[index];
            health.BodyParts.Head.Health.Current = bodyparts.Head.min;
            health.BodyParts.Head.Health.Maximum = bodyparts.Head.max;

            health.BodyParts.Chest.Health.Current = bodyparts.Chest.min;
            health.BodyParts.Chest.Health.Maximum = bodyparts.Chest.max;

            health.BodyParts.Stomach.Health.Current = bodyparts.Stomach.min;
            health.BodyParts.Stomach.Health.Maximum = bodyparts.Stomach.max;

            health.BodyParts.LeftArm.Health.Current = bodyparts.LeftArm.min;
            health.BodyParts.LeftArm.Health.Maximum = bodyparts.LeftArm.max;

            health.BodyParts.RightArm.Health.Current = bodyparts.RightArm.min;
            health.BodyParts.RightArm.Health.Maximum = bodyparts.RightArm.max;

            health.BodyParts.LeftLeg.Health.Current = bodyparts.LeftLeg.min;
            health.BodyParts.LeftLeg.Health.Maximum = bodyparts.LeftLeg.max;

            health.BodyParts.RightLeg.Health.Current = bodyparts.RightLeg.min;
            health.BodyParts.RightLeg.Health.Maximum = bodyparts.RightLeg.max;
            break;
        }

        return health;
    }
}