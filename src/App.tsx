import { Button } from '@/ds';

export default function App() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="text-center max-w-xl">
        <h1 className="nx-h1 mb-4">Nexti Studio</h1>
        <p className="nx-lead mb-8">
          Edite este arquivo para começar. O preview atualiza automaticamente.
        </p>
        <div className="flex gap-3 justify-center">
          <Button>Começar</Button>
          <Button variant="outline">Saiba mais</Button>
        </div>
      </div>
    </div>
  );
}
