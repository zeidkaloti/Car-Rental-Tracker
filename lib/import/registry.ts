import { renterInputSchema, RENTER_FIELD_LABELS } from "@/lib/validation/renter";
import { carInputSchema, CAR_FIELD_LABELS } from "@/lib/validation/car";

// Registry-driven so the importer's upload/mapping/preview/commit UI never
// needs to change shape when a new entity type is added — only this map.
export const IMPORTABLE_ENTITIES = {
  renters: {
    label: "Renters",
    schema: renterInputSchema,
    fieldLabels: RENTER_FIELD_LABELS as Record<string, string>,
  },
  cars: {
    label: "Cars",
    schema: carInputSchema,
    fieldLabels: CAR_FIELD_LABELS as Record<string, string>,
  },
} as const;

export type ImportEntityType = keyof typeof IMPORTABLE_ENTITIES;

export const IMPORT_ENTITY_TYPES = Object.keys(IMPORTABLE_ENTITIES) as ImportEntityType[];
