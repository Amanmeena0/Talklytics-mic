'use client';

import React, { useState } from 'react';
import Header from '@/shared/components/Layout/Header';
import Footer from '@/shared/components/Layout/Footer';
import { Mail, Phone, MapPin, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Simulate API submit delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setOrg('');
      setMessage('');
    } catch {
      setError('Failed to submit message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactFaqs = [
    {
      q: 'How fast do you respond to sales requests?',
      a: 'Our corporate development team typically responds to all inquiries within 2 business hours.',
    },
    {
      q: 'Do you offer custom Proof of Concept (POC) periods?',
      a: 'Yes. For mid-market and enterprise accounts, we can coordinate a 14-day dedicated sandbox pilot.',
    },
    {
      q: 'Can we schedule a live Zoom demonstration?',
      a: 'Absolutely. Fill out the contact form indicating your interest, and we will send a calendar scheduler link immediately.',
    },
  ];

  return (
    <div className="bg-[#FAFBFC] min-h-screen text-[#111827] font-sans antialiased overflow-x-hidden flex flex-col justify-between">
      <Header />

      <main className="flex-grow pt-24 pb-20">
        {/* Banner header */}
        <section className="max-w-7xl mx-auto px-6 text-center space-y-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs rounded-full"
          >
            <Sparkles className="w-3.5 h-3.5" />
            CONNECT WITH US
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight"
          >
            Let&apos;s Accelerate Your Revenue
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          >
            Have a question about features, custom scaling, or setting up a pilot? Our expert sales
            architect team is ready.
          </motion.p>
        </section>

        {/* Contact split section */}
        <section className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-16 items-start">
          {/* Left panel: Info & Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Talklytics Headquarters
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect via email, phone, or stop by our office. Our enterprise customer success
                networks operate 24/7.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Email Sales
                  </span>
                  <a
                    href="mailto:hello@talklytics.com"
                    className="text-xs font-semibold text-slate-800 hover:text-indigo-600 transition-colors"
                  >
                    hello@talklytics.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Phone Inquiries
                  </span>
                  <a
                    href="tel:+18005558255"
                    className="text-xs font-semibold text-slate-800 hover:text-indigo-600 transition-colors"
                  >
                    +1 (800) 555-TALK
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    HQ Corporate Address
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    100 Pine Street, Suite 2400
                    <br />
                    San Francisco, CA 94111
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-slate-200/60" />

            {/* Social channels links */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Follow Corporate Channels
              </span>
              <div className="flex gap-4">
                {['LinkedIn', 'Twitter/X', 'GitHub', 'Medium'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-xs text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Contact Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm space-y-6"
            >
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Enterprise Inquiry Form
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Please fill out this form to connect with our accounts team.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-4 py-8"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Inquiry Submitted
                      </h4>
                      <p className="text-xs text-emerald-600 leading-normal max-w-sm mx-auto">
                        Thank you for reaching out! A Talklytics Sales Engineer will contact you
                        within 2 business hours.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {error && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="user-name"
                          className="text-[10px] text-slate-500 font-bold uppercase tracking-wider"
                        >
                          Full Name *
                        </label>
                        <input
                          id="user-name"
                          type="text"
                          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-xs outline-none bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                          placeholder="e.g. Sarah Jenkins"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="user-email"
                          className="text-[10px] text-slate-500 font-bold uppercase tracking-wider"
                        >
                          Work Email *
                        </label>
                        <input
                          id="user-email"
                          type="email"
                          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-xs outline-none bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="user-org"
                        className="text-[10px] text-slate-500 font-bold uppercase tracking-wider"
                      >
                        Organization / Company
                      </label>
                      <input
                        id="user-org"
                        type="text"
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-xs outline-none bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                        placeholder="e.g. Stripe"
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="user-msg"
                        className="text-[10px] text-slate-500 font-bold uppercase tracking-wider"
                      >
                        How can we help? *
                      </label>
                      <textarea
                        id="user-msg"
                        rows={4}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-xs outline-none bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 resize-none"
                        placeholder="Detail your sales scaling needs or pilot inquiry..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-indigo-100 hover:shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending Inquiry...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Submit Inquiry
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Contact FAQ block */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Contact FAQ</h2>
            <p className="text-xs text-slate-500">
              Quick answers to common corporate engagement questions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {contactFaqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-2"
              >
                <h4 className="text-xs font-bold text-slate-800 leading-normal">{faq.q}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
