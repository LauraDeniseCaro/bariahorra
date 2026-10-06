'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCargando, setAdminCargando] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSubTab, setAdminSubTab] = useState('ofertas');

  const [ofertas, setOfertas] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const [nuevoComercioNombre, setNuevoComercioNombre] = useState('');
  const [nuevoProdNombre, setNuevoProdNombre] = useState('');
  const [nuevoProdMarca, setNuevoProdMarca] = useState('');
  const [nuevoProdCategoria, setNuevoProdCategoria] = useState('Súper');
  const [creandoMaestro, setCreandoMaestro] = useState(false);

  const cargarOfertas = async () => {
    try {
      const { data, error } = await supabase
        .from('ofertas')
        .select(`
          id, precio, estado, vencimiento, foto_url, votos_positivos, votos_negativos, creado_en,
          productos ( id, nombre, marca, categoria ),
          comercios ( id, nombre )
        `)
        .order('creado_en', { ascending: false });

      if (error) throw error;
      setOfertas(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarDatosMaestros = async () => {
    try {
      const [resComercios, resProductos] = await Promise.all([
        supabase.from('comercios').select('*').order('nombre'),
        supabase.from('productos').select('*').order('nombre'),
      ]);
      if (resComercios.data) setComercios(resComercios.data);
      if (resProductos.data) setProductos(resProductos.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminUser(session?.user ?? null);
      if (session?.user) {
        cargarOfertas();
        cargarDatosMaestros();
      } else {
        setCargandoDatos(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminUser(session?.user ?? null);
      if (session?.user) {
        cargarOfertas();
        cargarDatosMaestros();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminCargando(true);
    setAdminError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      if (error) throw error;
      setAdminPassword('');
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAdminCargando(false);
    }
  };

  const handleCambiarEstadoOferta = async (ofertaId, nuevoEstado) => {
    try {
      const updateData = { estado: nuevoEstado };
      if (nuevoEstado === 'activa') updateData.votos_negativos = 0;
      const { error } = await supabase.from('ofertas').update(updateData).eq('id', ofertaId);
      if (error) throw error;
      setOfertas((prev) => prev.map((o) => (o.id === ofertaId ? { ...o, ...updateData } : o)));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEliminarOferta = async (ofertaId) => {
    if (!confirm('¿Eliminar esta oferta permanentemente?')) return;
    try {
      const { error } = await supabase.from('ofertas').delete().eq('id', ofertaId);
      if (error) throw error;
      setOfertas((prev) => prev.filter((o) => o.id !== ofertaId));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleCrearComercio = async (e) => {
    e.preventDefault();
    setCreandoMaestro(true);
    try {
      const { error } = await supabase.from('comercios').insert([{ nombre: nuevoComercioNombre }]);
      if (error) throw error;
      setNuevoComercioNombre('');
      cargarDatosMaestros();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreandoMaestro(false);
    }
  };

  const handleEditarComercio = async (id, nombreActual) => {
    const nuevo = prompt('Nuevo nombre:', nombreActual);
    if (!nuevo || nuevo === nombreActual) return;
    try {
      const { error } = await supabase.from('comercios').update({ nombre: nuevo }).eq('id', id);
      if (error) throw error;
      cargarDatosMaestros();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEliminarComercio = async (id) => {
    if (!confirm('¿Borrar comercio?')) return;
    try {
      const { error } = await supabase.from('comercios').delete().eq('id', id);
      if (error) throw error;
      cargarDatosMaestros();
    } catch (err) {
      alert('No se puede borrar si tiene ofertas cargadas.');
    }
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    setCreandoMaestro(true);
    try {
      const { error } = await supabase.from('productos').insert([{
        nombre: nuevoProdNombre,
        marca: nuevoProdMarca,
        categoria: nuevoProdCategoria,
      }]);
      if (error) throw error;
      setNuevoProdNombre('');
      setNuevoProdMarca('');
      cargarDatosMaestros();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreandoMaestro(false);
    }
  };

  const handleEditarProducto = async (id, nombreActual) => {
    const nuevo = prompt('Editar nombre:', nombreActual);
    if (!nuevo || nuevo === nombreActual) return;
    try {
      const { error } = await supabase.from('productos').update({ nombre: nuevo }).eq('id', id);
      if (error) throw error;
      cargarDatosMaestros();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEliminarProducto = async (id) => {
    if (!confirm('¿Borrar producto?')) return;
    try {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (error) throw error;
      cargarDatosMaestros();
    } catch (err) {
      alert('No se puede borrar si tiene ofertas cargadas.');
    }
  };

  return (
    <main className="p-4 md:p-8 flex-1 max-w-5xl mx-auto w-full">
      {!adminUser ? (
        <div className="max-w-md mx-auto my-12 bg-[#131d2e] p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-3xl">🔐</span>
            <h2 className="text-xl font-bold text-white mt-2">Panel Privado Bariahorra</h2>
            <p className="text-xs text-slate-400">Ingreso exclusivo para administración</p>
          </div>
          {adminError && (
            <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
              {adminError}
            </div>
          )}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              className="w-full bg-[#0a0f18] text-sm text-white rounded-xl px-4 py-3 border border-slate-700 outline-none"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              className="w-full bg-[#0a0f18] text-sm text-white rounded-xl px-4 py-3 border border-slate-700 outline-none"
            />
            <button
              type="submit"
              disabled={adminCargando}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition"
            >
              {adminCargando ? 'Accediendo...' : 'Ingresar'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-400">
              ← Volver al sitio público
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header del Dashboard */}
          <div className="bg-[#131d2e] p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Panel de Control
              </span>
              <h2 className="text-xl font-bold text-white">Administración General</h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/cargar"
                className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl transition"
              >
                ⭐ Cargar Catálogo Oficial
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-xs bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 px-3 py-2 rounded-xl border border-slate-700 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Tarjetas de Métricas Rápidas */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={() => setAdminSubTab('ofertas')}
              className={`p-4 rounded-2xl border text-left transition ${
                adminSubTab === 'ofertas'
                  ? 'bg-emerald-500/10 border-emerald-500/50'
                  : 'bg-[#131d2e] border-slate-800 hover:border-slate-700'
              }`}
            >
              <p className="text-xs text-slate-400">Ofertas Activas</p>
              <p className="text-2xl font-black text-white mt-1">{ofertas.length}</p>
            </button>
            <button
              onClick={() => setAdminSubTab('comercios')}
              className={`p-4 rounded-2xl border text-left transition ${
                adminSubTab === 'comercios'
                  ? 'bg-sky-500/10 border-sky-500/50'
                  : 'bg-[#131d2e] border-slate-800 hover:border-slate-700'
              }`}
            >
              <p className="text-xs text-slate-400">Supermercados</p>
              <p className="text-2xl font-black text-white mt-1">{comercios.length}</p>
            </button>
            <button
              onClick={() => setAdminSubTab('productos')}
              className={`p-4 rounded-2xl border text-left transition ${
                adminSubTab === 'productos'
                  ? 'bg-amber-500/10 border-amber-500/50'
                  : 'bg-[#131d2e] border-slate-800 hover:border-slate-700'
              }`}
            >
              <p className="text-xs text-slate-400">Productos</p>
              <p className="text-2xl font-black text-white mt-1">{productos.length}</p>
            </button>
          </div>

          {/* Pestaña: Ofertas */}
          {adminSubTab === 'ofertas' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300">Moderación de Precios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ofertas.map((item) => (
                  <div key={item.id} className="bg-[#131d2e] p-4 rounded-2xl border border-slate-800 flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <p className="font-bold text-white text-sm">{item.productos?.nombre}</p>
                      <p className="text-xs text-slate-400">{item.comercios?.nombre} • ${item.precio?.toLocaleString('es-AR')}</p>
                      <div className="flex gap-2 items-center pt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.estado === 'en_revision' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {item.estado.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-500">👍 {item.votos_positivos} | 👎 {item.votos_negativos}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs">
                      {item.estado === 'en_revision' ? (
                        <button onClick={() => handleCambiarEstadoOferta(item.id, 'activa')} className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg">Reactivar</button>
                      ) : (
                        <button onClick={() => handleCambiarEstadoOferta(item.id, 'en_revision')} className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg">Pausar</button>
                      )}
                      <button onClick={() => handleEliminarOferta(item.id)} className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-lg">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pestaña: Comercios */}
          {adminSubTab === 'comercios' && (
            <div className="bg-[#131d2e] p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-300">Gestión de Comercios</h3>
              <form onSubmit={handleCrearComercio} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nuevo comercio (Ej: Diarco)..."
                  value={nuevoComercioNombre}
                  onChange={(e) => setNuevoComercioNombre(e.target.value)}
                  required
                  className="flex-1 bg-[#0a0f18] text-sm text-white rounded-xl px-4 py-2.5 border border-slate-700 outline-none"
                />
                <button type="submit" disabled={creandoMaestro} className="bg-emerald-500 text-slate-950 font-bold px-5 rounded-xl text-sm">
                  Agregar
                </button>
              </form>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                {comercios.map((com) => (
                  <div key={com.id} className="flex justify-between items-center bg-[#0a0f18] p-3 rounded-xl border border-slate-800">
                    <span className="text-sm text-slate-200 font-medium">{com.nombre}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditarComercio(com.id, com.nombre)} className="p-1 hover:text-sky-400">✏️</button>
                      <button onClick={() => handleEliminarComercio(com.id)} className="p-1 hover:text-rose-400">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pestaña: Productos */}
          {adminSubTab === 'productos' && (
            <div className="bg-[#131d2e] p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-300">Gestión de Productos</h3>
              <form onSubmit={handleCrearProducto} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nombre..."
                  value={nuevoProdNombre}
                  onChange={(e) => setNuevoProdNombre(e.target.value)}
                  required
                  className="bg-[#0a0f18] text-sm text-white rounded-xl px-4 py-2.5 border border-slate-700 outline-none"
                />
                <input
                  type="text"
                  placeholder="Marca (opcional)..."
                  value={nuevoProdMarca}
                  onChange={(e) => setNuevoProdMarca(e.target.value)}
                  className="bg-[#0a0f18] text-sm text-white rounded-xl px-4 py-2.5 border border-slate-700 outline-none"
                />
                <div className="flex gap-2">
                  <select
                    value={nuevoProdCategoria}
                    onChange={(e) => setNuevoProdCategoria(e.target.value)}
                    className="flex-1 bg-[#0a0f18] text-sm text-white rounded-xl px-3 py-2.5 border border-slate-700 outline-none"
                  >
                    <option value="Súper">Súper</option>
                    <option value="Carnicería">Carnicería</option>
                    <option value="Verdulería">Verdulería</option>
                    <option value="Lácteos">Lácteos</option>
                  </select>
                  <button type="submit" disabled={creandoMaestro} className="bg-emerald-500 text-slate-950 font-bold px-4 rounded-xl text-sm">
                    +
                  </button>
                </div>
              </form>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                {productos.map((prod) => (
                  <div key={prod.id} className="flex justify-between items-center bg-[#0a0f18] p-3 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-sm text-slate-200 font-bold">{prod.nombre}</p>
                      <p className="text-[11px] text-slate-500">{prod.marca || 'S/M'} • {prod.categoria}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditarProducto(prod.id, prod.nombre)} className="p-1 hover:text-sky-400">✏️</button>
                      <button onClick={() => handleEliminarProducto(prod.id)} className="p-1 hover:text-rose-400">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}