import type { Sector, Status } from "@/lib/schemas";
import { FormField } from "@/components/ui/label";
import { Input, Select } from "@/components/ui/input";

export const SECTOR_OPTIONS: Sector[] = [
  "transport",
  "energy",
  "buildings",
  "waste",
  "land use",
];

export const STATUS_OPTIONS: Status[] = ["planned", "in progress", "completed"];

export type ActionDraftBase = {
  title: string;
  sector: Sector;
  annualReduction: string;
  status: Status;
  startYear: string;
};

export function emptyActionDraft(): ActionDraftBase {
  return {
    title: "",
    sector: "transport",
    annualReduction: "",
    status: "planned",
    startYear: new Date().getFullYear().toString(),
  };
}

type ActionFormFieldsProps = {
  draft: ActionDraftBase;
  onChange: (draft: ActionDraftBase) => void;
  idPrefix?: string;
};

export function ActionFormFields({
  draft,
  onChange,
  idPrefix = "action",
}: ActionFormFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField label="Title">
        <Input
          id={`${idPrefix}-title`}
          name="title"
          onChange={(event) =>
            onChange({ ...draft, title: event.target.value })
          }
          value={draft.title}
        />
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Sector">
          <Select
            id={`${idPrefix}-sector`}
            name="sector"
            onChange={(event) =>
              onChange({ ...draft, sector: event.target.value as Sector })
            }
            value={draft.sector}
          >
            {SECTOR_OPTIONS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Status">
          <Select
            id={`${idPrefix}-status`}
            name="status"
            onChange={(event) =>
              onChange({ ...draft, status: event.target.value as Status })
            }
            value={draft.status}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Annual modeled reduction (t/yr)">
          <Input
            id={`${idPrefix}-annual-reduction`}
            inputMode="numeric"
            mono
            name="annualReduction"
            onChange={(event) =>
              onChange({ ...draft, annualReduction: event.target.value })
            }
            value={draft.annualReduction}
          />
        </FormField>

        <FormField label="Start year">
          <Input
            id={`${idPrefix}-start-year`}
            inputMode="numeric"
            mono
            name="startYear"
            onChange={(event) =>
              onChange({ ...draft, startYear: event.target.value })
            }
            value={draft.startYear}
          />
        </FormField>
      </div>
    </div>
  );
}
