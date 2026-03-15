import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  HardHat, 
  Ruler, 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  Menu, 
  X, 
  ArrowRight,
  CheckCircle2,
  Hammer,
  ChevronRight,
  Sparkles,
  Quote,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleGenAI } from '@google/genai';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    address: '123 Construction Blvd, Suite 400\nMetropolis, NY 10001',
    phone1: '+1 (555) 123-4567',
    phone2: '+1 (555) 987-6543',
    email1: 'info@reiconconstruction.com',
    email2: 'quotes@reiconconstruction.com'
  });
  const [heroSettings, setHeroSettings] = useState({
    image: 'https://picsum.photos/seed/construction/1920/1080',
    titlePart1: 'WE BUILD',
    titlePart2: 'WITH PRECISION',
    titlePart3: '& PASSION',
    subtitle: 'Reicon Construction Group Ltd delivers excellence in commercial and residential construction, turning visionary blueprints into enduring structures.'
  });
  const [aboutSettings, setAboutSettings] = useState({
    image: 'https://picsum.photos/seed/workers/800/1200'
  });
  const [ctaSettings, setCtaSettings] = useState({
    title: 'READY TO START YOUR PROJECT?',
    subtitle: 'Contact us today for a consultation and free estimate.',
    buttonText: 'GET IN TOUCH NOW',
    buttonLink: '/#contact'
  });
  const [statsSettings, setStatsSettings] = useState({
    stat1Number: '25+', stat1Label: 'Years Experience',
    stat2Number: '350+', stat2Label: 'Projects Completed',
    stat3Number: '120+', stat3Label: 'Expert Workers',
    stat4Number: '100%', stat4Label: 'Client Satisfaction'
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const qServices = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching services", error);
    });

    const qProjects = query(collection(db, 'projects'), orderBy('order', 'asc'));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching projects", error);
    });

    const qTestimonials = query(collection(db, 'testimonials'), orderBy('order', 'asc'));
    const unsubTestimonials = onSnapshot(qTestimonials, (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching testimonials", error);
    });

    const unsubContact = onSnapshot(doc(db, 'settings', 'contact'), (docSnap) => {
      if (docSnap.exists()) {
        setContactInfo(docSnap.data() as any);
      }
    });

    const unsubHero = onSnapshot(doc(db, 'settings', 'hero'), (docSnap) => {
      if (docSnap.exists()) {
        setHeroSettings(docSnap.data() as any);
      }
    });

    const unsubAbout = onSnapshot(doc(db, 'settings', 'about'), (docSnap) => {
      if (docSnap.exists()) {
        setAboutSettings(docSnap.data() as any);
      }
    });

    const unsubCta = onSnapshot(doc(db, 'settings', 'cta'), (docSnap) => {
      if (docSnap.exists()) {
        setCtaSettings(docSnap.data() as any);
      }
    });

    const unsubStats = onSnapshot(doc(db, 'settings', 'stats'), (docSnap) => {
      if (docSnap.exists()) {
        setStatsSettings(docSnap.data() as any);
      }
    });

    return () => {
      unsubServices();
      unsubProjects();
      unsubTestimonials();
      unsubContact();
      unsubHero();
      unsubAbout();
      unsubCta();
      unsubStats();
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  const handleAIEnhance = async () => {
    if (!contactForm.message) {
      alert("Please type a few words about your project first, and our AI will write a professional message for you!");
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a helpful assistant helping a customer write a professional contact message to a construction company named Reicon Construction Group.
        The customer has provided these rough notes: "${contactForm.message}".
        Please rewrite this into a polite, clear, and professional inquiry. Keep it concise. Do not include placeholders like [Your Name], just the message body.`,
      });

      if (response.text) {
        setContactForm(prev => ({ ...prev, message: response.text }));
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("Failed to enhance message. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...contactForm,
        createdAt: new Date().toISOString(),
        read: false
      });

      // Check auto-reply settings
      const settingsSnap = await getDoc(doc(db, 'settings', 'autoreply'));
      if (settingsSnap.exists()) {
        const autoReply = settingsSnap.data();
        if (autoReply.enabled) {
          // Trigger email by writing to 'mail' collection
          await addDoc(collection(db, 'mail'), {
            to: contactForm.email,
            message: {
              subject: autoReply.subject,
              text: autoReply.body,
              html: autoReply.body.replace(/\n/g, '<br>')
            },
            createdAt: new Date().toISOString()
          });
        }
      }

      setSubmitSuccess(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Error sending message", error);
      alert("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'Services', href: '/#services' },
    { name: 'Projects', href: '/#projects' },
    { name: 'Contact', href: '/#contact' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return Building2;
      case 'HardHat': return HardHat;
      case 'Ruler': return Ruler;
      case 'Truck': return Truck;
      default: return Hammer;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-brand-dark text-white py-4 shadow-lg' : 'bg-transparent text-white py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <a href="/#home" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="bg-brand-yellow text-brand-dark p-2 rounded-sm">
              <Building2 size={28} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold leading-none tracking-wide">REICON</span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-brand-yellow">Construction Group</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-semibold uppercase tracking-wider hover:text-brand-yellow transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a 
              href="/#contact"
              className="bg-brand-yellow text-brand-dark px-6 py-2.5 font-display font-bold tracking-wider hover:bg-white transition-colors"
            >
              Get a Quote
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white hover:text-brand-yellow"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[72px] left-0 right-0 bg-brand-dark z-40 md:hidden border-t border-gray-800"
          >
            <div className="flex flex-col px-4 py-6 gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-lg font-display uppercase tracking-wider hover:text-brand-yellow py-2 border-b border-gray-800"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-32 md:pb-40">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroSettings.image} 
            alt="Construction Site" 
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-brand-dark/60"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div variants={fadeIn} className="flex items-center gap-4 mb-6">
              <div className="h-[2px] w-12 bg-brand-yellow"></div>
              <span className="text-brand-yellow font-bold tracking-widest uppercase text-sm">Building The Future</span>
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[0.9] mb-6">
              {heroSettings.titlePart1} <br />
              <span className="text-transparent text-stroke">{heroSettings.titlePart2}</span> <br />
              {heroSettings.titlePart3}
            </motion.h1>
            <motion.p variants={fadeIn} className="text-gray-300 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
              {heroSettings.subtitle}
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <a href="/#projects" className="bg-brand-yellow text-brand-dark px-8 py-4 font-display font-bold tracking-wider hover:bg-white transition-colors flex items-center gap-2">
                Our Projects <ArrowRight size={20} />
              </a>
              <a href="/#services" className="bg-transparent border border-white text-white px-8 py-4 font-display font-bold tracking-wider hover:bg-white hover:text-brand-dark transition-colors">
                Our Services
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest font-semibold">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-brand-yellow to-transparent"></div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-yellow py-12 relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl shadow-2xl rounded-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 px-4 sm:px-8">
          {[
            { number: statsSettings.stat1Number, label: statsSettings.stat1Label },
            { number: statsSettings.stat2Number, label: statsSettings.stat2Label },
            { number: statsSettings.stat3Number, label: statsSettings.stat3Label },
            { number: statsSettings.stat4Number, label: statsSettings.stat4Label },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <h3 className="text-4xl md:text-5xl font-display font-bold text-brand-dark mb-2">{stat.number}</h3>
              <p className="text-brand-dark/80 font-semibold uppercase tracking-wider text-xs md:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white min-h-screen">
        <div id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="flex items-center gap-4 mb-4">
                <div className="h-[2px] w-12 bg-brand-yellow"></div>
                <span className="text-brand-dark font-bold tracking-widest uppercase text-sm">About Reicon</span>
              </motion.div>
              <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-display font-bold text-brand-dark mb-6 leading-tight">
                SOLID FOUNDATIONS FOR A BETTER TOMORROW
              </motion.h2>
              <motion.p variants={fadeIn} className="text-gray-600 mb-6 leading-relaxed">
                Founded on the principles of integrity, quality, and hard work, Reicon Construction Group Ltd has grown to become a leading force in the construction industry. We don't just build structures; we build relationships and communities.
              </motion.p>
              <motion.p variants={fadeIn} className="text-gray-600 mb-8 leading-relaxed">
                Our team of dedicated professionals brings decades of combined experience to every project, ensuring that from the initial groundwork to the final finishing touches, excellence is our standard.
              </motion.p>
              
              <motion.div variants={fadeIn} className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  'Quality Craftsmanship',
                  'On-Time Delivery',
                  'Safety First Approach',
                  'Sustainable Practices'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-brand-yellow" size={20} />
                    <span className="font-semibold text-brand-dark">{item}</span>
                  </div>
                ))}
              </motion.div>

              <motion.a variants={fadeIn} href="/#contact" className="inline-flex items-center gap-2 text-brand-dark font-bold uppercase tracking-wider hover:text-brand-yellow transition-colors border-b-2 border-brand-dark hover:border-brand-yellow pb-1">
                Learn More About Us <ArrowRight size={18} />
              </motion.a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img 
                src={aboutSettings.image} 
                alt="Construction Workers on Site" 
                className="w-full h-[350px] sm:h-[450px] md:h-[600px] object-cover rounded-sm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -left-8 bg-brand-dark p-8 text-white max-w-xs hidden md:block">
                <Hammer className="text-brand-yellow mb-4" size={40} />
                <h4 className="font-display text-2xl mb-2">Committed to Excellence</h4>
                <p className="text-gray-400 text-sm">Every project is a testament to our dedication to quality.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gray-50 min-h-screen">
        <div id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-[2px] w-12 bg-brand-yellow"></div>
              <span className="text-brand-dark font-bold tracking-widest uppercase text-sm">Our Expertise</span>
              <div className="h-[2px] w-12 bg-brand-yellow"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-dark mb-6">SERVICES WE PROVIDE</h2>
            <p className="text-gray-600">Comprehensive construction solutions tailored to meet the unique demands of every client and project scale.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.length > 0 ? services.map((service, idx) => {
              const IconComponent = getIcon(service.icon);
              return (
                <motion.div 
                  key={service.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white p-6 sm:p-8 border border-gray-100 hover:border-brand-yellow hover:shadow-xl transition-all group rounded-sm"
                >
                  <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-brand-yellow transition-colors">
                    <IconComponent size={32} className="text-brand-dark" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-display font-bold text-brand-dark mb-4 uppercase">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <a href="/#contact" className="text-sm font-bold uppercase tracking-wider text-brand-dark group-hover:text-brand-yellow flex items-center gap-2 transition-colors">
                    Read More <ArrowRight size={16} />
                  </a>
                </motion.div>
              );
            }) : (
              <p className="col-span-full text-center text-gray-500">No services available. Add some in the admin panel.</p>
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-24 bg-brand-dark text-white min-h-screen">
        <div id="projects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6 md:gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[2px] w-12 bg-brand-yellow"></div>
                <span className="text-brand-yellow font-bold tracking-widest uppercase text-sm">Featured Work</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">OUR LATEST PROJECTS</h2>
            </div>
            <Link to="/projects" className="bg-transparent border border-white text-white px-8 py-3 font-display font-bold tracking-wider hover:bg-brand-yellow hover:border-brand-yellow hover:text-brand-dark transition-colors whitespace-nowrap">
              View All Projects
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length > 0 ? projects.slice(0, 6).map((project, idx) => (
              <motion.div 
                key={project.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative overflow-hidden h-[300px] sm:h-[350px] md:h-[400px] rounded-sm"
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent opacity-80"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-brand-yellow text-sm font-bold tracking-widest uppercase mb-2 block">{project.category}</span>
                  <h3 className="text-2xl font-display font-bold text-white mb-4 uppercase">{project.title}</h3>
                  <div className="w-12 h-[2px] bg-brand-yellow group-hover:w-full transition-all duration-500"></div>
                </div>
              </motion.div>
            )) : (
              <p className="col-span-full text-center text-gray-400">No projects available. Add some in the admin panel.</p>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-[2px] w-12 bg-brand-yellow"></div>
              <span className="text-brand-dark font-bold tracking-widest uppercase text-sm">Client Reviews</span>
              <div className="h-[2px] w-12 bg-brand-yellow"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-dark">WHAT PEOPLE SAY</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.length > 0 ? testimonials.map((t, idx) => (
              <motion.div 
                key={t.id || idx} 
                className="bg-white p-8 rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 border-b-4 border-transparent hover:border-brand-yellow flex flex-col h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="mb-6">
                  <Quote className="text-brand-yellow/20 mb-4" size={40} />
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`${i < (t.rating || 5) ? 'text-brand-yellow fill-brand-yellow' : 'text-gray-200'} `} 
                        size={16} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic leading-relaxed text-lg">"{t.content}"</p>
                </div>
                
                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-4">
                  {t.avatar ? (
                    <img 
                      src={t.avatar} 
                      alt={t.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-brand-yellow/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-brand-dark text-brand-yellow flex items-center justify-center font-bold text-xl">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-display font-bold text-brand-dark uppercase tracking-wide">{t.name}</h4>
                    <p className="text-xs font-semibold text-brand-yellow uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            )) : (
              <p className="col-span-full text-center text-gray-400">No testimonials available yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-brand-yellow relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-black/5 -skew-x-12 translate-x-20 hidden md:block"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-brand-dark mb-4">{ctaSettings.title}</h2>
            <p className="text-brand-dark/80 text-lg font-medium">{ctaSettings.subtitle}</p>
          </div>
          <a href={ctaSettings.buttonLink} className="bg-brand-dark text-white px-8 md:px-10 py-4 md:py-5 font-display text-lg font-bold tracking-wider hover:bg-white hover:text-brand-dark transition-colors whitespace-nowrap shadow-xl rounded-sm">
            {ctaSettings.buttonText}
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white min-h-screen">
        <div id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[2px] w-12 bg-brand-yellow"></div>
                <span className="text-brand-dark font-bold tracking-widest uppercase text-sm">Contact Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-dark mb-8">LET'S BUILD SOMETHING GREAT TOGETHER</h2>
              <p className="text-gray-600 mb-10 leading-relaxed">
                Whether you have a clear vision or need help developing one, our team is ready to assist you. Reach out to us using the contact details below or fill out the form.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-gray-50 flex items-center justify-center shrink-0">
                    <MapPin className="text-brand-yellow" size={24} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xl uppercase mb-2">Head Office</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{contactInfo.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-gray-50 flex items-center justify-center shrink-0">
                    <Phone className="text-brand-yellow" size={24} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xl uppercase mb-2">Phone Number</h4>
                    <p className="text-gray-600">{contactInfo.phone1}{contactInfo.phone2 && <><br />{contactInfo.phone2}</>}</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-gray-50 flex items-center justify-center shrink-0">
                    <Mail className="text-brand-yellow" size={24} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xl uppercase mb-2">Email Address</h4>
                    <p className="text-gray-600">{contactInfo.email1}{contactInfo.email2 && <><br />{contactInfo.email2}</>}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 sm:p-8 md:p-12 rounded-sm">
              <h3 className="font-display font-bold text-2xl uppercase mb-8">Send Us A Message</h3>
              {submitSuccess ? (
                <div className="bg-green-50 text-green-800 p-6 rounded border border-green-200 text-center">
                  <CheckCircle2 className="mx-auto mb-4 text-green-500" size={48} />
                  <h4 className="text-xl font-bold mb-2">Message Sent!</h4>
                  <p>Thank you for reaching out. We will get back to you shortly.</p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleContactSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-brand-dark uppercase tracking-wider mb-2">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={contactForm.name}
                        onChange={e => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full bg-white border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-yellow transition-colors" 
                        placeholder="John Doe" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-brand-dark uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={contactForm.email}
                        onChange={e => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full bg-white border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-yellow transition-colors" 
                        placeholder="john@example.com" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-dark uppercase tracking-wider mb-2">Subject</label>
                    <input 
                      type="text" 
                      value={contactForm.subject}
                      onChange={e => setContactForm({...contactForm, subject: e.target.value})}
                      className="w-full bg-white border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-yellow transition-colors" 
                      placeholder="Project Inquiry" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-brand-dark uppercase tracking-wider">Message</label>
                      <button 
                        type="button" 
                        onClick={handleAIEnhance}
                        disabled={isGeneratingAI}
                        className="text-xs font-bold flex items-center gap-1 text-brand-dark hover:text-brand-yellow transition-colors disabled:opacity-50"
                      >
                        <Sparkles size={14} />
                        {isGeneratingAI ? 'Enhancing...' : 'Enhance with AI'}
                      </button>
                    </div>
                    <textarea 
                      rows={5} 
                      required
                      value={contactForm.message}
                      onChange={e => setContactForm({...contactForm, message: e.target.value})}
                      className="w-full bg-white border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-yellow transition-colors resize-none" 
                      placeholder="Tell us about your project..."
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-brand-dark text-white px-8 py-4 font-display font-bold tracking-wider hover:bg-brand-yellow hover:text-brand-dark transition-colors uppercase disabled:opacity-70"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-gray text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 lg:col-span-1">
              <a href="/#home" className="flex items-center gap-2 mb-6 hover:opacity-90 transition-opacity inline-flex">
                <div className="bg-brand-yellow text-brand-dark p-1.5 rounded-sm">
                  <Building2 size={24} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-xl font-bold leading-none tracking-wide">REICON</span>
                  <span className="text-[9px] uppercase tracking-widest font-semibold text-brand-yellow">Construction Group</span>
                </div>
              </a>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Building excellence through innovation, dedication, and superior craftsmanship since 1998.
              </p>
              <ul className="space-y-2 text-gray-400 mb-6">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-brand-yellow shrink-0 mt-1" />
                  <span className="whitespace-pre-wrap text-sm">{contactInfo.address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-brand-yellow shrink-0" />
                  <span className="text-sm">{contactInfo.phone1}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-brand-yellow shrink-0" />
                  <span className="text-sm">{contactInfo.email1}</span>
                </li>
              </ul>
              <div className="flex gap-4">
                {/* Social placeholders */}
                {['fb', 'tw', 'in', 'ig'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 bg-white/5 flex items-center justify-center hover:bg-brand-yellow hover:text-brand-dark transition-colors rounded-sm">
                    <span className="text-xs uppercase font-bold">{social}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold text-xl uppercase mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Home', href: '/#home' },
                  { name: 'About Us', href: '/#about' },
                  { name: 'Our Services', href: '/#services' },
                  { name: 'Recent Projects', href: '/#projects' },
                  { name: 'Contact Us', href: '/#contact' },
                  { name: 'Admin Panel', href: '/admin' }
                ].map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-400 hover:text-brand-yellow transition-colors flex items-center gap-2">
                      <ChevronRight size={14} /> {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-xl uppercase mb-6">Our Services</h4>
              <ul className="space-y-3">
                {['Commercial Construction', 'Residential Building', 'Civil Engineering', 'Renovations', 'Project Management'].map((link) => (
                  <li key={link}>
                    <a href="/#services" className="text-gray-400 hover:text-brand-yellow transition-colors flex items-center gap-2">
                      <ChevronRight size={14} /> {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-xl uppercase mb-6">Newsletter</h4>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter to receive latest news and updates.</p>
              <form className="flex" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="bg-white/5 border border-white/10 px-4 py-3 w-full focus:outline-none focus:border-brand-yellow text-white"
                />
                <button type="submit" className="bg-brand-yellow text-brand-dark px-4 py-3 hover:bg-white transition-colors">
                  <ArrowRight size={20} />
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Reicon Construction Group Ltd. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Custom CSS for text stroke effect */}
      <style>{`
        .text-stroke {
          -webkit-text-stroke: 2px white;
          color: transparent;
        }
      `}</style>
    </div>
  );
}
