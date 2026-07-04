'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/shared/components/Layout/Layout';
import PageHeader from '@/shared/components/Layout/PageHeader';
import Link from 'next/link';
import clientFetch from '@/shared/utils/clientFetch';
import {
  Users,
  Search,
  ArrowRight,
  Filter,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  MessageSquare,
  Building,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('All');

  useEffect(() => {
    const fetchCalls = async () => {
      setIsLoading(true);
      try {
        const res = await clientFetch('/api/calls?limit=100');
        if (res.ok) {
          const json = await res.json();
          const callData = json.calls || [];
          setCalls(callData);

          // Group calls by clientName to build unique contacts
          const contactsMap: Record<string, any> = {};

          callData.forEach((call: any) => {
            const client = call.clientName || 'Unknown Corp';
            if (!contactsMap[client]) {
              contactsMap[client] = {
                company: client,
                calls: [],
                contactPerson: getMockContactPerson(client),
                email: `procurement@${client.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`,
                role: 'Procurement / Stakeholder',
              };
            }
            contactsMap[client].calls.push(call);
          });

          // Convert grouped map to list and compute averages
          const contactsList = Object.values(contactsMap).map((contact: any) => {
            const callList = contact.calls;
            // Sort calls by date descending to get the latest
            callList.sort(
              (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            const totalCalls = callList.length;
            const latestCall = callList[0];

            // Compute average win probability & sentiment
            const avgProb = Math.round(
              callList.reduce((acc: number, c: any) => acc + (c.conversionProbability || 50), 0) /
                totalCalls
            );

            // Determine combined BANT checks met
            const bantBudgetCount = callList.filter((c: any) => c.bantBudgetMet).length;
            const bantAuthorityCount = callList.filter((c: any) => c.bantAuthorityMet).length;
            const bantNeedCount = callList.filter((c: any) => c.bantNeedMet).length;
            const bantTimelineCount = callList.filter((c: any) => c.bantTimelineMet).length;

            const totalBantChecks =
              (bantBudgetCount + bantAuthorityCount + bantNeedCount + bantTimelineCount) /
              (totalCalls * 4);
            const bantScore = Math.round(totalBantChecks * 100);

            // Dominant sentiment across calls
            const sentiments = callList.map((c: any) => c.overallSentiment);
            const sentimentCounts = sentiments.reduce((acc: Record<string, number>, s: string) => {
              acc[s] = (acc[s] || 0) + 1;
              return acc;
            }, {});

            let avgSentiment = 'Neutral';
            if (sentimentCounts['Positive'] > (sentimentCounts['Negative'] || 0)) {
              avgSentiment = 'Positive';
            } else if (sentimentCounts['Negative'] > (sentimentCounts['Positive'] || 0)) {
              avgSentiment = 'Negative';
            }

            return {
              id: latestCall.id, // Use latest call ID as route reference
              company: contact.company,
              contactPerson: contact.contactPerson,
              email: contact.email,
              role: contact.role,
              totalCalls,
              latestDate: latestCall.date,
              latestTitle: latestCall.title,
              avgProbability: avgProb,
              avgSentiment,
              bantScore,
              owner: latestCall.salesRep?.name || 'Default Sales Rep',
              ownerAvatar: latestCall.salesRep?.avatarUrl,
            };
          });

          setContacts(contactsList);
        }
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
  }, []);

  // Helper to generate a consistent mock name based on company name
  const getMockContactPerson = (company: string) => {
    const hash = company.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const firstNames = [
      'Sarah',
      'John',
      'Alex',
      'David',
      'Emily',
      'Michael',
      'Jessica',
      'Robert',
      'Rachel',
      'Daniel',
    ];
    const lastNames = [
      'Connor',
      'Doe',
      'Rivera',
      'Smith',
      'Davis',
      'Miller',
      'Wilson',
      'Anderson',
      'Taylor',
      'Thomas',
    ];
    return `${firstNames[hash % 10]} ${lastNames[(hash + 3) % 10]}`;
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSentiment = sentimentFilter === 'All' || c.avgSentiment === sentimentFilter;

    return matchesSearch && matchesSentiment;
  });

  return (
    <Layout>
      <main className="main-content min-h-screen pt-20 px-8 pb-16 font-sans text-slate-900 bg-[#FAFBFC]">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header section */}
          <PageHeader
            title="Prospect Contacts"
            subtitle="Manage organizations, conversation histories, and qualify deals dynamically."
            badge={
              <span className="inline-flex items-center gap-1.5 text-[9px] bg-indigo-50/80 text-indigo-600 border border-indigo-100/50 backdrop-blur-sm px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-widest shadow-sm">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                Customer Database
              </span>
            }
            actions={
              <span className="text-xs bg-slate-100 border border-slate-200/60 px-3 py-1.5 rounded-xl font-bold text-slate-600">
                Total Contacts: {contacts.length}
              </span>
            }
          />

          {/* Search and filter toolbar */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search contact, company, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-xl text-xs outline-none bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" />
                Sentiment
              </div>
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                {['All', 'Positive', 'Neutral', 'Negative'].map((sent) => (
                  <button
                    key={sent}
                    onClick={() => setSentimentFilter(sent)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sentimentFilter === sent
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {sent}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table list view */}
          {isLoading ? (
            <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-sm p-8 space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex items-center justify-between animate-pulse pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                    <div className="h-3 w-20 bg-slate-50 rounded" />
                  </div>
                  <div className="h-4 w-12 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-16 text-center space-y-4 shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  No Contacts Found
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-normal">
                  {searchQuery || sentimentFilter !== 'All'
                    ? 'No records match your active search filters. Try adjusting your query.'
                    : 'Analyze or record a call session to generate a clean customer dashboard database.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
                      <th className="py-4.5 px-6">Company / Primary Contact</th>
                      <th className="py-4.5 px-6">Latest Interaction</th>
                      <th className="py-4.5 px-6 text-center">Total Conversations</th>
                      <th className="py-4.5 px-6 text-center">BANT Score</th>
                      <th className="py-4.5 px-6 text-center">Win Probability</th>
                      <th className="py-4.5 px-6 text-center">Sentiment</th>
                      <th className="py-4.5 px-6">Lead Owner</th>
                      <th className="py-4.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredContacts.map((contact) => (
                      <tr
                        key={contact.company}
                        className="hover:bg-slate-50/40 transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 border border-indigo-100/50">
                              <Building className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {contact.company}
                              </span>
                              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <User className="w-3 h-3" />
                                {contact.contactPerson} ({contact.role})
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div>
                            <span className="text-slate-800 font-semibold block truncate max-w-xs">
                              {contact.latestTitle}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(contact.latestDate).toLocaleDateString(undefined, {
                                dateStyle: 'medium',
                              })}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg">
                            {contact.totalCalls}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/40 text-indigo-700 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                            <Sparkles className="w-3 h-3 fill-indigo-100" />
                            {contact.bantScore}%
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full transition-all"
                                style={{ width: `${contact.avgProbability}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-800 text-[11px]">
                              {contact.avgProbability}%
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex justify-center">
                            {contact.avgSentiment === 'Positive' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                                <Smile className="w-3 h-3 text-emerald-500 fill-emerald-100/30" />
                                Positive
                              </span>
                            ) : contact.avgSentiment === 'Negative' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg">
                                <Frown className="w-3 h-3 text-red-500 fill-red-100/30" />
                                Negative
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
                                <Meh className="w-3 h-3 text-amber-500 fill-amber-100/30" />
                                Neutral
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                              <img
                                src={contact.ownerAvatar}
                                className="w-full h-full object-cover"
                                alt="Owner"
                              />
                            </div>
                            <span className="font-semibold text-slate-700 text-[11px]">
                              {contact.owner}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/dashboard/contacts/${contact.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors group-hover:translate-x-0.5 duration-200"
                          >
                            Details
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
