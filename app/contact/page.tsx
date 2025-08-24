'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Send, Clock, User, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        console.error('Contact form error:', result.error);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Office",
      details: "1, Rebadu Road, Ikoyi, Lagos",
      action: "Get Directions",
      link: "https://maps.google.com/?q=1,+Rebadu+Road,+Ikoyi,+Lagos"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+234 703 722 1197, +234 812 967 7481",
      action: "Call Now",
      link: "tel:+2347037221197"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: "info@okanologistic.com",
      action: "Send Email",
      link: "mailto:info@okanologistic.com"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      details: "Quick support via WhatsApp",
      action: "Chat Now",
      link: "https://wa.me/2347037221197"
    }
  ];

  const businessHours = [
    { day: "Monday - Friday", hours: "8:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-blue-900 text-white section-padding">
        <div className="container-max">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-6 fade-in">
              Contact <span className="text-orange">Contact Us</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto slide-up">
              Get in touch with our team for logistics support, investment opportunities, 
              or any questions about our services.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange rounded-full mb-4">
                  <info.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-navy font-poppins mb-2">{info.title}</h3>
                <p className="text-gray-600 mb-4">{info.details}</p>
                <a
                  href={info.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange hover:text-orange-600 font-medium inline-flex items-center"
                >
                  {info.action}
                  <Send className="ml-1 h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Handles */}
      <section className="section-padding">
        <div className="container-max text-center">
          <h2 className="text-2xl font-bold text-navy font-poppins mb-4">
            Connect With Us
          </h2>
          <p className="text-gray-600 mb-6">
            Follow us on social media for updates, news, and support.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <a href="https://facebook.com/okanologistics" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-lg">
              {/* Facebook Lucide Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" /></svg>
              <span>Facebook</span>
            </a>
            <a href="https://twitter.com/okanologistics" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-400 hover:text-blue-600 font-medium text-lg">
              {/* Twitter Lucide Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.7 1.64 1.15c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.95 3.65A4.48 4.48 0 01.96 6v.06c0 2.13 1.52 3.91 3.54 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.72 2.16 2.97 4.07 3A9.05 9.05 0 010 19.54a12.8 12.8 0 006.92 2.03c8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z" /></svg>
              <span>Twitter</span>
            </a>
            <a href="https://instagram.com/okanologistics" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-pink-500 hover:text-pink-700 font-medium text-lg">
              {/* Instagram Lucide Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.5" y2="6.5" /></svg>
              <span>Instagram</span>
            </a>
            <a href="https://linkedin.com/company/okanologistics" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-700 hover:text-blue-900 font-medium text-lg">
              {/* LinkedIn Lucide Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><line x1="16" y1="11" x2="16" y2="16" /><line x1="8" y1="11" x2="8" y2="16" /><line x1="8" y1="8" x2="8" y2="8" /></svg>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form and Business Hours */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-navy font-poppins mb-6">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      ✅
                    </div>
                    <div>
                      <p className="font-semibold">Message sent successfully!</p>
                      <p className="text-sm">Thank you for contacting us. We've received your message and will respond within 24-48 hours. Please check your email for a confirmation.</p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      ❌
                    </div>
                    <div>
                      <p className="font-semibold">Failed to send message</p>
                      <p className="text-sm">We're sorry, but there was an error sending your message. Please try again or contact us directly at +234 813 123 4567.</p>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
                      placeholder="Tell us about your logistics needs or investment interest..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Business Hours and Additional Info */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-6">
                  <Clock className="h-6 w-6 text-orange mr-3" />
                  <h3 className="text-2xl font-semibold text-navy font-poppins">Business Hours</h3>
                </div>
                <div className="space-y-3">
                  {businessHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700 font-medium">{schedule.day}</span>
                      <span className="text-gray-600">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange p-8 rounded-lg text-white">
                <h3 className="text-2xl font-semibold font-poppins mb-4">
                  Need Immediate Assistance?
                </h3>
                <p className="mb-6">
                  For urgent logistics needs or time-sensitive deliveries, contact us directly via phone or WhatsApp.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+2347037221197"
                    className="flex items-center space-x-3 text-white hover:text-gray-200 transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                    <span>+2347037221197</span>
                  </a>
                  <a
                    href="https://wa.me/2347037221197"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-white hover:text-gray-200 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>WhatsApp Support</span>
                  </a>
                </div>
              </div>

              <div className="bg-gray-100 p-8 rounded-lg">
                <h3 className="text-xl font-semibold text-navy font-poppins mb-4">
                  Investment Inquiries
                </h3>
                <p className="text-gray-600 mb-4">
                  Interested in our bike investment program? Our team will provide detailed information about returns, terms, and getting started.
                </p>
                <a
                  href="mailto:info@okanologistic.com?subject=Investment Inquiry"
                  className="text-orange hover:text-orange-600 font-medium inline-flex items-center"
                >
                  Email Investment Team
                  <Mail className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-gray-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-navy font-poppins mb-4">
              Find Our Office
            </h2>
            <p className="text-gray-600">
              Visit us at our headquarters in Ikoyi, Lagos
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-orange mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Interactive Map</p>
                <p className="text-sm text-gray-500">1, Rebadu Road, Ikoyi, Lagos</p>
                <a
                  href="https://maps.google.com/?q=1,+Rebadu+Road,+Ikoyi,+Lagos"
                  target="https://maps.app.goo.gl/H9T2SBm1i66hC3J87"
                  rel="noopener noreferrer"
                  className="btn-primary mt-4 inline-flex items-center"
                >
                  Open in Google Maps
                  <MapPin className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}