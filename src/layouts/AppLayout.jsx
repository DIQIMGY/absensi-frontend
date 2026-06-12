import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, Moon, Sun, Bell, ChevronLeft, ChevronRight, Search, School, Camera, FileText, Clock, CheckCircle, XCircle, Trophy, GraduationCap, Users, UserCheck, Settings2, BarChart2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import { adminApi } from '../services/adminService'
import { guruApi } from '../services/guruService'
import { siswaApi } from '../services/siswaService'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

// Helper: tentukan icon notifikasi berdasarkan pesan — di luar komponen agar tidak TDZ
function getNotifIcon(message) {
  const msg = (message || '').toLowerCase()
  if (msg.includes('izin') || msg.includes('sakit')) return { Icon: FileText, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-500' }
  if (msg.includes('terlambat') || msg.includes('telat')) return { Icon: Clock, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-500' }
  if (msg.includes('hadir') || msg.includes('absen') || msg.includes('masuk')) return { Icon: CheckCircle, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-500' }
  if (msg.includes('alpha') || msg.includes('tidak hadir')) return { Icon: XCircle, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-500' }
  if (msg.includes('ranking') || msg.includes('peringkat') || msg.includes('juara')) return { Icon: Trophy, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-500' }
  if (msg.includes('naik kelas') || msg.includes('lulus') || msg.includes('alumni')) return { Icon: GraduationCap, bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-500' }
  if (msg.includes('siswa') || msg.includes('murid')) return { Icon: Users, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-500' }
  if (msg.includes('guru') || msg.includes('pengajar')) return { Icon: UserCheck, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-500' }
  if (msg.includes('pengaturan') || msg.includes('setting')) return { Icon: Settings2, bg: 'bg-slate-100 dark:bg-slate-800', color: 'text-slate-500' }
  if (msg.includes('laporan') || msg.includes('rekap')) return { Icon: BarChart2, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-500' }
  return { Icon: Bell, bg: 'bg-slate-100 dark:bg-slate-800', color: 'text-slate-400' }
}

function Avatar({ src, name, size = 32 }) {
  const [err, setErr] = useState(false)
  return (
    <div className="rounded-full overflow-hidden flex items-center justify-center font-bold flex-shrink-0 bg-gradient-to-br from-slate-400 to-slate-600 text-white"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}>
      {src && !err
        ? <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} />
        : (name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

// ─── Sidebar extracted as stable component (outside AppLayout) ────────────────
// Penting: harus di luar AppLayout agar tidak di-remount setiap render
function SidebarContent({
  mobile, show, menuGroups, ac, pengaturan, roleLabel, roleIcon,
  extraSidebarTop, searchQ, setSearchQ, searchFocus, setSearchFocus,
  searchRef, filtered, navigate, toggleCollapsed, setSidebarOpen,
  user, getFoto, isDark, toggleTheme, handleLogout, navRef,
  handleUploadFoto, uploadingFoto,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${show ? 'justify-between px-4' : 'justify-center px-2'} py-4 border-b border-slate-100 dark:border-slate-800`}>
        {show ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              {pengaturan.logo_sekolah
                ? <img src={pengaturan.logo_sekolah} alt="Logo" className="w-8 h-8 rounded-xl object-contain bg-white dark:bg-slate-800 p-1 ring-1 ring-slate-200 dark:ring-slate-700"/>
                : <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs" style={{ background: ac.color }}><School size={16}/></div>}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white dark:border-slate-900" style={{ background: ac.color }}/>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">{pengaturan.nama_sekolah?.substring(0, 22) || 'Sistem Absensi'}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">{roleIcon}<span>{roleLabel}</span></p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {pengaturan.logo_sekolah
              ? <img src={pengaturan.logo_sekolah} alt="Logo" className="w-8 h-8 rounded-xl object-contain bg-white dark:bg-slate-800 p-1 ring-1 ring-slate-200 dark:ring-slate-700"/>
              : <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs" style={{ background: ac.color }}><School size={16}/></div>}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white dark:border-slate-900" style={{ background: ac.color }}/>
          </div>
        )}
        {show && !mobile && (
          <button onClick={toggleCollapsed} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0">
            <ChevronLeft size={14}/>
          </button>
        )}
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={15}/>
          </button>
        )}
      </div>

      {/* Extra slot */}
      {show && extraSidebarTop && <div className="px-3 pt-2">{extraSidebarTop}</div>}

      {/* Search */}
      {show && (
        <div className="px-3 pt-2 pb-1 relative" ref={searchRef}>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="text" placeholder="Cari menu..." value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
              className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 text-slate-700 dark:text-slate-200 placeholder-slate-400"/>
          </div>
          <AnimatePresence>
            {searchFocus && filtered.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                className="absolute left-3 right-3 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
                {filtered.map(item => (
                  <button key={item.path} onMouseDown={() => { navigate(item.path); setSearchQ('') }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors">
                    <item.icon size={13} className="text-slate-400 flex-shrink-0"/>
                    <span className="text-xs text-slate-700 dark:text-slate-200">{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Nav — ref dipakai untuk preserve scroll position */}
      <nav ref={navRef} className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {menuGroups.map((group, gi) => (
          <div key={gi}>
            {show && group.title && (
              <p className="px-2 mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{group.title}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavLink key={item.path} to={item.path}
                  className={({ isActive }) => `group relative flex items-center ${!show ? 'justify-center px-0 py-2.5' : 'px-2.5 py-2'} rounded-xl text-sm transition-all duration-150 border ${
                    isActive ? `${ac.activeBg} ${ac.activeBorder} ${ac.activeText} font-semibold` : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}>
                  {({ isActive }) => (
                    <>
                      {isActive && show && (
                        <span
                          className="absolute left-0 inset-y-2 w-0.5 rounded-r-full"
                          style={{ background: ac.color }}
                        />
                      )}
                      <item.icon size={15} strokeWidth={isActive ? 2.2 : 1.8} className={`flex-shrink-0 transition-all duration-150 ${show ? 'mr-2.5' : ''}`}/>
                      {show && <span className="truncate">{item.label}</span>}
                      {!show && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap z-50 shadow-lg pointer-events-none">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-slate-700"/>
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-2 space-y-0.5">
        {show && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-1.5">
            {/* Avatar bisa diklik untuk upload foto */}
            <label className="relative cursor-pointer flex-shrink-0 group">
              <div className="relative">
                <Avatar src={getFoto()} name={user?.name} size={28}/>
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={10} className="text-white"/>
              </div>
              <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" className="hidden"
                onChange={e => {
                  const file = e.target.files[0]
                  if (!file) return
                  if (file.size > 2*1024*1024) { toast.error('Foto maks 2MB'); return }
                  handleUploadFoto(file)
                }}/>
              {uploadingFoto && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                </div>
              )}
            </label>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.name || 'Pengguna'}</p>
              <p className="text-[10px] text-slate-400 truncate">{roleLabel}</p>
            </div>
          </div>
        )}
        <button onClick={toggleTheme}
          className={`w-full flex items-center ${!show ? 'justify-center px-0' : 'px-2.5'} py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors gap-2`}>
          {isDark ? <Sun size={14}/> : <Moon size={14}/>}
          {show && <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>}
        </button>
        <button onClick={handleLogout}
          className={`w-full flex items-center ${!show ? 'justify-center px-0' : 'px-2.5'} py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors gap-2`}>
          <LogOut size={14}/>
          {show && <span>Keluar</span>}
        </button>
      </div>
    </div>
  )
}

export default function AppLayout({ menuGroups = [], accent = {}, roleLabel = 'Panel', roleIcon = null, extraSidebarTop = null, notifLoader = null, notifMarkRead = null, notifMarkAll = null, extraTopbarRight = null }) {
  const allItems = menuGroups.flatMap(g => g.items)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [localCollapsed, setLocalCollapsed] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [scrollPct, setScrollPct] = useState(0)
  const [fotoModalOpen, setFotoModalOpen] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState(null) // preview instan setelah upload

  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme, sidebarCollapsed: storeCollapsed, toggleSidebar } = useThemeStore()
  const { pengaturan, fetchPengaturan } = usePengaturanStore()
  const navigate = useNavigate()
  const location = useLocation()
  const notifRef = useRef(null)
  const searchRef = useRef(null)
  const mainRef = useRef(null)
  // Refs untuk preserve scroll position sidebar nav — tidak reset saat navigasi
  const desktopNavRef = useRef(null)
  const mobileNavRef = useRef(null)

  const isCollapsed = typeof storeCollapsed === 'boolean' ? storeCollapsed : localCollapsed
  const toggleCollapsed = toggleSidebar || (() => setLocalCollapsed(p => !p))

  const ac = {
    color: '#6366f1',
    activeBg: 'bg-indigo-50 dark:bg-indigo-900/20',
    activeBorder: 'border-indigo-200 dark:border-indigo-800/40',
    activeText: 'text-indigo-700 dark:text-indigo-300',
    ...accent,
  }

  useEffect(() => { fetchPengaturan(true) }, [])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const fn = () => {
      setScrolled(el.scrollTop > 8)
      const max = el.scrollHeight - el.clientHeight
      setScrollPct(max > 0 ? Math.round((el.scrollTop / max) * 100) : 0)
    }
    el.addEventListener('scroll', fn, { passive: true })
    return () => el.removeEventListener('scroll', fn)
  }, [])

  // Tutup sidebar mobile saat pindah halaman
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); toggleCollapsed() }
      if (e.key === 'Escape') { setNotifOpen(false); setSearchFocus(false); setSidebarOpen(false) }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [toggleCollapsed])

  useEffect(() => {
    const fn = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false) }
    document.addEventListener('mousedown', fn)
    document.addEventListener('touchstart', fn, { passive: true })
    return () => {
      document.removeEventListener('mousedown', fn)
      document.removeEventListener('touchstart', fn)
    }
  }, [])

  const loadNotifs = useCallback(async () => {
    if (!notifLoader) return
    try { const r = await notifLoader(); setNotifications(r.list); setUnread(r.unreadCount) } catch {}
  }, [notifLoader])

  useEffect(() => { loadNotifs(); const t = setInterval(loadNotifs, 30000); return () => clearInterval(t) }, [loadNotifs])

  const handleMarkRead = (id) => { notifMarkRead?.(id); setNotifications(p => p.filter(n => n.id !== id)); setUnread(p => Math.max(0, p - 1)) }
  const handleMarkAll = () => { notifMarkAll?.(); setNotifications([]); setUnread(0); toast.success('Notifikasi dihapus', { duration: 1500 }) }

  const handleLogout = async () => {
    const r = await Swal.fire({ title: 'Keluar?', text: 'Yakin ingin logout?', icon: 'question', showCancelButton: true, confirmButtonColor: ac.color, cancelButtonColor: '#64748b', confirmButtonText: 'Ya, Keluar', cancelButtonText: 'Batal', reverseButtons: true, customClass: { popup: 'rounded-2xl shadow-2xl' } })
    if (r.isConfirmed) { await logout(); navigate('/login'); toast.success('Sampai jumpa!', { icon: '👋', duration: 2000 }) }
  }

  const handleUploadFoto = async (file) => {
    if (!user?.id || !file) return
    try {
      setUploadingFoto(true)
      // Preview instan sebelum upload selesai
      const localUrl = URL.createObjectURL(file)
      setFotoPreviewUrl(localUrl)

      const fd = new FormData()
      fd.append('foto', file)

      let res
      if (user.role === 'admin') {
        res = await adminApi.uploadFotoUser(user.id, fd)
      } else if (user.role === 'guru') {
        res = await guruApi.updateFotoUser(fd)
      } else {
        res = await siswaApi.updateFotoUser(fd)
      }

      // Update store langsung tanpa checkAuth — ambil foto_url dari response
      const fotoUrl = res.data?.data?.foto_url || localUrl
      setFotoPreviewUrl(fotoUrl)
      useAuthStore.getState().updateUser({ foto: res.data?.data?.foto, foto_url: fotoUrl })

      toast.success('Foto profil diperbarui')
    } catch (err) {
      setFotoPreviewUrl(null)
      toast.error(err.response?.data?.message || 'Gagal upload foto')
    } finally {
      setUploadingFoto(false)
    }
  }

  const getFoto = () => {
    if (fotoPreviewUrl) return fotoPreviewUrl
    const f = user?.foto_url || null
    if (!f && user?.foto) {
      if (user.foto.startsWith('http')) return user.foto
      return `${window.location.origin}/storage/${user.foto}`
    }
    return f
  }
  const currentItem = allItems.find(i => i.path === location.pathname)
  const pageTitle = currentItem?.label || 'Dashboard'
  const filtered = searchQ ? allItems.filter(i => i.label.toLowerCase().includes(searchQ.toLowerCase())) : []

  // Props yang di-share ke SidebarContent
  const sidebarProps = {
    menuGroups, ac, pengaturan, roleLabel, roleIcon,
    extraSidebarTop, searchQ, setSearchQ, searchFocus, setSearchFocus,
    searchRef, filtered, navigate, toggleCollapsed, setSidebarOpen,
    user, getFoto, isDark, toggleTheme, handleLogout,
    handleUploadFoto, uploadingFoto,
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] flex">

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed h-full z-40 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent
          {...sidebarProps}
          mobile={false}
          show={!isCollapsed}
          navRef={desktopNavRef}
        />
        {isCollapsed && (
          <button onClick={toggleCollapsed}
            className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-50">
            <ChevronRight size={11}/>
          </button>
        )}
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            onTouchEnd={() => setSidebarOpen(false)}/>
          <aside
            className="fixed left-0 top-0 h-full w-72 z-50 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 lg:hidden overflow-hidden">
            <SidebarContent
              {...sidebarProps}
              mobile={true}
              show={true}
              navRef={mobileNavRef}
            />
          </aside>
        </>
      )}

      {/* Main */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pb-16 lg:pb-0`}>

        {/* Topbar */}
        <header className={`sticky top-0 z-30 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
          {/* Scroll progress bar */}
          <div className="h-0.5 w-full bg-transparent overflow-hidden">
            <div
              className="h-full origin-left transition-transform duration-100"
              style={{ background: `linear-gradient(90deg, ${ac.color}, #10b981)`, transform: `scaleX(${scrollPct / 100})` }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Menu size={17}/>
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            {currentItem && <currentItem.icon size={15} className="text-slate-400 flex-shrink-0"/>}
            <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={toggleTheme}
              className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isDark ? <Sun size={15}/> : <Moon size={15}/>}
            </button>

            {/* Extra topbar right slot (e.g. music player for siswa) */}
            {extraTopbarRight}

            {notifLoader && (
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(p => !p)}
                  className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Bell size={15}/>
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: ac.color }}>
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      className="absolute right-0 mt-1 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifikasi</p>
                        {unread > 0 && <button onClick={handleMarkAll} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Hapus semua</button>}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                        {notifications.length === 0
                          ? <div className="py-8 text-center text-slate-400 text-xs">Tidak ada notifikasi</div>
                          : notifications.map(n => {
                            const { Icon, bg, color } = getNotifIcon(n.message || n.title)
                            return (
                              <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${n.read ? 'opacity-60' : ''}`}>
                                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${bg}`}>
                                  <Icon size={13} className={color}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug">{n.message || n.title}</p>
                                  {n.time && <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>}
                                </div>
                                {!n.read && (
                                  <button onClick={() => handleMarkRead(n.id)} className="flex-shrink-0 text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 transition-colors mt-0.5">
                                    <X size={11}/>
                                  </button>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="flex items-center gap-2 pl-1">
              <div className="relative flex-shrink-0">
                <Avatar src={getFoto()} name={user?.name} size={28}/>
              </div>
              <span className="hidden md:block text-xs font-medium text-slate-600 dark:text-slate-300 max-w-[90px] truncate">{user?.name}</span>
            </div>
          </div>
          </div>
        </header>

        {/* Content */}
        <main ref={mainRef} className="flex-1 overflow-auto">
          <div className={location.pathname.endsWith('/dashboard') ? '' : 'px-3 sm:px-4 lg:px-6 py-4'}>
            <Outlet/>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex safe-area-bottom">
        {allItems.slice(0, 5).map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) => `relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors duration-150 ${isActive ? ac.activeText : 'text-slate-400 dark:text-slate-500'}`}>
            {({ isActive }) => (
              <>
                <item.icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className="transition-all duration-150"/>
                <span className="leading-none">{item.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 w-6 h-0.5 rounded-full"
                    style={{ background: ac.color }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
