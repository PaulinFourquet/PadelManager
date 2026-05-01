import { ListChecks, Trophy, Wrench, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/ui/components/PageHeader';
import { AdminPlayers } from '@/ui/pages/admin/AdminPlayers';
import { AdminTournaments } from '@/ui/pages/admin/AdminTournaments';
import { QuickMatchAdmin } from '@/ui/pages/admin/QuickMatchAdmin';

export const AdminPage = () => (
  <div className="space-y-6 animate-fade-in">
    <PageHeader
      eyebrow="Outils"
      title="Admin & base de donnees"
      description="Gere les joueurs, les tournois et lance des matchs de test directement en 3D."
    />

    <Tabs defaultValue="players" className="space-y-5">
      <Card className="p-2 shadow-card">
        <CardContent className="p-0">
          <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
            <TabsTrigger value="players" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <ListChecks className="h-4 w-4" /> Joueurs
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Trophy className="h-4 w-4" /> Tournois
            </TabsTrigger>
            <TabsTrigger value="quick" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Zap className="h-4 w-4" /> Test rapide
            </TabsTrigger>
          </TabsList>
        </CardContent>
      </Card>

      <TabsContent value="players" className="m-0">
        <AdminPlayers />
      </TabsContent>
      <TabsContent value="tournaments" className="m-0">
        <AdminTournaments />
      </TabsContent>
      <TabsContent value="quick" className="m-0">
        <QuickMatchAdmin />
      </TabsContent>
    </Tabs>

    <Card className="border-dashed border-border/60 bg-card/40 p-4 shadow-none">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Wrench className="h-4 w-4" />
        <p>Les modifs de la base sont persistees dans le localStorage du navigateur (cle padel-manager.*).</p>
      </div>
    </Card>
  </div>
);
