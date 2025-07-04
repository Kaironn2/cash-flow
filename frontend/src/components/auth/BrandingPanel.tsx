export function BrandingPanel() {
  const backgroundImageUrl = '/login-background.png'; 

  return (
    <div
      className="relative hidden h-full flex-col justify-between rounded-l-2xl p-12 text-white md:flex"
      style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black opacity-50 rounded-l-2xl" />

      <div className="relative z-10 text-lg font-medium">
        <span className="px-2 py-1"></span>
      </div>

      <div className="relative z-10">
        <h1 className="text-5xl font-light">
          Controle finanças<br />
          de maneira <span className="font-bold">Inteligente</span>
        </h1>
      </div>
    </div>
  );
}