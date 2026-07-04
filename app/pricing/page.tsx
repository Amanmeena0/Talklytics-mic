'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/shared/components/Layout/Header';
import Footer from '@/shared/components/Layout/Footer';
import { Check, HelpCircle, Star, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free Plan',
      price: billingCycle === 'monthly' ? '$0' : '$0',
      period: billingCycle === 'monthly' ? '/mo' : '/yr',
      description: 'Experience real-time AI sales coaching at no cost.',
      features: [
        '3 hours of live call stream monitoring / mo',
        'Basic real-time sentiment analysis',
        'Standard BANT qualification checkmarks',
        'Call recording database (max 5 records)',
        'Standard email support',
      ],
      cta: 'Start Free',
      href: '/login',
      popular: false,
    },
    {
      name: 'Pro Plan',
      price: billingCycle === 'monthly' ? '$79' : '$69',
      period: billingCycle === 'monthly' ? '/mo' : '/mo, billed annually',
      description: 'Accelerate deal velocity with advanced coaching and CRM integrations.',
      features: [
        'Unlimited live call stream monitoring',
        'Full real-time AI Coach suggestion cards',
        'Objection handling & confidence meters',
        'Unlimited record database with search & filter',
        'Bi-directional CRM Sync (Salesforce & HubSpot)',
        'LLM Executive Call Summaries',
        'Priority Slack & email support',
      ],
      cta: 'Upgrade to Pro',
      href: '/login',
      popular: true,
    },
    {
      name: 'Enterprise Plan',
      price: 'Custom',
      period: '',
      description: 'Custom scaling, advanced analytics, and custom LLM deployments.',
      features: [
        'Dedicated server hosting for lowest latency',
        'Custom fine-tuned LLM coaching cards',
        'Team-wide performance & sentiment analytics',
        'Custom SSO (SAML/OIDC) & access roles',
        'Dedicated customer success manager',
        '99.9% uptime SLA guarantee',
        'Custom API access & webhooks',
      ],
      cta: 'Contact Sales',
      href: '/contact',
      popular: false,
    },
  ];

  const featuresMatrix = [
    {
      name: 'Live Monitoring Limit',
      free: '3 hours/mo',
      pro: 'Unlimited',
      enterprise: 'Unlimited',
    },
    {
      name: 'AI Coach cards',
      free: 'Basic suggestions',
      pro: 'Fully dynamic',
      enterprise: 'Custom fine-tuned',
    },
    { name: 'BANT scoring', free: 'Included', pro: 'Included', enterprise: 'Custom criteria' },
    {
      name: 'CRM Integrations',
      free: '—',
      pro: 'HubSpot & Salesforce',
      enterprise: 'Custom CRM + API',
    },
    { name: 'Call database storage', free: '5 calls', pro: 'Unlimited', enterprise: 'Unlimited' },
    {
      name: 'Support SLA',
      free: 'Email (48h)',
      pro: 'Slack & Email (4h)',
      enterprise: '24/7 Phone & Email (1h)',
    },
  ];

  const faqs = [
    {
      q: 'How does the live call streaming work?',
      a: 'Talklytics hooks into your Zoom, Google Meet, or Microsoft Teams audio outputs. It transcribes, translates, and scores the conversation in real-time, displaying objections and BANT criteria metrics dynamically.',
    },
    {
      q: 'Can I change my plan or billing cycle later?',
      a: 'Yes, you can upgrade, downgrade, or switch between monthly and annual billing cycles at any time from your Account Settings panel.',
    },
    {
      q: 'Is my conversation data private and secure?',
      a: 'Absolutely. Talklytics is SOC2 Type II compliant. All stream data is encrypted in transit and at rest. We never use your proprietary client conversations to train public LLM foundation models.',
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
            PRICING SCHEMES
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight"
          >
            Transparent, Value-Driven Plans
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          >
            Choose the tier that fits your sales team. Cancel or upgrade whenever you scale.
          </motion.p>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <span
              className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-12 h-6 bg-slate-200 rounded-full relative p-1 transition-all duration-300"
              aria-label="Billing Cycle Toggle"
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${billingCycle === 'yearly' ? 'translate-x-6 bg-indigo-600' : 'translate-x-0'}`}
              />
            </button>
            <span
              className={`text-xs font-semibold ${billingCycle === 'yearly' ? 'text-indigo-600' : 'text-slate-400'} flex items-center gap-1.5`}
            >
              Yearly (Save 15%)
              <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                Discounts
              </span>
            </span>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between hover:shadow-xl relative ${
                plan.popular
                  ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-md shadow-indigo-50/50'
                  : 'border-[#E5E7EB] hover:border-slate-300 shadow-sm'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold tracking-widest uppercase py-1 px-4 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-current" />
                  Most Popular
                </span>
              )}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{plan.period}</span>
                </div>

                <div className="w-full h-px bg-slate-100" />

                <ul className="space-y-3">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-xs text-slate-600 leading-normal"
                    >
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.href}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100'
                      : 'bg-white border border-[#E5E7EB] text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Feature Comparison Matrix */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Compare Full Capability Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Find the optimal scale tier details for your organization.
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
                    <th className="py-4 px-6">Feature</th>
                    <th className="py-4 px-6 text-center">Free</th>
                    <th className="py-4 px-6 text-center">Pro</th>
                    <th className="py-4 px-6 text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {featuresMatrix.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800">{row.name}</td>
                      <td className="py-4 px-6 text-center text-slate-500 font-medium">
                        {row.free}
                      </td>
                      <td className="py-4 px-6 text-center text-indigo-700 font-bold">{row.pro}</td>
                      <td className="py-4 px-6 text-center text-slate-950 font-medium">
                        {row.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ list */}
        <section className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pricing FAQ</h2>
            <p className="text-xs text-slate-500">
              Frequently asked questions about subscription schemes.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-2"
              >
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  {faq.q}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200/50 flex flex-wrap justify-center items-center gap-12 text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              SOC2 Type II Certified
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              ISO 27001 Certified
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
