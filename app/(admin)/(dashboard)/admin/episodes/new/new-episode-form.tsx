"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import type { Language, Tag } from "@/types";
import {
  Header,
  HeaderCenter,
  HeaderLeft,
} from "@/components/layout/header";
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
  scholar?: { name: string } | null;
}

interface NewEpisodeFormProps {
  series: AdminSeries[];
  adminRole: "super_admin" | "scholar_admin";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function NewEpisodeForm({ series, adminRole }: NewEpisodeFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
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

  const toggleTag = useCallback((tag: Tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("audio/")) {
        setErrors((prev) => ({ ...prev, audio: "File must be an audio file" }));
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
          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.open("POST", "/api/admin/upload");
          xhr.send(formData);
        });

        setAudioUrl(result.url);

        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setDurationSeconds(Math.round(audioBuffer.duration));

        setUploadState("uploaded");
      } catch (err) {
        setUploadState("error");
        setErrors((prev) => ({
          ...prev,
          audio:
            err instanceof Error ? err.message : "Failed to upload audio",
        }));
      }
    },
    [],
  );

  const clearFile = useCallback(() => {
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
      if (!seriesId) errs.seriesId = "Series is required";
      if (publish && uploadState !== "uploaded") {
        errs.audio = "Audio file is required to publish";
      }
      return errs;
    },
    [title, seriesId, uploadState],
  );

  const handleSubmit = useCallback(
    async (publish: boolean) => {
      setSubmitError("");
      const errs = validate(publish);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      setIsSubmitting(true);

      try {
        const res = await fetch("/api/admin/episodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            series_id: seriesId,
            language,
            tags: selectedTags,
            audio_url: audioUrl,
            duration_seconds: durationSeconds,
            recorded_date: recordedDate || undefined,
            description: description.trim() || undefined,
            is_published: publish,
          }),
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
      router,
      validate,
    ],
  );

  const isPending = isSubmitting || uploadState === "uploading";

  return (
    <>
      <Header>
        <HeaderLeft type="breadcrumb" segments={[
          { label: "Episodes", href: "/admin/episodes" },
          { label: "New", href: "/admin/episodes/new" },
        ]} />
        <HeaderCenter title="New Episode" />
      </Header>

      <main className="flex-1 pb-20 lg:pb-0">
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

            <fieldset>
              <label
                htmlFor="series"
                className="mb-1.5 block text-sm font-medium text-forest-700"
              >
                Series <span className="text-clay-500">*</span>
              </label>
              <Select value={seriesId} onValueChange={setSeriesId}>
                <SelectTrigger
                  id="series"
                  className={errors.seriesId ? "border-red-300" : ""}
                >
                  <SelectValue placeholder="Select a series" />
                </SelectTrigger>
                <SelectContent>
                  {series.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                      {s.scholar?.name && adminRole === "super_admin"
                        ? ` — ${s.scholar.name}`
                        : ""}
                    </SelectItem>
                  ))}
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
              <label className="mb-1.5 block text-sm font-medium text-forest-700">
                Tags
              </label>
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
                    accept="audio/*"
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
                {isSubmitting && !audioUrl
                  ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  )
                  : "Save draft"}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isPending}
                onClick={() => handleSubmit(true)}
              >
                {isSubmitting && audioUrl
                  ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  )
                  : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
