import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bot, Send, Image as ImageIcon, Plus, Trash2, X, MessageSquare, Loader2, WifiOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useOffline } from "@/hooks/useOffline";
import { useLanguage } from "@/contexts/language-context";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  useListGeminiConversations,
  useCreateGeminiConversation,
  useGetGeminiConversation,
  useDeleteGeminiConversation,
  getListGeminiConversationsQueryKey,
  getGetGeminiConversationQueryKey,
} from "@workspace/api-client-react";

export default function AiAssistant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isOffline = useOffline();
  const { t, isRTL } = useLanguage();

  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: isLoadingConvs } = useListGeminiConversations();
  const createConv = useCreateGeminiConversation();
  const deleteConv = useDeleteGeminiConversation();

  const { data: activeConversation, isLoading: isLoadingConv } = useGetGeminiConversation(
    activeConvId!,
    { query: { enabled: !!activeConvId } }
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages, streamingText]);

  const handleCreateConversation = () => {
    createConv.mutate(
      { data: { title: t.ai.new_session } },
      {
        onSuccess: (newConv) => {
          queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
          setActiveConvId(newConv.id);
          setShowSidebar(false);
        },
      }
    );
  };

  const handleSelectConversation = (id: number) => {
    setActiveConvId(id);
    setShowSidebar(false);
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteConv.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
          if (activeConvId === id) {
            setActiveConvId(null);
            setShowSidebar(true);
          }
        },
      }
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setSelectedImage(event.target?.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || (!inputText.trim() && !selectedImage) || isStreaming) return;

    const messageContent = JSON.stringify({
      text: inputText,
      ...(selectedImage ? { imageData: selectedImage } : {}),
    });

    setInputText("");
    setSelectedImage(null);
    setIsStreaming(true);
    setStreamingText("");

    const tempMessage = {
      id: Date.now(),
      conversationId: activeConvId,
      role: "user",
      content: messageContent,
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData(getGetGeminiConversationQueryKey(activeConvId), (old: any) => {
      if (!old) return old;
      return { ...old, messages: [...old.messages, tempMessage] };
    });

    if (isOffline) {
      toast({ variant: "destructive", title: t.ai.offline_title, description: t.ai.offline_desc });
      setIsStreaming(false);
      return;
    }

    try {
      const BASE_URL = import.meta.env.BASE_URL;
      const response = await fetch(
        `${BASE_URL}api/gemini/conversations/${activeConvId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: messageContent }),
        }
      );

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) setStreamingText((prev) => prev + data.content);
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: t.ai.error_title, description: t.ai.error_desc });
    } finally {
      setIsStreaming(false);
      setStreamingText("");
      queryClient.invalidateQueries({ queryKey: getGetGeminiConversationQueryKey(activeConvId) });
      queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
    }
  };

  const renderMessageContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return (
        <div className="flex flex-col gap-2">
          {parsed.text && <p className="whitespace-pre-wrap">{parsed.text}</p>}
          {parsed.imageData && (
            <img src={parsed.imageData} alt="Uploaded" className="max-w-[200px] sm:max-w-sm rounded-md border border-border object-contain" />
          )}
        </div>
      );
    } catch {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }
  };

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className="flex h-full w-full gap-0 sm:gap-4 overflow-hidden">
      {/* Sessions Sidebar */}
      <div
        className={`flex flex-col rounded-md border border-border bg-card transition-all duration-300
          ${showSidebar ? "w-full sm:w-72 flex-shrink-0" : "hidden sm:flex sm:w-72 flex-shrink-0"}`}
      >
        <div className="flex items-center justify-between border-b border-border p-3 sm:p-4">
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-semibold tracking-tight text-primary">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            {t.ai.sessions}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 text-primary border-primary/20 hover:bg-primary/10"
            onClick={handleCreateConversation}
            disabled={createConv.isPending}
          >
            {createConv.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 sm:h-4 sm:w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {isLoadingConvs ? (
            <div className="p-4 text-center text-sm font-mono text-muted-foreground">{t.ai.loading}</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">{t.ai.no_sessions}</div>
          ) : (
            <div className="flex flex-col p-2 gap-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-sm px-3 py-2.5 text-sm transition-colors ${
                    activeConvId === conv.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate text-xs sm:text-sm">{conv.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area — always LTR layout for message bubbles */}
      <div
        className={`flex-1 flex-col rounded-md border border-border bg-card min-w-0
          ${showSidebar ? "hidden sm:flex" : "flex"}`}
        dir="ltr"
      >
        {activeConvId ? (
          <>
            <div className="flex h-12 sm:h-14 items-center border-b border-border px-3 sm:px-4 font-mono text-xs sm:text-sm gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="sm:hidden text-muted-foreground hover:text-foreground p-1"
              >
                <BackIcon className="h-4 w-4" />
              </button>
              <span className="text-secondary">{t.ai.session_id}:</span>
              <span className="text-muted-foreground">{activeConvId.toString().padStart(4, "0")}</span>
              {isLoadingConv && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ms-2" />}
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4" ref={scrollRef}>
              <div className="flex flex-col gap-4 sm:gap-6">
                {activeConversation?.messages.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className={`flex gap-2 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-sm border ${
                      msg.role === "user"
                        ? "border-secondary/20 bg-secondary/10 text-secondary"
                        : "border-primary/20 bg-primary/10 text-primary"
                    }`}>
                      {msg.role === "user" ? <div className="text-[10px] font-mono">OP</div> : <Bot className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </div>
                    <div className={`flex max-w-[85%] sm:max-w-[80%] flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {format(new Date(msg.createdAt), "HH:mm:ss")}
                      </div>
                      <div className={`rounded-md border p-2.5 sm:p-3 text-xs sm:text-sm ${
                        msg.role === "user"
                          ? "border-secondary/20 bg-secondary/5 text-foreground"
                          : "border-primary/20 bg-primary/5 text-foreground prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-background prose-pre:border prose-pre:border-border"
                      }`}>
                        {msg.role === "user" ? renderMessageContent(msg.content) : <ReactMarkdown>{msg.content}</ReactMarkdown>}
                      </div>
                    </div>
                  </div>
                ))}

                {isStreaming && (
                  <div className="flex gap-2 sm:gap-4 flex-row">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-sm border border-primary/20 bg-primary/10 text-primary">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex max-w-[85%] flex-col gap-1 items-start">
                      <div className="text-[10px] font-mono text-primary animate-pulse">{t.ai.processing}</div>
                      <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 sm:p-3 text-xs sm:text-sm text-foreground prose prose-invert max-w-none">
                        <ReactMarkdown>{streamingText}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border bg-background/50 p-3 sm:p-4">
              {isOffline && (
                <div className="mb-2 flex items-center gap-2 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-mono text-destructive">
                  <WifiOff className="h-3 w-3 shrink-0" />
                  <span dir="auto">{t.ai.offline_warning}</span>
                </div>
              )}
              {selectedImage && (
                <div className="mb-2 inline-flex relative rounded-md border border-border bg-card p-1">
                  <img src={selectedImage} alt="Preview" className="h-16 sm:h-20 w-auto rounded-sm object-contain" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-2 -top-2 h-5 w-5 rounded-full border border-border bg-background hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageSelect} />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 border-border bg-card hover:bg-accent"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.ai.placeholder}
                  className="flex-1 h-9 text-xs sm:text-sm font-sans placeholder:text-muted-foreground/50 border-border bg-card focus-visible:ring-primary/50"
                  disabled={isStreaming || isOffline}
                  dir="auto"
                />
                <Button
                  type="submit"
                  disabled={isStreaming || (!inputText.trim() && !selectedImage) || isOffline}
                  className="h-9 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 px-3 sm:px-4"
                >
                  <Send className="h-4 w-4 sm:me-2" />
                  <span className="hidden sm:inline font-mono font-bold tracking-tight text-xs">{t.ai.execute}</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground p-6" dir="auto">
            <Bot className="mb-4 h-10 w-10 sm:h-12 sm:w-12 text-primary/20" />
            <p className="font-mono text-xs sm:text-sm tracking-widest text-primary/50 uppercase">
              {t.ai.no_session_title}
            </p>
            <p className="mt-2 text-xs sm:text-sm max-w-xs text-muted-foreground/70">
              {t.ai.no_session_desc}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 sm:hidden border-primary/20 text-primary hover:bg-primary/10"
              onClick={() => setShowSidebar(true)}
            >
              {t.ai.view_sessions}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
