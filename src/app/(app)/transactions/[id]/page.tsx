"use client";

import { useParams, useRouter } from "next/navigation";
import { useDoc, useMemoFirebase, useFirestore, useUser, deleteDocumentNonBlocking } from "@/firebase";
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
  AlertCircle,
  Trash2,
  FileDown,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function TransactionDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const userId = user?.uid;
  const bankAccountId = "be12-3456-7890-1234";

  const transactionRef = useMemoFirebase(
    () => (id && userId ? doc(db, "users", userId, "bankAccounts", bankAccountId, "transactions", id as string) : null),
    [db, id, userId]
  );

  const { data: transaction, isLoading } = useDoc(transactionRef);

  const handleDelete = () => {
    if (!transactionRef) return;
    setIsDeleting(true);
    deleteDocumentNonBlocking(transactionRef);
    toast({
      title: "Transaction supprimée",
      description: "L'opération a été retirée de votre historique.",
    });
    router.replace("/dashboard");
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      toast({
        title: "Reçu généré",
        description: "Le reçu officiel (format PDF) a été téléchargé.",
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Clock className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-500">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Transaction non trouvée</h2>
        <p className="text-muted-foreground mt-2">Cette opération n'existe pas ou a été supprimée.</p>
        <Button onClick={() => router.back()} className="mt-6 rounded-xl font-bold px-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au tableau de bord
        </Button>
      </div>
    );
  }

  const isFailed = transaction.status === "Failed";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="font-bold hover:text-primary transition-all w-fit">
          <ArrowLeft className="mr-2 h-5 w-5" /> Retour à l'historique
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="rounded-xl border-2 font-bold h-11 px-6 shadow-sm hover:shadow-md transition-all"
          >
            <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? "Suppression..." : "Supprimer l'ordre"}
          </Button>
          <Button 
            variant="default" 
            onClick={handleDownload}
            disabled={isDownloading}
            className="rounded-xl font-bold h-11 px-6 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]"
          >
            <FileDown className="mr-2 h-4 w-4" /> {isDownloading ? "Génération..." : "Télécharger Reçu PDF"}
          </Button>
        </div>
      </header>

      {/* Alerte de Sécurité si Suspendu */}
      {isFailed && (
        <Card className="border-none shadow-2xl bg-destructive/5 ring-2 ring-destructive/20 overflow-hidden relative animate-in slide-in-from-top-4 duration-700">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldAlert className="h-32 w-32 text-destructive" />
          </div>
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="bg-destructive text-white p-6 rounded-[2rem] shadow-xl shadow-destructive/20 animate-pulse">
              <Lock className="h-12 w-12" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Badge variant="destructive" className="font-black uppercase tracking-widest text-[10px] px-3 py-1">ALERTE SÉCURITÉ #402</Badge>
              </div>
              <h2 className="text-3xl font-black text-destructive uppercase tracking-tighter leading-none">Virement Suspendu</h2>
              <p className="text-lg font-bold text-destructive/80 leading-tight max-w-xl">
                Votre ordre a été intercepté par <strong>ING SafeGuard</strong> pour un audit de conformité. 
                Veuillez consulter vos emails pour valider l'opération.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* REÇU OFFICIEL (Le Corps du Document) */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="premium-card border-none overflow-hidden relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
            <div className="absolute top-0 left-0 w-full h-3 bg-primary" />
            
            <CardHeader className="bg-gray-50/50 pb-8 border-b border-gray-100 px-10 pt-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 inline-block">
                    <Image src="https://i.imgur.com/WWZ10oQ.png" alt="ING Logo" width={80} height={32} className="opacity-90" />
                  </div>
                  <h3 className="text-3xl font-black text-[#333] tracking-tight">Reçu de Virement</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Private Banking • Document Certifié</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">RÉFÉRENCE UNIQUE</p>
                  <p className="text-sm font-mono font-bold text-[#333] bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">#TRX-{transaction.id.slice(-10).toUpperCase()}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Montant Principal */}
              <div className="p-10 text-center bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 pointer-events-none blur-3xl opacity-50" />
                <div className="relative z-10">
                  <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Montant Net de l'ordre</p>
                  <p className="text-7xl font-black text-[#333] tracking-tighter drop-shadow-sm">€ {transaction.amount.toLocaleString('fr-BE', { minimumFractionDigits: 2 })}</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Badge variant="outline" className="font-bold border-primary/20 text-primary px-4 py-1 rounded-full uppercase text-[10px] tracking-widest bg-primary/5">
                      Virement {transaction.transferType === 'instant' ? 'Instantané' : 'Standard'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-100" />

              {/* Détails Donneur d'Ordre & Bénéficiaire */}
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Donneur d'Ordre */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Donneur d'Ordre</p>
                      <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner space-y-3 group hover:bg-white hover:ring-2 hover:ring-primary/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-white rounded-xl shadow-sm"><User className="h-5 w-5 text-gray-500" /></div>
                          <div className="space-y-0.5">
                            <p className="font-black text-[#333] text-lg leading-none">Bernard Berlin Leroy</p>
                            <p className="text-[10px] font-bold text-muted-foreground">Client Private Gold</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200/50">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Compte à débiter (IBAN)</p>
                          <p className="font-mono font-bold text-sm text-[#333] tracking-wider">BE12 3456 7890 1234</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bénéficiaire */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Bénéficiaire</p>
                      <div className="p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm space-y-3 group hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gray-50 rounded-xl"><Building2 className="h-5 w-5 text-gray-500" /></div>
                          <div className="space-y-0.5">
                            <p className="font-black text-[#333] text-lg leading-none">{transaction.beneficiaryName}</p>
                            <p className="text-[10px] font-bold text-muted-foreground">Destinataire Externe</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200/50">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Compte de crédit (IBAN)</p>
                          <p className="font-mono font-bold text-sm text-[#333] tracking-wider">{transaction.beneficiaryIban}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-100/50" />

                {/* Détails d'exécution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Planification</p>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-xl"><Clock className="h-5 w-5 text-gray-500" /></div>
                      <div>
                        <p className="font-bold text-[#333]">{new Date(transaction.transactionDate).toLocaleDateString('fr-BE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <p className="text-xs text-muted-foreground font-medium">Émis à {new Date(transaction.transactionDate).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Communication</p>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-xl"><FileText className="h-5 w-5 text-gray-500" /></div>
                      <p className="font-bold text-[#333] italic">"{transaction.description || 'Aucune communication fournie'}"</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer de facturation */}
              <div className="bg-gray-900 text-white p-10 rounded-b-[2.5rem]">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="space-y-2 text-center md:text-left">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Ventilation des frais</p>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-white/60 text-xs font-bold">Principal</p>
                        <p className="text-lg font-black">€ {transaction.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs font-bold">Frais {transaction.transferType === 'instant' ? '(Instant)' : '(Standard)'}</p>
                        <p className="text-lg font-black">€ {transaction.fee?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center md:text-right space-y-1">
                    <p className="text-[12px] font-black text-primary uppercase tracking-[0.3em]">Débit Total Effectif</p>
                    <p className="text-5xl font-black tracking-tighter">€ {transaction.totalAmount?.toLocaleString('fr-BE', { minimumFractionDigits: 2 }) || transaction.amount.toLocaleString('fr-BE', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action secondaires */}
          <div className="flex flex-wrap justify-center gap-6">
            <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors group">
              <Printer className="h-4 w-4" /> Imprimer le reçu
            </button>
            <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors group">
              <Share2 className="h-4 w-4" /> Partager via canal sécurisé
            </button>
            <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors group">
              <ExternalLink className="h-4 w-4" /> Contester cette opération
            </button>
          </div>
        </div>

        {/* PANNEAU D'AUDIT SÉCURITÉ */}
        <div className="space-y-8 sticky top-24">
          <Card className="premium-card border-none overflow-hidden ring-1 ring-black/5">
            <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-100/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-green-600" />
                <CardTitle className="text-xl font-bold font-headline">Audit SafeGuard</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-5">
                <div className="flex gap-4 items-start group">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#333]">Origine certifiée</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">L'identité du donneur d'ordre (Bernard Berlin Leroy) a été validée via certificat ING ID.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start group">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#333]">Chiffrement bout-en-bout</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">Les données IBAN ont été transmises via le protocole sécurisé SEPA 2.0.</p>
                  </div>
                </div>
                {isFailed && (
                  <div className="flex gap-4 items-start p-4 bg-destructive/5 rounded-2xl border border-destructive/10 animate-in shake-in duration-500">
                    <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-destructive animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                    <div className="space-y-1">
                      <p className="text-sm font-black text-destructive">Anomalie #402</p>
                      <p className="text-[11px] text-destructive/80 font-bold leading-tight italic">
                        Suspicion d'opération atypique sur compte Private Banking. Suspension préventive pour protection du patrimoine.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-gray-100" />

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-[10px] font-bold text-primary leading-tight">
                  Ce document constitue une preuve de l'ordre émis. L'exécution effective est soumise à la validation de la chambre de compensation.
                </p>
              </div>

              {isFailed && (
                <div className="pt-2">
                  <Button className="w-full bg-[#333] hover:bg-black text-white font-black h-12 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-black/10 transition-all hover:scale-[1.02]">
                    Valider mon identité
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="p-8 rounded-[2rem] bg-gradient-to-br from-[#3b0051] to-[#2a003a] text-white space-y-4 shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all" />
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-black">Besoin d'aide?</h3>
            </div>
            <p className="text-xs font-medium text-white/80 leading-relaxed">
              Votre conseiller Private Banking est disponible 24/7 pour toute question sur vos transferts.
            </p>
            <Button variant="link" className="p-0 text-primary font-black text-sm flex items-center gap-2 group-hover:underline">
              Contacter Sophie de Meyer <ChevronRight className="h-4 w-4" />
            </Button>
          </Card>

          <div className="p-6 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <Image src="https://i.imgur.com/WWZ10oQ.png" alt="ING Logo" width={50} height={20} className="opacity-20 grayscale mb-2" />
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ING Belgium SA/NV © 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}
