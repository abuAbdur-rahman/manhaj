"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { Header, HeaderCenter, HeaderLeft } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Language, Tag } from "@/types";

const ALLOWED_AUDIO_EXTENSIONS = [
  "mp3",
  "wav",
  "ogg",
  "aac",
  "m4a",
  "wma",
  "mpeg",
  "opus",
  "oga",
];
const ACCEPT_STRING = ALLOWED_AUDIO_EXTENSIONS.map((e) => `.${e}`).join(",");

const ALL_TAGS: Tag[] = [
  "aqeedah",
  "fiqh",
  "tafseer",
  "hadith",
  "seerah",
  "manhaj",
  "adab",
  "family",
  "ibadah",
  "dawah",
  "ruqyah",
  "arabic",
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "yoruba", label: "Yoruba" },
  { value: "english", label: "English" },
  { value: "arabic", label: "Arabic" },
];

type UploadState = "idle" | "uploading" | "uploaded" | "error";

interface AdminSeries {
  id: string;
  title: string;
  scholar_id: string;
  scholar?: { name: string } | null;
}

interface AdminScholar {
  id: string;
  name: string;
}

interface NewEpisodeFormProps {
  series: AdminSeries[];
  scholars: AdminScholar[];
  adminRole: "super_admin" | "scholar_admin";
  adminScholarId: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function NewEpisodeForm({
  series: allSeries,
  scholars,
  adminRole,
  adminScholarId,
}: NewEpisodeFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const [title, setTitle] = useState("");
  const [scholarId, setScholarId] = useState(
    adminRole === "scholar_admin" ? (adminScholarId ?? "") : "",
  );
  const [seriesId, setSeriesId] = useState("");
  const [language, setLanguage] = useState<Language>("yoruba");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [recordedDate, setRecordedDate] = useState("");
  const [description, setDescription] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const filteredSeries = useMemo(() => {
    if (!scholarId) return [];
    return allSeries.filter((s) => s.scholar_id === scholarId);
  }, [allSeries, scholarId]);

  const toggleTag = useCallback((tag: Tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (xhrRef.current) {
        xhrRef.current.abort();
        xhrRef.current = null;
      }

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
        setErrors((prev) => ({
          ...prev,
          audio: `Allowed types: ${ALLOWED_AUDIO_EXTENSIONS.join(", ")}`,
        }));
        return;
      }

      setAudioFile(file);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.audio;
        return next;
      });

