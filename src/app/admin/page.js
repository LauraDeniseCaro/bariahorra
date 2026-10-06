'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCargando, setAdminCargando] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSubTab, setAdminSubTab] = useState('ofertas'); // 'ofertas', 'comercios', 'productos'

  // Datos
  const [ofertas, setOfertas] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Estados de formularios de creación
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
      console.error('Error al cargar ofertas:', err.message);
    }
  };

  const cargarDatosMaestros = async () => {
    try {
      const [resComercios, resProductos] = await Promise.all([
        supabase.from('comercios').select('*').order('nombre'),
        supabase.from('productos').select('*').order('nombre')
      ]);
      if (resComercios.data) setComercios(resComercios.data);
      if (resProductos.data) setProductos(resProductos.data);
    } catch (err) {
      console.error('Error al cargar datos maestros:', err.message);
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

  // --- MODERACIÓN DE OFERTAS ---
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
    if (!confirm('¿Eliminar oferta permanentemente?')) return;
    try {
      const { error } = await supabase.from('ofertas').delete().eq('id', ofertaId);
      if (error) throw error;
      setOfertas((prev) => prev.filter((o) => o.id !== ofertaId));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // --- GESTIÓN DE COMERCIOS ---
  const handleCrearComercio = async (e) => {
    e.preventDefault();
    setCreandoMaestro(true);
    try {
      const { error } = await supabase.from('comercios').insert([{ nombre: nuevoComercioNombre }]);
      if (error) throw error;
      setNuevoComercioNombre('');
      cargarDatosMaestros();
    } catch (err) {
      alert('Error al crear comercio: ' + err.message);
    } finally {
      setCreandoMaestro(false);
    }
  };

  const handleEditarComercio = async (id, nombreActual) => {
    const nuevoNombre = prompt('Editar nombre del comercio:', nombreActual);
    if (!nuevoNombre || nuevoNombre === nombreActual) return;
    try {
      const { error } = await supabase.from('comercios').update({ nombre: nuevoNombre }).eq('id', id);
      if (error) throw error;
      cargarDatosMaestros();
    } catch (err) {
      alert('Error al editar: ' + err.message);
    }
  };

  const handleEliminarComercio = async (id) => {
    if (!confirm('¿Borrar este comercio? (Fallará si tiene ofertas vinculadas)')) return;
    try {
      const { error } = await supabase.from('comercios').delete().eq('id', id);
      if (error) throw error;
      cargarDatosMaestros();
    } catch (err) {
      alert('No se puede borrar si tiene ofertas vinculadas.');
    }
  };

  // --- GESTIÓN DE PRODUCTOS ---
  const handleCrearProducto = async (e) => {
    e.preventDefault();
    setCreandoMaestro(true);
    try {
      const { error } = await supabase.from('productos').insert([{
        nombre: nuevoProdNombre,
        marca: nuevoProdMarca,
        categoria: nuevoProdCategoria
      }]);
      if (error) throw error;
      setNuevoProdNombre('');
      setNuevoProdMarca('');
      cargarDatosMaestros();
    } catch (err) {
      alert('Error al crear producto: ' + err.message);
    } finally {
      setCreandoMaestro(false);
    }
  };

  const handleEditarProducto = async (id, nombreActual) => {
    const nuevoNombre = prompt('Editar nombre del producto:', nombreActual);
    if (!nuevoNombre || nuevoNombre === nombreActual) return;
    try {
      const { error } = await supabase.from('productos').update({ nombre: nuevoNombre }).eq('id', id);
      if (error) throw error;
      cargarDatosMaestros();
    } catch (err) {
      alert('Error al editar: ' + err.message);
    }
  };

  const handleEliminarProducto = async (id) => {
    if (!confirm('¿Borrar este producto? (Fallará si tiene ofertas vinculadas)')) return;
    try {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (error) throw error;
      cargarDatosMaestros();
    } catch (err) {
      alert('No se puede borrar si tiene ofertas vinculadas.');
    }
  };

  return (
    <main className="p-4 flex-1">
      {!adminUser ? (
        <form onSubmit={handleAdminLogin} className="bg-[#182133] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Acceso Administrador</h2>
            <p className="text-xs text-slate-400 mt-1">Ingresá con tu cuenta para gestionar la plataforma</p>
          </div>
          {adminError && <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">{adminError}</div>}
          <input
            type="email"
            placeholder="Email de administrador"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
            className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 outline-none focus:border-sky-400 transition"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
            className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 outline-none focus:border-sky-400 transition"
          />
          <button
            type="submit"
            disabled={adminCargando}
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {adminCargando ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Barra de sesión */}
          <div className="bg-[#182133] p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <p className="text-xs text-slate-200 font-semibold">{adminUser.email}</p>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs text-rose-400 hover:text-rose-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* Subpestañas */}
          <div className="flex gap-2">
            <button
              onClick={() => setAdminSubTab('ofertas')}
              className={`flex-1 py-2 text-xs rounded-lg font-bold border transition ${
                adminSubTab === 'ofertas'
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                  : 'bg-[#182133] text-slate-400 border-slate-800'
              }`}
            >
              Ofertas ({ofertas.length})
            </button>
            <button
              onClick={() => setAdminSubTab('comercios')}
              className={`flex-1 py-2 text-xs rounded-lg font-bold border transition ${
                adminSubTab === 'comercios'
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                  : 'bg-[#182133] text-slate-400 border-slate-800'
              }`}
            >
              Comercios ({comercios.length})
            </button>
            <button
              onClick={() => setAdminSubTab('productos')}
              className={`flex-1 py-2 text-xs rounded-lg font-bold border transition ${
                adminSubTab === 'productos'
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                  : 'bg-[#182133] text-slate-400 border-slate-800'
              }`}
            >
              Productos ({productos.length})
            </button>
          </div>

          {/* Subpanel 1: Moderar Ofertas */}
          {adminSubTab === 'ofertas' && (
            <div className="space-y-3">
              {cargandoDatos ? (
                <p className="text-center py-8 text-xs text-slate-400">Cargando...</p>
              ) : ofertas.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">No hay ofertas cargadas.</p>
              ) : (
                ofertas.map((item) => (
                  <div key={item.id} className="bg-[#182133] p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.productos?.nombre}</h4>
                        <p className="text-xs text-slate-400">{item.comercios?.nombre} • ${item.precio?.toLocaleString('es-AR')}</p>
                        <span className={`text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full font-semibold ${
                          item.estado === 'en_revision'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {item.estado.toUpperCase()}
                        </span>
                      </div>
                      {item.foto_url && (
                        <a href={item.foto_url} target="_blank" rel="noreferrer">
                          <img src={`${item.foto_url}?tr=w-80,h-80`} alt="Foto" className="w-10 h-10 object-cover rounded-lg border border-slate-700" />
                        </a>
                      )}
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 flex gap-2 text-xs">
                      {item.estado === 'en_revision' ? (
                        <button
                          onClick={() => handleCambiarEstadoOferta(item.id, 'activa')}
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30"
                        >
                          ✓ Reactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCambiarEstadoOferta(item.id, 'en_revision')}
                          className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30"
                        >
                          ⏸ Pausar
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminarOferta(item.id)}
                        className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/30"
                      >
                        ✕ Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Subpanel 2: Gestión de Comercios */}
          {adminSubTab === 'comercios' && (
            <div className="bg-[#182133] p-5 rounded-2xl border border-slate-800 space-y-4">
              <form onSubmit={handleCrearComercio} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nuevo Comercio..."
                  value={nuevoComercioNombre}
                  onChange={(e) => setNuevoComercioNombre(e.target.value)}
                  required
                  className="flex-1 bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2 border border-slate-700/80 outline-none"
                />
                <button
                  type="submit"
                  disabled={creandoMaestro}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 rounded-xl text-sm"
                >
                  +
                </button>
              </form>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {comercios.map((com) => (
                  <div key={com.id} className="flex justify-between items-center bg-[#1b2333] p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-sm text-slate-200">{com.nombre}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleEditarComercio(com.id, com.nombre)} className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg hover:bg-sky-500/20">✏️</button>
                      <button onClick={() => handleEliminarComercio(com.id)} className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subpanel 3: Gestión de Productos */}
          {adminSubTab === 'productos' && (
            <div className="bg-[#182133] p-5 rounded-2xl border border-slate-800 space-y-4">
              <form onSubmit={handleCrearProducto} className="space-y-2 border-b border-slate-700 pb-4">
                <input
                  type="text"
                  placeholder="Nombre del producto (Ej: Leche Entera)"
                  value={nuevoProdNombre}
                  onChange={(e) => setNuevoProdNombre(e.target.value)}
                  required
                  className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2 border border-slate-700/80 outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Marca (Opcional)"
                    value={nuevoProdMarca}
                    onChange={(e) => setNuevoProdMarca(e.target.value)}
                    className="w-1/2 bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2 border border-slate-700/80 outline-none"
                  />
                  <select
                    value={nuevoProdCategoria}
                    onChange={(e) => setNuevoProdCategoria(e.target.value)}
                    className="w-1/2 bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2 border border-slate-700/80 outline-none"
                  >
                    <option value="Súper">Súper</option>
                    <option value="Carnicería">Carnicería</option>
                    <option value="Verdulería">Verdulería</option>
                    <option value="Lácteos">Lácteos</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={creandoMaestro}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-sm"
                >
                  Agregar Producto
                </button>
              </form>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {productos.map((prod) => (
                  <div key={prod.id} className="flex justify-between items-center bg-[#1b2333] p-2.5 rounded-xl border border-slate-700/50">
                    <div>
                      <p className="text-sm text-slate-200 font-bold">{prod.nombre}</p>
                      <p className="text-[10px] text-slate-400">{prod.marca || 'Sin marca'} • {prod.categoria}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleEditarProducto(prod.id, prod.nombre)} className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg hover:bg-sky-500/20">✏️</button>
                      <button onClick={() => handleEliminarProducto(prod.id)} className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20">🗑️</button>
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