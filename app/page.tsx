'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { NewProjectModal } from '@/components/NewProjectModal';
import { DiscordEmbedAuditModal } from '@/components/DiscordEmbedAuditModal';
import { ServiceRate, User, UserRole } from '@/lib/types';
import {
  Terminal,
  Server,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Send,
  Download,
  Code2,
  CheckCircle2,
  Star,
  Globe,
  Shield,
  Clock,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [rates, setRates] = useState<ServiceRate[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState<'all' | 'plugin' | 'setup'>('all');

  const getRatePrice = (type: string, fallback: number): number => {
    const found = rates.find((r) => r.service_type === type);
    return found ? found.base_price : fallback;
  };

  const fetchSession = async () => {
    try {
      const [authRes, ratesRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/rates'),
      ]);
      const data = await authRes.json();
      const ratesData = await ratesRes.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      if (ratesData.success) {
        setRates(ratesData.rates);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const [authRes, ratesRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/admin/rates'),
        ]);
        const data = await authRes.json();
        const ratesData = await ratesRes.json();
        if (active) {
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
          if (ratesData.success) {
            setRates(ratesData.rates);
          }
        }
      } catch {
        if (active) setUser(null);
      }
    };
    loadSession();
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const handleSwitchPersona = async (role: UserRole) => {
    await fetch('/api/auth/quick-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona: role }),
    });
    fetchSession();
  };

  // TRABAJOS REALES Y VERIFICADOS DE SYNTHETIX STUDIO
  const realWorks = [
    {
      id: 'work-isrewards',
      category: 'plugin',
      title: 'isrewards',
      badge: 'Plugin Minecraft • Paper/Purpur',
      desc: 'Plugin especializado de recompensas diarias por actividad y rachas continuas. Desarrollado con GUIs interactivas fluidas, animaciones sin caída de TPS y soporte para PlaceholderAPI.',
      stats: '100% Funcional · 0 lag en tick-rate',
      features: ['Recompensas diarias y por racha', 'GUIs interactivas sin parpadeos', 'PlaceholderAPI %isrewards_streak%'],
      file: 'isrewards-v1.4.2.jar',
      statusTag: 'Desarrollado & Activo',
    },
    {
      id: 'work-issecurity',
      category: 'plugin',
      title: 'issecurity',
      badge: 'Plugin de Seguridad • Anti-Exploit',
      desc: 'Sistema de protección integral para servidores de Minecraft: autenticación reforzada, filtrado de paquetes maliciosos NBT, limitador de conexiones contra ataques bot y protección de permisos.',
      stats: 'Protección NMS · Bloqueo de Exploits',
      features: ['Protección contra paquetes corruptos', 'Autenticación 2FA para operadores', 'Prevención de inyecciones de permisos'],
      file: 'issecurity-v2.1.0.jar',
      statusTag: 'Desarrollado & Activo',
    },
    {
      id: 'work-nixer',
      category: 'setup',
      title: 'Nixer Network',
      badge: 'Network Completa • Vendida',
      desc: 'Red completa de Minecraft desarrollada, configurada y optimizada llave en mano: arquitectura Bungee/Velocity, modalidades BoxPvP y Survival Custom con economías balanceadas y 20.0 TPS estables.',
      stats: 'Modalidad Vendida con Éxito',
      features: ['Configuración Bungee/Velocity', 'Modalidad Survival & BoxPvP', '20.0 TPS a alta concurrencia'],
      file: 'Nixer-Network-Release.zip',
      statusTag: 'Creada & Vendida',
    },
  ];

  const filteredWorks = realWorks.filter(
    (item) => portfolioFilter === 'all' || item.category === portfolioFilter
  );

  return (
    <div className="min-h-screen bg-[#08050E] text-[#F3E8FF] flex flex-col selection:bg-[#C084FC]/30 selection:text-white">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onSwitchPersona={handleSwitchPersona}
      />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-[#9333EA]/15 via-[#C084FC]/10 to-transparent blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-5xl mx-auto text-center">
            {/* Animated Kicker Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#120A21] border border-[#C084FC]/40 text-[#C084FC] text-xs font-semibold mb-6 shadow-[0_0_15px_rgba(192,132,252,0.25)]">
              <Zap className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>Desarrollo Gamer de Confianza • Minecraft & Discord</span>
            </div>

            {/* Impact Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 font-sans">
              Plugins a Medida, Setups de Servidores <br className="hidden sm:inline" />
              y Bots de Discord en{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C084FC] via-[#D8B4FE] to-[#A855F7]">
                Synthetix Studio
              </span>
            </h1>

            {/* Subheading */}
            <p className="max-w-3xl mx-auto text-base sm:text-lg text-purple-200/80 leading-relaxed mb-10">
              Creamos soluciones de desarrollo gamer reales: desde plugins como <strong className="text-white">isrewards</strong> e <strong className="text-white">issecurity</strong>, hasta setups optimizados como <strong className="text-white">Nixer Network</strong>, bots de Discord a tu gusto y portafolios web personalizados.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => {
                  if (user) {
                    setNewProjectModalOpen(true);
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(192,132,252,0.35)] transition-all flex items-center justify-center gap-2.5 active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                {user ? 'Solicitar Proyecto' : 'Iniciar Sesión / Solicitar Proyecto'}
              </button>

              <a
                href="#tarifas"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#120A21] hover:bg-[#1c1033] border border-[#261442] hover:border-[#C084FC]/50 text-purple-200 hover:text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Consultar Tarifas & Precios
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </a>
            </div>

            {/* Real Track Record Banner */}
            <div className="p-4 rounded-2xl bg-[#120A21] border border-[#261442] max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-purple-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#C084FC]" />
                Plugin <strong className="text-white">isrewards</strong> Verificado
              </span>
              <span className="hidden sm:inline text-purple-500">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#C084FC]" />
                Plugin <strong className="text-white">issecurity</strong> Activo
              </span>
              <span className="hidden sm:inline text-purple-500">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <strong className="text-white">Nixer Network</strong> Desarrollada & Vendida
              </span>
            </div>
          </div>
        </section>

        {/* 5 REAL SERVICES OFFERED */}
        <section id="servicios" className="py-18 px-4 sm:px-6 lg:px-8 border-t border-[#261442]/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-[#C084FC] tracking-wider uppercase font-mono">
                Lo Que Hacemos
              </span>
              <h2 className="text-3xl font-bold text-white mt-2 mb-3">
                Servicios de Desarrollo & Configuración
              </h2>
              <p className="text-sm text-purple-300/70">
                Especializados en Minecraft, Discord y presencia web para comunidades gamer y creadores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Servicio 1 */}
              <motion.div
                whileHover={{ scale: 1.025, y: -4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/70 hover:shadow-[0_0_30px_rgba(192,132,252,0.3)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] mb-4">
                    <Server className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Configuración de Servidores Minecraft</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed mb-4">
                    Setups completos para modalidades Survival, BoxPvP, Skyblock y más. Optimización de archivos spigot.yml, paper.yml y purpur.yml para garantizar 20.0 TPS sin lag ni crasheos.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#C084FC] font-semibold pt-3 border-t border-[#261442]">
                  Tarifa: Desde ${getRatePrice('setup_mc', 35)} USD
                </div>
              </motion.div>

              {/* Servicio 2 */}
              <motion.div
                whileHover={{ scale: 1.025, y: -4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/70 hover:shadow-[0_0_30px_rgba(192,132,252,0.3)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] mb-4">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Configuración de Servidores Discord</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed mb-4">
                    Estructura profesional de canales y categorías, jerarquía de roles con permisos blindados contra raids, sistemas de bienvenida y auto-moderación configurada.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#C084FC] font-semibold pt-3 border-t border-[#261442]">
                  Tarifa: Desde ${getRatePrice('setup_dc', 15)} USD
                </div>
              </motion.div>

              {/* Servicio 3 */}
              <motion.div
                whileHover={{ scale: 1.025, y: -4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/70 hover:shadow-[0_0_30px_rgba(192,132,252,0.3)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] mb-4">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Creación de Web Portafolio</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed mb-4">
                    Páginas web modernas, rápidas y responsive para dueños de servidores, comunidades gamer y desarrolladores. Conecta tus redes, tienda y descargas con estilo premium.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#C084FC] font-semibold pt-3 border-t border-[#261442]">
                  Tarifa: Desde ${getRatePrice('web_portfolio', 40)} USD
                </div>
              </motion.div>

              {/* Servicio 4 */}
              <motion.div
                whileHover={{ scale: 1.025, y: -4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/70 hover:shadow-[0_0_30px_rgba(192,132,252,0.3)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] mb-4">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Bot de Discord a tu Gusto</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed mb-4">
                    Desarrollamos bots a medida en Discord.js: sistemas de tickets con transcripciones automáticas, comandos slash, embeds interactivos y sincronización de roles con Minecraft.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#C084FC] font-semibold pt-3 border-t border-[#261442]">
                  Tarifa: Desde ${getRatePrice('bot_discord', 20)} USD
                </div>
              </motion.div>

              {/* Servicio 5 */}
              <motion.div
                whileHover={{ scale: 1.025, y: -4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/70 hover:shadow-[0_0_30px_rgba(192,132,252,0.3)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] mb-4">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Plugins de Minecraft a Medida</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed mb-4">
                    Programación en Java 21 / Kotlin para Paper, Purpur y Spigot. Creación de mecánicas custom, GUIs interactivas, bases de datos seguras y optimización NMS sin fugas de memoria.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#C084FC] font-semibold pt-3 border-t border-[#261442]">
                  Tarifa: Desde ${getRatePrice('plugin_mc', 25)} USD
                </div>
              </motion.div>

              {/* Servicio 6 */}
              <motion.div
                whileHover={{ scale: 1.025, y: -4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/70 hover:shadow-[0_0_30px_rgba(192,132,252,0.3)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] mb-4">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Pack Completo Network</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed mb-4">
                    Solución integral para abrir tu proyecto: Servidor de Minecraft configurado + Plugins necesarios + Servidor de Discord con Bot + Web de presentación.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#C084FC] font-semibold pt-3 border-t border-[#261442]">
                  Tarifa: Desde ${getRatePrice('full_pack', 80)} USD
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* PORTAFOLIO REAL (ISREWARDS, ISSECURITY, NIXER) */}
        <section id="portafolio" className="py-18 px-4 sm:px-6 lg:px-8 bg-[#0B0614] border-t border-[#261442]/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-bold text-[#C084FC] tracking-wider uppercase font-mono">
                  Trabajos Verificados
                </span>
                <h2 className="text-3xl font-bold text-white mt-1">
                  Portafolio Real de Synthetix Studio
                </h2>
                <p className="text-xs text-purple-300/70 mt-1">
                  Proyectos creados y entregados con código y configuraciones verificadas.
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#120A21] border border-[#261442]">
                <button
                  onClick={() => setPortfolioFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    portfolioFilter === 'all'
                      ? 'bg-[#C084FC] text-black font-semibold shadow-sm'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  Todos los Trabajos
                </button>
                <button
                  onClick={() => setPortfolioFilter('plugin')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    portfolioFilter === 'plugin'
                      ? 'bg-[#C084FC] text-black font-semibold shadow-sm'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  Plugins (isrewards / issecurity)
                </button>
                <button
                  onClick={() => setPortfolioFilter('setup')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    portfolioFilter === 'setup'
                      ? 'bg-[#C084FC] text-black font-semibold shadow-sm'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  Networks (Nixer)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredWorks.map((work) => (
                <motion.div
                  key={work.id}
                  whileHover={{ scale: 1.025, y: -4 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/70 hover:shadow-[0_0_30px_rgba(192,132,252,0.3)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-[#C084FC] bg-[#08050E] px-2.5 py-1 rounded border border-[#261442]">
                        {work.badge}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        {work.statusTag}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 font-mono">{work.title}</h3>
                    <p className="text-xs text-purple-200/80 leading-relaxed mb-4">
                      {work.desc}
                    </p>

                    <div className="p-2.5 rounded-xl bg-[#08050E] border border-[#261442] mb-4 text-[11px] font-mono text-purple-300 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>{work.stats}</span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-purple-300/80 mb-6">
                      {work.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-[#C084FC]">·</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        setAuthModalOpen(true);
                      } else {
                        window.location.href = '/dashboard';
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#261442]/80 hover:bg-[#C084FC] hover:text-black text-purple-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ver en Portal de Entregas</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECCIÓN DE TARIFAS & PRECIOS */}
        <section id="tarifas" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#261442]/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-[#C084FC] tracking-wider uppercase font-mono">
                Transparencia Total
              </span>
              <h2 className="text-3xl font-bold text-white mt-2 mb-3">
                Tarifas Claras & Precios de Referencia
              </h2>
              <p className="text-sm text-purple-300/70">
                Precios base accesibles con entrega garantizada, soporte post-entrega y sin costos ocultos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tarifa 1 */}
              <div className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-purple-400 uppercase mb-1">Básico / Entrada</div>
                  <h3 className="text-lg font-bold text-white mb-2">Servidores & Bots Discord</h3>
                  <div className="text-3xl font-extrabold text-[#C084FC] font-mono tabular-nums mb-4">
                    $15 - $30 <span className="text-xs text-purple-400 font-normal">USD</span>
                  </div>
                  <p className="text-xs text-purple-200/70 mb-5 leading-relaxed">
                    Ideal para comunidades que inician o servidores que requieren configuración de Discord o un bot de soporte a medida.
                  </p>
                  <ul className="space-y-2 text-xs text-purple-300 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>Setup Discord: Roles y permisos blindados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>Bot con sistema de tickets y embeds</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>Garantía de funcionamiento continuo</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    if (user) setNewProjectModalOpen(true);
                    else setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#261442] hover:bg-[#C084FC] hover:text-black text-purple-200 text-xs font-semibold transition-colors"
                >
                  Solicitar este Servicio
                </button>
              </div>

              {/* Tarifa 2 (Destacada) */}
              <div className="p-6 rounded-2xl bg-[#120A21] border-2 border-[#C084FC] shadow-[0_0_30px_rgba(192,132,252,0.25)] flex flex-col justify-between relative">
                <div className="absolute -top-3 right-6 bg-[#C084FC] text-black text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Más Solicitado
                </div>
                <div>
                  <div className="text-xs font-mono text-[#C084FC] uppercase mb-1">Especialidad Gamer</div>
                  <h3 className="text-lg font-bold text-white mb-2">Plugins & Setups Minecraft</h3>
                  <div className="text-3xl font-extrabold text-white font-mono tabular-nums mb-4">
                    $25 - $60 <span className="text-xs text-purple-400 font-normal">USD</span>
                  </div>
                  <p className="text-xs text-purple-200/70 mb-5 leading-relaxed">
                    Desarrollo de plugins custom como <em>isrewards</em> o <em>issecurity</em>, o setup completo de modalidades (Survival, BoxPvP, Skyblock).
                  </p>
                  <ul className="space-y-2 text-xs text-purple-200 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>Programación en Java 21 / Kotlin (Paper/Purpur)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>20.0 TPS garantizados sin memory-leaks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>Descarga directa de builds .jar compiladas</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    if (user) setNewProjectModalOpen(true);
                    else setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#C084FC] text-white text-xs font-bold shadow-md hover:from-[#A855F7] hover:to-[#D8B4FE] transition-all"
                >
                  Solicitar Plugin / Setup
                </button>
              </div>

              {/* Tarifa 3 */}
              <div className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-purple-400 uppercase mb-1">Completo / Suite</div>
                  <h3 className="text-lg font-bold text-white mb-2">Web Portafolio & Full Network</h3>
                  <div className="text-3xl font-extrabold text-[#C084FC] font-mono tabular-nums mb-4">
                    $40 - $120 <span className="text-xs text-purple-400 font-normal">USD</span>
                  </div>
                  <p className="text-xs text-purple-200/70 mb-5 leading-relaxed">
                    Diseño web completo para tu proyecto o paquete integral tipo <em>Nixer Network</em> con servidor, plugins, bot y presencia web.
                  </p>
                  <ul className="space-y-2 text-xs text-purple-300 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>Web rápida, responsive y en modo oscuro gamer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>Integración con tienda, Discord y estadísticas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>Chat en tiempo real y soporte dedicado</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    if (user) setNewProjectModalOpen(true);
                    else setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#261442] hover:bg-[#C084FC] hover:text-black text-purple-200 text-xs font-semibold transition-colors"
                >
                  Cotizar Proyecto Completo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO TRABAJAMOS */}
        <section id="flujo" className="py-18 px-4 sm:px-6 lg:px-8 bg-[#0B0614] border-t border-[#261442]/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-[#C084FC] tracking-wider uppercase font-mono">
                Proceso Transparente
              </span>
              <h2 className="text-3xl font-bold text-white mt-2 mb-3">
                Cómo Trabajamos en Synthetix Studio
              </h2>
              <p className="text-sm text-purple-300/70">
                Comunicación directa, seguimiento en tiempo real y entregas cifradas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Inicias Sesión',
                  desc: 'Accede con Discord o correo. Tu perfil queda registrado de forma segura.',
                },
                {
                  step: '02',
                  title: 'Solicitas tu Pedido',
                  desc: 'Elige tu servicio (plugin, setup, bot o web) y define tu requerimiento.',
                },
                {
                  step: '03',
                  title: 'Chat en Tiempo Real',
                  desc: 'Comunícate en directo con el staff en el canal privado de tu proyecto.',
                },
                {
                  step: '04',
                  title: 'Descarga Inmutable',
                  desc: 'Descarga tus archivos compilados (.jar / .zip) con changelog de versión.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] flex flex-col justify-between"
                >
                  <span className="text-2xl font-extrabold text-[#C084FC] font-mono mb-3">
                    {item.step}
                  </span>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#261442]/60">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-[#120A21] to-[#08050E] border border-[#C084FC]/40 p-8 sm:p-12 text-center glow-lilac relative overflow-hidden">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              ¿Listo para Crear tu Plugin, Servidor o Bot?
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl mx-auto mb-8">
              Inicia sesión, envíanos tu requerimiento y chatea en directo con nuestros desarrolladores.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  if (user) setNewProjectModalOpen(true);
                  else setAuthModalOpen(true);
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white font-bold text-xs rounded-xl shadow-[0_0_25px_rgba(192,132,252,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Comenzar Solicitud de Servicio
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modales */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={fetchSession}
      />
      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        onSuccess={(id) => {
          window.location.href = `/dashboard/project/${id}`;
        }}
      />
      <DiscordEmbedAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />
    </div>
  );
}
