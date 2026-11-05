'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { NewProjectModal } from '@/components/NewProjectModal';
import { DiscordEmbedAuditModal } from '@/components/DiscordEmbedAuditModal';
import { User } from '@/lib/types';
import {
  Terminal,
  Server,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Cpu,
  Send,
  Download,
  Code2,
  CheckCircle2,
  Star,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState<'all' | 'plugin' | 'setup' | 'bot'>('all');

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (active) {
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
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

  const handleSwitchPersona = async (role: 'client' | 'admin') => {
    await fetch('/api/auth/quick-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona: role }),
    });
    await fetchSession();
  };

  const portfolioItems = [
    {
      id: 'port-1',
      category: 'plugin',
      title: 'SynthetixEconomy NMS Suite',
      badge: 'Paper 1.21.4',
      desc: 'Sistema bancario con paginación fluida en GUIs, transacciones atómicas multihilo y sincronización en Cloudflare D1.',
      stats: '0.00ms Tick Impact · 250k transacciones/día',
      features: ['Soporte SQLite/MySQL', 'Multi-divisa (Gemas, Monedas)', 'NMS Packet Inventory'],
      file: 'SynthetixEconomy-1.2.0-RELEASE.jar',
    },
    {
      id: 'port-2',
      category: 'setup',
      title: 'BoxPvP Extreme Network Setup',
      badge: 'Purpur 1.21',
      desc: 'Modalidad configurada llave en mano con 18 minas automáticas, armaduras custom NBT y optimización de chunks sin lag spikes.',
      stats: '20.0 TPS a 220 Jugadores · Chunks Async',
      features: ['Anti-Crash Packets', 'Hologramas sin entidades', 'Reset programado de minas'],
      file: 'BoxPvP-Setup-v2.1.zip',
    },
    {
      id: 'port-3',
      category: 'bot',
      title: 'GuildLink Discord & Minecraft Bridge',
      badge: 'Discord.js v14',
      desc: 'Bot con sistema de tickets en hilos privados, comando /link para verificar cuentas y sincronización de roles en tiempo real.',
      stats: '99.98% Uptime · Webhook Dispatcher',
      features: ['Embeds Lila Automatizados', 'Verificación UUID Mojang', 'Logs de sanciones en vivo'],
      file: 'GuildLinkBot-v1.0.jar',
    },
    {
      id: 'port-4',
      category: 'plugin',
      title: 'DungeonMaster RPG & Mythic Bosses',
      badge: 'Java 21 / Spigot',
      desc: 'Mazmorras instanciadas con inteligencia artificial personalizada para bosses y generadores de loot procedural.',
      stats: '60 FPS en animaciones GUI · 12 Instancias',
      features: ['IA de combate avanzada', 'Items con habilidades NBT', 'Recompensas escaladas'],
      file: 'DungeonMaster-v1.1.jar',
    },
    {
      id: 'port-5',
      category: 'setup',
      title: 'Custom Survival RPG & Misiones',
      badge: 'Paper 1.21.4',
      desc: 'Survival moderno con economía balanceada, protecciones sin lag de pistones y más de 120 misiones interactivas.',
      stats: '150+ Jugadores concurrentes · 0 Exploits',
      features: ['Terrenos anti-griefing', 'Misiones con lore custom', 'Mercado de subastas seguro'],
      file: 'SurvivalRPG-Setup.zip',
    },
    {
      id: 'port-6',
      category: 'bot',
      title: 'Synthetix Ticket & Verification Bot',
      badge: 'TypeScript / Workers',
      desc: 'Bot serverless de soporte para Discord con paneles de botones interactivos, transcripción en HTML y anti-spam.',
      stats: '< 15ms Latencia en comandos · Cloudflare R2',
      features: ['Transcripciones guardadas', 'Autocierre por inactividad', 'Categorización por departamento'],
      file: 'TicketBot-Build.zip',
    },
  ];

  const filteredPortfolio = portfolioItems.filter(
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

      {/* Floating Demo Persona Pill Banner */}
      <div className="w-full bg-[#120A21]/90 border-b border-[#261442] py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C084FC] animate-ping" />
            <span className="text-purple-300">
              {user ? (
                <>Sesión activa: <strong className="text-white">{user.global_name || user.username}</strong> ({user.role === 'admin' ? 'Administrador' : 'Cliente'})</>
              ) : (
                'Modo Invitado: Accede con Discord o explora con cuentas de prueba'
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuditModalOpen(true)}
              className="px-2.5 py-1 rounded bg-[#261442] hover:bg-[#3b1d68] text-purple-200 transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3 h-3 text-[#C084FC]" />
              Ver Webhooks Discord (#C084FC)
            </button>
            {user ? (
              <Link
                href="/dashboard"
                className="px-2.5 py-1 rounded bg-[#C084FC] text-black font-semibold hover:bg-purple-300 transition-colors"
              >
                Ir a mi Dashboard
              </Link>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-2.5 py-1 rounded bg-[#C084FC] text-black font-semibold hover:bg-purple-300 transition-colors"
              >
                Probar Cuentas Demo
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#9333EA]/15 via-[#C084FC]/10 to-transparent blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-5xl mx-auto text-center">
            {/* Animated Kicker Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#120A21] border border-[#C084FC]/40 text-[#C084FC] text-xs font-semibold mb-6 shadow-[0_0_15px_rgba(192,132,252,0.25)] animate-in fade-in zoom-in-95 duration-300">
              <Zap className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>Desarrollo de Alto Nivel para Minecraft & Discord</span>
            </div>

            {/* Impact Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 font-sans">
              Plugins NMS, Servidores sin Lag <br className="hidden sm:inline" />
              y Bots Autónomos en{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C084FC] via-[#D8B4FE] to-[#A855F7] glow-lilac-sm">
                Cyber Lilac
              </span>
            </h1>

            {/* Subheading */}
            <p className="max-w-3xl mx-auto text-base sm:text-lg text-purple-200/80 leading-relaxed mb-10">
              Creamos soluciones de software de grado profesional para networks de Minecraft y comunidades gaming.
              Gestiona tus pedidos en un portal transparente, supervisa el progreso en tiempo real y descarga tus builds compiladas (.jar / .zip) alojadas en Cloudflare R2.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
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
                {user ? 'Solicitar Nuevo Proyecto' : 'Iniciar Sesión / Solicitar Proyecto'}
              </button>

              <a
                href="#portafolio"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#120A21] hover:bg-[#1c1033] border border-[#261442] hover:border-[#C084FC]/50 text-purple-200 hover:text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Ver Portafolio de Builds
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </a>
            </div>

            {/* Quantified Rigor Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#120A21]/70 border border-[#261442] backdrop-blur-sm max-w-4xl mx-auto text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                  +50
                </div>
                <div className="text-xs text-purple-300/70 mt-1">Servidores Optimizados</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#C084FC] font-mono tabular-nums">
                  +100
                </div>
                <div className="text-xs text-purple-300/70 mt-1">Plugins en Java/Kotlin</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
                  20.0
                </div>
                <div className="text-xs text-purple-300/70 mt-1">TPS Estables Garantizados</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                  99.9%
                </div>
                <div className="text-xs text-purple-300/70 mt-1">Uptime de Bots & R2</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 CORE SERVICES */}
        <section id="servicios" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#261442]/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-[#C084FC] tracking-wider uppercase font-mono">
                Especialización Técnica
              </span>
              <h2 className="text-3xl font-bold text-white mt-2 mb-3">
                Servicios de Ingeniería para Comunidades Gamer
              </h2>
              <p className="text-sm text-purple-300/70">
                Soluciones a medida programadas desde cero, sin duplicados ni software genérico con fugas de memoria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Service 1 */}
              <div className="p-7 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/70 hover:shadow-[0_0_30px_rgba(192,132,252,0.25)] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] mb-5 group-hover:scale-105 transition-transform">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-mono text-purple-400 mb-1">01. Plugins Paper / Purpur</div>
                  <h3 className="text-xl font-bold text-white mb-3">Desarrollo de Plugins a Medida</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed mb-6">
                    Programación en Java 21 y Kotlin para Spigot, Paper y Purpur. Dominio de NMS (net.minecraft.server), manejo de paquetes, GUIs interactivas, bases de datos asíncronas SQLite/MySQL y prevención de dupes.
                  </p>
                </div>
                <div className="space-y-2 border-t border-[#261442] pt-4 text-xs text-purple-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                    <span>0.00ms de impacto en el hilo principal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                    <span>Integración con Vault y PlaceholderAPI</span>
                  </div>
                </div>
              </div>

              {/* Service 2 */}
              <div className="p-7 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/70 hover:shadow-[0_0_30px_rgba(192,132,252,0.25)] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] mb-5 group-hover:scale-105 transition-transform">
                    <Server className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-mono text-purple-400 mb-1">02. Modalidades & Optimización</div>
                  <h3 className="text-xl font-bold text-white mb-3">Setups Completos de Servidores</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed mb-6">
                    Configuraciones completas listas para producción: BoxPvP, Survival Custom RPG, Skyblock y Prisión OP. Ajuste fino de flags de Java Aikar, tick-rates de entidades y balance de economías masivas.
                  </p>
                </div>
                <div className="space-y-2 border-t border-[#261442] pt-4 text-xs text-purple-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                    <span>20.0 TPS a más de 200 jugadores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                    <span>Paquetes de mapas y minas optimizados</span>
                  </div>
                </div>
              </div>

              {/* Service 3 */}
              <div className="p-7 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/70 hover:shadow-[0_0_30px_rgba(192,132,252,0.25)] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] mb-5 group-hover:scale-105 transition-transform">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-mono text-purple-400 mb-1">03. Discord.js & Cloudflare Workers</div>
                  <h3 className="text-xl font-bold text-white mb-3">Bots de Discord Personalizados</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed mb-6">
                    Bots de última generación con slash commands, botones interactivos, sistemas de tickets con transcripciones HTML automáticas, verificación de rangos y sincronización bidireccional con tu servidor de Minecraft.
                  </p>
                </div>
                <div className="space-y-2 border-t border-[#261442] pt-4 text-xs text-purple-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                    <span>Embeds ricos con estética Cyber Lilac</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C084FC]" />
                    <span>Sincronización de rangos vía sockets</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PORTAFOLIO INTERACTIVO */}
        <section id="portafolio" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0614] border-t border-[#261442]/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-bold text-[#C084FC] tracking-wider uppercase font-mono">
                  Casos de Éxito & Entregas Reales
                </span>
                <h2 className="text-3xl font-bold text-white mt-1">
                  Portafolio Técnico de Synthetix
                </h2>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#120A21] border border-[#261442] overflow-x-auto">
                <button
                  onClick={() => setPortfolioFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                    portfolioFilter === 'all'
                      ? 'bg-[#C084FC] text-black font-semibold shadow-sm'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  Todos los Proyectos
                </button>
                <button
                  onClick={() => setPortfolioFilter('plugin')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                    portfolioFilter === 'plugin'
                      ? 'bg-[#C084FC] text-black font-semibold shadow-sm'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  Plugins Minecraft
                </button>
                <button
                  onClick={() => setPortfolioFilter('setup')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                    portfolioFilter === 'setup'
                      ? 'bg-[#C084FC] text-black font-semibold shadow-sm'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  Setups de Servidores
                </button>
                <button
                  onClick={() => setPortfolioFilter('bot')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                    portfolioFilter === 'bot'
                      ? 'bg-[#C084FC] text-black font-semibold shadow-sm'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  Bots de Discord
                </button>
              </div>
            </div>

            {/* Portfolio Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolio.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/50 hover:shadow-[0_0_25px_rgba(192,132,252,0.2)] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-semibold text-[#C084FC] bg-purple-950/60 px-2.5 py-1 rounded-md border border-[#C084FC]/30">
                        {item.badge}
                      </span>
                      <span className="text-[11px] text-purple-400/60 font-mono">
                        {item.file}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#C084FC] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-purple-200/70 leading-relaxed mb-4">
                      {item.desc}
                    </p>

                    <div className="p-2.5 rounded-xl bg-[#08050E] border border-[#261442] mb-4 text-[11px] font-mono text-purple-300 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-[#C084FC]" />
                      <span>{item.stats}</span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-purple-300/80 mb-6">
                      {item.features.map((feat, idx) => (
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
                    className="w-full py-2.5 px-4 rounded-xl bg-[#261442]/60 hover:bg-[#C084FC] hover:text-black text-purple-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Ver en Portal de Entregas
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CÓMO TRABAJAMOS (EL FLUJO WEB + DISCORD) */}
        <section id="flujo" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#261442]/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-[#C084FC] tracking-wider uppercase font-mono">
                Flujo Transparente
              </span>
              <h2 className="text-3xl font-bold text-white mt-2 mb-3">
                Cómo Trabajamos: De la Idea a la Entrega R2
              </h2>
              <p className="text-sm text-purple-300/70">
                Sin intermediarios ni desorden en chats privados. Todo el ciclo de vida de tu software centralizado y documentado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Inicias Sesión con Discord',
                  desc: 'Autenticación en 1 clic. Tu avatar y perfil quedan vinculados a tu cuenta de cliente de forma inmutable.',
                  icon: Sparkles,
                },
                {
                  step: '02',
                  title: 'Describes tus Requerimientos',
                  desc: 'Completa el formulario técnico con comandos, versiones y presupuestos. El equipo recibe un Rich Embed automático.',
                  icon: Terminal,
                },
                {
                  step: '03',
                  title: 'Progreso en Vivo 0-100%',
                  desc: 'Monitorea cada fase: Análisis, desarrollo NMS, pruebas de estrés y compilación con changelog en tiempo real.',
                  icon: Cpu,
                },
                {
                  step: '04',
                  title: 'Descarga Segura en R2',
                  desc: 'Recibe tus archivos .jar compilados o .zip de configuraciones directamente desde el portal con un solo clic.',
                  icon: Download,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-extrabold text-[#C084FC] font-mono">
                          {item.step}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC]">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-xs text-purple-200/70 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TESTIMONIOS / VOUCHES */}
        <section id="testimonios" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0614] border-t border-[#261442]/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-[#C084FC] tracking-wider uppercase font-mono">
                Vouches de Clientes Satisfechos
              </span>
              <h2 className="text-3xl font-bold text-white mt-2 mb-3">
                Confiado por Dueños de Servidores Líderes
              </h2>
              <p className="text-sm text-purple-300/70">
                Redes con cientos de jugadores confían sus núcleos a la ingeniería de Synthetix Studio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'PhoenixMC Network',
                  role: 'Owner · 450 Jugadores Concurrentes',
                  quote:
                    'El plugin de economía personalizado manejó más de 300,000 transacciones durante nuestra apertura sin una sola caída de TPS. El sistema de entregas con changelogs facilitó enormemente las actualizaciones.',
                  avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
                },
                {
                  name: 'Vortex BoxPvP',
                  role: 'Administrador General',
                  quote:
                    'Estábamos sufriendo crasheos por paquetes maliciosos y caídas de rendimiento en las minas. El setup de Purpur con protección NMS dejó el servidor en 20.0 TPS sólidos. 100% recomendados.',
                  avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
                },
                {
                  name: 'Aetheria Community',
                  role: 'Founder & Community Lead',
                  quote:
                    'El bot de sincronización entre Discord y Minecraft con sistema de tickets revolucionó nuestro soporte. Cada vez que suben una build a la plataforma, recibimos el aviso al instante.',
                  avatar: 'https://cdn.discordapp.com/embed/avatars/3.png',
                },
              ].map((vouch, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-purple-200/90 leading-relaxed mb-6 italic">
                      &ldquo;{vouch.quote}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-[#261442]">
                    <img
                      src={vouch.avatar}
                      alt={vouch.name}
                      className="w-9 h-9 rounded-full bg-purple-900 border border-[#C084FC]/30"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{vouch.name}</div>
                      <div className="text-[10px] text-purple-400 font-mono">{vouch.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL SECTION */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#261442]/60">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-[#120A21] to-[#08050E] border border-[#C084FC]/40 p-8 sm:p-12 text-center glow-lilac relative overflow-hidden">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              ¿Listo para Llevar tu Servidor al Siguiente Nivel?
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl mx-auto mb-8">
              Inicia sesión con tu cuenta de Discord o correo, envía tu requerimiento y nuestro equipo comenzará a diseñar tu plugin o setup hoy mismo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  if (user) {
                    setNewProjectModalOpen(true);
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white font-bold text-xs rounded-xl shadow-[0_0_25px_rgba(192,132,252,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Comenzar Solicitud de Proyecto
              </button>
              <button
                onClick={() => setAuditModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#120A21] hover:bg-[#1a0e30] border border-[#261442] text-purple-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#C084FC]" />
                Ver Notificaciones de Discord
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
