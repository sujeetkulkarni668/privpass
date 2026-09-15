import React, { useState } from "react";

export interface AttributeItem {
  key: string;
  label: string;
  value: string | number | boolean;
  type: "string" | "number" | "boolean" | "date";
  supportsPredicate?: boolean;
}

export interface DisclosureConfig {
  disclosedKeys: string[];
  predicates: Record<string, { op: "gte" | "lte" | "eq"; threshold: any }>;
}

interface AttributeSelectorProps {
  attributes: AttributeItem[];
  onChange: (config: DisclosureConfig) => void;
}

export const AttributeSelector: React.FC<AttributeSelectorProps> = ({ attributes, onChange }) => {
  const [disclosedKeys, setDisclosedKeys] = useState<string[]>([]);
  const [predicates, setPredicates] = useState<Record<string, { op: "gte" | "lte" | "eq"; threshold: any }>>({});

  const handleToggleDisclose = (key: string) => {
    let nextKeys: string[];
    if (disclosedKeys.includes(key)) {
      nextKeys = disclosedKeys.filter((k) => k !== key);
    } else {
      nextKeys = [...disclosedKeys, key];
      // remove predicate if explicitly disclosing
      const nextPreds = { ...predicates };
      delete nextPreds[key];
      setPredicates(nextPreds);
    }
    setDisclosedKeys(nextKeys);
    onChange({ disclosedKeys: nextKeys, predicates });
  };

  const handleTogglePredicate = (key: string, op: "gte" | "lte" | "eq", threshold: any) => {
    const nextPreds = { ...predicates };
    if (nextPreds[key]) {
      delete nextPreds[key];
    } else {
      nextPreds[key] = { op, threshold };
      // remove from explicit disclosure if proving via predicate
      setDisclosedKeys((prev) => prev.filter((k) => k !== key));
    }
    setPredicates(nextPreds);
    onChange({ disclosedKeys, predicates: nextPreds });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Selective Disclosure Attributes</h3>
        <span className="text-xs text-indigo-400 font-mono">Zero-Knowledge Mode</span>
      </div>

      <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-black/20">
        {attributes.map((attr) => {
          const isDisclosed = disclosedKeys.includes(attr.key);
          const hasPredicate = !!predicates[attr.key];

          return (
            <div key={attr.key} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-medium text-white text-sm">{attr.label}</span>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isDisclosed ? (
                    <span className="text-amber-400">Reveals raw value: {String(attr.value)}</span>
                  ) : hasPredicate ? (
                    <span className="text-emerald-400 font-mono">
                      ZK Proof: value {predicates[attr.key].op} {String(predicates[attr.key].threshold)}
                    </span>
                  ) : (
                    <span className="text-gray-500">Fully Hidden (Private)</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {attr.type === "number" && attr.supportsPredicate && (
                  <button
                    type="button"
                    onClick={() => handleTogglePredicate(attr.key, "gte", 18)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      hasPredicate
                        ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                        : "bg-midnight-800 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    ZK: Age ≥ 18
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleToggleDisclose(attr.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isDisclosed
                      ? "bg-amber-950/60 border-amber-500/50 text-amber-300"
                      : "bg-midnight-800 border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {isDisclosed ? "Disclosed" : "Disclose Raw"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
