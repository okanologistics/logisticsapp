'use client';

import { useState, useEffect } from 'react';
import { Users, Target, Award, Heart, Shield, Star, CheckCircle, Zap } from 'lucide-react';

export default function About() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const values = [
    {
      icon: Shield,
      title: "Trust & Openness",
      description: "We build lasting relationships through transparency and honest communication with all our stakeholders."
    },
    {
      icon: Heart,
      title: "Mutual Respect",
      description: "We value every individual and foster an environment of respect, diversity, and inclusion."
    },
    {
      icon: Award,
      title: "Quality & Excellence",
      description: "We strive for excellence in everything we do, delivering superior service and value."
    },
    {
      icon: Users,
      title: "Customer Orientation",
      description: "Our customers are at the heart of everything we do, driving our commitment to exceptional service."
    }
  ];

  const chartsValues = [
    {
      letter: "C",
      word: "Challenge",
      description: "We embrace challenges as opportunities to grow and innovate."
    },
    {
      letter: "H",
      word: "Honesty",
      description: "We maintain the highest standards of integrity in all our dealings."
    },
    {
      letter: "A",
      word: "Accountability",
      description: "We take responsibility for our actions and deliver on our promises."
    },
    {
      letter: "R",
      word: "Reliability",
      description: "We are dependable partners you can count on for consistent service."
    },
    {
      letter: "T",
      word: "Teamwork",
      description: "We achieve more together through collaboration and shared goals."
    },
    {
      letter: "S",
      word: "Safety",
      description: "We prioritize safety in all our operations and procedures."
    }
  ];

  const team = [
    
    {
      name: "Mr. Okoliko Joseph",
      role: "Line manager to all Riders and drvers",
      description: "Dedicated logistics professional with a passion for excellence in service delivery.",
      image: "/okoliko.jpg"
    },
    {
      name: "Janet Uwa Edegbe",
      role: "Human Resource Manager",
      description: "Experienced HR professional dedicated to fostering positive workplace culture, talent development, and organizational growth.",
      image: "/hr.jpg"
    },
    {
      name: "Mr. Ukpoji Sunday John",
      role: "Admin/Account Manager",
      description: "Experienced in financial management and administrative operations.",
      image: "/sunday.jpg"
    }
  ];

  const investor = [
    {
      name: "Dr. King Omoregie Uwangue",
      role: "",
      description: "Visionary investor with diversified portfolio.",
      image: "/king.jpg"
    },
    {
      name: "Mr. Terence Dzervela",
      role: "TD TRANS WAYS LTD",
      description: "Visionary leader with 15+ years the industry.",
      image: "/terrence.png"
    },
    {
      name: "Mr. Lawal Yusuf",
      role: "MAISONHILLS PROPERTIES",
      description: "Expert in operations with a focus on efficiency and customer satisfaction.",
      image: "/mr_lawal.png"
    },
    {
      name: "Mr. Gafari Olalekan",
      role: "MAISONHILLS PROPERTIES",
      description: "Driving innovation through technology solutions and digital transformation.",
      image: "/mr_gafari.png"
    },
    {
      name: "Sarah Brenda.",
      role: "UTC(Trade Union Centre) Rwanda",
      description: "",
      image: "/sarah.jpg"
    }
  ];

  const milestones = [
    { year: "2020", event: "Founded Okano Logistics Services", description: "Started with a vision to revolutionize logistics in Nigeria" },
    { year: "2021", event: "Expanded to more States", description: "Grew our delivery network across major Nigerian cities" },
    { year: "2022", event: "Launched Investment Program", description: "Introduced bike investment opportunities for passive income" },
    { year: "2023", event: "5000+ Deliveries", description: "Reached milestone of 5000 successful deliveries" },
    { year: "2024", event: "Technology Innovation", description: "Implemented web application for logistics optimization" }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-blue-900 text-white section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-6 ${isVisible ? 'fade-in' : 'opacity-0'}`}>
              <h1 className="text-4xl md:text-5xl font-bold font-poppins">
                About <span className="text-orange">Okano Logistics</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Founded in 2020, we are a forward-thinking, eco-conscious logistics provider 
                committed to delivering exceptional service across Nigeria's transportation landscape.
              </p>
              <div className="flex items-center space-x-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange">4+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange">5000+</div>
                  <div className="text-sm text-gray-600">Deliveries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange">200+</div>
                  <div className="text-sm text-gray-600">Happy Clients</div>
                </div>
              </div>
            </div>
            <div className={`${isVisible ? 'slide-up' : 'opacity-0'}`}>
              <img
                src="https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="About Okano Logistics"
                className="rounded-lg shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-orange mr-3" />
                <h2 className="text-2xl font-bold text-navy font-poppins">Our Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                To empower global commerce by delivering exceptional logistics services that 
                connect businesses and individuals across Nigeria and beyond. We are committed 
                to innovation, sustainability, and creating value for our customers, investors, 
                and communities.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-6">
                <Zap className="h-8 w-8 text-orange mr-3" />
                <h2 className="text-2xl font-bold text-navy font-poppins">Our Vision</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                To facilitate trade and support global economic development by becoming the 
                most trusted and innovative logistics partner in Africa. We envision a future 
                where efficient logistics enables seamless commerce and drives economic growth 
                across the continent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-gray-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These values guide everything we do and shape our culture at Okano Logistics.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange rounded-full mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-navy font-poppins mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARTS Value System */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              The CHARTS Value System
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive framework that drives excellence in every aspect of our operations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {chartsValues.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-orange rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{item.letter}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-navy font-poppins mb-2">{item.word}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="bg-gray-50 section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Key milestones in our growth and evolution as a leading logistics provider.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-orange"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <div className="text-orange font-bold text-2xl mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-navy font-poppins mb-2">{milestone.event}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange rounded-full border-4 border-white"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

{/* Team Section */}
<section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              Meet Our Powerhouse Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the talented team driving innovation and delivering excellence behind the scenes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-navy font-poppins mb-1">{member.name}</h3>
                  <div className="text-orange font-medium mb-3">{member.role}</div>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investors Section */}
      {/* <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-4">
              Meet Our Investors
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our dedicated professionals who make the magic happen every day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {investor.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-navy font-poppins mb-1">{member.name}</h3>
                  <div className="text-orange font-medium mb-3">{member.role}</div>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}       
      {/* Team Group Pictures Section */}
      {/*}
      <section className="section-padding bg-gray-50">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy font-poppins mb-6">
            Our Team in Action
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            United by passion and teamwork, here are some moments with our amazing crew.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img
                src="/bestteam.png"
                alt="Best Team"
                className="rounded-lg shadow-xl w-full h-auto"
              />
              <div className="mt-2 text-navy font-semibold">The Team</div>
            </div>
            <div>
              <img
                src="/teammain.png"
                alt="Main Team"
                className="rounded-lg shadow-xl w-full h-auto"
              />
              <div className="mt-2 text-navy font-semibold">Our Management Team</div>
            </div>
          </div>
        </div>
      </section>
*/}
      {/* Why Choose Us */}
      <section className="bg-navy text-white section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-6">
                Why Businesses Trust Us
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-orange flex-shrink-0" />
                  <span className="text-lg">Proven track record of reliability and excellence</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-orange flex-shrink-0" />
                  <span className="text-lg">Innovative technology solutions for modern logistics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-orange flex-shrink-0" />
                  <span className="text-lg">Eco-conscious approach to sustainable transportation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-orange flex-shrink-0" />
                  <span className="text-lg">Transparent pricing with no hidden costs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-orange flex-shrink-0" />
                  <span className="text-lg">24/7 customer support and tracking</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-orange mb-2">98%</div>
                <div className="text-sm text-gray-300">Customer Satisfaction</div>
              </div>
              <div className="bg-white/10 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-orange mb-2">24/7</div>
                <div className="text-sm text-gray-300">Support Available</div>
              </div>
              <div className="bg-white/10 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-orange mb-2">15+</div>
                <div className="text-sm text-gray-300">Cities Covered</div>
              </div>
              <div className="bg-white/10 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-orange mb-2">50+</div>
                <div className="text-sm text-gray-300">Fleet Size</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}