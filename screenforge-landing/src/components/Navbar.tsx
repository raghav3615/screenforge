"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Menu, X } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "Features", href: "#features" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-background/95 backdrop-blur-sm border-b border-border"
                    : "bg-transparent"
            )}
        >
            <nav className="max-w-5xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    <a href="/" className="flex items-center gap-3">
                        <Image
                            src="/icon.svg"
                            alt="ScreenForge"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <span className="font-semibold text-foreground">ScreenForge</span>
                    </a>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="https://github.com/raghav3615/ScreenForge"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                "bg-secondary hover:bg-secondary/80"
                            )}
                        >
                            <Star className="w-4 h-4" />
                            <span>Star</span>
                        </a>

                        <ThemeToggle />

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="md:hidden py-4 border-t border-border"
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
                            >
                                {link.name}
                            </a>
                        ))}
                    </motion.div>
                )}
            </nav>
        </motion.header>
    );
}
