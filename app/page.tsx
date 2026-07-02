'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  useEffect(() => {
    // Simple micro-interaction for cards
    const cards = document.querySelectorAll('.shadow-nature-hover');
    cards.forEach((card) => {
      const element = card as HTMLElement;
      const mouseEnterHandler = () => {
        element.style.transform = 'translateY(-4px)';
      };
      const mouseLeaveHandler = () => {
        element.style.transform = 'translateY(0)';
      };
      element.addEventListener('mouseenter', mouseEnterHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);
      
      // Cleanup on unmount
      return () => {
        element.removeEventListener('mouseenter', mouseEnterHandler);
        element.removeEventListener('mouseleave', mouseLeaveHandler);
      };
    });
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface/90 backdrop-blur-md docked full-width top-0 z-50 sticky shadow-sm dark:shadow-none shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border-b border-surface-container-high">
        <div className="flex justify-between items-center w-full px-container-padding max-w-[1280px] mx-auto h-20">
          <div className="flex items-center gap-2">
            <span className="font-title text-headline-lg font-extrabold text-on-background tracking-tighter">
              ConvinceSense
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="font-label-bold text-label-bold text-primary border-b-2 border-primary pb-1 no-underline" href="#">
              Product
            </Link>
            <Link className="font-label-bold text-label-bold text-secondary hover:text-primary transition-colors duration-200 no-underline" href="#">
              Solutions
            </Link>
            <Link className="font-label-bold text-label-bold text-secondary hover:text-primary transition-colors duration-200 no-underline" href="#">
              Pricing
            </Link>
            <Link className="font-label-bold text-label-bold text-secondary hover:text-primary transition-colors duration-200 no-underline" href="#">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden sm:block font-label-bold text-label-bold text-on-background hover:opacity-80 transition-opacity px-4 py-2 no-underline">
              Login
            </Link>
            <Link href="/dashboard" className="bg-primary-container text-on-primary-container font-label-bold text-label-bold px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-nature no-underline">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-section-gap gradient-mesh">
          <div className="max-w-[1280px] mx-auto px-container-padding grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high text-primary font-label-bold text-label-bold rounded-full mb-6">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                AI-POWERED SALES INTELLIGENCE
              </span>
              <h1 className="font-title text-headline-xl text-on-background mb-6 max-w-2xl mx-auto lg:mx-0">
                Master Every Conversation with AI Intelligence
              </h1>
              <p className="font-body-lg text-body-lg text-secondary mb-8 max-w-xl mx-auto lg:mx-0">
                Transform your sales calls into data-driven insights. Get real-time sentiment analysis, automated BANT qualification, and executive summaries to close deals faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/dashboard" className="bg-primary-container text-on-primary-container font-label-bold text-label-bold px-8 py-4 rounded-2xl shadow-nature hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase no-underline">
                  Go to Dashboard <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link href="/dashboard" className="border-2 border-primary text-primary font-label-bold text-label-bold px-8 py-4 rounded-2xl hover:bg-primary-container/10 transition-all uppercase no-underline text-center">
                  Our Solutions
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="Tech entrepreneur smiling warmly"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7GzjmExqSzHlkbnYKZfnxrxLjAMOdBn7wxH1pzTnAn-e2H7L6oIhIwmymLXIuv639UNaSeXnE_swZItnrZIYCjiMur-IWu3YAYWXBxZ28JOgCN_FjUbw7Amf_N-1vK4dlRAJiUrt3a_aVvI-I93YRSRtZK9PxEYCq4zzs8Dw_sc0T8EwuvfLd8jfDAhiHqWjYfDVL6sD8hh6gp6QrWLy6Kr34k6-hu7VvUzCLeQOpeYGagmWBEVs"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="Business woman with glasses"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDc1WeIhchrVpYGmS-ILqQIOcd82H_LHaxgoGU1S0GsZ4Z7Qp2fyOGwzcRWsr-rbSHqHTWDb8tWu7Os9udL7Bh50mYtgi9a3FHrtiU0g_gzkmDdwsX3ziQq53tI4dsGfvZWpBtWC8Fi_PaTT6nDriiDEiLQtmoDy5JcFpgVx3bdBCEzpDdFRNtFZ6xS1oxUeFAEuArT7dB_y8WuFilUOgu58THdpZFwFrOwEm6v3Wmgfy2vu6dQIhs"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="Software executive in studio"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuARQrxo9i6r0Bu5w0-Zu1R0N0v78KDZL5W2Lk_Omw2r9rDiHUrkiun_oD98J8RBoXJKpXqO0sWIcOvLWwa89o0uq9g1YJkRRu8tnvoHAIwckAL-XisXfL63tT-Vn850eKMNmNNq3uWdJh_CLNEx37keVqceqRRpZ4qQNwqOb-BmQJ82_9qsleuUgtqwz39B-WwXzXH61BWUEmXHt1npjFR6WL0wsQicvso5cdw_ifd-dRqYjKFQ4Tk"
                    />
                  </div>
                </div>
                <p className="font-label-sm text-label-sm text-secondary">
                  <span className="font-bold text-primary">500+</span> teams closing smarter
                </p>
              </div>
            </div>
            <div className="relative lg:h-[600px] flex items-center justify-center">
              {/* Modern Illustration Component */}
              <div className="relative w-full max-w-[500px] aspect-square">
                <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-[80px] animate-pulse"></div>
                <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-surface-container-high transform hover:-rotate-1 transition-transform duration-500 overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-error/20"></div>
                      <div className="w-3 h-3 rounded-full bg-primary-container/20"></div>
                      <div className="w-3 h-3 rounded-full bg-surface-container-highest"></div>
                    </div>
                    <span className="text-label-sm font-label-bold text-primary bg-primary-container/10 px-2 py-1 rounded">
                      LIVE ANALYSIS
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-white">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                        <span className="material-symbols-outlined text-white">sentiment_satisfied</span>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-3/4 bg-secondary/20 rounded mb-2"></div>
                        <div className="h-2 w-1/2 bg-secondary/10 rounded"></div>
                      </div>
                      <span className="text-primary font-bold">92%</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-surface-container-high shadow-sm">
                      <h4 className="font-label-bold text-label-bold text-on-background mb-3">
                        BANT QUALIFICATION
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 bg-primary-container/5 rounded">
                          <span className="material-symbols-outlined text-primary text-[16px] font-variation-settings-fill">
                            check_circle
                          </span>
                          <span className="text-label-sm font-medium">Budget</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-primary-container/5 rounded">
                          <span className="material-symbols-outlined text-primary text-[16px] font-variation-settings-fill">
                            check_circle
                          </span>
                          <span className="text-label-sm font-medium">Authority</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-primary-container/5 rounded">
                          <span className="material-symbols-outlined text-primary text-[16px] font-variation-settings-fill">
                            check_circle
                          </span>
                          <span className="text-label-sm font-medium">Need</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-surface-container-low rounded">
                          <span className="material-symbols-outlined text-secondary text-[16px]">pending</span>
                          <span className="text-label-sm font-medium">Timeline</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative h-32 rounded-xl overflow-hidden border border-surface-container-high">
                      <img
                        className="w-full h-full object-cover"
                        alt="AI dashboard curves visual"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFYc20fC6SOuW8vEi-fo6lDPVKQb8EkriNx6yLPrjQwpn-SOtiH4bNslFG9YdUsX7b8N6f2oc30SrOoLH5hCEgmTji5LEYGTiYWghusDcQ2xnaTZQLjqIss0X3mFV589VOaYa33a72mSzHICm2No0cFEVOlrSHmGGmcwDGxrwARPODgElOfQ31WUvH5JqO7e1tSoymObbB3o0_mWXXRnO5Hq3SHl9KIwvgdM8eG0f3fSltje2Nc9o"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <span className="text-label-sm font-bold text-on-background">Executive Summary Ready</span>
                        <Link href="/dashboard" className="bg-on-background text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold no-underline">
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating Badges */}
                <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-lg border border-surface-container-high flex items-center gap-3">
                  <div className="bg-primary-container p-2 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">trending_up</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-label-bold text-secondary uppercase m-0">Win Rate</p>
                    <p className="font-headline-lg-mobile text-primary m-0">+24%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-section-gap bg-surface-container-low">
          <div className="max-w-[1280px] mx-auto px-container-padding">
            <div className="text-center mb-16">
              <h2 className="font-title text-headline-xl text-on-background mb-4">Core Intelligence Engines</h2>
              <p className="font-body-lg text-body-lg text-secondary max-w-2xl mx-auto">
                We don't just record calls; we decode them. Our proprietary AI analyzes every nuance to give you a competitive edge.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-gutter">
              {/* Feature Card 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-nature shadow-nature-hover transition-all border border-surface-container-high group">
                <div className="w-14 h-14 bg-primary-container/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-primary text-[32px] group-hover:text-white transition-colors">
                    psychology
                  </span>
                </div>
                <h3 className="font-title text-headline-lg-mobile text-on-background mb-4">Sentiment Analysis</h3>
                <p className="text-secondary font-body-md mb-6">
                  Real-time emotional tracking detects hesitation, excitement, or skepticism, allowing reps to pivot their strategy mid-call.
                </p>
                <ul className="space-y-3 p-0 list-none">
                  <li className="flex items-center gap-2 text-label-sm font-medium">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    Tone identification
                  </li>
                  <li className="flex items-center gap-2 text-label-sm font-medium">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    Objections flagging
                  </li>
                </ul>
              </div>
              {/* Feature Card 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-nature shadow-nature-hover transition-all border border-surface-container-high group">
                <div className="w-14 h-14 bg-primary-container/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-primary text-[32px] group-hover:text-white transition-colors">
                    fact_check
                  </span>
                </div>
                <h3 className="font-title text-headline-lg-mobile text-on-background mb-4">BANT Qualification</h3>
                <p className="text-secondary font-body-md mb-6">
                  Automated tracking of Budget, Authority, Need, and Timeline ensures no prospect slips through the cracks without full validation.
                </p>
                <ul className="space-y-3 p-0 list-none">
                  <li className="flex items-center gap-2 text-label-sm font-medium">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    Auto-populated CRM
                  </li>
                  <li className="flex items-center gap-2 text-label-sm font-medium">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    Gap detection
                  </li>
                </ul>
              </div>
              {/* Feature Card 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-nature shadow-nature-hover transition-all border border-surface-container-high group">
                <div className="w-14 h-14 bg-primary-container/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-primary text-[32px] group-hover:text-white transition-colors">
                    description
                  </span>
                </div>
                <h3 className="font-title text-headline-lg-mobile text-on-background mb-4">Executive Summaries</h3>
                <p className="text-secondary font-body-md mb-6">
                  Ditch the manual notes. Our AI generates concise, action-oriented summaries perfect for stakeholder review.
                </p>
                <ul className="space-y-3 p-0 list-none">
                  <li className="flex items-center gap-2 text-label-sm font-medium">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    1-minute read time
                  </li>
                  <li className="flex items-center gap-2 text-label-sm font-medium">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    Next steps extractor
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Content Section */}
        <section className="py-section-gap overflow-hidden bg-background">
          <div className="max-w-[1280px] mx-auto px-container-padding">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="md:w-1/2">
                <div className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-nature">
                  <img
                    className="w-full aspect-video object-cover transform transition-transform duration-700 group-hover:scale-105"
                    alt="Futuristic offices with graphs"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuArUjfiB2TBQAMEdG3tFBDnZANSHvvpkYLTGF27oQ9VxkrEecNZ5HRq01RqJoNskf_0rby2wtGtz2NpUxqi4lQ05XNFW5cKZem4sQJ_zPv0OxrcfTt6nTzcwZlt8qneM3D2Ur6NHDH2ubHwf3eCGAtbBhxwADa9APnrgcayW_bvjXYbaAwMywN1X31TWNgEENqvlIbvf-VWeTPBLGxY971XfwkC_qY_dGUuXN85vbClcKVU1q5jtBU"
                  />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-4xl">play_arrow</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="font-title text-headline-xl text-on-background mb-6">Designed for Growth Optimism</h2>
                <p className="font-body-lg text-body-lg text-secondary mb-8">
                  Experience a UI that breathes. ConvinceSense uses expansiveness and crisp contrast to help you focus on what matters: the human connection. Our platform doesn't just work better; it feels better.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-container text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">eco</span>
                    </div>
                    <div>
                      <p className="font-label-bold text-label-bold text-on-background m-0">Sustainable Efficiency</p>
                      <p className="text-label-sm text-secondary m-0">Reduce call prep and post-call tasks by up to 60%.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-container text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">bolt</span>
                    </div>
                    <div>
                      <p className="font-label-bold text-label-bold text-on-background m-0">Precision Insights</p>
                      <p className="text-label-sm text-secondary m-0">Our models are trained on high-performance sales frameworks.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-section-gap max-w-[1280px] mx-auto px-container-padding">
          <div className="bg-on-background rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-surface-container-highest/10 rounded-full blur-[100px]"></div>
            <div className="relative z-10">
              <h2 className="font-title text-headline-xl text-white mb-6">Ready to close smarter?</h2>
              <p className="font-body-lg text-body-lg text-surface-container-high max-w-xl mx-auto mb-10">
                Join the next generation of sales leaders who use ConvinceSense to turn every conversation into a conversion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/dashboard" className="bg-primary-container text-on-primary-container font-label-bold text-label-bold px-10 py-5 rounded-2xl hover:opacity-90 transition-all uppercase tracking-wider no-underline text-center">
                  Get Started Free
                </Link>
                <Link href="/dashboard" className="bg-white/10 text-white font-label-bold text-label-bold px-10 py-5 rounded-2xl hover:bg-white/20 transition-all uppercase tracking-wider border border-white/20 no-underline text-center">
                  Watch Demo
                </Link>
              </div>
              <p className="mt-8 text-secondary/70 text-label-sm">No credit card required. 14-day free trial.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-surface-container-high">
        <div className="px-container-padding py-section-gap max-w-[1280px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="font-title text-headline-lg-mobile font-bold text-primary mb-6 block">
                ConvinceSense
              </span>
              <p className="text-secondary font-body-md mb-6 pr-8">
                The world's leading AI-powered conversation intelligence platform for modern sales teams.
              </p>
              <div className="flex gap-4">
                <a className="w-10 h-10 rounded-full bg-white border border-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all no-underline" href="#">
                  <span className="material-symbols-outlined">public</span>
                </a>
                <a className="w-10 h-10 rounded-full bg-white border border-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all no-underline" href="#">
                  <span className="material-symbols-outlined">chat</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-label-bold text-label-bold text-on-background mb-6 uppercase tracking-wider">Product</h4>
              <ul className="space-y-4 p-0 list-none">
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="/dashboard">Product Tour</Link></li>
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="/dashboard">Case Studies</Link></li>
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="/dashboard">Pricing Plans</Link></li>
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="/dashboard">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-label-bold text-label-bold text-on-background mb-6 uppercase tracking-wider">Resources</h4>
              <ul className="space-y-4 p-0 list-none">
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="#">Sales Blog</Link></li>
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="#">Community</Link></li>
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="#">Webinars</Link></li>
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="#">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-label-bold text-label-bold text-on-background mb-6 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-4 p-0 list-none">
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="#">Privacy Policy</Link></li>
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="#">Terms of Service</Link></li>
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="#">Security</Link></li>
                <li><Link className="font-body-md text-body-md text-secondary hover:text-primary transition-transform duration-200 hover:translate-x-1 block no-underline" href="#">Contact Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-surface-container-high flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-label-sm text-label-sm text-secondary">
              © 2024 ConvinceSense AI. Growth through intelligence.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-label-sm font-medium text-secondary">System Status: Optimal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
