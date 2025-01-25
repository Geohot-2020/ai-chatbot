'use client';
// 2025-01-25：新增 InlineDialog 组件
import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { Button } from './ui/button';
import { ArrowUpIcon } from './icons';
import { generateUUID } from '@/lib/utils';
import { useChat } from 'ai/react';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';

interface InlineDialogProps {
  className?: string;
  placeholder?: string;
  onExpand?: (expanded: boolean) => void;
}

export function InlineDialog({ 
  className,
  placeholder = "Search...",
  onExpand
}: InlineDialogProps) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className={cn("relative", className)}>
      <Input
        className="w-[200px] bg-muted border-none rounded-xl"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onClick={() => onExpand?.(true)}
      />
    </div>
  );
}

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue?: string;
  recentMessage?: string;
}

export function SearchDialog({
  isOpen,
  onClose,
  initialValue = '',
  recentMessage = '',
}: SearchDialogProps) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  const { messages, append, isLoading } = useChat({
    api: '/api/search-chat',
    body: {
      modelId: DEFAULT_MODEL_NAME,
    }
  });

  const handlePromptClick = async (prompt: string) => {
    setSearchValue('');
    setHasInteracted(true);
    await append({
      content: prompt,
      role: 'user',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && searchValue.trim()) {
      e.preventDefault();
      handlePromptClick(searchValue);
      setSearchValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <AnimatePresence mode="wait">
        <>
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          
          <motion.div
            key="dialog"
            className={cn(
              "relative w-full max-w-2xl mx-4 bg-background rounded-xl shadow-lg",
              !hasInteracted && "border"
            )}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              {!hasInteracted ? (
                <div className="flex-1 overflow-y-auto">
                  <div className="flex items-center p-4 border-b">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>Ask</span>
                        <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          AI
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <span className="sr-only">Close</span>
                      ×
                    </button>
                  </div>

                  <div className="p-4">
                    <Input
                      ref={inputRef}
                      className="w-full bg-transparent border rounded-xl"
                      placeholder="Ask a question..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  </div>

                  <div className="px-4 pb-4">
                    <div className="text-sm font-medium mb-2">Recents</div>
                    {recentMessage ? (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={() => handlePromptClick(recentMessage)}
                      >
                        {recentMessage}
                      </Button>
                    ) : (
                      <div className="text-sm text-muted-foreground">No recent questions</div>
                    )}
                  </div>

                  <div className="px-4 pb-4">
                    <div className="text-sm font-medium mb-2">Suggested Prompts</div>
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={() => handlePromptClick("What are the advantages of using Next.js?")}
                      >
                        What are the advantages of using Next.js?
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={() => handlePromptClick("Write code to demonstrate djikstra's algorithm")}
                      >
                        Write code to demonstrate djikstra's algorithm
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={() => handlePromptClick("Help me write an essay about silicon valley")}
                      >
                        Help me write an essay about silicon valley
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={() => handlePromptClick("What is the weather in San Francisco?")}
                      >
                        What is the weather in San Francisco?
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-[75vh]">
                  <div className="flex items-center p-3 border-b">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>Ask</span>
                        <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          AI
                        </div>
                      </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                      <span className="sr-only">Close</span>
                      ×
                    </button>
                  </div>

                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto"
                  >
                    {messages.map((message, index) => (
                      <PreviewMessage
                        key={message.id}
                        chatId={message.id}
                        message={message}
                        vote={undefined}
                        isLoading={isLoading && messages.length - 1 === index}
                        setMessages={() => {}}
                        reload={async () => null}
                        isReadonly={true}
                      />
                    ))}

                    {isLoading && messages.length > 0 && 
                     messages[messages.length - 1].role === 'user' && (
                      <ThinkingMessage />
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        className="flex-1"
                        placeholder="Ask a question..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <Button 
                        size="icon"
                        onClick={() => {
                          if (searchValue.trim()) {
                            handlePromptClick(searchValue);
                            setSearchValue('');
                          }
                        }}
                      >
                        <ArrowUpIcon />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      </AnimatePresence>
    </div>
  );
}