      setUploadState("uploading");
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("audio", file);

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      try {
        const result = await new Promise<{ url: string }>((resolve, reject) => {
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              let message = "Upload failed";
              try {
                const err = JSON.parse(xhr.responseText);
                message = err.error?.message ?? message;
              } catch {}
              reject(new Error(message));
            }
          });
          xhr.addEventListener("error", () =>
            reject(new Error("Network error")),
          );
          xhr.addEventListener("abort", () =>
            reject(new DOMException("Upload cancelled", "AbortError")),
          );
          xhr.open("POST", "/api/admin/upload");
          xhr.send(formData);
        });

        setAudioUrl(result.url);

        const arrayBuffer = await file.arrayBuffer();
        const tempCtx = new AudioContext();
        try {
          const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
          setDurationSeconds(Math.round(audioBuffer.duration));
        } finally {
          tempCtx.close();
        }

        setUploadState("uploaded");
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setUploadState("error");
        setErrors((prev) => ({
          ...prev,
          audio: err instanceof Error ? err.message : "Failed to upload audio",
        }));
      } finally {
        xhrRef.current = null;
      }
    },
    [],
  );

  const clearFile = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setAudioFile(null);
    setAudioUrl("");
    setDurationSeconds(null);
    setUploadState("idle");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const validate = useCallback(
    (publish: boolean): Record<string, string> => {
      const errs: Record<string, string> = {};
      if (!title.trim()) errs.title = "Title is required";
      if (!scholarId) errs.scholarId = "Scholar is required";
      if (publish && uploadState !== "uploaded") {
        errs.audio = "Audio file is required to publish";
      }
      return errs;
    },
    [title, scholarId, uploadState],
  );

  const handleSubmit = useCallback(
    async (publish: boolean) => {
      setSubmitError("");
      const errs = validate(publish);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      setIsSubmitting(true);

      try {
        const payload: Record<string, unknown> = {
          title: title.trim(),
          language,
          tags: selectedTags,
          audio_url: audioUrl,
          duration_seconds: durationSeconds,
          recorded_date: recordedDate || undefined,
          description: description.trim() || undefined,
          is_published: publish,
          scholar_id: scholarId,
        };
        if (seriesId) payload.series_id = seriesId;

        const res = await fetch("/api/admin/episodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error?.message ?? "Failed to create episode");
        }

        router.push("/admin");
        router.refresh();
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Something went wrong",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      title,
      seriesId,
      language,
      selectedTags,
      audioUrl,
      durationSeconds,
      recordedDate,
      description,
      scholarId,
      router,
      validate,
    ],
  );

  const isPending = isSubmitting || uploadState === "uploading";

  return (
    <>
      <Header>
        <HeaderLeft
          type="breadcrumb"
          segments={[
            { label: "Episodes", href: "/admin/episodes" },
            { label: "New", href: "/admin/episodes/new" },
          ]}
        />
        <HeaderCenter title="New Episode" />
      </Header>

      <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
          {submitError && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {submitError}
            </div>
          )}

          <div className="space-y-6">
            <fieldset>
              <label
                htmlFor="title"
                className="mb-1.5 block text-sm font-medium text-forest-700"
              >
                Title <span className="text-clay-500">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Episode title"
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title}</p>
              )}
            </fieldset>

            {adminRole === "super_admin" && (
              <fieldset>
                <label
                  htmlFor="scholar"
                  className="mb-1.5 block text-sm font-medium text-forest-700"
                >
                  Scholar <span className="text-clay-500">*</span>
                </label>
                <Select value={scholarId} onValueChange={setScholarId}>
                  <SelectTrigger
                    id="scholar"
                    className={errors.scholarId ? "border-red-300" : ""}
                  >
                    <SelectValue placeholder="Select a scholar" />
                  </SelectTrigger>
                  <SelectContent>
                    {scholars.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.scholarId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.scholarId}
                  </p>
                )}
              </fieldset>
            )}

            <fieldset>
              <label
                htmlFor="series"
                className="mb-1.5 block text-sm font-medium text-forest-700"
              >
                Series <span className="text-xs text-sand-300">(optional)</span>
              </label>
              <Select
                value={seriesId}
                onValueChange={setSeriesId}
                disabled={!scholarId}
              >
                <SelectTrigger
                  id="series"
                  className={errors.seriesId ? "border-red-300" : ""}
                >
                  <SelectValue
                    placeholder={
                      scholarId ? "Select a series" : "Select a scholar first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredSeries.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="">No series (standalone)</SelectItem>
                </SelectContent>
              </Select>
              {errors.seriesId && (
                <p className="mt-1 text-xs text-red-500">{errors.seriesId}</p>
              )}
            </fieldset>

            <fieldset>
              <label
                htmlFor="language"
                className="mb-1.5 block text-sm font-medium text-forest-700"
              >
                Language
              </label>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as Language)}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </fieldset>

            <fieldset>
              <legend className="mb-1.5 block text-sm font-medium text-forest-700">
                Tags
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TAGS.map((tag) => (
                  <Chip
                    key={tag}
                    selected={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                    type="button"
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <label
                htmlFor="audio"
                className="mb-1.5 block text-sm font-medium text-forest-700"
              >
                Audio file
              </label>

              {uploadState === "idle" && (
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select file
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_STRING}
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Select audio file"
                  />
                </div>
              )}

              {(uploadState === "uploading" || uploadState === "error") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-forest-700">
                    <span className="truncate max-w-[280px]">
                      {audioFile?.name}
                    </span>
                    <span className="font-mono text-xs text-sand-300 shrink-0 ml-2">
                      {formatFileSize(audioFile?.size ?? 0)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-sand-200">
                    <div
                      className="h-full rounded-full bg-forest-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                      role="progressbar"
                      aria-valuenow={uploadProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-sand-300">
                      {uploadState === "uploading"
                        ? `Uploading ${uploadProgress}%`
                        : "Upload failed"}
                    </span>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="text-xs text-sand-300 hover:text-forest-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {uploadState === "uploaded" && (
                <div className="flex items-center gap-3 rounded-lg border border-sand-200 bg-sand-100 px-3 py-2.5">
                  <Badge variant="default" className="shrink-0">
                    Uploaded
                  </Badge>
                  <span className="flex-1 min-w-0 truncate text-sm text-forest-700">
                    {audioFile?.name}
                  </span>
                  <span className="font-mono text-xs text-sand-300 shrink-0">
                    {formatFileSize(audioFile?.size ?? 0)}
                  </span>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="shrink-0 rounded p-0.5 text-sand-300 hover:text-forest-700 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {errors.audio && (
                <p className="mt-1 text-xs text-red-500">{errors.audio}</p>
              )}
            </fieldset>

            <fieldset>
              <label
                htmlFor="recordedDate"
                className="mb-1.5 block text-sm font-medium text-forest-700"
              >
                Recorded date
              </label>
              <Input
                id="recordedDate"
                type="date"
                value={recordedDate}
                onChange={(e) => setRecordedDate(e.target.value)}
              />
            </fieldset>

            <fieldset>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium text-forest-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="flex w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-forest-900 placeholder:text-sand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Optional description"
              />
            </fieldset>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={() => handleSubmit(false)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save draft"
                )}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isPending}
                onClick={() => handleSubmit(true)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
