'use client'

import { motion } from 'framer-motion'

const steps = [
  { n: '01', t: 'Install the .exe', d: 'One download, ~18 MB. No installer wizard maze, no account wall. Runs on Windows 10 and 11.' },
  { n: '02', t: 'Work like normal', d: 'ScreenForge samples the foreground window every 5 seconds via native Win32 APIs. Idle and locked time is ignored.' },
  { n: '03', t: 'Review on Friday', d: 'Open Insights, see the week honestly: top apps, categories, interruption sources. Adjust, repeat.' },
]

const rows: { label: string; sf: string; good?: boolean; others: [string, string, string] }[] = [
  { label: 'Price', sf: 'Free forever', good: true, others: ['$9/mo', '$99/yr', 'Free*'] },
  { label: 'Open source (MIT)', sf: 'Yes', good: true, others: ['No', 'No', 'Yes'] },
  { label: 'Works fully offline', sf: 'Yes', good: true, others: ['No', 'Partial', 'Yes'] },
  { label: 'No account required', sf: 'Yes', good: true, others: ['No', 'No', 'Yes'] },
  { label: 'Windows native feel', sf: 'Yes', good: true, others: ['Web wrapper', 'Dated UI', 'Dated UI'] },
]

export default function HowAndCompare() {
  return (
    <>
      <section className="section-pad border-t border-[var(--line)]" aria-labelledby="how-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="eyebrow text-[var(--forge-ink)]">— How it works</div>
          <h2 id="how-title" className="display mt-3 text-[32px] sm:text-[48px]">Three steps. No onboarding call.</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-7"
              >
                <div className="font-mono text-[12px] tracking-[0.14em] text-[var(--forge-ink)]">{s.n}</div>
                <h3 className="font-display mt-3 text-[19px] font-semibold tracking-[-0.02em]">{s.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-2)]">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="compare" className="section-pad border-t border-[var(--line)]" aria-labelledby="compare-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
            <div>
              <div className="eyebrow text-[var(--forge-ink)]">— Why switch</div>
              <h2 id="compare-title" className="display mt-3 text-[32px] sm:text-[44px]">Trackers that respect you are rare.</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-2)]">
                Most screen-time tools are subscriptions wrapped around your data.
                ScreenForge is a local utility: you own the binary, the database, and the delete key.
              </p>
              <div className="mt-6 flex gap-3">
                <a href="/ScreenForge-1.0.1-win-x64.exe" download className="btn-primary">Download free</a>
                <a href="/faq" className="btn-ghost">Read FAQ</a>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
              <table className="spec-table w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-soft)]">
                    <th className="w-[34%]"></th>
                    <th className="!text-[var(--text-1)]">ScreenForge</th>
                    <th>RescueTime</th>
                    <th>ManicTime</th>
                    <th>ActivityWatch</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label}>
                      <td className="text-[var(--text-2)] font-medium">{r.label}</td>
                      <td><span className="inline-flex items-center gap-1.5 font-semibold text-[var(--forge-ink)]"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--forge)]" />{r.sf}</span></td>
                      {r.others.map((o, i) => <td key={i} className="text-[var(--text-3)]">{o}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
