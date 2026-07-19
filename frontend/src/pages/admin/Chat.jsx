import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import {
  FiSend,
  FiCopy,
  FiCheck,
  FiCpu,
  FiTrendingUp,
  FiDroplet,
  FiUsers,
  FiFileText,
  FiPlus,
  FiMessageSquare,
  FiSidebar,
  FiX,
} from "react-icons/fi";
import { aiApi, apiErrorMessage } from "../../utils/api";

// Component to handle typewriter effect word-by-word for AI responses
function MarkdownResponse({ content, isNew, onComplete }) {
  const [displayedText, setDisplayedText] = useState(isNew ? "" : content);

  useEffect(() => {
    if (!isNew) {
      setDisplayedText(content);
      return;
    }

    let index = 0;
    const words = content.split(" ");

    if (words.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        const nextWord = words[index];
        const newText = prev + (prev ? " " : "") + nextWord;
        index++;
        if (index >= words.length) {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 100);
        }
        return newText;
      });
    }, 40); // Comfortable speed of 40ms per word

    return () => clearInterval(interval);
  }, [content, isNew]);

  return (
    <div className="prose max-w-none text-slate-800 text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-lg font-bold mt-4 mb-2 text-ink border-b pb-1 border-slate-100"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-md font-bold mt-3 mb-1.5 text-ink border-b pb-0.5 border-slate-50"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-sm font-semibold mt-2 mb-1 text-ink"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="leading-relaxed mb-2.5" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-2.5 space-y-1.5" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-2.5 space-y-1.5" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-sm text-slate-700" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-ink" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-600" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 shadow-sm">
              <table
                className="w-full border-collapse text-xs text-left"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead
              className="bg-slate-50 text-ink uppercase border-b border-slate-200 font-semibold"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 text-slate-700 font-bold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-3 py-2 border-b border-slate-100 text-slate-600"
              {...props}
            />
          ),
          code: ({ node, ...props }) => (
            <code
              className="bg-slate-100 text-rose-600 px-1 py-0.5 rounded font-mono text-xs"
              {...props}
            />
          ),
        }}
      >
        {displayedText}
      </ReactMarkdown>
    </div>
  );
}

