"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, RotateCcw, Info, FileStack, Sparkles, ChevronRight } from "lucide-react";

export default function StatementsPage() {
  const [account, setAccount] = useState("orange-everyday");
  const [period, setPeriod] = useState("this-year");

  const balance = 3180000.00;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <header className="animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4 mb-3">
          <div className="bg-primary/10 p-3 rounded-2xl shadow-inner">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#333] font-headline">Relevés bancaires</h1>
        </div>
        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
          Consultez l'historique de vos opérations et générez vos extraits de compte officiels en quelques clics.
        </p>
      </header>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="premium-card overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 pb-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-bold">Critères de recherche</CardTitle>
            </div>
            <CardDescription className="text-base font-medium">Sélectionnez le compte et la période souhaitée.</CardDescription>
          </CardHeader>
          <CardContent className="pt-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label htmlFor="account" className="text-base font-bold text-[#333] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                  Sélectionner un compte
                </Label>
                <Select value={account} onValueChange={setAccount}>
                  <SelectTrigger id="account" className="h-16 border-2 rounded-2xl bg-white shadow-sm focus:ring-primary/20 text-left">
                    <SelectValue placeholder="Choisir un compte" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="orange-everyday" className="py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-bold text-lg text-[#333]">ING Compte à vue</span>
                        <span className="text-sm font-mono text-muted-foreground italic">BE12 3456 7890 1234 • € {balance.toLocaleString('fr-BE', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="period" className="text-base font-bold text-[#333] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                  Choisir une période
                </Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger id="period" className="h-16 border-2 rounded-2xl bg-white shadow-sm focus:ring-primary/20 text-left">
                    <SelectValue placeholder="Choisir une période" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="interim" className="py-3">Extrait provisoire (Opérations récentes)</SelectItem>
                    <SelectItem value="this-year" className="py-3 font-bold text-primary">Année civile en cours</SelectItem>
                    <SelectItem value="last-year" className="py-3">Année civile précédente</SelectItem>
                    <SelectItem value="specific" className="py-3">Période spécifique</SelectItem>
                    <SelectItem value="all" className="py-3">Tous les relevés (7 dernières années)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4 animate-pulse">
              <Info className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <p className="text-sm text-primary font-semibold leading-relaxed">
                Vos relevés sont mis à disposition au format PDF. Pensez à configurer vos <a href="#" className="underline font-black hover:text-primary/80">préférences d'envoi</a> pour passer au 100% digital.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <Button className="w-full sm:w-auto min-w-[200px] h-14 bg-[#3b0051] hover:bg-[#2a003a] text-white text-lg font-black rounded-2xl shadow-lg transition-all active:scale-[0.98]">
                Rechercher
              </Button>
              <Button variant="link" className="text-[#0066cc] hover:text-[#004d99] hover:underline p-0 font-bold text-base flex items-center gap-2 group">
                <RotateCcw className="h-5 w-5 group-hover:rotate-[-45deg] transition-transform" />
                Effacer les filtres
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <div className="premium-card p-6 rounded-3xl flex items-center gap-4 bg-white">
          <div className="p-3 bg-green-50 rounded-2xl">
            <FileStack className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Disponibles</p>
            <p className="text-xl font-black text-gray-800">124 Relevés</p>
          </div>
        </div>
        <div className="premium-card p-6 rounded-3xl flex items-center gap-4 bg-white">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Dernier envoi</p>
            <p className="text-xl font-black text-gray-800">15 Mars 2024</p>
          </div>
        </div>
        <div className="premium-card p-6 rounded-3xl flex items-center justify-between bg-white group cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-2xl">
              <Search className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recherche</p>
              <p className="text-xl font-black text-gray-800">Avancée</p>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}
