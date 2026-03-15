import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, ArrowLeft, Menu, X, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [contactSettings, setContactSettings] = useState<any>({
    email: 'info@reicon.com',
    phone: '+1 (555) 123-4567',
    address: '123 Construction Way, Suite 100, Builder City, ST 12345',
    facebook: '#',
    twitter: '#',
    linkedin: '#',
    instagram: '#'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const qProjects = query(collection(db, 'projects'), orderBy('order', 'asc'));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching projects", error);
    });

    const unsubContact = onSnapshot(doc(db, 'settings', 'contact'), (docSnap) => {
      if (docSnap.exists()) {
        setContactSettings(docSnap.data());
      }
    });

    return () => {
      unsubProjects();
      unsubContact();
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'Services', href: '/#services' },
    { name: 'Projects', href: '/#projects' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-brand-dark text-white py-4 shadow-lg' : 'bg-brand-dark text-white py-6'
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

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white hover:text-brand-yellow transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-brand-dark pt-24 px-4 pb-8 flex flex-col md:hidden"
          >
            <nav className="flex flex-col gap-6 items-center text-center mt-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-bold uppercase tracking-wider text-white hover:text-brand-yellow transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a 
                href="/#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 bg-brand-yellow text-brand-dark px-8 py-4 font-display font-bold tracking-wider hover:bg-white transition-colors w-full"
              >
                Get a Quote
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-brand-dark text-white pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/" className="text-brand-yellow hover:text-white transition-colors flex items-center gap-2 font-bold uppercase tracking-wider">
              <ArrowLeft size={20} /> Back to Home
            </Link>
          </div>
          
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[2px] w-12 bg-brand-yellow"></div>
              <span className="text-brand-yellow font-bold tracking-widest uppercase text-sm">Portfolio</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">ALL PROJECTS</h1>
            <p className="text-gray-400 max-w-2xl text-lg">
              Explore our complete portfolio of commercial, residential, and civil engineering projects. Each structure represents our commitment to quality, precision, and excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length > 0 ? projects.map((project, idx) => (
              <motion.div 
                key={project.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
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
              <p className="col-span-full text-center text-gray-400 py-12">No projects available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white pt-20 pb-10 border-t border-white/5">
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
                Building the future with precision, integrity, and excellence. We deliver commercial, residential, and civil projects that stand the test of time.
              </p>
              <div className="flex gap-4">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 bg-white/5 flex items-center justify-center hover:bg-brand-yellow hover:text-brand-dark transition-colors rounded-sm">
                    <span className="sr-only">{social}</span>
                    <div className="w-4 h-4 bg-current" style={{ maskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${social}.svg)`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${social}.svg)`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }}></div>
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
              <h4 className="font-display font-bold text-xl uppercase mb-6">Contact Info</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-400">
                  <MapPin className="text-brand-yellow shrink-0 mt-1" size={18} />
                  <span>{contactSettings.address}</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Phone className="text-brand-yellow shrink-0" size={18} />
                  <span>{contactSettings.phone}</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Mail className="text-brand-yellow shrink-0" size={18} />
                  <span>{contactSettings.email}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} REICON Construction Group. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
