"use client";

import { cn } from "@/lib/utils";

const techStack = [
    { name: "Electron", icon: "⚡" },
    { name: "React", icon: "⚛️" },
    { name: "TypeScript", icon: "📘" },
    { name: "Windows", icon: "🪟" },
    { name: "Vite", icon: "🚀" },
    { name: "Chart.js", icon: "📊" },
];

export function InfiniteScroll() {
    // Duplicate items for seamless loop
    const items = [...techStack, ...techStack];

    return (
        <section className="py-16 overflow-hidden border-y border-border bg-muted/30">
            <div className="relative">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                {/* Scrolling content */}
                <div className="animate-scroll flex items-center gap-12 w-max">
                    {items.map((item, index) => (
                        <div
                            key={`${item.name}-${index}`}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 rounded-lg",
                                "bg-card border border-border",
                                "hover:border-accent/50 transition-colors"
                            )}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-sm font-medium text-foreground whitespace-nowrap">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
