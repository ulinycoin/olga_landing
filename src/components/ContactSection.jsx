import React from 'react';
import { Mail, Send, Copy, Check } from 'lucide-react';

const ContactSection = () => {
    const [copied, setCopied] = React.useState(false);

    const handleCopyEmail = (e, email) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleMailClick = (e, href) => {
        e.preventDefault();
        window.location.href = href;
    };

    const contacts = [
        {
            icon: <Mail className="w-6 h-6" />,
            label: 'Email',
            value: 'o.zegalina@inbox.lv',
            href: 'mailto:o.zegalina@inbox.lv',
            isMail: true
        },
        {
            icon: <Send className="w-6 h-6" />,
            label: 'Telegram',
            value: '@olga_zegalina_nutricionist',
            href: 'https://t.me/olga_zegalina_nutricionist',
            isMail: false
        }
    ];

    return (
        <section id="contacts" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-nutritionist-dark mb-4">Связаться со мной</h2>
                        <p className="text-nutritionist-dark/60 text-lg">Буду рада ответить на ваши вопросы и помочь на пути к здоровью</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {contacts.map((contact, idx) => (
                            <a
                                key={idx}
                                href={contact.href}
                                onClick={contact.isMail ? (e) => handleMailClick(e, contact.href) : undefined}
                                target={contact.isMail ? undefined : "_blank"}
                                rel="noopener noreferrer"
                                className="group p-8 rounded-3xl bg-nutritionist-accent border border-nutritionist-light/10 hover:border-nutritionist-light/30 transition-all flex flex-col items-center text-center hover:shadow-lg relative"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-nutritionist-light mb-6 group-hover:scale-110 transition-transform">
                                    {contact.icon}
                                </div>
                                <span className="text-xs uppercase tracking-widest text-nutritionist-dark/40 font-bold mb-2">{contact.label}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-semibold text-nutritionist-dark group-hover:text-nutritionist-light transition-colors">{contact.value}</span>
                                    {contact.isMail && (
                                        <button
                                            onClick={(e) => handleCopyEmail(e, contact.value)}
                                            className="p-2 rounded-lg bg-white/50 hover:bg-white text-nutritionist-light transition-colors shadow-sm"
                                            title="Скопировать почту"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                                {contact.isMail && copied && (
                                    <span className="absolute bottom-4 text-[10px] font-bold text-nutritionist-light uppercase tracking-widest animate-fade-in">
                                        Скопировано!
                                    </span>
                                )}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
