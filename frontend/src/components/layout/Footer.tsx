export default function Footer() {
  return (
    <footer className="border-t border-[#dbc1b9] py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-slate-500 md:flex-row md:justify-between">
        <p>© 2026 App BiT</p>

        <div className="flex gap-6">
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Contacto</a>
        </div>
      </div>
    </footer>
  );
}