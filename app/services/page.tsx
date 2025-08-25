'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Car, 
  Truck, 
  TrendingUp, 
  Home,
  Clock,
  Shield,
  MapPin,
  Phone,
  CheckCircle,
  ArrowRight,
  Plane
} from 'lucide-react';

export default function Services() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const services = [
    {
      icon: Package,
      title: "Express Delivery & Pickup",
      description: "Fast and reliable delivery services with real-time tracking across Nigeria.",
      features: [
        "Same-day delivery in major cities",
        "Secure packaging",
        "Insurance coverage",
        "Doorstep pickup service"
      ],
      image: "https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=600",
      pricing: "From ₦1,500",
      duration: "2-24 hours"
    },
    {
      icon: Car,
      title: "Private Car Services with Optional Security Escort",
      description: "Comfortable and professional transportation for business and personal needs. Optional security escort service available upon request.",
      features: [
        "Professional drivers",
        "Clean, well-maintained vehicles",
        "Flexible scheduling",
        "Airport transfers",
        "Business meetings",
        "Optional security escort service",
        "24/7 availability"
      ],
      image: "/carhire.jpg",
      pricing: "From ₦15,000",
      duration: "Flexible"
    },
    {
      icon: Truck,
      title: "Haulage Services",
      description: "Heavy-duty transportation for large goods and commercial cargo.",
      features: [
        "Heavy-duty trucks",
        "Interstate transportation",
        "Cargo insurance",
        "Loading/unloading service",
        "Flexible scheduling"
      ],
      image: "/haulage2.png",
      pricing: "From ₦150,000",
      duration: "1-5 days"
    },
    {
      icon: TrendingUp,
      title: "Hire Purchase Investment",
      description: "Invest in delivery bikes and earn passive income through our managed investment program.",
      features: [
        "25% annual returns",
        "Professional bike management",
        "Monthly/weekily income reports",
        "Transparent operations",
        "Low-risk investment"
      ],
      image: "/investment.jpg",
      pricing: "From ₦1,400,000",
      duration: "12+ months"
    },
    {
      icon: Plane, // Make sure to import Plane icon from lucide-react or use a suitable icon
      title: "Flight Ticket Booking",
      description: "Book local and international flights with ease.",
      features: [
        "Secure ticket purchasing",
        "Seat reservation options",
        "Domestic & international routes",
        "24/7 customer support",
        "Competitive fares"
      ],
      image: "/flight.png", // Replace with your flight image asset
      pricing: "From ₦/ticket",
      duration: "Flexible"
    }
  ];

  const cities = [
    { name: "Lagos", description: "Our headquarters and largest operations center" },
   {/*  { name: "Abuja", description: "Federal Capital Territory coverage" },
    { name: "Port Harcourt", description: "South-South regional hub" },
    { name: "Benin", description: "Mid-Western Nigeria operations" },
    { name: "Ibadan", description: "Southwest regional services" },
    { name: "Kano", description: "Northern Nigeria coverage" }
     */}
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-blue-900 text-white section-padding">
        <div className="container-max">
          <div className="text-center">
            <h1 className={`text-4xl md:text-5xl font-bold font-poppins mb-6 ${isVisible ? 'fade-in' : 'opacity-0'}`}>
              Our <span className="text-orange">Services</span>
            </h1>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto ${isVisible ? 'slide-up' : 'opacity-0'}`}>
              Comprehensive logistics solutions designed to meet your delivery, transportation, 
              and investment needs across Nigeria.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding">
        <div className="container-max">
          <div className="space-y-16">
            {services.map((service, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-reverse' : ''}`}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <service.icon className="h-8 w-8 text-orange" />
                    <h2 className="text-3xl font-bold text-navy font-poppins">{service.title}</h2>
                  </div>
                  <p className="text-gray-600 text-lg">{service.description}</p>
                  
                  <div className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-orange flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-6 pt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Starting from:</span>
                      <span className="font-semibold text-orange">{service.pricing}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{service.duration}</span>
                    </div>
                  </div>
                  
                  <Link href="/contact" className="btn-primary inline-flex items-center group">
                    Get Quote
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                
                <div className="relative">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="rounded-lg shadow-xl w-full h-auto"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-orange p-4 rounded-lg shadow-lg">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-gray-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              Service Areas
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              While our office is located in Lagos and we actively serve surrounding cities, our reliable delivery service covers all states across Nigeria.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cities.map((city, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-navy font-poppins mb-2">{city.name}</h3>
                <p className="text-gray-600">{city.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-6">
                Why Choose Our Services?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange rounded-full p-2 flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Reliable & Secure</h3>
                    <p className="text-gray-600">
                      Your goods are safe with us. We provide insurance coverage and secure handling for all shipments.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange rounded-full p-2 flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Time-Efficient</h3>
                    <p className="text-gray-600">
                      We understand the value of time. Our services are designed for quick turnaround and efficiency.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange rounded-full p-2 flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">24/7 Support</h3>
                    <p className="text-gray-600">
                      Our customer support team is available round the clock to assist you with any queries or concerns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Professional services"
                className="rounded-lg shadow-xl w-full h-auto"
              />
              <div className="absolute -top-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange">98%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-navy text-white section-padding">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your logistics needs and get a customized quote for our services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary inline-flex items-center">
              Get a Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/investment" className="btn-secondary inline-flex items-center">
              Learn About Investment
              <TrendingUp className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}