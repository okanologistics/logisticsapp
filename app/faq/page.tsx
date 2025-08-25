'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, TrendingUp, Shield, Clock, DollarSign, Truck } from 'lucide-react';

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([0]); // First item open by default

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: "Investment Questions",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      questions: [
        {
          question: "How do I invest in delivery bikes?",
          answer: "To invest in our delivery bikes, contact us through our website or visit our office. Our investment team will guide you through the process, which includes selecting the number of bikes you want to fund, completing the necessary paperwork, and making your investment. The minimum investment typically starts from ₦1,400,000 for one bike."
        },
        {
          question: "What's the expected ROI (Return on Investment)?",
          answer: "Your capital is evenly distributed across weekly payouts, meaning that each week you’ll receive both interest and a portion of your capital. By the end of the year, you will have received: 1. 100% of your initial capital, and 25% total interest on your investment. After the 12-month cycle, you’re free to resubscribe and reinvest if you choose — giving you the flexibility to continue growing your returns."
        },
        
        {
          question: "What happens if the bike breaks down or gets damaged?",
          answer: "All our delivery bikes are covered by comprehensive insurance and maintenance programs. If a bike breaks down, our technical team handles repairs immediately. For major damages or theft, insurance coverage ensures your investment is protected. We also maintain a reserve fund for unexpected maintenance costs."
        },
        {
          question: "How transparent are the investment operations?",
          answer: "We maintain complete transparency through monthly detailed reports that include bike performance metrics, delivery statistics, maintenance costs, and earnings breakdown. Investors also have access to a personal dashboard where they can track their investment performance in real-time."
        }
      ]
    },
    {
      title: "Logistics Services",
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      questions: [
        {
          question: "What areas do you cover for delivery services?",
          answer: "We currently provide delivery services across Lagos. Our express delivery service covers same-day delivery within the cities, while our haulage services can handle interstate transportation between all covered locations."
        },
        {
          question: "How fast is your express delivery service?",
          answer: "Our express delivery service offers same-day delivery within the cities, typically within 2-6 hours depending on distance and traffic conditions. For urgent deliveries, we also provide 1-2 hour express service at premium rates."
        },
        
        {
          question: "What types of items can you deliver?",
          answer: "We handle a wide range of items including documents, packages, food deliveries, electronics, clothing, and general merchandise. For haulage services, we transport furniture, appliances, commercial goods, and industrial equipment. We do not transport hazardous materials, illegal items, or perishables requiring special temperature control."
        }
      ]
    },
    {
      title: "Pricing & Payments",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      questions: [
        {
          question: "How are delivery charges calculated?",
          answer: "Delivery charges are calculated based on distance, package size/weight, delivery speed, and destination. Our express delivery starts from ₦1,500 within the city, private car services from ₦15,000 (with optional security escort service available), and haulage services from ₦150,000. You can get an instant quote through our website or by calling our customer service."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept various payment methods including bank transfers, debit/credit cards, mobile money (POS), and cash on delivery for certain services. For investment payments, we prefer bank transfers for security and record-keeping purposes."
        },
        {
          question: "Are there any hidden charges?",
          answer: "No, we maintain transparent pricing with no hidden charges. All costs including delivery fees, insurance (if selected), and any additional services are clearly stated upfront. The only additional charges that may apply are for special requests like waiting time, multiple stops, or premium packaging."
        }
      ]
    },
    {
      title: "General Support",
      icon: HelpCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      questions: [
        {
          question: "How can I track my delivery?",
          answer: "You can track all deliveries by calling our customer service."
        },
        {
          question: "What are your customer service hours?",
          answer: "Our customer service is available Monday to Friday from 8:00 AM to 6:00 PM, and Saturday from 9:00 AM to 4:00 PM. For urgent matters, you can reach us via WhatsApp at +2347037221197. We also provide 24/7 tracking support through our automated system."
        },
        {
          question: "Do you offer corporate/business accounts?",
          answer: "Yes, we offer special corporate accounts with volume discounts, dedicated account managers, priority service, and flexible payment terms. "
        },
        {
          question: "How do I file a complaint or claim?",
          answer: "You can file complaints through our website contact form, email us at info@okanologistic.com, or call our customer service. For claims related to damaged or lost items, we have a dedicated claims process that typically resolves issues within 48-72 hours."
        }
      ]
    }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-blue-900 text-white section-padding">
        <div className="container-max">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-6 fade-in">
               <span className="text-orange">Frequently Asked Questions</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto slide-up">
              Find answers to common questions about our logistics services and investment opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section-padding">
        <div className="container-max">
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className={`${category.bgColor} p-6 border-b`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-white`}>
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-navy font-poppins">{category.title}</h2>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex; // Unique index across categories
                    const isOpen = openItems.includes(globalIndex);
                    
                    return (
                      <div key={faqIndex} className="transition-all duration-200">
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full px-6 py-6 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-navy pr-4">
                              {faq.question}
                            </h3>
                            <div className="flex-shrink-0">
                              {isOpen ? (
                                <ChevronUp className="h-5 w-5 text-orange" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="px-6 pb-6">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-gray-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy font-poppins mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our customer support team is here to help you with any additional questions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange rounded-full mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-navy font-poppins mb-2">Quick Response</h3>
              <p className="text-gray-600">Average response time of 2 hours during business hours</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange rounded-full mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-navy font-poppins mb-2">Expert Support</h3>
              <p className="text-gray-600">Knowledgeable team ready to assist with all inquiries</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange rounded-full mb-4">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-navy font-poppins mb-2">24/7 Tracking</h3>
              <p className="text-gray-600">Round-the-clock delivery tracking and status updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-navy text-white section-padding">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-6">
            Need More Help?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our support team is ready to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn-primary inline-flex items-center">
              Contact Support
              <HelpCircle className="ml-2 h-4 w-4" />
            </a>
            <a href="https://wa.me/2348068478383" className="btn-secondary inline-flex items-center">
              WhatsApp Us
              <Shield className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}