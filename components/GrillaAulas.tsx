export default function GrillaAulas({ datos }) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {datos.map((fila, index) => (
        <div key={index} className={`p-4 rounded-xl border-l-4 ${fila[4] === 'SI' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-white shadow-sm'}`}>
          <p className="text-xs font-bold text-gray-500 uppercase">Aula {fila[0]}</p>
          <h3 className="font-bold text-lg">{fila[1] || 'DISPONIBLE'}</h3>
          <p className="text-sm text-gray-600">{fila[2] || 'Espacio libre'}</p>
          {fila[4] === 'SI' && <span className="text-[10px] text-red-600 font-bold">⚠️ FALLA TÉCNICA</span>}
        </div>
      ))}
    </div>
  );
}
