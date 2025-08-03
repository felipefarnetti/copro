export default function InfoList({ infos }) {
  if (!infos || infos.length === 0) return <div>Aucune info disponible.</div>;

  return (
    <ul className="mb-8">
      {infos.map((info, idx) => (
        <li key={idx} className="border-b py-2">{info}</li>
      ))}
    </ul>
  );
}
