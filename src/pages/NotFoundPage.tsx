import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

export function NotFoundPage() {
  return (
    <Card>
      <h1 className="text-2xl font-semibold text-white">Página não encontrada</h1>
      <p className="mt-2 text-zinc-400">A rota que você tentou acessar não existe.</p>
      <Link to="/dashboard" className="mt-4 inline-block"><Button>Voltar ao dashboard</Button></Link>
    </Card>
  )
}
