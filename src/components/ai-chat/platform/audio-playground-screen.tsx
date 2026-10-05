"use client";

import {
  ArrowDownToLine,
  Braces,
  Headphones,
  Mic,
  Pause,
  Play,
  Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import samples from "../../../../public/ai-chat/platform/audio/manifest.json";
import { downloadFile } from "./platform-data";
import { PlatformPage, PlatformSelect } from "./platform-ui";

type Mode = "live" | "realtime" | "translate" | "speech";
type Scenario = "welcome" | "delivery";
type Voice = "clear" | "warm";
type SampleKey = keyof typeof samples;
type Event = { time: string; name: string; detail: string };
const modes = [
  { value: "live", label: "Live voice" },
  { value: "realtime", label: "Realtime" },
  { value: "translate", label: "Translate" },
  { value: "speech", label: "Text to speech" },
] as const;
const scenarios = [
  { value: "welcome", label: "Workspace welcome" },
  { value: "delivery", label: "Delivery update" },
] as const;
const voices = [
  { value: "clear", label: "Clear · conversational" },
  { value: "warm", label: "Warm · measured" },
] as const;
const scenarioClips = {
  welcome: { clear: "welcome-clear", warm: "welcome-warm" },
  delivery: { clear: "delivery-clear", warm: "delivery-warm" },
} satisfies Record<Scenario, Record<Voice, SampleKey>>;
const clock = (n: number) =>
  `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
export function AudioPlaygroundScreen() {
  const [mode, setMode] = useState<Mode>("live");
  const [scenario, setScenario] = useState<Scenario>("welcome");
  const [voice, setVoice] = useState<Voice>("clear");
  const [speed, setSpeed] = useState("1");
  const [transport, setTransport] = useState("webrtc");
  const [vad, setVad] = useState(true);
  const [noise, setNoise] = useState("near");
  const [instructions, setInstructions] = useState(
    "Be a concise, helpful assistant. Confirm the user's intent before suggesting the next step.",
  );
  const [script, setScript] = useState(samples["welcome-clear"].text);
  const [clip, setClipState] = useState<SampleKey>("welcome-clear");
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState<
    "ready" | "listening" | "speaking" | "paused" | "complete"
  >("ready");
  const [elapsed, setElapsed] = useState(0);
  const [inspector, setInspector] = useState("transcript");
  const [events, setEvents] = useState<Event[]>([]);
  const [transcript, setTranscript] = useState<
    { role: string; text: string }[]
  >([]);
  const audio = useRef<HTMLAudioElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const player = audio.current;
    return () => {
      if (timer.current) clearTimeout(timer.current);
      player?.pause();
    };
  }, []);
  const sample = samples[clip];
  const configuration = {
    mode,
    sample: scenario,
    voice,
    speed: Number(speed),
    instructions,
    text: script,
    preview: "prerecorded demo",
  };
  if (mode === "realtime")
    Object.assign(configuration, {
      transport,
      turnDetection: vad,
      noiseReduction: noise,
    });
  if (mode === "translate")
    Object.assign(configuration, {
      sourceLanguage: "es",
      targetLanguage: "en",
    });
  function setClip(key: SampleKey) {
    setClipState(key);
    if (audio.current) {
      audio.current.pause();
      audio.current.src = samples[key].url;
      audio.current.playbackRate = Number(speed);
    }
  }
  function stop() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    audio.current?.pause();
    setPlaying(false);
    setPhase("ready");
  }
  function selectMode(value: string) {
    const nextMode = modes.find((item) => item.value === value)?.value;
    if (!nextMode) return;
    stop();
    setMode(nextMode);
    setInspector("transcript");
    setElapsed(0);
    setEvents([]);
    setTranscript([]);
    setClip(
      nextMode === "translate"
        ? "spanish-clear"
        : scenarioClips[scenario][voice],
    );
  }
  function playClip(key: SampleKey) {
    const player = audio.current;
    if (!player) return;
    setClip(key);
    setElapsed(0);
    player.playbackRate = Number(speed);
    void player
      .play()
      .then(() => {
        setPlaying(true);
        setPhase("speaking");
      })
      .catch(() => {
        setPhase("ready");
        setPlaying(false);
        toast.error("Audio playback was blocked. Try pressing Play.");
      });
  }
  function start() {
    stop();
    setElapsed(0);
    setTranscript([]);
    if (mode === "speech") {
      setEvents([
        {
          time: "0.00",
          name: "preview.ready",
          detail: `${voice} voice · ${speed}× · WAV`,
        },
      ]);
      setTranscript([
        {
          role: "Preview script",
          text: samples[scenarioClips[scenario][voice]].text,
        },
      ]);
      playClip(scenarioClips[scenario][voice]);
      return;
    }
    setPhase("listening");
    setEvents([
      {
        time: "0.00",
        name: mode === "translate" ? "translation.started" : "session.created",
        detail:
          mode === "realtime"
            ? `${transport.toUpperCase()} · ${vad ? "automatic" : "manual"} turn detection`
            : "Prerecorded sample session",
      },
    ]);
    timer.current = setTimeout(() => {
      if (mode === "translate") {
        setTranscript([
          { role: "Spanish · source", text: samples["spanish-clear"].text },
          {
            role: "English · translation",
            text: samples["translation-clear"].text,
          },
        ]);
        setEvents((items) => [
          ...items,
          {
            time: "0.60",
            name: "translation.completed",
            detail: "Spanish → English · sample transcript",
          },
        ]);
        playClip("translation-clear");
      } else {
        const user =
          scenario === "welcome"
            ? "What can I do in this workspace?"
            : "When will my order arrive?";
        setTranscript([
          { role: "User", text: user },
          {
            role: "Assistant",
            text: samples[scenarioClips[scenario][voice]].text,
          },
        ]);
        setEvents((items) => [
          ...items,
          { time: "0.28", name: "input.transcript.completed", detail: user },
          {
            time: "0.60",
            name: "response.audio.started",
            detail: `${voice} voice · prerecorded reply`,
          },
        ]);
        playClip(scenarioClips[scenario][voice]);
      }
      timer.current = null;
    }, 600);
  }
  function finished() {
    setPlaying(false);
    setPhase("complete");
    setEvents((items) => [
      ...items,
      {
        time: sample.duration.toFixed(2),
        name: "audio.playback.completed",
        detail: `${clock(sample.duration)} played`,
      },
    ]);
  }
  return (
    <PlatformPage
      title="Audio playground"
      description="Configure voice sessions, inspect transcripts, and preview speech."
      onReset={() => {
        stop();
        setMode("live");
        setScenario("welcome");
        setVoice("clear");
        setSpeed("1");
        setTransport("webrtc");
        setVad(true);
        setNoise("near");
        setInstructions(
          "Be a concise, helpful assistant. Confirm the user's intent before suggesting the next step.",
        );
        setScript(samples["welcome-clear"].text);
        setClip("welcome-clear");
        if (audio.current) audio.current.playbackRate = 1;
        setInspector("transcript");
        setElapsed(0);
        setTranscript([]);
        setEvents([]);
      }}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadFile(
              "audio-request.json",
              JSON.stringify(configuration, null, 2),
            )
          }
        >
          <Braces data-icon="inline-start" />
          Export request
        </Button>
      }
    >
      <audio
        ref={audio}
        src={samples["welcome-clear"].url}
        preload="metadata"
        onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
        onPause={() => {
          setPlaying(false);
          setPhase((value) => (value === "speaking" ? "paused" : value));
        }}
        onPlay={() => {
          setPlaying(true);
          setPhase("speaking");
        }}
        onEnded={finished}
      />
      <Tabs value={mode} onValueChange={selectMode}>
        <div className="overflow-x-auto">
          <TabsList aria-label="Audio mode">
            {modes.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value={mode} className="mt-5">
          <div className="grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>
                  {mode === "speech"
                    ? "Voice settings"
                    : mode === "translate"
                      ? "Translation setup"
                      : "Session settings"}
                </CardTitle>
                <CardDescription>
                  Prepare a request and try a sample.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  {mode !== "translate" ? (
                    <>
                      <Field>
                        <FieldLabel>Sample scenario</FieldLabel>
                        <PlatformSelect
                          label="Audio sample scenario"
                          value={scenario}
                          onChange={(value) => {
                            const nextScenario = scenarios.find(
                              (item) => item.value === value,
                            )?.value;
                            if (!nextScenario) return;
                            stop();
                            setScenario(nextScenario);
                            setScript(
                              samples[scenarioClips[nextScenario].clear].text,
                            );
                            setClip(scenarioClips[nextScenario][voice]);
                            setElapsed(0);
                            setTranscript([]);
                            setEvents([]);
                          }}
                          options={scenarios}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Voice</FieldLabel>
                        <PlatformSelect
                          label="Audio voice"
                          value={voice}
                          onChange={(value) => {
                            const nextVoice = voices.find(
                              (item) => item.value === value,
                            )?.value;
                            if (!nextVoice) return;
                            stop();
                            setVoice(nextVoice);
                            setClip(scenarioClips[scenario][nextVoice]);
                            setElapsed(0);
                          }}
                          options={voices}
                        />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field>
                        <FieldLabel>Source language</FieldLabel>
                        <p className="rounded-md border px-3 py-2 text-sm">
                          Spanish
                        </p>
                      </Field>
                      <Field>
                        <FieldLabel>Target language</FieldLabel>
                        <p className="rounded-md border px-3 py-2 text-sm">
                          English
                        </p>
                        <FieldDescription>
                          This sample asks about an order’s delivery date.
                        </FieldDescription>
                      </Field>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playClip("spanish-clear")}
                      >
                        <Play data-icon="inline-start" />
                        Play source audio
                      </Button>
                    </>
                  )}
                  <Field>
                    <FieldLabel>Playback speed</FieldLabel>
                    <PlatformSelect
                      label="Audio playback speed"
                      value={speed}
                      onChange={(value) => {
                        setSpeed(value);
                        if (audio.current)
                          audio.current.playbackRate = Number(value);
                      }}
                      options={[
                        { value: "0.75", label: "0.75×" },
                        { value: "1", label: "1×" },
                        { value: "1.25", label: "1.25×" },
                        { value: "1.5", label: "1.5×" },
                      ]}
                    />
                  </Field>
                  {mode === "realtime" ? (
                    <>
                      <Separator />
                      <Field>
                        <FieldLabel>Transport</FieldLabel>
                        <PlatformSelect
                          label="Realtime transport"
                          value={transport}
                          onChange={setTransport}
                          options={[
                            { value: "webrtc", label: "WebRTC" },
                            { value: "websocket", label: "WebSocket" },
                          ]}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Noise reduction</FieldLabel>
                        <PlatformSelect
                          label="Noise reduction"
                          value={noise}
                          onChange={setNoise}
                          options={[
                            { value: "near", label: "Near field" },
                            { value: "far", label: "Far field" },
                            { value: "off", label: "Off" },
                          ]}
                        />
                      </Field>
                      <Field orientation="horizontal">
                        <FieldLabel htmlFor="audio-vad" className="flex-1">
                          Automatic turn detection
                        </FieldLabel>
                        <Switch
                          id="audio-vad"
                          checked={vad}
                          onCheckedChange={setVad}
                        />
                      </Field>
                    </>
                  ) : null}
                </FieldGroup>
              </CardContent>
            </Card>
            <div className="flex min-w-0 flex-col gap-5">
              {mode === "speech" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Speech script</CardTitle>
                    <CardDescription>
                      Voice playback uses the selected sample. Your edited
                      script is included in request exports.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="speech-script" className="sr-only">
                          Speech script
                        </FieldLabel>
                        <Textarea
                          id="speech-script"
                          className="min-h-28"
                          value={script}
                          maxLength={4000}
                          onChange={(e) => setScript(e.target.value)}
                        />
                        <FieldDescription>
                          {script.length} characters · WAV output
                        </FieldDescription>
                      </Field>
                    </FieldGroup>
                  </CardContent>
                </Card>
              ) : mode !== "translate" ? (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="audio-instructions">
                      Instructions
                    </FieldLabel>
                    <Textarea
                      id="audio-instructions"
                      value={instructions}
                      maxLength={2000}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="min-h-20"
                    />
                  </Field>
                </FieldGroup>
              ) : null}
              <Card>
                <CardHeader className="flex-row items-center justify-between gap-3">
                  <div>
                    <CardTitle>
                      {mode === "translate"
                        ? clip === "translation-clear"
                          ? "Translated audio"
                          : "Source audio"
                        : "Voice preview"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {mode === "translate"
                        ? clip === "spanish-clear"
                          ? "Spanish sample"
                          : "English translation"
                        : `${scenario === "welcome" ? "Workspace welcome" : "Delivery update"} · ${voice} voice`}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {phase === "listening"
                      ? "Processing sample"
                      : phase === "speaking"
                        ? "Playing"
                        : phase === "complete"
                          ? "Complete"
                          : phase === "paused"
                            ? "Paused"
                            : "Ready"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div
                    role="img"
                    aria-label="Waveform of the selected prerecorded audio"
                    className="bg-muted/40 flex h-24 items-center gap-0.5 overflow-hidden rounded-md px-3"
                  >
                    {sample.peaks.map((peak, i) => (
                      <span
                        key={i}
                        className={cn(
                          "min-w-px flex-1 rounded-full",
                          i / sample.peaks.length <= elapsed / sample.duration
                            ? "bg-foreground"
                            : "bg-muted-foreground/35",
                        )}
                        style={{
                          height: `${Math.max(5, Math.min(90, peak * 145))}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-muted-foreground w-8 font-mono text-[11px]">
                      {clock(elapsed)}
                    </span>
                    <Slider
                      aria-label="Seek audio"
                      value={[Math.min(elapsed, sample.duration)]}
                      min={0}
                      max={sample.duration}
                      step={0.05}
                      onValueChange={([value]) => {
                        if (audio.current) audio.current.currentTime = value;
                        setElapsed(value);
                      }}
                    />
                    <span className="text-muted-foreground w-8 font-mono text-[11px]">
                      {clock(sample.duration)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex-wrap justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={start}
                      disabled={phase === "listening" || playing}
                    >
                      {mode === "speech" ? (
                        <Headphones data-icon="inline-start" />
                      ) : (
                        <Mic data-icon="inline-start" />
                      )}
                      {mode === "speech"
                        ? "Preview voice"
                        : mode === "translate"
                          ? "Translate sample"
                          : "Start demo session"}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      disabled={phase === "listening"}
                      aria-label={playing ? "Pause audio" : "Play audio"}
                      onClick={() => {
                        if (playing) audio.current?.pause();
                        else
                          void audio.current
                            ?.play()
                            .catch(() => toast.error("Playback unavailable"));
                      }}
                    >
                      {playing ? <Pause /> : <Play />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Stop audio"
                      onClick={() => {
                        stop();
                        if (audio.current) audio.current.currentTime = 0;
                        setElapsed(0);
                      }}
                    >
                      <Square />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={sample.url} download>
                      <ArrowDownToLine data-icon="inline-start" />
                      WAV
                    </a>
                  </Button>
                </CardFooter>
              </Card>
              <Tabs value={inspector} onValueChange={setInspector}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <TabsList aria-label="Audio inspector">
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="events">
                      Events {events.length ? `(${events.length})` : ""}
                    </TabsTrigger>
                  </TabsList>
                  <span className="text-muted-foreground text-[11px]">
                    Prerecorded demo · microphone not used
                  </span>
                </div>
                <TabsContent value="transcript" className="mt-3">
                  <div className="min-h-32 divide-y rounded-lg border">
                    {transcript.length ? (
                      transcript.map((turn, i) => (
                        <div
                          key={`${turn.role}-${i}`}
                          className="grid gap-2 p-4 sm:grid-cols-[92px_minmax(0,1fr)]"
                        >
                          <span className="text-muted-foreground text-xs">
                            {turn.role}
                          </span>
                          <p className="text-sm leading-6">{turn.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground flex min-h-32 items-center justify-center px-4 text-center text-sm">
                        Start a sample to inspect its transcript.
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="events" className="mt-3">
                  <div className="min-h-32 divide-y rounded-lg border">
                    {events.length ? (
                      events.map((event, i) => (
                        <div
                          key={`${event.name}-${i}`}
                          className="grid grid-cols-[40px_minmax(0,1fr)] gap-3 px-4 py-3"
                        >
                          <time className="text-muted-foreground font-mono text-[10px]">
                            {event.time}s
                          </time>
                          <div>
                            <p className="font-mono text-[11px]">
                              {event.name}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {event.detail}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground p-5 text-sm">
                        Session events will appear here.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PlatformPage>
  );
}
