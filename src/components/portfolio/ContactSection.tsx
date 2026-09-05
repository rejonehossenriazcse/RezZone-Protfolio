import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCMS } from '../../context/CMSContext';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Github, Linkedin, Twitter, Globe } from 'lucide-react';
import {
  sectionRevealVariants,
  defaultViewport,
  customEase,
} from '../../utils/animations';

export const ContactSection: React.FC = () => {
  const { cmsData, submitContactForm } = useCMS();
  const { profile, siteSettings } = cmsData;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!siteSettings.sectionsVisibility.contact) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please fill in all fields.');
      setSubmitStatus('error');
      return;
    }

    setSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    const res = await submitContactForm(name, email, message);
    setSubmitting(false);

    if (res.success) {
      setSubmitStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSubmitStatus('idle'), 6000);
    } else {
      setSubmitStatus('error');
      setErrorMessage(res.error || 'Failed to send message. Please try again.');
    }
  };

  // Helper for dynamic social icons
  const getSocialIcon = (platform: string) => {
    const lower = platform.toLowerCase();
    if (lower.includes('github')) return <Github className="w-4 h-4" />;
    if (lower.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (lower.includes('twitter') || lower.includes('x')) return <Twitter className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <section
      id="contact"
      className="py-20 transition-colors duration-200"
      style={{
        borderTop: `1px solid var(--color-border)`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Info & Socials */}
          <motion.div
            className="lg:col-span-5 space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={sectionRevealVariants}
          >
            <div>
              <h2
                id="contact-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight mb-3"
                style={{ color: 'var(--color-text)' }}
              >
                Get In Touch
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Have an opportunity, question, or project in mind? Reach out directly or leave a note.
              </p>
            </div>

            {/* Direct Info */}
            <div className="space-y-4">
              {profile.email && (
                <motion.a
                  id="contact-email-link"
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3.5 p-3 rounded-xl transition-colors hover:opacity-85"
                  initial={{ opacity: 0, y: 35, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={defaultViewport}
                  transition={{ duration: 0.5, ease: customEase, delay: 0.1 }}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid var(--color-border)`,
                  }}
                >
                  <div
                    className="p-2.5 rounded-lg"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-muted)' }}>
                      Email
                    </div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                      {profile.email}
                    </div>
                  </div>
                </motion.a>
              )}

              {profile.phone && (
                <motion.a
                  id="contact-phone-link"
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-3.5 p-3 rounded-xl transition-colors hover:opacity-85"
                  initial={{ opacity: 0, y: 35, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={defaultViewport}
                  transition={{ duration: 0.5, ease: customEase, delay: 0.2 }}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid var(--color-border)`,
                  }}
                >
                  <div
                    className="p-2.5 rounded-lg"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-muted)' }}>
                      Phone
                    </div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                      {profile.phone}
                    </div>
                  </div>
                </motion.a>
              )}

              {profile.address && (
                <motion.div
                  id="contact-address-block"
                  className="flex items-center gap-3.5 p-3 rounded-xl"
                  initial={{ opacity: 0, y: 35, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={defaultViewport}
                  transition={{ duration: 0.5, ease: customEase, delay: 0.3 }}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid var(--color-border)`,
                  }}
                >
                  <div
                    className="p-2.5 rounded-lg"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
                      color: 'var(--color-primary)',
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-muted)' }}>
                      Location
                    </div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                      {profile.address}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Social Links */}
            {profile.socialLinks && profile.socialLinks.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
                  Connect
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {profile.socialLinks.map((social, index) => (
                    <motion.a
                      key={social.id}
                      id={`social-link-${social.id}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={defaultViewport}
                      transition={{ duration: 0.4, ease: customEase, delay: 0.1 + index * 0.08 }}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: `1px solid var(--color-border)`,
                        color: 'var(--color-text)',
                      }}
                    >
                      {getSocialIcon(social.platform)}
                      <span>{social.platform}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7">
            <motion.div
              id="contact-form-container"
              className="p-6 sm:p-8 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 35, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={defaultViewport}
              transition={{ duration: 0.55, ease: customEase, delay: 0.15 }}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: `1px solid var(--color-border)`,
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                Send a Message
              </h3>

              {submitStatus === 'success' && (
                <div
                  id="contact-success-alert"
                  className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium"
                  style={{
                    backgroundColor: `color-mix(in srgb, #10b981 12%, transparent)`,
                    color: '#059669',
                    border: `1px solid color-mix(in srgb, #10b981 30%, transparent)`,
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Thank you! Your message has been sent and stored in the CMS.</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div
                  id="contact-error-alert"
                  className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium"
                  style={{
                    backgroundColor: `color-mix(in srgb, #ef4444 12%, transparent)`,
                    color: '#dc2626',
                    border: `1px solid color-mix(in srgb, #ef4444 30%, transparent)`,
                  }}
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: `1px solid var(--color-border)`,
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Your Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: `1px solid var(--color-border)`,
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we collaborate?"
                    className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 resize-none"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: `1px solid var(--color-border)`,
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                  }}
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
