"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    FileText,
    Plus,
    Video,
    GraduationCap,
    Briefcase,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Loader2,
    X,
    CheckCircle,
    Upload
} from "lucide-react";

export default function ContentsPage() {
    const [services, setServices] = useState<any[]>([]);
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("Tous les contenus");

    // Modal States
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form States
    const [serviceForm, setServiceForm] = useState({ title: '', price: '', category: 'Visibilité', description: '' });
    const [videoForm, setVideoForm] = useState({ title: '', url: '', type: 'video', description: '', thumbnail_url: '' });
    const [currency, setCurrency] = useState("FCFA"); // Default to FCFA

    useEffect(() => {
        fetchCurrency();
        fetchData();
        const channel = supabase.channel('contents_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contents' }, () => fetchData())
            .subscribe();
        return () => { supabase.removeChannel(channel) };
    }, []);

    const fetchCurrency = async () => {
        const { data } = await supabase.from('app_settings').select('currency_symbol').single();
        if (data) setCurrency(data.currency_symbol);
    };

    const fetchData = async () => {
        try {
            const [servicesRes, contentsRes] = await Promise.all([
                supabase.from('services').select('*').order('created_at', { ascending: false }),
                supabase.from('contents').select('*').order('created_at', { ascending: false })
            ]);

            if (servicesRes.error) throw servicesRes.error;
            if (contentsRes.error) throw contentsRes.error;

            setServices(servicesRes.data || []);
            setVideos(contentsRes.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            // Upload
            const { error: uploadError } = await supabase.storage
                .from('thumbnails')
                .upload(filePath, file);

            if (uploadError) {
                // Try to create bucket if it doesn't exist (this usually requires admin rights, but effective for local/dev if policy allows)
                if (uploadError.message.includes("Bucket not found")) {
                    alert("Erreur: Le bucket 'thumbnails' n'existe pas. Veuillez le créer dans Supabase Storage et le rendre public.");
                }
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from('thumbnails').getPublicUrl(filePath);
            setVideoForm({ ...videoForm, thumbnail_url: data.publicUrl });
        } catch (error: any) {
            alert('Erreur upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateOrUpdateService = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            if (editingId) {
                const { error } = await supabase.from('services').update(serviceForm).eq('id', editingId);
                if (error) throw error;
                alert('Service modifié !');
            } else {
                const { error } = await supabase.from('services').insert([{ ...serviceForm, is_active: true }]);
                if (error) throw error;
                alert('Service créé !');
            }
            setIsServiceModalOpen(false);
            resetForms();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleCreateOrUpdateVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            if (editingId) {
                const { error } = await supabase.from('contents').update(videoForm).eq('id', editingId);
                if (error) throw error;
                alert('Contenu modifié !');
            } else {
                const { error } = await supabase.from('contents').insert([videoForm]);
                if (error) throw error;
                alert('Contenu créé !');
            }
            setIsVideoModalOpen(false);
            resetForms();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    const resetForms = () => {
        setServiceForm({ title: '', price: '', category: 'Visibilité', description: '' });
        setVideoForm({ title: '', url: '', type: 'video', description: '', thumbnail_url: '' });
        setEditingId(null);
    };

    const handleEditService = (service: any) => {
        const validCategories = ['Visibilité', 'Ventes', 'Social'];
        setServiceForm({
            title: service.title,
            price: service.price,
            category: validCategories.includes(service.category) ? service.category : 'Visibilité',
            description: service.description || ''
        });
        setEditingId(service.id);
        setIsServiceModalOpen(true);
    };

    const handleEditVideo = (video: any) => {
        setVideoForm({
            title: video.title,
            url: video.url,
            type: video.type,
            description: video.description || '',
            thumbnail_url: video.thumbnail_url || ''
        });
        setEditingId(video.id);
        setIsVideoModalOpen(true);
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm("Supprimer ce service ?")) return;
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) alert(error.message);
    };

    const handleDeleteContent = async (id: string) => {
        if (!confirm("Supprimer ce contenu ?")) return;
        const { error } = await supabase.from('contents').delete().eq('id', id);
        if (error) alert(error.message);
    };

    const filteredServices = services.filter(s =>
        (activeTab === "Tous les contenus" || activeTab === "Services") &&
        s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredVideos = videos.filter(v =>
        (activeTab === "Tous les contenus" || (activeTab === "Vidéos" && v.type === "video") || (activeTab === "Formations" && v.type === "formation")) &&
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="flex-1 p-10 overflow-auto relative">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A]">Contenus</h1>
                    <p className="text-[#64748B] mt-1 text-sm font-medium">Gérez l'offre commerciale et les supports de vente diffusés sur l'app mobile.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setVideoForm({
                                title: '',
                                url: '',
                                type: activeTab === 'Formations' ? 'formation' : 'video',
                                description: '',
                                thumbnail_url: ''
                            });
                            setIsVideoModalOpen(true);
                        }}
                        className="bg-white border border-[#E2E8F0] text-[#0F172A] px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center space-x-2 transition-all hover:bg-slate-50"
                    >
                        {activeTab === 'Formations' ? <GraduationCap size={18} /> : <Video size={18} />}
                        <span>{activeTab === 'Formations' ? 'Ajouter une Formation' : 'Ajouter une Vidéo'}</span>
                    </button>
                    <button
                        onClick={() => { resetForms(); setIsServiceModalOpen(true); }}
                        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all"
                    >
                        <Plus size={20} />
                        <span>Nouveau Service</span>
                    </button>
                </div>
            </header>

            {/* Tabs / Filters Section */}
            <div className="flex space-x-6 mb-8 border-b border-[#E2E8F0]">
                {["Tous les contenus", "Services", "Vidéos", "Formations"].map((tab, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 px-2 text-sm font-bold transition-all ${activeTab === tab ? "text-[#4F46E5] border-b-2 border-[#4F46E5]" : "text-[#64748B] hover:text-[#0F172A]"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin mb-4" />
                    <p className="text-[#64748B] font-medium">Chargement des contenus...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Services List */}
                    {activeTab !== "Vidéos" && activeTab !== "Formations" && (
                        <div className={`${activeTab === "Services" ? "lg:col-span-3" : "lg:col-span-2"} space-y-6`}>
                            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
                                <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <Briefcase size={20} className="text-[#4F46E5]" />
                                        <h2 className="text-xl font-bold text-[#0F172A]">Listing des Services</h2>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-[#F1F5F9] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                                        <Search size={14} className="text-[#64748B]" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher..."
                                            className="bg-transparent border-none text-xs focus:ring-0 w-24"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="divide-y divide-[#E2E8F0]">
                                    {filteredServices.map((service, i) => (
                                        <div key={service.id} className="p-6 flex items-center justify-between hover:bg-[#F8FAFC]/50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-[#4F46E5]">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#0F172A]">{service.title}</h4>
                                                    <p className="text-xs text-[#64748B] font-medium">{service.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-8">
                                                <span className="font-black text-[#0F172A]">{service.price} {currency}</span>
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => handleEditService(service)}
                                                        className="p-2 hover:bg-slate-100 rounded-lg text-[#64748B] transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteService(service.id)}
                                                        className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-[#64748B] transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredServices.length === 0 && (
                                        <div className="p-10 text-center text-[#64748B]">Aucun service trouvé.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Videos Sidebar / Main */}
                    {activeTab !== "Services" && (
                        <div className={`${activeTab === "Vidéos" || activeTab === "Formations" ? "lg:col-span-3" : "space-y-6"}`}>
                            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
                                <div className="p-6 border-b border-[#E2E8F0] flex items-center space-x-2">
                                    {activeTab === 'Formations' ? <GraduationCap size={18} className="text-emerald-500" /> : <Video size={18} className="text-orange-500" />}
                                    <h2 className="text-lg font-bold text-[#0F172A]">{activeTab === 'Formations' ? 'Formations' : 'Supports Médias'}</h2>
                                </div>
                                <div className={`p-4 ${activeTab === "Vidéos" || activeTab === "Formations" ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-4"}`}>
                                    {filteredVideos.map((vid) => (
                                        <div key={vid.id} className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] group relative overflow-hidden transition-all hover:bg-white hover:shadow-md">
                                            {vid.thumbnail_url && (
                                                <div className="w-full h-32 mb-3 rounded-lg overflow-hidden relative bg-slate-200">
                                                    <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Video size={24} className="text-white drop-shadow-md" />
                                                    </div>
                                                </div>
                                            )}
                                            {!vid.thumbnail_url && (
                                                <div className="w-full h-32 mb-3 rounded-lg bg-orange-50 flex items-center justify-center">
                                                    <Video size={32} className="text-orange-200" />
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] font-black tracking-widest uppercase ${vid.type === 'video' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                                    {vid.type === 'video' ? 'VIDÉO' : 'FORMATION'}
                                                </span>
                                            </div>
                                            <h5 className="font-bold text-sm text-[#0F172A] pr-6">{vid.title}</h5>
                                            {vid.description && (
                                                <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{vid.description}</p>
                                            )}
                                            <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg">
                                                <button
                                                    onClick={() => handleEditVideo(vid)}
                                                    className="text-[#94A3B8] hover:text-[#4F46E5] p-1"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContent(vid.id)}
                                                    className="text-[#94A3B8] hover:text-red-500 p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredVideos.length === 0 && (
                                        <div className="p-4 text-center text-[#64748B] text-xs col-span-full">
                                            {activeTab === 'Formations' ? 'Aucune formation trouvée.' : 'Aucun média trouvé.'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Service Create/Edit Modal */}
            {isServiceModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC]">
                            <h3 className="text-xl font-bold text-[#0F172A]">{editingId ? 'Modifier Service' : 'Nouveau Service'}</h3>
                            <button onClick={() => setIsServiceModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrUpdateService} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#64748B] mb-2">Titre du service</label>
                                <input type="text" required value={serviceForm.title} onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 transition-all" placeholder="Ex: Création Site Web" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#64748B] mb-2">Prix (€)</label>
                                <input type="number" required value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 transition-all" placeholder="Ex: 1500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#64748B] mb-2">Catégorie</label>
                                <select value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 transition-all">
                                    <option value="Visibilité">Visibilité</option>
                                    <option value="Ventes">Ventes</option>
                                    <option value="Social">Social</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#64748B] mb-2">Description / Détails</label>
                                <textarea required value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 transition-all h-24 resize-none" placeholder="Détaillez le service..." />
                            </div>
                            <button type="submit" disabled={creating} className="w-full bg-[#4F46E5] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 hover:bg-indigo-700 transition-all">
                                {creating ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> <span>{editingId ? 'Mettre à jour' : 'Créer Service'}</span></>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Video Create/Edit Modal */}
            {isVideoModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC]">
                            <h3 className="text-xl font-bold text-[#0F172A]">{editingId ? 'Modifier Contenu' : 'Nouveau Contenu'}</h3>
                            <button onClick={() => setIsVideoModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrUpdateVideo} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#64748B] mb-2">Titre</label>
                                <input type="text" required value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 transition-all" placeholder={videoForm.type === 'formation' ? "Ex: Gestion Vente" : "Ex: Titre de la vidéo"} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#64748B] mb-2">Type de contenu</label>
                                <select value={videoForm.type} onChange={e => setVideoForm({ ...videoForm, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 transition-all bg-white">
                                    <option value="video">Vidéo</option>
                                    <option value="formation">Formation</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#64748B] mb-2">
                                    {videoForm.type === 'formation' ? 'Programme / Détails' : 'Description'}
                                </label>
                                <textarea required value={videoForm.description} onChange={e => setVideoForm({ ...videoForm, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 transition-all h-24" placeholder={videoForm.type === 'formation' ? "Détaillez les modules..." : "Description de la vidéo..."} />
                            </div>

                            {/* Thumbnail Upload */}
                            <div>
                                <label className="block text-sm font-bold text-[#64748B] mb-2">
                                    {videoForm.type === 'formation' ? 'Affiche / Image' : 'Image de couverture'}
                                </label>
                                <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 text-center hover:bg-white transition-colors relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        {uploading ? (
                                            <Loader2 size={24} className="text-[#4F46E5] animate-spin" />
                                        ) : videoForm.thumbnail_url ? (
                                            <>
                                                <img src={videoForm.thumbnail_url} alt="Aperçu" className="h-20 rounded-md object-contain mb-2" />
                                                <span className="text-xs text-green-600 font-bold">Image chargée ! Cliquer pour changer.</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-400" />
                                                <span className="text-sm text-gray-500">Cliquez pour upload une image</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {videoForm.type === 'video' && (
                                <div>
                                    <label className="block text-sm font-bold text-[#64748B] mb-2">URL de la vidéo</label>
                                    <input type="url" required value={videoForm.url} onChange={e => setVideoForm({ ...videoForm, url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 transition-all" placeholder="https://youtube.com/..." />
                                </div>
                            )}
                            <button type="submit" disabled={creating || uploading} className="w-full bg-[#4F46E5] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 hover:bg-indigo-700 transition-all">
                                {creating ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> <span>{editingId ? 'Mettre à jour' : 'Sauvegarder'}</span></>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}


