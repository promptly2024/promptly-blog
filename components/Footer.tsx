"use client";
import React, { act } from 'react';
import {
    PenTool,
    Mail,
    Twitter,
    Facebook,
    Instagram,
    Linkedin,
    Github,
    Heart,
    ArrowUp,
    MapPin,
    Phone,
    Globe,
    BookOpen,
    Users,
    Award,
    Shield,
    Youtube
} from 'lucide-react';
import { toast } from 'sonner';

// Add a simple LoadingSpinner component
const LoadingSpinner = ({ className = "" }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
    </svg>
);

const Footer = () => {
    const [NewsletterEmail, setNewsletterEmail] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const Address = "128N/2C Bhola ka Pura,Allahabad, Uttar Pradesh, India 211001";
    const PhoneNumber = "+91 6392177974";
    const Email = "info@promptly.co.in";
    const footerSections = [
        {
            title: 'Platform',
            links: [
                { name: 'All Blogs', href: '/blogs' },
                { name: 'Categories', href: '/categories' },
                { name: 'Popular Posts', href: '/popular' },
                { name: 'Recent Posts', href: '/recent' },
                { name: 'Featured Writers', href: '/writers' }
            ]
        },
        {
            title: 'For Writers',
            links: [
                { name: 'Start Writing', href: '/write' },
                { name: 'Writing Guidelines', href: '/guidelines' },
                { name: 'Publishing Tips', href: '/tips' },
                { name: 'Writer Dashboard', href: '/dashboard' },
                { name: 'Analytics', href: '/analytics' }
            ]
        },
        {
            title: 'Resources',
            links: [
                { name: 'Help Center', href: '/help' },
                { name: 'Writing Tools', href: '/tools' },
                { name: 'Style Guide', href: '/style-guide' },
                { name: 'API Documentation', href: '/docs' },
                { name: 'Community Forum', href: '/forum' }
            ]
        },
        {
            title: 'Company',
            links: [
                { name: 'About Us', href: '/about' },
                { name: 'Careers', href: '/careers' },
                { name: 'Press Kit', href: '/press' },
                { name: 'Contact', href: '/contact' },
                { name: 'Blog', href: '/company-blog' }
            ]
        }
    ];

    const socialLinks = [
        // { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61562619766740', label: 'Facebook' },
        { icon: Youtube, href: 'https://www.youtube.com/@promptly_2024', label: 'YouTube' },
        { icon: Instagram, href: 'https://www.instagram.com/_promptly_/', label: 'Instagram' },
        { icon: Linkedin, href: 'https://www.linkedin.com/company/promptly-ai-private-limited', label: 'LinkedIn' },
        // { icon: Github, href: '#', label: 'GitHub' }
    ];

    const features = [
        { icon: BookOpen, text: 'Rich Text Editor' },
        { icon: Users, text: 'Community Driven' },
        { icon: Award, text: 'Quality Content' },
        { icon: Shield, text: 'Secure Platform' }
    ];

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const isValidEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!isValidEmailRegex.test(NewsletterEmail)) {
                toast.error('Please enter a valid email address.');
                setIsSubmitting(false);
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
            toast.success(`Subscribed with ${NewsletterEmail}`, {
                description: "Thank you for subscribing to our newsletter!, DB not implemented yet.",
                action: {
                    label: "Close", onClick: () => toast.dismiss()
                }
            });
            setNewsletterEmail('');
        } catch (error) {
            console.error('Subscription failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <footer className="bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-sky-400/20 to-blue-400/20"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative">
                {/* Main Footer Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                    {/* Top Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                        {/* Brand Section */}
                        <div className="lg:col-span-4">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="flex items-center justify-center w-12 h-12 bg-sky-500 rounded-xl shadow-lg">
                                    <PenTool className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold">Promptly Blog</h2>
                            </div>

                            <p className="text-slate-300 mb-6 leading-relaxed">
                                Empowering writers and readers worldwide. Share your stories,
                                discover amazing content, and join a community of passionate creators.
                            </p>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {features.map((feature, index) => {
                                    const IconComponent = feature.icon;
                                    return (
                                        <div key={index} className="flex items-center space-x-2 text-sm text-slate-300">
                                            <IconComponent className="w-4 h-4 text-sky-400" />
                                            <span>{feature.text}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Newsletter Signup */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg">Stay Updated</h3>
                                <div className="flex space-x-2">
                                    <input
                                        type="email"
                                        value={NewsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        disabled={isSubmitting}
                                        placeholder="Enter your email"
                                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-white placeholder-slate-400"
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleEmailSubmit(e) }}
                                    />
                                    <button className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg transition-colors flex items-center cursor-pointer" onClick={handleEmailSubmit} disabled={isSubmitting}>
                                        {isSubmitting ? <LoadingSpinner className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Links Sections */}
                        <div className="lg:col-span-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {footerSections.map((section, index) => (
                                    <div key={index}>
                                        <h3 className="font-semibold text-lg mb-4 text-sky-300">{section.title}</h3>
                                        <ul className="space-y-2">
                                            {section.links.map((link, linkIndex) => (
                                                <li key={linkIndex}>
                                                    <a
                                                        href={link.href}
                                                        className="text-slate-300 hover:text-white transition-colors duration-200 text-sm hover:underline"
                                                    >
                                                        {link.name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border-t border-slate-700 pt-8 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-5 h-5 text-sky-400" />
                                <div>
                                    <p className="font-medium">Address</p>
                                    <p className="text-slate-300 text-sm">{Address}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 cursor-pointer" onClick={(e) => { e.preventDefault(); window.location.href = `tel:${PhoneNumber}` }}>
                                <Phone className="w-5 h-5 text-sky-400" />
                                <div>
                                    <p className="font-medium">Phone</p>
                                    <p className="text-slate-300 text-sm">{PhoneNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 cursor-pointer" onClick={(e) => { e.preventDefault(); window.location.href = `mailto:${Email}` }}>
                                <Globe className="w-5 h-5 text-sky-400" />
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-slate-300 text-sm">{Email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        {/* Copyright */}
                        <div className="flex flex-col md:flex-row items-center md:space-x-2 text-slate-300 text-center md:text-left">
                            <span>&copy; 2025 Promptly Blog. All rights reserved.</span>
                            <span className="hidden md:inline">•</span>
                            <span className="flex items-center justify-center space-x-1 mt-1 md:mt-0">
                                <span>Made with</span>
                                <Heart className="w-4 h-4 text-red-400 fill-current" />
                                <span>for writers</span>
                            </span>
                        </div>

                        {/* Legal Links */}
                        <div className="flex items-center space-x-6 text-sm">
                            <a href="/privacy" className="text-slate-300 hover:text-white transition-colors">
                                Privacy Policy
                            </a>
                            <a href="/terms" className="text-slate-300 hover:text-white transition-colors">
                                Terms of Service
                            </a>
                            <a href="/cookies" className="text-slate-300 hover:text-white transition-colors">
                                Cookie Policy
                            </a>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center space-x-4">
                            {socialLinks.map((social, index) => {
                                const IconComponent = social.icon;
                                return (
                                    <a
                                        key={index}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="w-10 h-10 bg-slate-800 hover:bg-sky-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                                    >
                                        <IconComponent className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Scroll to Top Button */}
                <button
                    onClick={scrollToTop}
                    className="absolute bottom-8 right-8 w-12 h-12 bg-sky-500 hover:bg-sky-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="w-6 h-6 text-white group-hover:translate-y-1 transition-transform" />
                </button>
            </div>
        </footer>
    );
};

export default Footer;