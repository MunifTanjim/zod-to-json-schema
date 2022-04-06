import { ZodNullableDef } from "zod";
import { JsonSchema7Type, parseDef } from "../parseDef";
import { References } from "../References";
import { JsonSchema7NullType } from "./null";
import { primitiveMappings } from "./union";

export type JsonSchema7NullableType =
  | {
      oneOf: [JsonSchema7Type, JsonSchema7NullType];
    }
  | {
      type: [string, "null"];
    };

export function parseNullableDef(
  def: ZodNullableDef,
  refs: References
): JsonSchema7NullableType | undefined {
  if (
    ["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(
      def.innerType._def.typeName
    ) &&
    (!def.innerType._def.checks || !def.innerType._def.checks.length)
  ) {
    if (refs.target === "openApi3") {
      return {
        type: primitiveMappings[
          def.innerType._def.typeName as keyof typeof primitiveMappings
        ],
        nullable: true,
      } as any;
    }

    return {
      type: [
        primitiveMappings[
          def.innerType._def.typeName as keyof typeof primitiveMappings
        ],
        "null",
      ],
    };
  }

  const type = parseDef(def.innerType._def, refs.addToPath("oneOf", "0"));

  return type
    ? refs.target === "openApi3"
      ? ({ ...type, nullable: true } as any)
      : {
          oneOf: [
            type,
            {
              type: "null",
            },
          ],
        }
    : undefined;
}
