import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, getDocs, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, signInWithGoogle, logout } from '../firebase';
import { Trash2, Plus, Edit2, LogOut, Database, Mail, Settings, Save, MapPin, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [autoReply, setAutoReply] = useState({ subject: 'Thank you for contacting us', body: 'We have received your message and will get back to you shortly.', enabled: false });
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
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const [newService, setNewService] = useState({ title: '', description: '', icon: 'Building2', order: 0 });
  const [newProject, setNewProject] = useState({ title: '', category: '', image: '', order: 0 });
  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', content: '', rating: 5, avatar: '', order: 0 });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingTestimonial, setIsGeneratingTestimonial] = useState(false);
  const [testimonialAiNotes, setTestimonialAiNotes] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login error caught in component:", error);
      setLoginError(error.message || "An unknown error occurred during sign in.");
    }
  };

  useEffect(() => {
    if (!user) return;

    const qServices = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qProjects = query(collection(db, 'projects'), orderBy('order', 'asc'));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qTestimonials = query(collection(db, 'testimonials'), orderBy('order', 'asc'));
    const unsubTestimonials = onSnapshot(qTestimonials, (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qMessages = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'autoreply'), (docSnap) => {
      if (docSnap.exists()) {
        setAutoReply(docSnap.data() as any);
      }
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
      unsubMessages();
      unsubSettings();
      unsubContact();
      unsubHero();
      unsubAbout();
      unsubCta();
      unsubStats();
    };
  }, [user]);

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingServiceId) {
        await updateDoc(doc(db, 'services', editingServiceId), {
          ...newService,
          order: Number(newService.order)
        });
        setEditingServiceId(null);
      } else {
        await addDoc(collection(db, 'services'), {
          ...newService,
          order: Number(newService.order)
        });
      }
      setNewService({ title: '', description: '', icon: 'Building2', order: 0 });
    } catch (error) {
      console.error("Error saving service", error);
      alert("Failed to save service. Check permissions.");
    }
  };

  const handleEditService = (service: any) => {
    setNewService({
      title: service.title,
      description: service.description,
      icon: service.icon,
      order: service.order
    });
    setEditingServiceId(service.id);
  };

  const handleCancelEditService = () => {
    setNewService({ title: '', description: '', icon: 'Building2', order: 0 });
    setEditingServiceId(null);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (error) {
      console.error("Error deleting service", error);
    }
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProjectId) {
        await updateDoc(doc(db, 'projects', editingProjectId), {
          ...newProject,
          order: Number(newProject.order)
        });
        setEditingProjectId(null);
      } else {
        await addDoc(collection(db, 'projects'), {
          ...newProject,
          order: Number(newProject.order)
        });
      }
      setNewProject({ title: '', category: '', image: '', order: 0 });
    } catch (error) {
      console.error("Error saving project", error);
      alert("Failed to save project. Check permissions.");
    }
  };

  const handleEditProject = (project: any) => {
    setNewProject({
      title: project.title,
      category: project.category,
      image: project.image,
      order: project.order
    });
    setEditingProjectId(project.id);
  };

  const handleCancelEditProject = () => {
    setNewProject({ title: '', category: '', image: '', order: 0 });
    setEditingProjectId(null);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      console.error("Error deleting project", error);
    }
  };

  const handleGenerateProjectImage = async () => {
    if (!newProject.title || !newProject.category) {
      alert("Please enter a title and category first to generate a relevant image.");
      return;
    }
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A professional architectural photography shot of a construction project. Title: ${newProject.title}. Category: ${newProject.category}. High quality, photorealistic, modern construction.`
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });
      
      let base64Image = '';
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            base64Image = `data:${mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
      
      if (base64Image) {
        setNewProject(prev => ({ ...prev, image: base64Image }));
      } else {
        alert("Failed to generate image: No image data returned.");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      alert(`Error generating image: ${error.message || 'Please try again.'}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateTestimonial = async () => {
    if (!newTestimonial.name) {
      alert("Please enter at least a Client Name to generate a testimonial.");
      return;
    }
    setIsGeneratingTestimonial(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Write a professional, glowing client testimonial for a construction company named Reicon Construction Group. The client's name is ${newTestimonial.name}${newTestimonial.role ? ` and their role is ${newTestimonial.role}` : ''}.${testimonialAiNotes ? ` Make sure to include these specific points: ${testimonialAiNotes}.` : ' Focus on their excellent quality, timely delivery, and professionalism.'} Keep it under 3 sentences and make it sound authentic. Do not include quotes around the text.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      if (response.text) {
        setNewTestimonial(prev => ({ ...prev, content: response.text.replace(/^["']|["']$/g, '').trim() }));
        setTestimonialAiNotes(''); // Clear notes after generation
      } else {
        alert("Failed to generate testimonial: No text returned.");
      }
    } catch (error: any) {
      console.error("Error generating testimonial:", error);
      alert(`Error generating testimonial: ${error.message || 'Please try again.'}`);
    } finally {
      setIsGeneratingTestimonial(false);
    }
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTestimonialId) {
        await updateDoc(doc(db, 'testimonials', editingTestimonialId), {
          ...newTestimonial,
          rating: Number(newTestimonial.rating),
          order: Number(newTestimonial.order)
        });
        setEditingTestimonialId(null);
      } else {
        await addDoc(collection(db, 'testimonials'), {
          ...newTestimonial,
          rating: Number(newTestimonial.rating),
          order: Number(newTestimonial.order)
        });
      }
      setNewTestimonial({ name: '', role: '', content: '', rating: 5, avatar: '', order: 0 });
      setTestimonialAiNotes('');
    } catch (error) {
      console.error("Error saving testimonial", error);
      alert("Failed to save testimonial. Check permissions.");
    }
  };

  const handleEditTestimonial = (testimonial: any) => {
    setNewTestimonial({
      name: testimonial.name,
      role: testimonial.role || '',
      content: testimonial.content,
      rating: testimonial.rating || 5,
      avatar: testimonial.avatar || '',
      order: testimonial.order || 0
    });
    setEditingTestimonialId(testimonial.id);
  };

  const handleCancelEditTestimonial = () => {
    setNewTestimonial({ name: '', role: '', content: '', rating: 5, avatar: '', order: 0 });
    setTestimonialAiNotes('');
    setEditingTestimonialId(null);
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (error) {
      console.error("Error deleting testimonial", error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      console.error("Error deleting message", error);
    }
  };

  const handleSaveAutoReply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'autoreply'), autoReply);
      alert("Auto-reply settings saved successfully!");
    } catch (error) {
      console.error("Error saving auto-reply", error);
      alert("Failed to save settings.");
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'contact'), contactInfo);
      alert("Contact info saved successfully!");
    } catch (error) {
      console.error("Error saving contact info", error);
      alert("Failed to save contact info.");
    }
  };

  const handleSaveHeroSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'hero'), heroSettings);
      alert("Hero settings saved successfully!");
    } catch (error) {
      console.error("Error saving hero settings", error);
      alert("Failed to save hero settings.");
    }
  };

  const handleSaveAboutSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'about'), aboutSettings);
      alert("About settings saved successfully!");
    } catch (error) {
      console.error("Error saving about settings", error);
      alert("Failed to save about settings.");
    }
  };

  const handleSaveCtaSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'cta'), ctaSettings);
      alert("CTA settings saved successfully!");
    } catch (error) {
      console.error("Error saving CTA settings", error);
      alert("Failed to save CTA settings.");
    }
  };

  const handleSaveStatsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'stats'), statsSettings);
      alert("Stats settings saved successfully!");
    } catch (error) {
      console.error("Error saving stats settings", error);
      alert("Failed to save stats settings.");
    }
  };

  const handleSeedData = async () => {
    if (!confirm("This will add default services and projects. Continue?")) return;
    
    const defaultServices = [
      { icon: 'Building2', title: 'Commercial Construction', description: 'State-of-the-art office buildings, retail spaces, and industrial facilities.', order: 1 },
      { icon: 'HardHat', title: 'Residential Development', description: 'Custom homes, multi-family units, and luxury residential complexes.', order: 2 },
      { icon: 'Ruler', title: 'Civil Engineering', description: 'Infrastructure projects, roadworks, and foundational site preparation.', order: 3 },
      { icon: 'Truck', title: 'Project Management', description: 'End-to-end oversight ensuring projects are delivered on time and budget.', order: 4 },
    ];

    const defaultProjects = [
      { title: 'Apex Commercial Tower', category: 'Commercial', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800', order: 1 },
      { title: 'Oakwood Residences', category: 'Residential', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800', order: 2 },
      { title: 'Metro Transit Hub', category: 'Civil', image: 'https://images.unsplash.com/photo-1584464498695-9181bea148c4?auto=format&fit=crop&q=80&w=800', order: 3 },
      { title: 'Lumina Tech Park', category: 'Commercial', image: 'https://images.unsplash.com/photo-1531834685032-c3cb3ce13edb?auto=format&fit=crop&q=80&w=800', order: 4 },
      { title: 'Riverside Estate', category: 'Residential', image: 'https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?auto=format&fit=crop&q=80&w=800', order: 5 },
      { title: 'Highway 9 Expansion', category: 'Civil', image: 'https://images.unsplash.com/photo-1590644365607-1c5a392275ce?auto=format&fit=crop&q=80&w=800', order: 6 },
    ];

    const defaultTestimonials = [
      { name: 'Sarah Jenkins', role: 'Homeowner', content: 'Reicon transformed our outdated kitchen into a modern masterpiece. Their attention to detail and professionalism was outstanding.', rating: 5, avatar: 'https://picsum.photos/seed/sarah/100/100', order: 1 },
      { name: 'David Chen', role: 'CEO, TechCorp', content: 'We hired Reicon for our new office build-out. They delivered on time, under budget, and the quality exceeded our expectations.', rating: 5, avatar: 'https://picsum.photos/seed/david/100/100', order: 2 },
      { name: 'Michael Rodriguez', role: 'City Planner', content: 'Working with Reicon on the Metro Transit Hub was a seamless experience. They are true experts in civil engineering.', rating: 5, avatar: 'https://picsum.photos/seed/michael/100/100', order: 3 },
    ];

    try {
      for (const s of defaultServices) {
        await addDoc(collection(db, 'services'), s);
      }
      for (const p of defaultProjects) {
        await addDoc(collection(db, 'projects'), p);
      }
      for (const t of defaultTestimonials) {
        await addDoc(collection(db, 'testimonials'), t);
      }
      alert("Data seeded successfully!");
    } catch (error) {
      console.error("Error seeding data", error);
      alert("Failed to seed data.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-brand-dark">Admin Login</h1>
          <p className="text-gray-600 mb-8">Please sign in with your authorized Google account to access the admin panel.</p>
          
          {loginError && (
            <div className="bg-red-50 text-red-600 p-4 rounded mb-6 text-sm text-left border border-red-200">
              <p className="font-bold mb-1">Login Failed:</p>
              <p>{loginError}</p>
              <p className="mt-2 text-xs">Tip: If you are viewing this inside the AI Studio editor, try opening the app in a new tab.</p>
            </div>
          )}

          <button 
            onClick={handleLogin}
            className="bg-brand-yellow text-brand-dark px-6 py-3 font-bold uppercase tracking-wider w-full hover:bg-brand-dark hover:text-white transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Admin Dashboard</h1>
            <p className="text-gray-500">Logged in as {user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSeedData}
              className="flex items-center gap-2 text-brand-dark hover:text-brand-yellow transition-colors border px-4 py-2 rounded"
            >
              <Database size={20} /> Seed Default Data
            </button>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Services Panel */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">Manage Services</h2>
            
            <form onSubmit={handleSubmitService} className="mb-8 space-y-4 bg-gray-50 p-4 rounded border">
              <h3 className="font-semibold text-lg">{editingServiceId ? 'Edit Service' : 'Add New Service'}</h3>
              <input 
                type="text" placeholder="Title" required
                className="w-full p-2 border rounded"
                value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})}
              />
              <textarea 
                placeholder="Description" required
                className="w-full p-2 border rounded"
                value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})}
              />
              <div className="flex gap-4">
                <select 
                  className="w-full p-2 border rounded"
                  value={newService.icon} onChange={e => setNewService({...newService, icon: e.target.value})}
                >
                  <option value="Building2">Building</option>
                  <option value="HardHat">Hard Hat</option>
                  <option value="Ruler">Ruler</option>
                  <option value="Truck">Truck</option>
                  <option value="Hammer">Hammer</option>
                </select>
                <input 
                  type="number" placeholder="Order" required
                  className="w-full p-2 border rounded"
                  value={newService.order} onChange={e => setNewService({...newService, order: Number(e.target.value)})}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-brand-dark text-white p-2 rounded hover:bg-brand-yellow hover:text-brand-dark transition-colors flex items-center justify-center gap-2">
                  {editingServiceId ? <Edit2 size={18} /> : <Plus size={18} />} 
                  {editingServiceId ? 'Update Service' : 'Add Service'}
                </button>
                {editingServiceId && (
                  <button type="button" onClick={handleCancelEditService} className="bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-4">
              {services.map(service => (
                <div key={service.id} className="flex justify-between items-center p-4 border rounded hover:bg-gray-50">
                  <div>
                    <h4 className="font-bold">{service.title}</h4>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{service.description}</p>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded mt-1 inline-block">Order: {service.order}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditService(service)} className="text-blue-500 hover:text-blue-700 p-2">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDeleteService(service.id)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Panel */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">Manage Projects</h2>
            
            <form onSubmit={handleSubmitProject} className="mb-8 space-y-4 bg-gray-50 p-4 rounded border">
              <h3 className="font-semibold text-lg">{editingProjectId ? 'Edit Project' : 'Add New Project'}</h3>
              <input 
                type="text" placeholder="Title" required
                className="w-full p-2 border rounded"
                value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})}
              />
              <input 
                type="text" placeholder="Category (e.g., Commercial)" required
                className="w-full p-2 border rounded"
                value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})}
              />
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="Image URL or Base64" required
                  className="flex-1 p-2 border rounded"
                  value={newProject.image} onChange={e => setNewProject({...newProject, image: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={handleGenerateProjectImage}
                  disabled={isGeneratingImage}
                  className="bg-brand-yellow text-brand-dark px-4 py-2 rounded font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                  <Sparkles size={18} /> {isGeneratingImage ? 'Generating...' : 'AI Image'}
                </button>
              </div>
              {newProject.image && newProject.image.startsWith('data:image') && (
                <div className="mt-2">
                  <img src={newProject.image} alt="Preview" className="h-32 object-cover rounded" />
                </div>
              )}
              <input 
                type="number" placeholder="Order" required
                className="w-full p-2 border rounded"
                value={newProject.order} onChange={e => setNewProject({...newProject, order: Number(e.target.value)})}
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-brand-dark text-white p-2 rounded hover:bg-brand-yellow hover:text-brand-dark transition-colors flex items-center justify-center gap-2">
                  {editingProjectId ? <Edit2 size={18} /> : <Plus size={18} />} 
                  {editingProjectId ? 'Update Project' : 'Add Project'}
                </button>
                {editingProjectId && (
                  <button type="button" onClick={handleCancelEditProject} className="bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="flex justify-between items-center p-4 border rounded hover:bg-gray-50">
                  <div className="flex gap-4 items-center">
                    <img src={project.image} alt={project.title} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h4 className="font-bold">{project.title}</h4>
                      <p className="text-sm text-gray-500">{project.category}</p>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded mt-1 inline-block">Order: {project.order}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditProject(project)} className="text-blue-500 hover:text-blue-700 p-2">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDeleteProject(project.id)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6 border-b pb-4">Manage Testimonials</h2>
          
          <form onSubmit={handleSubmitTestimonial} className="mb-8 space-y-4 bg-gray-50 p-4 rounded border max-w-3xl">
            <h3 className="font-semibold text-lg">{editingTestimonialId ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input 
                type="text" placeholder="Client Name" required
                className="w-full p-2 border rounded"
                value={newTestimonial.name} onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})}
              />
              <input 
                type="text" placeholder="Role / Company (Optional)"
                className="w-full p-2 border rounded"
                value={newTestimonial.role} onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})}
              />
            </div>
            <div className="bg-brand-yellow/10 p-4 rounded border border-brand-yellow/30 mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-brand-dark flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-yellow" />
                  AI Testimonial Writer
                </label>
                <button 
                  type="button" 
                  onClick={handleGenerateTestimonial}
                  disabled={isGeneratingTestimonial}
                  className="text-xs font-bold bg-brand-dark text-white px-3 py-1.5 rounded hover:bg-brand-yellow hover:text-brand-dark transition-colors disabled:opacity-50"
                >
                  {isGeneratingTestimonial ? 'Generating...' : 'Generate Content'}
                </button>
              </div>
              <input 
                type="text" placeholder="Optional: Add specific notes (e.g., 'finished early', 'great kitchen remodel')"
                className="w-full p-2 border border-brand-yellow/50 rounded bg-white text-sm"
                value={testimonialAiNotes} onChange={e => setTestimonialAiNotes(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Testimonial Content</label>
              <textarea 
                placeholder="Testimonial Content" required rows={3}
                className="w-full p-2 border rounded"
                value={newTestimonial.content} onChange={e => setNewTestimonial({...newTestimonial, content: e.target.value})}
              />
            </div>
            <input 
              type="url" placeholder="Avatar Image URL (Optional)"
              className="w-full p-2 border rounded"
              value={newTestimonial.avatar} onChange={e => setNewTestimonial({...newTestimonial, avatar: e.target.value})}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Rating (1-5)</label>
                <input 
                  type="number" min="1" max="5" required
                  className="w-full p-2 border rounded"
                  value={newTestimonial.rating} onChange={e => setNewTestimonial({...newTestimonial, rating: Number(e.target.value)})}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Order</label>
                <input 
                  type="number" required
                  className="w-full p-2 border rounded"
                  value={newTestimonial.order} onChange={e => setNewTestimonial({...newTestimonial, order: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-brand-dark text-white p-2 rounded hover:bg-brand-yellow hover:text-brand-dark transition-colors flex items-center justify-center gap-2">
                {editingTestimonialId ? <Edit2 size={18} /> : <Plus size={18} />} 
                {editingTestimonialId ? 'Update Testimonial' : 'Add Testimonial'}
              </button>
              {editingTestimonialId && (
                <button type="button" onClick={handleCancelEditTestimonial} className="bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="p-4 border rounded hover:bg-gray-50 relative group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditTestimonial(testimonial)} className="text-blue-500 hover:text-blue-700 p-1 bg-white rounded shadow-sm">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteTestimonial(testimonial.id)} className="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  {testimonial.avatar ? (
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-brand-yellow">{'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded mt-2 inline-block">Order: {testimonial.order}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Mail className="text-brand-dark" size={28} />
            <h2 className="text-2xl font-bold">Contact Messages</h2>
            <span className="bg-brand-yellow text-brand-dark px-3 py-1 rounded-full text-sm font-bold ml-2">
              {messages.length}
            </span>
          </div>
          
          <div className="space-y-4">
            {messages.length > 0 ? messages.map(msg => (
              <div key={msg.id} className="p-6 border rounded-lg hover:bg-gray-50 transition-colors relative group">
                <button 
                  onClick={() => handleDeleteMessage(msg.id)} 
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-600 p-2 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Message"
                >
                  <Trash2 size={20} />
                </button>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">From</p>
                    <p className="font-semibold text-brand-dark">{msg.name}</p>
                    <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline">{msg.email}</a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Date</p>
                    <p className="text-sm">{new Date(msg.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Subject</p>
                    <p className="font-semibold">{msg.subject || 'No Subject'}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded border text-gray-700 whitespace-pre-wrap">
                  {msg.message}
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                <Mail className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg">No messages received yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Auto-Reply Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Settings className="text-brand-dark" size={28} />
            <h2 className="text-2xl font-bold">Auto-Reply Settings</h2>
          </div>
          <form onSubmit={handleSaveAutoReply} className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <input 
                type="checkbox" 
                id="enableAutoReply"
                checked={autoReply.enabled}
                onChange={(e) => setAutoReply({...autoReply, enabled: e.target.checked})}
                className="w-5 h-5 text-brand-yellow rounded focus:ring-brand-yellow"
              />
              <label htmlFor="enableAutoReply" className="font-bold text-gray-700">Enable Automatic Email Reply</label>
            </div>
            
            {autoReply.enabled && (
              <div className="space-y-4 p-4 bg-gray-50 border rounded">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Subject</label>
                  <input 
                    type="text" 
                    required
                    value={autoReply.subject}
                    onChange={(e) => setAutoReply({...autoReply, subject: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Body</label>
                  <textarea 
                    required
                    rows={4}
                    value={autoReply.body}
                    onChange={(e) => setAutoReply({...autoReply, body: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">This message will be sent automatically to the user's email address when they submit the contact form.</p>
                </div>
              </div>
            )}
            
            <button type="submit" className="bg-brand-dark text-white px-6 py-2 rounded hover:bg-brand-yellow hover:text-brand-dark transition-colors flex items-center gap-2">
              <Save size={18} /> Save Settings
            </button>
          </form>
        </div>

        {/* Hero Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Settings className="text-brand-dark" size={28} />
            <h2 className="text-2xl font-bold">Hero Section Settings</h2>
          </div>
          <form onSubmit={handleSaveHeroSettings} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Background Image URL</label>
              <input 
                type="url" 
                required
                value={heroSettings.image}
                onChange={(e) => setHeroSettings({...heroSettings, image: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title Part 1</label>
                <input 
                  type="text" 
                  required
                  value={heroSettings.titlePart1}
                  onChange={(e) => setHeroSettings({...heroSettings, titlePart1: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title Part 2 (Stroked)</label>
                <input 
                  type="text" 
                  required
                  value={heroSettings.titlePart2}
                  onChange={(e) => setHeroSettings({...heroSettings, titlePart2: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title Part 3</label>
                <input 
                  type="text" 
                  required
                  value={heroSettings.titlePart3}
                  onChange={(e) => setHeroSettings({...heroSettings, titlePart3: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Subtitle</label>
              <textarea 
                required
                rows={3}
                value={heroSettings.subtitle}
                onChange={(e) => setHeroSettings({...heroSettings, subtitle: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <button type="submit" className="bg-brand-dark text-white px-6 py-2 rounded hover:bg-brand-yellow hover:text-brand-dark transition-colors flex items-center gap-2">
              <Save size={18} /> Save Hero Settings
            </button>
          </form>
        </div>

        {/* About Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Settings className="text-brand-dark" size={28} />
            <h2 className="text-2xl font-bold">About Section Settings</h2>
          </div>
          <form onSubmit={handleSaveAboutSettings} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">About Image URL</label>
              <input 
                type="url" 
                required
                value={aboutSettings.image}
                onChange={(e) => setAboutSettings({...aboutSettings, image: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="https://example.com/about-image.jpg"
              />
            </div>
            <button type="submit" className="bg-brand-dark text-white px-6 py-2 rounded hover:bg-brand-yellow hover:text-brand-dark transition-colors flex items-center gap-2">
              <Save size={18} /> Save About Settings
            </button>
          </form>
        </div>

        {/* CTA Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Settings className="text-brand-dark" size={28} />
            <h2 className="text-2xl font-bold">CTA Banner Settings</h2>
          </div>
          <form onSubmit={handleSaveCtaSettings} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={ctaSettings.title}
                  onChange={(e) => setCtaSettings({...ctaSettings, title: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subtitle</label>
                <input 
                  type="text" 
                  required
                  value={ctaSettings.subtitle}
                  onChange={(e) => setCtaSettings({...ctaSettings, subtitle: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Button Text</label>
                <input 
                  type="text" 
                  required
                  value={ctaSettings.buttonText}
                  onChange={(e) => setCtaSettings({...ctaSettings, buttonText: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Button Link</label>
                <input 
                  type="text" 
                  required
                  value={ctaSettings.buttonLink}
                  onChange={(e) => setCtaSettings({...ctaSettings, buttonLink: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button type="submit" className="bg-brand-dark text-white px-6 py-2 rounded hover:bg-brand-yellow hover:text-brand-dark transition-colors flex items-center gap-2">
              <Save size={18} /> Save CTA Settings
            </button>
          </form>
        </div>

        {/* Stats Section Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Settings className="text-brand-dark" size={28} />
            <h2 className="text-2xl font-bold">Stats Section Settings</h2>
          </div>
          <form onSubmit={handleSaveStatsSettings} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border p-4 rounded bg-gray-50">
                <h3 className="font-bold mb-2">Stat 1</h3>
                <div className="space-y-2">
                  <input type="text" value={statsSettings.stat1Number} onChange={(e) => setStatsSettings({...statsSettings, stat1Number: e.target.value})} className="w-full p-2 border rounded" placeholder="Number (e.g. 25+)" required />
                  <input type="text" value={statsSettings.stat1Label} onChange={(e) => setStatsSettings({...statsSettings, stat1Label: e.target.value})} className="w-full p-2 border rounded" placeholder="Label" required />
                </div>
              </div>
              <div className="border p-4 rounded bg-gray-50">
                <h3 className="font-bold mb-2">Stat 2</h3>
                <div className="space-y-2">
                  <input type="text" value={statsSettings.stat2Number} onChange={(e) => setStatsSettings({...statsSettings, stat2Number: e.target.value})} className="w-full p-2 border rounded" placeholder="Number (e.g. 350+)" required />
                  <input type="text" value={statsSettings.stat2Label} onChange={(e) => setStatsSettings({...statsSettings, stat2Label: e.target.value})} className="w-full p-2 border rounded" placeholder="Label" required />
                </div>
              </div>
              <div className="border p-4 rounded bg-gray-50">
                <h3 className="font-bold mb-2">Stat 3</h3>
                <div className="space-y-2">
                  <input type="text" value={statsSettings.stat3Number} onChange={(e) => setStatsSettings({...statsSettings, stat3Number: e.target.value})} className="w-full p-2 border rounded" placeholder="Number (e.g. 120+)" required />
                  <input type="text" value={statsSettings.stat3Label} onChange={(e) => setStatsSettings({...statsSettings, stat3Label: e.target.value})} className="w-full p-2 border rounded" placeholder="Label" required />
                </div>
              </div>
              <div className="border p-4 rounded bg-gray-50">
                <h3 className="font-bold mb-2">Stat 4</h3>
                <div className="space-y-2">
                  <input type="text" value={statsSettings.stat4Number} onChange={(e) => setStatsSettings({...statsSettings, stat4Number: e.target.value})} className="w-full p-2 border rounded" placeholder="Number (e.g. 100%)" required />
                  <input type="text" value={statsSettings.stat4Label} onChange={(e) => setStatsSettings({...statsSettings, stat4Label: e.target.value})} className="w-full p-2 border rounded" placeholder="Label" required />
                </div>
              </div>
            </div>
            <button type="submit" className="bg-brand-dark text-white px-6 py-2 rounded hover:bg-brand-yellow hover:text-brand-dark transition-colors flex items-center gap-2">
              <Save size={18} /> Save Stats Settings
            </button>
          </form>
        </div>

        {/* Company Contact Info Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <MapPin className="text-brand-dark" size={28} />
            <h2 className="text-2xl font-bold">Company Contact Info</h2>
          </div>
          <form onSubmit={handleSaveContact} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Head Office Address</label>
              <textarea 
                required
                rows={3}
                value={contactInfo.address}
                onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Primary Phone</label>
                <input 
                  type="text" 
                  required
                  value={contactInfo.phone1}
                  onChange={(e) => setContactInfo({...contactInfo, phone1: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Secondary Phone</label>
                <input 
                  type="text" 
                  value={contactInfo.phone2}
                  onChange={(e) => setContactInfo({...contactInfo, phone2: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Primary Email</label>
                <input 
                  type="email" 
                  required
                  value={contactInfo.email1}
                  onChange={(e) => setContactInfo({...contactInfo, email1: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Secondary Email</label>
                <input 
                  type="email" 
                  value={contactInfo.email2}
                  onChange={(e) => setContactInfo({...contactInfo, email2: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button type="submit" className="bg-brand-dark text-white px-6 py-2 rounded hover:bg-brand-yellow hover:text-brand-dark transition-colors flex items-center gap-2">
              <Save size={18} /> Save Contact Info
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
