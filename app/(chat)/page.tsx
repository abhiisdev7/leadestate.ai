"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import emailAnimation from "@/assets/email-anination.json";
import { SpeechInput } from "@/components/ai-elements/speech-input";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { useSpeechSynthesis } from "@/lib/speech/useSpeechSynthesis";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { HomeIcon, SendIcon, BotIcon, SparklesIcon, Volume2Icon } from "lucide-react";

const LEAD_ID_KEY = "leadestate_lead_id";
const VOICE_READING_KEY = "leadestate_voice_reading";

function getTextFromMessage(message: { parts?: Array<{ type?: string; text?: string }> }): string {
  if (!message.parts) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && "text" in p)
    .map((p) => p.text)
    .join("");
}

function hasScheduleCallSuccess(messages: Array<{ parts?: Array<{ type?: string; state?: string; output?: unknown }> }>): boolean {
  for (const msg of messages) {
    if (!msg.parts) continue;
    for (const p of msg.parts) {
      const out = p.output as { closeChat?: boolean } | undefined;
      if (p.type === "tool-schedule_call" && p.state === "output-available" && out?.closeChat) {
        return true;
      }
    }
  }
  return false;
}

export default function VoiceChatPage() {
  const leadIdRef = useRef<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LEAD_ID_KEY);
    if (stored) leadIdRef.current = stored;
  }, []);

  const { speak, stop } = useSpeechSynthesis();

  const transportRef = useRef(
    new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (url, init) => {
        const response = await fetch(url, init);
        const newLeadId = response.headers.get("X-Lead-Id");
        if (newLeadId && typeof window !== "undefined") {
          leadIdRef.current = newLeadId;
          localStorage.setItem(LEAD_ID_KEY, newLeadId);
        }
        return response;
      },
    })
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: transportRef.current,
  });

  const [textInput, setTextInput] = useState("");
  const [callScheduled, setCallScheduled] = useState(false);
  const [voiceReading, setVoiceReading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(VOICE_READING_KEY);
    if (stored !== null) setVoiceReading(stored !== "false");
  }, []);

  useEffect(() => {
    localStorage.setItem(VOICE_READING_KEY, String(voiceReading));
    if (!voiceReading) stop();
  }, [voiceReading, stop]);

  const sendTextMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      sendMessage(
        { text: text.trim() },
        { body: { lead_id: leadIdRef.current } }
      );
      setTextInput("");
    },
    [sendMessage]
  );

  const handleTranscription = useCallback(
    (text: string) => sendTextMessage(text),
    [sendTextMessage]
  );

  const lastAssistantMessageRef = useRef<string>("");
  useEffect(() => {
    if (hasScheduleCallSuccess(messages)) {
      setCallScheduled(true);
      setMessages([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem(LEAD_ID_KEY);
      }
    }
  }, [messages, setMessages]);

  useEffect(() => {
    if (!voiceReading) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant || status !== "ready") return;

    const text = getTextFromMessage(lastAssistant);
    if (text && text !== lastAssistantMessageRef.current) {
      lastAssistantMessageRef.current = text;
      speak(text);
    }
  }, [messages, status, speak, voiceReading]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const startNewChat = useCallback(() => {
    setCallScheduled(false);
    setMessages([]);
  }, [setMessages]);

  if (callScheduled) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                <HomeIcon className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-sm">Leadestate Voice</h1>
              <p className="text-muted-foreground text-xs">Real estate assistant</p>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
          <div className="size-48 sm:size-56 max-w-[280px]">
            <Lottie
              animationData={emailAnimation}
              loop={false}
              autoplay={true}
              className="w-full h-full"
            />
          </div>
          <div className="text-center space-y-2">
            <h2 className="font-semibold text-lg">Call scheduled</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Your call has been booked. A confirmation email has been sent.
            </p>
          </div>
          <Button onClick={startNewChat} size="lg">
            Start new chat
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b bg-primary-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 rounded-lg">
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
              <HomeIcon className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-sm">Leadestate Voice</h1>
            <p className="text-muted-foreground text-xs">Real estate assistant</p>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <Volume2Icon className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Read aloud</span>
          <Switch
            checked={voiceReading}
            onCheckedChange={setVoiceReading}
            size="sm"
            aria-label="Toggle voice reading of messages"
          />
        </label>
      </header>

      <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <Conversation className="scrollbar-thumb-only flex-1 min-h-0">
          <ConversationContent className="gap-6 px-4 py-5">
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="Hi, how can I help?"
                description="Tell me about your real estate needs budget, location, timeline or click the mic to speak. I'll qualify your lead and suggest matching properties."
                icon={
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <BotIcon className="size-7 text-muted-foreground" />
                  </div>
                }
              />
            ) : (
              messages
                .filter((m) => m.role !== "system")
                .map((message: { id: string; role: "user" | "assistant" | "system"; parts?: Array<{ type?: string; text?: string }> }) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 w-full",
                      message.role === "user" && "flex-row-reverse justify-end"
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="size-8 shrink-0 rounded-lg mt-0.5">
                        <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
                          <BotIcon className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Message from={message.role} className={message.role === "user" ? "max-w-[85%]" : "flex-1 min-w-0 max-w-full"}>
                      <MessageContent>
                        <MessageResponse>
                          {getTextFromMessage(message) || "Thinking..."}
                        </MessageResponse>
                      </MessageContent>
                    </Message>
                    {message.role === "user" && (
                      <Avatar className="size-8 shrink-0 rounded-lg mt-0.5">
                        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                          U
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="shrink-0 px-4 py-4">
          {messages.length === 0 && (
            <Suggestions className="mb-3 gap-2">
              {[
                "I'm looking to buy a home",
                "I want to sell my property",
                "I'm exploring both options",
              ].map((label) => (
                <Suggestion
                  key={label}
                  suggestion={label}
                  onClick={sendTextMessage}
                  className="rounded-lg"
                />
              ))}
            </Suggestions>
          )}
          <div className="overflow-hidden rounded-2xl border bg-background shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
            <Textarea
              placeholder="Ask anything about your real estate needs..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendTextMessage(textInput);
                }
              }}
              disabled={status === "streaming"}
              rows={2}
              className="min-h-[72px] resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-t-2xl rounded-b-none px-4 py-3"
            />
            <div className="flex items-center justify-between gap-2 rounded-b-2xl border-t px-3 py-2">
              <div className="flex items-center gap-2">
                <SpeechInput
                  onTranscriptionChange={handleTranscription}
                  aria-label="Start voice input"
                  className="size-9 shrink-0 rounded-full"
                />
                <span className="flex items-center gap-1.5 rounded-full border bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <SparklesIcon className="size-3.5" />
                  {status === "streaming" ? "Responding..." : "Voice"}
                </span>
                {status === "streaming" && (
                  <Button variant="outline" size="sm" onClick={handleStop} className="rounded-full h-8">
                    Stop
                  </Button>
                )}
              </div>
              <Button
                size="icon"
                className="size-9 shrink-0 rounded-full"
                onClick={() => sendTextMessage(textInput)}
                disabled={!textInput.trim() || status === "streaming"}
                aria-label="Send message"
              >
                <SendIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
