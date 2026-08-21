// Index 0 is empty — day IDs are 1-based (1=Monday … 7=Sunday)
export const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const DAY_INDEX: Record<string, number> = Object.fromEntries(
    DAY_NAMES.map((name, i) => [name, i]).filter(([name]) => name)
);
