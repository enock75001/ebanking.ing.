
"use client";

import { useParams, useRouter } from "next/navigation";
import { useDoc, useMemoFirebase, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { 
  ShieldAlert, 
  ArrowLeft, 
  Download, 
  Printer, 
  Share2, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Info,
  Lock,
  Globe,
  Building2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function TransactionDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();

  // On suppose que l'ID de l'utilisateur et du compte sont connus ou extraits du contexte
  const userId = "bernard-berlin-leroy";
  const bankAccountId = "be12-3456-7890-1234";

  const transactionRef = useMemoFirebase(
    () => (id ? doc(db, "users", userId, "bankAccounts", bankAccountId, "transactions", id as string) : null),
    [db, id]
  );

  const { data: transaction, isLoading } = useDoc(transactionRef);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Clock className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Transaction non trouvée</h2>
        <Button onClick={() => router.back()} className="mt-4">Retour</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="font-bold hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-5 w-5" /> Retour à l'historique
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-2 font-bold"><Printer className="mr-2 h-4 w-4" /> Imprimer</Button>
          <Button variant="outline" className="rounded-xl border-2 font-bold"><Download className="mr-2 h-4 w-4" /> Reçu PDF</Button>
        </div>
      </header>

      {/* État de Blocage - Alerte de Sécurité */}
      <Card className="border-none shadow-2xl bg-destructive/5 ring-2 ring-destructive/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldAlert className="h-32 w-32 text-destructive" />
        </div>
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="bg-destructive text-white p-6 rounded-[2rem] shadow-xl shadow-destructive/20">
            <Lock className="h-12 w-12" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-black text-destructive uppercase tracking-tighter">Opération Suspendue</h2>
            <p className="text-lg font-bold text-destructive/80 leading-relaxed max-w-xl">
              Ce virement a été intercepté par les systèmes de surveillance <strong>ING SafeGuard</strong>. 
              Une vérification manuelle est requise pour libérer les fonds.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Détails Financiers */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="premium-card border-none overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-black text-[#333]">Détails du Virement</CardTitle>
                  <p className="text-sm font-mono text-muted-foreground mt-1">RÉF: #TRX-{transaction.id.slice(-8).toUpperCase()}</p>
                </div>
                <Image src="https://i.imgur.com/WWZ10oQ.png" alt="ING Logo" width={60} height={20} className="opacity-80" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Montant de l'ordre</p>
                    <p className="text-5xl font-black text-[#333] tracking-tighter">€ {transaction.amount.toLocaleString('fr-BE', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Type</p>
                    <p className="text-lg font-bold text-primary">Virement {transaction.transferType === 'instant' ? 'Instantané' : 'Standard'}</p>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Émetteur</p>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg"><Globe className="h-4 w-4 text-gray-500" /></div>
                        <p className="font-bold text-[#333]">Bernard Berlin Leroy</p>
                      </div>
                      <p className="text-xs font-mono text-gray-400 ml-11">BE12 3456 7890 1234</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Bénéficiaire</p>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg"><Building2 className="h-4 w-4 text-gray-500" /></div>
                        <p className="font-bold text-[#333]">{transaction.beneficiaryName}</p>
                      </div>
                      <p className="text-xs font-mono text-gray-400 ml-11">{transaction.beneficiaryIban}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Date & Heure d'émission</p>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg"><Clock className="h-4 w-4 text-gray-500" /></div>
                        <p className="font-bold text-[#333]">{new Date(transaction.transactionDate).toLocaleString('fr-BE')}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Communication</p>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg"><FileText className="h-4 w-4 text-gray-500" /></div>
                        <p className="font-bold text-[#333] italic">{transaction.description || 'Aucune'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/80 p-8 border-t border-gray-100">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Frais de service bancaire</p>
                    <p className="text-xl font-bold text-gray-600">€ {transaction.fee?.toLocaleString('fr-BE', { minimumFractionDigits: 2 }) || '0,00'}</p>
                  </div>
                  <div className="text-left md:text-right space-y-1">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Débit total effectif</p>
                    <p className="text-3xl font-black text-destructive">€ {transaction.totalAmount?.toLocaleString('fr-BE', { minimumFractionDigits: 2 }) || transaction.amount.toLocaleString('fr-BE', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit de Sécurité */}
        <div className="space-y-8">
          <Card className="premium-card border-none bg-gradient-to-b from-white to-gray-50/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg font-bold">Rapport de Sécurité</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#333]">Identité vérifiée</p>
                    <p className="text-[10px] text-muted-foreground">Authentification forte validée via ING ID.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#333]">Origine des fonds</p>
                    <p className="text-[10px] text-muted-foreground">Solde suffisant et source identifiée.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="mt-1 w-2 h-2 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-destructive">Alerte SafeGuard #402</p>
                    <p className="text-[10px] text-muted-foreground">Destination identifiée comme sensible. Blocage préventif activé.</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-100" />

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                <Info className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-[10px] font-bold text-primary leading-tight">
                  Cette transaction est temporairement mise en réserve sous le protocole de conformité Européen SEPA 2024.
                </p>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-[#333] hover:bg-black text-white font-bold h-12 rounded-xl text-xs uppercase tracking-widest">
                  Contester le blocage
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-gray-50 rounded-full">
              <Share2 className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-xs font-bold text-[#333]">Besoin de partager?</p>
            <p className="text-[10px] text-muted-foreground">Générez un lien sécurisé pour transmettre ce relevé à votre conseiller.</p>
            <Button variant="link" className="text-primary font-black text-xs h-auto p-0">Générer un lien</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
