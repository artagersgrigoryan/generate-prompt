"use client";

import { useState, useEffect } from "react";
import { useTranslations, useMessages } from "next-intl";
import { Question } from "@/lib/questions";
import { OptionButton } from "./OptionButton";
import { StyleCard, STYLE_PREVIEWS } from "./StyleCard";
import { ColorPaletteSelector } from "./ColorPaletteSelector";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface QuestionStepProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// English sentinel — used for value comparison and storage, never for display
const WRITE_IT = "Write it myself";

export function QuestionStep({
  question,
  value,
  onChange,
  error,
}: QuestionStepProps) {
  const t = useTranslations("step");
  const messages = useMessages();
  const qmsgs = (messages.questions ?? {}) as Record<string, string>;

  // Returns the translated display label for a question option by its index.
  // The option's English value (used for storage/comparison) is always passed
  // through unchanged — only the visible label is translated.
  function displayOpt(opt: string, index: number): string {
    if (opt === WRITE_IT) return t("writeItMyself");
    return qmsgs[`q${question.id}opt${index}`] || opt;
  }

  function displayHint(): string | undefined {
    if (!question.hint) return undefined;
    return qmsgs[`q${question.id}hint`] || question.hint;
  }

  function displayPlaceholder(): string | undefined {
    if (!question.placeholder) return undefined;
    return qmsgs[`q${question.id}placeholder`] || question.placeholder;
  }

  function displayFieldLabel(key: string, fallback: string): string {
    return qmsgs[`q${question.id}field_${key}_label`] || fallback;
  }

  function displayFieldPlaceholder(key: string, fallback?: string): string | undefined {
    if (!fallback) return undefined;
    return qmsgs[`q${question.id}field_${key}_placeholder`] || fallback;
  }

  const [customText, setCustomText] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const selectedOptions: string[] = (() => {
    if (question.type !== "multi") return [];
    try {
      return JSON.parse(value) as string[];
    } catch {
      return value ? [value] : [];
    }
  })();

  useEffect(() => {
    if (question.type === "text") return;
    if (question.type === "single" && value.startsWith("Custom: ")) {
      setShowCustom(true);
      setCustomText(value.replace("Custom: ", ""));
    }
    if (question.type === "multi") {
      if (selectedOptions.includes(WRITE_IT)) {
        setShowCustom(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSingleSelect(opt: string) {
    if (opt === WRITE_IT) {
      setShowCustom(true);
      onChange(customText ? `Custom: ${customText}` : "");
    } else {
      setShowCustom(false);
      onChange(opt);
    }
  }

  function handleCustomSingle(text: string) {
    setCustomText(text);
    onChange(text ? `Custom: ${text}` : "");
  }

  function handleMultiSelect(opt: string) {
    if (opt === WRITE_IT) {
      const already = selectedOptions.includes(WRITE_IT);
      if (already) {
        setShowCustom(false);
        const next = selectedOptions.filter((o) => o !== WRITE_IT);
        onChange(JSON.stringify(next));
      } else {
        setShowCustom(true);
        const next = [
          ...selectedOptions.filter((o) => o !== WRITE_IT),
          WRITE_IT,
        ];
        onChange(JSON.stringify(next));
      }
      return;
    }

    const already = selectedOptions.includes(opt);
    if (already) {
      onChange(JSON.stringify(selectedOptions.filter((o) => o !== opt)));
    } else {
      const max = question.maxSelections ?? Infinity;
      const nonCustom = selectedOptions.filter((o) => o !== WRITE_IT);
      if (nonCustom.length >= max) return;
      onChange(JSON.stringify([...selectedOptions, opt]));
    }
  }

  function handleCustomMulti(text: string) {
    setCustomText(text);
    const base = selectedOptions.filter(
      (o) => o !== WRITE_IT && !o.startsWith("Custom: ")
    );
    const next = text
      ? [...base, WRITE_IT, `Custom: ${text}`]
      : [...base, WRITE_IT];
    onChange(JSON.stringify(next));
  }

  // ── Fields ───────────────────────────────────────────────────────────────────
  if (question.type === "fields") {
    const fieldDefs = question.fields ?? [];
    let parsed: Record<string, string> = {};
    try {
      parsed = JSON.parse(value);
    } catch {
      /* empty */
    }

    function setField(key: string, val: string) {
      const next = { ...parsed, [key]: val };
      onChange(JSON.stringify(next));
    }

    const hint = displayHint();

    return (
      <div className="space-y-4">
        {hint && (
          <p className="text-xs text-neutral-500 leading-relaxed">{hint}</p>
        )}
        {fieldDefs.map((f) => (
          <div key={f.key} className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">
              {displayFieldLabel(f.key, f.label)}
              {f.required && (
                <span className="ml-1 text-neutral-400">*</span>
              )}
            </label>
            <Input
              placeholder={displayFieldPlaceholder(f.key, f.placeholder)}
              value={parsed[f.key] ?? ""}
              onChange={(e) => setField(f.key, e.target.value)}
              error={
                error && f.required && !parsed[f.key]?.trim()
                  ? t("fieldRequired")
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    );
  }

  // ── Text ─────────────────────────────────────────────────────────────────────
  if (question.type === "text") {
    return (
      <div className="space-y-4">
        {question.showColorPalettes && (
          <ColorPaletteSelector
            selected={value}
            onSelect={(desc) => onChange(desc)}
          />
        )}
        <Textarea
          rows={3}
          placeholder={displayPlaceholder()}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
      </div>
    );
  }

  const options = question.options ?? [];

  // ── Style preview cards ───────────────────────────────────────────────────────
  if (question.showStylePreviews) {
    const styleOptions = options.filter((o) => o !== WRITE_IT);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {styleOptions.map((opt, i) => (
            <StyleCard
              key={opt}
              label={displayOpt(opt, i)}
              selected={value === opt}
              preview={
                STYLE_PREVIEWS[opt] ?? (
                  <div className="h-full w-full bg-neutral-100" />
                )
              }
              onSelect={() => handleSingleSelect(opt)}
            />
          ))}
        </div>
        <OptionButton
          label={t("writeItMyself")}
          selected={showCustom}
          isWriteItMyself
          onSelect={() => handleSingleSelect(WRITE_IT)}
        />
        {showCustom && (
          <Input
            placeholder={t("customStylePlaceholder")}
            value={customText}
            onChange={(e) => handleCustomSingle(e.target.value)}
            autoFocus
          />
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // ── Single / Multi select ─────────────────────────────────────────────────────
  const hint = displayHint();

  return (
    <div className="space-y-4">
      {hint && (
        <p className="text-xs text-neutral-500 leading-relaxed">{hint}</p>
      )}
      {question.type === "multi" && question.maxSelections && (
        <p className="text-xs text-neutral-500">
          {t("selectUpTo", { max: question.maxSelections })}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => {
          const isWIM = opt === WRITE_IT;
          const isSelected =
            question.type === "single"
              ? isWIM
                ? showCustom
                : value === opt
              : selectedOptions.includes(opt);

          return (
            <OptionButton
              key={opt}
              label={displayOpt(opt, i)}
              selected={isSelected}
              isWriteItMyself={isWIM}
              onSelect={() =>
                question.type === "single"
                  ? handleSingleSelect(opt)
                  : handleMultiSelect(opt)
              }
            />
          );
        })}
      </div>

      {showCustom && (
        <Input
          placeholder={t("customAnswerPlaceholder")}
          value={customText}
          onChange={(e) =>
            question.type === "single"
              ? handleCustomSingle(e.target.value)
              : handleCustomMulti(e.target.value)
          }
          autoFocus
        />
      )}

      {question.contentAlertOptions?.includes(value) && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <span className="text-lg leading-none">📎</span>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-amber-900">
              {t("attachTitle")}
            </p>
            <p className="text-xs text-amber-700">{t("attachDesc")}</p>
          </div>
        </div>
      )}

      {error && !showCustom && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
