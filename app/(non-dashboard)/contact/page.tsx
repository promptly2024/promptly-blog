"use client";

import React, { useState } from 'react';
import {
    Mail,
    Send,
    MessageCircle,
    HelpCircle,
    FileText,
    Twitter,
    Linkedin,
    Github,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    BookOpen,
    Zap,
    Users,
    Shield,
    Bug,
    Lightbulb,
    MessageSquare,
    Globe,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { createContactQuery } from '@/actions/contact-us-queries';
import { isValidEmail } from '@/utils/isValid';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
    });
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const contactOptions = [
        {
            icon: Mail,
            title: "Email Support",
            description: "Send us a detailed message and we'll get back to you",
            action: "Send Message Below",
            responseTime: "Usually within 24-48 hours",
            color: "from-blue-500 to-cyan-500",
            primary: true
        },
        {
            icon: BookOpen,
            title: "Help Documentation",
            description: "Browse our comprehensive guides and tutorials",
            action: "Visit Help Center",
            responseTime: "Instant answers 24/7",
            color: "from-green-500 to-emerald-500",
            link: "/help"
        },
        {
            icon: MessageSquare,
            title: "Community Forum",
            description: "Connect with other users and get community support",
            action: "Join Discussion",
            responseTime: "Community-driven support",
            color: "from-purple-500 to-pink-500",
            link: "/community"
        },
        {
            icon: FileText,
            title: "Feature Requests",
            description: "Suggest new features or improvements",
            action: "Submit Idea",
            responseTime: "Reviewed monthly",
            color: "from-orange-500 to-red-500",
            link: "/feedback"
        }
    ];

    const inquiryTypes = [
        {
            icon: HelpCircle,
            type: "general",
            title: "General Support",
            description: "Account issues, how-to questions, general help",
            examples: ["Can't access my account", "How do I use feature X?", "General questions"]
        },
        {
            icon: Bug,
            type: "bug",
            title: "Bug Report",
            description: "Something isn't working as expected",
            examples: ["Feature not loading", "Error messages", "Unexpected behavior"]
        },
        {
            icon: Lightbulb,
            type: "feature",
            title: "Feature Request",
            description: "Suggest new features or improvements",
            examples: ["New feature ideas", "Workflow improvements", "Integration requests"]
        },
        {
            icon: Shield,
            type: "security",
            title: "Security & Privacy",
            description: "Security concerns or privacy questions",
            examples: ["Security vulnerability", "Privacy policy questions", "Data concerns"]
        },
        {
            icon: Users,
            type: "collaboration",
            title: "Collaboration Issues",
            description: "Problems with team features or permissions",
            examples: ["Can't invite collaborators", "Permission issues", "Team management"]
        },
        {
            icon: Globe,
            type: "content",
            title: "Content & Publishing",
            description: "Issues with writing, editing, or publishing",
            examples: ["Publishing problems", "Content not saving", "Editor issues"]
        }
    ];

    const faqs = [
        {
            question: "How do I reset my password?",
            answer: "You can reset your password by clicking the 'Forgot Password' link on the login page. Enter your email address and we'll send you a reset link. If you don't receive the email within a few minutes, check your spam folder."
        },
        {
            question: "Can I collaborate with others on my blog posts?",
            answer: "Yes! You can invite collaborators to your posts with different permission levels. Go to your post settings and use the 'Invite Collaborators' feature to add team members as co-authors, editors, or reviewers."
        },
        {
            question: "How do I publish my post?",
            answer: "Once you've finished writing your post, click the 'Publish' button in the editor. You can also schedule your post for later by selecting a future date and time. Published posts will be visible to your audience immediately or at the scheduled time."
        },
        {
            question: "What file types can I upload?",
            answer: "You can upload images (JPG, PNG, GIF, WebP up to 10MB), videos (MP4, WebM up to 100MB), and documents (PDF up to 25MB). All files are automatically optimized for web performance."
        },
        {
            question: "How do I delete or archive a post?",
            answer: "Go to your dashboard, find the post you want to delete, and click the three-dot menu. Select 'Archive' to hide it from public view or 'Delete' to move it to trash. Deleted posts can be restored within 30 days."
        },
        {
            question: "Can I export my content?",
            answer: "Yes! You can export individual posts as Markdown, HTML, or PDF from the post menu. For bulk exports, go to Settings > Export Data to download all your content at once."
        },
        {
            question: "How do I report inappropriate content?",
            answer: "Click the flag icon on any post or comment that violates our community guidelines. Provide a brief reason for the report, and our team will review it within 24-48 hours."
        },
        {
            question: "Is my content backed up?",
            answer: "Yes, all content is automatically backed up multiple times daily. We also use soft deletion, so accidentally deleted content can be recovered. However, we recommend occasionally exporting your important content as a personal backup."
        }
    ];

    const socialLinks = [
        {
            icon: Twitter,
            url: "https://twitter.com/promptlyblogs",
            label: "Twitter",
            description: "Latest updates and announcements"
        },
        {
            icon: Github,
            url: "https://github.com/promptlyblogs",
            label: "GitHub",
            description: "Open source projects and issues"
        },
        {
            icon: Linkedin,
            url: "https://linkedin.com/company/promptlyblogs",
            label: "LinkedIn",
            description: "Professional updates and company news"
        }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
            toast.error("Please fill in all required fields.", {
                description: "Make sure to complete all fields marked with *.",
                action: {
                    label: "Got it", onClick: () => toast.dismiss()
                }
            });
            return;
        }
        if (!isValidEmail(formData.email)) {
            toast.error("Please enter a valid email address.", {
                action: {
                    label: "Got it", onClick: () => toast.dismiss()
                }
            });
            return;
        }
        try {
            setIsSubmitting(true);

            const response = await createContactQuery({
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                category: formData.category,
                message: formData.message
            });

            if (!response.id) {
                toast.error("Failed to submit your query. Please try again later.", {
                    action: {
                        label: "Got it", onClick: () => toast.dismiss()
                    }
                });
                return;
            } else {
                toast.success("Your message has been sent!", {
                    description: "We'll get back to you within 24-48 hours.",
                    action: {
                        label: "Got it", onClick: () => toast.dismiss()
                    }
                });
                setIsSubmitted(true);
            }
        } catch (error) {
            toast.error("Failed to submit your query. Please try again later.", {
                action: {
                    label: "Got it", onClick: () => toast.dismiss()
                }
            });
        } finally {
            setIsSubmitting(false);
            setFormData({
                name: '',
                email: '',
                subject: '',
                category: '',
                message: ''
            });
        }
    };

    const toggleFaq = (index: number) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    const selectedInquiryType = inquiryTypes.find(type => type.type === formData.category);

    return (
        <div className="min-h-screen bg-slate-50">
            <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] opacity-20"></div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                        How can we{' '}
                        <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                            help you?
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                        We're here to support you on your writing journey. Choose the best way to get the help you need.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        We typically respond within 24-48 hours
                    </div>
                </div>
            </section>

            {/* Contact Options */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {contactOptions.map((option, index) => (
                            <div key={index} className={`relative bg-white border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${option.primary ? 'border-sky-200 bg-sky-50' : 'border-slate-200'}`}>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center mb-4 shadow-lg`}>
                                    <option.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{option.title}</h3>
                                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{option.description}</p>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-slate-900">{option.action}</div>
                                    <div className="text-xs text-slate-500">{option.responseTime}</div>
                                </div>
                                {option.primary && (
                                    <div className="absolute top-3 right-3 bg-sky-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                        Recommended
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Contact Form */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-8 py-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Send us a message</h2>
                            <p className="text-sky-100">We'll get back to you as soon as possible</p>
                        </div>

                        <div className="p-8">
                            {isSubmitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Message Sent Successfully!</h3>
                                    <p className="text-slate-600 mb-4">
                                        Thank you for reaching out. We've received your message and will respond within 24-48 hours.
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        You should receive a confirmation email shortly.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                                            What can we help you with? *
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Select a category</option>
                                            {inquiryTypes.map((type) => (
                                                <option key={type.type} value={type.type}>{type.title}</option>
                                            ))}
                                        </select>
                                        {selectedInquiryType && (
                                            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="flex items-start gap-3">
                                                    <selectedInquiryType.icon className="w-5 h-5 text-slate-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-slate-700 mb-2">{selectedInquiryType.description}</p>
                                                        <p className="text-xs text-slate-500">
                                                            <strong>Examples:</strong> {selectedInquiryType.examples.join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                            placeholder="Brief description of your question or issue"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={6}
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
                                            placeholder="Please provide as much detail as possible. Include steps to reproduce any issues, what you expected to happen, and what actually happened."
                                            required
                                        />
                                        <div className="mt-2 text-xs text-slate-500">
                                            {formData.message.length}/1000 characters
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex gap-3">
                                            <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-medium text-blue-900 mb-1">Before sending your message:</h4>
                                                <ul className="text-sm text-blue-700 space-y-1">
                                                    <li>• Check our FAQ section below for quick answers</li>
                                                    <li>• Include relevant details like browser, device, or error messages</li>
                                                    <li>• For bug reports, describe the steps to reproduce the issue</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Sending Message...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-slate-600">
                            Quick answers to common questions. Can't find what you're looking for? Send us a message above.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-100 transition-colors"
                                >
                                    <span className="font-medium text-slate-900">{faq.question}</span>
                                    {expandedFaq === index ? (
                                        <ChevronUp className="w-5 h-5 text-slate-500" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-500" />
                                    )}
                                </button>
                                {expandedFaq === index && (
                                    <div className="px-6 pb-4 border-t border-slate-200 bg-white">
                                        <div className="pt-4 text-slate-600 leading-relaxed">{faq.answer}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-slate-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Other Ways to Get Help
                        </h2>
                        <p className="text-slate-600">
                            Explore these resources for additional support and information.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl p-6 border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Follow Us</h3>
                            <div className="space-y-3">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <social.icon className="w-5 h-5 text-slate-600 mt-0.5" />
                                        <div>
                                            <div className="font-medium text-slate-900 text-sm">{social.label}</div>
                                            <div className="text-xs text-slate-500">{social.description}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Self-Help Resources</h3>
                            <div className="space-y-3">
                                <a href="/help" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <BookOpen className="w-5 h-5 text-slate-600" />
                                    <div>
                                        <div className="font-medium text-slate-900 text-sm">Documentation</div>
                                        <div className="text-xs text-slate-500">Complete guides & tutorials</div>
                                    </div>
                                </a>
                                <a href="/contact" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <Users className="w-5 h-5 text-slate-600" />
                                    <div>
                                        <div className="font-medium text-slate-900 text-sm">Community Forum</div>
                                        <div className="text-xs text-slate-500">Connect with other users</div>
                                    </div>
                                </a>
                                <a href="/status" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <Zap className="w-5 h-5 text-slate-600" />
                                    <div>
                                        <div className="font-medium text-slate-900 text-sm">System Status</div>
                                        <div className="text-xs text-slate-500">Check service availability</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl p-6 border border-sky-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Response Times</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-slate-700">General Support</span>
                                        <span className="text-sm text-slate-600">24-48h</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-slate-700">Bug Reports</span>
                                        <span className="text-sm text-slate-600">12-24h</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full w-3/4"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-slate-700">Security Issues</span>
                                        <span className="text-sm text-slate-600">2-6h</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-red-500 h-2 rounded-full w-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;