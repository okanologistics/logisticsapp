'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Shield, 
  DollarSign, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Calculator,
  Users,
  Award,
  Clock,
  Target,
  PieChart,
  Bike,
  FileText,
  Phone
} from 'lucide-react';

export default function Investment() {
  const [isVisible, setIsVisible] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(1400000);
  const [investmentPeriod, setInvestmentPeriod] = useState(12);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const calculateReturns = () => {
    const monthlyReturn = (investmentAmount * 0.25) / 12;
    const totalReturn = monthlyReturn * investmentPeriod;
    const totalValue = investmentAmount + totalReturn;
    return {
      monthlyReturn,
      totalReturn,
      totalValue,
      roi: (totalReturn / investmentAmount) * 100
    };
  };

  const returns = calculateReturns();

  const benefits = [
    {
      icon: DollarSign,
      title: "Guaranteed Returns",
      description: "Earn 25% annual returns with monthly payouts directly to your account.",
      highlight: "25% Annual ROI"
    },
    {
      icon: Shield,
      title: "Low Risk Investment",
      description: "Your investment is secured by physical assets and comprehensive insurance coverage.",
      highlight: "Fully Insured"
    },
    {
      icon: BarChart3,
      title: "Transparent Reporting",
      description: "Access detailed monthly reports and real-time dashboard tracking your bike's performance.",
      highlight: "Real-time Tracking"
    },
    {
      icon: Users,
      title: "Professional Management",
      description: "Our experienced team handles all operations, maintenance, and rider management.",
      highlight: "Expert Management"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Choose Your Investment",
      description: "Select the number of bikes you want to fund. Each bike costs ₦1,200,000 -1,400,000 minimum.",
      icon: Calculator
    },
    {
      step: "02",
      title: "Complete Documentation",
      description: "Sign the investment agreement and complete the necessary paperwork with our team.",
      icon: FileText
    },
    {
      step: "03",
      title: "Bike Deployment",
      description: "We purchase, register, and deploy your bike(s) into our active delivery fleet.",
      icon: Bike
    },
    {
      step: "04",
      title: "Start Earning",
      description: "Receive weekly returns and track performance through your investor dashboard.",
      icon: TrendingUp
    }
  ];

  const testimonials = [
    {
      name: "Lawal Yusuf",
      role: "Business Owner",
      investment: "₦",
      bikes: 1,
      content: "Okano Logistic has proven to be truthful, flexible, transparent, and trustworthy. I started an investment plan with them and chose to receive my earnings through a Spar card instead of withdrawing funds directly. They provided me with the card, and every week it's loaded, so I don't have to worry about shopping anymore. The income has been consistent throughout each investment cycle, and I’ve opted in again. It’s truly been a good experience.",
      avatar: "mr_lawal.png",
      monthlyReturn: "₦"
    },
    {
      name: "Mr. Gafari Olalekan",
      role: "Investment Consultant",
      investment: "₦",
      bikes: 2,
      content: "My experience with Okano Logistics has been nothing short of excellent. They have proven to be very reliable, especially when it comes to the exact day my ROI reflects in my account – always timely, never delayed. I also appreciate the transparency and consistency throughout the tenure of my investment, which has given me a lot of confidence and peace of mind. Their professionalism, clear communication and commitment to delivering on their promises make them stand out. I’m glad to be part of this journey with them and I look forward to continuing our partnership/ my investment.",
      avatar: "mr_gafari.png",
      monthlyReturn: "₦"
    },
    {
      name: "Sarah Brenda",
      role: "Entrepreneur",
      investment: "₦",
      bikes: 2,
      content: "What I love most is the passive nature of this investment. I don't have to worry about operations - just collect my monthly returns and track progress online.",
      avatar: "sarah.jpg",
      monthlyReturn: "₦"
    }
  ];

  const stats = [
    { number: "200+", label: "Active Investors", icon: Users },
    { number: "500+", label: "Bikes in Fleet", icon: Bike },
    { number: "₦250M+", label: "Total Investment", icon: DollarSign },
    { number: "98%", label: "Investor Satisfaction", icon: Award }
  ];

  const faqs = [
    {
      question: "What's the minimum investment amount?",
      answer: "The minimum investment is ₦1,200,000-1,400,000, which funds one delivery bike. You can invest in multiple bikes to increase your returns."
    },
    {
      question: "How are returns calculated and paid?",
      answer: "Your capital is evenly distributed across weekly payouts, meaning that each week you’ll receive both interest and a portion of your capital. By the end of the year, you will have received: 1. 100% of your initial capital, and 25% total interest on your investment. After the 12-month cycle, you’re free to resubscribe and reinvest if you choose — giving you the flexibility to continue growing your returns."
        },
    {
      question: "What happens if a bike is damaged or stolen?",
      answer: "All bikes are fully insured against theft, accidents, and damage. Insurance covers replacement costs, ensuring your investment remains protected."
    },
    {
      question: "Can I withdraw my principal investment anytime?",
      answer: "The minimum investment period is 12 months. ."
    }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy via-blue-900 to-blue-800 text-white section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-6 ${isVisible ? 'fade-in' : 'opacity-0'}`}>
              <h1 className="text-4xl md:text-5xl font-bold font-poppins leading-tight">
                Invest in <span className="text-orange">Delivery Bikes</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Earn passive income by funding delivery bikes that power Nigeria's logistics revolution. 
                Get guaranteed over 25% annual returns with full transparency and professional management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login" className="btn-primary inline-flex items-center group">
                  Track My Investment
                  <BarChart3 className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/contact" className="btn-secondary inline-flex items-center group">
                  Start Investing
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <div className={`${isVisible ? 'slide-up' : 'opacity-0'}`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Investment Calculator</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Investment Amount</label>
                    <input
                      type="range"
                      min="1400000"
                      max="14000000"
                      step="1400000"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-2xl font-bold text-orange mt-2">
                      ₦{investmentAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Investment Period (Months)</label>
                    <input
                      type="range"
                      min="12"
                      max="60"
                      step="6"
                      value={investmentPeriod}
                      onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-xl font-bold text-orange mt-2">
                      {investmentPeriod} months
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly Return:</span>
                      <span className="font-bold text-orange">₦{returns.monthlyReturn.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Returns:</span>
                      <span className="font-bold text-orange">₦{returns.totalReturn.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-2">
                      <span>Total Value:</span>
                      <span className="font-bold text-orange text-lg">₦{returns.totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 section-padding">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-navy font-poppins">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              Why Invest With Us?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our bike investment program offers unique advantages that make it an attractive option for passive income generation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange rounded-full mb-4">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-navy font-poppins mb-3">{benefit.title}</h3>
                <p className="text-gray-600 mb-4">{benefit.description}</p>
                <div className="text-orange font-semibold">{benefit.highlight}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting started with bike investment is simple and straightforward. Follow these four easy steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-orange rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 mt-4">
                    <step.icon className="h-8 w-8 text-orange" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy font-poppins mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-orange" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investor Testimonials */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              What Our Investors Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real stories from investors who are earning passive income through our bike investment program.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-semibold text-navy">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Investment:</span>
                    <span className="font-semibold text-navy">{testimonial.investment}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bikes Funded:</span>
                    <span className="font-semibold text-navy">{testimonial.bikes}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Return:</span>
                    <span className="font-semibold text-orange">{testimonial.monthlyReturn}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment FAQ */}
      <section className="bg-gray-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              Investment FAQ
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Common questions about our bike investment program and how it works.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-navy mb-3">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Disclosure */}
      <section className="bg-yellow-50 border-l-4 border-yellow-400 section-padding">
        <div className="container-max">
          <div className="flex items-start space-x-4">
            <Shield className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Investment Disclosure</h3>
              <p className="text-yellow-700 text-sm leading-relaxed">
                While we maintain comprehensive insurance and professional management, all investments carry inherent risks. 
                Past performance does not guarantee future results. The 12% annual return is a target based on historical 
                performance and market conditions. Please read our full terms and conditions and consult with a financial 
                advisor before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-navy text-white section-padding">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-6">
            Ready to Start Earning Passive Income?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join hundreds of investors who are already earning consistent returns through our bike investment program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary inline-flex items-center">
              Start Your Investment
              <TrendingUp className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-secondary inline-flex items-center">
              Access Dashboard
              <BarChart3 className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-4 text-gray-300">
            <Phone className="h-4 w-4" />
            <span>Need help? Call +2347037221197</span>
          </div>
        </div>
      </section>
    </div>
  );
}