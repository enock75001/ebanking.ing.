"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Eye, 
  Star, 
  Edit2, 
  Trash2, 
  Sparkles, 
  Wallet,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function ManageAccountsPage() {
  const accounts = [
    { id: "1", name: "ING Compte à vue Private", number: "BE12 3456 ... 1234", isPrimary: true, isVisible: true },
    { id: "2", name: "ING Lion Deposit (Épargne)", number: "BE98 7654 ... 9876", isPrimary: false, isVisible: true },
    { id: "3", name: "Portfolio Investissement Gold", number: "BE45 1234 ... 9012", isPrimary: false, isVisible: false },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <header className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight font-headline text-[#333]">Gérer les comptes</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Personnalisez l'affichage et les préférences de vos comptes Bernard Berlin Leroy.
        </p>
      </header>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {accounts.map((account) => (
          <Card key={account.id} className="premium-card overflow-hidden border-none ring-1 ring-black/5">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 pb-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${account.isPrimary ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-bold">{account.name}</CardTitle>
                    {account.isPrimary && <Badge variant="secondary" className="bg-primary text-white font-bold text-[10px] uppercase">Principal</Badge>}
                  </div>
                  <CardDescription className="font-mono">{account.number}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-xl border-2 hover:bg-primary/5 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="rounded-xl border-2 text-destructive hover:bg-destructive/5"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-between p-6 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:ring-primary/20 group">
                  <div className="space-y-1">
                    <Label className="font-bold text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                      <Eye className="h-5 w-5" /> Visible sur le Dashbaord
                    </Label>
                    <p className="text-sm text-muted-foreground font-medium">Afficher le solde sur l'accueil.</p>
                  </div>
                  <Switch defaultChecked={account.isVisible} />
                </div>

                <div className="flex items-center justify-between p-6 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:ring-primary/20 group">
                  <div className="space-y-1">
                    <Label className="font-bold text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                      <Star className="h-5 w-5" /> Compte favori
                    </Label>
                    <p className="text-sm text-muted-foreground font-medium">Prioriser pour les virements.</p>
                  </div>
                  <Switch defaultChecked={account.isPrimary} />
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-2">
                    <Label className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Nom personnalisé du compte</Label>
                    <div className="relative">
                        <Input defaultValue={account.name} className="h-12 text-base rounded-xl border-2 pr-10" />
                        <Sparkles className="absolute right-3 top-3.5 h-5 w-5 text-primary/30" />
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="premium-card p-10 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#333] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Lock className="h-8 w-8 text-primary" />
                        <h2 className="text-3xl font-black">Sécurité des comptes</h2>
                    </div>
                    <p className="text-lg text-white/60 font-medium max-w-xl">
                        Vos comptes sont protégés par le système ING Safeguard. Gérez vos limites de retrait et de paiement en un seul endroit.
                    </p>
                </div>
                <Button className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.05]">
                    Gérer les limites
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: any }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest border border-transparent inline-flex items-center ${className}`}>
            {children}
        </span>
    );
}
