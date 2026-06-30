import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.integration.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.nextStep.deleteMany({});
  await prisma.engagementRecord.deleteMany({});
  await prisma.callComment.deleteMany({});
  await prisma.call.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@convincesense.com',
      name: 'Alex Rivera',
      role: 'ADMIN',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBydN9a-URkUyb3EbMEXrxRRb35zw61rKWQ7f3QcdwXBQrIa8blJRm9flK0WbBbOjWAQyw6yBXqeiOPw9A7a3ngJ3S7Le2X-QXAZIgnd88et1q7etjADf0KLje2R6eHsXAW4haDHneZxCRUONnAlkjdludfTwpAg3RfFcasH2NH1G4jLMJqS5j6LIEUiye1zcL4in7zFU-AIteWTeAFKq5NlUek2mHAEpjs5RGuL8QpW8WsRlPEHwswXnL4oYjStpG4CWyyowvqog',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@convincesense.com',
      name: 'Sarah Connor',
      role: 'MANAGER',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const salesRep = await prisma.user.create({
    data: {
      email: 'jane.smith@convincesense.com',
      name: 'Jane Smith',
      role: 'SALES_REP',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  console.log('Seeded users.');

  // 3. Seed Integrations
  await prisma.integration.createMany({
    data: [
      {
        name: 'Salesforce',
        connected: true,
        config: JSON.stringify({
          instanceUrl: 'https://acme.my.salesforce.com',
          syncFrequency: 'realtime',
          mappedFields: { CallScore: 'Engagement_Score__c', Transcript: 'Call_Transcript__c' }
        }),
      },
      {
        name: 'Slack',
        connected: true,
        config: JSON.stringify({
          channel: '#sales-alerts',
          notifyOnBuyingSignals: true,
          notifyOnObjections: true
        }),
      },
      {
        name: 'HubSpot',
        connected: false,
        config: JSON.stringify({
          syncDeals: true,
          syncNotes: true
        }),
      },
    ],
  });

  console.log('Seeded integrations.');

  // 4. Seed Call 1: Acme Corp Q4 Renewal (Detailed Call)
  const call1 = await prisma.call.create({
    data: {
      id: 'cs-9842-x',
      title: 'Acme Corp Q4 Renewal',
      clientName: 'Acme Corp',
      salesRepId: salesRep.id,
      date: new Date('2023-10-24T10:00:00Z'),
      duration: 1452, // 24m 12s
      status: 'COMPLETED',
      overallSentiment: 'Positive',
      averageScore: 4.1,
      averageEnergy: 0.42,
      averageConfidence: 0.88,
      conversionProbability: 82,
      isFavorite: true,
      summary: 'The call was primarily a discovery and scoping session for the upcoming Q4 renewal. Jane successfully navigated the initial skepticism regarding the seat-based pricing model by highlighting the new AI-driven integration capabilities. Key stakeholder Mike showed significant interest in the automated reporting feature but remains cautious about the implementation timeline.',
      bantBudget: '$120k - $150k Annual',
      bantBudgetMet: true,
      bantAuthority: 'Decision Maker Present (Mike Johnson, VP of Sales)',
      bantAuthorityMet: true,
      bantNeed: 'Automate compliance monitoring to meet regulatory standards by Dec 31st.',
      bantNeedMet: true,
      bantTimeline: 'Target Go-Live: Dec 15 (Tight window)',
      bantTimelineMet: false,
    },
  });

  // Seed Transcript / Engagement Records for Call 1
  await prisma.engagementRecord.createMany({
    data: [
      {
        callId: call1.id,
        timestamp: 10.5,
        score: 3,
        transcript: 'Good morning Mike, great to see you again. I wanted to dive straight into the integration roadmap we discussed briefly over email last week. How has the team been handling the new compliance guidelines?',
        sentiment: 'Neutral',
        buyingSignals: JSON.stringify([]),
        hesitations: JSON.stringify([]),
        detectedIntents: JSON.stringify(['INFORMATION']),
        intentConfidence: 0.85,
        recommendation: 'Establish rapport and outline the agenda clearly.',
        energy: 0.35,
        confidence: 0.90,
        speaker: 'Jane Smith',
      },
      {
        callId: call1.id,
        timestamp: 45.2,
        score: 4,
        transcript: "Hi Jane. Honestly, it's been a bit of a headache. The manual auditing process is taking our managers nearly 10 hours a week each. We need a way to automate this, but we're worried about the learning curve for the newer reps.",
        sentiment: 'Negative',
        buyingSignals: JSON.stringify(['need a way to automate this']),
        hesitations: JSON.stringify(['honestly', 'a bit of']),
        detectedIntents: JSON.stringify(['OBJECTION']),
        intentConfidence: 0.92,
        recommendation: 'Acknowledge the pain point (manual auditing taking 10 hours/week) and reassure them about the ease of onboarding.',
        energy: 0.31,
        confidence: 0.87,
        speaker: 'Mike Johnson',
      },
      {
        callId: call1.id,
        timestamp: 132.4,
        score: 5,
        transcript: 'Yes, we are definitely interested, but what does the pricing scale look like for 50 seats? We would need it integrated with our Salesforce by mid-December.',
        sentiment: 'Positive',
        buyingSignals: JSON.stringify(['definitely interested', 'pricing scale']),
        hesitations: JSON.stringify(['but']),
        detectedIntents: JSON.stringify(['PRICING', 'COMMITMENT']),
        intentConfidence: 0.94,
        recommendation: '💡 Discuss pricing breakdown clearly — be transparent and highlight multi-year discounts.',
        energy: 0.38,
        confidence: 0.89,
        speaker: 'Mike Johnson',
      },
      {
        callId: call1.id,
        timestamp: 215.1,
        score: 4,
        transcript: "Our pricing structure for 50 seats includes our tier-1 support and full Salesforce integration. If we sign a multi-year renewal, I can secure a 15% discount, bringing the annual cost down. We also have dedicated implementation support to meet that December 15th go-live date.",
        sentiment: 'Positive',
        buyingSignals: JSON.stringify(['Salesforce integration', '15% discount', 'implementation support']),
        hesitations: JSON.stringify([]),
        detectedIntents: JSON.stringify(['PRICING']),
        intentConfidence: 0.96,
        recommendation: 'Emphasize the dedicated team resources to lower their implementation anxiety.',
        energy: 0.45,
        confidence: 0.92,
        speaker: 'Jane Smith',
      },
      {
        callId: call1.id,
        timestamp: 310.8,
        score: 4.5,
        transcript: "That sounds very reasonable. If you can send over the security whitepaper for our technical lead, Sarah, to review, and draft the agreement with the multi-year terms, we can review it in our next sync.",
        sentiment: 'Positive',
        buyingSignals: JSON.stringify(['review agreement', 'multi-year terms']),
        hesitations: JSON.stringify([]),
        detectedIntents: JSON.stringify(['COMMITMENT']),
        intentConfidence: 0.95,
        recommendation: 'Confirm action items immediately and lock in the next meeting time.',
        energy: 0.41,
        confidence: 0.91,
        speaker: 'Mike Johnson',
      }
    ],
  });

  // Seed Next Steps for Call 1
  await prisma.nextStep.createMany({
    data: [
      {
        callId: call1.id,
        title: 'Send Technical Whitepaper',
        description: 'Requested by Sarah regarding security protocols.',
        isCompleted: false,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      },
      {
        callId: call1.id,
        title: 'Draft Renewal Agreement',
        description: 'Update pricing to reflect the 15% multi-year discount.',
        isCompleted: false,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
      },
      {
        callId: call1.id,
        title: 'Schedule Implementation Sync',
        description: 'Address the bandwidth concerns raised by the ops team.',
        isCompleted: true,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      },
    ],
  });

  // 5. Seed Call 2: Globex Corp Demo (Positive completed call)
  const call2 = await prisma.call.create({
    data: {
      title: 'Globex Corp Product Demo',
      clientName: 'Globex Corp',
      salesRepId: salesRep.id,
      date: new Date('2023-10-23T14:30:00Z'),
      duration: 1120, // ~18 mins
      status: 'COMPLETED',
      overallSentiment: 'Positive',
      averageScore: 3.8,
      averageEnergy: 0.39,
      averageConfidence: 0.81,
      conversionProbability: 60,
      isFavorite: false,
      summary: 'Jane presented the main ConvinceSense dashboard features to Globex executives. The team responded very positively to the real-time recommendations but asked about CRM data latency.',
      bantBudget: 'Under review. Initial budget estimate around $80k.',
      bantBudgetMet: false,
      bantAuthority: 'Evaluation committee led by David G.',
      bantAuthorityMet: false,
      bantNeed: 'Provide better coaching tools for remote sales team.',
      bantNeedMet: true,
      bantTimeline: 'Q1 target deployment.',
      bantTimelineMet: true,
    },
  });

  await prisma.engagementRecord.createMany({
    data: [
      {
        callId: call2.id,
        timestamp: 12.0,
        score: 3.5,
        transcript: 'Welcome David, let me show you how our system tracks real-time engagement and provides live advice during calls.',
        sentiment: 'Positive',
        buyingSignals: JSON.stringify([]),
        hesitations: JSON.stringify([]),
        detectedIntents: JSON.stringify(['INFORMATION']),
        intentConfidence: 0.90,
        recommendation: 'Highlight dashboard simplicity.',
        energy: 0.38,
        confidence: 0.85,
        speaker: 'Jane Smith',
      },
      {
        callId: call2.id,
        timestamp: 85.0,
        score: 4.2,
        transcript: 'Wow, the timeline chart updating dynamically is exactly what our managers need to evaluate sales performance. Can we export this data to our CRM database?',
        sentiment: 'Positive',
        buyingSignals: JSON.stringify(['exactly what we need', 'export data to CRM']),
        hesitations: JSON.stringify([]),
        detectedIntents: JSON.stringify(['INFORMATION']),
        intentConfidence: 0.93,
        recommendation: 'Detail Salesforce and HubSpot native sync settings.',
        energy: 0.44,
        confidence: 0.89,
        speaker: 'David G.',
      }
    ]
  });

  // 6. Seed Call 3: Initech Pilot Discussion (Negative/Struggling call)
  const call3 = await prisma.call.create({
    data: {
      title: 'Initech Pilot Review & Objections',
      clientName: 'Initech',
      salesRepId: salesRep.id,
      date: new Date('2023-10-20T11:00:00Z'),
      duration: 1980, // 33 mins
      status: 'COMPLETED',
      overallSentiment: 'Negative',
      averageScore: 2.2,
      averageEnergy: 0.25,
      averageConfidence: 0.70,
      conversionProbability: 25,
      isFavorite: false,
      summary: 'A difficult call with Initech where the prospect raised strong objections to the overall cost and questioned the value compared to standard transcription tools.',
      bantBudget: '$40k budget limit (Firm)',
      bantBudgetMet: false,
      bantAuthority: 'Bill Lumbergh has final veto.',
      bantAuthorityMet: false,
      bantNeed: 'Basic transcription, not convinced about necessity of real-time coaching.',
      bantNeedMet: false,
      bantTimeline: 'No firm target date.',
      bantTimelineMet: false,
    },
  });

  await prisma.engagementRecord.createMany({
    data: [
      {
        callId: call3.id,
        timestamp: 10.0,
        score: 2.0,
        transcript: "To be honest, we already use basic call recording, and I don't see why we should pay five times more for real-time analysis.",
        sentiment: 'Negative',
        buyingSignals: JSON.stringify([]),
        hesitations: JSON.stringify(['to be honest']),
        detectedIntents: JSON.stringify(['OBJECTION']),
        intentConfidence: 0.95,
        recommendation: 'Contrast transcription tools with dynamic coaching that actually closes deals.',
        energy: 0.22,
        confidence: 0.78,
        speaker: 'Bill Lumbergh',
      }
    ]
  });

  // 7. Seed Call 4: Stark Industries Kickoff (Completed Call)
  const call4 = await prisma.call.create({
    data: {
      title: 'Stark Industries Enterprise Scoping',
      clientName: 'Stark Industries',
      salesRepId: salesRep.id,
      date: new Date('2023-10-18T16:00:00Z'),
      duration: 2400, // 40 mins
      status: 'COMPLETED',
      overallSentiment: 'Positive',
      averageScore: 4.6,
      averageEnergy: 0.51,
      averageConfidence: 0.93,
      conversionProbability: 95,
      isFavorite: true,
      summary: 'Stark Industries is ready to roll out ConvinceSense to their 200-person international sales division. Focus is on data privacy and custom AI prompts.',
      bantBudget: '$400k+ enterprise budget allocated.',
      bantBudgetMet: true,
      bantAuthority: 'Pepper Potts approved authorization.',
      bantAuthorityMet: true,
      bantNeed: 'Scale sales training consistency across EU and US offices.',
      bantNeedMet: true,
      bantTimeline: 'Target signing date: Nov 1.',
      bantTimelineMet: true,
    },
  });

  // 8. Seed 5 more dummy completed calls for sorting, filtering, and pagination
  const dummyClients = ['Umbrella Corp', 'Hooli', 'Wayne Enterprises', 'Cyberdyne Systems', 'Tyrell Corp'];
  for (let i = 0; i < dummyClients.length; i++) {
    const sentiment = i % 3 === 0 ? 'Positive' : i % 3 === 1 ? 'Neutral' : 'Negative';
    const score = i % 3 === 0 ? 4.5 : i % 3 === 1 ? 3.2 : 1.8;
    const probability = i % 3 === 0 ? 90 : i % 3 === 1 ? 55 : 15;

    await prisma.call.create({
      data: {
        title: `${dummyClients[i]} Discovery Call`,
        clientName: dummyClients[i],
        salesRepId: salesRep.id,
        date: new Date(Date.now() - (i + 5) * 24 * 60 * 60 * 1000), // 5+ days ago
        duration: 1200 + i * 200,
        status: 'COMPLETED',
        overallSentiment: sentiment,
        averageScore: score,
        averageEnergy: 0.3 + (i * 0.05),
        averageConfidence: 0.65 + (i * 0.05),
        conversionProbability: probability,
        isFavorite: false,
        summary: `Discovery call with ${dummyClients[i]} team regarding AI-powered coaching tools. Scoped initial requirements and timelines.`,
        bantBudget: 'Under discussion',
        bantBudgetMet: i % 2 === 0,
        bantAuthority: 'Initial evaluation contacts',
        bantAuthorityMet: i % 3 === 0,
        bantNeed: 'Automated call reviews and summaries.',
        bantNeedMet: true,
        bantTimeline: 'Target within 3 months',
        bantTimelineMet: false,
      }
    });
  }

  // 9. Seed Comments on Call 1
  await prisma.callComment.createMany({
    data: [
      {
        callId: call1.id,
        authorId: manager.id,
        content: "Excellent handling of the CRM integration timeline objection here. This really convinced Mike.",
        timestamp: 132.4,
      },
      {
        callId: call1.id,
        authorId: salesRep.id,
        content: "Thanks, Sarah! Having the live recommendation flash up helped me steer the discussion to the dedicated support resources.",
        timestamp: 215.1,
      }
    ]
  });

  // 10. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: salesRep.id,
        title: 'New Call Summary Ready',
        description: 'AI summary and insights for Acme Corp Q4 Renewal are now available.',
        type: 'SUCCESS',
        read: false,
      },
      {
        userId: salesRep.id,
        title: 'Objection Detected in Stark Industries Call',
        description: 'A data compliance objection was raised in the enterprise scoping call.',
        type: 'WARNING',
        read: false,
      },
      {
        userId: salesRep.id,
        title: 'Slack Integration Synced',
        description: 'Successfully posted call metrics for Globex Corp Demo to #sales-alerts.',
        type: 'INFO',
        read: true,
      }
    ]
  });

  // 11. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'INTEGRATION_CONNECT',
        details: 'Connected Salesforce integration',
      },
      {
        userId: manager.id,
        action: 'COMMENT_CREATE',
        details: 'Added a review comment on Acme Corp Q4 Renewal call',
      },
      {
        userId: salesRep.id,
        action: 'CALL_FAVORITE',
        details: 'Favorited Acme Corp Q4 Renewal call',
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
