import { Layout } from "./components/Layout";

function App() {
  return (
    // Llamamos al Layout que ya unifica la cabecera y la barra inferior móvil
    <Layout>
      {/* Todo lo que escribas aquí adentro actuará como la vista "Home" o pantalla actual */}
      <section className="py-6 text-center">
        <h1 className="text-xl font-bold text-gray-800">¡Vista de Inicio del MVP!</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Este espacio del medio es donde Elías y tú cargarán los componentes dinámicos de las tareas de App BiT.
        </p>
        
        {/* Un bloque de relleno solo para probar que el scroll funcione bien y no pise las barras */}
        <div className="mt-8 space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-left">
              <h2 className="font-semibold text-gray-700">Tarjeta de prueba #{item}</h2>
              <p className="text-xs text-gray-400 mt-1">Simulación de contenido del flujo de la aplicación.</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default App;
