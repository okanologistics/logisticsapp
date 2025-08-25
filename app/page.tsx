'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  Car, 
  Package, 
  TrendingUp, 
  Shield, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Target
} from 'lucide-react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const services = [
    {
      icon: Package,
      title: "Express Delivery & Pickup",
      description: "Fast, reliable delivery services across Nigeria with real-time tracking.",
      image: "https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=500"
    },
    {
      icon: Car,
      title: "Private Car Services with Optional Security Escort",
      description: "Comfortable, professional transportation services for all your needs. Optional security escort service available upon request.",
      link: "/services",
      image: "/carhiresuv.jpg"
    },
    {
      icon: Truck,
      title: "Haulage Services",
      description: "Heavy-duty transportation for large goods and commercial cargo.",
      image: "/haulage2.png"
    },
    {
      icon: TrendingUp,
      title: "Bike Investment",
      description: "Invest in delivery bikes and earn passive income with guaranteed returns.",
      image: "/bike.jpg"
    },
    {
      icon: TrendingUp,
      title: "Flight Ticket Booking",
      description: "Book flights for your business or personal needs with ease.",
      image: "/flight-ticket.jpeg"
    }
  ];

  const testimonials = [
    
    {
      name: "Mr. Gafari Olalekan",
      role: "Investor",
      content: "My experience with Okano Logistics has been nothing short of excellent. They have proven to be very reliable, especially when it comes to the exact day my ROI reflects in my account – always timely, never delayed. I also appreciate the transparency and consistency throughout the tenure of my investment, which has given me a lot of confidence and peace of mind. Their professionalism, clear communication and commitment to delivering on their promises make them stand out. I’m glad to be part of this journey with them and I look forward to continuing our partnership/ my investment..",
      avatar: "mr_gafari.png"
    },
    {
      name: "Mr Lawal Yusuf",
      role: "E-commerce Manager",
      content: "Okano Logistic has proven to be truthful, flexible, transparent, and trustworthy. I started an investment plan with them and chose to receive my earnings through a Spar card instead of withdrawing funds directly. They provided me with the card, and every week it's loaded, so I don't have to worry about shopping anymore. The income has been consistent throughout each investment cycle, and I’ve opted in again. It’s truly been a good experience.",
      avatar: "/mr_lawal.png"
    },
    {
      name: "Samuel Ekele",
      role: "Small Business Owner",
      content: "I've had a great experience working with this logistics company. Their team is professional, responsive, and always ensures that deliveries are made on time. I always feel informed about where my shipments are, they've consistently met my expectations. Okano Logistics is highly recommended for anyone looking for dependable logistics services.",
      avatar: "/sammy.jpg"
    },
    {
      name: "Sarah Brenda",
      role: "Entrepreneur",
      content: "What I love most is the passive nature of this investment. I don't have to worry about operations - just collect my monthly returns and track progress online.",
      avatar: "sarah.jpg"
    }
  ];

  const stats = [
    { number: "5000+", label: "Deliveries Completed", icon: Package },
    { number: "200+", label: "Happy Clients", icon: Users },
    { number: "50+", label: "Delivery Bikes", icon: Truck },
    { number: "98%", label: "Success Rate", icon: Award }
  ];

  const heroImages = [
    "/dispatch.png",
    "/Haulage.jpg",
    "/bike.jpg",
    "https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=800"
  ];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000); // 4 seconds per slide
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy via-blue-900 to-blue-800 text-white section-padding">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-6 ${isVisible ? 'fade-in' : 'opacity-0'}`}>
              <h1 className="text-4xl md:text-6xl font-bold font-poppins leading-tight">
                Delivering <span className="text-orange">Faster</span>,{' '}
                <span className="text-orange">Smarter</span>,{' '}
                <span className="text-orange">Better</span>
              </h1>
              <p className="text-xl text-gray-200 leading-relaxed">
                Powering comfort, speed, and satisfaction across Nigeria's logistics space.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/services" className="btn-primary inline-flex items-center group">
                  Get Logistics Support
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/investment" className="btn-secondary inline-flex items-center group">
                  Invest in a Bike
                  <TrendingUp className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <div className={`${isVisible ? 'slide-up' : 'opacity-0'}`}> 
              <img
                src={heroImages[currentHeroIndex]}
                alt="Delivery services"
                className="rounded-lg shadow-2xl w-full h-auto transition-all duration-700"
                key={heroImages[currentHeroIndex]}
              />
              <div className="flex justify-center mt-2 gap-2">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full ${idx === currentHeroIndex ? 'bg-orange' : 'bg-gray-300'}`}
                    onClick={() => setCurrentHeroIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
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
              <div key={index} className="text-center space-y-2">
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

      {/* Services Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive logistics solutions designed to meet your delivery and transportation needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <service.icon className="h-6 w-6 text-orange mr-2" />
                    <h3 className="text-xl font-semibold text-navy font-poppins">{service.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link href="/services" className="text-orange hover:text-orange-600 font-medium inline-flex items-center">
                    Learn More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Teaser */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-6">
                Invest in Our Delivery Bikes
              </h2>
              <p className="text-xl mb-6">
                Join our investment program and earn passive income while supporting Nigeria's logistics infrastructure.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Guaranteed Returns</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Transparent Reporting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Professional Management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span>Low Risk Investment</span>
                </div>
              </div>
              <Link href="/investment" className="btn-secondary inline-flex items-center">
                Learn More About Investment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <img
                src="/investment.jpg"
                alt="Investment opportunity"
                className="rounded-lg shadow-2xl w-full h-auto"
              />
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange">25%</div>
                  <div className="text-sm text-gray-600">Annual Returns</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              What Our Clients Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our valued clients have to say about our services.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-6">
                Why Choose Okano Logistics?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange rounded-full p-2 flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Trusted & Reliable</h3>
                    <p className="text-gray-600">
                      Years of experience in the logistics industry with a proven track record of success.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange rounded-full p-2 flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Fast Delivery</h3>
                    <p className="text-gray-600">
                      Quick turnaround times with real-time tracking for all your shipments.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange rounded-full p-2 flex-shrink-0">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Customer Focused</h3>
                    <p className="text-gray-600">
                      Dedicated customer support and customized solutions for your specific needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Why choose us"
                className="rounded-lg shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-navy text-white section-padding">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Okano Logistics for their delivery needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary inline-flex items-center">
              Get a Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/services" className="btn-secondary inline-flex items-center">
              View All Services
              <Package className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}