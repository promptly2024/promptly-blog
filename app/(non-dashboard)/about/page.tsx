import React from 'react';
import {
    PenTool,
    Users,
    Hash,
    MessageCircle,
    Shield,
    Image,
    TrendingUp,
    Lock,
    Edit3,
    Calendar,
    Search,
    Heart,
    Zap,
    CheckCircle,
    Globe,
    FileText,
    Star,
    ArrowRight,
    Sparkles,
    Target,
    Layers,
    Clock
} from 'lucide-react';
import Link from 'next/link';

const AboutPage = () => {
    const features = [
        {
            icon: PenTool,
            title: "Empowering Writers",
            description: "Create posts with rich markdown content and beautiful cover images. Add SEO-friendly titles, descriptions, and links to reach a wider audience.",
            highlights: ["Rich Markdown Editor", "Beautiful Cover Images", "SEO Optimization", "Scheduled Publishing"],
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: Users,
            title: "Collaborate Seamlessly",
            description: "Invite collaborators with specific roles and permissions. Track changes with revision history to see how your content evolves.",
            highlights: ["Co-author & Contributor Roles", "Permission Management", "Revision History", "Real-time Collaboration"],
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: Hash,
            title: "Organize & Discover",
            description: "Tag your posts and assign categories for easy navigation. Explore content by topics, tags, or trending posts.",
            highlights: ["Smart Tagging System", "Category Organization", "Trending Discovery", "Content Navigation"],
            color: "from-green-500 to-emerald-500"
        },
        {
            icon: MessageCircle,
            title: "Engage & Interact",
            description: "Enable meaningful discussions with comments and reactions. Moderation tools ensure a safe and positive environment.",
            highlights: ["Rich Comments", "Reaction System", "Comment Moderation", "Community Building"],
            color: "from-orange-500 to-red-500"
        },
        {
            icon: Shield,
            title: "Smart Admin Tools",
            description: "Maintain quality with review processes and transparent approval logs. Admins can approve, reject, or archive posts.",
            highlights: ["Review Workflow", "Approval System", "Admin Dashboard", "Quality Control"],
            color: "from-indigo-500 to-purple-500"
        },
        {
            icon: Image,
            title: "Media Management",
            description: "Upload and manage images, videos, audio, and files. Easily attach media as covers or embedded content.",
            highlights: ["Multi-format Support", "Easy Integration", "Media Library", "Responsive Images"],
            color: "from-pink-500 to-rose-500"
        },
        {
            icon: TrendingUp,
            title: "Track & Analyze",
            description: "Monitor word count, reading time, and post history. Audit logs help maintain accountability and track performance.",
            highlights: ["Analytics Dashboard", "Reading Metrics", "Audit Logs", "Performance Tracking"],
            color: "from-teal-500 to-green-500"
        },
        {
            icon: Lock,
            title: "Secure & Flexible",
            description: "Soft deletion prevents accidental loss. Flexible collaboration and access settings give you complete control.",
            highlights: ["Data Protection", "Access Control", "Soft Deletion", "Security First"],
            color: "from-slate-500 to-gray-500"
        }
    ];

    const stats = [
        { number: "10K+", label: "Active Writers", icon: PenTool },
        { number: "50K+", label: "Published Posts", icon: FileText },
        { number: "100K+", label: "Community Members", icon: Users },
        { number: "99.9%", label: "Uptime", icon: Zap }
    ];

    const testimonials = [
        {
            name: "Rohit Kumar Yadav",
            role: "Software Engineer & Blogger",
            avatar: "RY",
            quote: "Promptly Blogs has completely changed how I draft and share my tech articles. The editor is smooth, and collaborating with other writers is seamless."
        },
        {
            name: "Samarth Rajput",
            role: "Content Strategist",
            avatar: "SR",
            quote: "The platform’s review and publishing tools make managing content teams so much easier. It’s exactly what our editorial workflow needed."
        },
        {
            name: "Shail Jaiswal",
            role: "Creative Writer",
            avatar: "SJ",
            quote: "Organizing my posts and connecting with readers has never been easier. Promptly Blogs truly helps writers focus on what they love — writing."
        }
    ];


    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                            <Sparkles className="w-4 h-4" />
                            More than just a blogging platform
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                            Where Stories Come to{' '}
                            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                                Life
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                            Promptly Blogs is designed to make writing, sharing, and discovering content
                            simple, collaborative, and engaging. Join thousands of writers in our thriving ecosystem.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/write" passHref>
                                <button className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto cursor-pointer">
                                    Start Writing Today
                                </button>
                            </Link>
                            <Link href="/blogs" passHref>
                                <button className="bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-slate-200 transition-all duration-200 hover:border-slate-300 w-full sm:w-auto cursor-pointer">
                                    Explore Posts
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-100 rounded-full mb-4">
                                    <stat.icon className="w-6 h-6 text-sky-600" />
                                </div>
                                <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">{stat.number}</div>
                                <div className="text-slate-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                            Everything You Need to Create Amazing Content
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            From powerful writing tools to collaborative features, we've built everything
                            writers and content creators need in one beautiful platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200">
                                <div className="flex items-start gap-6">
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
                                        <feature.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                        <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {feature.highlights.map((highlight, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                    <span className="text-sm text-slate-700">{highlight}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                            Simple Process, Powerful Results
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Get started in minutes and create engaging content that resonates with your audience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Create & Write",
                                description: "Use our intuitive markdown editor to craft beautiful posts with rich formatting and media.",
                                icon: Edit3,
                                color: "bg-blue-500"
                            },
                            {
                                step: "02",
                                title: "Collaborate & Review",
                                description: "Invite team members, gather feedback, and refine your content through our review process.",
                                icon: Users,
                                color: "bg-purple-500"
                            },
                            {
                                step: "03",
                                title: "Publish & Engage",
                                description: "Share your content with the world and engage with your audience through comments and reactions.",
                                icon: Globe,
                                color: "bg-green-500"
                            }
                        ].map((step, index) => (
                            <div key={index} className="text-center relative">
                                <div className={`inline-flex items-center justify-center w-16 h-16 ${step.color} rounded-full mb-6 shadow-lg`}>
                                    <step.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute top-8 left-4 bg-white text-slate-700 text-sm font-bold px-2 py-1 rounded-full border-2 border-slate-200">
                                    {step.step}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{step.description}</p>
                                {index < 2 && (
                                    <div className="hidden md:block absolute top-8 -right-4 z-10">
                                        <ArrowRight className="w-6 h-6 text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-gradient-to-br from-slate-50 to-sky-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                            Loved by Writers Everywhere
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            See what our community of writers and content creators have to say about their experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <blockquote className="text-slate-700 mb-6 leading-relaxed">
                                    "{testimonial.quote}"
                                </blockquote>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">{testimonial.name}</div>
                                        <div className="text-slate-600 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8">
                                Our Mission
                            </h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                                        <Target className="w-4 h-4 text-sky-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-2">Democratize Publishing</h3>
                                        <p className="text-slate-600">Make high-quality content creation and publishing accessible to everyone, regardless of technical expertise.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Layers className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-2">Foster Collaboration</h3>
                                        <p className="text-slate-600">Build tools that bring writers, editors, and readers together in meaningful ways.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <Heart className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-2">Celebrate Creativity</h3>
                                        <p className="text-slate-600">Provide a platform where creativity flourishes and every voice can be heard and valued.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-3xl p-8 lg:p-12">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl mb-8 shadow-lg">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Join Our Community</h3>
                                <p className="text-slate-600 mb-8 leading-relaxed">
                                    Be part of a growing community of writers, creators, and readers who are passionate about sharing great content.
                                </p>
                                <button className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer"
                                // onClick={() => router.push('/dashboard')}
                                >
                                    <Link href="/dashboard" passHref>
                                        <span className="block w-full h-full ">Get Started Free</span>
                                    </Link>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-24 bg-gradient-to-r from-sky-600 to-indigo-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Ready to Start Your Writing Journey?
                    </h2>
                    <p className="text-xl text-sky-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of writers who've already discovered the power of Promptly Blogs.
                        Start creating amazing content today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard" passHref>
                            <button className="bg-white hover:bg-slate-50 text-sky-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg w-full sm:w-auto cursor-pointer">
                                Create Free Account
                            </button>
                        </Link>
                        <Link href="/blogs" passHref>
                            <button className="bg-sky-700 hover:bg-sky-800 text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-sky-500 transition-all duration-200 w-full sm:w-auto cursor-pointer">
                                Explore Posts
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;