export default function Chat() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("sai_chat_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse chat sessions", e);
      }
    }
    // Default initial session
    const initialSession = {
      id: "session-" + Date.now(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const savedActive = localStorage.getItem("sai_chat_active_session_id");
    if (savedActive) return savedActive;
    return sessions[0]?.id || "";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sai_chat_sidebar_open");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const sidebarRef = useRef(null);
  const toggleBtnRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        (!toggleBtnRef.current || !toggleBtnRef.current.contains(event.target))
      ) {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync sidebar open state to localStorage
  useEffect(() => {
    localStorage.setItem("sai_chat_sidebar_open", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ||
    sessions[0] || { messages: [] };
  const messages = activeSession.messages;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync sessions to localStorage
  useEffect(() => {
    localStorage.setItem("sai_chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Sync activeSessionId to localStorage
  useEffect(() => {
    localStorage.setItem("sai_chat_active_session_id", activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeSessionId]);

  const handleNewChat = () => {
    const newSession = {
      id: "session-" + Date.now(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      const resetSession = {
        id: "session-" + Date.now(),
        title: "New Chat",
        messages: [],
        createdAt: Date.now(),
      };
      setSessions([resetSession]);
      setActiveSessionId(resetSession.id);
      toast.success("Chat history cleared.");
      return;
    }

    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);

    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0]?.id || "");
    }
    toast.success("Chat deleted.");
  };

  const handleSend = async (textToSend) => {
    const prompt = (textToSend || input).trim();
    if (!prompt) return;

    if (!textToSend) {
      setInput("");
    }

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: prompt,
    };

    // Update active session messages & title
    setSessions((prevSessions) => {
      return prevSessions.map((session) => {
        if (session.id === activeSessionId) {
          const updatedMessages = [...session.messages, userMessage];
          const updatedTitle =
            session.title === "New Chat" && session.messages.length === 0
              ? prompt.length > 25
                ? prompt.substring(0, 25) + "..."
                : prompt
              : session.title;

          return {
            ...session,
            title: updatedTitle,
            messages: updatedMessages,
          };
        }
        return session;
      });
    });

    setIsLoading(true);

    try {
      const response = await aiApi.chat(prompt);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.reply || "No response received.",
        isAnimated: false,
      };

      setSessions((prevSessions) => {
        return prevSessions.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, aiMessage],
            };
          }
          return session;
        });
      });
    } catch (error) {
      const errorMsg = apiErrorMessage(error).toLowerCase();
      const isQuota =
        error?.response?.status === 429 ||
        errorMsg.includes("quota") ||
        errorMsg.includes("exhausted") ||
        errorMsg.includes("429") ||
        JSON.stringify(error).toLowerCase().includes("quota") ||
        JSON.stringify(error).toLowerCase().includes("exhausted");

      const errorText = isQuota
        ? "⚠️ **API Quota Exceeded:** The AI Assistant is receiving too many requests, and the Google Gemini API query limits have been reached. Please wait a minute and try again."
        : "**Error:** " +
          apiErrorMessage(
            error,
            "Failed to connect to the server. Please try again.",
          );

      toast.error(
        isQuota
          ? "API Quota Exceeded"
          : apiErrorMessage(error, "Failed to get response from SaiBot."),
      );

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: errorText,
        isAnimated: true,
      };

      setSessions((prevSessions) => {
        return prevSessions.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, errorMessage],
            };
          }
          return session;
        });
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTypingComplete = (id) => {
    setSessions((prevSessions) => {
      return prevSessions.map((session) => {
        if (session.id === activeSessionId) {
          const updated = session.messages.map((msg) =>
            msg.id === id ? { ...msg, isAnimated: true } : msg,
          );
          return { ...session, messages: updated };
        }
        return session;
      });
    });
  };

  const suggestions = [
    {
      title: "Revenue & Finance",
      prompt: "What is today's revenue?",
      icon: FiTrendingUp,
      bg: "bg-amber-100 text-amber-600 border-amber-200/40",
    },
    {
      title: "Tank Status",
      prompt: "What is the status of the fuel tanks?",
      icon: FiDroplet,
      bg: "bg-sky-100 text-sky-600 border-sky-200/40",
    },
    {
      title: "Daily Report",
      prompt: "Give me today's daily report",
      icon: FiFileText,
      bg: "bg-emerald-100 text-emerald-600 border-emerald-200/40",
    },
    {
      title: "Top Performer",
      prompt: "Who is the top performing employee?",
      icon: FiUsers,
      bg: "bg-rose-100 text-rose-600 border-rose-200/40",
    },
  ];

  return (
    <div className="w-full flex h-[calc(100vh-92px)] bg-white overflow-hidden relative">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute inset-0 bg-slate-900/10 backdrop-blur-xs z-20 transition-opacity duration-300"
        />
      )}

      {/* Main Chat Workspace (Left side) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-brand shrink-0">
              <FiCpu className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-ink leading-none">
                  Sai AI Assistant
                </h1>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-muted">
                Online • Operations & Dashboard Intelligence
              </p>
            </div>
          </div>

          {/* Sidebar Toggle when collapsed (now on the right of the header!) */}
          {!isSidebarOpen && (
            <button
              ref={toggleBtnRef}
              onClick={() => setIsSidebarOpen(true)}
              title="Open sidebar"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-ink transition shrink-0"
            >
              <FiSidebar className="text-lg" />
            </button>
          )}
        </header>

        {/* Chat Messages Workspace */}
        <div className="flex-1 overflow-y-auto py-8">
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 space-y-6">
            {messages.length === 0 ? (
              /* Welcome / Suggestion Screen */
              <div className="flex flex-col justify-center py-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    Welcome to Sai AI
                  </h2>
                  <p className="mt-3 text-sm font-semibold text-muted leading-relaxed max-w-xl mx-auto px-2">
                    Ask a question to analyze operations, calculate fuel sales,
                    check tanks, or summarize shifts. Select a task below or
                    chat:
                  </p>
                </div>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl mx-auto w-full mt-2 px-2 sm:px-0">
                  {suggestions.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSend(item.prompt)}
                        className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-lg p-2.5 shrink-0 transition duration-200 ${item.bg}`}
                          >
                            <Icon className="text-base" />
                          </div>
                          <span className="text-sm font-bold text-ink group-hover:text-brand transition duration-200">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-slate-400 font-light text-xl leading-none group-hover:text-brand transition duration-200 pr-1">
                          +
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Active Chat Messages */
              <div className="space-y-6">
                {messages.map((message) => {
                  const isUser = message.sender === "user";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex max-w-[90%] sm:max-w-[80%] items-start gap-3 ${
                          isUser ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isUser
                              ? "bg-blue-100 text-brand"
                              : "bg-slate-100 text-ink border border-slate-200"
                          }`}
                        >
                          {isUser ? "AD" : <FiCpu className="text-sm" />}
                        </div>

                        {/* Bubble Container */}
                        <div className="relative group">
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-sm ${
                              isUser
                                ? "bg-brand text-white rounded-tr-none"
                                : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                            }`}
                          >
                            {isUser ? (
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {message.text}
                              </p>
                            ) : (
                              <MarkdownResponse
                                content={message.text}
                                isNew={!message.isAnimated}
                                onComplete={() =>
                                  handleTypingComplete(message.id)
                                }
                              />
                            )}
                          </div>

                          {/* Copy button for AI replies */}
                          {!isUser && (
                            <button
                              onClick={() =>
                                handleCopyText(message.text, message.id)
                              }
                              className="absolute -right-8 top-2 rounded-md p-1.5 text-slate-400 opacity-100 lg:opacity-0 transition-opacity hover:bg-slate-50 hover:text-slate-600 group-hover:opacity-100"
                              title="Copy reply"
                            >
                              {copiedId === message.id ? (
                                <FiCheck className="text-emerald-500" />
                              ) : (
                                <FiCopy className="text-xs" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Thinking/Generating Bubble */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[85%] items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-ink border border-slate-200">
                        <FiCpu className="text-sm" />
                      </div>
                      <div className="rounded-2xl px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-tl-none">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted animate-pulse">
                            SaiBot is thinking
                          </span>
                          <div className="flex gap-1 items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Footer Form */}
        <footer className="shrink-0 p-4 bg-white border-t border-slate-100/50">
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Type a message or select a suggestion above..."
                className="field pr-12 pl-5 rounded-2xl py-3.5 shadow-sm border border-slate-200 focus:border-brand bg-white"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2.5 rounded-xl text-slate-400 hover:text-brand transition shrink-0 flex items-center justify-center disabled:opacity-30 disabled:hover:text-slate-400"
                title="Send Message"
              >
                <FiSend className="text-lg" />
              </button>
            </form>
            <p className="mt-2.5 text-center text-[10px] font-semibold text-muted select-none">
              SaiBot may generate inaccurate information about shifts, refills,
              or sales. Double check critical metrics.
            </p>
          </div>
        </footer>
      </div>

      {/* Collapsible Chat History Sidebar (Right side) */}
      <div
        ref={sidebarRef}
        className={`transition-all duration-300 border-l border-slate-100 bg-white lg:bg-slate-50/30 flex flex-col shrink-0 z-30
          ${isSidebarOpen ? "w-64 border-l" : "w-0 overflow-hidden border-l-0"}
          absolute lg:relative right-0 top-0 bottom-0 h-full shadow-2xl lg:shadow-none
        `}
      >
        {/* Sidebar Header with Collapse Toggle on Left, New Chat on Right */}
        <div className="p-4 border-b border-slate-100/80 shrink-0 flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(false)}
            title="Close sidebar"
            className="p-2 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-100 transition shrink-0"
          >
            <FiSidebar className="text-lg" />
          </button>
          <button
            onClick={handleNewChat}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-ink hover:border-slate-300 transition duration-200 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm group"
          >
            <FiPlus className="text-base text-slate-400 group-hover:text-ink transition duration-200" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  // Auto close sidebar on mobile after selecting a chat
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold cursor-pointer transition duration-200 select-none ${
                  isActive
                    ? "bg-blue-50 text-brand"
                    : "text-ink hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FiMessageSquare
                    className={`text-base shrink-0 ${
                      isActive ? "text-brand" : "text-slate-400"
                    }`}
                  />
                  <span className="truncate pr-2">{session.title}</span>
                </div>

                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="text-slate-400 hover:text-red-500 p-1 rounded transition opacity-0 group-hover:opacity-100 shrink-0"
                  title="Delete chat"
                >
                  <FiX className="text-xs" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100/80 bg-slate-50/20 text-center shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Sai Pump Assistant v1.4
          </span>
        </div>
      </div>
    </div>
  );
}
